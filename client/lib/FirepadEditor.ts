/// <reference path="../node_modules/typescript/lib/lib.dom.d.ts" />
/// <reference path="../node_modules/monaco-editor/monaco.d.ts" />

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

import { getTextFile, putTextFile } from "./api";
import { setupMonaco, getMonacoLanguage } from "./utils";

export interface EditorOptions {
  filePath?: string;
}

export class Editor {
  private options: EditorOptions;
  private editor: monaco.editor.IStandaloneCodeEditor;
  private firepad: any;

  constructor(options: EditorOptions) {
    this.options = options || {};
  }
  async initialize() {
    setupMonaco();
    this.editor = monaco.editor.create(document.getElementById("firepad"), {
      language: getMonacoLanguage(this.options.filePath),
      automaticLayout: true
    });

    const defaultText = await getTextFile(this.options.filePath);
    const firepadRef = firebase
      .database()
      .ref(`files/${Editor.getFirebasePath(this.options.filePath)}`);
    this.firepad = Firepad.fromMonaco(firepadRef, this.editor, {
      defaultText
    });
  }

  async save() {
    return putTextFile(this.options.filePath, {
      content: this.firepad.getText()
    });
  }

  getText() {
    // return this.editor.getValue();
    return this.firepad.getText() as string;
  }

  static getFirebasePath(filePath: string) {
    return encodeURIComponent(filePath).replace(/\./g, "%2E");
  }
}
