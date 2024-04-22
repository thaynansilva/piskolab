/*
 * Pisko Lab - Personal website
 * Copyright (C) Thaynan Silva
 *
 * SPDX-License-Identifier: LGPL-3.0
 */

import { PiskoLab } from "./core/PiskoLab.mjs";
import { Fetcher } from "./utils/Fetcher.mjs";

const AssetList = Object.freeze([
  "html/PiskoLab.html",
  "html/Home.html",
  "html/About.html",
  "html/Error.html",
  "html/PostFeed.html",
  "html/PostReader.html",
  "html/Portfolio.html",
  "html/ProjectViewer.html",
  "img/socials/github.svg",
  "img/socials/gitlab.svg",
  "img/socials/mastodon.svg",
  "img/icons/nav-prev.svg",
  "img/icons/nav-next.svg",
  "img/icons/font-type.svg",
  "img/icons/open-in-new.svg",
  "img/brand.svg",
  "img/logo.svg",
  "img/profile.jpg"
]);

function main() {
  PiskoLab.initialize(async () => {
    await Fetcher.preload(AssetList);
  });
}

main()
