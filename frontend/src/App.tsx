import React, { useEffect, useState } from "react";
import "./App.css";
import { IMessageEvent, w3cwebsocket as W3CWebSocket } from "websocket";
import { Route, Routes, useNavigate } from "react-router-dom";
import IntroductionView from "./Views/IntroductionView";
import ConsentView from "./Views/ConsentView";
import MastermindView, {
  MastermindViewProps,
} from "./Views/MastermindView/MastermindView";
import { GameFinished } from "./Views/GameFinished/GameFinished";
import HighscoreView from "./Views/HighscoreView/HighscoreView";
import { StartScreen } from "./Views/StartScreen/StartScreen";

const client = new W3CWebSocket("ws://localhost:8000/");

function App() {
  const [gameData, setGameData] = useState<MastermindViewProps | undefined>();
  const [rowToHighlight, setRowToHightlight] = useState<
    { position: number } | undefined
  >(undefined);
  const [gameStart, setGameStart] = useState(0);
  // const [gameStart, setGameStart] = useState(Date.now());

  const navigate = useNavigate();

  useEffect(() => {
    // TODO: remove this debug function when it's no longer needed
    // to test the ranking row highlights
    (window as any).setPos = (pos: number) => {
      setRowToHightlight({
        position: pos,
      });
    };

    client.onopen = () => {
      console.log("WebSocket Client Connected");
    };

    client.onmessage = (message: IMessageEvent) => {
      if (typeof message.data === "string") {
        const data = JSON.parse(message.data);

        if (data.type === "gameData") {
          setGameData(JSON.parse(data.message));
        }
        if (data.type === "newCall") {
          window.location.href = "/consent";
        }
        if (data.type === "consentAccepted") {
          setGameStart(Date.now());
          navigate("/play");
        }
        if (data.type === "userHungUp") {
          window.location.href = "/";
        }
        if (data.type === "gameFinished") {
          navigate("/gameFinished", {
            state: JSON.parse(data.message),
          });
          setRowToHightlight({
            position: JSON.parse(data.message).position,
          });
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
      <Route path="/consent" element={<ConsentView />} />
      <Route
        path="/play"
        element={<MastermindView gameStart={gameStart} gameData={gameData} />}
      />
      <Route
        path="/ranking"
        element={<HighscoreView highlight={rowToHighlight} />}
      />
      <Route path="/gameFinished" element={<GameFinished />} />

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
