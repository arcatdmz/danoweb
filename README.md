# danoweb

**d**istributed **a**uthoring environment built with de**no** for the **web**

## how to use

demo site: https://danoweb.site/

1. anyone can (collaboratively) edit any served text files by appending `?mode=edit` query parameter -- どのページも URL 末尾に `?mode=edit` をつけると編集できます
2. those who know the authentication token (`USER_PASSWORD`) can save the edits to update the served files (ask [me](https://twitter.com/arcatdmz) if interested) -- 編集結果をファイルに書き戻すには `USER_PASSWORD` が必要です

### concept

- what you see is what you can (collaboratively) edit
  - like a [WebDAV](https://wikipedia.org/wiki/WebDAV) server but with a code editor that appears with `?mode=edit` query parameter
  - like a [Wiki](http://wiki.c2.com/?WikiWikiWeb) site but with focus on serving raw files
- built with Deno for Deno
  - [Deno](https://deno.land/) allows to load TypeScript files on the web
  - many put files on GitHub and load them through [denopkg.com](https://github.com/denopkg/denopkg.com)
  - dano focuses on a more direct and casual way of sharing/editing code
  - e.g., `deno https://danoweb.site/index.ts` -- the code can be edited at https://danoweb.site/index.ts?mode=edit

### backend

1. for collaborative editing, [Firebase Realtime Database](https://firebase.google.com/docs/database/) is used
2. for serving files and saving the edits, native file system is used

### plans

- see [GitHub issues](https://github.com/arcatdmz/danoweb/issues?q=is%3Aissue+is%3Aopen+label%3Aenhancement) for short-term goals
- Wiki-like links in the editor (currently, the code editor renders the code as-is, but there is much space for [PX](http://sigpx.org) improvements)
- better collaborative editing experience (e.g., asking the user to login using GitHub etc. to show collaborators)
- TypeScript auto completion for all the Deno code on the web!

## deploy

### A. deploy to Heroku

1. git clone
2. see "environment variables" section and put the `.env` file accordingly
3. create a Heroku project
4. run [`heroku config:push`](https://github.com/xavdid/heroku-config) to save `.env` content as config vars
5. `git push` to make the project public

```sh
git clone https://github.com/arcatdmz/danoweb.git
cd danoweb
vi ./server/.env
heroku create <your app name>
heroku stack:set container
heroku config:push -f ./server/.env
git push heroku master
```

### B. docker build and run

1. git clone
2. see "environment variables" section and put the `.env` file accordingly
3. docker build and run

```sh
git clone https://github.com/arcatdmz/danoweb.git
cd danoweb
vi ./server/.env
docker build . -t danoweb
docker build . --file Dockerfile.local -t danoweb:local
docker run --name danoweb -v ./public:/work/server/public -p 8000:8000 danoweb:local
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
- do NOT define these variables when the application runs in a Docker container (especially Heroku that provides a unique `PORT` for every deploy)

```sh
USER_DIR=./public
HOST=127.0.0.1
PORT=8000
```

## develop

### build

1. install `deno` (tested with `v0.37.1`)
2. build client-side code (requires `yarn`) -- this can be skipped since the built files are included in the repo

```sh
cd client/
yarn install
yarn build
```

### start

start the server with `deno run` (use `deno` without `run` for `deno` below v0.4.0)

```sh
cd server/
deno run --allow-env --allow-net --allow-read --allow-write server.ts
```

or `yarn`

```sh
cd server/
yarn start
```

---

https://github.com/arcatdmz/danoweb
