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
