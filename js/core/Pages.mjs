/*
 * Pisko Lab - Personal website
 * Copyright (C) Thaynan Silva
 *
 * SPDX-License-Identifier: LGPL-3.0
 */

import { Presenter } from "../utils/Presenter.mjs";
import { Search } from "../utils/Search.mjs";
import { Session } from "../utils/Session.mjs";

import { Dialog } from "../ui/Dialog.mjs";

import { HomePage } from "../pages/HomePage.mjs";
import { NewsPage } from "../pages/NewsPage.mjs";
import { ProjectsPage } from "../pages/ProjectsPage.mjs";
import { AboutPage } from "../pages/AboutPage.mjs";
import { ArticleReaderPage } from "../pages/ArticleReaderPage.mjs";
import { ProjectViewerPage } from "../pages/ProjectViewerPage.mjs";


class PageRegistry {

  static #store = {
    "Home":          HomePage,
    "News":          NewsPage,
    "Projects":      ProjectsPage,
    "About":         AboutPage,
    "ArticleReader": ArticleReaderPage,
    "ProjectViewer": ProjectViewerPage,
  };

  constructor() {
    throw new TypeError("This class can't be instantiated.");
  }

  /**
   * Activates a page.
   *
   * @param {string} page
   *  target page
   * @param {{}?} options
   *  page options
   * @param {boolean} allowSecret
   *  determines whether a secret page
   *  can be activated
   * @returns {Promise<DocumentFragment>|undefined}
   */
  static async activate(page, options=undefined, allowSecret=false) {
    if (!this.isValid(page)) {
      return;
    }

    if (!allowSecret && this.isSecret(page)) {
      throw new Error(`Invalid access to secret page: "${page}"`);
    }

    return await this.#store[page].build(options ?? {});
  }

  /**
   * Gets the name of the parent page
   * of a page.
   *
   * @param {string} page
   *  target page
   * @param {string} fallback
   *  fallback page
   * @returns {string}
   *  the name of the parent page, or the
   *  fallback name if `page` is not valid.
   */
  static getParent(page, fallback="Home") {
    if (!this.isValid(page)) {
      return fallback;
    }

    return this.#store[page]?.parent;
  }

  /**
   * Checks if a page is secret or not.
   *
   * Secret pages can't be accessed directly
   * by the user, for instance, via the URL
   * search.
   *
   * @param {string} page
   *  target page
   * @returns {boolean|undefined}
   *  a boolean indicating whether the given page
   *  is secret or not. If the specified page is
   *  not valid, `undefined` is returned instead.
   */
  static isSecret(page) {
    if (!this.isValid(page)) {
      return;
    }

    return this.#store[page].secret;
  }

  /**
   * Tests if a page is valid.
   *
   * A page is valid if it exists in
   * the registry and is not null.
   *
   * @param {string} page
   *  target page
   * @returns {boolean}
   */
  static isValid(page) {
    return !!this.#store[page];
  }

}


export class Pages {

  constructor() {
    throw new TypeError("This class can't be instantiated.");
  }

  static async initialize() {
    if (Search.q) {
      switch (Search.q) {
        case "page-News":
          Session.currentPage = "NewsReader";
          Session.currentPageOptions = { NewsId: Search.id };
          break;
        case "page-project":
          Session.currentPage = "ProjectViewer";
          Session.currentPageOptions = { projectUuid: Search.uuid };
          break;
        default:
          break;
      }

      window.location.search = "";
    } else if (Session.currentPage) {
      this.reload();
    } else {
      this.showPage("Home");
    }
  }

  /**
   * Shows a page.
   *
   * @param {string} pageName
   *  the page name
   * @param {{}?} options
   *  the page options
   * @emits PageChangedEvent
   *  When the page is activated or refreshed
   */
  static showPage(pageName, options=null) {
    const pane = document.getElementById("pane");

    if (!PageRegistry.isValid(pageName)) {
      this.reset();
    }

    const build = async () => {
      PageEventManager.dispatchEvent("page-changed", {
        pageName, parent: PageRegistry.getParent(pageName)
      });

      Session.previousPage = Session.currentPage;
      Session.previousPageOptions = Session.currentPageOptions;
      Session.currentPage = pageName;
      Session.currentPageOptions = options;

      try {
        return await PageRegistry.activate(pageName, options);
      } catch (error) {
        console.error(error);

        // DO NOT AWAIT! Or the app will die upon dialog disposal.
        Dialog.show(
          "Oops!", "An error occurred while loading the page.", error,
          [
            { text: "Home", callback: () => this.reset() },
            { text: "Retry", hint: "suggested", callback: () => this.reload() }
          ]
        );
      }
    };

    Presenter.present(build, pane);
  }

  /**
   * Restores the previous page.
   *
   * @param {boolean} fallbackParent
   *  defines if the page should be swapped to
   *  the parent page in case of failure.
   *  NOTE: if the page has no parent, `"main"`
   *  page is loaded instead.
   * @returns {boolean}
   *  A value indicating whether the session was restored.
   */
  static showPreviousPage(fallbackParent=false) {
    if (Session.previousPage) {
      this.showPage(Session.previousPage, Session.previousPageOptions);
      return true;
    }

    if (fallbackParent) {
      const parentPage = PageRegistry.getParent(Session.previousPage);
      this.showPage(Session.previousPage, parentPage);
      return true;
    }

    return false;
  }

  static showArticle(articleId) {
    this.showPage("ArticleReader", { articleId });
  }

  static showProject(projectUuid) {
    this.showPage("ProjectViewer", { projectUuid });
  }

  /**
   * Reloads the current page.
   */
  static reload() {
    this.showPage(Session.currentPage, Session.currentPageOptions);
  }

  /**
   * Resets the session and reloads the page.
   */
  static reset() {
    Session.reset();
    window.location.reload();
  }

}


class PageEventManager {

  static #events = {
    "page-changed": new CustomEvent("page-changed", { detail: { page: "", parent: "" } })
  };

  /**
   * Triggers a page changed event.
   *
   * @param {string} eventName
   *  event name
   * @param {{}} detail
   *  event details
   */
  static dispatchEvent(eventName, detail={}) {
    if (!this.#events[eventName]) {
      console.error(`[PageEventManager] Invalid event: ${eventName}`);
      return;
    }

    for (let [k, v] of Object.entries(detail)) {
      this.#events[eventName].detail[k] = v;
    }

    document.dispatchEvent(this.#events[eventName]);
  }

}
