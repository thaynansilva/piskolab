/*
 * Pisko Lab - Personal website
 * Copyright (C) Thaynan Silva
 *
 * SPDX-License-Identifier: LGPL-3.0
 */

import { Utils } from "./utils.mjs";

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

    await Utils.get(this.#url, "json")
      .then(j => this.#parse(j, this.#store))
      .catch(e => { throw new Error(e); });

    return this.#store;
  }

  get url() { return this.#url; }
  get store() { return this.#store; }
}

/**
 * @type {Index<{
 *  id: string,
 *  date: Date,
 *  title: string,
 *  description: string
 *  resourceUrl: string
 * }>}
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
        resourceUrl: `meta/posts/repo/${post.id}`
      });
    });

    /* sort posts by recency */
    store.sort((a, b) => b.date - a.date);
  })
);

/**
 * @type {Index<{
 *  uuid: string,
 *  name: string,
 *  logo: string?,
 *  url: string,
 *  status: string,
 *  description: string,
 *  details: [],
 *  resourceUrl: string
 * }>}
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
        details: proj.details ?? [],
        resourceUrl: `meta/projects/repo/${proj.uuid}`
      });
    })
  })
);

export const Provider = {

  async getPosts(forceRefresh=false) {
    return await postsIndex.get(forceRefresh);
  },

  async getProjects(forceRefresh=false) {
    return await projectsIndex.get(forceRefresh);
  },

  async getPostInfo(postId) {
    return (await postsIndex.get())?.find(p => p.id === postId);
  },

  async getProjectInfo(projectUuid) {
    return (await projectsIndex.get())?.find(p => p.uuid == projectUuid);
  }

};
