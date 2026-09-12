import { useState } from "react";
import {
  useFloating,
  useHover,
  useFocus,
  useDismiss,
  useRole,
  useInteractions,
  offset,
  flip,
  shift,
  FloatingPortal,
} from "@floating-ui/react";
import { LEAF_FILL_D } from "../leafPath";

export function LeafGlyph({ color, shade, outlined, outlineColor }) {
  return (
    <>
      <path
        d={LEAF_FILL_D}
        fill={color}
        fillOpacity={shade}
        stroke={outlined ? outlineColor : "none"}
        strokeWidth={outlined ? 0.6 : 0}
      />
      <line
        x1={0}
        y1={-6}
        x2={0}
        y2={6}
        stroke="#3b2410"
        strokeWidth={0.6}
        strokeOpacity={shade * 0.26}
      />
    </>
  );
}

// Non-interactive, always outlined, with a drop shadow — Tree.jsx renders
// one of these last in the SVG for whichever leaf is currently hovered.
export function LeafGhost({ x, y, rot, scale, color, shade, outlineColor }) {
  const rotDeg = (rot * 180) / Math.PI;
  return (
    <g
      transform={`translate(${x} ${y}) rotate(${rotDeg}) scale(${scale})`}
      style={{
        pointerEvents: "none",
        filter: "drop-shadow(2px 3px 2.5px rgba(59, 36, 16, 0.45))",
      }}
    >
      <LeafGlyph
        color={color}
        shade={shade}
        outlined
        outlineColor={outlineColor}
      />
    </g>
  );
}

export default function Leaf({
  x,
  y,
  rot,
  scale,
  color,
  shade,
  tooltipLabel,
  onHoverChange,
}) {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const rotDeg = (rot * 180) / Math.PI;

  const { refs, floatingStyles, context } = useFloating({
    open: tooltipOpen,
    onOpenChange: setTooltipOpen,
    placement: "top",
    middleware: [offset(20), flip(), shift({ padding: 200 })],
  });

  // This delay affects ONLY the tooltip (it's what drives tooltipOpen).
  // The pop-to-front/outline effect below never touches this state at
  // all, so it stays instant regardless of this value.
  const hover = useHover(context, { delay: { open: 500, close: 0 } });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "tooltip" });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    dismiss,
    role,
  ]);

  const handleMouseMove = (event) => {
    refs.setPositionReference({
      getBoundingClientRect() {
        return {
          x: event.clientX,
          y: event.clientY,
          width: 0,
          height: 0,
          top: event.clientY,
          left: event.clientX,
          right: event.clientX,
          bottom: event.clientY,
        };
      },
    });
  };

  return (
    <>
      <g
        ref={refs.setReference}
        {...getReferenceProps({
          // Composed with Floating UI's own (delayed) handlers, not
          // replacing them — getReferenceProps merges custom handlers in
          // rather than overwriting its internal ones.
          onMouseEnter: () => onHoverChange?.(true),
          onMouseLeave: () => onHoverChange?.(false),
          onFocus: () => onHoverChange?.(true),
          onBlur: () => onHoverChange?.(false),
        })}
        onMouseMove={handleMouseMove}
        transform={`translate(${x} ${y}) rotate(${rotDeg}) scale(${scale})`}
        tabIndex={0}
        style={{ pointerEvents: "auto", cursor: "pointer" }}
      >
        <LeafGlyph color={color} shade={shade} outlined={false} />
      </g>
      {tooltipOpen && tooltipLabel && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className="leaf-tooltip"
          >
            {tooltipLabel}
          </div>
        </FloatingPortal>
      )}
    </>
  );
}
