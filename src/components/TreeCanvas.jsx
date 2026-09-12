import { useEffect, useRef } from "react";
import {
  mulberry32,
  generateTreeSkeleton,
  drawTreeSkeleton,
} from "../treeEngine";

const DESIGN_W = 960;
const DESIGN_H = 640;

const TreeCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.round(DESIGN_W * dpr);
    canvas.height = Math.round(DESIGN_H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const rng = mulberry32(20260903); // Example seed for reproducibility
    const skeleton = generateTreeSkeleton(rng, DESIGN_W, DESIGN_H);
    drawTreeSkeleton(ctx, skeleton, DESIGN_H);
  }, []);

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
};

export default TreeCanvas;
