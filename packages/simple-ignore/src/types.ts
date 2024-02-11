import type { O } from "ts-toolbelt";

interface SingleConfig {
  dry: boolean;
  rootDir: string;
  linterIgnoreRules: Array<string>;
  regularIgnoreFiles: Array<string>;
  linterIgnoreFiles: Array<string>;
  dockerignoreFiles: Array<string>;
}

type DeepPartialConfig = O.Partial<SingleConfig, "deep">;

type Config =
  | DeepPartialConfig
  | Array<DeepPartialConfig>
  | Promise<DeepPartialConfig>
  | (() =>
      | DeepPartialConfig
      | Array<DeepPartialConfig>
      | Promise<DeepPartialConfig>);

export type { Config, DeepPartialConfig, SingleConfig };
