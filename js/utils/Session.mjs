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

  static set activeTabId(x) {
    sessionStorage.activeTabId = x;
  }

  static set activeTabOptions(x) {
    sessionStorage.activeTabOptions = JSON.stringify(x, null, 0);
  }

  static set showErrorDetails(x) {
    sessionStorage.showErrorDetails = JSON.stringify(!!x, null, 0);
  }

  /**
   * @returns {string}
   */
  static get activeTabId() {
    return sessionStorage.activeTabId;
  }

  /**
   * @returns {{}}
   */
  static get activeTabOptions() {
    return JSON.parse(sessionStorage.activeTabOptions ?? "null");
  }

  /**
   * @returns {boolean}
   */
  static get showErrorDetails() {
    return JSON.parse(sessionStorage.showErrorDetails ?? "false");
  }

  /**
   * Resets the session.
   */
  static reset() {
    delete sessionStorage.activeTabId;
    delete sessionStorage.activeTabOptions;
    delete sessionStorage.showErrorDetails;
  }

}
