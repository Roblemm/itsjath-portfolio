import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const srcDir = fileURLToPath(new URL("../..", import.meta.url));

function waypointTop(className: string): number {
  const css = readFileSync(join(srcDir, "styles", "signal.css"), "utf8");
  const match = css.match(
    new RegExp(`\\.${className} \\{[^}]*top: ([0-9.]+)%;`),
  );
  if (!match) throw new Error(`Missing top value for ${className}`);
  return Number(match[1]);
}

describe("signal waypoint path", () => {
  it("keeps the proof waypoint below the approach exit so the signal travels downward", () => {
    expect(waypointTop("signal-waypoint--stats")).toBeGreaterThan(
      waypointTop("signal-waypoint--manifesto-out"),
    );
  });
});
