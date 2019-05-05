FROM node:10

# define build-time variables for client-side code
ARG API_KEY
ARG AUTH_DOMAIN
ARG DATABASE_URL
ARG PROJECT_ID
ARG STORAGE_BUCKET
ARG MESSAGING_SENDER_ID
ARG APP_ID
ARG DATABASE_PREFIX

# install deno
ARG DENO_VERSION=v0.3.10
RUN curl -fsSL https://deno.land/x/install/install.sh | sh -s ${DENO_VERSION}
RUN ln -s /root/.deno/bin/deno /usr/bin/deno
RUN deno version

# copy and build files
WORKDIR /work
ADD ./server /work/server
ADD ./client /work/client
RUN cd /work/client && yarn install
RUN cd /work/server && yarn build

# start the server
ENV HOST=0.0.0.0
CMD cd /work/server && yarn start
