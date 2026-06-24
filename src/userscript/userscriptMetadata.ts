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

export const DEFAULT_USERSCRIPT_DOWNLOAD_URL =
  "https://www.johnsy.com/finish-funnel/finish-funnel.user.js";

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
// @name         Finish Funnel
// @description  Size a parkrun finish funnel for orderly finish token handover on results pages.
// @author       Pete Johns (@johnsyweb)
// @downloadURL  ${downloadUrl}
// @grant        none
// @homepage     https://www.johnsy.com/finish-funnel/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=parkrun.com.au
// @license      MIT
${matchLines}
// @namespace    https://www.johnsy.com/finish-funnel
// @run-at       document-end
// @tag          parkrun
// @supportURL   https://github.com/johnsyweb/parkrun-utilities/issues
// @updateURL    ${updateUrl}
// @version      ${version}
// ==/UserScript==`;
}
