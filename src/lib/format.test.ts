import { describe, expect, it } from "vitest"

import { formatBytes, formatPosition, formatUptime, isStale } from "./format"

describe("formatUptime", () => {
  it("formats minutes, hours and days", () => {
    expect(formatUptime(90)).toBe("1 min")
    expect(formatUptime(3 * 3600 + 120)).toBe("3 h 2 min")
    expect(formatUptime(2 * 86_400 + 5 * 3600)).toBe("2 j 5 h")
  })
})

describe("isStale", () => {
  it("marks old snapshots as stale", () => {
    expect(isStale(new Date(Date.now() - 10_000).toISOString())).toBe(false)
    expect(isStale(new Date(Date.now() - 120_000).toISOString())).toBe(true)
    expect(isStale(null)).toBe(true)
  })
})

describe("formatPosition", () => {
  it("renders missing positions as a dash", () => {
    expect(formatPosition(null)).toBe("—")
    expect(formatPosition(1234)).toBe("1\u202f234")
  })
})

describe("formatBytes", () => {
  it("formats bytes with French units", () => {
    expect(formatBytes(null)).toBe("—")
    expect(formatBytes(512)).toBe("512 o")
    expect(formatBytes(2048)).toBe("2 Ko")
    expect(formatBytes(1536)).toBe("1,5 Ko")
    expect(formatBytes(5 * 1024 * 1024)).toBe("5 Mo")
  })
})
