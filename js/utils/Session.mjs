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

  static set currentPage(x) {
    sessionStorage.currentPage = x;
  }

  static set currentPageOptions(x) {
    sessionStorage.currentPageOptions = JSON.stringify(x, null, 0);
  }

  static set previousPage(x) {
    sessionStorage.previousPage = x;
  }

  static set previousPageOptions(x) {
    sessionStorage.previousPageOptions = JSON.stringify(x, null, 0);
  }

  static get currentPage() {
    return sessionStorage.currentPage;
  }

  static get currentPageOptions() {
    return JSON.parse(sessionStorage.currentPageOptions ?? "null");
  }

  static get previousPage() {
    return sessionStorage.previousPage;
  }

  static get previousPageOptions() {
    return JSON.parse(sessionStorage.previousPageOptions ?? "null");
  }

  /**
   * Resets the session.
   */
  static reset() {
    delete sessionStorage.currentPage;
    delete sessionStorage.currentPageOptions;
    delete sessionStorage.previousPage;
    delete sessionStorage.previousPageOptions;
  }

}
