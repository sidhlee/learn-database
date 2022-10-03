# Docker Cheatsheet

Here are a few helpful Docker commands to know:

List the commands available in the Docker CLI by entering: `docker`
List information for a specific command with: `docker <COMMAND> --help`
List the docker images on your machine (which is just the hello-world image at this point), with: `docker image ls --all`
List the containers on your machine, with: `docker container ls --all` or `docker ps -a` (without the -a show all flag, only running containers will be displayed)
List system-wide information regarding the Docker installation, including statistics and resources (CPU & memory) available to you in the WSL 2 context, with: `docker info`

[source](https://learn.microsoft.com/en-us/windows/wsl/tutorials/wsl-containers#install-docker-desktop)

`docker build -t pgshard .` - build the image named 'pgshard' from the current directory.
`docker run --name pgshard1 -p 5432:5432 -d pgshard` - spin up the container and name it `pgshard`. map the host machine port 5432 to the container port 5432 and detach the process from the current terminal so that we can keep using it. Use the image named `pgshard` to run the container.
