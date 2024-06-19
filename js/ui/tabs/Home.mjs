/*
 * Pisko Lab - Personal website
 * Copyright (C) Thaynan Silva
 *
 * SPDX-License-Identifier: LGPL-3.0
 */

import { Template } from "../../utils/Template.mjs";

import { TabInfo } from "../TabInfo.mjs";


export class HomeTab extends TabInfo {

  #template = new Template("html/ui/tabs/home.html");

  constructor() {
    super("Home", null, false);
  }

  async buildUI(_options) {
    return await this.#template.build();
  }

}
