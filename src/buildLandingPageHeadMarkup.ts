import {
  OG_IMAGE_URL,
  SITE_HOMEPAGE,
  USERSCRIPT_DESCRIPTION,
  USERSCRIPT_NAME,
} from "./siteConstants";

const PAGE_TITLE =
  "Finish Funnel | Size a parkrun finish funnel for orderly token handover";
const PAGE_DESCRIPTION = USERSCRIPT_DESCRIPTION;

const jsonLdSoftwareApplication = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: USERSCRIPT_NAME,
  description: PAGE_DESCRIPTION,
  url: SITE_HOMEPAGE,
  image: OG_IMAGE_URL,
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web Browser",
  softwareVersion: "__APP_VERSION__",
  author: {
    "@type": "Person",
    name: "Pete Johns",
    givenName: "Pete",
    familyName: "Johns",
    url: "https://www.johnsy.com/",
    sameAs: ["https://github.com/johnsyweb"],
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "AUD",
  },
};

const jsonLdBreadcrumbs = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "johnsy.com",
      item: "https://www.johnsy.com/",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "parkrun utilities",
      item: "https://www.johnsy.com/parkrun-utilities/",
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "Finish Funnel",
      item: SITE_HOMEPAGE,
    },
  ],
};

export function buildLandingPageHeadMarkup({
  version = "0.0.0",
}: {
  version?: string;
} = {}): string {
  const softwareApplication = JSON.stringify({
    ...jsonLdSoftwareApplication,
    softwareVersion: version,
  });
  const breadcrumbs = JSON.stringify(jsonLdBreadcrumbs);

  return `
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${PAGE_TITLE}</title>
    <meta name="description" content="${PAGE_DESCRIPTION}" />
    <meta
      name="keywords"
      content="parkrun finish funnel, finish tokens, parkrun event team, queue sizing, userscript, parkrun results"
    />
    <link rel="canonical" href="${SITE_HOMEPAGE}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${SITE_HOMEPAGE}" />
    <meta property="og:title" content="${PAGE_TITLE}" />
    <meta property="og:description" content="${PAGE_DESCRIPTION}" />
    <meta property="og:image" content="${OG_IMAGE_URL}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="800" />
    <meta
      property="og:image:alt"
      content="${USERSCRIPT_NAME} screenshot on a parkrun results page with the Finish Funnel panel active"
    />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${PAGE_TITLE}" />
    <meta name="twitter:description" content="${PAGE_DESCRIPTION}" />
    <meta name="twitter:image" content="${OG_IMAGE_URL}" />
    <script type="application/ld+json">${softwareApplication}</script>
    <script type="application/ld+json">${breadcrumbs}</script>
    <link rel="icon" href="https://www.google.com/s2/favicons?sz=64&amp;domain=parkrun.com.au" />
  `.trim();
}
