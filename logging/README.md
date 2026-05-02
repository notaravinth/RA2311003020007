# Logging Middleware

This is a small reusable logging middleware package that sends structured logs to the evaluation server.

Usage

1. Install dependencies: `npm install` in the `logging` folder.
2. Call the exported `Log(stack, level, package, message)` function.

Example

```
const { Log } = require('./index');
await Log('backend', 'error', 'handler', 'received string, expected bool');
```

Constraints enforced by this package:
- `stack`: `backend` or `frontend`
- `level`: `debug`, `info`, `warn`, `error`, `fatal`
- `package`: limited lists depending on `stack` (per the spec)
