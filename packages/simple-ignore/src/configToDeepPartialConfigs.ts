import type { Config, DeepPartialConfig } from "./types";

async function configToDeepPartialConfigs(
  config: Config,
): Promise<Array<DeepPartialConfig>> {
  return (
    await Promise.all(
      (Array.isArray(config) ? config : [config]).map((c) =>
        typeof c === "function" ? c() : c,
      ),
    )
  ).flat();
}

export { configToDeepPartialConfigs };
