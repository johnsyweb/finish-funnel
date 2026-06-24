import { describe, expect, it } from "vitest";
import {
  buildUserscriptMetadata,
  PARKRUN_RESULTS_MATCHES,
} from "../userscript/userscriptMetadata";

describe("buildUserscriptMetadata", () => {
  it("includes Tampermonkey headers and parkrun results matches", () => {
    const metadata = buildUserscriptMetadata({ version: "1.2.3" });

    expect(metadata.startsWith("// ==UserScript==")).toBe(true);
    expect(metadata).toContain("// ==/UserScript==");
    expect(metadata).toContain("// @name         Finish Funnel");
    expect(metadata).toContain("// @author       Pete Johns (@johnsyweb)");
    expect(metadata).toContain("// @grant        none");
    expect(metadata).toContain("// @run-at       document-end");
    expect(metadata).toContain("// @version      1.2.3");
    expect(metadata).toContain(
      "// @downloadURL  https://www.johnsy.com/finish-funnel/finish-funnel.user.js",
    );

    for (const match of PARKRUN_RESULTS_MATCHES) {
      expect(metadata).toContain(`// @match        ${match}`);
    }
  });
});
