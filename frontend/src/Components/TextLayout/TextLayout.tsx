import { ReactNode } from "react";
import "./TextLayout.css";

export const TextLayout = (props: {
  children: ReactNode;
  title: string;
  acceptText: string;
}) => {
  return (
    <div className="textLayout">
      <div className="textLayoutHeading">{props.title}</div>
      {props.children}
      <div className="textLayoutFooter">
        <div className="textLayoutControl">
          <div className="textLayoutControlStar">
            <span>*</span>
            <span>= {props.acceptText}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
