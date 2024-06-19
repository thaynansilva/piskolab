/*
 * Pisko Lab - Personal website
 * Copyright (C) Thaynan Silva
 *
 * SPDX-License-Identifier: LGPL-3.0
 */

import { HomeTab } from "./tabs/Home.mjs";
import { NewsTab } from "./tabs/News.mjs";
import { ProjectsTab } from "./tabs/Projects.mjs";
import { AboutTab } from "./tabs/About.mjs";
import { ArticleReaderTab } from "./tabs/ArticleReader.mjs";
import { ProjectViewerTab } from "./tabs/ProjectViewer.mjs";


export class TabRegistry {

  static #store = [
    new HomeTab(),
    new NewsTab(),
    new ProjectsTab(),
    new AboutTab(),
    new ArticleReaderTab(),
    new ProjectViewerTab(),
  ];

  static async build(id, options) {
    return await this.getTab(id).buildUI(options);
  }

  static getTab(id) {
    return this.#store.find((v) => v.id == id);
  }

  static getParentId(id) {
    return this.getTab(id)?.parentId ?? null;
  }

  static isValid(id) {
    return !!this.getTab(id);
  }

  static isRootTab(id) {
    return this.getTab(id).isRootTab ?? false;
  }

  static isDynamic(id) {
    return this.getTab(id)?.isDynamic ?? false;
  }

}
