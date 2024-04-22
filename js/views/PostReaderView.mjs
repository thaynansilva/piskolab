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
import { ViewManager } from "../utils/ViewManager.mjs";
import { DateFormatter } from "../utils/DateFormatter.mjs";

const template = new Template("html/PostReader.html");

export const PostReaderView = Object.freeze({
  build,
  parent: "PostFeed",
  secret: false
});

async function build(options) {
  let postInfo = await Indexer.getPostInfo(options.postId);

  return await template.buildAndSetup((root) => {
    let back = root.querySelector("[data-name='go-back']");
    back.addEventListener("click", () => ViewManager.showPreviousView(true));

    let title = root.querySelector("[data-name='title']");
    title.textContent = postInfo.title;

    let subtitle = root.querySelector("[data-name='description']");
    subtitle.textContent = postInfo.description;

    let time = root.querySelector("[data-name='date']");
    time.textContent = DateFormatter.longDate(postInfo.date);
    time.dateTime = postInfo.date.toISOString();

    let content = root.querySelector("[data-name='content']");

    Presenter.present(content,
      async () => {
        let data = await Fetcher.get(postInfo.resourcePath, "json");
        return DocJSON.parse(data);
      },
      async (reason) => {
        throw reason;
      }
    );
  });
}
