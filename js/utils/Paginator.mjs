/*
 * Pisko Lab - Personal website
 * Copyright (C) Thaynan Silva
 *
 * SPDX-License-Identifier: LGPL-3.0
 */

/**
 * Controls pagination
 *
 * @template T item type
 */
export class Paginator {

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
