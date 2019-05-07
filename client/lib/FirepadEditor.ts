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

/**
 * Rewritten Monaco Adapter
 * https://github.com/FirebaseExtended/firepad/pull/325
 * with a slight modification
 * https://github.com/arcatdmz/firepad/commit/7152e606dd466a65c359a8b0fcc56c0037cc696b
 */

import * as monaco__ from "monaco-editor";
import * as monaco_ from "monaco-editor/esm/vs/editor/editor.main.js";
const monaco = monaco_ as typeof monaco__;

import * as firebase from "firebase/app";
import "firebase/database";

import Firepad from "../firepad/firepad.js";

import { getTextFile, putTextFile } from "./api";
import { setupFirebase, setupMonaco, getMonacoLanguage } from "./utils";

export interface EditorOptions {
  filePath?: string;
  env?: { [key: string]: string };
}

export class Editor {
  private options: EditorOptions;
  private editor: monaco.editor.IStandaloneCodeEditor;
  private firepad: any;

  constructor(options: EditorOptions) {
    this.options = options || {};
  }
  async initialize() {
    setupFirebase(firebase, this.options.env);
    setupMonaco();
    this.editor = monaco.editor.create(document.getElementById("firepad"), {
      language: getMonacoLanguage(this.options.filePath),
      automaticLayout: true
    }) as any;
    this.editor.getModel().setEOL(monaco.editor.EndOfLineSequence.LF);

    const firepadRef = firebase
      .database()
      .ref(`files/${this.getFirebasePath(this.options.filePath)}`);
    let defaultText = await getTextFile(this.options.filePath);
    if (defaultText) defaultText = defaultText.replace(/(?:\r\n|\r|\n)/g, "\n");
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

  getFirebasePath(filePath: string) {
    return (
      ((this.options.env && this.options.env.DATABASE_PREFIX) || "") +
      encodeURIComponent(filePath).replace(/\./g, "%2E")
    );
  }
}
