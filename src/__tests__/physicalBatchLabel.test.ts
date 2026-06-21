import { describe, expect, it } from "vitest";
import {
  physicalBatchLabelForIndex,
  physicalBatchSortIndex,
} from "../physicalBatchLabel";

describe("physicalBatchLabelForIndex", () => {
  it("names batches A through Z then AA, AB, AC", () => {
    expect(physicalBatchLabelForIndex(0)).toBe("A");
    expect(physicalBatchLabelForIndex(25)).toBe("Z");
    expect(physicalBatchLabelForIndex(26)).toBe("AA");
    expect(physicalBatchLabelForIndex(27)).toBe("AB");
    expect(physicalBatchLabelForIndex(28)).toBe("AC");
  });
});

describe("physicalBatchSortIndex", () => {
  it("orders unnamed before named batches and AA after Z", () => {
    expect(physicalBatchSortIndex("unnamed")).toBeLessThan(
      physicalBatchSortIndex("A"),
    );
    expect(physicalBatchSortIndex("Z")).toBeLessThan(
      physicalBatchSortIndex("AA"),
    );
    expect(physicalBatchSortIndex("AA")).toBeLessThan(
      physicalBatchSortIndex("AB"),
    );
  });
});
