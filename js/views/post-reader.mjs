/*
 * Pisko Lab - Personal website
 * Copyright (C) Thaynan Silva
 *
 * SPDX-License-Identifier: LGPL-3.0
 */

import { Provider } from "../provider.mjs";
import { Template } from "../template.mjs";
import { HyperJSON } from "../hyperjson.mjs";
import { Views } from "../views.mjs";
import { Utils, ContentManager, DateFormatter } from "../utils.mjs";

const template = new Template("html/views/post-reader.html");

export const PostReaderView = Object.freeze({ build, parent: "posts" });

async function build(options) {
  let postInfo = await Provider.getPostInfo(options.postId);

  return await template.build((_, root) => {
    let ret = root.querySelector("[data-name='return']");
    ret.addEventListener("click", (e) => {
      e.preventDefault();
      Views.previousView(true);
    });

    let title = root.querySelector("[data-name='title']");
    title.textContent = postInfo.title;

    let subtitle = root.querySelector("[data-name='description']");
    subtitle.textContent = postInfo.description;

    let time = root.querySelector("[data-name='date']");
    time.textContent = DateFormatter.longDate(postInfo.date);
    time.dateTime = postInfo.date.toISOString();

    let content = root.querySelector("[data-name='content']");

    ContentManager.present(content, async () => {
      let data = await Utils.get(`meta/posts/repo/${options.postId}.json`, "json");
      return HyperJSON.parse(data);
    });
  });
}
