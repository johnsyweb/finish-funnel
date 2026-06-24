import { describe, expect, it } from "vitest";
import {
  buildUserscriptMetadata,
  PARKRUN_RESULTS_MATCHES,
} from "../userscript/userscriptMetadata";
import {
  DEFAULT_USERSCRIPT_DOWNLOAD_URL,
  SCREENSHOT_REFERENCE_URL,
  SUPPORT_URL,
  USERSCRIPT_NAME,
} from "../siteConstants";

describe("buildUserscriptMetadata", () => {
  it("includes Tampermonkey headers and parkrun results matches", () => {
    const metadata = buildUserscriptMetadata({ version: "1.2.3" });

    expect(metadata.startsWith("// ==UserScript==")).toBe(true);
    expect(metadata).toContain("// ==/UserScript==");
    expect(metadata).toContain(`// @name         ${USERSCRIPT_NAME}`);
    expect(metadata).toContain("// @author       Pete Johns (@johnsyweb)");
    expect(metadata).toContain("// @grant        none");
    expect(metadata).toContain("// @run-at       document-end");
    expect(metadata).toContain("// @version      1.2.3");
    expect(metadata).toContain(
      `// @downloadURL  ${DEFAULT_USERSCRIPT_DOWNLOAD_URL}`,
    );
    expect(metadata).toContain(`// @supportURL   ${SUPPORT_URL}`);
    expect(metadata).toContain(
      `// @screenshot-url       ${SCREENSHOT_REFERENCE_URL}`,
    );

    for (const match of PARKRUN_RESULTS_MATCHES) {
      expect(metadata).toContain(`// @match        ${match}`);
    }
  });
});
