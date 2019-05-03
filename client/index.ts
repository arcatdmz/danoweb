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

window.onload = function() {
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
    language: "javascript",
    defaultText: (await axios.get(location.pathname)).data
  });

  const firepadRef = getExampleRef();
  Firepad.fromMonaco(firepadRef, editor);
};

// Helper to get hash from end of URL or generate a random one.
function getExampleRef() {
  var ref = firebase.database().ref();
  var hash = window.location.hash.replace(/#/g, "");
  if (hash) {
    ref = ref.child(hash);
  } else {
    // generate unique location.
    ref = ref.push();

    // add it as a hash to the URL.
    window.history.pushState(
      null,
      window.document.title,
      window.location + "#" + ref.key
    );
  }
  if (typeof console !== "undefined") {
    console.log("Firebase data: ", ref.toString());
  }
  return ref;
}
