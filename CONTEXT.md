# Finish Funnel

A parkrun event-team tool to size a finish funnel so finish tokens can be handed out in order during busy finish periods. Delivered as a **userscript** on live parkrun results pages, with a **Finish Funnel landing page** at johnsy.com for installation and documentation.

## Language

**Finish Funnel userscript**:
The production delivery: a Tampermonkey-style userscript that runs on parkrun event results pages, reads **event results** from the page, injects a **Finish Funnel panel** above the results table, and augments the table with a **Finish funnel column** — without replacing parkrun’s published results. Activates only on event results URLs, only when a results table is present in the DOM, and only after the event team chooses **Analyse finish funnel**.
_Avoid_: Extension (different packaging), bookmarklet (too limited for this UI)

**Analyse finish funnel**:
The on-page control injected near the Finishers heading when the URL is an event results page and a finishers results table is present. Activates the **Finish Funnel userscript** — injecting the **Finish Funnel panel** and **Finish funnel column**. After activation, the control toggles to hide Finish Funnel (removes panel and injected column until shown again). Does not run automatically on page load.
_Avoid_: Run simulation (too generic), enable Finish Funnel (ambiguous with role)

**Finish Funnel panel**:
The simulation UI the **Finish Funnel userscript** injects above the parkrun results table: settings (in a collapsible section), metrics, **On the day**, queue depth chart, chart legend, selected moment, and **queue moment summary**. Sizing and moment selection happen here; per-finisher detail appears in the **Finish funnel column** when the event team scrolls the **augmented results table**. Does not duplicate parkrun’s results search — filtering and sorting use parkrun’s controls.
_Avoid_: Overlay (too vague), sidebar (different placement)

**Why Finish Funnel exists**:
parkrun publishes little practical guidance on how long or wide a finish funnel should be. Finish Funnel helps event teams size a **narrow, single-file** funnel so finishers stay in position order and **cannot overtake** each other before Finish Tokens are handed out.
_Avoid_: Official parkrun guidance (it is not), wide funnel (defeats the purpose)

**Finish Funnel landing page screenshot**:
A capture of [Albert Melbourne #669 results](https://www.parkrun.com.au/albertmelbourne/results/669/) **after** **Analyse finish funnel** is activated — cropped from **#finish-funnel-metrics** through **#finish-funnel-queue-chart** (including the chart legend) so queue metrics and depth graph are clearly visible, with enough surrounding parkrun results-page context. Stored as `public/images/screenshot.png` in git; regenerated locally via `scripts/generate-screenshot.ts` (Puppeteer). Used on the landing page and as `og:image`.
_Avoid_: Pre-activation screenshot (hides the product), panel-only crop (loses results-page context), CI-only screenshot generation (parkrun blocks bots)

**Finish Funnel (beta)**:
The current release quality of the **Finish Funnel userscript** and **Finish Funnel landing page**. Signalled in the userscript `@name` (`parkrun Finish Funnel (beta)`), `@description`, landing-page callout, and install CTA. Testers and corrections are welcome via GitHub issues.
_Avoid_: Preview, experimental (understates that it runs on live results pages)

**Finish Funnel landing page**:
The public site at johnsy.com/finish-funnel/ — explains what the userscript does, why it exists, and how to install it. Uses self-contained **site chrome** matching parkrun utility microsites: aubergine `#header` (breadcrumbs + title), white `#content` card, aubergine `#footer`. Section order inside **content**: **About** (what, **Why Finish Funnel exists**, **Finish Funnel (beta)** callout, version facts from `package.json` at build time) → **Privacy and data** → **Getting started** → **Finish Funnel landing page screenshot** → **Install** → **Support**. HTML head carries Foretoken-style metadata (`canonical`, Open Graph, Twitter Card, JSON-LD). Not the simulation UI; event teams use the **Finish Funnel userscript** on their results page.
_Avoid_: Development app (retired), demo (the landing page does not run the simulation)

**Site chrome**:
The visible johnsy.com framing on the **Finish Funnel landing page**: breadcrumb trail (`johnsy.com` → `parkrun utilities` → `Finish Funnel`), aubergine header band, white content card, and matching footer. Self-contained in the static build — not injected by the main johnsy.com Jekyll site.
_Avoid_: Parent layout (Finish Funnel ships its own chrome), in-page footer only (omits header breadcrumbs)

**Finish Funnel userscript build**:
The userscript bundle produced from this repository (`src/userscript/` entry point) — packages the shared simulation core and DOM injection for Tampermonkey-style installation on parkrun results pages. The installable artefact is `finish-funnel.user.js` at the **repository root** (copied from the Vite build on release). `@downloadURL` and `@updateURL` point at `raw.githubusercontent.com` on the `johnsyweb/finish-funnel` repository — not the johnsy.com CDN. `@supportURL` points at `https://github.com/johnsyweb/finish-funnel/issues`.
_Avoid_: External package (v1 keeps build in-repo), bookmarklet

**Finish funnel**:
The roped-off single-lane queue between the finish line and the point where finish tokens are handed to finishers in position order. Not every event needs one — quiet events may hand out tokens without roping off a lane when peak queue depth stays low.
_Avoid_: Finish chute (ambiguous with multi-lane layouts), funnel zone

**Queue capacity**:
The minimum number of finishers the funnel must be able to hold at peak without breaking position order. The primary computed output of the tool.
_Avoid_: Funnel size (ambiguous with physical length), buffer

**Physical funnel length**:
The distance in metres that the finish funnel should occupy on the ground: deceleration zone plus queue capacity multiplied by finisher spacing. Recommended length is rounded up to the nearest whole metre for practical layout. For multi-lane layouts, each finish funnel lane has its own physical length and deceleration zone.
_Avoid_: Funnel length alone (ambiguous without stating physical vs capacity)

**Finish funnel lane**:
One roped parallel section of the finish funnel, single-file and only wide enough for one finisher — no overtaking. New finishers stay on the **current lane** while it has spare capacity; when it is full, the Funnel Manager switches to the lowest numbered lane with spare capacity (including a lane that has reopened after emptying). Each lane has its own physical length including a deceleration zone at the finish-line end.
_Avoid_: Chute, corridor, batch (describes token grouping, not physical layout)

**Physical batch**:
A contiguous segment of finishers admitted during one lane-fill cycle. The **first physical batch** is unnamed and runs until finish funnel lane 1 reaches capacity for the first time. Each subsequent physical batch is named **A**, **B**, **C**, … in switch order and runs until the lane being filled in that cycle reaches capacity again. After **Z**, naming continues **AA**, **AB**, **AC**, … (Excel-style, not Unicode symbols). With two lanes: unnamed (lane 1, first fill) → **A** (lane 2, first fill) → **B** (lane 1 refill) → **C** (lane 2 refill) → **D** (lane 1) → …, alternating lanes. With three or more lanes, the same rule cycles through lane numbers in order (unnamed fills lane 1, then **A** fills lane 2, **B** lane 3, **C** lane 1 again, and so on). A finisher belongs to exactly one physical batch. While a lane stays full in steady state, token handovers free slots one at a time and replacement finishers stay in the **same** physical batch — a new batch begins only on a **lane-fill switch** to a different lane, not on each one-in-one-out turnover. Physical batches are not token batches — token handover order stays strict finish position order across all lanes.
_Avoid_: Batch token, token batch, processing batch

**Batch marker card**:
A card handed to the first finisher who starts a named physical batch — the first entrant to the target lane after a lane-fill switch. The first physical batch has no card. **A** marks the start of the second physical batch; **B** the third; and so on. None when only one finish funnel lane is configured. Overflow finishers have no physical batch. Operational aid only.
_Avoid_: Batch token, lane card, separator card

**Batch marker holder**:
The queued finisher who received the batch marker card — the first finisher in a named physical batch. The queue table shows the same physical batch letter on every finisher in the batch; the holder’s cell adds a card indicator with an accessible label (e.g. “A, batch marker holder”).
_Avoid_: Batch leader, card carrier

**Batch marker moment**:
The finisher arrival time of a finisher who holds a batch marker card — the instant a named physical batch begins. Every batch marker moment for the simulated event is shown on the queue depth chart. On the chart, shown as a short vertical tick at that clock finish time with the batch letter only labelled above the plot in a distinct colour from the selected-moment indicator. Clicking a batch tick moves the selected moment to that instant.
_Avoid_: Batch start time (informal), card time

**Funnel Manager**:
The volunteer who opens and closes finish funnel lanes as each lane fills or empties, and hands a batch marker card to the first finisher routed to a new lane after a lane-fill switch. Lane switches are kept to a minimum to reduce stress and error.
_Avoid_: Funnel marshal, lane manager

**Finisher lane assignment**:
The finish funnel lane a finisher enters at finisher arrival, determined by replaying arrivals and token handovers in time order: stay on the current lane while it has spare capacity; when full, switch to the lowest numbered lane with spare capacity. A batch marker letter is issued only to the first finisher entering the target lane after a lane-fill switch. Switching back to a lane that emptied while another lane was being filled is still a lane-fill switch (new physical batch and card); only the **event start** on lane 1 is excluded (unnamed batch, no card). Finishers who arrive when every lane is full are assigned **overflow**.
_Avoid_: Lane at token, current lane (ambiguous with lane switching after arrival)

**Overflow finisher**:
A finisher whose finisher lane assignment is overflow: they arrived after every proposed finish funnel lane was full at their effective admission time. When finish-line backup is modelled, admissions are delayed until a slot opens, so overflow should not occur for the configured layout. When backup is not modelled, overflow means the queue would back over the finish line.
_Avoid_: Unassigned, extra finisher, spillover

**Finish-line backup**:
When combined lane capacity is exceeded, the queue backs over the finish line and blocks new finishes until space frees. Modelled by capping funnel admissions at combined lane capacity and delaying effective finisher arrivals until a token handover frees a slot. Applies when a multi-lane layout is configured in the simulation.
_Avoid_: Finish line congestion, gridlock

**Finish-line backup delay**:
How long a finisher waits at the finish line before entering the funnel when finish-line backup applies: effective finisher arrival minus published finisher arrival. The UI shows maximum and average delay across delayed finishers when backup occurred for the simulated event.
_Avoid_: Blocked time, gridlock delay

**Lane queue capacity**:
The number of finishers one finish funnel lane can hold: lane physical length minus deceleration zone, divided by finisher spacing, rounded down.
_Avoid_: Lane size, lane length (ambiguous with metres)

**Combined lane capacity**:
The sum of lane queue capacity across all finish funnel lanes. Compared against peak queue depth to judge whether a multi-lane layout holds everyone at the busiest moment. Shown on the queue depth chart as a horizontal **layout capacity** reference line; a second **model recommendation capacity** line appears only when the **layout** differs from the **model recommendation**.
_Avoid_: Total funnel capacity (ambiguous with single-lane queue capacity)

**Minimum lanes required**:
The smallest lane count at a given per-lane length that provides enough combined lane capacity for peak queue depth: peak queue depth divided by lane queue capacity, rounded up. Used internally when computing the **model recommendation**; not shown as a separate metric when the layout is displayed directly.
_Avoid_: Recommended length (ambiguous with metres), lanes needed (informal)

**Funnel not required**:
When peak queue depth is at most 2 (fixed threshold), the page shows a callout that a roped-off funnel may not be needed for this event. Chart and numbers are still shown for context. Mutually exclusive with the finish-line backup warning.
_Avoid_: No funnel, skip funnel (too imperative)

**Finish Tokens**:
The parkrun volunteer role responsible for handing a numbered finish token to each finisher in position order at the end of the finish funnel. On live results pages, count rows in the **volunteers roster** whose role is Finish Tokens to set **Finish Tokens settings** volunteer count. Distinct from **Finish Token Support**.
_Avoid_: Token volunteer (too vague)

**Finish Token Support**:
The parkrun volunteer role that keeps finish tokens supplied to **Finish Tokens** volunteers — fetching batches so handover need not pause. Listed separately on the **volunteers roster**; not counted in the **Finish Tokens rotation** pool. When at least one Finish Token Support volunteer is on the roster for the event, **token supply fetch delay** is treated as zero for simulation on that page.
_Avoid_: Finish Tokens (hand out tokens), token volunteer (too vague)

**Token handover order**:
Finish tokens are always handed out in strict finish position order (1, 2, 3, …), regardless of how many finish funnel lanes are in use. Multi-lane layouts do not create separate token batches.
_Avoid_: Arrival order, lane order, batch order

**Token supply batch**:
A numbered set of finish tokens prepared for handover at the end of the finish funnel (e.g. 30 at Albert Melbourne parkrun, 100 at Mernda). Size is configurable in Finish Tokens settings; fixture selection sets a sensible default. Distinct from **physical batch** — token supply batches are how tokens are stored and carried, not how finishers are grouped in the funnel.
_Avoid_: Token batch (ambiguous with physical batch), batch of tokens (too vague)

**Token supply fetch delay**:
How long handover pauses when the active volunteer’s token supply batch is exhausted and no standby volunteer in the **Finish Tokens rotation** pool has the next batch ready — while someone fetches the next batch. Configurable in Finish Tokens settings; default 30 seconds when no **Finish Token Support** is on the **volunteers roster**; zero when at least one Finish Token Support volunteer is listed. Pauses increase peak queue depth and feed into funnel sizing recommendations.
_Avoid_: Batch change time, refill delay (too vague)

**Token supply gap**:
A period during the event when no finish token is handed out because every volunteer in the rotation pool who could take over is waiting for a token supply batch (fetch in progress). Duration equals the token supply fetch delay when a gap occurs. Token supply gaps increase peak queue depth and appear in wait-time metrics. When gaps occurred, the UI shows gap count and total handover pause time in the metrics panel; hidden when there were none. Not shown on the queue depth chart in the first version.
_Avoid_: Handover stall, batch break (ambiguous with physical batch)

**Finish Tokens rotation**:
Finish Tokens volunteers work in rotation: one **active** volunteer hands tokens one at a time at the configured rate; others wait on standby with the next token supply batch ready or fetch one. Rotation to the next volunteer occurs when the active volunteer’s token supply batch is exhausted — not mid-batch. The **volunteer count** is the rotation pool size: when the active batch is exhausted, the next volunteer in rotation who already has the next token supply batch ready takes over with no gap; if nobody has the next batch ready, handover pauses for the **token supply fetch delay**. Volunteers rotate in fixed order; when a volunteer leaves active handover they immediately begin fetching the next token supply batch and are ready again after the fetch delay. At event start every volunteer in the pool begins ready with a full token supply batch; only volunteer 1 is active. Rotation provides physical respite and covers token supply batch changes. Additional volunteers do not hand out in parallel.
_Avoid_: Token team, volunteer pool (too vague)

**Token handover rate**:
How quickly the **active** Finish Tokens volunteer hands out tokens, modelled as tokens per minute for that one volunteer. Simulated as discrete events: one finisher leaves the queue every 60 ÷ tokens-per-minute seconds while the active volunteer is handing out and the queue is non-empty. Not multiplied by volunteer count.
_Avoid_: Service rate (too generic), throughput (ambiguous with finisher arrival rate), continuous drain

**Token handover time**:
The simulated clock finish time at which a finisher receives a finish token, derived from finisher arrival, token handover rate, Finish Tokens rotation, and any token supply gaps. Used to compute time until token and total estimated queueing time. Each handover records which volunteer in the Finish Tokens rotation pool handed the token.
_Avoid_: Service time, departure time (too generic)

**Finisher arrival**:
When a finisher crosses the finish line and enters the finish funnel queue. Modelled from published finish times grouped to the nearest second, with multiple finishers sharing the same second spread evenly across that second.
_Avoid_: Finish time (ambiguous with published result time), crossing (too vague)

**Unknown finisher**:
A finisher whose published result time is missing or unparseable. Assigned the previous known finish time in finish order, or the next known time if none precedes them. Still counts as a finisher arrival; flagged as estimated in the UI.
_Avoid_: Unknown time (describes the data, not the person), missing time

**Site constraints**:
The physical limits of the course for roping off finish funnel lanes: **maximum lane length** and **maximum lane count**. Entered by the event team; drive the **model recommendation**. On live results pages the **Finish Funnel userscript** restores **site constraints** from **persisted event settings** keyed by event path. Changing site constraints or simulation settings recomputes the model recommendation and re-syncs the **layout** to match (discarding any manual tweak).
_Avoid_: Course limits (too vague), venue settings

**Persisted event settings**:
Per-event browser storage for the **Finish Funnel userscript**, keyed by parkrun event path (e.g. `/mernda/`). Persists **site constraints**, **layout assumptions**, and **Finish Tokens settings** except volunteer count (read from the **volunteers roster** on each results page). Does not persist **layout** — that is recomputed from each event’s results. Restored on later visits to the same event.
_Avoid_: Saved settings (too generic), course profile (ambiguous with parkrun profile)

**Volunteers roster**:
The volunteers table on a parkrun event results page: volunteer name, role, and club. The **Finish Funnel userscript** reads **Finish Tokens** and **Finish Token Support** role counts from this table to pre-fill simulation inputs for that event.
_Avoid_: Volunteer list (too generic), roster (ambiguous with Finish Tokens rotation pool)

**Maximum lane length**:
The longest total roped length per finish funnel lane the course can accommodate with stakes and cordons — from the finish line to the token handover point, **including** the deceleration zone at the finish-line end. A hard site constraint; the model's recommended per-lane length must not exceed this value. Fixture selection sets a sensible default per course (e.g. Bushy: 300 m; Albert Melbourne: 200 m; Mernda: 30 m).
_Avoid_: Lane length (ambiguous with recommended or configured length), available space (too vague), queue zone length (excludes deceleration)

**Maximum lane count**:
The most parallel finish funnel lanes the course can physically accommodate along the available roping distance — a hard site constraint. The model's recommended lane count must not exceed this limit. Fixture selection sets a sensible default per course (e.g. Bushy: 3; Albert Melbourne: 2; Mernda: 1).
_Avoid_: Lane limit (too informal), max lanes (ambiguous with recommended lane count)

**Model recommendation**:
The finish funnel layout the model calculates for the simulated event: a lane count and total per-lane physical length (including deceleration zone) that hold peak queue depth without finish-line backup, subject to **maximum lane length** and **maximum lane count**. Chosen by taking the fewest lanes that fit within both constraints, then the shortest per-lane length (rounded up to whole metres) that still provides enough combined capacity — not necessarily the full maximum lane length when less rope suffices. When peak queue depth cannot be held even at maximum lane count and maximum lane length, the model recommendation uses both maxima and the shortfall is stated explicitly. When **funnel not required** applies, still recommends one lane at the shortest length that holds peak queue depth. Pre-fills the **layout**; shown separately for comparison only when the event team has tweaked the layout away from this value.
_Avoid_: Recommended layout (ambiguous with editable layout), optimal layout

**Layout**:
The finish funnel layout the event team configures for simulation and queue visualisation: lane count and total per-lane physical length in metres (including deceleration zone). Pre-filled from the **model recommendation**; the event team may tweak either value within **site constraints** (lane count and length cannot exceed the configured maximums). Drives combined lane capacity, finish-line backup simulation, queue visualisation, and chart capacity reference lines. When layout matches the model recommendation, only layout adequacy is shown; when tweaked, the model recommendation is shown alongside for comparison. A **Reset to model recommendation** control appears in the layout inputs when the two differ.
_Avoid_: Proposed funnel, configured layout (too vague), current setup

**Event results**:
The finish position, name, and published finish time for each finisher from a parkrun event results page. On live pages the userscript reads the existing results table. Parsed and Unknown-handled in finish-funnel first; proven logic shared with the userscript.
_Avoid_: Results data, finish data (too vague)

**Results row**:
One finisher’s published entry from the parkrun results table: finish position, name, and finish time, plus parkrun’s own columns (gender, age group, club, and so on). The **Finish Funnel userscript** augments each row with simulation fields.
_Avoid_: Result line, table row (too generic without “results”)

**Augmented results table**:
The parkrun event results table on a live results page after the **Finish Funnel userscript** injects one **Finish funnel column** into the existing `<table>`. Parkrun’s published columns and rows are preserved; Finish Funnel cells use parkrun’s **compact** and **detailed** display pattern so simulation detail appears when the event team switches View Settings to Detailed. Simulation runs on the full **event results** once; when parkrun search, sort, or view toggles change the table body, the userscript re-augments visible rows by finish position — no separate search in the **Finish Funnel panel**.
_Avoid_: Reconstructed results table (retired), enhanced table (too vague)

**Finish funnel column**:
The single simulation column the **Finish Funnel userscript** adds to the **augmented results table**, placed after **Time** (rightmost). In **compact** **results display mode**: status only (**In queue**, **At finish line**, or blank). In **detailed** mode: lane, physical batch, queue position, time waiting, time until token, total estimated queueing time, and Finish Tokens volunteer — populated according to each finisher’s state at the **selected moment**; blank where not applicable.
_Avoid_: Simulation columns (plural — one column only on live pages), extra columns

**Results display mode**:
How parkrun shows each results table: **compact** (minimal columns and cell content) or **detailed** (extra lines within cells). Finish Funnel simulation fields follow the same pattern — brief status in compact, full lane/batch/wait metrics in detailed.
_Avoid_: View mode (too generic), table density

**Finisher spacing**:
The assumed along-lane distance in metres each finisher occupies in a single-file finish funnel lane. Configurable in **layout assumptions**; default 0.75 m. Used to derive the queue portion of physical funnel length from queue capacity. Lane width is not modelled separately — finish funnel lanes are single-file with no overtaking. When **layout** lane length or lane count changes, the input value is preserved; the simulation clamps spacing to the lane queue zone without rewriting **layout assumptions**.
_Avoid_: Metres per person (too informal), lane density, lane width

**Deceleration zone**:
The length in metres at the finish-line end of each finish funnel lane, where fast finishers slow to walking pace after crossing the finish line. Configurable; default 5 m. Added to physical funnel length but not to queue capacity.
_Avoid_: Run-off area, slowing distance

**Layout setup information**:
Operational counts derived from the configured **layout** to help the event team prepare on the ground — not simulation outputs and not tied to the **selected moment**. Shows **cordon stake count** (headline total plus a context line restating lane count, lane length, and **cordon stake spacing**; N + 1 cordon lines for N lanes) and, for multi-lane layouts, **batch marker cards needed for event** (named physical batches only — lane-fill switches excluding the unnamed first batch). Single-lane layouts show cordon stakes only; batch marker cards are not used. Always shown when layout values are configured, including when **funnel not required** applies. **Cordon stake spacing** is configured in **layout assumptions**; the panel appears after metrics and before the queue depth chart under the heading **On the day**.
_Avoid_: Setup panel (too vague), roping summary (informal)

**Cordon stake spacing**:
The distance in metres between consecutive stakes along a cordon line, excluding the finish-line and token-handover ends (those always get a stake). Configurable in **layout assumptions**; default 5 m; minimum 1 m. Stake positions along a cordon line of length L: one stake at each end, plus stakes every cordon stake spacing between them.
_Avoid_: Stake interval (too vague), post spacing (informal), paces (retired — spacing is in metres)

**Cordon line**:
One run of cordon rope between stakes along a finish funnel lane boundary. For a multi-lane **layout**, adjacent lanes share a centre cordon, so there are **lane count + 1** cordon lines in total, each running the full per-lane **layout** lane length. For a single-lane layout, two cordon lines (both sides). **Layout setup information** counts stakes per cordon line from lane length and **cordon stake spacing**, then sums across all cordon lines.
_Avoid_: Rope run (informal), boundary line (too generic), one cordon per lane (under-counts shared dividers)

**Queue depth**:
The number of finishers waiting in the finish funnel for a finish token at a given moment during the event. The peak queue depth determines the recommended queue capacity. Charted against clock finish time on the x-axis as an orange line on the **queue depth chart**.
_Avoid_: Backlog (ambiguous with processing delays), queue length (ambiguous with physical length)

**Peak queue capacity**:
The peak queue depth from the uncapped simulation, shown in the metrics panel as a one-line card: `Peak queue capacity: N finishers`. Also the label for the peak reference line on the **queue depth chart**.
_Avoid_: Maximum queue depth (ambiguous with layout capacity), peak backlog

**Queue depth chart**:
The queue depth over finish time plot. Shows queue depth through the event, horizontal reference lines for peak queue capacity and combined lane capacity, batch marker moments on multi-lane layouts, and the selected-moment indicator. A **chart legend** below the plot lists only the elements currently visible.
_Avoid_: Timeline, finish chart (too vague)

**Chart legend**:
The key below the queue depth chart naming each visual element currently shown on the plot, with a swatch matching the chart line style and colour — solid or dashed horizontal strokes for series and reference lines, a vertical stroke for batch marker moments. Labels: **Queue depth**, **Peak queue capacity**, **Layout capacity**, **Model recommendation capacity** (when layout differs), **Batch marker moment** (multi-lane only). Lists only visible elements. Does not include the selected-moment indicator (shown separately above the chart).
_Avoid_: Key (too generic), chart labels (ambiguous with axis labels)

**Selected moment**:
The clock finish time chosen on the queue depth chart. Queue membership and per-finisher wait metrics are evaluated at this instant. Set by clicking or dragging on the chart; nudged with arrow keys when the chart has focus; jumped to the previous or next batch marker moment with Page Up or Page Down when the chart has focus. Shown as a vertical indicator and readable clock time on the chart. Defaults to the first moment peak queue depth is reached; resets to that moment whenever simulation settings change. Changing **layout** lane count or length does not reset the selected moment.
_Avoid_: Scrub time, cursor time, selected time (ambiguous with published finish time)

**Queued finisher**:
At the selected moment, a finisher who has already had a finisher arrival but has not yet received a finish token. Ordered front to back by arrival time; the front finisher is next to receive a token. In the **Finish funnel column**, status shows **In queue**; queue position and wait metrics are populated.
_Avoid_: Waiting runner, person in queue (too informal)

**Queue visualisation**:
The UI shown at the **selected moment**. On live results pages: **queue moment summary** plus the **augmented results table**. Simulation fields on each **results row** reflect that finisher’s state at the selected moment; blank where not applicable. Unknown finishers are flagged as estimated. A spatial diagram of the physical funnel is out of scope for the first version.
_Avoid_: Queue view, funnel map (ambiguous with capacity sizing)

**Event results table at selected moment**:
Retired term — use **augmented results table** on live pages. Do not maintain a separate multi-column reconstructed table.
_Avoid_: Full results table (too generic), queue table (ambiguous with queued-only), augmented results table (live pages)

**Queue moment summary**:
The breakdown shown above the queue table at the selected moment. The section heading carries total queue depth at the selected moment (e.g. “Queue at selected moment (719)”). Every configured finish funnel lane is listed. Per lane, queued finishers and queue-zone utilisation as occupied / maximum finishers and occupied / maximum metres (queue zone = lane length minus deceleration; occupied metres = queued in lane × finisher spacing, shown to one decimal place). Under each lane, every physical batch that still has at least one queued finisher in that lane at the selected moment, with count, listed in switch order — typically two or three batches per lane at peak (e.g. lane 1: unnamed 12, B 381; lane 2: B 180, C 95, D 51). When finish-line backup is modelled and finishers are blocked at the finish line at the selected moment, an additional line states how many have not yet entered the funnel. Replaces the single-line queue depth paragraph. For a single finish funnel lane, show the lane utilisation line only — no physical batch nesting. Event-wide batch marker card count lives in **layout setup information**, not here.
_Avoid_: Lane status panel, funnel snapshot

**Finish-line blocked finisher**:
At the selected moment, a finisher who has passed the finish line by published (or estimated) finish time but has not yet had a finisher arrival into the funnel because finish-line backup delayed admission. Not counted in queue depth or lane occupancy until they enter. In the **Finish funnel column**, lane, batch, queue metrics, and Finish Tokens volunteer are blank; status shows **At finish line**.
_Avoid_: Waiting to enter, pre-funnel finisher

**Tokened finisher**:
At the selected moment, a finisher who has already received a finish token. In the **Finish funnel column**, lane and physical batch are shown from finisher lane assignment; queue position and time until token are blank; time waiting and total estimated queueing time show actual durations; Finish Tokens volunteer shows which volunteer in the rotation pool handed the token (labelled **Finish Tokens 1**, **Finish Tokens 2**, …).
_Avoid_: Served finisher, completed finisher

**Finish Tokens volunteer label**:
How a volunteer in the Finish Tokens rotation pool is named in the **Finish funnel column** when they handed a token: **Finish Tokens 1**, **Finish Tokens 2**, … in pool order. Blank when no token has been handed yet for that finisher at the selected moment.
_Avoid_: Volunteer 1 (ambiguous with other roles), FT1 (too cryptic)

**Not-yet-finished finisher**:
At the selected moment, a finisher whose published (or estimated) finish time is still in the future — they have not yet crossed the finish line. In the **Finish funnel column**, status and detailed fields are blank.
_Avoid_: Still running, on course (too informal)

**Queue position**:
A queued finisher’s 1-based rank at the selected moment, counting from the front of the queue. Position 1 is next to receive a finish token.
_Avoid_: Place in line, spot (too informal)

**Time waiting**:
At the selected moment, how long a queued finisher has already waited: selected moment minus finisher arrival. Shown as a clock duration.
_Avoid_: Wait so far, elapsed wait

**Time until token**:
At the selected moment, how much longer until a queued finisher receives a finish token: simulated token handover time minus selected moment. Shown as a clock duration. For the front of the queue, at most one token handover interval.
_Avoid_: Remaining wait, time to serve

**Total estimated queueing time**:
For a finisher, the full wait from finisher arrival to simulated token handover: token handover time minus finisher arrival. At the **selected moment**, shown for queued finishers as time waiting plus time until token at that instant. At token handover, the final value for each finisher who received a token. Shown as a clock duration.
_Avoid_: Total wait, queue duration (ambiguous with physical funnel length)

**Event queue time summary**:
Event-wide statistics over final **total estimated queueing time** at token handover: maximum, mean, and median across every finisher who received a token in the **layout simulation**, including zero-wait handovers. Median uses the standard definition (average of the two middle values when the count is even). Always shown in the metrics panel immediately after peak queue capacity as its own one-line card (`Queue time: … max · … mean · … median`). Mean and median are floored to whole seconds for display, matching max and other clock durations in the panel. The UI label is **mean**, not avg. Does not include mode.
_Avoid_: Wait time stats, queue duration summary

**Finish Tokens settings**:
The configurable token handover rate (tokens per minute for the active Finish Tokens volunteer), number of Finish Tokens volunteers in rotation, token supply batch size, and token supply fetch delay used in the simulation. On live results pages, volunteer count comes from the **volunteers roster** (Finish Tokens rows only); other values restore from **persisted event settings** or defaults. Default handover rate: 15 tokens/min; default volunteers: 1; default fetch delay: 30 seconds.
_Avoid_: Service settings, handover settings
