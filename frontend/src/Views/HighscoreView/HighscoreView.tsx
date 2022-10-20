import React, { FC, useEffect, useState } from "react";
import Confetti from "react-confetti";
import { getRankings, Ranking } from "../../api";
import "./HighscoreView.css";

type State<T> =
  | { state: "pending" }
  | { state: "error"; error: Error }
  | { state: "finished"; value: T };

export const millisToMinutesAndSeconds = (millis: number) => {
  const minutes = Math.floor(millis / 60000);
  const seconds = Math.floor((millis % 60000) / 1000);

  return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
};

const HighscoreView = (props: {
  highlight?: {
    position: number;
  };
}) => {
  useEffect(() => {
    if (props.highlight && props.highlight?.position <= 3) {
      setConfettiActive(true);
    }

    getRankings()
      .then((value) => {
        if (props.highlight) {
          for (let i = 0; i < value.length; i++) {
            // by setting the key to a unique value, we force React to render a new HTML component
            // and thereby restarting the CSS animation
            value[i].key = i === props.highlight?.position - 1 ? Date.now() : i;
          }

          value[props.highlight?.position - 1].isHighlighted = true;
        }

        setRanking({ state: "finished", value });
      })
      .catch((error) => setRanking({ state: "error", error }));
  }, [props.highlight]);

  const [ranking, setRanking] = useState<State<Ranking[]>>({
    state: "pending",
  });

  const [confettiActive, setConfettiActive] = useState(false);

  return (
    <div>
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

      <div className="container">
        <div className="row title">
          <div className="index"></div>
          <div className="player">Spieler:in</div>
          <div className="time">Zeit</div>
          <div className="tries">Versuche</div>
        </div>

        {ranking.state === "error" && (
          <p>{`Error: ${ranking.error.message}`}</p>
        )}
        {ranking.state === "finished" &&
          ranking.value.slice(0, 10).map((ranking, index) => (
            <div
              className={
                "row content" +
                (index === props.highlight?.position ? " highlight" : "")
              }
              key={`ranking-${index}`}
            >
              <div className="index">{index + 1}</div>
              <div className="player">{ranking.usersTel}</div>
              <div className="time">
                {millisToMinutesAndSeconds(ranking.duration)}
              </div>
              <div className="tries">{ranking.tries}</div>
            </div>
          ))}

        <div className="cta">
          Du willst mehr über sipgate und das Hacking Talents Programm erfahren?
          Dann besuch uns doch auf sipgate.ht
        </div>
      </div>
    </div>
  );
};

export default HighscoreView;
