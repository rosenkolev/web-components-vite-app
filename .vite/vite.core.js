import fs from "node:fs";
import path from "node:path";

export function gatherFileInPath(filePaths, rootPath, getContent) {
  const isDirectory = filePaths.endsWith("/") || !filePaths.split("/").pop().includes(".");
  const basePath = isDirectory ? path.resolve(rootPath, filePaths) : rootPath;
  const files = isDirectory ? fs.readdirSync(basePath) : [filePaths];
  const filesContent = files.map((file) => {
    const pathToFile = path.resolve(basePath, file);
    const buffer = fs.readFileSync(pathToFile);
    const ext = file.split('.').pop();
    return { file, path: pathToFile, ext, content: getContent(buffer, pathToFile, ext) };
  });

  return filesContent;
}

export function injectTextInHtmlPage(html, data, at) {
  switch (at) {
    case 'head':
      return html.replace('</head>', `${data}\n</head>`);
    case 'body':
      return html.replace('</body>', `${data}\n</body>`);
    case 'body-pre':
      return html.replace('<body>', `<body>\n${data}`);
  }
}