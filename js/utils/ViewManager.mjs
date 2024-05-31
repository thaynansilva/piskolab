/*
 * Pisko Lab - Personal website
 * Copyright (C) Thaynan Silva
 *
 * SPDX-License-Identifier: LGPL-3.0
 */

import { Presenter } from "./Presenter.mjs";
import { Search } from "./Search.mjs";
import { Session } from "./Session.mjs";

import { Dialog } from "../core/Dialog.mjs";

import { HomeView } from "../views/HomeView.mjs";
import { PostFeedView } from "../views/PostFeedView.mjs";
import { PortfolioView } from "../views/PortfolioView.mjs";
import { AboutView } from "../views/AboutView.mjs";
import { PostReaderView } from "../views/PostReaderView.mjs";
import { ProjectViewerView } from "../views/ProjectViewerView.mjs";


class ViewRegistry {

  static #store = {
    "Home":          HomeView,
    "PostFeed":      PostFeedView,
    "Portfolio":     PortfolioView,
    "About":         AboutView,
    "PostReader":    PostReaderView,
    "ProjectViewer": ProjectViewerView,
  };

  constructor() {
    throw new TypeError("This class can't be instantiated.");
  }

  /**
   * Activates a view.
   *
   * @param {string} view
   *  target view
   * @param {{}?} options
   *  view options
   * @param {boolean} allowSecret
   *  determines whether a secret views
   *  can be activated
   * @returns {Promise<DocumentFragment>|undefined}
   */
  static async activate(view, options=undefined, allowSecret=false) {
    if (!this.isValid(view)) {
      return;
    }

    if (!allowSecret && this.isSecret(view)) {
      throw new Error(`Invalid access to secret view: "${view}"`);
    }

    return await this.#store[view].build(options ?? {});
  }

  /**
   * Gets the name of the parent view
   * of a view.
   *
   * @param {string} view
   *  target view
   * @param {string} fallback
   *  fallback view
   * @returns {string}
   *  the name of the parent view, or the
   *  fallback name if `view` is not valid.
   */
  static getParent(view, fallback="Home") {
    if (!this.isValid(view)) {
      return fallback;
    }

    return this.#store[view]?.parent;
  }

  /**
   * Checks if a view is secret or not.
   *
   * Secret views can't be accessed directly
   * by the user, for instance, via the URL
   * search.
   *
   * @param {string} view
   *  target view
   * @returns {boolean|undefined}
   *  a boolean indicating whether the given view
   *  is secret or not. If the specified view is
   *  not valid, `undefined` is returned instead.
   */
  static isSecret(view) {
    if (!this.isValid(view)) {
      return;
    }

    return this.#store[view].secret;
  }

  /**
   * Tests if a view is valid.
   *
   * A view is valid if it exists in
   * the registry and is not null.
   *
   * @param {string} view
   *  target view
   * @returns {boolean}
   */
  static isValid(view) {
    return !!this.#store[view];
  }

}


export class ViewManager {

  constructor() {
    throw new TypeError("This class can't be instantiated.");
  }

  static async initialize() {
    if (Search.q) {
      switch (Search.q) {
        case "view-post":
          Session.currentView = "PostReader";
          Session.currentViewOptions = { postId: Search.id };
          break;
        case "view-project":
          Session.currentView = "ProjectViewer";
          Session.currentViewOptions = { projectUuid: Search.uuid };
          break;
        default:
          break;
      }

      window.location.search = "";
    } else if (Session.currentView) {
      this.reload();
    } else {
      this.showView("Home");
    }
  }

  /**
   * Shows a view.
   *
   * @param {string} viewName
   *  the view name
   * @param {{}?} options
   *  the view options
   * @emits ViewChangedEvent
   *  When the view is activated or refreshed
   */
  static showView(view, options=null) {
    const pane = document.getElementById("pane");

    if (!ViewRegistry.isValid(view)) {
      this.reset();
    }

    const build = async () => {
      ViewEventManager.dispatchEvent("view-changed", {
        view, parent: ViewRegistry.getParent(view)
      });

      Session.previousView = Session.currentView;
      Session.previousViewOptions = Session.currentViewOptions;
      Session.currentView = view;
      Session.currentViewOptions = options;

      try {
        return await ViewRegistry.activate(view, options);
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
   * Restores the previous view.
   *
   * @param {boolean} fallbackParent
   *  defines if the view should be swapped to
   *  the parent view in case of failure.
   *  NOTE: if the view has no parent, `"main"`
   *  view is loaded instead.
   * @returns {boolean}
   *  A value indicating whether the session was restored.
   */
  static showPreviousView(fallbackParent=false) {
    if (Session.previousView) {
      this.showView(Session.previousView, Session.previousViewOptions);
      return true;
    }

    if (fallbackParent) {
      const parentView = ViewRegistry.getParent(Session.previousView);
      this.showView(Session.previousView, parentView);
      return true;
    }

    return false;
  }

  static showPost(postId) {
    this.showView("PostReader", { postId });
  }

  static showProject(projectUuid) {
    this.showView("ProjectViewer", { projectUuid });
  }

  /**
   * Reloads the current view.
   */
  static reload() {
    this.showView(Session.currentView, Session.currentViewOptions);
  }

  /**
   * Resets the session and reloads the page.
   */
  static reset() {
    Session.reset();
    window.location.reload();
  }

}


class ViewEventManager {

  static #events = {
    "view-changed": new CustomEvent("view-changed", { detail: { view: "", parent: "" } })
  };

  /**
   * Triggers a view changed event.
   *
   * @param {string} eventName
   *  event name
   * @param {{}} detail
   *  event details
   */
  static dispatchEvent(eventName, detail={}) {
    if (!this.#events[eventName]) {
      console.error(`[ViewManager] Invalid event: ${eventName}`);
      return;
    }

    for (let [k, v] of Object.entries(detail)) {
      this.#events[eventName].detail[k] = v;
    }

    document.dispatchEvent(this.#events[eventName]);
  }

}
