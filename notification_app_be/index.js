const express = require('express');
const axios = require('axios');
const path = require('path');
const { Log } = require('../logging');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../notification_app_fe/dist')));

app.get('/', async (req, res) => {
  await Log('backend', 'info', 'controller', 'received health check');
  res.json({ status: 'ok' });
});

// Proxy endpoint: fetch notifications and return raw response
app.get('/notifications/fetch', async (req, res) => {
  try {
    await Log('backend', 'info', 'service', 'fetching notifications from upstream');
    const upstream = await axios.get('http://20.207.122.201/evaluation-service/notifications', { timeout: 5000 });
    await Log('backend', 'debug', 'service', `fetched ${Array.isArray(upstream.data.notifications) ? upstream.data.notifications.length : 0} notifications`);
    res.json(upstream.data);
  } catch (err) {
    await Log('backend', 'error', 'service', `failed to fetch notifications: ${err.message}`);
    res.status(502).json({ error: 'upstream fetch failed' });
  }
});

const { getTop10, getNotifications } = require('./top10');

// Return top-10 prioritized notifications (by type weight and recency)
app.get('/notifications/top10', async (req, res) => {
  try {
    await Log('backend', 'info', 'service', 'computing top-10 notifications');
    const authHeader = req.headers.authorization;
    const ranked = await getTop10('http://20.207.122.201/evaluation-service/notifications', authHeader);

    await Log('backend', 'debug', 'service', `top-10 computed, returning ${ranked.length}`);
    res.json({ top10: ranked });
  } catch (err) {
    console.error('top10 error:', err.message, err.response?.status, err.code);
    await Log('backend', 'error', 'service', `failed compute top10: ${err.message}`);
    res.status(502).json({ error: 'failed to compute top10', details: err.message });
  }
});

// New API endpoint: all notifications with filtering and pagination
app.get('/api/notifications', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const notification_type = req.query.notification_type || null;

    await Log('backend', 'info', 'service', `fetching notifications: limit=${limit}, page=${page}, type=${notification_type || 'all'}`);

    const authHeader = req.headers.authorization;
    const result = await getNotifications(
      'http://20.207.122.201/evaluation-service/notifications',
      authHeader,
      { limit, page, notification_type }
    );

    await Log('backend', 'debug', 'service', `returned ${result.notifications.length} of ${result.total}`);
    res.json(result);
  } catch (err) {
    console.error('notifications api error:', err.message, err.response?.status, err.code);
    await Log('backend', 'error', 'service', `notifications api failed: ${err.message}`);
    res.status(502).json({ error: 'failed to fetch notifications', details: err.message });
  }
});

// SPA fallback: serve index.html for any non-API route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../notification_app_fe/dist/index.html'));
});

app.listen(PORT, async () => {
  await Log('backend', 'info', 'service', `notification_app_be listening on ${PORT}`);
  console.log(`listening on ${PORT}`);
});
