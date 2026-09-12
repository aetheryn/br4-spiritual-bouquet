import { useMemo, useState } from "react";
import { mulberry32, generateTree, CATS } from "../treeEngine";
import TreeCanvas from "./TreeCanvas";
import Leaf, { LeafGhost } from "./Leaf";

const DESIGN_W = 960;
const DESIGN_H = 640;

export default function Tree() {
  const tree = useMemo(() => {
    const rng = mulberry32(20260903);
    return generateTree(rng, DESIGN_W, DESIGN_H);
  }, []);

  const catById = useMemo(() => {
    const map = {};
    CATS.forEach((c) => {
      map[c.id] = c;
    });
    return map;
  }, []);

  const [hoveredIndex, setHoveredIndex] = useState(null);

  const handleHoverChange = (i, isHovered) => {
    setHoveredIndex((prev) => {
      if (isHovered) return i;
      return prev === i ? null : prev;
    });
  };

  const hoveredLeaf =
    hoveredIndex !== null ? tree.leafSlots[hoveredIndex] : null;

  return (
    <>
      <TreeCanvas tree={tree} designW={DESIGN_W} designH={DESIGN_H} />
      <svg
        viewBox={`0 0 ${DESIGN_W} ${DESIGN_H}`}
        preserveAspectRatio="xMidYMid meet"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      >
        {tree.leafSlots.map((leaf, i) => (
          <Leaf
            key={i}
            {...leaf}
            color={catById[leaf.catId].color}
            tooltipLabel={`${catById[leaf.catId].singular} added to the tree on Sep 12, 2026`}
            onHoverChange={(isHovered) => handleHoverChange(i, isHovered)}
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
    </>
  );
}
