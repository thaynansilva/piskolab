import { Fetcher } from "../utils/Fetcher.mjs";

/**
 * @type {Map<string, XMLDocument>}
 */
const svgCache = new Map();

/**
 * Fetches an SVG document.
 *
 * @param {string} url
 *  url to the svg file
 * @param {boolean} urgent
 *  defines if the request should be prioritized.
 */
async function getSVG(url, urgent=false) {
  if (!url) {
    return;
  }

  if (!(svgCache.has(url) && svgCache.get(url))) {
    let svgDoc = await Fetcher.get(url, "svg", { urgent});
    let svg = document.importNode(svgDoc.documentElement, true);
    svg.ariaHidden = true;
    svg.style.width = "100%";
    svg.style.height = "100%";
    svgCache.set(url, svg);
  }

  return svgCache.get(url).cloneNode(true);
}


export class EmbedSVG extends HTMLElement {

  static observedAttributes = ["src", "alt", "isolated"];

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

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue == newValue) {
      return;
    }

    if (name == "alt") {
      this.#internals.ariaLabel = newValue;
    }

    this.#update();
  }

  #update() {
    if (!this.isConnected) {
      return;
    }

    const isUrgent = (this.loading == "eager");

    const embedContent = ((content) => {
      this.#shadow.replaceChildren(content);
      this.dispatchEvent(new Event("load", { cancelable: false }));
    });

    const isolatedContent = ((good) => {
      if (!good) {
        throw new Error(`Resource not found: ${this.src}`);
      }

      let content = document.createElement("img");
      content.src = this.src;
      content.ariaHidden = true;
      content.draggable = false;

      this.#shadow.replaceChildren(content);
      this.dispatchEvent(new Event("load", { cancelable: false }));
    });

    const errorContent = ((error) => {
      console.debug(`[EmbedSVG] ${error}`);

      let content = document.createElement("span");
      content.innerText = this.alt ?? "⨯";
      content.style.margin = "auto";
      content.style.userSelect = "none";

      this.#shadow.replaceChildren(content);
      this.dispatchEvent(new Event("error", { cancelable: false }));
    });

    if (!this.isolated) {
      getSVG(this.src, isUrgent)
        .then(embedContent)
        .catch(errorContent);
    } else {
      Fetcher.probe(this.src, isUrgent)
        .then(isolatedContent)
        .catch(errorContent);
    }
  }

  set src(value) {
    this.setAttribute("src", String(value));
  }

  set alt(value) {
    this.setAttribute("alt", String(value));
  }

  set loading(value) {
    if (["eager", "lazy"].includes(value)) {
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

  static {
    const tagName = "embed-svg";

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
