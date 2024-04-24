/*
 * Pisko Lab - Personal website
 * Copyright (C) Thaynan Silva
 *
 * SPDX-License-Identifier: LGPL-3.0
 */

import { Fetcher } from "../utils/Fetcher.mjs";

const MAXIMUM_AGE = 15000; // 15s

/**
 * @template {{}} T
 */
class Index {

  /** @type {string} */
  #url;

  /** @type {(data: {}, store: T[]) => void} */
  #parse;

  /** @type {T[]?} */
  #store = null;
  #lastRefresh = 0;

  /**
   * @param {string} url
   * @param {(data: {}, store: T[]) => void} parse
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

    await Fetcher.get(this.#url, "json")
      .then(j => this.#parse(j, this.#store))
      .catch(e => { throw new Error(e); });

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
const postsIndex = new Index(
  "meta/posts/index.json",
  ((data, store) => {
    data.posts.forEach((post) => {
      store.push({
        id: post.id ?? "the-void",
        date: new Date(post.date ?? 0),
        title: post.title ?? "N/A",
        description: post.description ?? "N/A",
        resourcePath: `meta/posts/repo/${post.id}.json`
      });
    });

    /* sort posts by recency */
    store.sort((a, b) => b.date - a.date);
  })
);

/**
 * @typedef {{
 *  uuid: string,
 *  name: string,
 *  logo: string?,
 *  url: string,
 *  status: string,
 *  description: string,
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
 *    }[],
 *    notes?: string[],
 *  }
 * }} Project
 *
 * @type {Index<Project>}
 */
const projectsIndex = new Index(
  "meta/projects/index.json",
  ((data, store) => {
    data.projects.forEach((proj) => {
      store.push({
        uuid: proj.uuid,
        name: proj.name,
        logo: proj.logo ?? null,
        url: proj.url,
        status: proj.status,
        description: proj.description,
        details: proj.details ?? []
      });
    })
  })
);

export const Indexer = Object.freeze({

  async getPosts(forceRefresh=false) {
    return await postsIndex.get(forceRefresh);
  },

  async getProjects(forceRefresh=false) {
    return await projectsIndex.get(forceRefresh);
  },

  async getPostInfo(id) {
    return (await this.getPosts())?.find(p => p.id == id);
  },

  async getProjectInfo(uuid) {
    return (await this.getProjects())?.find(p => p.uuid == uuid);
  }

});
