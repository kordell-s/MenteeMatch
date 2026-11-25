import { sourceLabel } from "@/app/demo/ncba/ui";

describe("sourceLabel", () => {
  it("names each claim source honestly", () => {
    expect(sourceLabel("verified")).toBe("Mentor-verified");
    expect(sourceLabel("self")).toBe("Self-declared");
    expect(sourceLabel("hr")).toBe("From HR records");
  });
});
