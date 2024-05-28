/*
 * Pisko Lab - Personal website
 * Copyright (C) Thaynan Silva
 *
 * SPDX-License-Identifier: LGPL-3.0
 */

const validAnimations = {
  "pop-in": 1,  "pop-out": 1,
  "zoom-in": 1, "zoom-out": 1,
  "slide-up": 1
};

/**
 * @typedef {keyof validAnimations} Animations
 */
export class Animator {

  constructor() {
    throw new TypeError("This class can't be instantiated.");
  }

  /**
   * Animates an element.
   *
   * @param {Animation} animation
   *  animation name
   * @param {HTMLElement} element
   *  target element
   */
  static async animate(animation, element) {
    if (animation === "none") {
      return;
    }

    if (!validAnimations[animation]) {
      console.debug(`[Animator] Invalid animation: ${animation}`);
      return;
    }

    let animClassName = `anim-${animation}`;
    let animationEnded;

    element.onanimationend = element.onanimationcancel = (ev) => {
      if (ev.animationName === animation) {
        ev.target.classList.remove(animClassName);
        animationEnded();
      }
    }

    element.classList.add(animClassName);

    await new Promise((r) => { animationEnded = r });
  }

  /**
   * Animates an element with an 'out'
   * animation and then with an 'in' animation.
   *
   * The `midTask` is a function called when the
   * element fades out of view, so that it gets
   * prepared for being shown again.
   *
   * NOTE: the 'out' animation won't be played if
   * `element` has no child elements.
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
  static async animateInAndOut(midTask, animationIn, animationOut, element) {
    if (element.firstElementChild) {
      await this.animate(animationOut, element);
    }
    await midTask();
    await this.animate(animationIn, element);
  }

}
