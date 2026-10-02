import { usePrayerData } from "../hooks/usePrayerData";
import Tree from "../components/Tree";
import OfferDrawer from "../components/OfferDrawer";

export default function Bouquet() {
  const { totals, timestampByCatIdx, loading, latestBatch, addPrayer } =
    usePrayerData();

  return (
    <div id="stage">
      {!loading && (
        <Tree
          totals={totals}
          timestampByCatIdx={timestampByCatIdx}
          latestBatch={latestBatch}
        />
      )}
      <OfferDrawer onSubmitted={addPrayer} />
    </div>
  );
}
