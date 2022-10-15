# Database Partitioning

## Create a table with 10 million rows

```sql
postgres=# create table grades (id serial not null, g int not null);
CREATE TABLE

postgres=# insert into grades(g) select floor(random() * 100) from generate_series(0, 10000000);
INSERT 0 10000001
```

## Create an index

```sql
postgres=# create index grades_index on grades(g);
CREATE INDEX

postgres-# \d grades;
                            Table "public.grades"
 Column |  Type   | Collation | Nullable |              Default
--------+---------+-----------+----------+------------------------------------
 id     | integer |           | not null | nextval('grades_id_seq'::regclass)
 g      | integer |           | not null |
Indexes:
    "grades_index" btree (g)
```

## Analyze queries

```sql
postgres=# select count(*) from grades where g = 30;
 count
-------
 99724
(1 row)

postgres=# explain analyze select count(*) from grades where g = 30;
                                                                QUERY PLAN

-----------------------------------------------------------------------------------------------
--------------------------------------------
 Aggregate  (cost=2241.78..2241.79 rows=1 width=8) (actual time=13.742..13.745 rows=1 loops=1)
   ->  Index Only Scan using grades_index on grades  (cost=0.43..2002.61 rows=95667 width=0) (a
ctual time=0.022..8.765 rows=99724 loops=1)
         Index Cond: (g = 30)
         Heap Fetches: 0
 Planning Time: 0.154 ms
 Execution Time: 13.845 ms
(6 rows)

postgres=# explain analyze select count(*) from grades where g between 30 and 35;
                                                                             QUERY PLAN

-----------------------------------------------------------------------------------------------
---------------------------------------------------------------------
 Finalize Aggregate  (cost=12104.02..12104.03 rows=1 width=8) (actual time=50.905..53.177 rows=
1 loops=1)
   ->  Gather  (cost=12103.81..12104.02 rows=2 width=8) (actual time=50.765..53.170 rows=3 loop
s=1)
         Workers Planned: 2
         Workers Launched: 2
         ->  Partial Aggregate  (cost=11103.81..11103.82 rows=1 width=8) (actual time=23.093..2
3.094 rows=1 loops=3)
               ->  Parallel Index Only Scan using grades_index on grades  (cost=0.43..10481.93
rows=248750 width=0) (actual time=0.038..14.604 rows=200218 loops=3)
                     Index Cond: ((g >= 30) AND (g <= 35))
                     Heap Fetches: 0
 Planning Time: 0.447 ms
 Execution Time: 53.485 ms
(10 rows)
```
