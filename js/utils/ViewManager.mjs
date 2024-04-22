/*
 * Pisko Lab - Personal website
 * Copyright (C) Thaynan Silva
 *
 * SPDX-License-Identifier: LGPL-3.0
 */

import { Presenter } from "./Presenter.mjs";
import { Search } from "./Search.mjs";
import { Session } from "./Session.mjs";

import { HomeView } from "../views/HomeView.mjs";
import { PostFeedView } from "../views/PostFeedView.mjs";
import { PortfolioView } from "../views/PortfolioView.mjs";
import { AboutView } from "../views/AboutView.mjs";
import { PostReaderView } from "../views/PostReaderView.mjs";
import { ProjectViewerView } from "../views/ProjectViewerView.mjs";
import { ErrorView } from "../views/ErrorView.mjs";

/**
 * Views
 */
const ViewRegistry = Object.freeze({

  store: {
    "Home":          HomeView,
    "PostFeed":      PostFeedView,
    "Portfolio":     PortfolioView,
    "About":         AboutView,
    "PostReader":    PostReaderView,
    "ProjectViewer": ProjectViewerView,
    "Error":         ErrorView,
  },

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
  async activate(view, options=undefined, allowSecret=false) {
    if (!this.isValid(view)) {
      return;
    }

    if (!allowSecret && this.isSecret(view)) {
      throw new Error(`Invalid access to secret view: "${view}"`);
    }

    return await this.store[view].build(options ?? {});
  },

  /**
   *
   * @param {string} view
   * @returns {string|undefined}
   */
  getParent(view) {
    if (!this.isValid(view)) {
      return;
    }

    return this.store[view].parent;
  },

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
  getParentOr(view, fallback="Home") {
    return this.getParent(view) ?? fallback;
  },

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
  isSecret(view) {
    if (!this.isValid(view)) {
      return;
    }

    return this.store[view].secret;
  },

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
  isValid(view) {
    return !!this.store[view];
  }

});

/**
 * View Manager
 */
export const ViewManager = Object.freeze({

  /**
   * Initializes the View Manager.
   */
  initialize() {
    if (Search.q) {
      switch (Search.q) {
        case "view-post":
          Session.currentView = "PostReader";
          Session.currentViewOptions = { postId: Search.id };
          break;
        case "view-project":
          Session.currentView = "ProjectViewer";
          console.log(Search.id);
          Session.currentViewOptions = { projectUuid: Search.id };
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
  },

  /**
   * Sets a view.
   *
   * @param {string} view
   *  the view name
   * @param {{}?} options
   *  the view options
   * @emits ViewChangedEvent
   *  When the view is activated or refreshed
   */
  showView(view, options=null) {
    const root = document.getElementById("root");

    if (!ViewRegistry.isValid(view)) {
      this.reset();
    }

    Presenter.present(root,
      async () => {
        ViewEventManager.dispatchEvent("view-changed", {
          view, parent: ViewRegistry.getParent(view)
        });

        Session.previousView = Session.currentView;
        Session.previousViewOptions = Session.currentViewOptions;
        Session.currentView = view;
        Session.currentViewOptions = options;

        return await ViewRegistry.activate(view, options);
      },
      async (reason) => {
        console.error(reason);
        return await ViewRegistry.activate("Error", { reason }, true);
      }
    );
  },

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
  showPreviousView(fallbackParent=false) {
    if (Session.previousView) {
      this.showView(Session.previousView, Session.previousViewOptions);
      return true;
    }

    if (fallbackParent) {
      this.showView(Session.previousView, ViewRegistry.getParentOr(Session.previousView));
      return true;
    }

    return false;
  },

  showPost(postId) {
    this.showView("PostReader", { postId });
  },

  showProject(projectUuid) {
    this.showView("ProjectViewer", { projectUuid });
  },

  /**
   * Reloads the current view.
   */
  reload() {
    this.showView(Session.currentView, Session.currentViewOptions);
  },

  /**
   * Resets the session and reloads the page.
   */
  reset() {
    Session.reset();
    window.location.reload();
  },

});

/**
 * View Event Manager
 */
const ViewEventManager = Object.freeze({

  events: {
    "view-changed": new CustomEvent("view-changed", {
      detail: { view: "", parent: "" }
    })
  },

  /**
   * Triggers a view changed event.
   *
   * @param {string} eventName
   *  event name
   * @param {{}} detail
   *  event details
   */
  dispatchEvent(eventName, detail={}) {
    if (!this.events[eventName]) {
      console.error(`Invalid event: ${eventName}`);
      return;
    }

    for (let [k, v] of Object.entries(detail)) {
      this.events[eventName].detail[k] = v;
    }

    document.dispatchEvent(this.events[eventName]);
  }

});
