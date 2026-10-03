import { phaseProgress } from "../treeEngine";

export default function StageProgress({ total }) {
  const { next, remaining, fraction } = phaseProgress(total);

  return (
    <div className="stage-progress">
      <span className="progress-text">
        {next ? `${remaining} more to a bigger tree` : "In full bloom"}
      </span>
      <div
        className="progress-track"
        role="progressbar"
        aria-label="Progress to a bigger tree"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(fraction * 100)}
      >
        <div
          className="progress-fill"
          style={{ width: `${fraction * 100}%` }}
        />
      </div>
    </div>
  );
}
