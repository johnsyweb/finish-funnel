export function eventPathFromResultsPageUrl(url: string): string | undefined {
  try {
    const parsed = new URL(url);
    const match = parsed.pathname.match(/^\/([^/]+)\/results\//);

    return match ? `/${match[1]}/` : undefined;
  } catch {
    return undefined;
  }
}

export function persistedEventSettingsStorageKey(eventPath: string): string {
  return `finish-funnel:settings:${eventPath}`;
}
