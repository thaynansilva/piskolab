/*
 * Pisko Lab - Personal website
 * Copyright (C) Thaynan Silva
 *
 * SPDX-License-Identifier: LGPL-3.0
 */

/**
 * Formats text
 */
export const Text = {

  /**
   * Replaces HTML syntatic symbols by their
   * respective HTML entities.
   *
   * @param {string} text
   *  unsanitized text
   */
  escape(text) {
    const unsafe = {
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    if (!text || typeof(text) != "string") {
      return;
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
  escapeLines(lines) {
    if (!(lines instanceof Array))
      throw new Error(`lines must be string[], not ${typeof(lines)}`);

    return lines?.map(x => this.escape(x));
  }

};
