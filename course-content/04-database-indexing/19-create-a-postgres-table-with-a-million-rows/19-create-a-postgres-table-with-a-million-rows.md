# 19. Create a postgres table with a million rows

## Spin up a docker container with a postgres instance

```bash
$ docker run -e POSTGRES_PASSWORD=postgres --name pg1 postgres

Unable to find image 'postgres:latest' locally
latest: Pulling from library/postgres
31b3f1ad4ce1: Pull complete
dc97844d0cd5: Pull complete
9ad9b1166fde: Pull complete
286c4682b24d: Pull complete
1d3679a4a1a1: Pull complete
5f2e6cdc8503: Pull complete
0f7dc70f54e8: Pull complete
a090c7442692: Pull complete
81bfe40fd0f6: Pull complete
8ac8c22bbb38: Pull complete
96e51d1d3c6e: Pull complete
667bd4154fa2: Pull complete
87267fb600a9: Pull complete
Digest: sha256:b0ee049a2e347f5ec8c64ad225c7edbc88510a9e34450f23c4079a489ce16268
Status: Downloaded newer image for postgres:latest
The files belonging to this database system will be owned by user "postgres".
This user must also own the server process.

The database cluster will be initialized with locale "en_US.utf8".
The default database encoding has accordingly been set to "UTF8".
The default text search configuration will be set to "english".

Data page checksums are disabled.

fixing permissions on existing directory /var/lib/postgresql/data ... ok
creating subdirectories ... ok
selecting dynamic shared memory implementation ... posix
selecting default max_connections ... 100
selecting default shared_buffers ... 128MB
selecting default time zone ... Etc/UTC
creating configuration files ... ok
running bootstrap script ... ok
performing post-bootstrap initialization ... ok
syncing data to disk ... initdb: warning: enabling "trust" authentication for local connections
You can change this by editing pg_hba.conf or using the option -A, or
--auth-local and --auth-host, the next time you run initdb.
ok


Success. You can now start the database server using:

    pg_ctl -D /var/lib/postgresql/data -l logfile start

waiting for server to start....2022-09-17 13:45:53.791 UTC [48] LOG:  starting PostgreSQL 14.5 (Debian 14.5-1.pgdg110+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 10.2.1-6) 10.2.1 20210110, 64-bit
2022-09-17 13:45:53.796 UTC [48] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
2022-09-17 13:45:53.808 UTC [49] LOG:  database system was shut down at 2022-09-17 13:45:53 UTC
2022-09-17 13:45:53.815 UTC [48] LOG:  database system is ready to accept connections
 done
server started

/usr/local/bin/docker-entrypoint.sh: ignoring /docker-entrypoint-initdb.d/*

2022-09-17 13:45:53.914 UTC [48] LOG:  received fast shutdown request
waiting for server to shut down....2022-09-17 13:45:53.918 UTC [48] LOG:  aborting any active transactions
2022-09-17 13:45:53.920 UTC [48] LOG:  background worker "logical replication launcher" (PID 55) exited with exit code 1
2022-09-17 13:45:53.920 UTC [50] LOG:  shutting down
2022-09-17 13:45:53.952 UTC [48] LOG:  database system is shut down
 done
server stopped

PostgreSQL init process complete; ready for start up.

2022-09-17 13:45:54.038 UTC [1] LOG:  starting PostgreSQL 14.5 (Debian 14.5-1.pgdg110+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 10.2.1-6) 10.2.1 20210110, 64-bit
2022-09-17 13:45:54.038 UTC [1] LOG:  listening on IPv4 address "0.0.0.0", port 5432
2022-09-17 13:45:54.038 UTC [1] LOG:  listening on IPv6 address "::", port 5432
2022-09-17 13:45:54.048 UTC [1] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
2022-09-17 13:45:54.058 UTC [60] LOG:  database system was shut down at 2022-09-17 13:45:53 UTC
2022-09-17 13:45:54.066 UTC [1] LOG:  database system is ready to accept connections
```

If docker can't find the image named `postgres`, it will pull the image from the remote repo.

We don't need to expose the port because we're going to shell into the container by the following command:

```bash
➜  fundamentals-of-database-engineering git:(main) ✗ docker exec -it pg1 psql -U postgres
psql (14.5 (Debian 14.5-1.pgdg110+1))
Type "help" for help.

postgres=#
```

First create a table `temp` with a integer column `t`. This table will collect data from IoT devices.

```sql
postgres=# create table temp(t int);
CREATE TABLE
postgres=#
```

Then, generate a random integer between(0, 1000000] to insert into the table:

```sql
postgres=# insert into temp(t) select random() * 100 from generate_series(0, 1000000);
INSERT 0 1000001
postgres=#
```

Check the table:

```sql
postgres=# select t from temp limit 5;
 t
----
 93
 91
  7
 71
 86
(5 rows)

postgres=# select count(*) from temp;
  count
---------
 1000001
(1 row)
```
