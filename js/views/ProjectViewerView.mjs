import { Template } from "../utils/Template.mjs";
import { Indexer } from "../core/Indexer.mjs";

const template = new Template("html/ProjectViewer.html")

export const ProjectViewerView = Object.freeze({
  build,
  parent: "Portfolio",
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
      logo.noEmbed = true;
      logo.src = projectInfo.logo;
    }

    let name = root.querySelector("[data-name='name']");
    name.textContent = projectInfo.name;

    let description = root.querySelector("[data-name='description']");
    description.textContent = projectInfo.description;

    let licenses = root.querySelector("[data-name='lst-licenses']");
    insertItems(projectInfo.details?.licenses, "licenses", licenses);

    let docs = root.querySelector("[data-name='lst-docs']");
    insertItems(projectInfo.details?.docs, "docs", docs);

    let links = root.querySelector("[data-name='lst-links']");
    insertItems(projectInfo.details?.links, "links", links);
  });
}

function insertItems(items, type, list) {
  const isEmpty = !items;

  switch (type) {
    case "licenses":
      if (!isEmpty) {
        items.forEach((x) => {
          let item = template.queryById("item");
          let a = item.querySelector("a");
          a.textContent = x.identifier;
          a.href = x.url;
          list.appendChild(item);
        });
      } else {
        list.appendChild(template.queryById("empty-item"));
      }
      break;
    case "docs":
    case "links":
      if (!isEmpty) {
        items.forEach((x) => {
          let item = template.queryById("item");
          let a = item.querySelector("a");
          a.textContent = x.title ?? x.url;
          a.href = x.url;
          list.appendChild(item);
        });
      } else {
        list.appendChild(template.queryById("empty-item"));
      }
      break;
    default:
      break;
  }
}
