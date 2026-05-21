import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Avatar } from "@/components/common/Avatar";

describe("Avatar", () => {
  it("renders the first two initials of a two-word name", () => {
    render(<Avatar name="שרה כהן" />);
    expect(screen.getByText("שכ")).toBeInTheDocument();
  });

  it("renders a single initial for a one-word name", () => {
    render(<Avatar name="שרה" />);
    expect(screen.getByText("ש")).toBeInTheDocument();
  });

  it("falls back to '?' when name is empty", () => {
    render(<Avatar name="" />);
    expect(screen.getByText("?")).toBeInTheDocument();
  });

  it("falls back to '?' when name is whitespace only", () => {
    render(<Avatar name="   " />);
    expect(screen.getByText("?")).toBeInTheDocument();
  });

  it("uses the full name as accessible label", () => {
    render(<Avatar name="דוד פרץ" />);
    expect(screen.getByRole("img")).toHaveAccessibleName("דוד פרץ");
  });

  it("applies custom size to width/height", () => {
    render(<Avatar name="א" size={64} />);
    const el = screen.getByRole("img");
    expect(el).toHaveStyle({ width: "64px", height: "64px" });
  });
});
