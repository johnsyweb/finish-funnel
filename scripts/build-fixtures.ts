import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parseFinishTimeToSeconds } from "../src/parseFinishTimeToSeconds";
import { parseResultsHtml } from "../src/parseResultsHtml";

type FixtureFinisher = { position: number; name: string; time: string };

type EventFixture = {
  id: string;
  eventName: string;
  eventNumber: number;
  countryUrl: string;
  finishers: FixtureFinisher[];
};

function extractFinishersFromResultsHtml(html: string): FixtureFinisher[] {
  return parseResultsHtml(html);
}

function buildFixture({
  id,
  eventName,
  eventNumber,
  countryUrl,
  htmlPath,
  outputPath,
}: {
  id: string;
  eventName: string;
  eventNumber: number;
  countryUrl: string;
  htmlPath: string;
  outputPath: string;
}): EventFixture {
  const html = readFileSync(htmlPath, "utf8");
  const finishers = extractFinishersFromResultsHtml(html);

  if (finishers.length === 0) {
    throw new Error(`No finishers parsed from ${htmlPath}`);
  }

  const fixture: EventFixture = {
    id,
    eventName,
    eventNumber,
    countryUrl,
    finishers,
  };

  writeFileSync(outputPath, `${JSON.stringify(fixture, null, 2)}\n`);
  return fixture;
}

const bushy = buildFixture({
  id: "bushy-1095",
  eventName: "Bushy parkrun",
  eventNumber: 1095,
  countryUrl: "https://www.parkrun.org.uk/bushy/results/1095/",
  htmlPath: "/tmp/bushy1095.html",
  outputPath: fileURLToPath(
    new URL("../public/fixtures/bushy-1095.json", import.meta.url),
  ),
});

const mernda = buildFixture({
  id: "mernda-400",
  eventName: "Mernda parkrun",
  eventNumber: 400,
  countryUrl: "https://www.parkrun.com.au/mernda/results/400/",
  htmlPath: "/tmp/mernda400.html",
  outputPath: fileURLToPath(
    new URL("../public/fixtures/mernda-400.json", import.meta.url),
  ),
});

for (const fixture of [bushy, mernda]) {
  const unknownCount = fixture.finishers.filter(
    (finisher) => parseFinishTimeToSeconds(finisher.time) === null,
  ).length;
  console.log(
    `${fixture.id}: ${fixture.finishers.length} finishers, ${unknownCount} unknown times`,
  );
}
