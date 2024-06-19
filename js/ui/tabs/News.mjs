/*
 * Pisko Lab - Personal website
 * Copyright (C) Thaynan Silva
 *
 * SPDX-License-Identifier: LGPL-3.0
 */

import { Template } from "../../utils/Template.mjs";

import { Indexer } from "../../core/Indexer.mjs";
import { App } from "../../core/App.mjs";

import { Search } from "../../utils/Search.mjs";
import { Paginator } from "../../utils/Paginator.mjs";
import { DateFormatter } from "../../utils/DateFormatter.mjs";

import { TabInfo } from "../TabInfo.mjs";


export class NewsTab extends TabInfo {

  #template = new Template("html/ui/tabs/news.html");

  constructor() {
    super("News", null, true);
  }

  async buildUI(_options) {
    let allArticles = await Indexer.getArticles();

    let controller = new Paginator(allArticles, Search.maxItems ?? 5);

    return await this.#template.buildAndSetup((root) => {
      let paginator = root.querySelector("[data-name='paginator']");

      controller.onpagechange = (() => {
        this.#showArticles(root, paginator, controller);
      });

      this.#showArticles(root, paginator, controller);

      let pp = paginator.querySelector("[data-name='prev-page']");
      pp.addEventListener("click", () => controller.previous());

      let pn = paginator.querySelector("[data-name='next-page']");
      pn.addEventListener("click", () => controller.next());
    });
  }

  #showArticles(root, paginator, controller) {
    let feed = root.querySelector("[data-name='feed']");

    /* remove all items from the feed */
    feed.replaceChildren([]);

    for (let article of controller.items) {
      let li = this.#template.queryById("article");

      let title = li.querySelector("[data-name='title']");
      title.textContent = article.title;

      let link = li.querySelector("[data-name='link']");
      link.href = `/?viewArticle=${article.id}`;
      link.addEventListener("click", (e) => {
        e.preventDefault();
        App.showArticle(article.id);
      });

      let time = li.querySelector("[data-name='publish-date']");
      time.textContent = DateFormatter.shortDate(article.date);
      time.dateTime = article.date.toISOString();

      let description = li.querySelector("[data-name='description']");
      description.textContent = article.description;

      feed.appendChild(li);
    }

    let pi = paginator.querySelector("[data-name='page-index']");
    pi.textContent = controller.pageIndex;

    let pt = paginator.querySelector("[data-name='total-pages']");
    pt.textContent = controller.totalPages;
  }

}
