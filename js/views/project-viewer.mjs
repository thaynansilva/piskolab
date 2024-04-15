import { Template } from "../template.mjs";
import { Provider } from "../provider.mjs";

const template = new Template("/html/views/project-viewer.html")

export const ProjectViewerView = { build, parent: "projects" };

async function build(options) {
  let { projectUuid } = options;

  let projectInfo = await Provider.getProjectInfo(projectUuid);

  return await template.build((_, root) => {
    let name = root.querySelector("[data-name='name']");
    name.textContent = projectInfo.name;

    let description = root.querySelector("[data-name='description']");
    description.textContent = projectInfo.description;

    let status = root.querySelector("[data-name='status']");
    status.textContent = projectInfo.status;
    status.setAttribute("data-status", projectInfo.status);

    let logo = root.querySelector("[data-name='logo']");
    logo.src = (projectInfo.logo ?? "img/icons/project.svg");
  });
}
