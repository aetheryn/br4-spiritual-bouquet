export function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    const t1 = Math.imul(a ^ (a >>> 15), 1 | a);
    const t2 = (t1 + Math.imul(t1 ^ (t1 >>> 7), 61 | t1)) ^ t1;
    return ((t2 ^ (t2 >>> 14)) >>> 0) / 4294967296;
  };
}

export function fillTaperedPath(ctx, pts, widths, color) {
  const left = [],
    right = [];
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    let dx, dy;
    if (i === 0) {
      dx = pts[1].x - p.x;
      dy = pts[1].y - p.y;
    } else if (i === pts.length - 1) {
      dx = p.x - pts[i - 1].x;
      dy = p.y - pts[i - 1].y;
    } else {
      dx = pts[i + 1].x - pts[i - 1].x;
      dy = pts[i + 1].y - pts[i - 1].y;
    }
    const L = Math.hypot(dx, dy) || 1;
    const nx = -dy / L,
      ny = dx / L,
      hw = widths[i] / 2;
    left.push({ x: p.x + nx * hw, y: p.y + ny * hw });
    right.push({ x: p.x - nx * hw, y: p.y - ny * hw });
  }
  ctx.beginPath();
  ctx.moveTo(left[0].x, left[0].y);
  for (let j = 1; j < left.length; j++) ctx.lineTo(left[j].x, left[j].y);
  for (let k = right.length - 1; k >= 0; k--)
    ctx.lineTo(right[k].x, right[k].y);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

// Full Bloom's own numbers, hardcoded — the phase system arrives in a later step.
export function generateTreeSkeleton(rng, W, H) {
  const branches = [],
    buds = [];
  const baseX = W * 0.5,
    baseY = H * 0.98;
  const treeScale = 0.645;
  const crotchY = baseY - (baseY - H * 0.78) * treeScale;
  const canopyCenterY = baseY - (baseY - H * 0.2) * treeScale;

  const trunkPts = [],
    trunkWidths = [];
  const trunkBaseW = W * 0.13 * treeScale,
    trunkTopW = W * 0.088 * treeScale;
  const segs = 9;
  let cx = baseX;
  for (let s = 0; s <= segs; s++) {
    const t = s / segs;
    const wobble = Math.sin(t * Math.PI * 1.0 + 0.3) * W * 0.01 * treeScale;
    cx = baseX + wobble + (s ? (rng() - 0.5) * W * 0.003 * treeScale : 0);
    const yy = baseY - t * (baseY - crotchY);
    trunkPts.push({ x: cx, y: yy });
    trunkWidths.push(trunkBaseW * (1 - t) + trunkTopW * t);
  }
  const crotch = trunkPts[trunkPts.length - 1];
  const crotchW = trunkWidths[trunkWidths.length - 1];

  const stemLen = (crotchY - canopyCenterY) * 0.54;
  const stemAngle = (rng() - 0.5) * 0.08;
  const stemMidX = crotch.x + Math.sin(stemAngle) * stemLen * 0.5;
  const stemMidY = crotch.y - Math.cos(stemAngle) * stemLen * 0.5;
  const stemEndX = crotch.x + Math.sin(stemAngle) * stemLen;
  const stemEndY = crotch.y - Math.cos(stemAngle) * stemLen;
  trunkPts.push({ x: stemMidX, y: stemMidY });
  trunkWidths.push(crotchW * 0.86);
  trunkPts.push({ x: stemEndX, y: stemEndY });
  trunkWidths.push(crotchW * 0.72);
  const fork = trunkPts[trunkPts.length - 1];
  const forkW = trunkWidths[trunkWidths.length - 1];

  const maxDepth = 4;
  function grow(x, y, angle, len, width, depth) {
    const curveFactor = depth === 0 ? 0.05 : 0.22;
    const midAngle = angle + (rng() - 0.5) * curveFactor;
    const bow = (rng() - 0.45) * len * curveFactor;
    const mx = x + Math.sin(midAngle) * len * 0.5 + Math.cos(midAngle) * bow;
    const my = y - Math.cos(midAngle) * len * 0.5 + Math.sin(midAngle) * bow;
    const ex = x + Math.sin(angle) * len;
    const ey = y - Math.cos(angle) * len;
    const tipW = Math.max(0.6, width * 0.42);
    const rec = {
      pts: [
        { x, y },
        { x: mx, y: my },
        { x: ex, y: ey },
      ],
      widths: [width, (width + tipW) / 2, tipW],
      depth,
      x1: x,
      y1: y,
      x2: ex,
      y2: ey,
      len,
    };
    if (depth !== 0) branches.push(rec);
    if (depth >= maxDepth || width < 2.4) {
      buds.push({ x: ex, y: ey, r: 1.3 });
      return;
    }
    const n = depth === 0 ? 5 + Math.floor(rng() * 2) : rng() < 0.35 ? 2 : 3;
    for (let c = 0; c < n; c++) {
      let spread;
      if (depth === 0) {
        spread = (c - (n - 1) / 2) * (2.3 / (n - 1)) + (rng() - 0.5) * 0.1;
      } else {
        spread =
          (c - (n - 1) / 2) * (0.42 + rng() * 0.22) + (rng() - 0.5) * 0.14;
      }
      const childLen =
        len * (depth === 0 ? 0.82 + rng() * 0.12 : 0.7 + rng() * 0.13);
      const childWidth =
        width * (depth === 0 ? 0.42 + rng() * 0.1 : 0.6 + rng() * 0.13);
      grow(ex, ey, angle + spread, childLen, childWidth, depth + 1);
    }
  }

  const primaryBase = (crotchY - canopyCenterY) * 0.46;
  const primaryN = 5 + Math.floor(rng() * 2);
  for (let pc = 0; pc < primaryN; pc++) {
    const pSpread =
      (pc - (primaryN - 1) / 2) * (2.3 / (primaryN - 1)) + (rng() - 0.5) * 0.1;
    const pLen = primaryBase * (0.82 + rng() * 0.12);
    const pWidth = forkW * (0.42 + rng() * 0.1);
    grow(fork.x, fork.y, stemAngle + pSpread, pLen, pWidth, 1);
  }

  const vStretch = 1.15;
  const stretchY = (y) => fork.y - (fork.y - y) * vStretch;
  branches.forEach((b) => {
    b.pts.forEach((pt) => {
      pt.y = stretchY(pt.y);
    });
    b.y1 = stretchY(b.y1);
    b.y2 = stretchY(b.y2);
  });
  buds.forEach((bd) => {
    bd.y = stretchY(bd.y);
  });

  return { trunkPts, trunkWidths, branches, buds, baseY, canopyCenterY };
}

export function drawTreeSkeleton(ctx, skeleton, H) {
  const { trunkPts, trunkWidths, branches, buds, baseY, canopyCenterY } =
    skeleton;
  const barkGradient = ctx.createLinearGradient(
    0,
    baseY,
    0,
    canopyCenterY - H * 0.05,
  );
  barkGradient.addColorStop(0, "#4a2c0c");
  barkGradient.addColorStop(1, "#835227");
  fillTaperedPath(ctx, trunkPts, trunkWidths, barkGradient);
  branches.forEach((b) => fillTaperedPath(ctx, b.pts, b.widths, barkGradient));
  ctx.fillStyle = "#c98f42";
  buds.forEach((bd) => {
    ctx.beginPath();
    ctx.arc(bd.x, bd.y, bd.r, 0, Math.PI * 2);
    ctx.fill();
  });
}
