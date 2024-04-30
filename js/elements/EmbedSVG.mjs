import { Fetcher } from "../utils/Fetcher.mjs";
import { Text } from "../utils/Text.mjs";

const svgCache = new Map();

async function getSVG(url, urgent=false) {
  let svg = svgCache[url];

  if (!svg) {
    svg = await Fetcher.get(url, "svg", { urgent, sanitize: true });
    svg.rootElement.ariaHidden = true;
    svg.rootElement.style.width = "100%";
    svg.rootElement.style.height = "100%";
    svgCache[url] = svg;
  }

  return document.importNode(svg.rootElement, true);
}

/**
 * Embed SVG element
 */
export class EmbedSVG extends HTMLElement {

  static observedAttributes = ["src", "alt", "isolated"];

  /** @type {ShadowRoot} */
  #shadow;

  #internals;

  constructor() {
    super();

    this.#internals = this.attachInternals();
    this.#internals.role = "img";

    this.#shadow = this.attachShadow({
      mode: "closed",
      delegatesFocus: false
    });
  }

  connectedCallback() {
    this.#update();
  }

  attributeChangedCallback(name, _oldValue, newValue) {
    if (name == "alt") {
      this.#internals.ariaLabel = newValue;
    }

    this.#update();
  }

  #update() {
    if (!this.ownerDocument.defaultView) {
      return;
    }

    getSVG(this.src, this.loading == "eager").then((svg) => {
      if (this.isolated) {
        this.style.backgroundImage = `url('${this.src}')`;
        this.#shadow.replaceChildren();
      } else {
        this.style.removeProperty("background-image");
        this.#shadow.replaceChildren(svg);
      }

      this.dispatchEvent(new Event("load", { cancelable: false }));
    }).catch(() => {
      const text = Text.escape(this.alt) ?? "⨯";
      const style = "margin:auto;-webkit-user-select:none;user-select:none;";
      this.#shadow.innerHTML = `<span style="${style}">${text}</span>`;
      this.dispatchEvent(new Event("error", { cancelable: false }));
    });
  }

  set src(value) {
    this.setAttribute("src", String(value));
  }

  set alt(value) {
    this.setAttribute("alt", String(value));
  }

  set loading(value) {
    if (value == "eager" || value == "lazy") {
      this.setAttribute("loading", value);
    } else {
      this.setAttribute("loading", "eager");
    }
  }

  set isolated(value) {
    this.toggleAttribute("isolated", Boolean(value));
  }

  get src() {
    return this.getAttribute("src");
  }

  get alt() {
    return this.getAttribute("alt");
  }

  get loading() {
    return this.getAttribute("loading") ?? "eager";
  }

  get isolated() {
    return this.hasAttribute("isolated");
  }

  static registerElement() {
    const tagName = "embed-svg";

    if (customElements.get(tagName)) {
      return;
    }

    customElements.define(tagName, EmbedSVG);

    document.head.insertAdjacentHTML("beforeend", (
      `<style>
        ${tagName} {
          display: flex;
          background-size: cover;
        }
      </style>`
    ));
  }
}
