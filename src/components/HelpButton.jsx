import { useEffect, useRef, useState } from "react";
import { CATS } from "../treeEngine";

export default function HelpButton() {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef(null);
  const pageRef = useRef(null);

  const close = () => {
    setOpen(false);
    buttonRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    pageRef.current?.focus();
    document.documentElement.classList.add("drawer-open");
    const onKeyDown = (event) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.documentElement.classList.remove("drawer-open");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        ref={buttonRef}
        className="help-button"
        onClick={() => setOpen(true)}
        aria-label="How it works"
      >
        <span className="help-mark" aria-hidden="true">
          ?
        </span>
      </button>

      <div
        ref={pageRef}
        className={open ? "help-page open" : "help-page"}
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-title"
        aria-hidden={!open}
        tabIndex={-1}
      >
        <div className="help-inner">
          <div className="help-head">
            <h2 className="help-title" id="help-title">
              How it works
            </h2>
            <button type="button" className="help-close" onClick={close}>
              Close
            </button>
          </div>

          <p className="help-text">
            A spiritual bouquet is a gift of prayers offered together. During
            Breathe #4, each prayer you offer here becomes a leaf on one shared
            tree.
          </p>

          <ul className="help-cats">
            {CATS.map((cat) => (
              <li key={cat.id} style={{ "--swatch": cat.color }}>
                <span className="swatch" />
                <span>
                  <span className="cat-name">{cat.label}</span>
                  <span className="cat-desc">{cat.description}</span>
                </span>
              </li>
            ))}
          </ul>

          <p className="help-text">
            To add yours, choose <strong>Offer a prayer</strong> and enter how
            many of each you have offered, up to 20 at a time.
          </p>
          <p className="help-text">
            Hover over a leaf, or touch it, to see when it was offered.
          </p>
        </div>
      </div>
    </>
  );
}
