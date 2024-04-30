/*
 * Pisko Lab - Personal website
 * Copyright (C) Thaynan Silva
 *
 * SPDX-License-Identifier: LGPL-3.0
 */

import { Fetcher } from "./Fetcher.mjs";

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
   * @returns {Promise<DocumentFragment>}
   *  the constructed UI.
   */
  async build() {
    return await this.buildAndSetup(null);
  }

  /**
   * Builds the UI from the template.
   *
   * @param {(root: HTMLElement) => void} setup
   *  a function to set up the UI
   * @returns {Promise<DocumentFragment>}
   *  the constructed UI.
   */
  async buildAndSetup(setup) {
    await this.#loadTemplate();

    let root = this.queryRoot();

    if (!root) {
      root = document.createElement("div");
      console.warn("Template has no root node. Using <div> as fallback.");
    }

    setup?.(root);

    return root;
  }

  query(selectors) {
    if (!this.#doc) {
      throw new Error("You need to build the UI before querying elements.");
    }

    /** @type {HTMLTemplateElement} */
    let target = this.#doc.querySelector(selectors);

    if (!target) {
      throw new Error(`No such template for selectors: '${selectors}'`);
    }

    let templateChildrenCount = target.content.children.length;
    if (templateChildrenCount == 0) {
      throw new Error(`Template '${selectors}' has no children.`);
    } else if (templateChildrenCount > 1) {
      console.warn(
        `Template '${selectors}' has ${templateChildrenCount} children.`,
        "This is discouraged since only the first child can be selected."
      );
    }

    return document.importNode(target.content, true);
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
  async #loadTemplate() {
    if (this.#doc) {
      return;
    }

    this.#doc = await Fetcher.get(this.#url, "html");
  }

}
