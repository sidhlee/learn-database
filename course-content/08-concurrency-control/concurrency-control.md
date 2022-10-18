# Concurrency Control

## Exclusive vs shared lock

For consistency and security reason, we set **exclusive(write) lock** on the value we're updating and no one can **read** during update.
When we're reading a value, we have a **shared(read) lock** on the value so that no one can **update** the row.

- There can be only one exclusive lock on a value at a given time. eg. while the painter draws on the board, no one is allowed to see the painting.

- There can be multiple shared locks on a value at a given time. eg. While multiple people are looking at the painting, it cannot be edited. The painter has to wait until all the people are gone (no shared locks), then cover the painting to paint over it. (exclusive lock)

- Exclusive lock cannot be set on a value that is included in a shared lock, and vice versa.

### Example: Bank transaction

Starting state: Alice($1000), Bob($600), Charlie ($1200)

1. Alice starts transaction $200 deposit. Obtains exclusive lock (SUCCESS): Alice($1200), Bob($600), Charlie ($1200)

2. Alice starts a reporting job on her account (long running query). Obtains a shared lock (SUCCESS)

3. While Alice's reporting job is running, Bob also starts a reporting job on his account. Obtains a shared lock (SUCCESS)

4. While Alice and Bob's reporting jobs are running, Charlie tries a transfer to Bob's account. FAILS to obtain an exclusive lock. Exits the query.

5. While Alice's job is still running, Bob's job finishes. Charlie re-tries the transfer to Bob's account. Obtains an exclusive lock (SUCCESS)

```text
# Query diagram
1.    2.     3.          4.             5.
|---->|------------------------------------------>|
             |--------------------->|
                         |-->X|        |--->|
```

## Dead locks

Create a new table `test` with only `id` column as a primary key:

```sql
postgres=# create table test(id serial primary key);
CREATE TABLE
postgres=# \d test
                            Table "public.test
"
 Column |  Type   | Collation | Nullable |
         Default
--------+---------+-----------+----------+----
------------------------------
 id     | integer |           | not null | nex
tval('test_id_seq'::regclass)
Indexes:
    "test_pkey" PRIMARY KEY, btree (id)
```

Shell into the psql in two terminal windows side by side:

````bash
```bash
   $ docker exec -it pg psql -U postgres
   psql (14.5 (Debian 14.5-1.pgdg110+1))
   Type "help" for help.

   postgres=#
````

Begin transaction in both terminal:

```bash
postgres=# begin transaction;
BEGIN
```

Insert a row with a value 1 on the right terminal:

```sql
postgres=*# insert into test values(1);
INSERT 0 1
```

Insert a row with a value 2 on the left terminal:

```sql
postgres=*# insert into test values(2);
INSERT 0 1
```

When you insert another row with a value 1 on the left terminal, Postgres waits to see if the other transaction commits because it's also inserting the same value (optimistic concurrency control - don't acquire hard locks and wait until the other conflicting transactions are committed):

```sql
postgres=*# insert into test values(1);

```

Now come back to the right terminal and insert the value 2. Postgres detects a deadlock and fails the transaction.

```sql
postgres=*# insert into test values(2);
ERROR:  deadlock detected
DETAIL:  Process 298 waits for ShareLock on transaction 749; blocked by process 78.
Process 78 waits for ShareLock on transaction 748; blocked by process 298.
HINT:  See server log for query details.
CONTEXT:  while inserting index tuple (0,4) in relation "test_pkey"
postgres=!#
```

After the transaction in the right terminal fails, insert on the left terminal goes through immediately (this will also fail if another transaction inserts the same value and commits before this):

```sql
INSERT 0 1
```

When ending the transaction in the right terminal, Postgres rolls back the operations in memory:

```sql
postgres=!# end transaction;
ROLLBACK
```

The transaction in the left terminal commits successfully when ending transaction:

```sql
postgres=*# end transaction;
COMMIT
```

## Two phase locking

Phase locking is where the database acquire locks and release them in phases eg. Lock phase - release phase.

### Double booking example

If lock is not properly acquired, multiple customers can book the same seat at the movie theater.

First prepare the table:

```sql
-- Create seats table
postgres=# create table seats(
postgres(# id serial primary key,
postgres(# is_booked boolean not null,
postgres(# name varchar(50)
postgres(# );
CREATE TABLE
postgres=# \d seats
                                     Table "public.seats"
  Column   |         Type          | Collation | Nullable |
          Default
-----------+-----------------------+-----------+----------+----
-------------------------------
 id        | integer               |           | not null | nex
tval('seats_id_seq'::regclass)
 is_booked | boolean               |           | not null |
 name      | character varying(50) |           |          |
Indexes:
    "seats_pkey" PRIMARY KEY, btree (id)

-- Set is_booked default value (false)
postgres=# alter table seats
alter column is_booked
set default false;
ALTER TABLE

-- Populate 50 seats
postgres=# insert into seats
postgres-# select i
postgres-# from generate_series(1, 50) as i;
INSERT 0 50
```

#### Scenario 1: double booked

```sql
-- 1. Begin transaction in both term A and B and check row 13
postgres=# begin transaction;
BEGIN
postgres=*# select * from seats where id = 13;
 id | is_booked | name
----+-----------+------
 13 | f         |
(1 row)

-- 2. Book the seat from term B for Hayoun
postgres=*# update seats set is_booked = true, name = 'Hayoun' where id = 13;
UPDATE 1

-- 3. Book the same seat from term A for Tom. Postgres holds the updates
postgres=*# update seats set is_booked = true, name = 'Tom' where id = 13;

-- 4. Commit from term B. Term A updates the Row immediately after. Hayoun has the seat
postgres=*# commit;
COMMIT
postgres=# select * from seats where id = 13;
 id | is_booked |  name
----+-----------+--------
 13 | t         | Hayoun
(1 row)

-- 5. Now commit from term A. commit goes through and the seat owner is overwritten with Tom.
postgres=*# commit;
COMMIT

-- 6. Check the row again from term B. Owner changed to Tom
postgres=# select * from seats where id = 13;
 id | is_booked | name
----+-----------+------
 13 | t         | Tom
(1 row)
```

We need phase locking to prevent this.

```sql
-- 1. Begin transactions in both terminals
postgres=# begin transaction;
BEGIN

-- 2. Set an exclusive lock on the row 14 from term B
postgres=*# select * from seats where id = 14 for update;
 id | is_booked | name
----+-----------+------
 14 | f         |
(1 row)

-- 3. When term A tries to acquire an exclusive lock for row 14, postgres holds the operation.
postgres=*# select * from seats where id=14 for update;

-- 4. Book the seat from term B for Hayoun
postgres=*# update seats set is_booked = True, name = 'Hayoun' where id = 14;
UPDATE 1

-- 5. When termB commits, the exclusive lock on the row 14 is RELEASED. Term A is now acquires the exclusive lock and sees the changes made from term B. Now you can use a logic to prevent double booking.

postgres=*# select * from seats where id=14 for update;
 id | is_booked |  name
----+-----------+--------
 14 | t         | Hayoun
(1 row)
```
