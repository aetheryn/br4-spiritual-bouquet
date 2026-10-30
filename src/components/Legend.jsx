import { CATS } from "../treeEngine";

export default function Legend({ totals }) {
  return (
    <div className="stage-legend">
      {CATS.map((c) => (
        <div className="legend-item" key={c.id} style={{ "--swatch": c.color }}>
          <span className="swatch" />
          <span className="name">{c.shortName}</span>
          <span className="count">{totals[c.id].toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}
