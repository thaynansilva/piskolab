/*
 * Pisko Lab - Personal website
 * Copyright (C) Thaynan Silva
 *
 * SPDX-License-Identifier: LGPL-3.0
 */

export const DateFormatter = {

  /**
   * Formats the date as `YYYY-MM-DD`.
   *
   * @param {Date} date
   *  the date
   * @returns {string}
   */
  shortDate(date) {
    let y = `${date.getUTCFullYear()}`.padStart(4, "0");
    let m = `${date.getUTCMonth()+1}`.padStart(2, "0");
    let d = `${date.getUTCDate()}`.padStart(2, "0");
    return `${y}-${m}-${d}`;
  },

  /**
   * Formats a date as `YYYY-MM-DD HH:MM UTC`
   *
   * @param {Date} date
   *  the date
   * @returns {string}
   */
  longDate(date) {
    let h = `${date.getUTCHours()}`.padStart(2, "0");
    let m = `${date.getUTCMinutes()}`.padStart(2, "0");
    return `${this.shortDate(date)} ${h}:${m} UTC`;
  }

};
