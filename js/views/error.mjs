/*
 * Pisko Lab - Personal website
 * Copyright (C) Thaynan Silva
 *
 * SPDX-License-Identifier: LGPL-3.0
 */

import { Template } from "../template.mjs";

const template = new Template("html/views/error.html");

export const ErrorView = Object.freeze({ build, parent: null });

async function build(options) {
  let { reason } = options;

  return await template.build((T, root) => {
    let message = root.querySelector("[data-name='error-message']");
    message.textContent = reason;
  });
}
