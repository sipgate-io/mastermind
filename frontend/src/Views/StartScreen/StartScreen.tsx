import "./StartScreen.css";

const MastermindRankingRow = (props: {
  number: string;
  score: string;
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
  return (
    <div className="startScreen_top startScreen_ranking">
      <div className="startScreen_ranking_header">
        <span>PLAYER</span>
        <span>SCORE</span>
      </div>
      <MastermindRankingRow first score="99998" number="...8912" />
      <MastermindRankingRow score="99961" number="...2839" />
      <MastermindRankingRow score="99949" number="...3482" />
    </div>
  );
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
  return (
    <div className="startScreen">
      {/* <MastermindLogo /> */}
      <MastermindRanking />
      <div className="startScreen_img">
        <div>
          <img src="/anrufen.png" />
          <div className="startScreen_img_number">
            <span>CALL TO PLAY</span>
            <span>0203 928694650</span>
          </div>
        </div>
      </div>
    </div>
  );
};
