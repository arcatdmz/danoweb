FROM node:10
ARG DENO_VERSION=v0.4.0
RUN curl -fsSL https://deno.land/x/install/install.sh | sh -s ${DENO_VERSION}
RUN ln -s /root/.deno/bin/deno /usr/bin/deno

WORKDIR /work
ADD ./server /work/server
ADD ./client /work/client
RUN cd /work/client && yarn install
RUN cd /work/server && yarn build

ENV HOST=0.0.0.0
EXPOSE 8000
CMD cd /work/server && yarn start
