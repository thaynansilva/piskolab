/*
 * Pisko Lab - Personal website
 * Copyright (C) Thaynan Silva
 *
 * SPDX-License-Identifier: LGPL-3.0
 */

import { Fetcher } from "../utils/Fetcher.mjs";

const MAXIMUM_AGE = 15000; // 15s

/**
 * @template T
 */
class Index {

  /** @type {string} */
  #url;

  /** @type {(data) => T[]} */
  #parse;

  /** @type {T[]?} */
  #store = null;
  #lastRefresh = 0;

  /**
   * @param {string} url
   * @param {(data) => T[]} parse
   *  a comparison function, used to sort data
   */
  constructor (url, parse) {
    this.#url = url;
    this.#parse = parse;
  }

  async get(forceRefresh=false) {
    let now = Date.now();

    if (now - this.#lastRefresh < MAXIMUM_AGE && !forceRefresh) {
      return this.#store;
    }

    this.#store = [];
    this.#lastRefresh = now;

    let data = await Fetcher.get(this.#url, "json");
    this.#store = this.#parse(data);

    return this.#store;
  }

  get url() { return this.#url; }
  get store() { return this.#store; }
}

/**
 * @typedef {{
 *  id: string,
 *  date: Date,
 *  title: string,
 *  description: string
 *  resourcePath: string
 * }} Post
 *
 * @type {Index<Post>}
 */
const postIndex = new Index("meta/posts/index.json", (data) => {
  let items = [];

  for (let post of data.posts) {
    items.push({
      id: post.id,
      date: new Date(post.date ?? 0),
      title: post.title,
      description: post.description,
      resourcePath: `meta/posts/repo/${post.id}.json`
    });
  }

  /* sort posts by recency */
  return items.sort((a, b) => b.date - a.date);
});

/**
 * @typedef {{
 *  uuid: string,
 *  name: string,
 *  logo: string?,
 *  brief: string,
 *  status: string,
 *  url: string,
 *  description?: string[],
 *  details?: {
 *    licenses?: {
 *      identifier: string,
 *      url?: string,
 *    },
 *    docs?: {
 *      title: string,
 *      url: string,
 *    }[],
 *    links?: {
 *      title?: string,
 *      url: string,
 *    }[]
 *  }
 * }} Project
 *
 * @type {Index<Project>}
 */
const projectIndex = new Index("meta/projects/index.json", x => x.projects);

export const Indexer = Object.freeze({

  async getPosts(forceRefresh=false) {
    return await postIndex.get(forceRefresh);
  },

  async getProjects(forceRefresh=false) {
    return await projectIndex.get(forceRefresh);
  },

  async getPostInfo(id) {
    return (await this.getPosts())?.find(p => p.id == id);
  },

  async getProjectInfo(uuid) {
    return (await this.getProjects())?.find(p => p.uuid == uuid);
  }

});
