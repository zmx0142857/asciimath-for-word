/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

/* globals Word Office console, window */

import $, { appendChildren } from "../utils/ui";
import XslTransform from "../utils/xsl-transform";
import asciimath from "asciimath-js";
import katex from "katex";

const xslTransform = new XslTransform("/MML2OMML.xsl", "/math-template.xml");

function run(fn) {
  return () => {
    Word.run(async (e) => {
      e.body = e.document.body;
      await fn(e);
      e.sync();
    }).catch(console.error);
  };
}

async function insertMath() {
  const am = $("#input").value;
  const mathml = asciimath.am2mathml(am);
  mathml.setAttribute("xmlns", "http://www.w3.org/1998/Math/MathML");
  // console.log(mathml.outerHTML);
  const ooxml = await xslTransform.mathml2ooxml(mathml.outerHTML);
  // console.log(ooxml);
  Office.context.document.setSelectedDataAsync(ooxml, {
    coercionType: "ooxml",
  });
}

function onInput() {
  if (this.timer) {
    window.clearTimeout(this.timer);
  }
  this.timer = window.setTimeout(() => {
    const am = $("#input").value;
    const tex = asciimath.am2tex(am);
    const node = $("#render");
    node.classList.remove("katex-error");
    // console.log(tex);
    try {
      katex.render(tex, node);
    } catch (e) {
      node.classList.add("katex-error");
      node.innerText = e.message;
      console.error(am, e);
    }
  }, 500);
}

// async function getSelection() {
//   Office.context.document.getSelectedDataAsync(
//     "ooxml", // coercionType
//     {
//       valueFormat: "unformatted", // valueFormat
//       filterType: "all",
//     }, // filterType
//     (res) => {
//       console.log(res.value);
//     }
//   );
// }

Office.onReady((info) => {
  if (info.host !== Office.HostType.Word) return;
  if (!Office.context.requirements.isSetSupported("WordApi", "1.3")) {
    return console.log("Sorry. The add-in is not available in your version of Office.");
  }
  $("#input").oninput = onInput;
  appendChildren($("#btn-group"), [
    $("<button>", {
      className: "ms-Button",
      innerText: "Insert Math",
      onclick: run(insertMath),
    }),
    // $("<button>", {
    //   className: "ms-Button",
    //   innerText: "Get Selection",
    //   onclick: run(getSelection),
    // }),
  ]);
});
