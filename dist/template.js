"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.zrestTraceTemplate = exports.templateSrest = exports.measureCue = exports.templateForFPS = exports.template = exports.timestampLabel = exports.hookDomain = void 0;
const react_1 = __importDefault(require("react"));
exports.hookDomain = "http://screenshotrequest.clo";
exports.timestampLabel = "closet viewer benchmark";
const template = (libURL, modelURLs) => (react_1.default.createElement("div", null,
    react_1.default.createElement("div", { id: "target", style: {
            width: 512,
            height: 512,
        } }),
    react_1.default.createElement("script", { type: "text/javascript", src: libURL.toString() }),
    react_1.default.createElement("script", { dangerouslySetInnerHTML: {
            __html: `
    closet.viewer.init({
        element: 'target',
        width: 512,
        height: 512,
        stats: true
    });
      
      
      function recursion(urls) {
          if (urls.length == 0) {
              fetch("${exports.hookDomain}", {method: 'DELETE',})
          } else {
              closet.viewer.loadZrestUrl(urls[0], function(x){}, function(x){
                  fetch("${exports.hookDomain}", { method: "POST", body: "${exports.measureCue}"});
                  recursion(urls.slice(1))
              })
          }
      }
      
      recursion([
      ${modelURLs.map(x => `"` + x.toString() + `"`).join(", ")}
      ])
    `,
        } })));
exports.template = template;
const templateForFPS = (libURL, modelURL, secInMS, viewWidth, viewHeight) => (react_1.default.createElement("div", null,
    react_1.default.createElement("div", { id: "target", style: { width: 512, height: 512 } }),
    react_1.default.createElement("script", { type: "text/javascript", src: libURL.toString() }),
    react_1.default.createElement("script", { dangerouslySetInnerHTML: {
            __html: `
    closet.viewer.init({
        element: 'target',
        width: 512,
        height: 512,
        stats: true
    });
    closet.viewer.loadZrestUrl(${'"' + modelURL.toString() + '"'}, function(x){}, function(x){
     closet.viewer.countFPSTurning(${secInMS}, ${viewWidth}, ${viewHeight}).then(fps=>{
        fetch("http://screenshotrequest.clo", {method: 'PUT', body: JSON.stringify({fps})})
      })
    })
    `,
        } })));
exports.templateForFPS = templateForFPS;
exports.measureCue = "measure cue";
function makeRecursiveTemplateJSCode(srests) {
    if (srests.length === 0) {
        return `fetch("${exports.hookDomain}", { method: "DELETE", });`;
    }
    else {
        return `
        console.log("SREST BENCHMARKICB START!!", ${srests.length})
        closet.viewer.loadSeparatedZRest(${JSON.stringify(srests[0])}, (x)=>{}, 0, ()=>{
          fetch("${exports.hookDomain}", { method: "POST", body: "${exports.measureCue}"});
          console.timeStamp("${exports.timestampLabel}")
          ${makeRecursiveTemplateJSCode(srests.slice(1))}
        })`;
    }
}
function makeTemplateJSCode(libURL, srests) {
    const initCode = `closet.viewer.init({
  element: "target",
  width: 512,
  height: 512,
  stats: true,
});`;
    return initCode + makeRecursiveTemplateJSCode(srests);
}
const templateSrest = (libURL, srests) => (react_1.default.createElement("div", null,
    react_1.default.createElement("div", { id: "target", style: { width: 512, height: 512 } }),
    react_1.default.createElement("script", { type: 'text/javascript', src: libURL.toString() }),
    react_1.default.createElement("script", { dangerouslySetInnerHTML: { __html: makeTemplateJSCode(libURL, srests) } })));
exports.templateSrest = templateSrest;
const zrestTraceTemplate = (libURL, zrestURL) => (react_1.default.createElement("div", null,
    react_1.default.createElement("div", { id: "target", style: {
            width: 512,
            height: 512,
        } }),
    react_1.default.createElement("script", { type: "text/javascript", src: libURL.toString() }),
    react_1.default.createElement("script", { dangerouslySetInnerHTML: {
            __html: `
    closet.viewer.init({
        element: 'target',
        width: 512,
        height: 512,
        stats: true
    });
      closet.viewer.loadZrestUrl("${zrestURL.toString()}", function(x){}, function(x){
                  fetch("${exports.hookDomain}", {method: 'PUT',})
    })
    `,
        } })));
exports.zrestTraceTemplate = zrestTraceTemplate;
