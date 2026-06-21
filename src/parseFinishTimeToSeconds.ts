export function parseFinishTimeToSeconds(timeText: string): number | null {
  const trimmed = timeText.trim();
  if (!trimmed || trimmed.toLowerCase() === "unknown") {
    return null;
  }

  const hourMatch = trimmed.match(/^(\d+):(\d+):(\d+)$/);
  if (hourMatch) {
    const hours = Number(hourMatch[1]);
    const minutes = Number(hourMatch[2]);
    const seconds = Number(hourMatch[3]);
    return hours * 3600 + minutes * 60 + seconds;
  }

  const minuteMatch = trimmed.match(/^(\d+):(\d+)$/);
  if (!minuteMatch) {
    return null;
  }

  const minutes = Number(minuteMatch[1]);
  const seconds = Number(minuteMatch[2]);
  return minutes * 60 + seconds;
}
