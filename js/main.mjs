/*
 * Pisko Lab - Personal website
 * Copyright (C) Thaynan Silva
 *
 * SPDX-License-Identifier: LGPL-3.0
 */

import { Template } from "./utils/Template.mjs";
import { Presenter } from "./utils/Presenter.mjs";
import { Pages } from "./core/Pages.mjs";


async function initApp() {
  const root = document.querySelector("#root");

  const build = async () => {
    const app = new Template("html/ui/main.html");

    return await app.buildAndSetup((root) => {
      for (let tab of root.querySelectorAll("#tabs>button")) {
        let page = tab.getAttribute("data-page");
        tab.addEventListener("click", () => Pages.showPage(page));

        document.addEventListener("page-changed", (e) => {
          let selected = Object.values(e.detail).includes(page);
          tab.toggleAttribute("data-selected", selected);
          tab.ariaSelected = selected;
        });
      }
    })
  };

  await Presenter.present(build, root);

  Pages.initialize();
}

initApp();
