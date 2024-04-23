/*
 * Pisko Lab - Personal website
 * Copyright (C) Thaynan Silva
 *
 * SPDX-License-Identifier: LGPL-3.0
 */

import { Timer } from "../utils/Timer.mjs";

const Animations = Object.freeze({
  "pop-in": {
    name: "anim-pop-in",
    delay: 150,
  },
  "pop-out": {
    name: "anim-pop-out",
    delay: 150,
  }
});

export const Animator = Object.freeze({

  /**
   * Animates an element.
   *
   * @param {keyof Animations} animation
   *  animation name
   * @param {HTMLElement} element
   *  target element
   */
  async animate(animation, element) {
    let anim = Animations[animation];

    if (!anim) {
      console.warn(`Invalid animation: ${anim}`);
      return;
    }

    element.classList.add(anim.name);
    await Timer.sleep(anim.delay);
    element.classList.remove(anim.name);
  },

  /**
   * Animates an element with an 'out'
   * animation and then with an 'in' animation.
   *
   * The `midTask` is a function called when the
   * element fades out of view, so that it gets
   * prepared for being shown again.
   *
   * @param {() => Promise<void>} midTask
   *  this task is performed
   * @param {string} animationIn
   *  in animation
   * @param {string} animationOut
   *  out animation
   * @param {HTMLElement} element
   *  target element
   */
  async animateInAndOut(midTask, animationIn, animationOut, element) {
    await this.animate(animationOut, element);
    await midTask();
    await this.animate(animationIn, element);
  }

});
