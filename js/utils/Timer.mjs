/*
 * Pisko Lab - Personal website
 * Copyright (C) Thaynan Silva
 *
 * SPDX-License-Identifier: LGPL-3.0
 */

/**
 * Timer utils
 */
export const Timer = {

  /**
   * Sleeps for the specified time.
   *
   * @param {number} timeout
   *  sleep time in milliseconds
   * @returns {Promise<void>}
   */
  async sleep(timeout) {
    return new Promise((r, _) => setTimeout(r, timeout));
  }

};
