/*
 * Pisko Lab - Personal website
 * Copyright (C) Thaynan Silva
 *
 * SPDX-License-Identifier: LGPL-3.0
 */

import { Template } from "../utils/Template.mjs";
import { Indexer } from "../core/Indexer.mjs";

import { Fetcher } from "../utils/Fetcher.mjs";
import { Presenter } from "../utils/Presenter.mjs";
import { DocJSON } from "../utils/DocJSON.mjs";
import { DateFormatter } from "../utils/DateFormatter.mjs";

const template = new Template("html/pages/article-reader.html");

export const ArticleReaderPage = Object.freeze({
  build,
  parent: "News",
  secret: false
});

async function build(options) {
  let articleInfo = await Indexer.getArticleInfo(options.articleId);
  let articleId = articleInfo.id;

  return await template.buildAndSetup((root) => {
    let title = root.querySelector("[data-name='title']");
    title.textContent = articleInfo.title;

    let subtitle = root.querySelector("[data-name='description']");
    subtitle.textContent = articleInfo.description;

    let time = root.querySelector("[data-name='date']");
    time.textContent = DateFormatter.longDate(articleInfo.date);
    time.dateTime = articleInfo.date.toISOString();

    let contentRoot = root.querySelector("[data-name='content']");

    Presenter.present(
      async () => {
        let data = await Fetcher.get(`meta/articles/repo/${articleId}.json`, "json");
        return DocJSON.parse(data);
      },
      contentRoot, { in: "slide-up", out: "none" }
    );
  });
}
