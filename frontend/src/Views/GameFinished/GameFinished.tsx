import { useLocation } from "react-router-dom";

export const GameFinished = (props: {}) => {
  const location = useLocation();

  return (
    <div>
      <div>
        <span>Duration:</span>
        <span>{location.state.duration}</span>
      </div>
      <div>
        <span>Attempts:</span>
        <span>{location.state.tries}</span>
      </div>
      <div>
        <span>Position:</span>
        <span>{location.state.position}</span>
      </div>
    </div>
  );
};
