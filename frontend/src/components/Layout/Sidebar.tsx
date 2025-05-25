import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Chip,
  useTheme,
} from '@mui/material';
import {
  Dashboard,
  Chat,
  AdminPanelSettings,
  Person,
  LocalHospital,
  Schedule,
  Assessment,
  Help,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

import { useAuthStore } from '../../store/authStore';

interface SidebarProps {
  onMobileClose?: () => void;
}

interface NavigationItem {
  title: string;
  icon: React.ReactNode;
  path: string;
  roles?: string[];
  badge?: string;
}

const navigationItems: NavigationItem[] = [
  {
    title: 'Dashboard',
    icon: <Dashboard />,
    path: '/dashboard',
  },
  {
    title: 'AI Chat',
    icon: <Chat />,
    path: '/chat',
  },
  {
    title: 'Appointments',
    icon: <Schedule />,
    path: '/appointments',
    roles: ['doctor', 'nurse', 'receptionist', 'patient'],
  },
  {
    title: 'Patients',
    icon: <LocalHospital />,
    path: '/patients',
    roles: ['doctor', 'nurse', 'admin'],
  },
  {
    title: 'Analytics',
    icon: <Assessment />,
    path: '/analytics',
    roles: ['admin', 'doctor'],
  },
  {
    title: 'Administration',
    icon: <AdminPanelSettings />,
    path: '/admin',
    roles: ['admin', 'administrator', 'super_admin', 'system_admin'],
    badge: 'Admin',
  },
];

const Sidebar: React.FC<SidebarProps> = ({ onMobileClose }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  const handleNavigation = (path: string) => {
    navigate(path);
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const isItemVisible = (item: NavigationItem) => {
    if (!item.roles) return true;
    return item.roles.some(role => 
      user?.role?.toLowerCase().includes(role.toLowerCase())
    );
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo and Brand */}
      <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '1.25rem',
              }}
            >
              🏥
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                AgentCare
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Healthcare AI Platform
              </Typography>
            </Box>
          </Box>
        </motion.div>
      </Box>

      {/* User Info */}
      <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '0.875rem',
            }}
          >
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" fontWeight={600} noWrap>
              {user?.name || 'User'}
            </Typography>
            <Chip
              label={user?.role?.replace('_', ' ') || 'User'}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.75rem',
                backgroundColor: theme.palette.primary.main,
                color: 'white',
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List sx={{ px: 1, py: 2 }}>
          {navigationItems.map((item, index) => {
            if (!isItemVisible(item)) return null;

            return (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => handleNavigation(item.path)}
                    sx={{
                      borderRadius: 2,
                      py: 1.5,
                      backgroundColor: isActiveRoute(item.path)
                        ? theme.palette.primary.main
                        : 'transparent',
                      color: isActiveRoute(item.path)
                        ? 'white'
                        : theme.palette.text.primary,
                      '&:hover': {
                        backgroundColor: isActiveRoute(item.path)
                          ? theme.palette.primary.dark
                          : theme.palette.action.hover,
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: isActiveRoute(item.path)
                          ? 'white'
                          : theme.palette.primary.main,
                        minWidth: 40,
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.title}
                      primaryTypographyProps={{
                        fontWeight: isActiveRoute(item.path) ? 600 : 500,
                        fontSize: '0.875rem',
                      }}
                    />
                    {item.badge && (
                      <Chip
                        label={item.badge}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.75rem',
                          backgroundColor: isActiveRoute(item.path)
                            ? 'rgba(255, 255, 255, 0.2)'
                            : theme.palette.error.main,
                          color: isActiveRoute(item.path)
                            ? 'white'
                            : 'white',
                        }}
                      />
                    )}
                  </ListItemButton>
                </ListItem>
              </motion.div>
            );
          })}
        </List>
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <List dense>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleNavigation('/profile')}
              sx={{ borderRadius: 1, py: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <Person fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Profile"
                primaryTypographyProps={{ fontSize: '0.875rem' }}
              />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton sx={{ borderRadius: 1, py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <Help fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Help"
                primaryTypographyProps={{ fontSize: '0.875rem' }}
              />
            </ListItemButton>
          </ListItem>
        </List>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', textAlign: 'center', mt: 1 }}
        >
          AgentCare v2.0.0
        </Typography>
      </Box>
    </Box>
  );
};

export default Sidebar; 