import { useEffect, useRef, useState } from "react";
import { lockScroll } from "../scrollLock";
import { GrowingTreeArt, CategoriesArt, OfferArt, TooltipArt } from "./HelpArt";

const STEPS = [
  {
    title: "One shared tree",
    body: "Every prayer offered at Breathe #4 becomes a leaf on this tree. The more we offer together, the more it grows.",
    decorative: true,
    art: (running) => <GrowingTreeArt running={running} />,
  },
  {
    title: "Four kinds of prayer",
    body: "Every leaf takes the color of the prayer it stands for.",
    art: () => <CategoriesArt />,
  },
  {
    title: "Offering yours",
    body: "Add your name, choose how many of each you have offered, up to 20 at a time, and tap Offer.",
    decorative: true,
    art: () => <OfferArt />,
  },
  {
    title: "Finding a leaf",
    body: "Hover over a leaf, or touch it, to see who offered it and when.",
    decorative: true,
    art: () => <TooltipArt />,
  },
];

const SWIPE_MIN_PX = 50;

function Chevron({ direction }) {
  return (
    <svg width="10" height="16" viewBox="0 0 10 16" aria-hidden="true">
      <path
        d={direction === "left" ? "M8 1L2 8l6 7" : "M2 1l6 7-6 7"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export default function HelpButton() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [hasOpened, setHasOpened] = useState(false);
  const buttonRef = useRef(null);
  const panelRef = useRef(null);
  const touchRef = useRef(null);

  const isFirst = step === 0;
  const isLast = step === STEPS.length - 1;

  const go = (delta) =>
    setStep((s) => Math.min(STEPS.length - 1, Math.max(0, s + delta)));

  const openHelp = () => {
    setStep(0);
    setHasOpened(true);
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    buttonRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
    const unlockScroll = lockScroll();
    const onKeyDown = (event) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") go(-1);
      if (event.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      unlockScroll();
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const handleTouchStart = (event) => {
    const touch = event.touches[0];
    touchRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event) => {
    const start = touchRef.current;
    touchRef.current = null;
    if (!start) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dx) > SWIPE_MIN_PX && Math.abs(dx) > Math.abs(dy) * 1.5) {
      go(dx < 0 ? 1 : -1);
    }
  };

  const current = STEPS[step];

  return (
    <>
      <button
        type="button"
        ref={buttonRef}
        className="help-button"
        onClick={openHelp}
        aria-label="How it works"
      >
        <span className="help-mark" aria-hidden="true">
          ?
        </span>
      </button>

      <div
        className={open ? "help-scrim open" : "help-scrim"}
        aria-hidden={!open}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
      >
        <div
          ref={panelRef}
          className="help-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="help-title"
          tabIndex={-1}
        >
          <div className="help-head">
            <h2 className="help-title" id="help-title">
              How it works
            </h2>
            <button type="button" className="help-close" onClick={close}>
              Close
            </button>
          </div>

          <div
            className="help-body"
            aria-live="polite"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {hasOpened && (
              <div className="help-step" key={step}>
                <div
                  className="help-art"
                  aria-hidden={current.decorative ? "true" : undefined}
                >
                  {current.art(open)}
                </div>
                <div className="help-copy">
                  <h3 className="help-step-title">{current.title}</h3>
                  <p className="help-text">{current.body}</p>
                </div>
              </div>
            )}
          </div>

          <div className="help-nav">
            <button
              type="button"
              className="help-arrow help-prev"
              onClick={() => go(-1)}
              disabled={isFirst}
              aria-label="Previous"
            >
              <Chevron direction="left" />
            </button>
            <span className="help-count">
              {step + 1} / {STEPS.length}
            </span>
            {isLast ? (
              <button
                type="button"
                className="help-arrow help-next help-finish"
                onClick={close}
              >
                Done
              </button>
            ) : (
              <button
                type="button"
                className="help-arrow help-next"
                onClick={() => go(1)}
                aria-label="Next"
              >
                <Chevron direction="right" />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
