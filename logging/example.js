const { Log } = require('./index');

(async () => {
  try {
    const res = await Log('backend', 'error', 'handler', 'received string, expected bool');
    console.log('Log response:', res);
  } catch (err) {
    console.error('Log failed:', err.message);
    if (err.original) console.error('original:', err.original.toString());
  }
})();
