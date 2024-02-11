#!/usr/bin/env node

import process from "node:process";

import { Command } from "commander";
import { cosmiconfig } from "cosmiconfig";
import path from "pathe";
import * as R from "remeda";

import packageJson from "../package.json";
import { generateIgnoreFiles } from ".";
import { configToDeepPartialConfigs } from "./configToDeepPartialConfigs";
import { defaultConfig } from "./defaultConfig";
import type { DeepPartialConfig, SingleConfig } from "./types";

const program = new Command();

const cwd = process.cwd();

const moduleName = packageJson.name;

function stringArgvToArr(str: string): Array<string> {
  return str
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

(async function main() {
  await program
    .name(packageJson.name)
    .description(packageJson.description)
    .version(packageJson.version)
    .option("-d, --dry", "Dry run", defaultConfig.dry)
    .option("-c, --config <path>", "Configuration file path")
    .option("-r, --root-dir <path>", "Root directory")
    .option("-lr, --linter-ignore-rules <rules>", "Linter ignore rules")
    .option("-ri, --regular-ignore-files <files>", "Regular ignore files")
    .option("-li, --linter-ignore-files <files>", "Linter ignore files")
    .option("-di, --docker-ignore-files <files>", "Docker ignore files")
    .parseAsync();

  const options: {
    dry: boolean;
    config?: string;
    rootDir?: string;
    linterIgnoreRules?: string;
    regularIgnoreFiles?: string;
    linterIgnoreFiles?: string;
    dockerIgnoreFiles?: string;
  } = program.opts();

  const configs: Array<DeepPartialConfig> = await (async function getConfig() {
    const explorer = cosmiconfig(moduleName, {
      searchStrategy: "global",
    });
    const cosmiconfigResult = options.config
      ? await explorer.load(path.resolve(cwd, options.config))
      : await explorer.search();
    const rootDir: DeepPartialConfig["rootDir"] = options.rootDir
      ? path.resolve(cwd, options.rootDir)
      : cosmiconfigResult
        ? path.dirname(cosmiconfigResult.filepath)
        : undefined;
    const configs: Array<DeepPartialConfig> =
      await (async function computeConfig() {
        const configs: Array<DeepPartialConfig> = !cosmiconfigResult
          ? [{}]
          : await configToDeepPartialConfigs(cosmiconfigResult.config);
        const overrideConfig: Partial<SingleConfig> = {
          ...(!options.dry ? {} : { dry: options.dry }),
          ...(!rootDir ? {} : { rootDir }),
          ...(!options.linterIgnoreRules
            ? {}
            : {
                linterIgnoreRules: stringArgvToArr(options.linterIgnoreRules),
              }),
          ...(!options.regularIgnoreFiles
            ? {}
            : {
                regularIgnoreFiles: stringArgvToArr(options.regularIgnoreFiles),
              }),
          ...(!options.linterIgnoreFiles
            ? {}
            : {
                linterIgnoreFiles: stringArgvToArr(options.linterIgnoreFiles),
              }),
          ...(!options.dockerIgnoreFiles
            ? {}
            : {
                dockerIgnoreFiles: stringArgvToArr(options.dockerIgnoreFiles),
              }),
        };
        return configs.map((c) => R.merge(c, overrideConfig));
      })();
    return configs;
  })();
  for (const config of configs) {
    await generateIgnoreFiles(config);
  }
})().catch((error) => {
  console.error(error);
  throw error;
});
