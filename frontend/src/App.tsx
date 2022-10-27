import React, { useEffect, useState } from "react";
import "./App.css";
import { IMessageEvent, w3cwebsocket as W3CWebSocket } from "websocket";
import { Route, Routes, useNavigate } from "react-router-dom";
import MastermindView, {
  MastermindViewProps,
} from "./Views/MastermindView/MastermindView";
import { GameFinished } from "./Views/GameFinished/GameFinished";
import HighscoreView from "./Views/HighscoreView/HighscoreView";
import { StartScreen } from "./Views/StartScreen/StartScreen";
import { DisclaimerView } from "./Views/DisclaimerView/DisclaimerView";
import { RulesView } from "./Views/RulesView/RulesView";
import { GameOverView } from "./Views/GameOverView/GameOverView";

const client = new W3CWebSocket("ws://localhost:8000/");

function App() {
  const [gameData, setGameData] = useState<MastermindViewProps | undefined>();
  const [gameStart, setGameStart] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    client.onopen = () => {
      console.log("WebSocket Client Connected");
    };

    client.onmessage = (message: IMessageEvent) => {
      if (typeof message.data === "string") {
        const data = JSON.parse(message.data);

        switch (data.type) {
          case "gameData": {
            setGameData(JSON.parse(data.message));
            break;
          }
          case "newCall": {
            navigate("/consent");
            break;
          }
          case "consentAccepted": {
            navigate("/rules");
            break;
          }
          case "rulesAccepted": {
            setGameStart(Date.now());
            navigate("/play");
            break;
          }
          case "userHungUp": {
            navigate("/");
            break;
          }
          case "gameFinished": {
            navigate("/gameOver", {
              state: JSON.parse(data.message),
            });
            break;
          }
        }
      }
    };

    client.onerror = function () {
      console.log("Connection Error");
    };
  }, []);

  return (
    <Routes>
      {/* <Route path="/" element={<IntroductionView />} /> */}
      <Route path="/" element={<StartScreen />} />
      <Route
        path="/play"
        element={<MastermindView gameStart={gameStart} gameData={gameData} />}
      />
      <Route path="/gameFinished" element={<GameFinished />} />
      <Route path="/disclaimer" element={<DisclaimerView />} />
      <Route path="/rules" element={<RulesView />} />
      <Route
        path="/gameOver"
        element={<GameOverView hasWon={true} rank={1} score={123} />}
      />

      <Route
        path="*"
        element={
          <div className="rowContainer">
            <h2>404 Site not found </h2>
          </div>
        }
      />
    </Routes>
  );
}

export default App;
