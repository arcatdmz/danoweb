/// <reference path="../node_modules/typescript/lib/lib.dom.d.ts" />
/// <reference path="../node_modules/monaco-editor/monaco.d.ts" />

import * as monaco__ from "monaco-editor";
import * as monaco_ from "monaco-editor/esm/vs/editor/editor.main.js";
import { setupMonaco } from "./utils";
const monaco = monaco_ as typeof monaco__;

export interface DiffEditorOptions {
  a: string;
  b: string;
}

export class DiffEditor {
  private options: DiffEditorOptions;
  private editor: monaco.editor.IStandaloneDiffEditor;

  constructor(options?: DiffEditorOptions) {
    this.options = options || { a: "", b: "" };
  }

  /**
   * show this editor
   */
  show() {
    // dispose the existing diff editor
    if (this.editor) {
      this.hide();
    }

    // show the diff editor
    const wrapper = document.getElementById("diff");
    wrapper.style.display = "block";
    const controls = document.getElementById("diff-controls");
    controls.style.display = "block";

    // initialize the diff editor
    setupMonaco();
    this.editor = monaco.editor.createDiffEditor(wrapper, {
      automaticLayout: true
    });

    // fill the content
    if (this.options) {
      this.update(this.options);
    }
  }

  /**
   * update the editor view
   * @param options editor text (original and modified)
   */
  update(options: DiffEditorOptions) {
    if (!this.editor) {
      this.options = options;
      return;
    }
    const { a, b } = options;
    const original = monaco.editor.createModel(a, "text/plain");
    const modified = monaco.editor.createModel(b, "text/plain");
    this.editor.setModel({ original, modified });
  }

  /**
   * dispose this editor
   */
  hide() {
    const wrapper = document.getElementById("diff");
    wrapper.style.display = "none";
    const controls = document.getElementById("diff-controls");
    controls.style.display = "none";
    this.editor.dispose();
    this.editor = null;
  }
}
