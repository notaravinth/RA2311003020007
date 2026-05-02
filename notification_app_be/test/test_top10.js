const MockAdapter = require('axios-mock-adapter');
const axios = require('axios');
const { getTop10, computeScore } = require('../top10');

const upstreamUrl = 'http://20.207.122.201/evaluation-service/notifications';

// Create sample notifications with different types and timestamps
const sampleNotifications = [];
const now = Date.now();
for (let i = 0; i < 15; i++) {
  const type = i % 3 === 0 ? 'Placement' : (i % 3 === 1 ? 'Result' : 'Event');
  const ts = new Date(now - i * 1000).toISOString().replace('T', ' ').split('.')[0];
  sampleNotifications.push({ ID: `id-${i}`, Type: type, Message: `m${i}`, Timestamp: ts });
}

// Mock axios
const mock = new MockAdapter(axios);
mock.onGet(upstreamUrl).reply(200, { notifications: sampleNotifications });

(async () => {
  try {
    const top10 = await getTop10(upstreamUrl);
    console.log('Top10 length:', top10.length);
    if (top10.length !== 10) throw new Error('expected 10 items');

    // Verify ordering: first item should be a Placement (highest weight)
    const firstType = top10[0].Type.toLowerCase();
    console.log('First type:', firstType);
    if (firstType !== 'placement') throw new Error('expected placement first');

    console.log('TEST PASS: top10 ranking looks correct');
  } catch (err) {
    console.error('TEST FAIL:', err);
    process.exitCode = 1;
  }
})();
