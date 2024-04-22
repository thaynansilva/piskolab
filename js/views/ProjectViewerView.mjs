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
    let name = root.querySelector("[data-name='name']");
    name.textContent = projectInfo.name;

    let description = root.querySelector("[data-name='description']");
    description.textContent = projectInfo.description;

    let status = root.querySelector("[data-name='status']");
    status.textContent = projectInfo.status;
    status.setAttribute("data-status", projectInfo.status);

    let logo = root.querySelector("[data-name='logo']");
    logo.src = projectInfo.logo ?? "img/icons/project.svg";
  });
}
