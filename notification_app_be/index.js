const express = require('express');
const axios = require('axios');
const { Log } = require('../logging');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

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

app.listen(PORT, async () => {
  await Log('backend', 'info', 'service', `notification_app_be listening on ${PORT}`);
  console.log(`listening on ${PORT}`);
});
