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
The finish times and positions published on a parkrun event results page. Loaded from a bundled fixture in v1; later from a results-page userscript. Parsed and Unknown-handled in finish-funnel first; proven logic ported to tampermonkey-parkrun when the userscript ships.
_Avoid_: Results data, finish data (too vague)

**Finisher spacing**:
The assumed distance in metres each finisher occupies in a single-lane finish funnel. Configurable; default 0.75 m. Used to derive the queue portion of physical funnel length from queue capacity.
_Avoid_: Metres per person (too informal), lane density

**Deceleration zone**:
A fixed length in metres at the finish-line end of the finish funnel, where fast finishers slow to walking pace after crossing the finish line. Added to physical funnel length but not to queue capacity. Default: 5 m.
_Avoid_: Run-off area, slowing distance

**Queue depth**:
The number of finishers waiting in the finish funnel for a finish token at a given moment during the event. The peak queue depth determines the recommended queue capacity. Charted against clock finish time on the x-axis.
_Avoid_: Backlog (ambiguous with processing delays), queue length (ambiguous with physical length)

**Finish Tokens settings**:
The configurable token handover rate (tokens per minute per Finish Tokens volunteer) and number of Finish Tokens volunteers used in the simulation. Default: 15 tokens/min, 1 volunteer.
_Avoid_: Service settings, handover settings
