/*
 * Pisko Lab - Personal website
 * Copyright (C) Thaynan Silva
 *
 * SPDX-License-Identifier: LGPL-3.0
 */

import { SVGUtils } from "../utils/SVGUtils.mjs";

/**
 * Request options
 */
const RequestOptions = {

  /**
   * Defines whether the request is urgent or not.
   *
   * @default false
   */
  urgent: false,

  /**
   * Defines wether the SVG should NOT be sanitized.
   *
   * @default false
   */
  unsanitized: false,

  /**
   * Defines the accepted mime type of the requested resource.
   *
   * @default '*\/*'
   */
  mimeType: "*/*"

};

/**
 * @typedef {"text"|"json"|"svg"|"html"|"none"} FetchTypes
 */
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

    let newOptions = Object.assign({}, options, { mimeType });

    let response = await this.getRequest(url, newOptions);
    let data, parser;

    if (!response.ok)
      return null;

    switch (type) {
      case "json":
        data = await response.json();
        break;
      case "text":
        data = await response.text();
        break;
      case "html":
        data = await response.text();
        parser = new DOMParser();
        data = parser.parseFromString(data, mimeType);
        break;
      case "svg":
        data = await response.text();
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
   * @param {RequestOptions} [options=undefined]
   *  request options
   * @returns {boolean}
   *  a boolean indicating wether the resource is valid.
   */
  async probe(url, options=undefined) {
    return (await this.getRequest(url, options)).ok;
  },

  /**
   * Creates a request for a resource.
   *
   * @param {string} url
   *  resource URL
   * @param {RequestOptions} [options=undefined]
   *  request options
   */
  async getRequest(url, options=undefined) {
    let newOptions = Object.assign({}, RequestOptions, options);

    return await fetch(url, {
      priority: newOptions.urgent ? "high" : "auto",
      headers: { Accept: newOptions.mimeType }
    });
  }

};
