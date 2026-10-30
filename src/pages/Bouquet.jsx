import { usePrayerData } from "../hooks/usePrayerData";
import Tree from "../components/Tree";
import Header from "../components/Header";
import StageProgress from "../components/StageProgress";
import Legend from "../components/Legend";
import OfferDrawer from "../components/OfferDrawer";
import LoadState from "../components/LoadState";

export default function Bouquet() {
  const {
    totals,
    offeringByCatIdx,
    loading,
    error,
    latestBatch,
    addPrayer,
    retry,
  } = usePrayerData();
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
          offeringByCatIdx={offeringByCatIdx}
          latestBatch={latestBatch}
        />
      </div>
      <OfferDrawer onSubmitted={addPrayer} />
    </div>
  );
}
