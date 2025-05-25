import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Stack,
  Avatar,
  LinearProgress,
  useTheme,
} from '@mui/material';
import {
  Dashboard,
  TrendingUp,
  Schedule,
  Person,
  Notifications,
  Chat,
  Assessment,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

import { useAuthStore } from '../store/authStore';

const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuthStore();

  const statsCards = [
    {
      title: 'Today\'s Appointments',
      value: '12',
      change: '+2 from yesterday',
      icon: <Schedule />,
      color: theme.palette.primary.main,
    },
    {
      title: 'Active Patients',
      value: '847',
      change: '+15 this week',
      icon: <Person />,
      color: theme.palette.success.main,
    },
    {
      title: 'AI Conversations',
      value: '156',
      change: '+23 today',
      icon: <Chat />,
      color: theme.palette.secondary.main,
    },
    {
      title: 'System Health',
      value: '99.8%',
      change: 'All systems operational',
      icon: <Assessment />,
      color: theme.palette.info.main,
    },
  ];

  const recentActivities = [
    {
      user: 'Dr. Sarah Johnson',
      action: 'completed appointment with',
      target: 'John Smith',
      time: '5 minutes ago',
      avatar: 'SJ',
    },
    {
      user: 'Nurse Alice Brown',
      action: 'updated patient records for',
      target: 'Mary Wilson',
      time: '12 minutes ago',
      avatar: 'AB',
    },
    {
      user: 'AI Assistant',
      action: 'processed booking request from',
      target: 'Robert Davis',
      time: '18 minutes ago',
      avatar: '🤖',
    },
  ];

  return (
    <Box>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box mb={4}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here's what's happening with your healthcare platform today.
          </Typography>
          <Chip
            label={`Theme: ${user?.role?.replace('_', ' ').toUpperCase() || 'USER'}`}
            sx={{
              mt: 1,
              backgroundColor: theme.palette.primary.main,
              color: 'white',
              fontWeight: 600,
            }}
          />
        </Box>
      </motion.div>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        {statsCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={card.title}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card
                sx={{
                  height: '100%',
                  background: `linear-gradient(135deg, ${card.color}15, ${card.color}05)`,
                  border: `1px solid ${card.color}30`,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    transition: 'transform 0.2s ease-in-out',
                    boxShadow: `0 8px 25px ${card.color}20`,
                  },
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Avatar
                      sx={{
                        backgroundColor: card.color,
                        color: 'white',
                        width: 48,
                        height: 48,
                      }}
                    >
                      {card.icon}
                    </Avatar>
                    <TrendingUp sx={{ color: theme.palette.success.main }} />
                  </Box>
                  <Typography variant="h4" fontWeight={700} gutterBottom>
                    {card.value}
                  </Typography>
                  <Typography variant="h6" color="text.primary" gutterBottom>
                    {card.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {card.change}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Content Grid */}
      <Grid container spacing={3}>
        {/* Recent Activity */}
        <Grid item xs={12} md={8}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Recent Activity
                </Typography>
                <Stack spacing={2}>
                  {recentActivities.map((activity, index) => (
                    <Box
                      key={index}
                      sx={{
                        p: 2,
                        backgroundColor: theme.palette.action.hover,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      <Avatar
                        sx={{
                          backgroundColor: theme.palette.primary.main,
                          color: 'white',
                          width: 40,
                          height: 40,
                        }}
                      >
                        {activity.avatar}
                      </Avatar>
                      <Box flex={1}>
                        <Typography variant="body2">
                          <strong>{activity.user}</strong> {activity.action}{' '}
                          <strong>{activity.target}</strong>
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {activity.time}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
              <CardActions>
                <Button size="small" color="primary">
                  View All Activity
                </Button>
              </CardActions>
            </Card>
          </motion.div>
        </Grid>

        {/* System Status */}
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  System Status
                </Typography>
                <Stack spacing={3}>
                  <Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">AI Agents</Typography>
                      <Typography variant="body2" color="success.main">
                        Online
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={98}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: theme.palette.action.hover,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: theme.palette.success.main,
                        },
                      }}
                    />
                  </Box>
                  <Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Database</Typography>
                      <Typography variant="body2" color="success.main">
                        Healthy
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={95}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: theme.palette.action.hover,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: theme.palette.primary.main,
                        },
                      }}
                    />
                  </Box>
                  <Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Ollama LLM</Typography>
                      <Typography variant="body2" color="success.main">
                        Connected
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={92}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: theme.palette.action.hover,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: theme.palette.secondary.main,
                        },
                      }}
                    />
                  </Box>
                </Stack>
              </CardContent>
              <CardActions>
                <Button size="small" color="primary">
                  View Details
                </Button>
              </CardActions>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Quick Actions
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap" gap={1}>
              <Button
                variant="contained"
                startIcon={<Chat />}
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                }}
              >
                Start AI Chat
              </Button>
              <Button variant="outlined" startIcon={<Schedule />}>
                View Schedule
              </Button>
              <Button variant="outlined" startIcon={<Person />}>
                Patient Records
              </Button>
              <Button variant="outlined" startIcon={<Assessment />}>
                Analytics
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default DashboardPage; 