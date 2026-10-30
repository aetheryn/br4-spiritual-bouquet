const STEM = "M57 152 C58 126 59.5 100 60 72 L63 72 C63.5 100 65 126 66 152 Z";
const LEAVES = [
  { d: "M60 118 C46 120 26 112 16 96 C34 90 54 98 60 118 Z", color: "masses" },
  {
    d: "M62 100 C76 100 96 92 106 76 C88 70 68 80 62 100 Z",
    color: "adoration",
  },
  { d: "M61 76 C50 62 50 42 61 24 C72 42 72 62 61 76 Z", color: "fasting" },
];

function SproutShape({ filled, grow }) {
  return (
    <svg viewBox="0 0 120 160">
      <path
        d={STEM}
        className={grow ? "sprout-stem" : undefined}
        style={{ fill: filled ? "var(--bark)" : "var(--line)" }}
      />
      {LEAVES.map((leaf, i) => (
        <path
          key={leaf.color}
          d={leaf.d}
          className={grow ? `sprout-leaf sprout-leaf-${i}` : undefined}
          style={{
            fill: filled ? `var(--cat-${leaf.color})` : "var(--line)",
            "--i": i,
          }}
        />
      ))}
    </svg>
  );
}

// "fill": a pale silhouette with the same sprout in full color on top,
// revealed from the bottom up (loading). "bloom": the colored sprout growing
// out of the ground, stem first and then each leaf (success).
export default function Sprout({ variant = "fill", large = false }) {
  const size = large ? " sprout-lg" : "";

  if (variant === "bloom") {
    return (
      <div className={`sprout sprout-bloom${size}`} aria-hidden="true">
        <SproutShape filled grow />
      </div>
    );
  }

  return (
    <div className={`sprout${size}`} aria-hidden="true">
      <SproutShape />
      <div className="sprout-fill">
        <SproutShape filled />
      </div>
    </div>
  );
}
