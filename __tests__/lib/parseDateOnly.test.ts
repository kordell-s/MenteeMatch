import { parseDateOnly } from "@/lib/utils";

describe("parseDateOnly", () => {
  it("keeps a picked day the same day west of UTC", () => {
    const d = parseDateOnly("2026-12-20");
    // Anguilla is UTC-4: midday UTC is 8am local on the same day
    const local = new Date(d.getTime() - 4 * 60 * 60 * 1000);
    expect(local.getUTCDate()).toBe(20);
  });

  it("leaves full timestamps alone", () => {
    expect(parseDateOnly("2026-12-20T09:30:00Z").toISOString()).toBe("2026-12-20T09:30:00.000Z");
  });
});
