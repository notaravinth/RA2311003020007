const axios = require('axios');

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

async function fetchNotifications(url) {
  const res = await axios.get(url, { timeout: 5000 });
  return Array.isArray(res.data.notifications) ? res.data.notifications : [];
}

async function getTop10(upstreamUrl) {
  const list = await fetchNotifications(upstreamUrl);
  const ranked = list
    .map(n => ({ n, score: computeScore(n) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(x => x.n);
  return ranked;
}

module.exports = { computeScore, getTop10 };
