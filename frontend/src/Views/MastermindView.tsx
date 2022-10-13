import { FC } from "react";

const MastermindView = ({ gameData }: any) => {
  const gameRows = () => {
    console.log(gameData);
    let tr = [];
    for (let i = 0; i < gameData.mastermindHeight; i++) {
      if (gameData.pastGuesses[i]) {
        tr.push(<tr>{convertGuess(gameData.pastGuesses[i].rowNumbers)}</tr>);
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

  const convertGuess = (guess: Array<number | null>, activeIndex?: number) => {
    return guess.map((index, key) => {
      return (
        <td className={key === activeIndex ? "active" : ""}>
          {index ? index : "-"}
        </td>
      );
    });
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
