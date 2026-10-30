import { useEffect, useRef, useState } from "react";
import { CATS } from "../treeEngine";
import { lockScroll } from "../scrollLock";
import SubmitOverlay from "./SubmitOverlay";

const CATEGORIES = [
  { field: "mass", catId: "masses" },
  { field: "rosary", catId: "rosaries" },
  { field: "adoration", catId: "adoration" },
  { field: "fasting", catId: "fasting" },
];

const EMPTY_DRAFT = { mass: 0, rosary: 0, adoration: 0, fasting: 0 };
const MAX_PER_OFFERING = 20; // mirrors MAX_PRAYERS_PER_SUBMISSION in api/prayers.js
const MAX_NAME_LENGTH = 60; // mirrors MAX_NAME_LENGTH in api/prayers.js
const DISMISS_DRAG_PX = 100;
const FLICK_VELOCITY = 0.6; // px per ms
const FLICK_MIN_PX = 40;
const MIN_LOADING_MS = 800; // keep the loading state from flashing past

export default function OfferDrawer({ onSubmitted }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [name, setName] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [overlay, setOverlay] = useState({
    visible: false,
    phase: "submitting",
    name: "",
    count: 0,
  });
  const busyRef = useRef(false);
  const pendingRef = useRef(null);
  const dragRef = useRef(null);
  const sheetRef = useRef(null);

  const total = CATEGORIES.reduce((sum, { field }) => sum + draft[field], 0);
  const canSubmit = total > 0 && name.trim() !== "";

  const close = () => {
    setOpen(false);
    setError(null);
  };

  useEffect(() => {
    if (!open) return;
    sheetRef.current?.focus();
    const unlockScroll = lockScroll();
    const onKeyDown = (event) => {
      if (event.key === "Escape" && !busyRef.current) close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      unlockScroll();
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // The drag writes straight to the sheet's style instead of going through
  // React state, so it follows the finger without re-rendering on every move.
  const handleDragStart = (event) => {
    if (event.target.closest("button")) return;
    dragRef.current = {
      startY: event.clientY,
      lastY: event.clientY,
      lastT: event.timeStamp,
      dy: 0,
      velocity: 0,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    sheetRef.current.style.transition = "none";
  };

  const handleDragMove = (event) => {
    const drag = dragRef.current;
    if (!drag) return;
    drag.dy = Math.max(0, event.clientY - drag.startY);
    const dt = event.timeStamp - drag.lastT;
    if (dt > 0) drag.velocity = (event.clientY - drag.lastY) / dt;
    drag.lastY = event.clientY;
    drag.lastT = event.timeStamp;
    sheetRef.current.style.transform = `translateY(${drag.dy}px)`;
  };

  const handleDragEnd = () => {
    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;
    sheetRef.current.style.transition = "";
    sheetRef.current.style.transform = "";
    const flicked = drag.velocity > FLICK_VELOCITY && drag.dy > FLICK_MIN_PX;
    if (drag.dy > DISMISS_DRAG_PX || flicked) close();
  };

  const adjust = (field, delta) => {
    if (delta > 0 && total >= MAX_PER_OFFERING) return;
    setDraft((prev) => ({
      ...prev,
      [field]: Math.max(0, prev[field] + delta),
    }));
  };

  const handleTypedChange = (field, rawValue) => {
    const digitsOnly = rawValue.replace(/[^0-9]/g, "");
    const typed = digitsOnly === "" ? 0 : parseInt(digitsOnly, 10);
    const othersTotal = total - draft[field];
    setDraft((prev) => ({
      ...prev,
      [field]: Math.min(typed, MAX_PER_OFFERING - othersTotal),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    if (!canSubmit) return;

    const cleanName = name.trim();
    busyRef.current = true;
    setSubmitting(true);
    setOverlay({
      visible: true,
      phase: "submitting",
      name: cleanName,
      count: total,
    });

    try {
      const [response] = await Promise.all([
        fetch("/api/prayers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...draft,
            name: cleanName,
            website: honeypot,
          }),
        }),
        new Promise((resolve) => setTimeout(resolve, MIN_LOADING_MS)),
      ]);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error || "Something went wrong. Please try again.",
        );
      }

      // The tree is updated once the thank-you closes, so the new leaves
      // bloom on screen instead of behind the overlay.
      pendingRef.current = data;
      setOverlay((prev) => ({ ...prev, phase: "success" }));
      setDraft(EMPTY_DRAFT);
      close();
    } catch (err) {
      busyRef.current = false;
      setOverlay((prev) => ({ ...prev, visible: false }));
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const finishSubmit = () => {
    busyRef.current = false;
    setOverlay((prev) => ({ ...prev, visible: false }));
    const record = pendingRef.current;
    pendingRef.current = null;
    if (record) onSubmitted?.(record);
  };

  const submitLabel =
    total === 0
      ? "Offer"
      : `Offer ${total} ${total === 1 ? "prayer" : "prayers"}`;

  return (
    <>
      <button
        type="button"
        className="offer-toggle"
        onClick={() => setOpen(true)}
      >
        Offer a prayer
      </button>

      <div
        className={open ? "offer-scrim open" : "offer-scrim"}
        aria-hidden={!open}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
      >
        <div
          ref={sheetRef}
          className="offer-sheet"
          role="dialog"
          aria-modal="true"
          aria-labelledby="offer-title"
          tabIndex={-1}
        >
          <div
            className="offer-drag-zone"
            onPointerDown={handleDragStart}
            onPointerMove={handleDragMove}
            onPointerUp={handleDragEnd}
            onPointerCancel={handleDragEnd}
          >
            <div className="offer-grab">
              <span className="offer-handle" />
            </div>

            <div className="offer-head">
              <h2 className="offer-title" id="offer-title">
                Offer a prayer
              </h2>
              <button
                type="button"
                className="offer-close"
                onClick={close}
                aria-label="Close"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  aria-hidden="true"
                >
                  <path
                    d="M1 1l12 12M13 1L1 13"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <label className="offer-name-field">
              <span className="cat-name">Your name</span>
              <input
                type="text"
                className="offer-name-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="First name is fine"
                maxLength={MAX_NAME_LENGTH}
                autoComplete="name"
                autoCapitalize="words"
                enterKeyHint="done"
              />
            </label>

            <div className="offer-list">
              {CATEGORIES.map(({ field, catId }) => {
                const cat = CATS.find((c) => c.id === catId);
                return (
                  <div
                    className={
                      draft[field] > 0 ? "offer-row active" : "offer-row"
                    }
                    style={{ "--swatch": cat.color }}
                    key={field}
                  >
                    <span className="swatch" />
                    <span className="offer-label">
                      <span className="cat-name">{cat.label}</span>
                      <span className="cat-desc">{cat.description}</span>
                    </span>
                    <div className="offer-controls">
                      <button
                        type="button"
                        className="offer-step"
                        onClick={() => adjust(field, -1)}
                        disabled={draft[field] === 0}
                        aria-label={`Decrease ${cat.label}`}
                      >
                        −
                      </button>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="offer-count"
                        value={draft[field]}
                        onChange={(e) =>
                          handleTypedChange(field, e.target.value)
                        }
                        aria-label={`${cat.label} count`}
                      />
                      <button
                        type="button"
                        className="offer-step"
                        onClick={() => adjust(field, 1)}
                        disabled={total >= MAX_PER_OFFERING}
                        aria-label={`Increase ${cat.label}`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <input
              type="text"
              name="website"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              autoComplete="off"
              tabIndex={-1}
              aria-hidden="true"
              className="offer-honeypot"
            />

            {error && (
              <p className="offer-error" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="offer-submit"
              disabled={submitting || !canSubmit}
            >
              {submitLabel}
            </button>
          </form>
        </div>
      </div>

      <SubmitOverlay
        visible={overlay.visible}
        phase={overlay.phase}
        name={overlay.name}
        count={overlay.count}
        onDone={finishSubmit}
      />
    </>
  );
}
