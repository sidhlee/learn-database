# How discord stores trillions of messages

[Article](https://discord.com/blog/how-discord-stores-trillions-of-messages?utm_source=tldrnewsletter)

## Summary (ChatGPT)

The article "How Discord Stores Trillions of Messages" explains how Discord, a popular messaging and communication platform, stores and manages the vast amount of messages generated by its users.

Discord uses a custom-built distributed database system, which allows for horizontal scalability and high availability. The system is designed to handle large amounts of data and high write throughput, while ensuring consistency and reliability.

The database is based on Apache Cassandra, a highly scalable and distributed NoSQL database. Discord's system is optimized for write-heavy workloads, and uses a technique called "compaction" to manage data storage and optimize read performance.

To ensure high availability and fault tolerance, Discord uses a multi-region database architecture, with data replicated across multiple regions and data centers. In addition, Discord uses a combination of data replication, load balancing, and automated failover to ensure that the system remains available and responsive to users.

Overall, Discord's messaging system is designed to handle trillions of messages and support millions of concurrent users, while ensuring fast and reliable performance.

## Notes

### Data service layer

Discord added data service layer between API and database clusters (ScyllaDB) to mitigate hot partition issue by request coalescing. If multiple users are requesting the same row at the same time, the first request spins up a worker task in the service. Following requests checks if the task exists and subscribe to it. The worker task will make the query once and return the result to all subscribers. Also, API is using channel id as the routing key to route requests for the same channel to the same instance of the service.

- This approach is effective when a large number of clients makes requests to the same resource (eg. a message, an announcement, etc..).

- Hot partition: large volume of request concentrated on a particular node causing latency across the entire cluster.
