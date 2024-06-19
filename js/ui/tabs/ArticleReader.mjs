/*
 * Pisko Lab - Personal website
 * Copyright (C) Thaynan Silva
 *
 * SPDX-License-Identifier: LGPL-3.0
 */

import { Template } from "../../utils/Template.mjs";
import { Indexer } from "../../core/Indexer.mjs";

import { Fetcher } from "../../utils/Fetcher.mjs";
import { Presenter } from "../../utils/Presenter.mjs";
import { DocJSON } from "../../utils/DocJSON.mjs";
import { DateFormatter } from "../../utils/DateFormatter.mjs";

import { TabInfo } from "../TabInfo.mjs";


export class ArticleReaderTab extends TabInfo {

  #template = new Template("html/ui/tabs/article-reader.html");

  constructor() {
    super("ArticleReader", "News", true);
  }

  async buildUI(options) {
    let articleInfo = await Indexer.getArticleInfo(options.articleId);
    let articleData = await Fetcher.get(`meta/articles/repo/${articleInfo.id}.json`, "json");

    return await this.#template.buildAndSetup((root) => {
      let title = root.querySelector("[data-name='title']");
      title.textContent = articleInfo.title;

      let subtitle = root.querySelector("[data-name='description']");
      subtitle.textContent = articleInfo.description;

      let time = root.querySelector("[data-name='date']");
      time.textContent = DateFormatter.longDate(articleInfo.date);
      time.dateTime = articleInfo.date.toISOString();

      let contentRoot = root.querySelector("[data-name='content']");
      contentRoot.innerHTML = DocJSON.parse(articleData);
    });
  }

}
