import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const ProfilePage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        User Profile
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1" color="text.secondary">
            Profile management coming soon...
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProfilePage; 