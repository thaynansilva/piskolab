/*
 * Pisko Lab - Personal website
 * Copyright (C) Thaynan Silva
 *
 * SPDX-License-Identifier: LGPL-3.0
 */

import { Template } from "../utils/Template.mjs";

const template = new Template("html/pages/home.html");

export const HomePage = Object.freeze({
  build: async () => await template.build(),
  parent: null,
  secret: false
});
