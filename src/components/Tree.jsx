import { useMemo, useState } from "react";
import {
  mulberry32,
  generateTree,
  CATS,
  TREE_PHASES,
  phaseIndexForTotal,
} from "../treeEngine";
import { useIsMobile } from "../hooks/useIsMobile";
import TreeCanvas from "./TreeCanvas";
import Leaf, { LeafGhost } from "./Leaf";

const DESIGN_W = 960;
const DESKTOP_H = 640;
const MOBILE_H = 862;
const GROW_MS = 700; // must match .tree-grow's duration in index.css
const BLOOM_STAGGER_MS = 70;

export default function Tree({ totals, timestampByCatIdx, latestBatch }) {
  const isMobile = useIsMobile();
  const designH = isMobile ? MOBILE_H : DESKTOP_H;

  const total = Object.values(totals).reduce((sum, n) => sum + n, 0);
  const phaseIndex = phaseIndexForTotal(total);
  const crossedPhase =
    latestBatch !== null &&
    phaseIndexForTotal(total - latestBatch.size) !== phaseIndex;

  const tree = useMemo(() => {
    const rng = mulberry32(20260903);
    return generateTree(
      rng,
      DESIGN_W,
      designH,
      TREE_PHASES[phaseIndex],
      isMobile,
    );
  }, [phaseIndex, designH, isMobile]);

  const catById = useMemo(() => {
    const map = {};
    CATS.forEach((c) => {
      map[c.id] = c;
    });
    return map;
  }, []);

  const visibleLeaves = useMemo(() => {
    const counters = {};
    const visible = [];
    tree.leafSlots.forEach((leaf, slotIndex) => {
      const idx = counters[leaf.catId] ?? 0;
      counters[leaf.catId] = idx + 1;
      if (idx < totals[leaf.catId]) {
        visible.push({
          leaf,
          slotIndex,
          timestamp: timestampByCatIdx[leaf.catId]?.[idx],
        });
      }
    });
    visible.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    let order = 0;
    visible.forEach((v) => {
      if (latestBatch && v.timestamp === latestBatch.timestamp) {
        v.bloomDelay = (crossedPhase ? GROW_MS : 0) + order * BLOOM_STAGGER_MS;
        order += 1;
      }
    });
    return visible;
  }, [tree, totals, timestampByCatIdx, latestBatch, crossedPhase]);

  const [hoveredIndex, setHoveredIndex] = useState(null);

  const handleHoverChange = (i, isHovered) => {
    setHoveredIndex((prev) => {
      if (isHovered) return i;
      return prev === i ? null : prev;
    });
  };

  const hoveredLeaf =
    hoveredIndex !== null ? tree.leafSlots[hoveredIndex] : null;

  const formatTooltip = (catId, timestamp) => {
    if (!timestamp) return null;
    const date = new Date(timestamp).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    return `${catById[catId].singular} added to the tree on ${date}`;
  };

  return (
    <div
      key={phaseIndex}
      className={crossedPhase ? "tree-frame tree-grow" : "tree-frame"}
      style={{
        aspectRatio: `${DESIGN_W} / ${designH}`,
        width: `min(100cqw, calc(100cqh * ${DESIGN_W / designH}))`,
      }}
    >
      <TreeCanvas tree={tree} designW={DESIGN_W} designH={designH} />
      <svg
        viewBox={`0 0 ${DESIGN_W} ${designH}`}
        preserveAspectRatio="xMidYMid meet"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      >
        {visibleLeaves.map(({ leaf, slotIndex, timestamp, bloomDelay }) => (
          <Leaf
            key={`${phaseIndex}-${slotIndex}`}
            {...leaf}
            color={catById[leaf.catId].color}
            bloomDelay={bloomDelay}
            tooltipLabel={formatTooltip(leaf.catId, timestamp)}
            onHoverChange={(isHovered) =>
              handleHoverChange(slotIndex, isHovered)
            }
          />
        ))}
        {hoveredLeaf && (
          <LeafGhost
            x={hoveredLeaf.x}
            y={hoveredLeaf.y}
            rot={hoveredLeaf.rot}
            scale={hoveredLeaf.scale}
            color={catById[hoveredLeaf.catId].color}
            shade={hoveredLeaf.shade}
            outlineColor={catById[hoveredLeaf.catId].darkColor}
          />
        )}
      </svg>
    </div>
  );
}
