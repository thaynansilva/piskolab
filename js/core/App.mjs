/*
 * Pisko Lab - Personal website
 * Copyright (C) Thaynan Silva
 *
 * SPDX-License-Identifier: LGPL-3.0
 */

import { TabRegistry } from "../ui/TabRegistry.mjs";
import { Animator } from "../utils/Animator.mjs";

import { Session } from "../utils/Session.mjs";
import { Search } from "../utils/Search.mjs";

import  { Dialog } from "../ui/Dialog.mjs"


export class App {

  static #panelRoot = document.querySelector("#panel-root");
  static #tabs = document.querySelectorAll("#tabs > button[role='tab']");

  constructor() {
    throw new TypeError("This class can't be instantiated.");
  }

  static init() {
    this.#tabs.forEach((tab) => {
      let panel = tab.getAttribute("aria-controls");
      tab.id = `tab_${tab.getAttribute("aria-controls")}`;
      tab.addEventListener("click", () => this.showTab(panel));
    });

    document.addEventListener("tab-changed", (e) => {
      this.#tabs.forEach((tab) => {
        let panel = tab.getAttribute("aria-controls");
        let isSelected = Object.values(e.detail).includes(panel);
        tab.setAttribute("aria-selected", String(isSelected))
      })
    });

    if (Search.viewArticle) {
      this.showArticle(Search.viewArticle);
    } else if (Search.viewProject) {
      this.showProject(Search.viewProject);
    } else if (Session.activeTabId) {
      this.reload();
    } else {
      this.showTab("Home");
    }
  }

  static showTab(id, options={}) {
    Session.activeTabId = id;
    Session.activeTabOptions = options;

    ((async () => {
      try {
        if (!this.#panelRoot.querySelector(`#${id}`)) {
          let panel = await TabRegistry.getTab(id).buildUI(options);
          this.#panelRoot.append(panel);
        }

        this.#switchTab(id, options);
      } catch(error) {
        Dialog.show("Oops!", "Failed to load section.", error, [
          { text: "Home", callback: () => App.reset() },
          { text: "Retry", hint: "suggested", callback: () => App.reload() }
        ]);
      }

      this.#emitTabChangedEvent(id);
    })());
  }

  static showParentTab() {
    this.showTab(TabRegistry.getParentId(Session.activeTabId));
  }

  static showArticle(articleId) {
    this.showTab("ArticleReader", { articleId });
  }

  static showProject(projectUuid) {
    this.showTab("ProjectViewer", { projectUuid });
  }

  static reload() {
    this.showTab(Session.activeTabId, Session.activeTabOptions);
  }

  static reset() {
    Session.reset();
    window.location.reload();
  }

  static async #switchTab(id) {
    let panels = this.#panelRoot.querySelectorAll("[role='tabpanel']");

    await Animator.animateInAndOut(async () => {
      for (let panel of panels) {
        let selected = (panel.id == id);
        panel.toggleAttribute("hidden", !selected);
        panel.setAttribute("aria-labelledby", `tab_${panel.id}`);
        panel.setAttribute("aria-selected", selected);
      }
    }, "slide-up", "fade-out", this.#panelRoot);

    for (let panel of panels) {
      if ((panel.id != id) && TabRegistry.isDynamic(panel.id)) {
        panel.remove();
      }
    }
  }

  static #emitTabChangedEvent(id) {
    document.dispatchEvent(new CustomEvent("tab-changed",
      { detail: { id, parentId: TabRegistry.getParentId(id) } }
    ));
  }

}
