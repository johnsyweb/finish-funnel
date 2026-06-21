export function physicalBatchLabelForIndex(index: number): string {
  let label = "";
  let remaining = index;

  while (remaining >= 0) {
    label =
      String.fromCodePoint("A".codePointAt(0)! + (remaining % 26)) + label;
    remaining = Math.floor(remaining / 26) - 1;
  }

  return label;
}

export function physicalBatchSortIndex(label: string): number {
  if (label === "unnamed") {
    return -1;
  }

  let index = 0;

  for (const character of label) {
    index = index * 26 + (character.codePointAt(0)! - "A".codePointAt(0)! + 1);
  }

  return index - 1;
}
