const RETREAT_NAME = "Breathe #4";

export default function Header({ total }) {
  return (
    <header className="stage-header">
      <div className="stage-title-block">
        <h1 className="stage-title">Spiritual Bouquet</h1>
        <span className="stage-retreat">{RETREAT_NAME}</span>
      </div>
      <div className="stage-total">
        <span className="value">{total.toLocaleString()}</span>
        <span className="label">prayers</span>
      </div>
    </header>
  );
}
