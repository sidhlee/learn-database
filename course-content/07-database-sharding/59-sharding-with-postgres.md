# Sharding with Postgres

## Run 3 instances of postgres with the same table

We need to build our own docker image to run the script that creates the table when Docker spins up the container.

1. Create [init.sql]('./init.sql') script that creates the table
2. Create [Dockerfile]('./Dockerfile') that runs the above script by copying the script into `/docker-entrypoint-initdb.d` file from the `postgres` image.
3. Build the image from the Dockerfile from which we can spin up the container.

   ```bash
   07-database-sharding git:(main) ✗ docker build -t pgshard .
   [+] Building 0.8s (7/7) FINISHED
   => [internal] load build definition from Dockerfile                         0.1s
   => => transferring dockerfile: 151B                                         0.0s
   => [internal] load .dockerignore                                            0.1s
   => => transferring context: 2B                                              0.0s
   => [internal] load metadata for docker.io/library/postgres:latest           0.0s
   => [1/2] FROM docker.io/library/postgres                                    0.5s
   => [internal] load build context                                            0.1s
   => => transferring context: 194B                                            0.0s
   => [2/2] COPY init.sql /docker-entrypoint-initdb.d                          0.1s
   => exporting to image                                                       0.1s
   => => exporting layers                                                      0.0s
   => => writing image sha256:65e8110232317adc43f4bee0ef1cc6c27b666ed72f82f1f  0.0s
   => => naming to docker.io/library/pgshard
   ```

4. Spin up the container from the built image. detach the process from the current terminal.

   ```bash
   07-database-sharding git:(main) ✗ docker run --name pgshard1 -p 5432:5432 -d -e POSTGRES_PASSWORD=postgres pgshard
   c26c424e6f06de5a1a880b226d0a699d24fe24701d235329a6062c66929c1740
   ```

5. Spin up 2 more containers with the same image. Assign different port for each.

   ```bash
   ➜  07-database-sharding git:(main) ✗ docker run --name pgshard2 -p 5433:5432 -d -e POSTGRES_PASSWORD=postgres pgshard
   eb0057096e7b473321796400322d6c2d4c6e2d00c2b820e4c80cdba75b11892c
   ➜  07-database-sharding git:(main) ✗ docker run --name pgshard3 -p 5434:5432 -d -e POSTGRES_PASSWORD=postgres pgshard
   9e7df4dcab8a199b03b42a5fd3552151beb048c372ef1eb4eead74372c0171f7
   ➜  07-database-sharding git:(main) ✗ docker ps
   CONTAINER ID   IMAGE     COMMAND                  CREATED          STATUS          PORTS                    NAMES
   9e7df4dcab8a   pgshard   "docker-entrypoint.s…"   3 seconds ago    Up 2 seconds    0.0.0.0:5434->5432/tcp   pgshard3
   eb0057096e7b   pgshard   "docker-entrypoint.s…"   17 seconds ago   Up 16 seconds   0.0.0.0:5433->5432/tcp   pgshard2
   ba369980461e   pgshard   "docker-entrypoint.s…"   56 seconds ago   Up 55 seconds   0.0.0.0:5432->5432/tcp   pgshard1
   ```

## Containers not listing after docker run

If `docker ps` does not list the containers you just ran, you can debug the issue by:

1. Remove the running container: `docker rm <container_id>`
2. Run the container without `-d` flag to show logs after running.
3. If there is a error message coming from Dockerfile, you need to remove the current image and build a new one. If the image is still being used by running container you need to either stop the container or remove them first:

   ```bash
   ➜  07-database-sharding git:(main) ✗ docker image ls
   REPOSITORY                  TAG       IMAGE ID       CREATED        SIZE
   pgshard                     latest    65e811023231   24 hours ago   376MB
   docker101tutorial           latest    2d014c11c3e1   6 days ago     28.9MB
   sidhlee/docker101tutorial   latest    2d014c11c3e1   6 days ago     28.9MB
   postgres                    latest    75993dd36176   9 days ago     376MB
   alpine/git                  latest    692618a0d74d   3 weeks ago    43.4MB
   ➜  07-database-sharding git:(main) ✗ docker image rm 65e811023231
   Error response from daemon: conflict: unable to delete 65e811023231 (must be forced) - image is being used by stopped container c4bed558a7d2
   ➜  07-database-sharding git:(main) ✗ docker rm c4bed558a7d2
   c4bed558a7d2
   ➜  07-database-sharding git:(main) ✗ docker image rm 65e811023231
   Error response from daemon: conflict: unable to delete 65e811023231 (must be forced) - image is being used by stopped container 4e310fd617b0
   ➜  07-database-sharding git:(main) ✗
   ➜  07-database-sharding git:(main) ✗ docker rm 4e310fd617b0
   4e310fd617b0
   ➜  07-database-sharding git:(main) ✗ docker image rm 65e811023231
   Untagged: pgshard:latest
   Deleted: sha256:65e8110232317adc43f4bee0ef1cc6c27b666ed72f82f1f0337b6d967c13844e
   ➜  07-database-sharding git:(main) ✗ docker build -t pgshard .
   [+] Building 0.4s (7/7) FINISHED
   => [internal] load build definition from Dockerfile                         0.0s
   => => transferring dockerfile: 37B                                          0.0s
   => [internal] load .dockerignore                                            0.0s
   => => transferring context: 2B                                              0.0s
   => [internal] load metadata for docker.io/library/postgres:latest           0.0s
   => [internal] load build context                                            0.0s
   => => transferring context: 193B                                            0.0s
   => CACHED [1/2] FROM docker.io/library/postgres                             0.0s
   => [2/2] COPY init.sql /docker-entrypoint-initdb.d                          0.1s
   => exporting to image                                                       0.1s
   => => exporting layers                                                      0.1s
   => => writing image sha256:c4c6779d0c13c87dee231626f9c9c4f4e2bb0a6a451176a  0.0s
   => => naming to docker.io/library/pgshard                                   0.0s

   Use 'docker scan' to run Snyk tests against images to find vulnerabilities and learn how to fix them
   ```

## Run pgadmin in docker

Run pgadmin from docker and visit the localhost:5555 in a browser.

```bash
➜  07-database-sharding git:(main) ✗ docker run --name pgadmin -p 5555:80 -e PGADM
IN_DEFAULT_EMAIL=postgres@postgres.com -e PGADMIN_DEFAULT_PASSWORD=postgres -d dpa
ge/pgadmin4
Unable to find image 'dpage/pgadmin4:latest' locally
latest: Pulling from dpage/pgadmin4
213ec9aee27d: Already exists
30f108e17cd0: Pull complete
64ece4b2a33e: Pull complete
422720508e01: Pull complete
152b99866cec: Pull complete
15719ca221da: Pull complete
de2ef0ec68db: Pull complete
77d2b96413a0: Pull complete
a5df391a09bb: Pull complete
e6acb3f68d9e: Pull complete
ecfbc5caf3e6: Pull complete
1a79cfc93fa9: Pull complete
723703f693c4: Pull complete
ffa4893f451b: Pull complete
Digest: sha256:2b3d238866dfcd999abb34b59906c3674895d2678545d19a666c2f11bf182783
Status: Downloaded newer image for dpage/pgadmin4:latest
9909d76ca30281668e460ebe28c4d95da07a61905dd693404ef6fdd6d1906b49
➜  07-database-sharding git:(main) ✗ docker ps
CONTAINER ID   IMAGE            COMMAND                  CREATED          STATUS          PORTS                           NAMES
9909d76ca302   dpage/pgadmin4   "/entrypoint.sh"         12 seconds ago   Up 11 seconds   443/tcp, 0.0.0.0:5555->80/tcp   pdadmin
9e7df4dcab8a   pgshard          "docker-entrypoint.s…"   41 minutes ago   Up 41 minutes   0.0.0.0:5434->5432/tcp          pgshard3
eb0057096e7b   pgshard          "docker-entrypoint.s…"   41 minutes ago   Up 41 minutes   0.0.0.0:5433->5432/tcp          pgshard2
ba369980461e   pgshard          "docker-entrypoint.s…"   42 minutes ago   Up 42 minutes   0.0.0.0:5432->5432/tcp          pgshard1
```

## Connecting to the Postgres running from a container (WSL)

These are the steps required to connect to DB running in WSL docker container from a Windows app (pgAdmin on Chrome):

1. Open PowerShell
2. Get WSL2 IP address with `wsl hostname -I`

   ```powershell
   PS C:\Users\sidhlee> wsl hostname -I
   172.29.146.216
   ```

3. Test the connection to the address with `Test-NetConnection`. 5432 is default port used by Postgres.

   ```powershell
   PS C:\Users\sidhlee> Test-NetConnection -ComputerName 172.29.146.216 -Port 5432


   ComputerName     : 172.29.146.216
   RemoteAddress    : 172.29.146.216
   RemotePort       : 5432
   InterfaceAlias   : vEthernet (WSL)
   SourceAddress    : 172.29.144.1
   TcpTestSucceeded : True
   ```

4. Go to pgAdmin Dashboard > Add New Server. Enter Name of the server (eg. shard3), use the container ip address as the Hostname/address, set the username and password for postgres.
