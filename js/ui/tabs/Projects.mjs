/*
 * Pisko Lab - Personal website
 * Copyright (C) Thaynan Silva
 *
 * SPDX-License-Identifier: LGPL-3.0
 */

import { Template } from "../../utils/Template.mjs";
import { Indexer } from "../../core/Indexer.mjs";
import { App } from "../../core/App.mjs"

import { TabInfo } from "../TabInfo.mjs";


export class ProjectsTab extends TabInfo {

  #template = new Template("html/ui/tabs/projects.html");

  constructor() {
    super("Projects", null, true);
  }

  async buildUI(_options) {
    const projects = await Indexer.getProjects();

    return await this.#template.buildAndSetup((root) => {
      let ul = root.querySelector("ul");

      for (let projectInfo of projects) {
        let li = this.#template.queryById("project");

        let logo = li.querySelector("img.logo");

        if (projectInfo.logo) {
          logo.src = projectInfo.logo;
        }

        let name = li.querySelector("[data-name='name']");
        name.textContent = projectInfo.name;

        let brief = li.querySelector("[data-name='brief']");
        brief.textContent = projectInfo.brief;

        let link = li.querySelector("[data-name='link']");
        link.href = `/?viewProject=${projectInfo.uuid}`;
        link.addEventListener("click", (e) => {
          e.preventDefault();
          App.showProject(projectInfo.uuid);
        });

        ul.appendChild(li);
      }
    });
  }

}
