/*
 * Pisko Lab - Personal website
 * Copyright (C) Thaynan Silva
 *
 * SPDX-License-Identifier: LGPL-3.0
 */

import { Template } from "../../utils/Template.mjs";
import { TabInfo } from "../TabInfo.mjs";


export class AboutTab extends TabInfo {

  #template = new Template("html/ui/tabs/about.html");

  constructor() {
    super("About", null, false);
  }

  async buildUI(_options) {
    return await this.#template.build();
  }

}
