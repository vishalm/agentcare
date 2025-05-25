import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const ChatPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        AI Chat Assistant
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1" color="text.secondary">
            AI Chat interface coming soon...
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ChatPage; 