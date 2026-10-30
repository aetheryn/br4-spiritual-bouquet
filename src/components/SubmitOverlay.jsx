import { useEffect, useRef } from "react";
import Sprout from "./Sprout";
import { lockScroll } from "../scrollLock";

const SUCCESS_MS = 2800;

// Covers the whole screen while an offering is sent, then turns into the
// thank-you and closes itself. `phase` and the details stay as they were while
// it fades out, so the content doesn't change under the fade.
export default function SubmitOverlay({ visible, phase, name, count, onDone }) {
  const overlayRef = useRef(null);
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  });

  useEffect(() => {
    if (!visible) return;
    overlayRef.current?.focus();
    return lockScroll();
  }, [visible]);

  useEffect(() => {
    if (!visible || phase !== "success") return;
    const timer = setTimeout(() => onDoneRef.current(), SUCCESS_MS);
    return () => clearTimeout(timer);
  }, [visible, phase]);

  const isSuccess = phase === "success";

  return (
    <div
      ref={overlayRef}
      className={visible ? "submit-overlay open" : "submit-overlay"}
      role="status"
      aria-live="polite"
      aria-hidden={!visible}
      tabIndex={-1}
      onClick={isSuccess ? () => onDoneRef.current() : undefined}
    >
      <div className="submit-body" key={phase}>
        {isSuccess ? (
          <>
            <Sprout variant="bloom" large />
            <p className="submit-title">Thank you, {name}.</p>
            <p className="submit-note">
              {count} {count === 1 ? "prayer" : "prayers"} added to the bouquet.
            </p>
          </>
        ) : (
          <>
            <Sprout large />
            <p className="submit-title">Offering your prayers…</p>
          </>
        )}
      </div>
    </div>
  );
}
