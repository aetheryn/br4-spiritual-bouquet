const RETREAT_NAME = "Breathe Retreat #4";

export default function Header({ total }) {
  return (
    <div className="stage-header">
      <div className="stage-title-block">
        <span className="stage-eyebrow">Spiritual bouquet</span>
        <h1 className="stage-title">
          Prayer Bouquet <em>— {RETREAT_NAME}</em>
        </h1>
      </div>
      <div className="stage-total">
        <span className="label">Prayers offered</span>
        <span className="value">{total.toLocaleString()}</span>
      </div>
    </div>
  );
}
