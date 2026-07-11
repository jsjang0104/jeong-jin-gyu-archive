export default function StatusBlock({ variant = 'loading', message, actionLabel, onAction }) {
  const defaults = {
    loading: { eyebrow: 'Loading', text: '자료를 불러오는 중입니다…' },
    error: { eyebrow: 'Error', text: '자료를 불러올 수 없습니다. 잠시 후 다시 시도해 주세요.' },
    empty: { eyebrow: 'Empty', text: '표시할 자료가 없습니다.' },
  };
  const d = defaults[variant] || defaults.loading;
  return (
    <div className="status-block">
      <span className="eyebrow">{d.eyebrow}</span>
      <p>{message || d.text}</p>
      {actionLabel && onAction && (
        <button className="btn btn-ghost" onClick={onAction}>{actionLabel}</button>
      )}
    </div>
  );
}
