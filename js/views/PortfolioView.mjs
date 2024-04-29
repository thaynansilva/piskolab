/*
 * Pisko Lab - Personal website
 * Copyright (C) Thaynan Silva
 *
 * SPDX-License-Identifier: LGPL-3.0
 */

import { Template } from "../utils/Template.mjs";
import { Indexer } from "../core/Indexer.mjs";
import { ViewManager } from "../utils/ViewManager.mjs"

const template = new Template("html/Portfolio.html");

export const PortfolioView = Object.freeze({
  build,
  parent: null,
  secret: false
});

async function build(_options) {
  const projects = await Indexer.getProjects();

  return await template.buildAndSetup((root) => {
    let ul = root.querySelector("ul");

    for (let projectInfo of projects) {
      let li = template.queryById("project");

      let logo = li.querySelector("[data-name='logo']");
      if (projectInfo.logo) {
        logo.isolated = true;
        logo.src = projectInfo.logo;
      }

      let name = li.querySelector("[data-name='name']");
      name.textContent = projectInfo.name;

      let brief = li.querySelector("[data-name='brief']");
      brief.textContent = projectInfo.brief;

      let link = li.querySelector("[data-name='link']");
      link.href = `/?q=view-project&uuid=${projectInfo.uuid}`;
      link.addEventListener("click", (e) => {
        e.preventDefault();
        ViewManager.showProject(projectInfo.uuid);
      });

      ul.appendChild(li);
    }
  });
}
