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

export interface mastermindViewProps {
  mastermindHeight: number;
  currentRow: Array<number>;
  pastGuesses: Array<MastermindRow>;
  gameResult: GameResult;
  errorMessage: string;
  pointer: Pointer;
}

const MastermindView = ({ gameData }: { gameData?: mastermindViewProps }) => {
  const mastermindArray = () => {
    if (gameData) {
      return Array.from(Array(gameData.mastermindHeight).keys());
    }
    return [];
  };
  const renderRightNumber = (styleClass: string, count: number) => {
    let _div = "";

    for (let i = 0; i < count; i++) {
      _div += <div className={`circleGuess ${styleClass}`}></div>;
    }
    return _div;
  };

  const renderEmptyRow = (index: number) => {
    return (
      <div className="rowContainer">
        <div className="section index">{index + 1}</div>
        <div className="section">
          <div className="circle active">2</div>
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
        return (
          <div className="rowContainer">
            <div className="section index">{index + 1}</div>
            <div className="section">
              <div className="circle active">2</div>
              <div className="circle"></div>
              <div className="circle">4</div>
              <div className="circle"></div>
            </div>
            <div className="section gridSection">
              <div className="circleGuess rightPlace"></div>
              <div className="circleGuess wrongPlace"></div>
              <div className="circleGuess"></div>
              <div className="circleGuess"></div>
            </div>
          </div>
        );
      })}
      <div className="rowContainer">
        <div className="section index">1</div>
        <div className="section">
          <div className="circle active">2</div>
          <div className="circle"></div>
          <div className="circle">4</div>
          <div className="circle"></div>
        </div>
        <div className="section gridSection">
          <div className="circleGuess rightPlace"></div>
          <div className="circleGuess wrongPlace"></div>
          <div className="circleGuess"></div>
          <div className="circleGuess"></div>
        </div>
      </div>

      <div className="rowContainer">
        <div className="feedback">
          Bitte alle Felder dieser Zeile ausfüllen.
        </div>
      </div>
    </div>
  );
};

export default MastermindView;
