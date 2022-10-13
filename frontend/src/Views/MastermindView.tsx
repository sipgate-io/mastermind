import { FC } from "react";

const MastermindView = ({ gameData }: any) => {
  const gameRows = () => {
    console.log(gameData);
    let tr = [];
    for (let i = 0; i < gameData.mastermindHeight; i++) {
      if (gameData.pastGuesses[i]) {
        tr.push(
          <tr>
            {convertGuess(
              gameData.pastGuesses[i].rowNumbers,
              -1,
              gameData.pastGuesses[i].correctNumbersRightPlace,
              gameData.pastGuesses[i].correctNumbersWrongPlace
            )}
          </tr>
        );
      } else {
        if (gameData.pointer.row === i) {
          tr.push(
            <tr>
              {convertGuess(gameData.currentRow, gameData.pointer.column)}
            </tr>
          );
        } else {
          tr.push(<tr>{convertGuess([null, null, null, null])}</tr>);
        }
      }
    }

    return <table>{tr}</table>;
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
      Dies wird eine MastermindView
      <br />
      {gameRows()}
    </div>
  );
};

export default MastermindView;
