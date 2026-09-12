import { LEAF_FILL_D } from "../leafPath";

export default function Leaf({ x, y, rot, scale, color, shade }) {
  const rotDeg = (rot * 180) / Math.PI;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotDeg}) scale(${scale})`}>
      <path d={LEAF_FILL_D} fill={color} fillOpacity={shade} />
      <line
        x1={0}
        y1={-6}
        x2={0}
        y2={6}
        stroke="#3b2410"
        strokeWidth={0.6}
        strokeOpacity={shade * 0.26}
      />
    </g>
  );
}
