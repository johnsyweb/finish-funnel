export function attachCanvasResizeHandler(
  target: Element,
  onResize: () => void,
): () => void {
  const observer = new ResizeObserver(() => {
    onResize();
  });
  observer.observe(target);
  return () => observer.disconnect();
}
