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
  async initialize() {
    await initApp();

    ViewManager.initialize();
  }
});

async function initApp() {
  EmbedSVG.registerElement();

  const build = async () => {
    return await template.buildAndSetup(root => {
      for (let tab of root.querySelectorAll("#tabs>button")) {
        let view = tab.getAttribute("data-view");
        tab.addEventListener("click", () => ViewManager.showView(view));

        document.addEventListener("view-changed", (e) => {
          let selected = Object.values(e.detail).includes(view);
          tab.setAttribute("data-selected", selected);
          tab.ariaSelected = selected;
        });
      }
    })
  };

  let root = document.querySelector("#root");
  await Presenter.present(root, build, null, { in: "zoom-out", out: "none" });
}

PiskoLab.initialize();
