import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const RegisterPage: React.FC = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%' }}>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            Register
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Registration page coming soon...
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RegisterPage; 