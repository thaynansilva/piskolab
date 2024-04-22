import { Fetcher } from "../utils/Fetcher.mjs";

const SVGStorage = {

  store: {},

  async get(url) {
    let doc = this.store[url];

    if (!doc) {
      doc = await Fetcher.get(url, "svg");
      this.sanitizeDoc(doc);
      this.configureDoc(doc);
      this.store[url] = doc;
    }

    return doc.rootElement.cloneNode(true);
  },

  sanitizeDoc(doc) {
    doc.querySelectorAll("*").forEach(node => {
      if (node.tagName == "script") {
        node.remove();
      } else if (node.tagName == "a") {
        node.attributes.removeNamedItem("href");
      } else {
        for (let attr of node.attributes) {
          if (attr.name.startsWith("on")) {
            node.attributes.removeNamedItem(attr.name);
          }
        }
      }
    });
  },

  configureDoc(doc) {
    doc.rootElement.ariaHidden = true;
    doc.rootElement.style.width = "100%";
    doc.rootElement.style.height = "100%";
  }

};

/**
 * Pisko Lab SVG element
 */
export class EmbedSVGElement extends HTMLElement {

  static observedAttributes = ["src", "alt"];

  /** @type {ShadowRoot?} */
  #shadow = null;

  #internals;

  constructor() {
    super();

    this.#internals = this.attachInternals();
    this.#internals.role = "img";

    this.style.display = "flex";
  }

  #update() {
    SVGStorage.get(this.src).then(svg => {
      this.#shadow.replaceChildren(svg);
      this.dispatchEvent(new Event("load", { cancelable: false }));
    }).catch(reason => {
      this.#shadow.innerHTML = this.alt ?? "<span style='color:#f44;display:flex;margin:auto;'>✖</span>";
      this.dispatchEvent(new Event("error", { cancelable: false }));
    });
  }

  connectedCallback() {
    this.#shadow = this.attachShadow({
      mode: "closed",
      slotAssignment: "named",
      delegatesFocus: false
    });

    this.#update();
  }

  attributeChangedCallback(name, _oldValue, newValue) {
    switch (name) {
      case "alt":
        this.#internals.ariaLabel = newValue;
        break;
      default:
        break;
    }

    this.#update();
  }

  set src(value) {
    this.setAttribute("src", value);
  }

  set alt(value) {
    this.setAttribute("alt", value);
  }

  get src() {
    return this.getAttribute("src");
  }

  get alt() {
    return this.getAttribute("alt");
  }
}

export const EmbedSVG = Object.freeze({

  tagName: "embed-svg",

  initialize() {
    if (!customElements.get(this.tagName)) {
      customElements.define(this.tagName, EmbedSVGElement);
    }
  }

});
