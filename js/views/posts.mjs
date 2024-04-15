/*
 * Pisko Lab - Personal website
 * Copyright (C) Thaynan Silva
 *
 * SPDX-License-Identifier: LGPL-3.0
 */

import { Template } from "../template.mjs";
import { Provider } from "../provider.mjs";
import { Views } from "../views.mjs";
import { Search, DateFormatter, PaginatorController } from "../utils.mjs";

const template = new Template("html/views/posts.html");

export const PostsView = Object.freeze({ build, parent: null });

async function build(_options) {
  let allPosts = await Provider.getPosts();
  let controller = new PaginatorController(allPosts, Search.maxItems ?? 5);
  controller.onpagechange = () => showPosts(template, root, paginator, controller);

  return await template.build((T, root) => {
    let paginator = root.querySelector("div.paginator");

    showPosts(T, root, paginator, controller);

    let pp = paginator.querySelector("a[data-name='prev-page']");
    pp.addEventListener("click", (e) => {
      e.preventDefault();
      controller.previous();
    });

    let pn = paginator.querySelector("a[data-name='next-page']");
    pn.addEventListener("click", (e) => {
      e.preventDefault();
      controller.next();
    });
  });
}

function showPosts(T, root, paginator, controller) {
  let feed = root.querySelector("ul.feed");

  /* remove all items from the feed */
  feed.replaceChildren([]);

  for (let post of controller.items) {
    let li = T.queryById("post");

    let title = li.querySelector("h1[data-name='title']");
    title.textContent = post.title;

    let link = li.querySelector("a[data-name='link']");
    link.href = `/?post=${post.id}`;
    link.addEventListener("click", (e) => {
      e.preventDefault();
      Views.readPost(post.id);
    });

    let time = li.querySelector("time[data-name='publish-date']");
    time.textContent = DateFormatter.shortDate(post.date);
    time.dateTime = post.date.toISOString();

    let description = li.querySelector("p[data-name='description']");
    description.textContent = post.description;

    feed.appendChild(li);
  }

  let pi = paginator.querySelector("span[data-name='page-index']");
  pi.textContent = controller.pageIndex;

  let pt = paginator.querySelector("span[data-name='total-pages']");
  pt.textContent = controller.totalPages;
}
