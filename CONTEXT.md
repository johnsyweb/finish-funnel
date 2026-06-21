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
The distance in metres that the finish funnel should occupy on the ground: deceleration zone plus queue capacity multiplied by finisher spacing. Recommended length is rounded up to the nearest whole metre for practical layout.
_Avoid_: Funnel length alone (ambiguous without stating physical vs capacity)

**Funnel not required**:
When peak queue depth is at most 2 (fixed threshold), the page shows a callout that a roped-off funnel may not be needed for this event. Chart and numbers are still shown for context.
_Avoid_: No funnel, skip funnel (too imperative)

**Finish Tokens**:
The parkrun volunteer role responsible for handing a numbered finish token to each finisher in position order at the end of the finish funnel.
_Avoid_: Finish Token Support, token volunteer (too vague)

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
A finish funnel length in metres entered by the event team to compare against the simulated peak queue. The tool converts it to queue capacity using the current deceleration zone and finisher spacing settings, then reports whether it is sufficient with headroom or shortfall.
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
The clock finish time chosen on the queue depth chart. Queue membership and per-finisher wait metrics are evaluated at this instant. Set by clicking or dragging on the chart; nudged with arrow keys when the chart has focus. Shown as a vertical indicator and readable clock time on the chart. Defaults to the first moment peak queue depth is reached; resets to that moment whenever simulation settings change.
_Avoid_: Scrub time, cursor time, selected time (ambiguous with published finish time)

**Queued finisher**:
At the selected moment, a finisher who has already had a finisher arrival but has not yet received a finish token. Ordered front to back by arrival time; the front finisher is next to receive a token.
_Avoid_: Waiting runner, person in queue (too informal)

**Queue visualisation**:
The UI shown at the selected moment: a summary of queue depth plus a paginated, keyboard-accessible table of queued finishers (front of queue first), 25 rows per page by default, with optional search by name or finish position. Each row shows finish position, name, published finish time, queue position, time waiting, time until token, and total estimated queueing time; Unknown finishers are flagged as estimated. A spatial diagram of the physical funnel is out of scope for the first version.
_Avoid_: Queue view, funnel map (ambiguous with capacity sizing)

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
