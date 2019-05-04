# denolop

denolopment environment

## install

1. install `deno`

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
deno --allow-env --allow-net --allow-read server.ts
```

or `yarn`

```sh
cd server/
yarn start
```

## environment variables

before starting the server, put `.env` file in `./client/`

```sh
API_KEY={YOUR_FIREBASE_API_KEY}
AUTH_DOMAIN={YOUR_FIREBASE_AUTH_DOMAIN}
DATABASE_URL={YOUR_FIREBASE_DATABASE_URL}
PROJECT_ID={YOUR_FIREBASE_PROJECT_ID}
STORAGE_BUCKET={YOUR_FIREBASE_STORAGE_BUCKET}
MESSAGING_SENDER_ID={YOUR_MESSAGING_SENDER_ID}
APP_ID={YOUR_APP_ID}
```

---

https://github.com/arcatdmz/denolop
