/*
 * Pisko Lab - Personal website
 * Copyright (C) Thaynan Silva
 *
 * SPDX-License-Identifier: LGPL-3.0
 */

import { Template } from "../utils/Template.mjs";
import { Presenter } from "../utils/Presenter.mjs";
import { ViewManager } from "../utils/ViewManager.mjs";
import { EmbedSVG } from "../elements/EmbedSVG.mjs";

const template = new Template("html/PiskoLab.html");

export const PiskoLab = Object.freeze({
  initialize
});

/**
 * @param {() => Promise<void>} preinitCallback
 */
async function initialize(preinitCallback) {
  await preinitCallback();
  await initApp();

  EmbedSVG.initialize();
  ViewManager.initialize();
}

async function initApp() {
  let root = document.getElementById("root");

  let content = await template.buildAndSetup(root => {
    for (let tab of root.querySelectorAll("#tabs>button")) {
      let view = tab.getAttribute("data-view");
      tab.addEventListener("click", () => ViewManager.showView(view));

      document.addEventListener("view-changed", (e) => {
        let selected = Object.values(e.detail).includes(view);
        tab.setAttribute("data-selected", selected);
        tab.ariaSelected = selected;
      });
    }
  });

  Presenter.replace(root, content, "replaceNode");
}
