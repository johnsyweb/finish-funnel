# Finish Funnel

Size a parkrun finish funnel so Finish Tokens can be handed out in order during busy finish periods.

## Install

Visit [johnsy.com/finish-funnel/](https://www.johnsy.com/finish-funnel/) or install the userscript directly:

```bash
npm run build:userscript
```

Install `dist/finish-funnel.user.js` in Tampermonkey, Userscripts, or Violentmonkey.

On a parkrun event results page, click **Analyse finish funnel** to inject the **Finish Funnel panel** and **Finish funnel** column.

## Development

Requires [mise](https://mise.jdx.dev/) with [aube](https://github.com/endevco/aube) and [hk](https://hk.jdx.dev/) (see `mise.toml`).

```bash
mise run setup
aube run dev          # landing page at http://localhost:5173
aube run build        # landing page + userscript bundle for deploy
aube run build:userscript
aube test
mise run check
```

Git hooks are managed by [hk](https://hk.jdx.dev/); `mise run setup` runs `hk install --mise`.

## Landing page

The web build is a static landing page at [johnsy.com/finish-funnel/](https://www.johnsy.com/finish-funnel/) with install instructions, beta status, and privacy information — styled like the [parkrun Userscripts](https://www.johnsy.com/tampermonkey-parkrun/) microsite. Install URL:

`https://raw.githubusercontent.com/johnsyweb/finish-funnel/refs/heads/main/finish-funnel.user.js`

Regenerate the reference screenshot after UI changes (requires a local build first):

```bash
aube run build:userscript
aube run screenshot
```

## Fixtures

Bundled results fixtures in `public/fixtures/` support tests and can be regenerated with `aube run build:fixtures` after fetching results HTML from parkrun.

## Model

- Finisher arrivals from published times (per-second, spread within each second)
- Unknown finishers estimated from neighbours
- Discrete token handover (default 15 tokens/min active volunteer); Finish Tokens volunteers rotate on token supply batch exhaustion
- **Site constraints** drive **model recommendation**; **Layout** pre-filled for simulation and manual tweaks
- Multi-lane layout, queue depth chart, batch markers, and per-finisher queue detail in the **Finish funnel column**

See `CONTEXT.md` for domain language.
