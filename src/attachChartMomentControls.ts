import {
  momentSecondsFromClientX,
  nudgeSelectedMoment,
  type ChartTimeRange,
} from "./chartMomentMapping";

export type AttachChartMomentControlsInput = {
  canvas: HTMLCanvasElement;
  getRange: () => ChartTimeRange;
  getMoment: () => number;
  onMomentChange: (momentSeconds: number) => void;
};

export function attachChartMomentControls({
  canvas,
  getRange,
  getMoment,
  onMomentChange,
}: AttachChartMomentControlsInput): () => void {
  let dragging = false;

  const updateFromClientX = (clientX: number) => {
    onMomentChange(momentSecondsFromClientX(clientX, canvas, getRange()));
  };

  const onPointerDown = (event: MouseEvent) => {
    dragging = true;
    updateFromClientX(event.clientX);
  };

  const onPointerMove = (event: MouseEvent) => {
    if (!dragging) {
      return;
    }

    updateFromClientX(event.clientX);
  };

  const stopDragging = () => {
    dragging = false;
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
      return;
    }

    event.preventDefault();
    const deltaSeconds = event.key === "ArrowLeft" ? -1 : 1;
    onMomentChange(nudgeSelectedMoment(getMoment(), deltaSeconds, getRange()));
  };

  canvas.addEventListener("mousedown", onPointerDown);
  canvas.addEventListener("mousemove", onPointerMove);
  window.addEventListener("mouseup", stopDragging);
  canvas.addEventListener("mouseleave", stopDragging);
  canvas.addEventListener("keydown", onKeyDown);

  return () => {
    canvas.removeEventListener("mousedown", onPointerDown);
    canvas.removeEventListener("mousemove", onPointerMove);
    window.removeEventListener("mouseup", stopDragging);
    canvas.removeEventListener("mouseleave", stopDragging);
    canvas.removeEventListener("keydown", onKeyDown);
  };
}
