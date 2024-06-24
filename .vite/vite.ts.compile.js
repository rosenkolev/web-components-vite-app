import * as ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';
import { gatherFileInPath, injectTextInHtmlPage } from './vite.core.js';

export function tsCompile(source, options) {
  // Default options -- you could also perform a merge, or use the project tsconfig.json
  if (null === options || typeof options === 'undefined') {
    options = { compilerOptions: { module: ts.ModuleKind.ES2022, moduleResolution: ts.ModuleResolutionKind.Bundler } };
  }
  return ts.transpileModule(source, options).outputText;
}

// // Make sure it works
// const source = "let foo: string  = 'bar'";

// let result = tsCompile(source);

// console.log(result); // var foo = 'bar';

const tsRegExp = /<script\s+type="text\/typescript">(.+?)(<\/script>)/gs;

/** @param options {{ path: string, at: 'head' | 'body' | 'body-pre', transpileDir: '' }} */
export function transpileTypescriptInHtml(options) {
  let config;
  return {
    name: 'transpile-typescript-in-html',
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        if (fs.existsSync(options.transpileDir)) {
          fs.rmSync(options.transpileDir, { recursive: true, force: true });
        }

        fs.mkdirSync(options.transpileDir);

        let main = '';
        gatherFileInPath(options.path, config.root, (buffer, pathToFile, ext) => {
          if (ext !== 'html') return '';
          console.log(pathToFile);
          const match = tsRegExp.exec(buffer.toString());
          if (match) {
            const source = match[1];
            const relativePath = path.relative(config.root, pathToFile).replace('.html', '');
            const transpilePath = path.resolve(options.transpileDir, relativePath + '.ts');
            const transpileDirPath = path.dirname(transpilePath);
            main += `/** @file: ${relativePath} */\n${tsCompile(source)}\n\n`;
            // fs.mkdirSync(transpileDirPath, { recursive: true });
            // fs.writeFileSync(transpilePath, source);
            // main += 'import "' + relativePath + '";\n';
          }
        });

        //fs.writeFileSync(path.resolve(options.transpileDir, 'main.ts'), main);
        //console.log(main);
        //const data = ts.transpileModule(main, { compilerOptions: { module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler }, reportDiagnostics: true, fileName: '.vite.obj/main.ts', }).outputText;
        return injectTextInHtmlPage(html, `<script>${main}</script>`, 'body');
      },
    },
  };
}
