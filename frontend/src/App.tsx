import React, { useEffect, useState } from "react";
import { getRankings, Ranking } from "./api";
import "./App.css";

type State<T> =
  | { state: "pending" }
  | { state: "error"; error: unknown }
  | { state: "finished"; value: T };

function App() {
  const [ranking, setRanking] = useState<State<Ranking[]>>({
    state: "pending",
  });

  useEffect(() => {
    getRankings()
      .then((value) => setRanking({ state: "finished", value }))
      .catch((error) => setRanking({ state: "error", error }));
  }, []);

  return (
    <div>
      <h1>Rankings</h1>

      <ul>
        {ranking.state === "pending" && <p>Spinning...</p>}
        {ranking.state === "error" && <p>{`Error: ${ranking.error}`}</p>}
        {ranking.state === "finished" &&
          ranking.value.map((ranking, index) => (
            <li key={index}>
              <div>
                <span>{index + 1}.</span>
                <span style={{ marginLeft: "1rem" }}>
                  {`${ranking.usersTel} benötigte ${ranking.tries} Versuche und hat ${ranking.duration} gebraucht.`}
                </span>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
}

export default App;
