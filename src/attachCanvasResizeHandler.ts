export function attachCanvasResizeHandler(
  target: Element,
  onResize: () => void,
): () => void {
  if (typeof ResizeObserver === "undefined") {
    return () => {};
  }

  const observer = new ResizeObserver(() => {
    onResize();
  });
  observer.observe(target);
  return () => observer.disconnect();
}
