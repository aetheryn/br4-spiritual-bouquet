import { useState } from "react";

const CATEGORIES = [
  { field: "mass", label: "Mass" },
  { field: "adoration", label: "Adoration" },
  { field: "rosary", label: "Rosary" },
  { field: "fasting", label: "Fasting" },
];

const EMPTY_DRAFT = { mass: 0, adoration: 0, rosary: 0, fasting: 0 };

export default function OfferDrawer({ onSubmitted }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [honeypot, setHoneypot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const adjust = (field, delta) => {
    setDraft((prev) => ({
      ...prev,
      [field]: Math.max(0, prev[field] + delta),
    }));
  };

  const handleTypedChange = (field, rawValue) => {
    const digitsOnly = rawValue.replace(/[^0-9]/g, "");
    const value = digitsOnly === "" ? 0 : parseInt(digitsOnly, 10);
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    const total = CATEGORIES.reduce((sum, { field }) => sum + draft[field], 0);
    if (total === 0) {
      setError("Add at least one prayer before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/prayers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draft, website: honeypot }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Something went wrong. Please try again.",
        );
      }

      onSubmitted?.(data);
      setDraft(EMPTY_DRAFT);
      setOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="offer-toggle"
        onClick={() => setOpen(true)}
      >
        Offer a Prayer
      </button>

      {open && (
        <div className="offer-drawer" role="dialog" aria-label="Offer a prayer">
          <form onSubmit={handleSubmit}>
            {CATEGORIES.map(({ field, label }) => (
              <div className="offer-row" key={field}>
                <span className="offer-label">{label}</span>
                <button
                  type="button"
                  className="offer-step"
                  onClick={() => adjust(field, -1)}
                  aria-label={`Decrease ${label}`}
                >
                  −
                </button>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="offer-count"
                  value={draft[field]}
                  onChange={(e) => handleTypedChange(field, e.target.value)}
                />
                <button
                  type="button"
                  className="offer-step"
                  onClick={() => adjust(field, 1)}
                  aria-label={`Increase ${label}`}
                >
                  +
                </button>
              </div>
            ))}

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

            {error && <p className="offer-error">{error}</p>}

            <div className="offer-actions">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button type="submit" disabled={submitting}>
                {submitting ? "Submitting…" : "Submit"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
