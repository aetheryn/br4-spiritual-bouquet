import { CATS } from "../treeEngine";

export default function Legend({ totals }) {
  return (
    <div className="stage-legend">
      {CATS.map((c) => (
        <span className="legend-item" key={c.id}>
          <span className="swatch" style={{ "--swatch": c.color }} />
          <span>{c.label}</span>
          <span className="count">{totals[c.id].toLocaleString()}</span>
        </span>
      ))}
    </div>
  );
}
