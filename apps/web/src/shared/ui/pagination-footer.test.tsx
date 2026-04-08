import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PaginationFooter } from "./pagination-footer";

describe("PaginationFooter", () => {
  it("does not render when totalPages is 1", () => {
    const { container } = render(
      <PaginationFooter page={1} totalPages={1} onPageChange={() => undefined} />,
    );

    expect(container.firstChild).toBeNull();
  });

  it("calls onPageChange when next button is clicked", () => {
    const onPageChange = vi.fn();

    render(<PaginationFooter page={1} totalPages={3} onPageChange={onPageChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Proxima" }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});