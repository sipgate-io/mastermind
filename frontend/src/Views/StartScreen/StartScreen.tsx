import { useEffect, useState } from "react";
import { getNumberToCall, getRankings, Ranking } from "../../api";
import "./StartScreen.css";

const MastermindRankingRow = (props: {
  number: string;
  score: number;
  first?: boolean;
}) => {
  return (
    <div className="startScreen_ranking_row">
      {props.first ? (
        <>
          <img src="/first.png" />
          <span className="startScreen_ranking_row_first">{props.number}</span>
        </>
      ) : (
        <span>{props.number}</span>
      )}
      <span>{props.score}</span>
    </div>
  );
};

const MastermindRanking = () => {
  const [rankings, setRanking] = useState([] as Ranking[]);

  useEffect(() => {
    getRankings().then((ranking) => {
      setRanking(ranking);
    });
  }, []);

  let items = [];
  for (let i = 0; i < rankings.length; i++) {
    if (i >= 3) break;
    items.push(
      <MastermindRankingRow
        first={i === 0}
        number={rankings[i].usersTel}
        score={rankings[i].score}
      />
    );
  }

  if (items.length > 0) {
    return (
      <div className="startScreen_top startScreen_ranking">
        <div className="startScreen_ranking_header">
          <span>PLAYER</span>
          <span>SCORE</span>
        </div>
        {items}
      </div>
    );
  } else {
    return <MastermindLogo />;
  }
};

const MastermindLogo = () => {
  return (
    <div className="startScreen_top startScreen_logo">
      <span>MASTERMIND</span>
      <span>BY SIPGATE</span>
    </div>
  );
};

export const StartScreen = () => {
  const [numberToCall, setNumberToCall] = useState("");

  useEffect(() => {
    getNumberToCall().then((numberResponse) => {
      setNumberToCall(numberResponse);
    });
  }, []);

  return (
    <div className="startScreen">
      {/* <MastermindLogo /> */}
      <MastermindRanking />
      <div className="startScreen_img">
        <div>
          <img src="/anrufen.png" />
          <div className="startScreen_img_number">
            <span>CALL TO PLAY</span>
            <span>{numberToCall}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
