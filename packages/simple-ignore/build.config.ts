import { defineBuildConfig } from "unbuild";

import packageJson from "./package.json";

const externals = Object.keys(packageJson.dependencies);

export default defineBuildConfig([
  {
    entries: [
      {
        builder: "rollup",
        input: "./src/index.ts",
      },
    ],
    rollup: {
      emitCJS: true,
    },
    externals,
    declaration: true,
  },
  {
    entries: [
      {
        builder: "rollup",
        input: "./src/cli.ts",
      },
    ],
    rollup: {
      emitCJS: true,
    },
    externals: ["../package.json"],
  },
]);
