# Indexing database table

## Clustered Index

If you set a clustered index around a specific column or a combination of columns, the rows in the table is physically sorted (clustered) by that column value.
eg. A phone book where people's contacts are ordered by the person's last name.

- Because the table rows have to be always in order, there can be only 1 clustered index per table.
- Changing clustered index can be very expensive and cause significant downtime while reordering table rows to match the new index.
- Clustered index is available on MySQL, but not on Postgres.
- A table with a clustered index would have slower mutation (i.e. insert, update, and delete) to keep the physical rows in order, but the query would be faster as a result.

It makes sense for the identity service to use MySQL because there are far more read queries for user/business profile than write queries after the user signup.

### MySQL

In MySQL, a table is clustered (ordered) around the unique primary key, and therefore, and primary index would be the table itself.
MySQL stores rows in B+Tree with the search key being PK and the value being the column tuple.

```txt
1:("David", "Kim", 24)
2:("John", "Park", 37)
3:("Jenny", "Lee", 17)
...
```

When you add secondary index, the value would be the primary key:

```txt
"Kim": 1
"Kim": 9214
...
"Lee": 3
"Lee": 82
...
"Park": 37
```

## Non-clustered Index

A non-clustered index contains tuples

### B-tree vs B+ tree

Both B-tree and B+ tree organize keys (column values) in a balance tree where keys can be searched with logarithmic time.
The main difference between b-tree and b+tree is how they keep the value (pointer to the actual row in a disk) of the keys (column value).

- A b-tree keeps key-value pairs in every node without duplicated keys.
- A b+tree only keeps values in the leaf nodes where all the search keys (column values) are present as a linked list. This is very efficient for ranged queries. (ie. no extra traversal needed for querying neighboring keys)
- Because b+tree keeps all keys at the leaf level, some keys are duplicated in the internal nodes.
- Postgres uses the b-tree by default.
  - But there are some articles and youtube videos describing Postgres index as b+ tree.
  - Leaf nodes have search key (column value) - tuple(row) id pair
- B+tree makes sense when

## Non-key index

Q&A with ChatGPT (edited)

- When should I NOT use non-key index?
  > You should not use non-key indexes in a database when the indexed column is frequently updated, as this can cause **index fragmentation** and slow down query performance. Additionally, if the table is small and/or the queries on the table are simple, using a non-key index may not provide significant performance benefits and can add unnecessary overhead to the database.
- What is index fragmentation and how frequently updating indexed column causes it?
  > **Index fragmentation** occurs when the data in a table is modified and the corresponding index becomes scattered (sequential indexes will point to non-sequential addresses in the heap), with the data pages no longer in physical order. This can happen when the indexed column is frequently updated, as the database engine needs to update the index to reflect the changes in the data. *When an indexed column is updated*, the database engine may need to move the indexed value to a different location on the page or to a different page altogether. This can lead to fragmentation of the index, causing the database engine to spend more time searching for the relevant data (jumping around different addresses of the hard disk).
  > Another cause of fragmentation is when rows are deleted from the table, causing gaps in the index. This can cause the database engine to perform more I/O operations to read the index, slowing down query performance.
  > To minimize fragmentation, it is best to avoid frequently updating indexed columns or to regularly rebuild or reorganize the indexes on a table.
