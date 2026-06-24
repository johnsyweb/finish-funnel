import {
  buildSiteFooterMarkup,
  buildSiteHeaderMarkup,
} from "./buildSiteChromeMarkup";
import {
  DEFAULT_USERSCRIPT_DOWNLOAD_URL,
  LANDING_SCREENSHOT_SRC,
  SCREENSHOT_REFERENCE_URL,
  SUPPORT_URL,
  USERSCRIPT_NAME,
} from "./siteConstants";

export { USERSCRIPT_NAME } from "./siteConstants";

function buildVersionFacts({
  version,
  updatedDate,
}: {
  version?: string;
  updatedDate?: string;
}): string {
  if (!version && !updatedDate) {
    return "";
  }

  const versionItem = version
    ? `<span class="script-facts__item">Version ${version}</span>`
    : "";
  const separator =
    version && updatedDate
      ? `<span class="script-facts__sep" aria-hidden="true"> · </span>`
      : "";
  const updatedItem = updatedDate
    ? `<span class="script-facts__item">Updated <time datetime="${updatedDate}">${updatedDate}</time></span>`
    : "";

  return `<p class="script-facts">${versionItem}${separator}${updatedItem}</p>`;
}

function buildLandingContentMarkup({
  installUrl,
  version,
  updatedDate,
  screenshotSrc,
}: {
  installUrl: string;
  version?: string;
  updatedDate?: string;
  screenshotSrc: string;
}): string {
  const versionFacts = buildVersionFacts({ version, updatedDate });

  return `
    <p class="landing-lead">
      A userscript for parkrun event teams — model queue depth from your results page and plan finish funnel layout.
    </p>

    <section class="script-section script-section--about" aria-labelledby="about-heading">
      <h2 id="about-heading">About</h2>

      <p class="beta-callout" role="status">
        <strong>Beta.</strong> ${USERSCRIPT_NAME} is still maturing. Testers and corrections are welcome —
        please <a href="${SUPPORT_URL}">open an issue on GitHub</a>.
      </p>

      <p>
        ${USERSCRIPT_NAME} activates on parkrun event results pages (e.g.
        <a href="${SCREENSHOT_REFERENCE_URL}">Albert Melbourne #669 results</a>).
        It simulates finisher arrivals and Finish Tokens handover so you can choose lane length and count,
        read peak queue metrics, and brief your team on the day.
      </p>

      <h3 id="why-heading">Why</h3>
      <p>
        parkrun publishes little practical guidance on how long or wide a finish funnel should be.
        Finish Funnel helps event teams size a <strong>narrow, single-file</strong> funnel so finishers stay in
        position order and <strong>cannot overtake</strong> each other before Finish Tokens are handed out.
      </p>

      ${versionFacts}
    </section>

    <section class="script-section" aria-labelledby="privacy-heading">
      <h2 id="privacy-heading">Privacy and data</h2>
      <p>
        Privacy is paramount. This userscript runs entirely in your browser (<code>@grant none</code>).
        It does <strong>not</strong> connect to parkrun EMS and does <strong>not</strong> transmit results data,
        your settings, or any other information to the author, parkrun, or any third party.
      </p>
      <p>
        It only uses information already shown on the public results page. Site constraints, layout assumptions,
        and Finish Tokens settings (except volunteer count) are stored and retrieved <strong>only on your device</strong>
        (browser local storage), keyed by event path.
      </p>
    </section>

    <section class="script-section" aria-labelledby="getting-started-heading">
      <h2 id="getting-started-heading">Getting started</h2>
      <ol>
        <li>Install the userscript using the button below.</li>
        <li>Open your event&rsquo;s results page on parkrun.</li>
        <li>Click <strong>Analyse finish funnel</strong> near the Finishers heading.</li>
      </ol>
      <p>
        The <strong>Finish Funnel panel</strong> appears above the results table with settings, metrics,
        <strong>On the day</strong> setup, queue depth chart, and queue moment summary. The results table gains a
        <strong>Finish funnel</strong> column showing per-finisher queue detail at the selected moment.
      </p>
    </section>

    <section
      class="script-section script-section--screenshot"
      aria-labelledby="screenshot-heading"
    >
      <h2 id="screenshot-heading">Screenshot</h2>
      <p>
        <a href="${screenshotSrc}" class="screenshot-link" title="View full-size screenshot">
          <img
            src="${screenshotSrc}"
            alt="${USERSCRIPT_NAME} screenshot showing queue metrics and depth chart on a parkrun results page"
            width="1200"
            height="800"
            loading="lazy"
          />
        </a>
      </p>
    </section>

    <section class="script-section script-section--install" id="install" aria-labelledby="install-heading">
      <h2 id="install-heading">Install</h2>
      <p class="script-install-intro">
        Recommended: userscript. Works with Userscripts, Tampermonkey, Violentmonkey, or any compatible manager.
      </p>

      <h3>Userscript <span class="script-recommended">(recommended)</span></h3>
      <p class="script-install-cta">
        <a href="${installUrl}" class="script-install-button">Install ${USERSCRIPT_NAME}</a>
      </p>

      <details class="script-details">
        <summary>First time? Userscript basics and installation steps</summary>

        <h4>What is a userscript?</h4>
        <p>
          A userscript is a small piece of JavaScript that runs in your browser and enhances specific websites.
          These scripts work with parkrun event pages, parkrunner profile pages, and results pages.
        </p>

        <h4>Installation steps</h4>
        <ol>
          <li>
            <strong>Install a userscript manager for your browser:</strong>
            <ul>
              <li>
                <strong>Desktop:</strong>
                <a href="https://github.com/quoid/userscripts">Userscripts</a> (Safari),
                <a href="https://www.tampermonkey.net/">Tampermonkey</a> (Chrome, Firefox, Edge, Opera), or
                <a href="https://violentmonkey.github.io/">Violentmonkey</a>
                (<a href="https://orionbrowser.com">Orion</a>)
              </li>
              <li>
                <strong>iOS:</strong>
                <a href="https://github.com/quoid/userscripts">Userscripts</a> (Safari) or
                <a href="https://violentmonkey.github.io/">Violentmonkey</a>
                (<a href="https://orionbrowser.com">Orion</a>)
              </li>
              <li>
                <strong>Android:</strong>
                Install
                <a href="https://play.google.com/store/apps/details?id=com.kiwibrowser.browser">Kiwi Browser</a>,
                then install Tampermonkey or Violentmonkey from the Chrome Web Store.
              </li>
            </ul>
          </li>
          <li>Click the <strong>Install</strong> button above.</li>
          <li>Click &ldquo;Install&rdquo; when prompted by your userscript manager.</li>
        </ol>
      </details>
    </section>

    <section class="script-section script-section--support" aria-labelledby="support-heading">
      <h2 id="support-heading">Support</h2>
      <p>
        Testers and corrections are welcome.
        <a href="${SUPPORT_URL}">Issues and support on GitHub</a>
      </p>
    </section>
  `.trim();
}

export function buildLandingPageMarkup({
  installUrl = DEFAULT_USERSCRIPT_DOWNLOAD_URL,
  version,
  updatedDate,
  screenshotSrc = LANDING_SCREENSHOT_SRC,
}: {
  installUrl?: string;
  version?: string;
  updatedDate?: string;
  screenshotSrc?: string;
} = {}): string {
  const content = buildLandingContentMarkup({
    installUrl,
    version,
    updatedDate,
    screenshotSrc,
  });

  return `
  <a class="skip-link" href="#content">Skip to main content</a>
  ${buildSiteHeaderMarkup()}
  <div id="page">
    <main id="content" role="main">
      ${content}
    </main>
  </div>
  ${buildSiteFooterMarkup()}
`.trim();
}
