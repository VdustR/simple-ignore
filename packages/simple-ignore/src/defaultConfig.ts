import process from "node:process";

import type { SingleConfig } from "./types";

const defaultConfig: SingleConfig = {
  dry: false,
  rootDir: process.cwd(),
  linterIgnoreRules: [
    "__snapshots__",
    "/package-lock.json",
    "/pnpm-lock.yaml",
    "/yarn.lock",
    "CHANGELOG.md",
  ],
  regularIgnoreFiles: [],
  linterIgnoreFiles: [
    ".stylelintignore",
    ".eslintignore",
    ".prettierignore",
    ".markdownlintignore",
  ],
  dockerignoreFiles: [".dockerignore"],
};

export { defaultConfig };
