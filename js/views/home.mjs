/*
 * Pisko Lab - Personal website
 * Copyright (C) Thaynan Silva
 *
 * SPDX-License-Identifier: LGPL-3.0
 */

import { Template } from "../template.mjs";

const template = new Template("html/views/home.html");

export const HomeView = Object.freeze({ build, parent: null });

async function build(_options) {
  return await template.build((_, _root) => {});
}
