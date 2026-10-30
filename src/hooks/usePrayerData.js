import { useEffect, useState } from "react";

const CATEGORY_MAP = {
  mass: "masses",
  adoration: "adoration",
  rosary: "rosaries",
  fasting: "fasting",
};

export function usePrayerData() {
  const [prayers, setPrayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [latestBatch, setLatestBatch] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/prayers")
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setPrayers(data.prayers);
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

  const retry = () => {
    setError(null);
    setLoading(true);
    setAttempt((n) => n + 1);
  };

  const addPrayer = (record) => {
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
