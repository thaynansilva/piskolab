/*
 * Pisko Lab - Personal website
 * Copyright (C) Thaynan Silva
 *
 * SPDX-License-Identifier: LGPL-3.0
 */

import { Template } from "../utils/Template.mjs";
import { Indexer } from "../core/Indexer.mjs";

const template = new Template("html/pages/project-viewer.html")

export const ProjectViewerPage = Object.freeze({
  build,
  parent: "Projects",
  secret: false
});

async function build(options) {
  let projectUuid = options.projectUuid;
  let projectInfo = await Indexer.getProjectInfo(projectUuid);

  if (!projectInfo) {
    throw new Error(`No such project with this id: ${projectUuid}`);
  }

  return await template.buildAndSetup((root) => {
    let logo = root.querySelector("[data-name='logo']");

    if (projectInfo.logo) {
      logo.isolated = true;
      logo.src = projectInfo.logo;
    }

    let name = root.querySelector("[data-name='name']");
    name.textContent = projectInfo.name;

    let link = root.querySelector("[data-name='link']");
    link.href = projectInfo.url;

    let brief = root.querySelector("[data-name='brief']");
    brief.textContent = projectInfo.brief;

    let status = root.querySelector("[data-name='status']");
    setStatus(projectInfo.status, status);

    let description = root.querySelector("[data-name='description']");
    putItems(projectInfo.description, "description", description);

    let licensing = root.querySelector("[data-name='licensing']");
    putItems(projectInfo.licenses, "licensing", licensing);

    let docs = root.querySelector("[data-name='docs']");
    putItems(projectInfo.docs, "docs", docs);

    let links = root.querySelector("[data-name='links']");
    putItems(projectInfo.links, "links", links);
  });
}

function putItems(items, type, root) {
  if (!items) {
    return;
  }

  root.hidden = false;

  let itemsRoot = root.querySelector("div");

  switch (type) {
    case "description":
      let item = template.queryById("item-generic");
      let dd = item.querySelector("dd");
      items.forEach((x) => {
        if (x.trim().length == 0) {
          return;
        }

        let p = document.createElement("p");
        p.innerText = x;
        dd.appendChild(p);
      });
      itemsRoot.append(item);
      break;
    case "licensing":
    case "docs":
    case "links":
      items.forEach((x) => {
        let item = template.queryById("item-link");
        let a = item.querySelector("a");
        let s = a.querySelector("span.title");
        s.textContent = x.title;
        a.href = x.url;
        itemsRoot.appendChild(item);
      });
      break;
    default:
      break;
  }
}

function setStatus(projectStatus, root) {
  const validStatus = {
    "draft":        { text: "Draft",        icon: "design_services" },
    "canceled":     { text: "Canceled",     icon: "cancel" },
    "active":       { text: "Active",       icon: "check_circle" },
    "unmaintained": { text: "Unmaintained", icon: "warning" },
    "deprecated":   { text: "Deprecated",   icon: "inventory_2" }
  };

  root.setAttribute("data-status", projectStatus);

  let statusIcon = root.querySelector("[data-name='icon']");
  statusIcon.textContent = validStatus[projectStatus].icon;

  let statusText = root.querySelector("[data-name='text']");
  statusText.textContent = validStatus[projectStatus].text;
}
