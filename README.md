# Finish Funnel

Size a parkrun finish funnel so Finish Tokens can be handed out in order during busy finish periods. Supports single-lane recommendations and multi-lane layout planning.

## Development

Requires [mise](https://mise.jdx.dev/) with [aube](https://github.com/endevco/aube) and [hk](https://hk.jdx.dev/) (see `mise.toml`).

```bash
mise run setup
aube run dev
```

Open `http://localhost:5173`. Use the fixture selector to compare Bushy #1095 (record attendance), Albert Melbourne #693 (busy local), and Mernda #400 (quiet Saturday).

```bash
aube test
mise run check
aube run build:fixtures   # requires cached HTML in /tmp from parkrun results pages
aube run build
aube run build:userscript
```

Git hooks are managed by [hk](https://hk.jdx.dev/); `mise run setup` runs `hk install --mise`. To skip hooks once: `HK=0 git commit`.

## Userscript

Build the Tampermonkey/Greasemonkey bundle:

```bash
aube run build:userscript
```

Install `dist/finish-funnel.user.js` in your userscript manager, or subscribe from `https://www.johnsy.com/finish-funnel/finish-funnel.user.js` once deployed. The built file includes Tampermonkey metadata (`@name`, `@match`, `@version`, and so on) matching the [Eventuate](https://www.johnsy.com/eventuate/eventuate.user.js) pattern.

On a parkrun event results page, click **Analyse finish funnel** to inject the **Finish Funnel panel** and **Finish funnel** column after **Time**.

The panel mirrors the dev app: settings (Finish Tokens, site constraints, layout assumptions, layout), metrics (peak queue capacity, event queue time summary, layout adequacy), **On the day** setup, queue depth chart with legend, and queue moment summary. Changing layout lane count or length does not rewrite layout assumptions — finisher spacing is clamped for simulation only.

Settings (site constraints, layout assumptions, Finish Tokens except volunteer count) persist in `localStorage` per event path (e.g. `/mernda/`). Volunteer count and fetch delay come from the **Volunteers roster** on each activation. First visit uses defaults (1 lane × 30 m site constraints); configure maximum lane length and count for your course on first use.

## Fixtures

Bundled results fixtures live in `public/fixtures/`. Regenerate with `aube run build:fixtures` after fetching results HTML:

```bash
curl -fsSL -A "Mozilla/5.0" "https://www.parkrun.org.uk/bushy/results/1095/" -o /tmp/bushy1095.html
curl -fsSL -A "Mozilla/5.0" "https://www.parkrun.com.au/mernda/results/400/" -o /tmp/mernda400.html
curl -fsSL -A "Mozilla/5.0" "https://www.parkrun.com.au/albertmelbourne/results/2026-06-13/" -o /tmp/albertmelbourne20260613.html
aube run build:fixtures
```

## Model

- Finisher arrivals from published times (per-second, spread within each second)
- Unknown finishers estimated from neighbours
- Discrete token handover (default 15 tokens/min active volunteer); Finish Tokens volunteers rotate on token supply batch exhaustion; configurable batch size and fetch delay
- **Site constraints** (maximum lane length, maximum lane count) drive **model recommendation**; **Layout** fieldset pre-filled for simulation and manual tweaks
- **On the day** panel: cordon stake count (N + 1 shared cordon lines) and batch marker cards from layout
- Multi-lane: lane assignment with batch marker cards on lane-fill switches; finish-line backup when layout is configured; queue moment summary and augmented results table at selected moment
- Userscript: parse results/volunteers DOM, settings panel, metrics (peak queue capacity + event queue time summary), **Finish funnel column**, **Analyse finish funnel** activation, persisted event settings, tbody re-augment (see `src/userscript/`)
- Chart capacity reference lines for layout; model recommendation when layout differs

See `CONTEXT.md` for domain language.
