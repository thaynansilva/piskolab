/*
 * Pisko Lab - Personal website
 * Copyright (C) Thaynan Silva
 *
 * SPDX-License-Identifier: LGPL-3.0
 */

import { Template } from "../utils/Template.mjs";
import { Presenter } from "../utils/Presenter.mjs";
import { ViewManager } from "../utils/ViewManager.mjs";

async function initApp() {
  const root = document.querySelector("#root");

  const build = async () => {
    const app = new Template("html/PiskoLab.html");

    return await app.buildAndSetup((root) => {
      for (let tab of root.querySelectorAll("#tabs>button")) {
        let view = tab.getAttribute("data-view");
        tab.addEventListener("click", () => ViewManager.showView(view));

        document.addEventListener("view-changed", (e) => {
          let selected = Object.values(e.detail).includes(view);
          tab.toggleAttribute("data-selected", selected);
          tab.ariaSelected = selected;
        });
      }
    })
  };

  await Presenter.present(build, root);

  ViewManager.initialize();
}

initApp();
