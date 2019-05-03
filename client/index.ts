/// <reference path="node_modules/typescript/lib/lib.dom.d.ts" />
/// <reference path="node_modules/monaco-editor/monaco.d.ts" />

/**
 * Monaco editor on Parcel.js bundler:
 * https://github.com/Microsoft/monaco-editor-samples/tree/master/browser-esm-parcel
 */

/**
 * Firepad with Monaco editor:
 * https://github.com/FirebaseExtended/firepad/blob/master/examples/monaco.html
 */

import * as monaco__ from "monaco-editor";
import * as monaco_ from "monaco-editor/esm/vs/editor/editor.main.js";
const monaco = monaco_ as typeof monaco__;

import _dotenv from "dotenv";

import * as firebase from "firebase/app";
import "firebase/database";

import Firepad from "firepad";

import axios from "axios";

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

  window["MonacoEnvironment"] = {
    getWorkerUrl: function(moduleId, label) {
      if (label === "json") {
        return "/lib/json.worker.js";
      }
      if (label === "css") {
        return "/lib/css.worker.js";
      }
      if (label === "html") {
        return "/lib/html.worker.js";
      }
      if (label === "typescript" || label === "javascript") {
        return "/lib/ts.worker.js";
      }
      return "/lib/editor.worker.js";
    }
  };

  const editor = monaco.editor.create(document.getElementById("firepad"), {
    language: getLanguage(filePath)
  });

  axios
    .get(filePath)
    .then(res => {
      const firepadRef = firebase
        .database()
        .ref(`files/${getFirebasePath(filePath)}`);
      const firepad = Firepad.fromMonaco(firepadRef, editor, {
        defaultText: res.data as string
      });
      console.log("firepad", firepad);
    })
    .catch(err => {
      console.error(err);
    });
};

function getLanguage(filePath: string) {
  if (!filePath || filePath.length <= 0) return null;
  switch (filePath.substr(filePath.lastIndexOf(".") + 1).toLowerCase()) {
    case "json":
      return "json";
    case "css":
      return "css";
    case "html":
      return "html";
    case "ts":
    case "tsx":
    case "js":
    case "jsx":
      return "typescript";
  }
  return null;
}

function getFirebasePath(filePath: string) {
  return encodeURIComponent(filePath).replace(/\./g, "%2E");
}
