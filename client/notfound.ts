/// <reference path="node_modules/typescript/lib/lib.dom.d.ts" />

window.onload = function() {
  // update link href
  (document.querySelector("#modal .create") as HTMLAnchorElement).setAttribute(
    "href",
    `${location.pathname}?mode=edit`
  );
};
