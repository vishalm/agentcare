import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  useTheme,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  AdminPanelSettings,
  Person,
  LocalHospital,
  Business,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

import { useAuthStore } from '../store/authStore';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastLogin: string;
  department?: string;
}

const AdminPage: React.FC = () => {
  const theme = useTheme();
  const { user: _user } = useAuthStore();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Mock data for demonstration
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@agentcare.dev',
      role: 'doctor',
      status: 'active',
      lastLogin: '2024-01-15 09:30',
      department: 'Cardiology',
    },
    {
      id: '2',
      name: 'Nurse Alice Brown',
      email: 'alice.brown@agentcare.dev',
      role: 'nurse',
      status: 'active',
      lastLogin: '2024-01-15 08:45',
      department: 'Emergency',
    },
    {
      id: '3',
      name: 'John Smith',
      email: 'john.smith@email.com',
      role: 'patient',
      status: 'active',
      lastLogin: '2024-01-14 16:20',
    },
    {
      id: '4',
      name: 'Admin User',
      email: 'admin@agentcare.dev',
      role: 'admin',
      status: 'active',
      lastLogin: '2024-01-15 10:00',
      department: 'IT',
    },
  ]);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
  });

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return theme.palette.error.main;
      case 'doctor':
        return theme.palette.primary.main;
      case 'nurse':
        return theme.palette.success.main;
      case 'patient':
        return theme.palette.secondary.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return <AdminPanelSettings />;
      case 'doctor':
        return <LocalHospital />;
      case 'nurse':
        return <LocalHospital />;
      case 'patient':
        return <Person />;
      default:
        return <Business />;
    }
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setNewUser({ name: '', email: '', role: '', department: '' });
    setOpenDialog(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setNewUser({
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department || '',
    });
    setOpenDialog(true);
  };

  const handleSaveUser = () => {
    if (selectedUser) {
      // Update existing user
      setUsers(prev => prev.map(u => 
        u.id === selectedUser.id 
          ? { ...u, ...newUser }
          : u
      ));
    } else {
      // Create new user
      const newUserData: User = {
        id: Date.now().toString(),
        ...newUser,
        status: 'active',
        lastLogin: 'Never',
      };
      setUsers(prev => [...prev, newUserData]);
    }
    setOpenDialog(false);
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const stats = [
    {
      title: 'Total Users',
      value: users.length.toString(),
      icon: <Person />,
      color: theme.palette.primary.main,
    },
    {
      title: 'Active Doctors',
      value: users.filter(u => u.role === 'doctor' && u.status === 'active').length.toString(),
      icon: <LocalHospital />,
      color: theme.palette.success.main,
    },
    {
      title: 'Active Patients',
      value: users.filter(u => u.role === 'patient' && u.status === 'active').length.toString(),
      icon: <Person />,
      color: theme.palette.secondary.main,
    },
    {
      title: 'Administrators',
      value: users.filter(u => u.role === 'admin').length.toString(),
      icon: <AdminPanelSettings />,
      color: theme.palette.error.main,
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
            Administration Panel
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage users, roles, and system settings for AgentCare.
          </Typography>
        </Box>
      </motion.div>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card
                sx={{
                  background: `linear-gradient(135deg, ${stat.color}15, ${stat.color}05)`,
                  border: `1px solid ${stat.color}30`,
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar
                      sx={{
                        backgroundColor: stat.color,
                        color: 'white',
                        width: 48,
                        height: 48,
                      }}
                    >
                      {stat.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight={700}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {stat.title}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* User Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" fontWeight={600}>
                User Management
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleCreateUser}
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                }}
              >
                Add User
              </Button>
            </Box>

            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: theme.palette.action.hover }}>
                    <TableCell>User</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Last Login</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar
                            sx={{
                              backgroundColor: getRoleColor(user.role),
                              color: 'white',
                              width: 32,
                              height: 32,
                            }}
                          >
                            {user.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={600}>
                              {user.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {user.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getRoleIcon(user.role)}
                          label={user.role.toUpperCase()}
                          size="small"
                          sx={{
                            backgroundColor: getRoleColor(user.role),
                            color: 'white',
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell>{user.department || '-'}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.status}
                          size="small"
                          color={user.status === 'active' ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell>{user.lastLogin}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1}>
                          <IconButton
                            size="small"
                            onClick={() => handleEditUser(user)}
                            color="primary"
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteUser(user.id)}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* User Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedUser ? 'Edit User' : 'Create New User'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Full Name"
              value={newUser.name}
              onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
            />
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={newUser.role}
                label="Role"
                onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
              >
                <MenuItem value="admin">Administrator</MenuItem>
                <MenuItem value="doctor">Doctor</MenuItem>
                <MenuItem value="nurse">Nurse</MenuItem>
                <MenuItem value="receptionist">Receptionist</MenuItem>
                <MenuItem value="patient">Patient</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Department (Optional)"
              value={newUser.department}
              onChange={(e) => setNewUser(prev => ({ ...prev, department: e.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSaveUser}
            variant="contained"
            disabled={!newUser.name || !newUser.email || !newUser.role}
          >
            {selectedUser ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPage; 