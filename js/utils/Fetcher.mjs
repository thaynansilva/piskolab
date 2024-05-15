/*
 * Pisko Lab - Personal website
 * Copyright (C) Thaynan Silva
 *
 * SPDX-License-Identifier: LGPL-3.0
 */

import { SVGUtils } from "../utils/SVGUtils.mjs";

/**
 * @enum {"text"|"json"|"svg"|"html"|"none"}
 */
const FetchTypes = "none";

/**
 * Request options
 *
 * @param {boolean?} urgent
 * defines whether the request is urgent or not.
 *
 * @param {boolean?} unsanitized
 * defines whether the SVG should NOT be sanitized.
 *
 * @typedef {{ urgent?: boolean, unsanitized?: boolean }}
 */
const RequestOptions = {};

export const Fetcher = {

  /**
   * Fetches a resource.
   *
   * @param {string} url
   *  resource URL
   * @param {FetchTypes} [type="text"]
   *  response type
   * @param {RequestOptions} [options=undefined]
   *  request options
   * @returns {Promise<(object | string | Document | XMLDocument)>}
   *  The resource data according to `type`
   *  or `null` if the response was not ok.
   */
  async get(url, type="text", options=undefined) {
    const mimeType = {
      "json": "application/json",
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

    let request = await this.getRequest(url, options?.urgent, mimeType);
    let data = null;
    let parser = null;

    if (!request.ok)
      return null;

    switch (type) {
      case "json":
        data = await request.json();
        break;
      case "text":
        data = await request.text();
        break;
      case "html":
        data = await request.text();
        parser = new DOMParser();
        data = parser.parseFromString(data, mimeType);
        break;
      case "svg":
        data = await request.text();
        parser = new DOMParser();
        data = parser.parseFromString(data, mimeType);
        if (!options?.unsanitized) {
          SVGUtils.sanitize(data);
        }
        break;
      default:
        break;
    }

    return data;
  },

  /**
   * Tests if a URL is valid, that being, if it
   * points to a resource that exists.
   *
   * @param {string} url
   *  resource URL
   * @param {boolean} urgent
   *  defines the request urgency.
   * @returns
   *  a boolean indicating wether the URL is valid.
   */
  async probe(url, urgent=false) {
    return (await this.getRequest(url, urgent)).ok;
  },

  /**
   * Creates a request for a resource.
   *
   * @param {string} url
   *  resource URL
   */
  async getRequest(url, urgent=false, mimeType=undefined) {
    return await fetch(url, {
      priority: urgent ? "high" : "auto",
      headers: { Accept: mimeType ?? "*/*" }
    });
  }

};
