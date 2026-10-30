import { useEffect } from "react";

const TOAST_MS = 4200;

export default function Toast({ toast, onDone }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onDone, TOAST_MS);
    return () => clearTimeout(timer);
  }, [toast, onDone]);

  return (
    <div className="toast-region" role="status" aria-live="polite">
      {toast && (
        <p
          className="toast"
          key={toast.id}
          style={{ animationDuration: `${TOAST_MS}ms` }}
        >
          {toast.text}
        </p>
      )}
    </div>
  );
}
