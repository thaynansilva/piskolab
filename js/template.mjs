/*
 * Pisko Lab - Personal website
 * Copyright (C) Thaynan Silva
 *
 * SPDX-License-Identifier: LGPL-3.0
 */

import { Utils } from "./utils.mjs";

export class Template {

  /** @type {Document?} */
  #doc = null;

  /** @type {string} */
  #url;

  constructor(url) {
    this.#url = url;
  }

  /**
   * Builds the UI from the template.
   *
   * @param {(self: Template, root: HTMLElement) => void} construct
   *  a function that constructs the UI
   * @returns {Promise<DocumentFragment>}
   *  the constructed UI.
   */
  async build(construct) {
    await this.#load();

    let frag = document.createDocumentFragment();
    let root = this.queryRoot();

    if (!root) {
      root = document.createElement("div");
      console.warn("Template has no root node. Using <div> as fallback.");
    }

    construct(this, root);
    frag.appendChild(root);

    return frag;
  }

  query(selectors) {
    if (!this.#doc) {
      throw new Error("You need to build the UI before querying elements.");
    }

    /** @type {HTMLTemplateElement} */
    let template = this.#doc.querySelector(selectors);

    if (!template) {
      throw new Error(`No such template for selectors: '${selectors}'`);
    }

    let templateChildrenCount = template.content.children.length;
    if (templateChildrenCount == 0) {
      throw new Error(`Template '${selectors}' has no children.`);
    } else if (templateChildrenCount > 1) {
      console.warn(
        `Template '${selectors}' has ${templateChildrenCount} children.`,
        "This is discouraged since only the first child can be selected."
      );
    }

    return template.content.firstElementChild.cloneNode(true);
  }

  queryById(id) {
    return this.query(`template#${id}`);
  }

  queryByName(name) {
    return this.query(`template[data-name="${name}"]`);
  }

  queryRoot() {
    return this.queryById("root");
  }

  /**
   * Loads the template document.
   */
  async #load() {
    if (this.#doc) {
      return;
    }

    this.#doc = await Utils.get(this.#url, "html");
  }

  get document() {
    return this.#doc;
  }

}
