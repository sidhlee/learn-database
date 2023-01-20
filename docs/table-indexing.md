# Indexing database table

## Non-key index

Q&A with ChatGPT (edited)

- When should I NOT use non-key index?
  > You should not use non-key indexes in a database when the indexed column is frequently updated, as this can cause index fragmentation and slow down query performance. Additionally, if the table is small and/or the queries on the table are simple, using a non-key index may not provide significant performance benefits and can add unnecessary overhead to the database.
- What is index fragmentation and how frequently updating indexed column causes it?
  > Index fragmentation occurs when the data in a table is modified and the corresponding index becomes scattered (in the heap), with the data pages no longer in physical order. This can happen when the indexed column is frequently updated, as the database engine needs to update the index to reflect the changes in the data. When an indexed column is updated, the database engine may need to move the indexed value to a different location on the page or to a different page altogether. This can lead to fragmentation of the index, causing the database engine to spend more time searching for the relevant data (jumping around different addresses of the hard disk).
  > Another cause of fragmentation is when rows are deleted from the table, causing gaps in the index. This can cause the database engine to perform more I/O operations to read the index, slowing down query performance.
  > To minimize fragmentation, it is best to avoid frequently updating indexed columns or to regularly rebuild or reorganize the indexes on a table.

  