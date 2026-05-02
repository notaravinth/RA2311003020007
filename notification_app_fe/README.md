# Notification App Frontend

This is a React frontend built with Vite and plain CSS.

## Run

```bash
cd notification_app_fe
npm install
npm run dev
```

The app calls the backend endpoint at `GET /api/notifications/top10`, which is proxied to `http://localhost:3000/notifications/top10` during development.

## Build

```bash
cd notification_app_fe
npm run build
```
