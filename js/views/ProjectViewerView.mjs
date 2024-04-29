/*
 * Pisko Lab - Personal website
 * Copyright (C) Thaynan Silva
 *
 * SPDX-License-Identifier: LGPL-3.0
 */

import { Template } from "../utils/Template.mjs";
import { Indexer } from "../core/Indexer.mjs";

const template = new Template("html/ProjectViewer.html")

export const ProjectViewerView = Object.freeze({
  build,
  parent: "Portfolio",
  secret: false
});

const statusMessages = {
  "drafting": "Drafting phase",
  "canceled": "Canceled",
  "active": "Active development",
  "unmaintained": "Unmaintained",
  "deprecated": "Deprecated"
};

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
    status.setAttribute("data-status", projectInfo.status);
    status.textContent = statusMessages[projectInfo.status];

    let description = root.querySelector("[data-name='description']");
    let descriptionSection = root.querySelector("[data-name='sect-description']");
    putItems(projectInfo.description, "description", description, descriptionSection);

    let licensing = root.querySelector("[data-name='licensing']");
    let licensingSection = root.querySelector("[data-name='sect-licensing']");
    putItems(projectInfo.details?.licenses, "licensing", licensing, licensingSection);

    let docs = root.querySelector("[data-name='docs']");
    let docsSection = root.querySelector("[data-name='sect-docs']");
    putItems(projectInfo.details?.docs, "docs", docs, docsSection);

    let links = root.querySelector("[data-name='links']");
    let linksSection = root.querySelector("[data-name='sect-links']")
    putItems(projectInfo.details?.links, "links", links, linksSection);
  });
}

function putItems(items, type, container, targetSection) {
  if (!items) {
    if (targetSection) {
      targetSection.hidden = true;
    }

    return;
  }

  switch (type) {
    case "description":
      items.forEach((x) => {
        let line = x.trim();
        if (line.length > 0) {
          let p = template.queryById("item-paragraph")
          p.textContent = line;
          container.appendChild(p);
        }
      });
      break;
    case "licensing":
      items.forEach((x) => {
        let item = template.queryById("item");
        let a = item.querySelector("a");
        let t = a.querySelector("span");
        t.textContent = x.identifier;
        a.href = x.url;
        container.appendChild(item);
      });
      break;
    case "docs":
    case "links":
      items.forEach((x) => {
        let item = template.queryById("item");
        let a = item.querySelector("a");
        let t = a.querySelector("span");
        t.textContent = x.title ?? x.url;
        a.href = x.url;
        container.appendChild(item);
      });
      break;
    default:
      break;
  }
}
