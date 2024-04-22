/*
 * Pisko Lab - Personal website
 * Copyright (C) Thaynan Silva
 *
 * SPDX-License-Identifier: LGPL-3.0
 */

/**
 * @enum {"text"|"json"|"svg"|"html"|"none"}
 */
const FetchTypes = "none";

export const Fetcher = {

  /**
   * Fetches a resource.
   *
   * @param {string} url
   *  resource URL
   * @param {FetchTypes} type
   *  response type
   * @param {RequestInit?} options
   *  request options
   * @returns {Promise<(object | string | Document | XMLDocument)>}
   *  The resource data according to `type`
   *  or `null` if the response was not ok.
   */
  async get(url, type="text", urgent=false) {
    const mimeType = {
      "json": "text/json",
      "text": "text/plain",
      "html": "text/html",
      "svg": "image/svg+xml"
    }[type];

    if (!url) {
      throw new Error("An URL is required.");
    }

    if (!mimeType) {
      throw new Error(`Invalid type: '${type}'.`);
    }

    let request = await this.getRequest(url, urgent);
    let data = null;

    if (!request.ok)
      return null;

    switch (type) {
      case "json":
        data = await request.json();
        break;
      case "text":
        data = await request.text();
        break;
      case "svg":
      case "html":
        data = await request.text();
        let parser = new DOMParser();
        data = parser.parseFromString(data, mimeType);
      default:
        break;
    }

    return data;
  },

  /**
   * Creates a request for a resource.
   *
   * @param {string} url
   *  resource URL
   * @returns {Promise<RMap[type]>}
   *  The resource data according to `type`
   *  or `null` if the response was not ok.
   */
  async getRequest(url, urgent=false) {
    return await fetch(url, {
      priority: urgent ? "high" : "auto",
    });
  },

  /**
   *
   * @param {*} urls
   */
  async preload(urls) {
    return await Promise.allSettled(
      urls.map(async r => await this.getRequest(r))
    );
  }

};
