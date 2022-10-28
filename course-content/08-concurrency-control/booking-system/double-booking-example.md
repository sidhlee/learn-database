# Preventing race condition in booking systems

## Steps to reproduce

1. User A clicks on the seat and enters his name.
2. Server finds the seat and it's empty
3. User B clicks on the same seat and enters her name.
4. Server finds the seat and it's still empty
5. Server writes to DB with User A's request and send 200
6. Server updates the same seat with User B's request and send 200
7. User A sees 200 success, but the seat is booked by User B

## Solution 1: Acquire row share lock

Add `FOR UPDATE` statement when selecting the requested seat with unbooked status.
This will block select from other transactions until the lock is released after the commit.

With shared lock:

1. User A clicks on the seat and enters his name.
2. Server acquires row share lock on the table and finds the seat and it's empty
3. User B clicks on the same seat and enters her name.
4. Server finds the seat and it's still empty but wait for the transaction that acquired the lock (optimistic concurrency control)
5. Server writes to DB with User A's request and send 200
6. Server returns Error to User B immediately after User A's query is committed.
7. User A sees 200 success. User B sees 400

## Solution 2: UPDATE with WHERE (db dependant)

Depending on the database (eg. Postgres) and isolation level, the database will refresh the pending query to read the latest committed result.

```sql
-- Transaction 1 begins and updates goes through. acquires the lock.
postgres=# begin;
BEGIN
postgres=*# update seats set is_booked = True, name = 'Hayoun' where id = 42 and is_booked = False;
UPDATE 1
-- Transaction begins and updates waits on the row lock
postgres=# begin;
BEGIN
postgres=*# update seats set is_booked = True, name = 'John' where id = 42 and is_booked = False;
-- Transaction 1 is committed and the lock is released
postgres=*# commit;
COMMIT
-- As soon as transaction 1 is committed, updates in the transaction 2 fails
UPDATE 0
```

This only works because Postgres implicitly acquires exclusive lock on updates and blocks other reads until the update is committed. When the exclusive lock is released, the second transaction will see the committed result because the isolation level is read-committed. This makes the query to update 0 rows since it cannot find the row that has the given id and not booked.
