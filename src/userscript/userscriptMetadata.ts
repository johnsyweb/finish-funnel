import {
  DEFAULT_USERSCRIPT_DOWNLOAD_URL,
  SCREENSHOT_REFERENCE_URL,
  SITE_HOMEPAGE,
  SUPPORT_URL,
  USERSCRIPT_DESCRIPTION,
  USERSCRIPT_NAME,
} from "../siteConstants";

export { DEFAULT_USERSCRIPT_DOWNLOAD_URL } from "../siteConstants";

export const PARKRUN_RESULTS_MATCHES = [
  "*://www.parkrun.ca/*/results/*",
  "*://www.parkrun.co.at/*/results/*",
  "*://www.parkrun.co.nl/*/results/*",
  "*://www.parkrun.co.nz/*/results/*",
  "*://www.parkrun.co.za/*/results/*",
  "*://www.parkrun.com.au/*/results/*",
  "*://www.parkrun.com.de/*/results/*",
  "*://www.parkrun.dk/*/results/*",
  "*://www.parkrun.fi/*/results/*",
  "*://www.parkrun.fr/*/results/*",
  "*://www.parkrun.ie/*/results/*",
  "*://www.parkrun.it/*/results/*",
  "*://www.parkrun.jp/*/results/*",
  "*://www.parkrun.lt/*/results/*",
  "*://www.parkrun.my/*/results/*",
  "*://www.parkrun.no/*/results/*",
  "*://www.parkrun.org.uk/*/results/*",
  "*://www.parkrun.pl/*/results/*",
  "*://www.parkrun.se/*/results/*",
  "*://www.parkrun.sg/*/results/*",
  "*://www.parkrun.us/*/results/*",
] as const;

export function buildUserscriptMetadata({
  version,
  downloadUrl = DEFAULT_USERSCRIPT_DOWNLOAD_URL,
  updateUrl = downloadUrl,
}: {
  version: string;
  downloadUrl?: string;
  updateUrl?: string;
}): string {
  const matchLines = PARKRUN_RESULTS_MATCHES.map(
    (match) => `// @match        ${match}`,
  ).join("\n");

  return `// ==UserScript==
// @name         ${USERSCRIPT_NAME}
// @description  ${USERSCRIPT_DESCRIPTION}
// @author       Pete Johns (@johnsyweb)
// @downloadURL  ${downloadUrl}
// @grant        none
// @homepage     ${SITE_HOMEPAGE}
// @icon         https://www.google.com/s2/favicons?sz=64&domain=parkrun.com.au
// @license      MIT
${matchLines}
// @namespace    ${SITE_HOMEPAGE}
// @run-at       document-end
// @tag          parkrun
// @supportURL   ${SUPPORT_URL}
// @screenshot-url       ${SCREENSHOT_REFERENCE_URL}
// @screenshot-selector  #finish-funnel-panel
// @screenshot-timeout   12000
// @screenshot-viewport  1200x800
// @updateURL    ${updateUrl}
// @version      ${version}
// ==/UserScript==`;
}
