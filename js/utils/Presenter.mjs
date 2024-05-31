/*
 * Pisko Lab - Personal website
 * Copyright (C) Thaynan Silva
 *
 * SPDX-License-Identifier: LGPL-3.0
 */

import { Animator } from "../utils/Animator.mjs";


/**
 * @typedef {HTMLElement|DocumentFragment|string} ContentType
 * @typedef {"replaceChildren"|"replaceNode"} ReplaceMode
 */
export class Presenter {

  constructor() {
    throw new TypeError("This class can't be instantiated.");
  }

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
  static replace(element, content, mode="replaceChildren") {
    let isFragmentOrElement = (
      content instanceof HTMLElement ||
      content instanceof DocumentFragment);

    let validContent = content ?? "";

    switch (mode) {
      case "replaceChildren":
        if (isFragmentOrElement) {
          element.replaceChildren(validContent);
        } else {
          element.innerHTML = validContent;
        }

        break;
      case "replaceNode":
        if (isFragmentOrElement) {
          element.replaceWith(validContent);
        } else {
          element.outerHTML = validContent;
        }

        break;
      default:
        console.error(`Invalid replacement mode: ${mode}`);
        break;
    }
  }

  /**
   * Replaces the content of an element.
   *
   * @param {() => Promise<ContentType>} content
   *  an async function that returns the new content.
   * @param {HTMLElement} element
   *  target element
   * @param {{in?: string, out?: string}} [animations=undefined]
   *  the in and out animations animations (defaults to `zoom-in`
   *  and `zoom-out` for the in and out animations, respectively)
   */
  static async present(content, element, animations=undefined) {
    let animIn = animations?.in ?? "zoom-in";
    let animOut = animations?.out ?? "zoom-out";

    await Animator.animateInAndOut(async () => {
      this.replace(element, "<span class='spinner'></span>");
      element.ariaBusy = true;

      let data = await content();

      this.replace(element, data);
      element.ariaBusy = false;
    }, animIn, animOut, element);
  }

}
