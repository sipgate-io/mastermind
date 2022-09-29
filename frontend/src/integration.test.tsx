import { render, screen, waitFor } from "@testing-library/react";
import { spawn } from "child_process";
import App from "./App";

const PATH_TO_INTEGRATION_DB = "test/mastermind_integration_test.db";
const INTEGRATION_DB_PHONE = "6789";

function wait(time: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}

test("end-to-end test works", async () => {
  const proc = spawn("node", ["build/API_Controller.js"], {
    env: {
      ...process.env,
      DB_FILE_NAME: PATH_TO_INTEGRATION_DB,
    },
    cwd: "../backend/",
    detached: true,
  });

  await wait(500);
  render(<App />);

  await waitFor(() => {
    const linkElement = screen.getByText((text) => {
      return text.includes(INTEGRATION_DB_PHONE);
    });
    expect(linkElement).toBeInTheDocument();
  });

  proc.kill();
});
