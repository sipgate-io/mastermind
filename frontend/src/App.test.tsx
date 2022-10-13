import { render, screen, waitFor } from "@testing-library/react";
import App from "./App";
import * as API from "./api";
import { Ranking } from "./api";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import HighscoreView from "./Views/HighscoreView";

test("renders the phone number", async () => {
  const last4Digits = "1234";
  const ranking = [
    {
      duration: 1,
      hasWon: 2,
      tries: 3,
      usersTel: "+xxxxxxx" + last4Digits,
    },
  ] as Ranking[];

  jest.spyOn(API, "getRankings").mockReturnValue(Promise.resolve(ranking));

  render(
    <MemoryRouter initialEntries={["/ranking"]}>
      <Routes>
        <Route path="/ranking" element={<HighscoreView />}>
          <Route path="/ranking" element={<HighscoreView />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
  await waitFor(() => {
    const linkElement = screen.getByText((text) => {
      return text.includes(last4Digits);
    });
    expect(linkElement).toBeInTheDocument();
  });
});

test("renders an error when getRankings fails", async () => {
  const errMessage = "abc";
  jest
    .spyOn(API, "getRankings")
    .mockReturnValue(Promise.reject(new Error(errMessage)));

  render(
    <MemoryRouter initialEntries={["/ranking"]}>
      <Routes>
        <Route path="/ranking" element={<HighscoreView />}>
          <Route path="/ranking" element={<HighscoreView />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
  await waitFor(() => {
    const linkElement = screen.getByText(`Error: ${errMessage}`);
    expect(linkElement).toBeInTheDocument();
  });
});