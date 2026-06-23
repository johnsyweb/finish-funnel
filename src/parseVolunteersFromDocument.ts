import {
  normalizeVolunteerRole,
  type ParsedVolunteer,
} from "./parseVolunteersHtml";

export function parseVolunteersFromDocument(
  document: Document,
): ParsedVolunteer[] {
  const rows = document.querySelectorAll("tr.Volunteers-table-row[data-role]");
  const volunteers: ParsedVolunteer[] = [];

  for (const row of rows) {
    const role = row.getAttribute("data-role");
    if (!role) {
      continue;
    }

    volunteers.push({
      name: row.getAttribute("data-name") ?? "",
      role: normalizeVolunteerRole(role),
    });
  }

  return volunteers;
}
