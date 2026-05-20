import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { ProgressBar } from "@/components/common/ProgressBar";

function getFillWidth(container: HTMLElement): string {
  const fill = container.querySelector("[style*='width']") as HTMLElement | null;
  return fill?.style.width ?? "";
}

describe("ProgressBar", () => {
  it("computes 50% for half-filled value", () => {
    const { container } = render(<ProgressBar value={50} max={100} />);
    expect(getFillWidth(container)).toBe("50%");
  });

  it("clamps over-max value to 100%", () => {
    const { container } = render(<ProgressBar value={150} max={100} />);
    expect(getFillWidth(container)).toBe("100%");
  });

  it("clamps negative value to 0%", () => {
    const { container } = render(<ProgressBar value={-10} max={100} />);
    expect(getFillWidth(container)).toBe("0%");
  });

  it("returns 0% when max is zero (no division by zero)", () => {
    const { container } = render(<ProgressBar value={5} max={0} />);
    expect(getFillWidth(container)).toBe("0%");
  });

  it("returns 0% when max is negative", () => {
    const { container } = render(<ProgressBar value={5} max={-5} />);
    expect(getFillWidth(container)).toBe("0%");
  });

  it("defaults max to 100", () => {
    const { container } = render(<ProgressBar value={42} />);
    expect(getFillWidth(container)).toBe("42%");
  });
});
