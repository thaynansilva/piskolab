/*
 * Pisko Lab - Personal website
 * Copyright (C) Thaynan Silva
 *
 * SPDX-License-Identifier: LGPL-3.0
 */

import { Template } from "../utils/Template.mjs";
import { ViewManager } from "../utils/ViewManager.mjs";

const template = new Template("html/Error.html");

export const ErrorView = Object.freeze({
  build,
  parent: null,
  secret: true
});

async function build(_options) {
  return await template.buildAndSetup((root) => {
    let retry = root.querySelector("[data-name='retry']");
    retry.addEventListener("click", () => ViewManager.reload());

    let goHome = root.querySelector("[data-name='go-home']");
    goHome.addEventListener("click", () => ViewManager.reset());
  });
}
