const axios = require('axios');

const MOCK_NOTIFICATIONS = [
  { ID: 'mock-1', Type: 'Placement', Message: 'Advanced Micro Devices Inc. hiring', Timestamp: '2026-04-22 17:49:54' },
  { ID: 'mock-2', Type: 'Result', Message: 'project-review', Timestamp: '2026-04-22 17:50:42' },
  { ID: 'mock-3', Type: 'Result', Message: 'external', Timestamp: '2026-04-22 17:50:30' },
  { ID: 'mock-4', Type: 'Event', Message: 'tech-fest', Timestamp: '2026-04-22 17:50:06' },
  { ID: 'mock-5', Type: 'Result', Message: 'mid-sem', Timestamp: '2026-04-22 17:51:30' },
  { ID: 'mock-6', Type: 'Placement', Message: 'CSX Corporation hiring', Timestamp: '2026-04-22 17:51:18' },
  { ID: 'mock-7', Type: 'Result', Message: 'project-review', Timestamp: '2026-04-22 17:50:42' },
  { ID: 'mock-8', Type: 'Result', Message: 'mid-sem', Timestamp: '2026-04-22 17:51:30' },
  { ID: 'mock-9', Type: 'Event', Message: 'farewell', Timestamp: '2026-04-22 17:51:06' },
  { ID: 'mock-10', Type: 'Result', Message: 'external', Timestamp: '2026-04-22 17:50:30' },
  { ID: 'mock-11', Type: 'Placement', Message: 'Google hiring', Timestamp: '2026-04-22 17:52:00' },
  { ID: 'mock-12', Type: 'Result', Message: 'finals', Timestamp: '2026-04-22 17:49:00' },
];

function computeScore(n) {
  const type = (n.Type || '').toLowerCase();
  const weightMap = { placement: 3, result: 2, event: 1 };
  const weight = weightMap[type] || 0;

  let ts = 0;
  try {
    ts = new Date((n.Timestamp || '').replace(' ', 'T')).getTime() || 0;
  } catch (e) {
    ts = 0;
  }

  return weight * 1e14 + ts;
}

async function fetchNotifications(url, authHeader) {
  try {
    const config = { timeout: 5000 };
    if (authHeader) {
      config.headers = { Authorization: authHeader };
    }
    const res = await axios.get(url, config);
    return Array.isArray(res.data.notifications) ? res.data.notifications : [];
  } catch (err) {
    if (err.response?.status === 401 || err.code === 'ENOTFOUND') {
      console.log('upstream unavailable or unauthorized, using mock data');
      return MOCK_NOTIFICATIONS;
    }
    throw err;
  }
}

async function getTop10(upstreamUrl, authHeader) {
  const list = await fetchNotifications(upstreamUrl, authHeader);
  const ranked = list
    .map(n => ({ n, score: computeScore(n) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(x => x.n);
  return ranked;
}

async function getNotifications(upstreamUrl, authHeader, options = {}) {
  const { limit = 20, page = 1, notification_type = null } = options;
  let list = await fetchNotifications(upstreamUrl, authHeader);

  if (notification_type) {
    list = list.filter(n => (n.Type || '').toLowerCase() === notification_type.toLowerCase());
  }

  const ranked = list
    .map(n => ({ n, score: computeScore(n) }))
    .sort((a, b) => b.score - a.score)
    .map(x => x.n);

  const start = (page - 1) * limit;
  const end = start + limit;
  const paginated = ranked.slice(start, end);

  return {
    notifications: paginated,
    total: ranked.length,
    page,
    limit,
    pages: Math.ceil(ranked.length / limit)
  };
}

module.exports = { computeScore, getTop10, getNotifications };
