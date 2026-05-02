import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  CssBaseline,
  ThemeProvider,
  createTheme,
  Container,
  Paper,
  Grid,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  CardActions,
  Chip,
  Box,
  Pagination,
  Stack,
  CircularProgress,
  Alert,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
    success: { main: '#4caf50' },
    warning: { main: '#ff9800' },
    error: { main: '#f44336' },
    background: { default: '#f5f5f5', paper: '#ffffff' },
  },
  typography: { fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif' },
});

const typeColors = {
  placement: { bg: '#e8f5e9', text: '#2e7d32', label: 'Placement' },
  result: { bg: '#e3f2fd', text: '#1565c0', label: 'Result' },
  event: { bg: '#fff3e0', text: '#e65100', label: 'Event' },
};

function App() {
  const [notifications, setNotifications] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(10);
  const [total, setTotal] = React.useState(0);
  const [pages, setPages] = React.useState(0);
  const [filterType, setFilterType] = React.useState('');
  const [showUnreadOnly, setShowUnreadOnly] = React.useState(false);
  const [readStatus, setReadStatus] = React.useState({});

  const fetchData = React.useCallback(async (pageNum = 1, type = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ limit, page: pageNum });
      if (type) params.append('notification_type', type);
      const response = await fetch(`/api/notifications?${params}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setNotifications(data.notifications || []);
      setTotal(data.total);
      setPages(data.pages);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  React.useEffect(() => {
    fetchData(page, filterType);
  }, [page, filterType, fetchData]);

  const toggleRead = (id) => {
    setReadStatus(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleFilterChange = (type) => {
    setFilterType(type);
    setPage(1);
  };

  const displayedNotifications = showUnreadOnly
    ? notifications.filter(n => !readStatus[n.ID])
    : notifications;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5', py: 4 }}>
        <Container maxWidth="lg">
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
              Notifications
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
              Manage all your campus notifications and filter by type or status
            </Typography>
          </Box>

          {/* Filters */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <FilterListIcon sx={{ color: 'action.active' }} />
              <Button
                variant={filterType === '' ? 'contained' : 'outlined'}
                onClick={() => handleFilterChange('')}
              >
                All
              </Button>
              <Button
                variant={filterType === 'placement' ? 'contained' : 'outlined'}
                onClick={() => handleFilterChange('placement')}
              >
                Placements
              </Button>
              <Button
                variant={filterType === 'result' ? 'contained' : 'outlined'}
                onClick={() => handleFilterChange('result')}
              >
                Results
              </Button>
              <Button
                variant={filterType === 'event' ? 'contained' : 'outlined'}
                onClick={() => handleFilterChange('event')}
              >
                Events
              </Button>
              <Box sx={{ flexGrow: 1 }} />
              <FormControlLabel
                control={<Switch checked={showUnreadOnly} onChange={(e) => setShowUnreadOnly(e.target.checked)} />}
                label="Unread Only"
              />
            </Box>
          </Paper>

          {/* Loading */}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          )}

          {/* Error */}
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          {/* Notifications Grid */}
          {!loading && displayedNotifications.length > 0 && (
            <>
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {displayedNotifications.map((notif) => {
                  const typeKey = (notif.Type || 'unknown').toLowerCase();
                  const colors = typeColors[typeKey] || { bg: '#eceff1', text: '#424242', label: notif.Type };
                  const isRead = readStatus[notif.ID];

                  return (
                    <Grid item xs={12} sm={6} md={4} key={notif.ID}>
                      <Card
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          opacity: isRead ? 0.7 : 1,
                          transition: 'all 0.2s',
                          border: isRead ? 'none' : `2px solid ${colors.text}`,
                          '&:hover': { boxShadow: 6 },
                        }}
                      >
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center' }}>
                            <Chip
                              label={colors.label}
                              size="small"
                              sx={{ backgroundColor: colors.bg, color: colors.text, fontWeight: 600 }}
                            />
                            {!isRead && (
                              <Chip label="New" size="small" color="primary" variant="outlined" />
                            )}
                          </Box>
                          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, lineHeight: 1.4 }}>
                            {notif.Message || 'No message'}
                          </Typography>
                          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
                            {notif.Timestamp || 'Unknown time'}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            ID: {notif.ID?.slice(0, 12)}...
                          </Typography>
                        </CardContent>
                        <CardActions sx={{ pt: 0 }}>
                          <Button
                            size="small"
                            startIcon={isRead ? <VisibilityIcon /> : <VisibilityOffIcon />}
                            onClick={() => toggleRead(notif.ID)}
                          >
                            {isRead ? 'Mark Unread' : 'Mark Read'}
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>

              {/* Pagination */}
              {pages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <Pagination
                    count={pages}
                    page={page}
                    onChange={(e, value) => setPage(value)}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}

          {/* Empty State */}
          {!loading && displayedNotifications.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="textSecondary">
                {showUnreadOnly ? 'No unread notifications' : 'No notifications found'}
              </Typography>
            </Box>
          )}

          {/* Stats */}
          <Paper sx={{ p: 2, mt: 4, backgroundColor: '#f0f0f0' }}>
            <Typography variant="body2" color="textSecondary">
              Showing {displayedNotifications.length} of {total} notifications
              {filterType && ` (filtered by ${filterType})`}
            </Typography>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
