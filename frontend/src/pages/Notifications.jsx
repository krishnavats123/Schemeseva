import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Button, List, ListItem,
  ListItemText, ListItemAvatar, Avatar, Chip, CircularProgress,
  Divider, Alert
} from '@mui/material';
import { Notifications as BellIcon, NotificationsNone, Circle } from '@mui/icons-material';
import { userAPI } from '../services/api';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    userAPI.getNotifications()
      .then(r => setNotifications(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    setMarking(true);
    try {
      await userAPI.markNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch { console.error('Failed to mark read'); }
    finally { setMarking(false); }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BellIcon color="primary" />
          <Typography variant="h5">Notifications</Typography>
          {unreadCount > 0 && (
            <Chip label={`${unreadCount} new`} color="primary" size="small" />
          )}
        </Box>
        {unreadCount > 0 && (
          <Button variant="outlined" size="small" onClick={markAllRead} disabled={marking}>
            {marking ? 'Marking…' : 'Mark all read'}
          </Button>
        )}
      </Box>

      {notifications.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <NotificationsNone sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography color="text.secondary">No notifications yet.</Typography>
            <Typography variant="body2" color="text.secondary">
              You'll be notified when new schemes matching your profile are added.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <List disablePadding>
            {notifications.map((notif, i) => (
              <React.Fragment key={notif.id}>
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    bgcolor: notif.read ? 'transparent' : '#F0F6FF',
                    cursor: notif.schemeId ? 'pointer' : 'default',
                    '&:hover': notif.schemeId ? { bgcolor: '#E6F1FB' } : {}
                  }}
                  onClick={() => notif.schemeId && navigate(`/schemes/${notif.schemeId}`)}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: notif.read ? 'grey.200' : 'primary.main', width: 36, height: 36 }}>
                      <BellIcon fontSize="small" sx={{ color: notif.read ? 'grey.500' : 'white' }} />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {!notif.read && (
                          <Circle sx={{ fontSize: 8, color: 'primary.main' }} />
                        )}
                        <Typography variant="body2" fontWeight={notif.read ? 400 : 600}>
                          {notif.message}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {timeAgo(notif.createdAt)}
                        {notif.schemeId && ' · Click to view scheme'}
                      </Typography>
                    }
                  />
                </ListItem>
                {i < notifications.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        </Card>
      )}
    </Box>
  );
}
