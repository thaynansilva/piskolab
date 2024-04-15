import { Utils } from "./utils.mjs";

const SVGManager = {
  store: {},

  async get(url) {
    let cache = this.store[url];
    let data = cache?.data;

    if (!cache || !this.isFresh(cache)) {
      data = this.sanitizeSVG(await Utils.get(url, "svg"));
      this.store[url] = { data, createdOn: Date.now() };
    }

    return data.cloneNode(true);
  },

  /** @param {XMLDocument} svgDoc */
  sanitizeSVG(svgDoc) {
    svgDoc.querySelectorAll("*").forEach(node => {
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

    return svgDoc;
  },

  isFresh(cache) {
    if (!cache) {
      return;
    }

    const MAX_AGE = 24*60*60*1000; // 24 hours

    return (Date.now() - cache.createdOn) < MAX_AGE;
  },

};

/**
 * Pisko Lab SVG element
 */
export class PLSVGElement extends HTMLElement {

  static observedAttributes = ["src", "alt"];

  /** @type {ShadowRoot?} */
  #shadow = null;

  constructor() {
    super();

    this.role = "img";
    this.style.display = "flex";
  }

  #update() {
    SVGManager.get(this.src).then(svgDoc => {
      this.#shadow.replaceChildren(...svgDoc.childNodes);

      /** @type {SVGAElement} */
      let svg = this.#shadow.firstElementChild;
      svg.style.width = "100%";
      svg.style.height = "100%";
    }).catch((reason) => {
      console.debug(`Failed to load SVG: ${reason}`);
      this.#shadow.innerHTML = this.alt ?? "[error]";
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

  attributeChangedCallback(_name, _oldValue, _newValue) {
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

export const PLSVG = Object.freeze({

  tagName: "pl-svg",

  setup() {
    if (!customElements.get(this.tagName)) {
      customElements.define(this.tagName, PLSVGElement);
    }
  }

});
