export const GITHUB_REPO = "johnsyweb/finish-funnel" as const;

export const DEFAULT_USERSCRIPT_DOWNLOAD_URL =
  `https://raw.githubusercontent.com/${GITHUB_REPO}/refs/heads/main/finish-funnel.user.js` as const;

export const SITE_HOMEPAGE = "https://www.johnsy.com/finish-funnel/" as const;

export const SUPPORT_URL = `https://github.com/${GITHUB_REPO}/issues` as const;

export const USERSCRIPT_NAME = "parkrun Finish Funnel (beta)" as const;

export const USERSCRIPT_DESCRIPTION =
  "Beta. Size a parkrun finish funnel for orderly finish token handover on results pages." as const;

export const SCREENSHOT_REFERENCE_URL =
  "https://www.parkrun.com.au/albertmelbourne/results/669/" as const;

export const LANDING_SCREENSHOT_SRC = "/images/screenshot.png" as const;

export const OG_IMAGE_URL = `${SITE_HOMEPAGE}images/screenshot.png` as const;
