import { useEffect, useRef } from "react";
import { drawTree } from "../treeEngine";

export default function TreeCanvas({ tree, designW, designH }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.round(designW * dpr);
    canvas.height = Math.round(designH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    drawTree(ctx, tree, designH);
  }, [tree, designW, designH]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "100%",
        height: "100vh",
        display: "block",
        objectFit: "contain",
        objectPosition: "center",
      }}
    />
  );
}
