/*
 * Pisko Lab - Personal website
 * Copyright (C) Thaynan Silva
 *
 * SPDX-License-Identifier: LGPL-3.0
 */

import { Views } from "./views.mjs";
import { PLSVG } from "./plsvg.mjs";

function setupCallbacks() {
  const links = document.querySelectorAll("#links a.button");

  for (let li of links) {
    li.addEventListener("click", e => {
      e.preventDefault();
      Views.view(li.getAttribute("data-view"));
    });
  }

  document.addEventListener("view-changed", e => {
    for (let li of links) {
      let targetView = li.getAttribute("data-view");

      if (targetView === e.detail.currentView ||
          targetView === e.detail.currentViewParent) {
        li.setAttribute("data-selected", true);
        li.ariaSelected = true;
      } else {
        li.removeAttribute("data-selected", false);
        li.ariaSelected = false;
      }
    }
  });
}

function main() {
  setupCallbacks();

  PLSVG.setup();
  Views.setup();
}

main()
