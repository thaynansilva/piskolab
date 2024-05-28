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

  /** @type {T[]?} */
  #store = null;

  #url;
  #process;

  #lastSync = 0;

  /**
   * Creates a new Index object.
   *
   * @param {string} url
   *  URL to the resource
   * @param {(data: {}) => T[]} process
   *  a function used to process the data
   */
  constructor(url, process) {
    this.#url = url;
    this.#process = process;
  }

  async get(forceSync=false) {
    let now = Date.now();

    if (now - this.#lastSync < MAXIMUM_AGE && !forceSync) {
      return this.#store;
    }

    this.#store = [];
    this.#lastSync = now;

    let data = await Fetcher.get(this.#url, "json");
    this.#store = this.#process(data);

    return this.#store;
  }

  get url() { return this.#url; }
  get store() { return this.#store; }
}


export class Indexer {

  static #posts = new Index("meta/posts/index.json", this.#processPosts);
  static #projects = new Index("meta/projects/index.json", this.#processProjects);

  constructor() {
    throw new TypeError("This class can't be instantiated.");
  }

  static async getPosts(forceRefresh=false) {
    return await this.#posts.get(forceRefresh);
  }

  static async getProjects(forceRefresh=false) {
    return await this.#projects.get(forceRefresh);
  }

  static async getPostInfo(id) {
    return (await this.getPosts())?.find(p => p.id == id);
  }

  static async getProjectInfo(uuid) {
    return (await this.getProjects())?.find(p => p.uuid == uuid);
  }

  static #processPosts(data) {
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
  }

  static #processProjects(data) {
    return data.projects;
  }

}
