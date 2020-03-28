FROM debian:jessie-slim
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates curl

# install deno
ARG DENO_VERSION=v0.37.1
RUN curl -fsSL https://deno.land/x/install/install.sh | sh -s ${DENO_VERSION}
ENV PATH="/root/.deno/bin:$PATH"
RUN deno version

# copy files
WORKDIR /work
ADD ./server /work/server

# start the server
ENV HOST=0.0.0.0
CMD cd /work/server && deno run --allow-env --allow-net --allow-read --allow-write ./server.ts
