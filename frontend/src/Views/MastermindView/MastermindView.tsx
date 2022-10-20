import { ReactNode, useEffect, useState } from "react";
import { millisToMinutesAndSeconds } from "../HighscoreView/HighscoreView";
import "./MastermindView.css";
import { BsAsterisk, BsHash } from "react-icons/bs";

interface GameResult {
  isWon: boolean;
  tries: number;
  duration: number;
}

interface Pointer {
  row: number;
  column: number;
}

interface MastermindRow {
  rowNumbers: Array<number>;
  correctNumbersRightPlace: number;
  correctNumbersWrongPlace: number;
}

export interface MastermindViewProps {
  mastermindHeight: number;
  currentRow: Array<number | undefined>;
  pastGuesses: Array<MastermindRow>;
  gameResult: GameResult;
  errorMessage: string;
  pointer: Pointer;
}

const MastermindGuessFeedback = (props: {
  correctNumber: number;
  wrongNumber: number;
}) => {
  let index = 0;

  return (
    <div className="grid-guess-feedback">
      {Array.from(Array(props.correctNumber).keys()).map(() => {
        return (
          <div
            key={index++}
            className="grid-guess-feedback__circle rightPlace"
          />
        );
      })}

      {Array.from(Array(props.wrongNumber).keys()).map(() => {
        return (
          <div
            key={index++}
            className="grid-guess-feedback__circle wrongPlace"
          />
        );
      })}

      {Array.from(
        Array(4 - props.correctNumber - props.wrongNumber).keys()
      ).map(() => {
        return <div key={index++} className="grid-guess-feedback__circle" />;
      })}
    </div>
  );
};

const MastermindRow = (props: {
  numbers: (number | undefined)[];
  index: number;
  activeColumn?: number;
  correctNumber: number;
  wrongNumber: number;
}) => {
  return (
    <>
      <span className="grid-index">{props.index}</span>
      {props.numbers.map((num, index) => {
        return (
          <div
            key={index}
            className={`grid-circle ${
              index === props.activeColumn ? "grid-circle__active" : ""
            }`}
          >
            {num}
          </div>
        );
      })}
      <MastermindGuessFeedback
        correctNumber={props.correctNumber}
        wrongNumber={props.wrongNumber}
      />
    </>
  );
};

const MastermindView = ({
  gameData,
  gameStart,
}: {
  gameData?: MastermindViewProps;
  gameStart: number;
}) => {
  let rows: ReactNode[] = [];

  if (gameData) {
    let index = 0;
    // pastGuesses
    gameData.pastGuesses.map((guess) => {
      rows.push(
        <MastermindRow
          key={index}
          numbers={guess.rowNumbers}
          index={++index}
          correctNumber={guess.correctNumbersRightPlace}
          wrongNumber={guess.correctNumbersWrongPlace}
        />
      );
    });

    // currentRow
    if (rows.length < gameData.mastermindHeight) {
      rows.push(
        <MastermindRow
          key={index}
          index={++index}
          numbers={gameData.currentRow}
          activeColumn={gameData.pointer.column}
          correctNumber={0}
          wrongNumber={0}
        />
      );
    }

    // fill with empty rows
    const numRows = gameData.mastermindHeight - index;

    for (let i = 0; i < numRows; i++) {
      rows.push(
        <MastermindRow
          key={index}
          index={++index}
          numbers={[undefined, undefined, undefined, undefined]}
          correctNumber={0}
          wrongNumber={0}
        />
      );
    }
  }

  const [_, setTime] = useState(0);
  useEffect(() => {
    setInterval(() => {
      setTime(Date.now());
    }, 100);
  }, []);

  return (
    <div>
      <div className="grid">
        <div />
        <div className="grid-time">
          {gameStart > 0
            ? millisToMinutesAndSeconds(Date.now() - gameStart)
            : ""}
        </div>
        {rows}
        {gameData ? (
          <div className="grid-message">
            <div className="controls">
              <div>
                <BsAsterisk fontSize={18} />= Weiter
              </div>
              <div className="controls-hash">
                <BsHash fontSize={24} />= Reihe bestätigen
              </div>
            </div>
            {gameData.errorMessage ? (
              <div className="feedback">{gameData.errorMessage}</div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default MastermindView;
