import HelpButton from "./HelpButton";

const RETREAT_NAME = "Breathe #4";

export default function Header({ total }) {
  return (
    <header className="stage-header">
      <div className="stage-title-block">
        <h1 className="stage-title">Spiritual Bouquet</h1>
        <div className="stage-retreat-row">
          <span className="stage-retreat">{RETREAT_NAME}</span>
          <HelpButton />
        </div>
      </div>
      <div className="stage-total">
        <span className="value">{total.toLocaleString()}</span>
        <span className="label">offered</span>
      </div>
    </header>
  );
}
