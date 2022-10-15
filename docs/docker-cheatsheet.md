# Docker Cheat sheet

Here are a few helpful Docker commands to know:

List the commands available in the Docker CLI by entering: `docker`
List information for a specific command with: `docker <COMMAND> --help`
List the docker images on your machine (which is just the hello-world image at this point), with: `docker image ls --all`
List the containers on your machine, with: `docker container ls --all` or `docker ps -a` (without the -a show all flag, only running containers will be displayed)
List system-wide information regarding the Docker installation, including statistics and resources (CPU & memory) available to you in the WSL 2 context, with: `docker info`

[source](https://learn.microsoft.com/en-us/windows/wsl/tutorials/wsl-containers#install-docker-desktop)

`docker build -t pgshard .` - build the image named 'pgshard' from the current directory.
`docker run --name pgshard1 -p 5432:5432 -d pgshard` - spin up the container and name it `pgshard`. map the host machine port 5432 to the container port 5432 and detach the process from the current terminal so that we can keep using it. Use the image named `pgshard` to run the container.

## How to run postgres and access interactive pg shell

1. Run postgres from a docker container

   ```bash
   # docker run pulls postgres image if it doesn't exist.
   $ docker run -e POSTGRES_PASSWORD=postgres --name pg postgres

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
   syncing data to disk ... ok


   Success. You can now start the database server using:

       pg_ctl -D /var/lib/postgresql/data -l logfile start

   initdb: warning: enabling "trust" authentication for local connections
   You can change this by editing pg_hba.conf or using the option -A, or
   --auth-local and --auth-host, the next time you run initdb.
   waiting for server to start....2022-10-15 15:01:49.151 UTC [49] LOG:  starting PostgreSQL 14.5 (Debian 14.5-1.pgdg110+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 10.2.1-6) 10.2.1 20210110, 64-bit
   2022-10-15 15:01:49.155 UTC [49] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
   2022-10-15 15:01:49.166 UTC [50] LOG:  database system was shut down at 2022-10-15 15:01:48 UTC
   2022-10-15 15:01:49.171 UTC [49] LOG:  database system is ready to accept connections
   done
   server started

   /usr/local/bin/docker-entrypoint.sh: ignoring /docker-entrypoint-initdb.d/*

   waiting for server to shut down...2022-10-15 15:01:49.294 UTC [49] LOG:  received fast shutdown request
   .2022-10-15 15:01:49.298 UTC [49] LOG:  aborting any active transactions
   2022-10-15 15:01:49.300 UTC [49] LOG:  background worker "logical replication launcher" (PID 56) exited with exit code 1
   2022-10-15 15:01:49.300 UTC [51] LOG:  shutting down
   2022-10-15 15:01:49.331 UTC [49] LOG:  database system is shut down
   done
   server stopped

   PostgreSQL init process complete; ready for start up.

   2022-10-15 15:01:49.415 UTC [1] LOG:  starting PostgreSQL 14.5 (Debian 14.5-1.pgdg110+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 10.2.1-6) 10.2.1 20210110, 64-bit
   2022-10-15 15:01:49.416 UTC [1] LOG:  listening on IPv4 address "0.0.0.0", port 5432
   2022-10-15 15:01:49.416 UTC [1] LOG:  listening on IPv6 address "::", port 5432
   2022-10-15 15:01:49.424 UTC [1] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
   2022-10-15 15:01:49.432 UTC [61] LOG:  database system was shut down at 2022-10-15 15:01:49 UTC
   2022-10-15 15:01:49.437 UTC [1] LOG:  database system is ready to accept connections
   ```

2. Open a new terminal to shell into the container. Run `psql -U postgres` to access postgres interactive shell.

   ```bash
   $ docker exec -it pg bash
   root@459755495e2b:/# psql -U postgres
   psql (14.5 (Debian 14.5-1.pgdg110+1))
   Type "help" for help.

   postgres=#
   ```

   This could also be done in one line:

   ```bash
   $ docker exec -it pg psql -U postgres
   psql (14.5 (Debian 14.5-1.pgdg110+1))
   Type "help" for help.

   postgres=#
   ```
