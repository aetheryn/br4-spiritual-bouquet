import { useCallback, useState } from "react";
import { usePrayerData } from "../hooks/usePrayerData";
import Tree from "../components/Tree";
import Header from "../components/Header";
import StageProgress from "../components/StageProgress";
import Legend from "../components/Legend";
import OfferDrawer from "../components/OfferDrawer";
import LoadState from "../components/LoadState";
import Toast from "../components/Toast";

export default function Bouquet() {
  const {
    totals,
    timestampByCatIdx,
    loading,
    error,
    latestBatch,
    addPrayer,
    retry,
  } = usePrayerData();
  const [toast, setToast] = useState(null);
  const clearToast = useCallback(() => setToast(null), []);

  const handleSubmitted = (record) => {
    addPrayer(record);
    const count =
      record.mass + record.adoration + record.rosary + record.fasting;
    setToast({
      id: Date.now(),
      text: `Thank you. ${count} ${count === 1 ? "prayer" : "prayers"} added.`,
    });
  };

  const total = Object.values(totals).reduce((sum, n) => sum + n, 0);

  if (loading || error) {
    return (
      <div id="stage">
        <LoadState error={error} onRetry={retry} />
      </div>
    );
  }

  return (
    <div id="stage">
      <div className="stage-top">
        <Header total={total} />
        <StageProgress total={total} />
        <Legend totals={totals} />
      </div>
      <div className="stage-tree">
        <Tree
          totals={totals}
          timestampByCatIdx={timestampByCatIdx}
          latestBatch={latestBatch}
        />
      </div>
      <Toast toast={toast} onDone={clearToast} />
      <OfferDrawer onSubmitted={handleSubmitted} />
    </div>
  );
}
