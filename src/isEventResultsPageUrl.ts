export function isEventResultsPageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      /parkrun/i.test(parsed.hostname) &&
      /\/results\/[^/]+\/?$/i.test(parsed.pathname)
    );
  } catch {
    return false;
  }
}
