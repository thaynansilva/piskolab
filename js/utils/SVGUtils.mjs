/*
 * Pisko Lab - Personal website
 * Copyright (C) Thaynan Silva
 *
 * SPDX-License-Identifier: LGPL-3.0
 */

export const SVGUtils = Object.freeze({

  /**
   * Removes potentially unsafe nodes
   * from the given document.
   *
   * The potentially unsafe nodes include:
   * - Script tags;
   * - Inline scripts;
   * - Event attributes;
   * - Anchors (tag: `<a>`);
   * - External resources (tag: `<link>`).
   *
   * **NOTE**: this sanitizer does not prevent
   * SVG documents from importing external
   * CSS files. For that, make sure to use
   * CSP (Content Security Policy) rules.
   *
   * @param {XMLDocument} doc
   */
  sanitize(doc) {
    doc.querySelectorAll("*").forEach((node) => {
      if (node.tagName == "script") {
        node.remove();
      } else if (node.tagName == "link") {
        node.remove();
      } else if (node.tagName == "a") {
        node.attributes.removeNamedItem("href");
      } else {
        for (let attr of node.attributes) {
          if (attr.name.startsWith("on")) {
            node.attributes.removeNamedItem(attr.name);
          }
        }
      }
    });
  }
});
