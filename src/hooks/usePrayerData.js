import { useEffect, useState } from "react";

// Airtable field name -> catId used in treeEngine's CATS/leafSlots.
// Double-check these against the actual `id` values in your CATS array.
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
  }, []);

  const sorted = [...prayers].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
  );

  const totals = {};
  const timestampByCatIdx = {};
  for (const catId of Object.values(CATEGORY_MAP)) {
    totals[catId] = 0;
    timestampByCatIdx[catId] = {};
  }

  for (const row of sorted) {
    for (const [airtableField, catId] of Object.entries(CATEGORY_MAP)) {
      const count = row[airtableField] ?? 0;
      for (let i = 0; i < count; i++) {
        timestampByCatIdx[catId][totals[catId]] = row.timestamp;
        totals[catId] += 1;
      }
    }
  }

  return { totals, timestampByCatIdx, loading, error };
}
