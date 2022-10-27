import "./GameOverView.css";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export const GameOverView = (props: {
  hasWon: boolean;
  rank: number;
  score: number;
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      navigate("/");
    }, 8000);
  }, []);

  return (
    <div className="gameOver">
      <div className="gameOverImage">
        {props.hasWon && props.rank === 1 ? <img src="/first.png" /> : null}
      </div>
      <div className="gameOverTitle">
        {props.hasWon ? (
          <>
            <span>{props.rank === 1 ? "NEW HIGHSCORE" : "YOUR SCORE"}</span>
            <span>{props.score}</span>
          </>
        ) : (
          <span>GAME OVER</span>
        )}
      </div>
      <div className="gameOverRanking">
        {props.hasWon ? <span>RANKING: {props.rank}</span> : null}
      </div>
    </div>
  );
};
