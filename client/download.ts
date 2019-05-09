/// <reference path="node_modules/typescript/lib/lib.dom.d.ts" />

import { download } from "./lib/api";

window.onload = function() {
  // update click handler
  (document.querySelector(
    "#modal .download"
  ) as HTMLAnchorElement).onclick = ev => {
    ev.preventDefault();
    download();
    return false;
  };
};
