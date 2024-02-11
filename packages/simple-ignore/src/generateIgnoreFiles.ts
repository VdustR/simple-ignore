import fastGlob from "fast-glob";
import fs from "fs-extra";
import objectInspect from "object-inspect";
import path from "pathe";
import * as R from "remeda";

import { defaultConfig } from "./defaultConfig";
import { gitignoreToDockerignore } from "./gitignoreToDockerignore";
import { guessEol } from "./guessEol";
import { nestIgnore } from "./nestIgnore";
import type { DeepPartialConfig, SingleConfig } from "./types";

async function generateIgnoreFiles(options?: DeepPartialConfig) {
  const mergedOptions: SingleConfig = R.merge(defaultConfig, options);
  const gitignorePath = path.join(mergedOptions.rootDir, ".gitignore");
  const gitignore = await fs.readFile(gitignorePath, "utf8");
  const eol = guessEol(gitignore);
  const linterIgnore =
    [
      gitignore,
      `${eol}# Additional rules from "generateIgnoreFiles"`,
      ...mergedOptions.linterIgnoreRules.map((rule) => rule),
    ].join(eol) + eol;

  const {
    dockerLinterIgnoreFiles,
    dockerRegularIgnoreFiles,
    linterIgnoreFiles,
    regularIgnoreFiles,
  } = (function computeFiles() {
    const dockerLinterIgnoreFiles: Array<string> = [];
    const dockerRegularIgnoreFiles: Array<string> = [];
    const linterIgnoreFiles: Array<string> = [];
    const regularIgnoreFiles: Array<string> = [];
    const allIgnoreFiles = R.uniq([
      ...mergedOptions.regularIgnoreFiles,
      ...mergedOptions.linterIgnoreFiles,
      ...mergedOptions.dockerignoreFiles,
    ]);
    allIgnoreFiles.forEach((file) => {
      if (mergedOptions.dockerignoreFiles.includes(file)) {
        if (mergedOptions.linterIgnoreFiles.includes(file)) {
          dockerLinterIgnoreFiles.push(file);
        } else {
          dockerRegularIgnoreFiles.push(file);
        }
        return;
      }
      if (mergedOptions.linterIgnoreFiles.includes(file)) {
        linterIgnoreFiles.push(file);
        return;
      }
      regularIgnoreFiles.push(file);
    });
    return {
      dockerLinterIgnoreFiles,
      dockerRegularIgnoreFiles,
      linterIgnoreFiles,
      regularIgnoreFiles,
    };
  })();

  const files: Record<string, string> = {};

  (function appendRootIgnoreFiles() {
    if (regularIgnoreFiles.length > 0) {
      const ignore = gitignore;
      regularIgnoreFiles.forEach((target) => {
        files[target] = ignore;
      });
    }
    if (linterIgnoreFiles.length > 0) {
      const ignore = linterIgnore;
      linterIgnoreFiles.forEach((target) => {
        files[target] = ignore;
      });
    }
    if (dockerRegularIgnoreFiles.length > 0) {
      const ignore = gitignoreToDockerignore(gitignore);
      dockerRegularIgnoreFiles.forEach((target) => {
        files[target] = ignore;
      });
    }
    if (dockerLinterIgnoreFiles.length > 0) {
      const ignore = gitignoreToDockerignore(linterIgnore);
      dockerLinterIgnoreFiles.forEach((target) => {
        files[target] = ignore;
      });
    }
  })();

  await (async function appendPackageIgnoreFiles() {
    const packagePaths = (
      await fastGlob("**/package.json", {
        cwd: mergedOptions.rootDir,
        ignore: ["**/node_modules/**", "package.json"],
      })
    ).map((packagePath) => path.dirname(packagePath));
    if (packagePaths.length === 0) return;
    for (const packagePath of packagePaths) {
      const ignore = nestIgnore(gitignore, packagePath);
      if (regularIgnoreFiles.length > 0) {
        regularIgnoreFiles.forEach((target) => {
          files[path.join(packagePath, target)] = ignore;
        });
      }
      if (linterIgnoreFiles.length > 0) {
        linterIgnoreFiles.forEach((target) => {
          files[path.join(packagePath, target)] = ignore;
        });
      }
      if (dockerRegularIgnoreFiles.length > 0) {
        const dockerIgnore = gitignoreToDockerignore(gitignore);
        dockerRegularIgnoreFiles.forEach((target) => {
          files[path.join(packagePath, target)] = dockerIgnore;
        });
      }
      if (dockerLinterIgnoreFiles.length > 0) {
        const dockerIgnore = gitignoreToDockerignore(linterIgnore);
        dockerLinterIgnoreFiles.forEach((target) => {
          files[path.join(packagePath, target)] = dockerIgnore;
        });
      }
    }
  })();

  if (mergedOptions.dry) {
    // eslint-disable-next-line no-console -- Dry run
    console.info(
      "Dry run, no files were written",
      objectInspect(files, {
        indent: 2,
      }),
    );
    return;
  }

  await Promise.all(
    Object.entries(files).map(async ([target, content]) => {
      const targetPath = path.join(mergedOptions.rootDir, target);
      await fs.writeFile(targetPath, content, "utf8");
    }),
  );
}

export { generateIgnoreFiles };
