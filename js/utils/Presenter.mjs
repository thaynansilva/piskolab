/*
 * Pisko Lab - Personal website
 * Copyright (C) Thaynan Silva
 *
 * SPDX-License-Identifier: LGPL-3.0
 */

import { Animator } from "../core/Animator.mjs";

/**
 * @typedef {HTMLElement|DocumentFragment|string} ContentType
 * @typedef {"replaceChildren"|"replaceNode"} ReplaceMode
 */
export const Presenter = {

  /**
   * Replaces the content of an element.
   *
   * @param {HTMLElement} element
   *  target element
   * @param {ContentType} content
   *  the new content
   * @param {ReplaceMode} mode
   *  content replacement mode (defaults to `replaceChildren`)
   */
  replace(element, content, mode="replaceChildren") {
    let isFragmentOrElement = (
      content instanceof HTMLElement ||
      content instanceof DocumentFragment);

    switch (mode) {
      case "replaceChildren":
        if (isFragmentOrElement) {
          element.replaceChildren(content);
        } else {
          element.innerHTML = content;
        }

        break;
      case "replaceNode":
        if (isFragmentOrElement) {
        element.replaceWith(content);
        } else {
          element.outerHTML = content;
        }

        break;
      default:
        console.error(`Invalid replacement mode: ${mode}`);
        break;
    }
  },

  /**
   * Replaces the content of an element.
   *
   * @param {HTMLElement} element
   *  target element
   * @param {() => Promise<ContentType>} resolve
   *  an async function that returns the new content.
   * @param {?(reason: string) => Promise<ContentType>} reject
   *  an async function that returns a fallback content.
   */
  present(element, resolve, reject=null) {
    Animator.animateInAndOut(async () => {
      this.replace(element, "<span class='spinner'></span>");
      element.ariaBusy = true;

      let data = null;

      try {
        data = await resolve();
      } catch (reason) {
        data = await reject?.(reason);
      }

      this.replace(element, data);
      element.ariaBusy = false;
    }, "pop-in", "pop-out", element);
  }

};
