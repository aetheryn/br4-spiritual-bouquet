import { useEffect, useRef, useState } from "react";

const CATEGORY_MAP = {
  mass: "masses",
  adoration: "adoration",
  rosary: "rosaries",
  fasting: "fasting",
};

// Coming back to the app after at least this long re-reads the numbers.
const REFRESH_AFTER_MS = 30_000;

export function usePrayerData() {
  const [prayers, setPrayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [latestBatch, setLatestBatch] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const lastFetchedAt = useRef(0);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/prayers")
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setPrayers(data.prayers);
        lastFetchedAt.current = Date.now();
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  // A home-screen app that was only switched away from is not reloaded when it
  // is opened again, so it would keep showing the numbers from its last load.
  // Quietly refresh them on return (no loading screen, errors ignored).
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - lastFetchedAt.current < REFRESH_AFTER_MS) return;

      fetch("/api/prayers", { cache: "no-store" })
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then((data) => {
          setPrayers(data.prayers);
          lastFetchedAt.current = Date.now();
        })
        .catch(() => {});
    };

    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("pageshow", refresh);
    return () => {
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("pageshow", refresh);
    };
  }, []);

  const retry = () => {
    setError(null);
    setLoading(true);
    setAttempt((n) => n + 1);
  };

  const addPrayer = (record) => {
    lastFetchedAt.current = Date.now();
    setPrayers((prev) => [...prev, record]);
    setLatestBatch({
      timestamp: record.timestamp,
      size: record.mass + record.adoration + record.rosary + record.fasting,
    });
  };

  const sorted = [...prayers].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
  );

  const totals = {};
  const offeringByCatIdx = {};
  for (const catId of Object.values(CATEGORY_MAP)) {
    totals[catId] = 0;
    offeringByCatIdx[catId] = {};
  }

  for (const row of sorted) {
    for (const [airtableField, catId] of Object.entries(CATEGORY_MAP)) {
      const count = row[airtableField] ?? 0;
      for (let i = 0; i < count; i++) {
        offeringByCatIdx[catId][totals[catId]] = {
          timestamp: row.timestamp,
          name: row.name ?? "",
        };
        totals[catId] += 1;
      }
    }
  }

  return {
    totals,
    offeringByCatIdx,
    loading,
    error,
    latestBatch,
    addPrayer,
    retry,
  };
}
