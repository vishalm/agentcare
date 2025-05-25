import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Chip,
  Divider,
} from '@mui/material';
import {
  Palette,
  LocalHospital,
  AdminPanelSettings,
  Person,
  NightlightRound,
  Business,
} from '@mui/icons-material';

interface ThemeSelectorProps {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
  onClose: () => void;
}

interface ThemeOption {
  key: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  gradientColors: [string, string];
}

const themeOptions: ThemeOption[] = [
  {
    key: 'doctor',
    name: 'Doctor',
    description: 'Professional blue theme for physicians',
    icon: <LocalHospital />,
    color: '#0066cc',
    gradientColors: ['#0066cc', '#00acc1'],
  },
  {
    key: 'nurse',
    name: 'Nurse',
    description: 'Warm teal theme for nursing staff',
    icon: <LocalHospital />,
    color: '#14b8a6',
    gradientColors: ['#14b8a6', '#06b6d4'],
  },
  {
    key: 'patient',
    name: 'Patient',
    description: 'Friendly purple theme for patients',
    icon: <Person />,
    color: '#7c3aed',
    gradientColors: ['#7c3aed', '#3b82f6'],
  },
  {
    key: 'admin',
    name: 'Administrator',
    description: 'Sophisticated dark blue for administrators',
    icon: <AdminPanelSettings />,
    color: '#1e40af',
    gradientColors: ['#1e40af', '#d97706'],
  },
  {
    key: 'receptionist',
    name: 'Receptionist',
    description: 'Welcoming green theme for front desk',
    icon: <Business />,
    color: '#059669',
    gradientColors: ['#059669', '#0ea5e9'],
  },
  {
    key: 'dark',
    name: 'Dark Mode',
    description: 'Dark theme for night time use',
    icon: <NightlightRound />,
    color: '#3b82f6',
    gradientColors: ['#1e293b', '#334155'],
  },
];

const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  onThemeChange,
  onClose,
}) => {
  const handleThemeSelect = (themeKey: string) => {
    onThemeChange(themeKey);
    onClose();
  };

  return (
    <Box sx={{ width: 320, maxHeight: 400, overflow: 'auto' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <Palette />
          <Typography variant="h6" fontWeight={600}>
            Choose Theme
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Select a theme that matches your role or preference
        </Typography>
      </Box>

      <List sx={{ p: 0 }}>
        {themeOptions.map((theme) => (
          <ListItem key={theme.key} disablePadding>
            <ListItemButton
              onClick={() => handleThemeSelect(theme.key)}
              sx={{
                py: 1.5,
                px: 2,
                backgroundColor: currentTheme === theme.key ? 'action.selected' : 'transparent',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 48 }}>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    background: `linear-gradient(135deg, ${theme.gradientColors[0]}, ${theme.gradientColors[1]})`,
                    color: 'white',
                  }}
                >
                  {theme.icon}
                </Avatar>
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {theme.name}
                    </Typography>
                    {currentTheme === theme.key && (
                      <Chip
                        label="Active"
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.75rem',
                          backgroundColor: theme.color,
                          color: 'white',
                        }}
                      />
                    )}
                  </Box>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary">
                    {theme.description}
                  </Typography>
                }
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Your theme will be saved to your profile and applied across all sessions.
        </Typography>
      </Box>
    </Box>
  );
};

export default ThemeSelector; 