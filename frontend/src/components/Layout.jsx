import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, AppBar, Toolbar, Typography, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, IconButton, Badge,
  Avatar, Menu, MenuItem, Divider, Tooltip
} from '@mui/material';
import {
  Dashboard, Search, Person, Description, Notifications,
  Logout, Menu as MenuIcon, AccountBalance, AdminPanelSettings
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';

const DRAWER_WIDTH = 220;

const citizenNav = [
  { label: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { label: 'Schemes', icon: <Search />, path: '/schemes' },
  { label: 'Documents', icon: <Description />, path: '/documents' },
  { label: 'Notifications', icon: <Notifications />, path: '/notifications' },
  { label: 'Profile', icon: <Person />, path: '/profile' },
];

const adminNav = [
  { label: 'Admin Panel', icon: <AdminPanelSettings />, path: '/admin/dashboard' },
  { label: 'Schemes', icon: <Search />, path: '/schemes' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);

  const navItems = user?.role === 'ADMIN' ? adminNav : citizenNav;

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      userAPI.getUnreadCount()
        .then(r => setUnreadCount(r.data.count))
        .catch(() => {});
    }
  }, [location.pathname, user]);

  const drawer = (
    <Box>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <AccountBalance color="primary" />
        <Typography variant="subtitle1" fontWeight={700} color="primary">
          SchemeSeva
        </Typography>
      </Box>
      <Divider />
      <List dense>
        {navItems.map(item => {
          const active = location.pathname === item.path;
          return (
            <ListItem key={item.label} disablePadding>
              <ListItemButton
                selected={active}
                onClick={() => { navigate(item.path); setMobileOpen(false); }}
                sx={{
                  mx: 1, borderRadius: 2,
                  '&.Mui-selected': { bgcolor: 'primary.main', color: 'white',
                    '& .MuiListItemIcon-root': { color: 'white' } }
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {item.label === 'Notifications'
                    ? <Badge badgeContent={unreadCount} color="error">{item.icon}</Badge>
                    : item.icon
                  }
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position="fixed" elevation={0}
        sx={{ zIndex: t => t.zIndex.drawer + 1, bgcolor: 'white', borderBottom: '1px solid #E5E7EB' }}>
        <Toolbar>
          <IconButton edge="start" onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ mr: 2, display: { sm: 'none' } }}>
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <Tooltip title={user?.name}>
            <IconButton onClick={e => setAnchorEl(e.currentTarget)}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }}>
                {user?.name?.[0]?.toUpperCase()}
              </Avatar>
            </IconButton>
          </Tooltip>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem disabled><Typography variant="body2">{user?.name}</Typography></MenuItem>
            <Divider />
            <MenuItem onClick={() => { navigate('/profile'); setAnchorEl(null); }}>
              <Person fontSize="small" sx={{ mr: 1 }} /> Profile
            </MenuItem>
            <MenuItem onClick={() => { logout(); navigate('/login'); }}>
              <Logout fontSize="small" sx={{ mr: 1 }} /> Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box component="nav">
        <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)}
          sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}>
          {drawer}
        </Drawer>
        <Drawer variant="permanent"
          sx={{ display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', borderRight: '1px solid #E5E7EB' } }}>
          {drawer}
        </Drawer>
      </Box>

      <Box component="main"
        sx={{ flexGrow: 1, p: 3, mt: 8, ml: { sm: `${DRAWER_WIDTH}px` }, bgcolor: 'background.default' }}>
        <Outlet />
      </Box>
    </Box>
  );
}
