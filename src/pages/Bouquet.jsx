import { usePrayerData } from "../hooks/usePrayerData";
import Tree from "../components/Tree";
import Header from "../components/Header";
import Legend from "../components/Legend";
import OfferDrawer from "../components/OfferDrawer";

export default function Bouquet() {
  const { totals, timestampByCatIdx, loading, latestBatch, addPrayer } =
    usePrayerData();

  const total = Object.values(totals).reduce((sum, n) => sum + n, 0);

  return (
    <div id="stage">
      {!loading && (
        <>
          <Tree
            totals={totals}
            timestampByCatIdx={timestampByCatIdx}
            latestBatch={latestBatch}
          />
          <Header total={total} />
          <Legend totals={totals} />
        </>
      )}
      <OfferDrawer onSubmitted={addPrayer} />
    </div>
  );
}
