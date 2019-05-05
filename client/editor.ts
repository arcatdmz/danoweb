/// <reference path="node_modules/typescript/lib/lib.dom.d.ts" />

import _dotenv from "dotenv";

import * as firebase from "firebase/app";
import "firebase/database";

import { getTextFile } from "./lib/api";
import { Editor } from "./lib/FirepadEditor";
import { DiffEditor } from "./lib/DiffEditor";

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
  // set window title
  const filePath = location.pathname;
  document.title = `${filePath} | denolop`;

  // show the editor
  const editor = new Editor({ filePath });
  try {
    await editor.initialize();
    console.log("editor initialized successfully");
  } catch (e) {
    console.error("editor failed to initialize", e);
  }

  // prepare the diff editor
  const diffEditor = new DiffEditor();

  // set event handlers
  (document.querySelector(
    "#firepad-controls .save"
  ) as HTMLButtonElement).onclick = async _ev => {
    diffEditor.update({
      a: await getTextFile(filePath),
      b: editor.getText()
    });
    diffEditor.show();
  };

  (document.querySelector(
    "#diff-controls .save"
  ) as HTMLButtonElement).onclick = async _ev => {
    editor.save();
    diffEditor.hide();
  };

  (document.querySelector(
    "#diff-controls .cancel"
  ) as HTMLButtonElement).onclick = async _ev => {
    diffEditor.hide();
  };
};
