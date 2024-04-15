/*
 * Pisko Lab - Personal website
 * Copyright (C) Thaynan Silva
 *
 * SPDX-License-Identifier: LGPL-3.0
 */

import { ContentManager, Utils, Search } from "./utils.mjs";

import { HomeView } from "./views/home.mjs";
import { PostsView } from "./views/posts.mjs";
import { ProjectsView } from "./views/projects.mjs";
import { AboutView } from "./views/about.mjs";
import { PostReaderView } from "./views/post-reader.mjs";
import { ProjectViewerView } from "./views/project-viewer.mjs";
import { ErrorView } from "./views/error.mjs";

/**
 * Actions
 */
const ActionRegistry = Object.freeze({
  actions : {
    "reload": () => {
      window.location.assign("/");
    },
    "reset": () => {
      Session.reset();
      window.location.assign("/");
    },
  },

  /**
   * Activates an action.
   *
   * @param {"reload"|"reset"} action
   *  the action
   */
  activate(action) {
    if(!(action in this.actions)) {
      console.warn(`Invalid action: ${action}`);
      return;
    }

    this.actions[action]();
  }

});

/**
 * Views
 *
 * NOTE: pages starting with an underscore (_)
 * are not meant to be accessed directly.
 */
const ViewRegistry = {
  "home":           HomeView,
  "posts":          PostsView,
  "projects":       ProjectsView,
  "about":          AboutView,
  "post-reader":    PostReaderView,
  "project-viewer": ProjectViewerView,
  "_error":         ErrorView,
};

/**
 * View Changed event
 */
const ViewChangedEvent = new CustomEvent(
  "view-changed", {
    detail: {
      action: "",
      currentView: "",
      currentViewParent: "",
    }
  }
);

/**
 * Triggers a view changed event.
 *
 * @param {keyof Registry["views"]} view
 *  the new view
 * @param {{}} options
 *  view options
 */
function dispatchViewChangedEvent(view, options) {
  let action = (Session.data.currentView == view) ? "activate" : "refresh";

  ViewChangedEvent.detail.action = action;
  ViewChangedEvent.detail.currentView = view;
  ViewChangedEvent.detail.currentViewParent = ViewRegistry[view].parent;

  document.dispatchEvent(ViewChangedEvent);

  Session.update(view, options);
}

/**
 * View Manager
 */
export const Views = Object.freeze({

  /**
   * Initializes the View Manager.
   */
  setup() {
    if (Search.action) {
      ActionRegistry.activate(Search.action);
    } else if (Search.project) {
      this.showProject(Search.project);
    } else if (Search.post) {
      this.readPost(Search.post);
    } else if (Search.view) {
      if (!Search.view.startsWith("_")) {
        this.view(Search.view);
      } else {
        ActionRegistry.activate("reset");
      }
    } else if (sessionStorage.currentView) {
      Session.restore();
    } else {
      this.view("home");
    }
  },

  /**
   * Sets a view.
   *
   * @param {keyof Registry["views"]} view
   *  the view name
   * @param {{}?} options
   *  the view options
   * @emits ViewChangedEvent
   *  When the view is activated or refreshed
   */
  view(view, options=null) {
    const frame = document.getElementById("frame");

    if (!ViewRegistry[view]) {
      ActionRegistry.activate("reload");
    }

    ContentManager.present(frame,
      async () => {
        dispatchViewChangedEvent(view, options);
        return await ViewRegistry[view].build(options ?? {});
      },
      async (reason) => {
        return await ViewRegistry._error.build({ reason });
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
  previousView(fallbackParent=false) {
    let {
      previousView: view,
      previousViewOptions: options
    } = sessionStorage;

    if (!view) {
      if (fallbackParent) {
        this.view(ViewRegistry[view]?.parent ?? "home");
        return;
      }

      return false;
    }

    this.view(view, JSON.parse(options ?? "null"));

    return true;
  },

  readPost(postId) {
    this.view("post-reader", { postId });
  },

  showProject(projectUuid) {
    this.view("project-viewer", { projectUuid });
  },

});

/**
 * Wraps the management of session data
 * in the browser's session storage.
 */
export const Session = Object.freeze({

  /**
   * Updates the view details.
   *
   * @param {keyof ViewRegistry} view
   *  view name
   * @param {{}?} options
   *  view options
   */
  update(view, options) {
    try {
      if (view !== sessionStorage.currentView) {
        sessionStorage.previousView = sessionStorage.currentView;
        sessionStorage.previousViewOptions = sessionStorage.currentViewOptions;
      }

      sessionStorage.currentView = view;
      sessionStorage.currentViewOptions = JSON.stringify(options ?? "null");
    } catch { }
  },

  /**
   * Resets the session.
   */
  reset() {
    delete sessionStorage.currentView;
    delete sessionStorage.currentViewOptions;
    delete sessionStorage.previousView;
    delete sessionStorage.previousViewOptions;
  },

  /**
   * Restores the session data.
   */
  restore() {
    let { currentView, currentViewOptions } = sessionStorage;

    if (!currentView)
      return false;

    Views.view(currentView, JSON.parse(currentViewOptions ?? "null"));

    return true;
  },

  /**
   * Gets the session data.
   *
   * @returns {{
   *  currentView: string,
   *  currentViewOptions: string,
   *  previousView: string,
   *  previousViewOptions: string,
   * }}
   */
  get data() {
    return {
      currentView: sessionStorage.currentView,
      currentViewOptions: sessionStorage.currentViewOptions,
      previousView: sessionStorage.previousView,
      previousViewOptions: sessionStorage.previousViewOptions
    };
  }

});
