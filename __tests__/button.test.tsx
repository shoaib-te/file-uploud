import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "@jest/globals"
import { Button } from "../components/ui/button"

describe("Button", () => {
  it("renders its label", () => {
    render(<Button>Save file</Button>)

    expect(screen.getByRole("button", { name: "Save file" }).textContent).toBe("Save file")
  })
})