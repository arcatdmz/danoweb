# danoweb

**d**istributed **a**uthoring environment built with de**no** for the **web**

## docker build and run

1. see "environment variables" section and put `.env` files accordingly
2. docker build and run

```sh
docker build . -t danoweb
docker build . --file Dockerfile.local -t danoweb:local
docker run --name danoweb -v ./public:/work/server/public -p 8000:8000 danoweb:local
```

## build

1. install `deno` (tested with `v0.3.10`)
2. build client-side code (requires `yarn`)

```sh
cd client/
yarn install
yarn build
```

## start

start the server with `deno`

```sh
cd server/
deno --allow-env --allow-net --allow-read --allow-write server.ts
```

or `yarn`

```sh
cd server/
yarn start
```

## environment variables

- before starting the server, put `.env` file in `./client/` -- these values can be retrieved from the [firebase](https://firebase.google.com/docs/database/) website

```sh
API_KEY={YOUR_FIREBASE_API_KEY}
AUTH_DOMAIN={YOUR_FIREBASE_AUTH_DOMAIN}
DATABASE_URL={YOUR_FIREBASE_DATABASE_URL}
PROJECT_ID={YOUR_FIREBASE_PROJECT_ID}
STORAGE_BUCKET={YOUR_FIREBASE_STORAGE_BUCKET}
MESSAGING_SENDER_ID={YOUR_MESSAGING_SENDER_ID}
APP_ID={YOUR_APP_ID}
DATABASE_PREFIX={PATH_PREFIX_FOR_YOUR_DATABASE(optional)}
```

- optionally put `.env` file in `./server/` -- default values are shown below
- do NOT put this file when the application runs in a Docker container

```sh
USER_DIR=./public
HOST=127.0.0.1
PORT=8000
```

---

https://github.com/arcatdmz/danoweb
