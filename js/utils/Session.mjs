/*
 * Pisko Lab - Personal website
 * Copyright (C) Thaynan Silva
 *
 * SPDX-License-Identifier: LGPL-3.0
 */

export class Session {

  constructor() {
    throw new TypeError("This class can't be instantiated.");
  }

  static set currentView(x) {
    sessionStorage.currentView = x;
  }

  static set currentViewOptions(x) {
    sessionStorage.currentViewOptions = JSON.stringify(x, null, 0);
  }

  static set previousView(x) {
    sessionStorage.previousView = x;
  }

  static set previousViewOptions(x) {
    sessionStorage.previousViewOptions = JSON.stringify(x, null, 0);
  }

  static get currentView() {
    return sessionStorage.currentView;
  }

  static get currentViewOptions() {
    return JSON.parse(sessionStorage.currentViewOptions ?? "null");
  }

  static get previousView() {
    return sessionStorage.previousView;
  }

  static get previousViewOptions() {
    return JSON.parse(sessionStorage.previousViewOptions ?? "null");
  }

  /**
   * Resets the session.
   */
  static reset() {
    delete sessionStorage.currentView;
    delete sessionStorage.currentViewOptions;
    delete sessionStorage.previousView;
    delete sessionStorage.previousViewOptions;
  }

}
