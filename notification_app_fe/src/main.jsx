import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';

function formatTimestamp(value) {
  if (!value) return 'Unknown time';
  const parsed = new Date(String(value).replace(' ', 'T'));
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
}

function Badge({ type }) {
  const label = String(type || 'unknown');
  return <span className={`badge badge-${label.toLowerCase()}`}>{label}</span>;
}

function App() {
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let mounted = true;

    async function loadTop10() {
      try {
        const response = await fetch('/api/notifications/top10');
        if (!response.ok) {
          throw new Error(`Request failed with ${response.status}`);
        }
        const data = await response.json();
        if (mounted) {
          setItems(Array.isArray(data.top10) ? data.top10 : []);
          setError('');
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || 'Failed to load notifications');
          setItems([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadTop10();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Stage 1</p>
          <h1>Priority Inbox</h1>
          <p className="subtitle">React frontend with vanilla CSS showing the top 10 notifications by importance and recency.</p>
        </div>
        <div className="hero-card">
          <span className="hero-card-label">Source</span>
          <strong>GET /api/notifications/top10</strong>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Top 10 Notifications</h2>
          <span className="count">{loading ? 'Loading...' : `${items.length} items`}</span>
        </div>

        {error ? <div className="error-box">{error}</div> : null}

        {!loading && !error && items.length === 0 ? (
          <div className="empty-state">No notifications returned from the API.</div>
        ) : null}

        <div className="grid">
          {items.map((item, index) => (
            <article key={item.ID || `${item.Type}-${index}`} className="card">
              <div className="card-top">
                <span className="rank">#{index + 1}</span>
                <Badge type={item.Type} />
              </div>
              <h3>{item.Message || 'No message'}</h3>
              <p className="meta">ID: {item.ID || 'unknown'}</p>
              <p className="meta">Time: {formatTimestamp(item.Timestamp)}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
