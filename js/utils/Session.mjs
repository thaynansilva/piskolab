/*
 * Pisko Lab - Personal website
 * Copyright (C) Thaynan Silva
 *
 * SPDX-License-Identifier: LGPL-3.0
 */

export const Session = {

  set currentView(x) {
    sessionStorage.currentView = x;
  },

  set currentViewOptions(x) {
    sessionStorage.currentViewOptions = JSON.stringify(x, null, 0);
  },

  set previousView(x) {
    sessionStorage.previousView = x;
  },

  set previousViewOptions(x) {
    sessionStorage.previousViewOptions = JSON.stringify(x, null, 0);
  },

  get currentView() {
    return sessionStorage.currentView;
  },

  get currentViewOptions() {
    return JSON.parse(sessionStorage.currentViewOptions ?? "null");
  },

  get previousView() {
    return sessionStorage.previousView;
  },

  get previousViewOptions() {
    return JSON.parse(sessionStorage.previousViewOptions ?? "null");
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

};
