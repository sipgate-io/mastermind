import React, { useEffect, useState } from "react";
import { getRankings, Ranking } from "./api";
import "./App.css";
import { IMessageEvent, w3cwebsocket as W3CWebSocket } from "websocket";
//import useWindowSize from 'react-use/lib/useWindowSize'
import Confetti from "react-confetti";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import IntroductionView from "./Views/IntroductionView";
import HighscoreView from "./Views/HighscoreView";
import ConsentView from "./Views/ConsentView";
import MastermindView from "./Views/MastermindView";

const client = new W3CWebSocket("ws://localhost:8000/");

function App() {
  const [gameData, setGameData] = useState({});

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
        window.location.href = "/play";
      }
      if (data.type === "userHungUp") {
        window.location.href = "/ranking";
      }
    }
  };
  client.onerror = function () {
    console.log("Connection Error");
  };
  return (
    <div>
      <div>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<IntroductionView />} />
            <Route path="/consent" element={<ConsentView />} />
            <Route
              path="/play"
              element={<MastermindView gameData={gameData} />}
            />
            <Route path="/ranking" element={<HighscoreView />} />
            <Route
              path="*"
              element={
                <div className="container">
                  <h2>404 Site not found </h2>
                </div>
              }
            />
          </Routes>
        </BrowserRouter>
      </div>
    </div>
  );
}

export default App;
