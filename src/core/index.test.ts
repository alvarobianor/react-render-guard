import { describe, it, expect } from "vitest";
import { calculateWasteRatio } from "./index";

describe("calculateWasteRatio", () => {
  it("should return 0 when parent duration is 0", () => {
    expect(calculateWasteRatio(10, 0)).toBe(0);
  });

  it("should return correct ratio", () => {
    expect(calculateWasteRatio(5, 10)).toBe(0.5);
    expect(calculateWasteRatio(30, 10)).toBe(3);
  });

  it("should handle small numbers", () => {
    expect(calculateWasteRatio(0.1, 0.5)).toBe(0.2);
  });
});
