# danoweb

**d**istributed **a**uthoring environment built with de**no** for the **web**

## docker build and run

1. git clone
2. see "environment variables" section and put the `.env` file accordingly
3. docker build and run

```sh
docker build . -t danoweb
docker build . --file Dockerfile.local -t danoweb:local
docker run --name danoweb -v ./public:/work/server/public -p 8000:8000 danoweb:local
```

## deploy to Heroku

1. make sure the application runs successfully in your local environment
2. commit `.env` file or use `heroku config:push` command of [heroku-config plugin](https://github.com/xavdid/heroku-config) to save `.env` content as config vars
3. create a project in heroku and `git push`

```sh
heroku create <your app name>
heroku stack:set container
heroku config:push -f ./server/.env
git push heroku master
```

4. see it in action!

## build

1. install `deno` (tested with `v0.3.10`)
2. build client-side code (requires `yarn`) -- this can be skipped since the built files are included in the repo

```sh
cd client/
yarn install
yarn build
```

## start

start the server with `deno` (use `deno run` subcommand for `deno` v0.4.0 and later)

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

- before starting the server, put `.env` file in `./server/` -- all the values except for `USER_PASSWORD` are related to [firebase](https://firebase.google.com/docs/database/) cand can be retrieved from the website

```sh
API_KEY={YOUR_FIREBASE_API_KEY}
AUTH_DOMAIN={YOUR_FIREBASE_AUTH_DOMAIN}
DATABASE_URL={YOUR_FIREBASE_DATABASE_URL}
PROJECT_ID={YOUR_FIREBASE_PROJECT_ID}
STORAGE_BUCKET={YOUR_FIREBASE_STORAGE_BUCKET}
MESSAGING_SENDER_ID={YOUR_MESSAGING_SENDER_ID}
APP_ID={YOUR_APP_ID}
DATABASE_PREFIX={PATH_PREFIX_FOR_YOUR_DATABASE(optional)}
USER_PASSWORD={PASSWORD_FOR_AUTHENTICATION}
```

- optionally provide the following environment variables
- do NOT put this file when the application runs in a Docker container

```sh
USER_DIR=./public
HOST=127.0.0.1
PORT=8000
```

---

https://github.com/arcatdmz/danoweb
