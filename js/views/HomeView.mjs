/*
 * Pisko Lab - Personal website
 * Copyright (C) Thaynan Silva
 *
 * SPDX-License-Identifier: LGPL-3.0
 */

import { Template } from "../utils/Template.mjs";

const template = new Template("html/Home.html");

export const HomeView = Object.freeze({
  build: async () => await template.build(),
  parent: null,
  secret: false
});
