import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig, type Plugin } from "vite";
import { buildUserscriptMetadata } from "./src/userscript/userscriptMetadata";

const packageJson = JSON.parse(
  readFileSync(resolve(__dirname, "package.json"), "utf8"),
) as { version: string };

const userscriptBanner = buildUserscriptMetadata({
  version: packageJson.version,
});

function prependUserscriptBanner(banner: string): Plugin {
  return {
    name: "prepend-userscript-banner",
    generateBundle(_options, bundle) {
      for (const file of Object.values(bundle)) {
        if (file.type === "chunk" && file.fileName.endsWith(".user.js")) {
          file.code = `${banner}\n\n${file.code}`;
        }
      }
    },
  };
}

export default defineConfig({
  plugins: [prependUserscriptBanner(userscriptBanner)],
  build: {
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, "src/userscript/entry.ts"),
      formats: ["iife"],
      name: "FinishFunnelUserscript",
      fileName: () => "finish-funnel.user.js",
    },
    outDir: "dist",
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
