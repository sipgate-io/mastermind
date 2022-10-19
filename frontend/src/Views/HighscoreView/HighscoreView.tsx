import React, { FC, useEffect, useState } from "react";
import Confetti from "react-confetti";
import { getRankings, Ranking } from "../../api";
import "./HighscoreView.css";

type State<T> =
  | { state: "pending" }
  | { state: "error"; error: Error }
  | { state: "finished"; value: T };

const millisToMinutesAndSeconds = (millis: number) => {
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

      <div className="rowContainer">
        <div className="section index">1</div>
        <div className="section phonenumber">234324</div>
        <div className="section time">00:23</div>
        <div className="row tries">3</div>
      </div>

      <ul>
        {ranking.state === "error" && (
          <p>{`Error: ${ranking.error.message}`}</p>
        )}
        {ranking.state === "finished" &&
          ranking.value.map((ranking, index) => (
            <li key={index}>
              <div>
                <span>{index + 1}.</span>
                <span
                  key={ranking.key}
                  style={{ marginLeft: "1rem" }}
                  className={ranking.isHighlighted ? "highlightRanking" : ""}
                >
                  {`${ranking.usersTel} benötigte ${
                    ranking.tries
                  } Versuche und hat ${millisToMinutesAndSeconds(
                    ranking.duration
                  )} gebraucht.`}
                </span>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default HighscoreView;
