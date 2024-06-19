/*
 * Pisko Lab - Personal website
 * Copyright (C) Thaynan Silva
 *
 * SPDX-License-Identifier: LGPL-3.0
 */

import { Template } from "../utils/Template.mjs";
import { Animator } from "../utils/Animator.mjs";

import { Session } from "../utils/Session.mjs";


const template = await Template.newPreload("html/ui/dialog.html");


class ModalRoot {

  static #root = document.getElementById("modal-root");

  static #queue = [];
  static #locked = false;

  constructor() {
    throw new TypeError("This class can't be instantiated.");
  }

  static async acquire() {
    let lock = new Promise((resolve, _) => {
      this.#queue.push(resolve);
    });

    if (!this.#locked) {
      this.#dispatchNext();
    }

    await lock;

    const modal = Object.freeze({
      root: this.#root,
      show: (build) => {
        build(modal).then((v) => {
          this.#root.replaceChildren(v);
          Animator.animate("pop-in", this.#root.firstElementChild);
        });
      },
      dispose: () => {
        Animator.animate("pop-out", this.#root.firstElementChild).then(() => {
          this.#dispatchNext();
        })
      }
    });

    return modal;
  }

  static #dispatchNext() {
    if (this.#queue.length > 0) {
      this.#locked = true;
      this.#root.hidden = false;

      let resolve = this.#queue.shift();
      resolve();
    } else {
      this.#locked = false;
      this.#root.hidden = true;

      this.#root.replaceChildren();
    }
  }

}


/**
 * @typedef {{
 *  text: string,
 *  hint?: "suggested" | "destructive",
 *  callback?: ?() => void,
 *  noDispose?: boolean
 * }} DialogAction
 */
export class Dialog {

  constructor() {
    throw new TypeError("This class can't be instantiated.");
  }

  /**
   * Shows a dialog.
   *
   * @param {string} title
   *  dialog title
   * @param {string} message
   *  the message
   * @param {string} details
   *  optional details
   * @param {DialogAction[]} actions
   *  dialog actions
   * @returns {Promise<string>}
   *  the activated action. If `undefined`, an
   *  'OK' action will be used as fallback.
   */
  static async show(title, message, details=undefined, actions=undefined) {
    const modal = await ModalRoot.acquire();

    let resolve;

    const result = new Promise((r) => {
      resolve = (action) => {
        if (!action.noDispose) {
          modal.dispose();
        }

        try {
          action.callback?.();
        } catch(error) {
          console.warn(`[Dialog] Action callback failed (action: '${action.text}')`);
          console.error(error);
        }

        r(action.text);
      };
    });

    modal.show(async () => await template.buildAndSetup((root) => {
      let _title = root.querySelector("[data-name='title']");
      _title.textContent = title ?? "Information";

      let _message = root.querySelector("[data-name='message']");
      _message.textContent = message ?? "";

      let expander = root.querySelector("details");
      expander.toggleAttribute("hidden", !details);
      expander.toggleAttribute("open", Session.showErrorDetails);

      expander.addEventListener("toggle", () => {
        Session.showErrorDetails = expander.hasAttribute("open");
      });

      let reason = expander.querySelector("div.reason");
      reason.textContent = details?.message ?? details ?? "";

      let actionsContainer = root.querySelector("div.actions");
      this.#createActionButtons(actions, actionsContainer, resolve);
    }));

    return await result;
  }

  static #createActionButtons(actions, actionsContainer, resolve) {
    const defaultActions = [{ text: "OK" }];

    for (let action of actions ?? defaultActions) {
      if (!action.text) {
        console.debug(`[Dialog] Invalid action: ${JSON.stringify(action)}`);
        continue;
      }

      let newAction = template.queryById("dialog-action").firstElementChild;
      newAction.textContent = action.text;
      newAction.addEventListener("click", () => resolve(action));

      if (action.hint) {
        switch (action.hint) {
          case "suggested":
            newAction.classList.add("suggested");
            break;
          case "destructive":
            newAction.classList.add("destructive");
            break;
          default:
            console.debug(`[Dialog] Invalid action hint: ${action.hint}`);
            break;
        }
      }

      actionsContainer.appendChild(newAction);
    }
  }

}
