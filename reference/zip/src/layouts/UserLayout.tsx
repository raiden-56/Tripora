import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Badge,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
} from '@mui/material';
import {
  Explore,
  History,
  Favorite,
  Person,
  Logout,
  Brightness4,
  Brightness7,
  Notifications,
  Menu as MenuIcon,
  Close,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeContext';

const navItems = [
  { label: 'Explore', icon: <Explore />, path: '/user' },
  { label: 'Bookings', icon: <History />, path: '/user/bookings' },
  { label: 'Favorites', icon: <Favorite />, path: '/user/favorites' },
  { label: 'Profile', icon: <Person />, path: '/user/profile' },
];

const UserLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useThemeMode();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width:768px)');
  const isTablet = useMediaQuery('(max-width:960px)');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    setAnchorEl(null);
    logout();
    navigate('/login');
  };

  const currentNavIndex = navItems.findIndex(
    (item) => item.path === location.pathname,
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar
          sx={{
            gap: 1,
            minHeight: { xs: 56, sm: 64 },
            px: { xs: 1.5, sm: 2 },
          }}
        >
          {isTablet && (
            <IconButton
              onClick={() => setMobileOpen(true)}
              sx={{ color: 'text.primary' }}
              size="small"
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography
            variant="h6"
            sx={{
              color: 'primary.main',
              fontWeight: 800,
              cursor: 'pointer',
              letterSpacing: -0.5,
              fontSize: { xs: '1rem', sm: '1.1rem' },
            }}
            onClick={() => navigate('/user')}
          >
            HireGuide
          </Typography>

          {!isTablet && (
            <Box sx={{ display: 'flex', gap: 0.5, ml: 4 }}>
              {navItems.map((item) => (
                <Box
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    cursor: 'pointer',
                    color:
                      location.pathname === item.path
                        ? 'primary.main'
                        : 'text.secondary',
                    bgcolor:
                      location.pathname === item.path
                        ? 'primary.main'
                        : 'transparent',
                    ...(location.pathname === item.path && {
                      color: 'white',
                      '& .MuiSvgIcon-root': { color: 'white' },
                    }),
                    '&:hover': {
                      bgcolor:
                        location.pathname === item.path
                          ? 'primary.dark'
                          : 'action.hover',
                    },
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    transition: 'all 0.2s',
                  }}
                >
                  {item.icon}
                  {item.label}
                </Box>
              ))}
            </Box>
          )}

          <Box sx={{ flex: 1 }} />

          <Tooltip title={mode === 'light' ? 'Dark mode' : 'Light mode'}>
            <IconButton
              onClick={toggleTheme}
              sx={{ color: 'text.secondary' }}
              size={isMobile ? 'small' : 'medium'}
            >
              {mode === 'light' ? <Brightness4 /> : <Brightness7 />}
            </IconButton>
          </Tooltip>

          <IconButton
            sx={{ color: 'text.secondary' }}
            size={isMobile ? 'small' : 'medium'}
          >
            <Badge badgeContent={3} color="primary">
              <Notifications fontSize={isMobile ? 'small' : 'medium'} />
            </Badge>
          </IconButton>

          <IconButton
            onClick={(e) => setAnchorEl(e.currentTarget)}
            size="small"
          >
            <Avatar
              sx={{
                width: { xs: 30, sm: 34 },
                height: { xs: 30, sm: 34 },
                bgcolor: 'primary.main',
                fontSize: '0.85rem',
              }}
            >
              {user?.name?.charAt(0) || 'U'}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={!!anchorEl}
            onClose={() => setAnchorEl(null)}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle2" fontWeight={700}>
                {user?.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.email}
              </Typography>
            </Box>
            <Divider />
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                navigate('/user/profile');
              }}
            >
              <Person sx={{ mr: 1, fontSize: 20 }} /> Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 1, fontSize: 20 }} /> Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '85vw', sm: 300 },
            maxWidth: 320,
            bgcolor: 'background.paper',
          },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2,
              py: 1.5,
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: 'primary.main', fontWeight: 800 }}
            >
              HireGuide
            </Typography>
            <IconButton onClick={() => setMobileOpen(false)} size="small">
              <Close />
            </IconButton>
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 2,
              py: 2,
              bgcolor: 'action.hover',
            }}
          >
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: 'primary.main',
                fontSize: '0.9rem',
              }}
            >
              {user?.name?.charAt(0) || 'U'}
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="subtitle2" fontWeight={700} noWrap>
                {user?.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {user?.email}
              </Typography>
            </Box>
          </Box>

          <Divider />

          <List sx={{ flex: 1, px: 1, pt: 1 }}>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => {
                      navigate(item.path);
                      setMobileOpen(false);
                    }}
                    sx={{
                      borderRadius: 2,
                      bgcolor: isActive ? 'primary.main' : 'transparent',
                      color: isActive ? 'white' : 'text.primary',
                      '&:hover': {
                        bgcolor: isActive ? 'primary.dark' : 'action.hover',
                      },
                      '& .MuiListItemIcon-root': {
                        color: isActive ? 'white' : 'text.secondary',
                      },
                      py: 1.2,
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontWeight: isActive ? 700 : 500,
                        fontSize: '0.9rem',
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>

          <Divider />

          <Box sx={{ p: 2 }}>
            <ListItemButton
              onClick={toggleTheme}
              sx={{ borderRadius: 2, mb: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {mode === 'light' ? <Brightness4 /> : <Brightness7 />}
              </ListItemIcon>
              <ListItemText
                primary={mode === 'light' ? 'Dark Mode' : 'Light Mode'}
                primaryTypographyProps={{ fontSize: '0.9rem' }}
              />
            </ListItemButton>
            <ListItemButton
              onClick={() => {
                setMobileOpen(false);
                handleLogout();
              }}
              sx={{ borderRadius: 2, color: 'error.main' }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'error.main' }}>
                <Logout />
              </ListItemIcon>
              <ListItemText
                primary="Logout"
                primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 600 }}
              />
            </ListItemButton>
          </Box>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flex: 1,
          p: { xs: 1.5, sm: 2, md: 3 },
          pb: { xs: 9, sm: 2, md: 3 },
          maxWidth: 1400,
          mx: 'auto',
          width: '100%',
        }}
      >
        <Outlet />
      </Box>

      {isMobile && (
        <Paper
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1200,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
          elevation={8}
        >
          <BottomNavigation
            value={currentNavIndex >= 0 ? currentNavIndex : 0}
            onChange={(_, newValue) => {
              navigate(navItems[newValue].path);
            }}
            showLabels
            sx={{
              height: 56,
              bgcolor: 'background.paper',
              '& .MuiBottomNavigationAction-root': {
                minWidth: 'auto',
                py: 0.5,
                color: 'text.secondary',
                '&.Mui-selected': {
                  color: 'primary.main',
                },
              },
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.65rem',
                mt: 0.3,
                '&.Mui-selected': {
                  fontSize: '0.65rem',
                  fontWeight: 700,
                },
              },
            }}
          >
            {navItems.map((item) => (
              <BottomNavigationAction
                key={item.path}
                label={item.label}
                icon={item.icon}
              />
            ))}
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );
};

export default UserLayout;
