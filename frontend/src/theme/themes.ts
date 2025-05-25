import { createTheme, ThemeOptions } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

// Common theme settings
const commonTheme = {
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h4: {
      fontWeight: 500,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.125rem',
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      fontWeight: 500,
      textTransform: 'none' as const,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '12px 24px',
          fontWeight: 500,
          textTransform: 'none' as const,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
          },
        },
      },
    },
  },
};

// Doctor/Physician Theme - Professional blue/teal
export const doctorTheme = createTheme({
  ...commonTheme,
  palette: {
    mode: 'light',
    primary: {
      main: '#0066cc',
      light: '#3384d6',
      dark: '#004ba3',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#00acc1',
      light: '#33bfcf',
      dark: '#007c89',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
  },
  components: {
    ...commonTheme.components,
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #0066cc 0%, #00acc1 100%)',
          boxShadow: '0 4px 20px rgba(0, 102, 204, 0.2)',
        },
      },
    },
  },
} as ThemeOptions);

// Nurse Theme - Warm teal/green
export const nurseTheme = createTheme({
  ...commonTheme,
  palette: {
    mode: 'light',
    primary: {
      main: '#14b8a6',
      light: '#2dd4bf',
      dark: '#0f766e',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#06b6d4',
      light: '#22d3ee',
      dark: '#0891b2',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f0fdfa',
      paper: '#ffffff',
    },
    text: {
      primary: '#134e4a',
      secondary: '#5f8a8b',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
  },
  components: {
    ...commonTheme.components,
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)',
          boxShadow: '0 4px 20px rgba(20, 184, 166, 0.2)',
        },
      },
    },
  },
} as ThemeOptions);

// Patient Theme - Friendly purple/blue
export const patientTheme = createTheme({
  ...commonTheme,
  palette: {
    mode: 'light',
    primary: {
      main: '#7c3aed',
      light: '#a855f7',
      dark: '#5b21b6',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#1d4ed8',
      contrastText: '#ffffff',
    },
    background: {
      default: '#faf5ff',
      paper: '#ffffff',
    },
    text: {
      primary: '#44337a',
      secondary: '#6b7280',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
  },
  components: {
    ...commonTheme.components,
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)',
          boxShadow: '0 4px 20px rgba(124, 58, 237, 0.2)',
        },
      },
    },
  },
} as ThemeOptions);

// Administrator Theme - Sophisticated dark blue/gold
export const adminTheme = createTheme({
  ...commonTheme,
  palette: {
    mode: 'light',
    primary: {
      main: '#1e40af',
      light: '#3b82f6',
      dark: '#1e3a8a',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#d97706',
      light: '#f59e0b',
      dark: '#92400e',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f1f5f9',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
  },
  components: {
    ...commonTheme.components,
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #1e40af 0%, #d97706 100%)',
          boxShadow: '0 4px 20px rgba(30, 64, 175, 0.2)',
        },
      },
    },
  },
} as ThemeOptions);

// Receptionist Theme - Welcoming green/blue
export const receptionistTheme = createTheme({
  ...commonTheme,
  palette: {
    mode: 'light',
    primary: {
      main: '#059669',
      light: '#10b981',
      dark: '#047857',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#0ea5e9',
      light: '#38bdf8',
      dark: '#0284c7',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f0fdf4',
      paper: '#ffffff',
    },
    text: {
      primary: '#064e3b',
      secondary: '#6b7280',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
  },
  components: {
    ...commonTheme.components,
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #059669 0%, #0ea5e9 100%)',
          boxShadow: '0 4px 20px rgba(5, 150, 105, 0.2)',
        },
      },
    },
  },
} as ThemeOptions);

// Dark Theme for night mode
export const darkTheme = createTheme({
  ...commonTheme,
  palette: {
    mode: 'dark',
    primary: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#1d4ed8',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
      contrastText: '#ffffff',
    },
    background: {
      default: '#0f172a',
      paper: '#1e293b',
    },
    text: {
      primary: '#f8fafc',
      secondary: '#cbd5e1',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
  },
  components: {
    ...commonTheme.components,
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e293b',
          borderColor: '#334155',
        },
      },
    },
  },
} as ThemeOptions);

// Theme mapping by user role
export const themesByRole = {
  doctor: doctorTheme,
  physician: doctorTheme,
  specialist: doctorTheme,
  nurse: nurseTheme,
  'nurse_practitioner': nurseTheme,
  'physician_assistant': nurseTheme,
  patient: patientTheme,
  caregiver: patientTheme,
  family_member: patientTheme,
  admin: adminTheme,
  administrator: adminTheme,
  super_admin: adminTheme,
  system_admin: adminTheme,
  receptionist: receptionistTheme,
  'front_desk': receptionistTheme,
  scheduler: receptionistTheme,
  coordinator: receptionistTheme,
  dark: darkTheme,
};

export type ThemeKey = keyof typeof themesByRole;

export const getThemeByRole = (role: string): any => {
  const normalizedRole = role.toLowerCase().replace(/\s+/g, '_') as ThemeKey;
  return themesByRole[normalizedRole] || patientTheme; // Default to patient theme
}; 