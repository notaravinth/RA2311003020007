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

---

# Stage 2

The application now needs a responsive, production-ready frontend that displays all notifications with filtering, pagination, and a way to distinguish between new (unviewed) and already-viewed notifications. The backend API has been expanded to support query parameters for flexible filtering.

## Implementation approach

### Backend API Enhancements

The `/api/notifications` endpoint now supports the following query parameters:

- `limit` (default: 20, max: 100) — number of results per page
- `page` (default: 1) — pagination page number
- `notification_type` (optional) — filter by "event", "result", or "placement"

Response format:

```json
{
  "notifications": [...],
  "total": 12,
  "page": 1,
  "limit": 20,
  "pages": 1
}
```

All notifications are ranked by the same scoring algorithm: `weight * 1e14 + timestamp_ms`.

### Frontend Implementation

**Technology Stack:**

- React 18 with Material-UI (MUI) for styling
- Clean, responsive design suitable for desktop and mobile
- No ShadCN or external CSS libraries — Material-UI only

**Key Features:**

- Display all notifications in a card-based grid layout
- Filter notifications by type (Placement, Result, Event)
- Mark notifications as read/unread locally (client-side state)
- Toggle "Unread Only" view to focus on new notifications
- Pagination support with Material-UI Pagination component
- Type-based color coding for visual distinction
- Responsive design: works seamlessly on desktop, tablet, and mobile viewports
- Real-time stats showing total and filtered notification count

**Read Status:**

- Implemented as client-side state (not persisted to server)
- Each notification can be toggled between read/unread
- Visual indicators: unread notifications show a blue border and "New" badge
- Read notifications appear with reduced opacity

### User Experience

1. **Landing Page**: User sees all notifications ranked by importance and recency
2. **Filtering**: Users can filter by notification type or view unread notifications only
3. **Pagination**: Large lists are paginated (10 items per page by default)
4. **Read Management**: Click "Mark Read" or "Mark Unread" on each card to toggle status
5. **Visual Feedback**: Type-based color chips and status badges for clarity

## Architecture

```
notification_app_be/
├── index.js              # Express server, serves frontend from dist/
├── top10.js              # Ranking algorithm, new getNotifications() function
└── dist/                 # Backend serves built React app from this folder

notification_app_fe/
├── src/main.jsx          # Single React component with all UI logic
├── src/styles.css        # Removed (using Material-UI now)
├── vite.config.js        # Vite build config
└── dist/                 # Production build output
```

## How to run

### Development Mode (with hot reload)

```bash
# Terminal 1: Start backend
cd notification_app_be
npm install
npm start

# Terminal 2: Start frontend dev server (optional, for hot reload)
cd notification_app_fe
npm install
npm run dev
```

Then open `http://localhost:3000` to see the frontend. The backend serves the production build directly.

### Production Mode

```bash
cd notification_app_be
npm install
npm start
```

Open `http://localhost:3000` in your browser. The backend automatically serves the built React app.

### Testing

```bash
# Test backend ranking logic
cd notification_app_be
npm test

# Test logging middleware
cd logging
npm test
```

## API Usage Examples

**Fetch all notifications, paginated:**

```bash
curl "http://localhost:3000/api/notifications?limit=10&page=1"
```

**Filter by placement notifications:**

```bash
curl "http://localhost:3000/api/notifications?notification_type=placement&limit=5"
```

**Fetch results with pagination:**

```bash
curl "http://localhost:3000/api/notifications?notification_type=result&page=2&limit=20"
```

## Frontend Code Files

- `notification_app_fe/src/main.jsx` — Complete React app with Material-UI components, filtering, pagination
- `notification_app_fe/package.json` — Updated with Material-UI dependencies
- `notification_be/index.js` — Updated to serve static frontend files and expose `/api/notifications`
- `notification_be/top10.js` — New `getNotifications()` function supporting filtering and pagination

## Design Decisions

1. **Material-UI Only**: Used Material-UI exclusively for consistent, professional styling without external CSS libraries
2. **Client-side Read State**: Read/unread status is managed client-side for simplicity; can be extended to server-side persistence
3. **Mock Data Fallback**: Backend gracefully falls back to mock data when the upstream API is unavailable (401, network errors)
4. **Responsive Grid**: Material-UI Grid system automatically adjusts layout for mobile (1 col), tablet (2 col), desktop (4 col)
5. **Single Component App**: Kept React app simple with one main component for clarity and performance
