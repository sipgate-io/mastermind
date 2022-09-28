import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";

// TODO: write useful tests
test("renders rankings header", () => {
  render(<App />);
  const linkElement = screen.getByText(/Rankings/i);
  expect(linkElement).toBeInTheDocument();
});
