/*
 * Pisko Lab - Personal website
 * Copyright (C) Thaynan Silva
 *
 * SPDX-License-Identifier: LGPL-3.0
 */

const validAnimations = ["pop-in", "pop-out", "zoom-in", "zoom-out"];

/**
 * @typedef {"none"|"zoom-in"|"zoom-out"|"pop-in"|"pop-out"} Animations
 */
export const Animator = Object.freeze({

  /**
   * Animates an element.
   *
   * @param {Animations} animation
   *  animation name
   * @param {HTMLElement} element
   *  target element
   */
  async animate(animation, element) {
    if (animation === "none") {
      return;
    }

    if (!validAnimations.includes(animation)) {
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
