# Notification Backend (minimal)

This is a minimal backend scaffold to integrate the `logging` middleware.

Usage

Install deps and start the server:

```bash
cd notification_app_be
npm install
npm start
```

Routes

- `GET /` - health check
- `GET /notifications/fetch` - proxies the upstream notifications API and logs events
