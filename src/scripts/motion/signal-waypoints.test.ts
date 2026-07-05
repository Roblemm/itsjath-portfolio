import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const srcDir = fileURLToPath(new URL("../..", import.meta.url));
const pagesDir = fileURLToPath(new URL("../../pages", import.meta.url));

function waypointTop(className: string): number {
  const css = readFileSync(join(srcDir, "styles", "signal.css"), "utf8");
  const match = css.match(
    new RegExp(`\\.${className} \\{[^}]*top: ([0-9.]+)%;`),
  );
  if (!match) throw new Error(`Missing top value for ${className}`);
  return Number(match[1]);
}

describe("signal waypoint path", () => {
  it("keeps the homepage waypoints moving downward through proof", () => {
    const tops = [
      "signal-waypoint--hero-start",
      "signal-waypoint--manifesto-in",
      "signal-waypoint--manifesto-out",
      "signal-waypoint--stats",
    ].map(waypointTop);

    expect(tops).toEqual([...tops].sort((a, b) => a - b));
  });

  it("keeps the proof waypoint below the approach exit so the signal travels downward", () => {
    expect(waypointTop("signal-waypoint--stats")).toBeGreaterThan(
      waypointTop("signal-waypoint--manifesto-out"),
    );
  });

  it("marks sticky approach waypoints for live measurement", () => {
    const source = readFileSync(join(pagesDir, "index.astro"), "utf8");

    expect(source).toContain('class="manifesto__sticky"');
    expect(source).toContain("data-signal-live-waypoints");
  });
});
