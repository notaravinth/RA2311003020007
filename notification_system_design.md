# Stage 1

The campus notifications application has been running for a few weeks. You've received
feedback from users that they lose track of important notifications because of the high volume
of notifications. The product manager asked to introduce a Priority Inbox that always displays
the top 'n' most important unread notifications first.

## Implementation approach

- Priority is determined by a combination of placement (weight 3), result (weight 2), event (weight 1), and recency.
- Scoring: `score = weight * 1e14 + timestamp_ms` so type dominates but recency breaks ties.
- For this repository the ranking logic is implemented in `notification_app_be/top10.js` and exposed
  through `GET /notifications/top10` in the backend.
- For streaming or very large volumes, use a bounded min-heap of size N (10) to maintain top-N with O(log N) updates.

## How to run

1. Start the backend (it integrates the logging middleware):

```bash
cd notification_app_be
npm install
npm start
```

2. Fetch the prioritized top-10:

```bash
curl http://localhost:3000/notifications/top10
```

3. Run the ranking unit test:

```bash
cd notification_app_be
npm test
```

## Screenshots

- After hitting `/notifications/top10`, capture the terminal or browser output and save it under `screenshots/top10.png`.
- Example steps on Windows:
  - Run the `curl` command in PowerShell.
  - Press `Win+Shift+S`, select area and save the image.
  - Commit the screenshot to the repo.

---

This file documents the Stage 1 approach implemented in this repository. The code files to review:
- `notification_app_be/top10.js` — scoring and `getTop10()` implementation
- `notification_app_be/index.js` — endpoint wiring and logging calls
- `logging/index.js` — reusable `Log()` function that posts to the evaluation logging API
