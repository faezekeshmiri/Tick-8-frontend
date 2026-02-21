import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Card, CardActionArea, CardContent, Typography } from '@mui/material';
import { ManageAccounts, Shield } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
        <Shield color="secondary" />
        <Typography variant="h4" fontWeight="bold">
          Admin Panel
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Logged in as <strong>{user?.display_name}</strong>
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          gap: 2,
        }}
      >
        <Card sx={{ borderRadius: 3 }}>
          <CardActionArea onClick={() => navigate('/admin/users')}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 3 }}>
              <ManageAccounts color="primary" sx={{ fontSize: 36 }} />
              <Typography variant="h6" fontWeight="bold">
                User Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                View, search, suspend, and reactivate user accounts. Assign administrator roles.
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
