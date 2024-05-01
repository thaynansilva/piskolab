/*
 * Pisko Lab - Personal website
 * Copyright (C) Thaynan Silva
 *
 * SPDX-License-Identifier: LGPL-3.0
 */

import { Text } from "./Text.mjs";

/**
 * DocJSON parser
 */
export const DocJSON = {

  /**
   * Parses DocJSON into HTML.
   *
   * @param {{}[]} data
   *  the json
   * @returns {Promise<string>}
   */
  parse(data) {
    return parseNodes(data);
  }
};

/**
 * Selects properties from a node and
 * wraps then into an object.
 *
 * @param {{}} node
 *  target node
 * @param {{}} prefix
 *  pre-defined properties
 * @param  {...string} what
 * @returns {{}}
 */
function getNodeProperties(node, prefix, ...what) {
  return Object.fromEntries([
    ...Object.entries(node).filter(v => what.includes(v[0])),
    ...Object.entries(prefix)
  ]);
}

function parseNode(n) {

  const rules = {
    h1(n) {
      let attrs = getNodeProperties(n, {}, "style");
      let props = getNodeProperties(n, {}, "stripBlank", "text", "lines", "children");
      return compose("h1", attrs, props, true);
    },
    h2(n) {
      let attrs = getNodeProperties(n, {}, "style");
      let props = getNodeProperties(n, {}, "stripBlank", "text", "lines", "children");
      return compose("h2", attrs, props, true);
    },
    h3(n) {
      let attrs = getNodeProperties(n, {}, "style");
      let props = getNodeProperties(n, {}, "stripBlank", "text", "lines", "children");
      return compose("h3", attrs, props, true);
    },
    h4(n) {
      let attrs = getNodeProperties(n, {}, "style");
      let props = getNodeProperties(n, {}, "stripBlank", "text", "lines", "children");
      return compose("h4", attrs, props, true);
    },
    h5(n) {
      let attrs = getNodeProperties(n, {}, "style");
      let props = getNodeProperties(n, {}, "stripBlank", "text", "lines", "children");
      return compose("h5", attrs, props, true);
    },
    h6(n) {
      let attrs = getNodeProperties(n, {}, "style");
      let props = getNodeProperties(n, {}, "stripBlank", "text", "lines", "children");
      return compose("h6", attrs, props, true);
    },
    group(n) {
      let attrs = getNodeProperties(n, {}, "style");
      let props = getNodeProperties(n, {}, "stripBlank", "text", "lines", "children");
      return compose("div", attrs, props, true);
    },
    paragraph(n) {
      let attrs = getNodeProperties(n, {}, "style");
      let props = getNodeProperties(n, {}, "stripBlank", "text", "lines", "children");
      return compose("p", attrs, props, true);
    },
    link(n) {
      let attrs = getNodeProperties(n, {}, "style", "href", "openInNew", "block");
      let props = getNodeProperties(n, {}, "text", "lines", "children", "overlay");
      return compose("a", attrs, props, true);
    },
    image(n) {
      let attrs = getNodeProperties(n, { draggable: false }, "src", "alt");
      return compose("img", attrs);
    },
    span(n) {
      let attrs = getNodeProperties(n, {}, "style");
      let props = getNodeProperties(n, {}, "text");
      return compose("span", attrs, props, true);
    },
    list(n) {
      let attrs = getNodeProperties(n, {}, "style");
      let props = getNodeProperties(n, {}, "children");
      return compose("ul", attrs, props, true);
    },
    listitem(n) {
      let attrs = getNodeProperties(n, {}, "style", "classes");
      let props = getNodeProperties(n, {}, "text", "lines", "children");
      return compose("li", attrs, props, true);
    },
    quote(n) {
      let attrs = getNodeProperties(n, {}, "cite");
      let props = getNodeProperties(n, {}, "stripBlank", "text", "children");
      return compose("q", attrs, props, true);
    },
    blockquote(n) {
      let attrs = getNodeProperties(n, {}, "cite");
      let props = getNodeProperties(n, {}, "stripBlank", "text", "lines", "children");
      return compose("blockquote", attrs, props, true);
    },
    code(n) {
      let props = getNodeProperties(n, {}, "text", "lines", "children");
      return compose("code", {}, props, true);
    },
    blockcode(n) {
      let attrs = getNodeProperties(n, { block: true }, "language", "highlight");
      let props = getNodeProperties(n, { verticalScroll: true }, "text", "lines", "children");
      return compose("code", attrs, props, true);
    },
    table(n) {
      let props = getNodeProperties(n, { verticalScroll: true }, "caption", "head", "body");
      return compose("table", {}, props, true);
    }
  };

  if (!(n.type in rules)) {
    return `<p>${Text.escape(JSON.stringify(n))}</p>`;
  }

  return rules[n.type](n);
}

function parseNodes(nodes) {
  if (!nodes) {
    return "";
  }

  let strNodes = [];

  for (let n of nodes) {
    strNodes.push(parseNode(n));
  }

  return strNodes.join("");
}

/**
 * Composes an HTML tag.
 *
 * @param {string} tag
 *  tag name
 * @param {{}} attrs
 *  tag attributes
 * @param {{
 *  text?: string,
 *  lines?: string[],
 *  children?: DocNode[],
 *  head?: DocNode[],
 *  body?: DocNode[],
 *  stripBlank?: boolean,
 *  openInNew?: boolean,
 *  verticalScroll?: boolean,
 *  overlay: {
 *    text: string,
 *    icon: string,
 *  }
 * }} props
 *  tag properties
 * @returns {string}
 */
function compose(tag, attrs={}, props={}, closable=false) {
  let hasAnyContent = (
    props.caption || props.head  || props.body ||
    props.text    || props.lines ||
    props.children
  );

  let result = "";
  let compAttrs = composeAttributes(attrs);

  if (closable || hasAnyContent) {
    result += `<${tag} ${compAttrs}>${composeContent(props)}`;
    if (props.overlay) {
      result += composeOverlay(props.overlay);
    }
    result += `</${tag}>`;
  } else {
    result += `<${tag} ${compAttrs}/>`;
  }

  if (props.verticalScroll) {
    result = `<div class="meta-scrolled-window">${result}</div>`
  }

  if (!props.stripBlank) {
    result += "\n";
  }

  return result;
}

function composeAttributes(attrs) {
  if (attrs === null || attrs === undefined) {
    console.debug("Null input passed. Ignoring.");
    return "";
  }

  if (typeof(attrs) !== "object") {
    console.debug(`Invalid input type '${typeof(attrs)}'. Ignoring.`);
    return "";
  }

  let tmp = [];

  for (let [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined) {
      continue;
    }

    switch (k) {
      case "id":
      case "alt":
      case "src":
      case "cite":
      case "href":
        tmp.push(`${k}="${Text.escape(v)}"`);
        break;
      case "style":
        let classes = v.map(t => `style-${t}`).join(" ");
        tmp.push(`class="${classes}"`);
        break;
      case "language":
        tmp.push(`data-language="${Text.escape(v)}"`);
        break;
      case "draggable":
        let d = (typeof(v) === "boolean" && v);
        tmp.push(`draggable="${d}"`);
      case "openInNew":
        tmp.push("target='_blank'");
        break;
      case "highlight":
        tmp.push("data-hightlight");
        break;
      case "block":
        tmp.push("data-block");
        break;
      default:
        console.debug(`Attribute '${k}' is invalid.`);
        break;
    }
  }

  return tmp.join(" ");
}

/**
 * Composes the content of for a tag.
 *
 * @param {string} tag
 * @param {string|string[]|{}} content
 *  the content
 * @returns {string}
 */
function composeContent(content) {
  if (content.text || content.lines) {
    return processText(content.text ?? content.lines);
  } else if (content.children) {
    return parseNodes(content.children);
  } else if (content.caption || content.head || content.body) {
    return makeTable(content.caption, content.head, content.body);
  } else {
    console.debug(`No valid content provided: ${Object.keys(content)}`);
  }
}

function composeOverlay(overlay) {
  if (!overlay) {
    return "";
  }

  const icons = {
    "link": "img/icons/link.svg",
    "external-link": "img/icons/open-in-new.svg",
  };

  let result = "<div>";

  if (overlay.label) {
    result += `<span>${overlay.label}</span>`;
  }

  if (overlay.icon && icons[overlay.icon]) {
    result += `<embed-svg src='${icons[overlay.icon]}'></embed-svg>`;
  }

  result += "</div>"

  return `<div class='meta-overlay'>${result}</div>`;
}

function processText(text) {
  if (typeof(text) === "string") {
    return Text.escape(text);
  } else if (text instanceof Array) {
    return Text.escapeLines(text).join("\n");
  } else {
    console.debug(`Invalid content type: ${Object.getPrototypeOf(text)}`);
  }
}

function makeTable(caption, head, body) {
  let table = ""

  if (caption) {
    table += `<caption>${caption}</caption>`;
  }

  if (head) {
    table += "<thead>";
    for (let row of head) {
      table += "<tr>";
      for (let cell of row) {
        table += `<th>${Text.escape(cell.toString())}</th>`;
      }
      table += "</tr>"
    }
    table += "</thead>";
  }

  if (body) {
    table += "<tbody>";
    for (let row of body) {
      table += "<tr>";
      for (let cell of row) {
        table += `<td>${Text.escape(cell.toString())}</td>`;
      }
      table += "</tr>"
    }
    table += "</tbody>";
  }

  return table;
}
