/*
 * Pisko Lab - Personal website
 * Copyright (C) Thaynan Silva
 *
 * SPDX-License-Identifier: LGPL-3.0
 */

import { Template } from "../utils/Template.mjs";
import { Indexer } from "../core/Indexer.mjs";
import { ViewManager } from "../utils/ViewManager.mjs";
import { Search } from "../utils/Search.mjs";
import { Paginator } from "../utils/Paginator.mjs";
import { DateFormatter } from "../utils/DateFormatter.mjs";

const template = new Template("html/PostFeed.html");

export const PostFeedView = Object.freeze({
  build,
  parent: null,
  secret: false
});

async function build(_options) {
  let allPosts = await Indexer.getPosts();

  let controller = new Paginator(allPosts, Search.maxItems ?? 5);

  return await template.buildAndSetup((root) => {
    let paginator = root.querySelector("[data-name='paginator']");

    controller.onpagechange = (() => {
      showPosts(root, paginator, controller);
    });

    showPosts(root, paginator, controller);

    let pp = paginator.querySelector("[data-name='prev-page']");
    pp.addEventListener("click", () => controller.previous());

    let pn = paginator.querySelector("[data-name='next-page']");
    pn.addEventListener("click", () => controller.next());
  });
}

function showPosts(root, paginator, controller) {
  let feed = root.querySelector("[data-name='feed']");

  /* remove all items from the feed */
  feed.replaceChildren([]);

  for (let post of controller.items) {
    let li = template.queryById("post");

    let title = li.querySelector("[data-name='title']");
    title.textContent = post.title;

    let link = li.querySelector("[data-name='link']");
    link.href = `/?q=view-post&id=${post.id}`;
    link.addEventListener("click", (e) => {
      e.preventDefault();
      ViewManager.showPost(post.id);
    });

    let time = li.querySelector("[data-name='publish-date']");
    time.textContent = DateFormatter.shortDate(post.date);
    time.dateTime = post.date.toISOString();

    let description = li.querySelector("[data-name='description']");
    description.textContent = post.description;

    feed.appendChild(li);
  }

  let pi = paginator.querySelector("[data-name='page-index']");
  pi.textContent = controller.pageIndex;

  let pt = paginator.querySelector("[data-name='total-pages']");
  pt.textContent = controller.totalPages;
}
