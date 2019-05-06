/// <reference path="node_modules/typescript/lib/lib.dom.d.ts" />

import { getEnv, getTextFile, isAuthenticated, authenticate } from "./lib/api";
import { Modal, Loader } from "./lib/utils";
import { Editor } from "./lib/FirepadEditor";
import { DiffEditor } from "./lib/DiffEditor";

window.onload = async function() {
  // set window title
  const filePath = location.pathname;
  document.title = `${filePath} | danoweb`;

  // show the editor
  const env = await getEnv();
  const editor = new Editor({ filePath, env });
  try {
    await editor.initialize();
    console.log("editor initialized successfully");
  } catch (e) {
    console.error("editor failed to initialize", e);
  }

  // prepare the diff editor
  const diffEditor = new DiffEditor();

  // prepare the loader
  const loader = new Loader(document.querySelector("#overlay"));
  loader.stop();

  // prepare the authentication modal
  const authRoot = document.querySelector("#authenticate") as HTMLElement;
  const modal = new Modal(authRoot);
  const authForm = authRoot.querySelector("form");
  authForm.onsubmit = ev => {
    ev.preventDefault();
    const token = (authForm.querySelector(
      "input#authenticate-token"
    ) as HTMLInputElement).value;
    authenticate(token).then(isAuthenticated => {
      if (isAuthenticated) {
        modal.stop();
      }
      console.log("authenticated", isAuthenticated);
    });
  };

  // set event handlers
  (document.querySelector(
    "#firepad-controls .save"
  ) as HTMLButtonElement).onclick = async _ev => {
    await loader.start("loading");
    diffEditor.update({
      a: await getTextFile(filePath),
      b: editor.getText()
    });
    diffEditor.show();
    loader.stop();
  };

  (document.querySelector(
    "#diff-controls .save"
  ) as HTMLButtonElement).onclick = async _ev => {
    await loader.start("saving");
    if (await isAuthenticated()) {
      await editor.save();
      diffEditor.hide();
      loader.stop();
      return;
    }

    // show the authentication form
    loader.stop();
    return modal.start();
  };

  (document.querySelector(
    "#diff-controls .cancel"
  ) as HTMLButtonElement).onclick = async _ev => {
    diffEditor.hide();
  };
};
