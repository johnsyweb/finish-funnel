export type ParsedVolunteer = {
  name: string;
  role: string;
};

export function normalizeVolunteerRole(role: string): string {
  return role.replace(/,\s*$/, "").trim();
}

export function parseVolunteersHtml(html: string): ParsedVolunteer[] {
  const rowPattern = /<tr class="Volunteers-table-row"[\s\S]*?<\/tr>/g;
  const volunteers: ParsedVolunteer[] = [];

  for (const rowMatch of html.matchAll(rowPattern)) {
    const row = rowMatch[0];
    const nameMatch = row.match(/data-name="([^"]*)"/);
    const roleMatch = row.match(/data-role="([^"]*)"/);

    if (!roleMatch) {
      continue;
    }

    volunteers.push({
      name: nameMatch?.[1] ?? "",
      role: normalizeVolunteerRole(roleMatch[1] ?? ""),
    });
  }

  return volunteers;
}

export function finishTokensVolunteerCount(
  volunteers: ParsedVolunteer[],
): number {
  return volunteers.filter(
    (volunteer) => normalizeVolunteerRole(volunteer.role) === "Finish Tokens",
  ).length;
}

export function hasFinishTokenSupport(volunteers: ParsedVolunteer[]): boolean {
  return volunteers.some(
    (volunteer) =>
      normalizeVolunteerRole(volunteer.role) === "Finish Token Support",
  );
}
