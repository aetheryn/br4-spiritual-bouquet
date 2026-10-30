import { useEffect, useMemo, useState } from "react";
import { CATS } from "../treeEngine";
import Tree from "./Tree";
import { LeafGlyph } from "./Leaf";

// Total prayers shown at each stage of the demo; each lands in a different
// growth phase of the real tree.
const DEMO_TOTALS = [8, 32, 72, 160, 320];
const DEMO_STEP_MS = 1900;
const OLD_TIME = "2026-01-01T00:00:00Z";
const NEW_TIME = "2026-01-02T00:00:00Z";

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function buildDemo(stage) {
  const perCat = DEMO_TOTALS[stage] / CATS.length;
  const prevPerCat = stage === 0 ? 0 : DEMO_TOTALS[stage - 1] / CATS.length;

  const totals = {};
  const offeringByCatIdx = {};
  for (const cat of CATS) {
    totals[cat.id] = perCat;
    offeringByCatIdx[cat.id] = {};
    for (let i = 0; i < perCat; i++) {
      offeringByCatIdx[cat.id][i] = {
        timestamp: i < prevPerCat ? OLD_TIME : NEW_TIME,
        name: "",
      };
    }
  }
  const latestBatch = {
    timestamp: NEW_TIME,
    size: DEMO_TOTALS[stage] - (stage === 0 ? 0 : DEMO_TOTALS[stage - 1]),
  };
  return { totals, offeringByCatIdx, latestBatch };
}

// The real tree, fed made-up totals that step up through every growth phase.
export function GrowingTreeArt({ running }) {
  const [stage, setStage] = useState(() =>
    prefersReducedMotion() ? DEMO_TOTALS.length - 2 : 0,
  );

  useEffect(() => {
    if (!running || prefersReducedMotion()) return;
    const timer = setInterval(
      () => setStage((s) => (s + 1) % DEMO_TOTALS.length),
      DEMO_STEP_MS,
    );
    return () => clearInterval(timer);
  }, [running]);

  const demo = useMemo(() => buildDemo(stage), [stage]);

  return (
    <div className="help-art-tree">
      <Tree
        totals={demo.totals}
        offeringByCatIdx={demo.offeringByCatIdx}
        latestBatch={demo.latestBatch}
      />
      <div className="help-art-shield" />
    </div>
  );
}

// One big leaf per kind of prayer, laid out like a page from a field guide.
export function CategoriesArt() {
  return (
    <ul className="help-specimens">
      {CATS.map((cat, i) => (
        <li key={cat.id}>
          <svg className="help-specimen-leaf" viewBox="-12 -12 24 24">
            <g transform={`rotate(${i % 2 === 0 ? -28 : 28})`}>
              <LeafGlyph color={cat.color} shade={1} />
            </g>
          </svg>
          <span className="cat-name">{cat.label}</span>
          <span className="cat-desc">{cat.description}</span>
        </li>
      ))}
    </ul>
  );
}

// A static picture of the drawer, drawn small inside a phone-like frame so it
// reads as a screenshot and not as part of the instructions.
export function OfferArt() {
  const rows = [
    { cat: CATS[0], count: 2 },
    { cat: CATS[1], count: 0 },
  ];
  const total = rows.reduce((sum, row) => sum + row.count, 0);

  return (
    <div className="help-screen" aria-hidden="true">
      <span className="help-screen-handle" />
      <div className="help-mock-name">
        <span className="cat-name">Your name</span>
        <span className="help-mock-field">Maria</span>
      </div>
      {rows.map(({ cat, count }) => (
        <div
          className="help-mock-row"
          style={{ "--swatch": cat.color }}
          key={cat.id}
        >
          <span className="swatch" />
          <span className="cat-name">{cat.label}</span>
          <span className="offer-controls">
            <span className="offer-step">−</span>
            <span
              className={
                count > 0
                  ? "help-mock-count help-mock-count-on"
                  : "help-mock-count"
              }
            >
              {count}
            </span>
            <span className="offer-step">+</span>
          </span>
        </div>
      ))}
      <div className="help-mock-button">
        Offer {total} {total === 1 ? "prayer" : "prayers"}
      </div>
    </div>
  );
}

const MOCK_LEAVES = [
  { x: 52, y: 122, rot: -0.6, cat: 0 },
  { x: 96, y: 150, rot: 0.4, cat: 3 },
  { x: 206, y: 136, rot: 2.4, cat: 1 },
  { x: 238, y: 100, rot: 0.9, cat: 2 },
  { x: 38, y: 86, rot: 1.1, cat: 3 },
  { x: 232, y: 160, rot: -0.3, cat: 0 },
];

// A leaf with the tooltip you get by hovering it, inside the same frame.
export function TooltipArt() {
  const active = CATS[0];
  return (
    <div className="help-screen help-screen-tip" aria-hidden="true">
      <svg viewBox="0 0 280 180">
        {MOCK_LEAVES.map((leaf, i) => (
          <g
            key={i}
            transform={`translate(${leaf.x} ${leaf.y}) rotate(${(leaf.rot * 180) / Math.PI}) scale(2.1)`}
          >
            <LeafGlyph color={CATS[leaf.cat].color} shade={1} />
          </g>
        ))}
        <g
          transform="translate(140 126) rotate(29) scale(3)"
          style={{
            filter: "drop-shadow(2px 3px 2.5px rgba(59, 36, 16, 0.45))",
          }}
        >
          <LeafGlyph
            color={active.color}
            shade={1}
            outlined
            outlineColor={active.darkColor}
          />
        </g>
      </svg>
      <div className="leaf-tooltip help-mock-tooltip">
        {active.singular} offered by Maria on Oct 3
      </div>
    </div>
  );
}
