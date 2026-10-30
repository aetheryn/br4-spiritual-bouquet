import Sprout from "./Sprout";

export default function LoadState({ error, onRetry }) {
  if (error) {
    return (
      <div className="status" role="alert">
        <p className="status-title">The bouquet didn’t load</p>
        <p className="status-note">Check your connection and try again.</p>
        <button type="button" className="status-retry" onClick={onRetry}>
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="status" role="status">
      <Sprout />
      <p className="status-title status-title-loading">
        Gathering the bouquet…
      </p>
    </div>
  );
}
