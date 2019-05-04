/// <reference path="node_modules/typescript/lib/lib.dom.d.ts" />

import _dotenv from "dotenv";

import * as firebase from "firebase/app";
import "firebase/database";

import { Editor } from "./editor";

firebase.initializeApp({
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  databaseURL: process.env.DATABASE_URL,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID
});

window.onload = async function() {
  const filePath = location.pathname;
  document.title = `${filePath} | denolop`;

  const editor = new Editor({ filePath });
  try {
    await editor.initialize();
    console.log("editor initialized successfully");
  } catch (e) {
    console.error("editor failed to initialize", e);
  }
};
