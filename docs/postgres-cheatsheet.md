# Postgres Cheat sheet

## Postgres EXPLAIN cost

[PostgreSQL EXPLAIN – What are the Query Costs?](https://scalegrid.io/blog/postgres-explain-cost/)

```text
postgres=# create table users (
postgres(#   id bigint generated always as identity primary key,
postgres(#   username text not null);
CREATE TABLE
postgres=# INSERT INTO users (username)
postgres-# SELECT 'person' || n
postgres-# FROM generate_series(1, 1000) AS n;
INSERT 0 1000
postgres=# ANALYZE users;
ANALYZE
postgres=# EXPLAIN SELECT * FROM users ORDER BY username;
                           QUERY PLAN
----------------------------------------------------------------
 Sort  (cost=66.83..69.33 rows=1000 width=17)
   Sort Key: username
   ->  Seq Scan on users  (cost=0.00..17.00 rows=1000 width=17)
(3 rows)
```

### Startup cost

From the above query plan, the estimated startup cost for sequential scan is 0.00, and 66.83 for the sort.
The startup cost tells you how long it will take to fetch the first row, and it includes the cost of the child operations.

### Total cost

The numbers after the two dots tells you the estimated units of time it will take to return all the rows. Total cost usually includes the cost of preceding operations except when the `LIMIT` clause is used.

```sql
postgres=# EXPLAIN SELECT * FROM users LIMIT 1;
                           QUERY PLAN
----------------------------------------------------------------
 Limit  (cost=0.00..0.02 rows=1 width=17)
   ->  Seq Scan on users  (cost=0.00..17.00 rows=1000 width=17)
(2 rows)
```

The total cost reported on Seq Scan is still 17.00, but the full cost of the Limit operation is 0.02 (0.017 rounded up). The query planner knows that it only has to process 1 out of 1000 rows, so the total cost is estimated to be 1/1000 of the total cost of Seq Scan.
