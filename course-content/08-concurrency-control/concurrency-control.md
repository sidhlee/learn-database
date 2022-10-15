# Concurrency Control

## Exclusive vs shared lock

For consistency and security reason, we set **exclusive(write) lock** on the value we're updating and no one can **read** during update.
When we're reading a value, we have a **shared(read) lock** on the value so that no one can **update** the row.

- There can be only one exclusive lock on a value at a given time. eg. while the painter draws on the board, no one is allowed to see the painting.

- There can be multiple shared locks on a value at a given time. eg. While multiple people are looking at the painting, it cannot be edited. The painter has to wait until no one's seeing it, then cover the painting to paint over it. (exclusive lock)

- Exclusive lock cannot be set on a value that is included in a shared lock, and vice versa.

## Example: Bank transaction

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
