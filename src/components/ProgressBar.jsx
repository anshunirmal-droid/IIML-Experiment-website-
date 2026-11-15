/** Progress bar with an optional marker showing where progress should be today. */
export default function ProgressBar({ value, expected, tone = 'on-track' }) {
  return (
    <div className="progress" title={expected != null ? `Done ${value}% · Expected ${expected}%` : `Done ${value}%`}>
      <div className={`progress-fill h-${tone}`} style={{ width: `${value}%` }} />
      {expected != null && <div className="progress-marker" style={{ left: `${expected}%` }} />}
    </div>
  );
}
