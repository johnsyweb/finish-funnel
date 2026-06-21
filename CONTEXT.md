# Finish Funnel

A standalone web app for parkrun event teams to size a single-lane finish funnel so finish tokens can be handed out in order during busy finish periods. Loads event results from bundled fixtures in v1; later from a results-page userscript.

## Language

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
One roped parallel section of the finish funnel. New finishers stay on the **current lane** while it has spare capacity; when it is full, the Funnel Manager switches to the lowest numbered lane with spare capacity (including a lane that has reopened after emptying). Each lane has its own physical length including a deceleration zone at the finish-line end.
_Avoid_: Chute, corridor, batch (describes token grouping, not physical layout)

**Physical batch**:
A contiguous segment of finishers admitted during one lane-fill cycle. The **first physical batch** is unnamed and runs until finish funnel lane 1 reaches capacity for the first time. Each subsequent physical batch is named **A**, **B**, **C**, … in switch order and runs until the lane being filled in that cycle reaches capacity again. With two lanes: unnamed (lane 1, first fill) → **A** (lane 2, first fill) → **B** (lane 1 refill) → **C** (lane 2 refill) → **D** (lane 1) → …, alternating lanes. With three or more lanes, the same rule cycles through lane numbers in order (unnamed fills lane 1, then **A** fills lane 2, **B** lane 3, **C** lane 1 again, and so on). A finisher belongs to exactly one physical batch. Physical batches are not token batches — token handover order stays strict finish position order across all lanes.
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
The finish funnel lane a finisher enters at finisher arrival, determined by replaying arrivals and token handovers in time order: stay on the current lane while it has spare capacity; when full, switch to the lowest numbered lane with spare capacity. A batch marker letter is issued only to the first finisher entering the target lane after a lane-fill switch. Finishers who arrive when every lane is full are assigned **overflow**.
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
The sum of lane queue capacity across all finish funnel lanes. Compared against peak queue depth to judge whether a multi-lane layout holds everyone at the busiest moment.
_Avoid_: Total funnel capacity (ambiguous with single-lane queue capacity)

**Minimum lanes required**:
The smallest lane count at the configured lane length that provides enough combined lane capacity for peak queue depth: peak queue depth divided by lane queue capacity, rounded up. Shown instead of a single-lane recommended physical funnel length when using multi-lane layout inputs.
_Avoid_: Recommended length (ambiguous with metres), lanes needed (informal)

**Funnel not required**:
When peak queue depth is at most 2 (fixed threshold), the page shows a callout that a roped-off funnel may not be needed for this event. Chart and numbers are still shown for context. Mutually exclusive with the finish-line backup warning.
_Avoid_: No funnel, skip funnel (too imperative)

**Finish Tokens**:
The parkrun volunteer role responsible for handing a numbered finish token to each finisher in position order at the end of the finish funnel.
_Avoid_: Finish Token Support, token volunteer (too vague)

**Token handover order**:
Finish tokens are always handed out in strict finish position order (1, 2, 3, …), regardless of how many finish funnel lanes are in use. Multi-lane layouts do not create separate token batches.
_Avoid_: Arrival order, lane order, batch order

**Token handover rate**:
How quickly finish tokens are handed out, modelled as tokens per minute per Finish Tokens volunteer multiplied by the number of volunteers in that role. Simulated as discrete events: one finisher leaves the queue every 60 ÷ total tokens-per-minute seconds while the queue is non-empty.
_Avoid_: Service rate (too generic), throughput (ambiguous with finisher arrival rate), continuous drain

**Token handover time**:
The simulated clock finish time at which a finisher receives a finish token, derived from finisher arrival and token handover rate. Used to compute time until token and total estimated queueing time.
_Avoid_: Service time, departure time (too generic)

**Finisher arrival**:
When a finisher crosses the finish line and enters the finish funnel queue. Modelled from published finish times grouped to the nearest second, with multiple finishers sharing the same second spread evenly across that second.
_Avoid_: Finish time (ambiguous with published result time), crossing (too vague)

**Unknown finisher**:
A finisher whose published result time is missing or unparseable. Assigned the previous known finish time in finish order, or the next known time if none precedes them. Still counts as a finisher arrival; flagged as estimated in the UI.
_Avoid_: Unknown time (describes the data, not the person), missing time

**Proposed funnel**:
A finish funnel layout entered by the event team to compare against the simulated peak queue: lane count and lane length in metres for each finish funnel lane. The tool derives combined lane capacity using deceleration zone and finisher spacing, then reports sufficiency with headroom or shortfall. Fixture selection sets sensible defaults (e.g. Bushy: 2 × 300 m).
_Avoid_: Current setup, existing funnel, proposed capacity

**Event results**:
The finish position, name, and published finish time for each finisher from a parkrun event results page. Loaded from a bundled fixture in v1; later from a results-page userscript. Parsed and Unknown-handled in finish-funnel first; proven logic ported to tampermonkey-parkrun when the userscript ships.
_Avoid_: Results data, finish data (too vague)

**Results row**:
One finisher’s published entry from the event results table: finish position, name, and finish time. Stored in event results fixtures and shown in the queue visualisation alongside wait metrics.
_Avoid_: Result line, table row (too generic without “results”)

**Finisher spacing**:
The assumed distance in metres each finisher occupies in a single-lane finish funnel. Configurable; default 0.75 m. Used to derive the queue portion of physical funnel length from queue capacity.
_Avoid_: Metres per person (too informal), lane density

**Deceleration zone**:
A fixed length in metres at the finish-line end of the finish funnel, where fast finishers slow to walking pace after crossing the finish line. Added to physical funnel length but not to queue capacity. Default: 5 m.
_Avoid_: Run-off area, slowing distance

**Queue depth**:
The number of finishers waiting in the finish funnel for a finish token at a given moment during the event. The peak queue depth determines the recommended queue capacity. Charted against clock finish time on the x-axis.
_Avoid_: Backlog (ambiguous with processing delays), queue length (ambiguous with physical length)

**Selected moment**:
The clock finish time chosen on the queue depth chart. Queue membership and per-finisher wait metrics are evaluated at this instant. Set by clicking or dragging on the chart; nudged with arrow keys when the chart has focus; jumped to the previous or next batch marker moment with Page Up or Page Down when the chart has focus. Shown as a vertical indicator and readable clock time on the chart. Defaults to the first moment peak queue depth is reached; resets to that moment whenever simulation settings change. Changing proposed funnel lane layout does not reset the selected moment.
_Avoid_: Scrub time, cursor time, selected time (ambiguous with published finish time)

**Queued finisher**:
At the selected moment, a finisher who has already had a finisher arrival but has not yet received a finish token. Ordered front to back by arrival time; the front finisher is next to receive a token.
_Avoid_: Waiting runner, person in queue (too informal)

**Queue visualisation**:
The UI shown at the selected moment: a **queue moment summary** plus a paginated, keyboard-accessible table of queued finishers (front of queue first), 25 rows per page by default, with optional search by name or finish position. Each row shows finish position, name, published finish time, lane (or Overflow), physical batch (unnamed or **A**, **B**, **C**, … — every queued finisher), queue position, time waiting, time until token, and total estimated queueing time; the finisher who holds the batch marker card (first in a named physical batch) is visually distinguished in the batch column. Unknown finishers are flagged as estimated. A spatial diagram of the physical funnel is out of scope for the first version.
_Avoid_: Queue view, funnel map (ambiguous with capacity sizing)

**Queue moment summary**:
The breakdown shown above the queue table at the selected moment. The section heading carries total queue depth at the selected moment (e.g. “Queue at selected moment (719)”). For multi-lane layouts: every configured finish funnel lane is listed. Per lane, queued finishers and queue-zone utilisation as occupied / maximum finishers and occupied / maximum metres (queue zone = lane length minus deceleration; occupied metres = queued in lane × finisher spacing, shown to one decimal place). Under each lane, which physical batches have finishers currently assigned to that lane and how many — only batches with at least one queued finisher in that lane, listed in switch order (e.g. lane 1: unnamed 12, B 381). When finish-line backup is modelled and finishers are blocked at the finish line at the selected moment, an additional line states how many have not yet entered the funnel. Replaces the single-line queue depth paragraph. For a single finish funnel lane, show the lane utilisation line only — no physical batch nesting (batch marker cards are not used).
_Avoid_: Lane status panel, funnel snapshot

**Finish-line blocked finisher**:
At the selected moment, a finisher who has passed the finish line by published (or estimated) finish time but has not yet had a finisher arrival into the funnel because finish-line backup delayed admission. Not counted in queue depth or lane occupancy until they enter.
_Avoid_: Waiting to enter, pre-funnel finisher

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
For a queued finisher at the selected moment, the full wait from finisher arrival to simulated token handover: token handover time minus finisher arrival. Equals time waiting plus time until token at that instant. Shown as a clock duration.
_Avoid_: Total wait, queue duration (ambiguous with physical funnel length)

**Finish Tokens settings**:
The configurable token handover rate (tokens per minute per Finish Tokens volunteer) and number of Finish Tokens volunteers used in the simulation. Default: 15 tokens/min, 1 volunteer.
_Avoid_: Service settings, handover settings
