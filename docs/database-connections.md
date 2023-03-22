# Database connections

## Using the same connection for multiple clients

Using the same database connection for multiple requests in general can cause the following issues:

- Resource contention - multiple requests can fight over the same resource, resulting in issues including performance degradation, blocking, or timeouts.
- Inconsistent state - Databases including Postgres implement concurrency control by assigning own lock set and transaction state for each connection. Sharing the same connection between requests can result in race condition where a query result is affected by the timing of other query being committed.
- Security risk - The query result from one request can be leaked to another request. Also, shared connection makes it difficult to assign specific permission to different clients. In addition, attackers can use SQL injection to affect other requests making queries using the same connection.

## Connection pooling

Connection pooling reduces the overhead of authenticating and establishing a new connection by routing new request into the existing connection available.
