import { describe, expect, it } from "vitest";

import { formatCompactCount, formatDateTime } from "./formatters";

describe("formatters", () => {
  it("returns dash for null date", () => {
    expect(formatDateTime(null)).toBe("-");
  });

  it("formats valid date string", () => {
    const formatted = formatDateTime("2026-01-01T10:00:00.000Z");
    expect(formatted).not.toBe("-");
  });

  it("formats compact counts", () => {
    expect(formatCompactCount(1_500)).toContain("mil");
  });
});