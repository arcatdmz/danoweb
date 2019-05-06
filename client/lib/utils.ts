export function setupFirebase(firebase: any, env: { [key: string]: string }) {
  firebase.initializeApp({
    apiKey: env.API_KEY,
    authDomain: env.AUTH_DOMAIN,
    databaseURL: env.DATABASE_URL,
    projectId: env.PROJECT_ID,
    storageBucket: env.STORAGE_BUCKET,
    messagingSenderId: env.MESSAGING_SENDER_ID,
    appId: env.APP_ID
  });
}

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

export class Modal {
  protected root: HTMLElement;
  protected preStart: (options?: any) => void;
  protected onStart: () => void;
  protected onStop: () => void;
  constructor(root: HTMLElement) {
    this.root = root;
  }

  async start(options?: any) {
    this.preStart && this.preStart(options);

    // set CSS animation
    this.root.classList.add("enabled");
    return new Promise<void>(r => {
      setTimeout(() => {
        this.root.classList.add("active");

        // trigger event hook
        this.onStart && this.onStart();

        r();
      }, 1);
    });
  }

  stop() {
    // set CSS animation
    this.root.classList.remove("active");
    setTimeout(() => {
      this.root.classList.remove("enabled");
    }, 100);

    // trigger event hook
    this.onStop && this.onStop();
  }
}

export class Loader extends Modal {
  private handler;
  private step = 0;

  constructor(root: HTMLElement) {
    super(root);
    this.preStart = (message: string) => {
      if (this.handler) {
        this.stop();
      }

      // set content
      const span = this.root.querySelector(".message") as HTMLSpanElement;
      while (span.childNodes.length > 0) span.removeChild(span.firstChild);
      span.appendChild(document.createTextNode(message));
    };
    this.onStart = () => {
      this.handler = setInterval(this.animate.bind(this), 300);
    };
    this.onStop = () => {
      if (!this.handler) return;
      clearInterval(this.handler);
      this.handler = null;
    };
  }

  animate() {
    const numSteps = 3;
    for (let i = 0; i < numSteps; i++) {
      (this.root.querySelector(
        `.dot-${i + 1}`
      ) as HTMLSpanElement).style.opacity = this.step <= i ? "0.3" : "1";
    }
    this.step = (this.step + 1) % (numSteps + 1);
  }
}
