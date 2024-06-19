/*
 * Pisko Lab - Personal website
 * Copyright (C) Thaynan Silva
 *
 * SPDX-License-Identifier: LGPL-3.0
 */


export class TabInfo {

  #id;
  #parentId;
  #isDynamic;

  /**
   * Creates a tab window.
   *
   * @param {string} id
   *  tab id
   * @param {string?} parentId
   *  parent tab id
   * @param {boolean} isDynamic
   *  determines whether a tab should always be
   *  rebuilt upon activation.
   */
  constructor(id, parentId, isDynamic) {
    this.#id = id;
    this.#parentId = parentId;
    this.#isDynamic = isDynamic;
  }

  /**
   * Builds the UI.
   *
   * @param {{}} options
   * @returns {Promise<DocumentFragment>}
   */
  async buildUI(options={}) {
    console.warn(`[TabInfo] id: ${this.id}, options: ${JSON.stringify(options)}`);
  }

  get id() {
    return this.#id;
  }

  get parentId() {
    return this.#parentId;
  }

  get isDynamic() {
    return this.#isDynamic;
  }

  get isRootTab() {
    return !this.parentId;
  }

}
