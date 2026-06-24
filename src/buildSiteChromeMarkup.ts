import { GITHUB_REPO, SITE_HOMEPAGE } from "./siteConstants";

const SITE_ROOT = "https://www.johnsy.com";
const PARKRUN_UTILITIES_URL = `${SITE_ROOT}/parkrun-utilities/`;
const MIT_LICENSE_URL = `https://github.com/${GITHUB_REPO}/blob/main/LICENSE`;

export function buildSiteHeaderMarkup({
  pageTitle = "Finish Funnel",
}: {
  pageTitle?: string;
} = {}): string {
  return `
  <header id="header">
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <a href="${SITE_ROOT}/">johnsy.com</a>
      <span aria-hidden="true">/</span>
      <a href="${PARKRUN_UTILITIES_URL}">parkrun utilities</a>
      <span aria-hidden="true">/</span>
      <span aria-current="page">${pageTitle}</span>
    </nav>
    <h1>${pageTitle}</h1>
  </header>
`.trim();
}

export function buildSiteFooterMarkup(): string {
  return `
  <footer id="footer">
    <p>
      By
      <a href="${SITE_ROOT}/" rel="author">Pete Johns</a>
      (<a href="https://github.com/johnsyweb" rel="me">@johnsyweb</a>)
      &middot; Licensed under
      <a href="${MIT_LICENSE_URL}">MIT</a>
      &middot; Not officially associated with parkrun
      &middot; Written by parkrun volunteers for parkrun volunteers
    </p>
    <p>
      <a href="https://github.com/${GITHUB_REPO}">Source on GitHub</a>
    </p>
  </footer>
`.trim();
}

export { SITE_HOMEPAGE };
