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
