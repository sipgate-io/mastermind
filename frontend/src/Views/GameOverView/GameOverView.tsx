import "./GameOverView.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

export const GameOverView = () => {
  const location = useLocation();

  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      navigate("/");
    }, 8000);
  }, []);

  return (
    <div className="gameOver">
      <div className="gameOverImage">
        {location.state.hasWon && location.state.position === 1 ? (
          <img src="/first.png" />
        ) : null}
      </div>
      <div className="gameOverTitle">
        {location.state.hasWon ? (
          <>
            <span>
              {location.state.position === 1 ? "NEW HIGHSCORE" : "YOUR SCORE"}
            </span>
            <span>{location.state.score}</span>
          </>
        ) : (
          <span>GAME OVER</span>
        )}
      </div>
      <div className="gameOverRanking">
        {location.state.hasWon ? (
          <span>RANKING: {location.state.position}</span>
        ) : null}
      </div>
    </div>
  );
};
