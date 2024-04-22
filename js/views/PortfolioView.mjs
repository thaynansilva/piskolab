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

    for (let proj of projects) {
      let li = template.queryById("project");

      let logo = li.querySelector("[data-name='logo']");
      logo.src = proj.logo ?? "img/icons/project.svg";

      let name = li.querySelector("[data-name='name']");
      name.textContent = proj.name;

      let description = li.querySelector("[data-name='description']");
      description.textContent = proj.description;

      let link = li.querySelector("[data-name='link']");
      link.href = `/?q=view-project&uuid=${proj.uuid}`;
      link.addEventListener("click", (e) => {
        e.preventDefault();
        ViewManager.showProject(proj.uuid);
      });

      ul.appendChild(li);
    }
  });
}
