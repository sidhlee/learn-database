# Database Sharding

## Pros of sharding

- Scalability
- Security (shard by access level)
- Optimal and smaller index size

## Cons of sharding

- complexity
  - client has to be aware of the shard
- DBMS not supporting:
  - transactions across shards
  - rollbacks across shards
- Schema changes need to be applied to all shards
- Joins across multiple shards?
- Need to know shard key when querying (if not, query becomes very expensive)

## When to consider sharding

After you tried all of the following:

1. query too slow -> caching

2. index too large, query too slow -> Horizontal partitioning - each partition has a range of rows and a unique partition key. Client is not aware of the partition.

3. request queuing -> Replication - write to the master and read from replicas.

4. too much writes -> multi-region database - write to the one closer to the client and sync
