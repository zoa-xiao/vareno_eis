export default function DashboardLoading() {
  return (
    <section className="route-loading" aria-label="Memuat halaman" aria-busy="true" role="status">
      <div className="route-loading-heading">
        <span className="loading-block loading-eyebrow" />
        <span className="loading-block loading-title" />
        <span className="loading-block loading-description" />
      </div>
      <div className="route-loading-actions">
        <span className="loading-block loading-action" />
        <span className="loading-block loading-action loading-action-primary" />
      </div>
      <div className="route-loading-metrics">
        {Array.from({ length: 3 }, (_, index) => <div className="route-loading-metric" key={index}><span className="loading-block loading-metric-label" /><span className="loading-block loading-metric-value" /><span className="loading-block loading-metric-note" /></div>)}
      </div>
      <div className="route-loading-table">
        <span className="loading-block loading-table-title" />
        {Array.from({ length: 5 }, (_, index) => <div className="route-loading-row" key={index}><span className="loading-block loading-row-short" /><span className="loading-block loading-row-long" /><span className="loading-block loading-row-medium" /></div>)}
      </div>
    </section>
  );
}
