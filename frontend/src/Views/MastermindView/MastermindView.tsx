import "./MastermindView.css";

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
  currentRow: Array<number>;
  pastGuesses: Array<MastermindRow>;
  gameResult: GameResult;
  errorMessage: string;
  pointer: Pointer;
}

const MastermindView = ({ gameData }: { gameData?: MastermindViewProps }) => {
  const mastermindArray = () => {
    if (gameData) {
      return Array.from(Array(gameData.mastermindHeight).keys());
    }
    return [];
  };
  const renderRightNumber = (styleClass: string, count: number) => {
    const temp = Array.from(Array(count).keys());

    return (
      <>
        {temp.map((data, index) => {
          return <div className={`circleGuess ${styleClass}`}></div>;
        })}
      </>
    );
  };

  const renderEmptyRow = (index: number) => {
    return (
      <div className="rowContainer">
        <div className="section index">{index + 1}</div>
        <div className="section">
          <div className="circle"></div>
          <div className="circle"></div>
          <div className="circle"></div>
          <div className="circle"></div>
        </div>
        <div className="section gridSection">
          <div className="circleGuess"></div>
          <div className="circleGuess"></div>
          <div className="circleGuess"></div>
          <div className="circleGuess"></div>
        </div>
      </div>
    );
  };
  const renderCurrentRow = (
    index: number,
    column: number,
    data: Array<number>
  ) => {
    return (
      <div className="rowContainer">
        <div className="section index">{index + 1}</div>
        <div className="section">
          {data.map((data, index) => {
            return (
              <div className={`circle ${index === column ? "active" : ""}`}>
                {data ? data : ""}
              </div>
            );
          })}
        </div>
        <div className="section gridSection">
          {renderRightNumber("", data.length)}
        </div>
      </div>
    );
  };
  const renderPastGuessRow = (index: number, data: MastermindRow) => {
    return (
      <div className="rowContainer">
        <div className="section index">{index + 1}</div>
        <div className="section">
          {data.rowNumbers.map((data, index) => {
            return <div className="circle">{data}</div>;
          })}
        </div>
        <div className="section gridSection">
          {renderRightNumber("rightPlace", data.correctNumbersRightPlace)}
          {renderRightNumber("wrongPlace", data.correctNumbersWrongPlace)}
          {renderRightNumber(
            "",
            data.rowNumbers.length -
              data.correctNumbersRightPlace -
              data.correctNumbersWrongPlace
          )}
        </div>
      </div>
    );
  };

  const convertGuess = (
    guess: Array<number | null>,
    activeIndex?: number,
    rightPlace?: number,
    wrongPlace?: number
  ) => {
    let temp = guess.map((index, key) => {
      return (
        <td className={key === activeIndex ? "active" : ""}>
          {index ? index : "-"}
        </td>
      );
    });

    if (rightPlace !== undefined && wrongPlace !== undefined) {
      temp.push(<td>[{rightPlace}]</td>);
      temp.push(<td>({wrongPlace})</td>);
    }
    return temp;
  };

  return (
    <div>
      <div className="rowContainer">
        <div className="timer">03:24</div>
      </div>

      {mastermindArray().map((data, index) => {
        if (gameData) {
          if (gameData.pastGuesses[index]) {
            return renderPastGuessRow(index, gameData.pastGuesses[index]);
          }
          if (gameData.pointer.row === index) {
            return renderCurrentRow(
              index,
              gameData.pointer.column,
              gameData.currentRow
            );
          }
          return renderEmptyRow(index);
        } else {
          return "";
        }
      })}

      <div className="rowContainer">
        <div className="feedback">
          Bitte alle Felder dieser Zeile ausfüllen.
        </div>
      </div>
    </div>
  );
};

export default MastermindView;
