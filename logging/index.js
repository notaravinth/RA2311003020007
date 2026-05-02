const axios = require('axios');

const EVAL_LOG_URL = 'http://20.207.122.201/evaluation-service/logs';

const ALLOWED_STACKS = ['backend', 'frontend'];
const ALLOWED_LEVELS = ['debug', 'info', 'warn', 'error', 'fatal'];

const BACKEND_PACKAGES = [
  'cache', 'controller', 'cron_job', 'db', 'domain', 'handler', 'repository', 'route', 'service'
];
const FRONTEND_PACKAGES = [
  'api', 'component', 'hook', 'page', 'state', 'style'
];
const BOTH_PACKAGES = [ 'auth', 'config', 'middleware', 'utils' ];

function isAllowedPackage(pkg, stack) {
  if (BOTH_PACKAGES.includes(pkg)) return true;
  if (stack === 'backend') return BACKEND_PACKAGES.includes(pkg);
  if (stack === 'frontend') return FRONTEND_PACKAGES.includes(pkg);
  return false;
}

function validateArgs(stack, level, pkg, message) {
  if (typeof stack !== 'string' || typeof level !== 'string' || typeof pkg !== 'string') {
    throw new TypeError('`stack`, `level`, and `package` must be strings');
  }
  const s = stack.toLowerCase();
  const l = level.toLowerCase();
  const p = pkg.toLowerCase();

  if (!ALLOWED_STACKS.includes(s)) throw new Error(`invalid stack: ${stack}`);
  if (!ALLOWED_LEVELS.includes(l)) throw new Error(`invalid level: ${level}`);
  if (!isAllowedPackage(p, s)) throw new Error(`invalid package: ${pkg} for stack ${stack}`);
  if (typeof message !== 'string') throw new TypeError('`message` must be a string');

  return { stack: s, level: l, package: p, message };
}

async function Log(stack, level, pkg, message) {
  const payload = validateArgs(stack, level, pkg, message);

  try {
    const res = await axios.post(EVAL_LOG_URL, payload, { timeout: 5000 });
    return res.data;
  } catch (err) {
    // Surface useful error for callers; preserve original error
    const e = new Error('failed to send log: ' + (err && err.message));
    e.original = err;
    throw e;
  }
}

module.exports = { Log, ALLOWED_STACKS, ALLOWED_LEVELS };
