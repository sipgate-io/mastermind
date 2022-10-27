import { TextLayout } from "../../Components/TextLayout/TextLayout";
import "./RulesView.css";

export const RulesView = () => {
  return (
    <TextLayout title="Regeln" acceptText="Verstanden">
      <div className="rulesText">
        <div>
          In Mastermind geht es darum, einen Zahlencode aus vier verschiedenen
          Ziffern in 1–10 Versuchen zu erraten. Nachdem du einen Code erraten
          hast, gibt dir das Spiel folgendes visuelles Feedback:
        </div>
        <div className="rulesList">
          <div className="rulesListItem">
            <div className="rulesListItemGreen" />
            <div>Ziffern sind an der richtigen Stelle</div>
          </div>
          <div className="rulesListItem">
            <div className="rulesListItemGrey" />
            <div>Ziffern kommen im Code vor, aber an der falschen Stelle</div>
          </div>
          <div className="rulesListItem">
            <div className="rulesListItemWhite" />
            <div>Ziffern sind noch komplett falsch</div>
          </div>
        </div>
        <div>
          Diese neuen Informationen helfen dir, im nächsten Versuch besser zu
          raten. Je schneller und in je weniger Versuchen du den Code errätst,
          desto mehr Punkte bekommst du.
        </div>
      </div>
    </TextLayout>
  );
};
