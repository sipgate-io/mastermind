import { FC, useEffect, useState } from "react";
import { getNumberToCall } from "../api";
import { TextLayout, TextLayoutAction, TextLayoutActionSpan } from "../Components/TextLayout/TextLayout";
import "./IntroductionView.css"

const IntroductionView: FC = ({ }) => {
  const [numberToCall, setNumberToCall] = useState("");

  useEffect(() => {
    getNumberToCall().then((numberResponse) => {
      setNumberToCall(numberResponse);
    });
  }, []);

  return <TextLayout title="Mastermind">
    <div>
      <p>
        In Mastermind geht es darum, einen Zahlencode aus vier verschiedenen Ziffern in bis zu 10 Versuchen zu erraten.
      </p>
      <p>
        Nachdem du einen Code geraten hast, gibt dir das Spiel zwei Zahlen als Feedback:
      </p>
      [x] -&gt; wie viele Ziffern an der richtigen Stelle sind<br />
      (y) -&gt; wie viele Ziffern zwar im zu erratenen Code vorkommen, aber an der falschen Stelle sind

      <p>
        Diese neuen Informationen helfen dir, im nächsten Versuch besser zu raten.
        Je schneller und in je weniger Versuchen du den Code errätst, desto mehr Punkte bekommst du.
      </p>
    </div>
    <TextLayoutAction>
      Rufe <TextLayoutActionSpan>{numberToCall}</TextLayoutActionSpan> an, um das Spiel zu starten.
    </TextLayoutAction>
  </TextLayout>
};

export default IntroductionView;
