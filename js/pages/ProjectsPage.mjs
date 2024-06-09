/*
 * Pisko Lab - Personal website
 * Copyright (C) Thaynan Silva
 *
 * SPDX-License-Identifier: LGPL-3.0
 */

import { Template } from "../utils/Template.mjs";
import { Indexer } from "../core/Indexer.mjs";
import { Pages } from "../core/Pages.mjs"

const template = new Template("html/pages/projects.html");

export const ProjectsPage = Object.freeze({
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
        Pages.showProject(projectInfo.uuid);
      });

      ul.appendChild(li);
    }
  });
}
