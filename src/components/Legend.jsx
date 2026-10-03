import { CATS } from "../treeEngine";

const SHORT_NAMES = {
  masses: "Masses",
  rosaries: "Rosaries",
  adoration: "Adoration",
  fasting: "Fasting",
};

export default function Legend({ totals }) {
  return (
    <div className="stage-legend">
      {CATS.map((c) => (
        <div className="legend-item" key={c.id} style={{ "--swatch": c.color }}>
          <span className="swatch" />
          <span className="name">{SHORT_NAMES[c.id]}</span>
          <span className="count">{totals[c.id].toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}
