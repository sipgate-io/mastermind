import React, { useEffect, useState } from "react";
import { getRankings, Ranking } from "./api";
import "./App.css";
//import useWindowSize from 'react-use/lib/useWindowSize'
import Confetti from "react-confetti";

type State<T> =
  | { state: "pending" }
  | { state: "error"; error: Error }
  | { state: "finished"; value: T };

function App() {
  const [ranking, setRanking] = useState<State<Ranking[]>>({
    state: "pending",
  });
  //const { width, height } = useWindowSize()
  useEffect(() => {
    getRankings()
      .then((value) => setRanking({ state: "finished", value }))
      .catch((error) => setRanking({ state: "error", error }));
  }, []);

  const [confettiActive, setConfettiActive] = useState(false);

  return (
    <div>
      <button
        onClick={() => {
          setConfettiActive(true);
        }}
      >
        Game Finish
      </button>

      {confettiActive ? (
        <Confetti
          numberOfPieces={1000}
          gravity={0.3}
          recycle={false}
          onConfettiComplete={() => {
            setConfettiActive(false);
          }}
        />
      ) : null}

      <h1>Rankings</h1>

      <ul>
        {ranking.state === "error" && (
          <p>{`Error: ${ranking.error.message}`}</p>
        )}
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
