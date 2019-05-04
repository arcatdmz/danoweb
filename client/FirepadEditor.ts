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

import * as firebase from "firebase/app";
import "firebase/database";

import Firepad from "firepad";

import { getTextFile } from "./api";

export interface EditorOptions {
  filePath?: string;
}

export class Editor {
  private options: EditorOptions;
  private firepad: any;

  constructor(options: EditorOptions) {
    this.options = options || {};
  }
  async initialize() {
    window["MonacoEnvironment"] = {
      getWorkerUrl: function(_moduleId, label) {
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
      language: Editor.getLanguage(this.options.filePath),
      automaticLayout: true
    });

    const defaultText = await getTextFile(this.options.filePath);
    const firepadRef = firebase
      .database()
      .ref(`files/${Editor.getFirebasePath(this.options.filePath)}`);
    this.firepad = Firepad.fromMonaco(firepadRef, editor, {
      defaultText
    });
  }

  static getLanguage(filePath: string) {
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

  static getFirebasePath(filePath: string) {
    return encodeURIComponent(filePath).replace(/\./g, "%2E");
  }
}
