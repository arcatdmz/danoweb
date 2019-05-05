export function setupMonaco() {
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
}

export function getMonacoLanguage(filePath: string) {
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
