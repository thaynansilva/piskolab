/*
 * Pisko Lab - Personal website
 * Copyright (C) Thaynan Silva
 *
 * SPDX-License-Identifier: LGPL-3.0
 */

import { Template } from "../template.mjs";
import { Provider } from "../provider.mjs";
import { Views } from "../views.mjs"
import { PLSVGElement } from "../plsvg.mjs";

const template = new Template("html/views/projects.html");

export const ProjectsView = Object.freeze({ build, parent: null });

async function build(_options) {
  const projects = await Provider.getProjects();

  return await template.build((T, root) => {
    let ul = root.querySelector("ul");

    for (let proj of projects) {
      let li = T.queryById("project");

      /** @type {PLSVGElement} */
      let logo = li.querySelector("[data-name='logo']");
      logo.src = (proj.logo ?? "img/icons/project.svg");

      let name = li.querySelector("[data-name='name']");
      name.textContent = proj.name;

      let status = li.querySelector("[data-name='status']");
      status.setAttribute("data-status", proj.status);
      status.textContent = proj.status;

      let description = li.querySelector("[data-name='description']");
      description.textContent = proj.description;

      let link = li.querySelector("[data-name='link']");
      link.href = `/?project=${proj.uuid}`;
      link.addEventListener("click", (e) => {
        e.preventDefault();
        Views.showProject(proj.uuid);
      });

      ul.appendChild(li);
    }
  });
}
