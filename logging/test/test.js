const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const { Log } = require('../index');

const EVAL_LOG_URL = 'http://20.207.122.201/evaluation-service/logs';

const mock = new MockAdapter(axios);
mock.onPost(EVAL_LOG_URL).reply(200, { logID: 'a1aad02e-19d0-4153-86d9-58bf55d7c402', message: 'log created successfully' });

(async () => {
  try {
    const res = await Log('backend', 'error', 'handler', 'received string, expected bool');
    console.log('TEST PASS:', res);
  } catch (err) {
    console.error('TEST FAIL:', err);
    process.exitCode = 1;
  }
})();
