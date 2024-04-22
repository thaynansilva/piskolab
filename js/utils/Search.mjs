/*
 * Pisko Lab - Personal website
 * Copyright (C) Thaynan Silva
 *
 * SPDX-License-Identifier: LGPL-3.0
 */

/**
 * Search parameters as an object
 */
export const Search = Object.freeze((() => {
  let data = window.location.search.substring(1);

  if (data.length == 0) {
    return {};
  }

  let pairs = {};

  for (let p of data.split("&")) {
    let { k, v } = p.match(/(?<k>\w+)(?:=(?<v>.*))?/).groups;

    pairs[k] = v ?? true;
  }

  return pairs;
})());
