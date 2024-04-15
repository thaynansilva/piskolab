/*
 * Pisko Lab - Personal website
 * Copyright (C) Thaynan Silva
 *
 * SPDX-License-Identifier: LGPL-3.0
 */

/**
 * Search parameters parsed as object.
 */
export const Search = (() => {
  const search = window.location.search.substring(1);

  if (search.length === 0) {
    return {};
  }

  let pairs = {};

  for (let p of search.split("&")) {
    let { k, v } = p.match(/(?<k>\w+)(?:=(?<v>.*))?/).groups;

    pairs[k] = v ?? true;
  }

  return pairs;
})();

export const Utils = {

  /**
   * Sleeps for the specified time.
   *
   * @param {number} timeout
   *  sleep time in milliseconds
   * @returns {Promise<void>}
   */
  async sleep(timeout) {
    return new Promise((r, _) => setTimeout(r, timeout));
  },

  /**
   * Fetches a resource.
   *
   * @typedef {{
   *  "text": string,
   *  "json": {},
   *  "xml": XMLDocument,
   *  "svg": Document
   * }} AcceptedTypes
   *
   * @param {string} url
   *  resource URL
   * @param {keyof AcceptedTypes} type
   *  response type
   * @param {RequestInit?} options
   *  request options
   * @returns {Promise<AcceptedTypes[type]?>}
   *  The resource data according to `type`
   *  or `null` if the response was not ok.
   */
  async get(url, type="text", options) {
    const mimeTypes = {
      "json": "application/json",
      "text": "text/plain",
      "html": "text/html",
      "xml": "text/xml",
      "svg": "image/svg+xml",
    };

    const mimeType = mimeTypes[type];

    if (!url) {
      throw new Error("An URL is required.");
    }

    if (!mimeType) {
      throw new Error(`Invalid type: '${type}'.`);
    }

    let request = await fetch(url, {
      priority: "high"
    });
    let response = null;

    if (!request.ok)
      return null;

    switch (type) {
      case "json":
        response = await request.json();
        break;
      case "text":
        response = await request.text();
        break;
      case "xml":
      case "svg":
      case "html":
        response = await request.text();
        response = Utils.parseDOM(response, mimeType);
      default:
        break;
    }

    return response;
  },

  /**
   * Parses XML and XML-like data into a
   * Document.
   *
   * @param {string} data
   *  the data
   * @param {DOMParserSupportedType} type
   *  the document type
   */
  parseDOM(data, type) {
    let parser = new DOMParser();
    return parser.parseFromString(data, type);
  }

}

export const ContentManager = {

  /**
   * Replaces the content of an element.
   *
   * @template {HTMLElement|DocumentFragment|string} K
   *  content type
   * @param {HTMLElement} element
   *  target element
   * @param {K} content
   *  the new content
   */
  replace(element, content) {
    if (content instanceof HTMLElement ||
      content instanceof DocumentFragment) {
      element.replaceChildren(content);
    } else {
      element.innerHTML = content;
    }
  },

  /**
   * Replaces the content of an element.
   *
   * @template {HTMLElement|DocumentFragment|string} K
   *  content type
   *
   * @param {HTMLElement} element
   *  target element
   * @param {() => Promise<K>} resolve
   *  an async function that returns the new content.
   * @param {?(reason: string) => Promise<K>} reject
   *  an async function that returns a fallback content.
   */
  present(element, resolve, reject=null) {
    (async () => {
      element.classList.remove("dynamic-content");
      element.ariaBusy = true;

      this.replace(element, "<span class='spinner'></span>");
      await Utils.sleep(50);

      let data = null;

      try {
        data = await resolve();
      } catch (reason) {
        data = await reject?.(reason);
        console.error(reason);
      }

      this.replace(element, data);

      element.classList.add("dynamic-content");
      element.ariaBusy = false;
    })();
  }
}

export const NumberFormatter = {

  /**
   * Pads a given value with zeros.
   *
   * @param {number} value
   *  the number to be padded
   * @param {number} length
   *  the length of the result
   */
  pad(value, length=0) {
    if (!Number.isInteger(value)) {
      throw new Error("Value must be an integer.");
    }

    let result = value.toString();

    for (let i = 0; i < (length - result.length); i++) {
      result = "0" + result;
    }

    return result;
  },

};

export const DateFormatter = {

  /**
   * Formats the date as `YYYY-MM-DD`.
   *
   * @param {Date} date
   * @returns {string} the formatted date.
   */
  shortDate(date) {
    let { pad } = NumberFormatter;
    let y = pad(date.getUTCFullYear(), 4);
    let m = pad(date.getUTCMonth() + 1, 2);
    let d = pad(date.getUTCDate(), 2);
    return `${y}-${m}-${d}`;
  },

  /**
   * Formats a date as `YYYY-MM-DD HH:MM UTC`
   *
   * @param {Date} date
   * @returns {string} the formatted date.
   */
  longDate(date) {
    let { pad } = NumberFormatter;
    let h = pad(date.getUTCHours(), 2);
    let m = pad(date.getUTCMinutes(), 2);
    return `${this.shortDate(date)} ${h}:${m} UTC`;
  }

}

/**
 * Controls pagination
 *
 * @template T
 */
export class PaginatorController {

  /** @type {T[]} */
  items;

  /** @type {number} */
  itemsPerPage;

  #pageIndex = 1;

  /**
   * Called when the page is changed.
   *
   * @type {(pageIndex: number, totalPages: number, items: T[]) => void}
   */
  onpagechange;

  /**
   *
   *
   * @param {T[]} items
   * @param {number} itemsPerPage
   * @param {} onpagechange
   */
  constructor(items, itemsPerPage, onpagechange=null) {
    this.items = items;
    this.itemsPerPage = itemsPerPage;
    this.onpagechange = onpagechange;
  }

  next() {
    if (this.#pageIndex >= this.totalPages) {
      return;
    }

    this.#pageIndex += 1;
    this.onpagechange?.(this.#pageIndex, this.totalPages, this.items);
  }

  previous() {
    if (this.#pageIndex <= 1) {
      return;
    }

    this.#pageIndex -= 1;
    this.onpagechange?.(this.#pageIndex, this.totalPages, this.items);
  }

  get items() {
    let start = (this.#pageIndex - 1) * this.itemsPerPage;
    let end = Math.min(start + this.itemsPerPage, this.items.length);

    return this.items.slice(start, end);
  }

  get pageIndex() {
    return this.#pageIndex;
  }

  get totalPages() {
    return Math.ceil(this.items.length / this.itemsPerPage);
  }

}

export const TextUtils = {

  /**
   * Replaces HTML syntatic symbols by their
   * respective HTML entities.
   *
   * @param {string} text
   *  unsanitized text
   */
  sanitize(text) {
    const unsafe = {
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    if (text === null || text === undefined) {
      return "";
    }

    if (typeof (text) !== "string") {
      return text;
    }

    let result = text;

    for (let [k, v] of Object.entries(unsafe)) {
      if (result.indexOf(k) !== -1) {
        result = result.replaceAll(k, v);
      }
    }

    return result;
  },

  /**
   * Replaces HTML syntatic symbols by their
   * respective HTML entities on multiple strings.
   *
   * @param {string[]} lines
   *  the strings
   */
  sanitizeLines(lines) {
    if (!(lines instanceof Array))
      throw new Error(`lines must be string[], not ${typeof(lines)}`);
    return lines?.map(x => this.sanitize(x));
  }

}
