export function readNumberInput(
  input: HTMLInputElement,
  fallback: number,
): number {
  const value = Number(input.value);
  return Number.isFinite(value) ? value : fallback;
}
