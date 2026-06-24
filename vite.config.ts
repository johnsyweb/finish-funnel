import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig, type Plugin } from "vite";
import { buildLandingPageHeadMarkup } from "./src/buildLandingPageHeadMarkup";

const packageJson = JSON.parse(
  readFileSync(resolve(__dirname, "package.json"), "utf8"),
) as { version: string };

const buildDate = new Date().toISOString().slice(0, 10);
const headMarkup = buildLandingPageHeadMarkup({ version: packageJson.version });

function injectLandingHeadPlugin(): Plugin {
  return {
    name: "inject-landing-head",
    transformIndexHtml(html) {
      return html.replace(
        /<head>[\s\S]*?<\/head>/,
        `<head>\n    ${headMarkup}\n  </head>`,
      );
    },
  };
}

export default defineConfig({
  plugins: [injectLandingHeadPlugin()],
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
    __APP_BUILD_DATE__: JSON.stringify(buildDate),
  },
  test: {
    environment: "node",
  },
});
