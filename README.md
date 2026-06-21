# Finish Funnel

Size a single-lane parkrun finish funnel so Finish Tokens can be handed out in order during busy finish periods.

## Development

```bash
npm install
npm test
npm run dev
```

Open `http://localhost:5173`. Use the fixture selector to compare Bushy #1095 (record attendance) with Mernda #400 (quiet Saturday).

## Fixtures

Bundled results fixtures live in `public/fixtures/`. Regenerate with `npm run build:fixtures` after fetching results HTML:

```bash
curl -fsSL -A "Mozilla/5.0" "https://www.parkrun.org.uk/bushy/results/1095/" -o /tmp/bushy1095.html
curl -fsSL -A "Mozilla/5.0" "https://www.parkrun.com.au/mernda/results/400/" -o /tmp/mernda400.html
npm run build:fixtures
```

## Model

- Finisher arrivals from published times (per-second, spread within each second)
- Unknown finishers estimated from neighbours
- Discrete token handover (default 15 tokens/min, 1 Finish Tokens volunteer)
- Recommended length = deceleration zone + peak queue × finisher spacing, rounded up to whole metres
- Proposed funnel adequacy check in metres

See `CONTEXT.md` for domain language.
