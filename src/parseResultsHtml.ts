export type ParsedFinisher = {
  position: number;
  name: string;
  time: string;
};

export function parseResultsHtml(html: string): ParsedFinisher[] {
  const rowPattern = /<tr class="Results-table-row"[\s\S]*?<\/tr>/g;
  const finishers: ParsedFinisher[] = [];

  for (const rowMatch of html.matchAll(rowPattern)) {
    const row = rowMatch[0];
    const positionMatch = row.match(/data-position="(\d+)"/);
    const nameMatch = row.match(/data-name="([^"]*)"/);
    const timeMatch = row.match(
      /Results-table-td--time[^>]*>[\s\S]*?<div class="compact"[^>]*>([^<]*)</,
    );

    if (!positionMatch) {
      continue;
    }

    const timeText = timeMatch?.[1]?.trim() ?? "";
    finishers.push({
      position: Number(positionMatch[1]),
      name: nameMatch?.[1] ?? "",
      time: timeText.length > 0 ? timeText : "Unknown",
    });
  }

  return finishers;
}
