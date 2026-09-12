import { useMemo } from "react";
import { mulberry32, generateTree, CATS } from "../treeEngine";
import TreeCanvas from "./TreeCanvas";
import Leaf from "./Leaf";

const DESIGN_W = 960;
const DESIGN_H = 640;

export default function Tree() {
  const tree = useMemo(() => {
    const rng = mulberry32(20260903);
    return generateTree(rng, DESIGN_W, DESIGN_H);
  }, []);

  const colorByCatId = useMemo(() => {
    const map = {};
    CATS.forEach((c) => {
      map[c.id] = c.color;
    });
    return map;
  }, []);

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
          <Leaf key={i} {...leaf} color={colorByCatId[leaf.catId]} />
        ))}
      </svg>
    </>
  );
}
