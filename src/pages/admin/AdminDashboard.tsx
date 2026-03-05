import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {
  People as PeopleIcon,
  Person as PersonIcon,
  PersonOff as PersonOffIcon,
  AdminPanelSettings as AdminIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import * as adminApi from '../../api/admin';
import { AdminStats, AdminUserView } from '../../types/auth.types';

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const STAT_CARDS: { key: keyof AdminStats; label: string; icon: React.ReactNode; color: string }[] = [
    { key: 'total_users', label: t('admin.totalUsers'), icon: <PeopleIcon />, color: 'primary.main' },
    { key: 'active_users', label: t('admin.active'), icon: <PersonIcon />, color: 'success.main' },
    { key: 'suspended_users', label: t('admin.suspended'), icon: <PersonOffIcon />, color: 'error.main' },
    { key: 'admin_count', label: t('admin.administrators'), icon: <AdminIcon />, color: 'secondary.main' },
  ];
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<AdminUserView[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await adminApi.getAdminStats();
      setStats(data);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const loadRecent = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res = await adminApi.listUsers({ page: 1, page_size: 8 });
      setRecentUsers(res.users);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    loadRecent();
  }, [loadRecent]);

  if (statsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {STAT_CARDS.map(({ key, label, icon, color }) => (
          <Grid item xs={12} sm={6} md={3} key={key}>
            <Card variant="outlined" sx={{ height: '100%', borderRadius: 2 }}>
              <CardContent sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Box sx={{ color, display: 'flex', alignItems: 'center', fontSize: 36 }}>{icon}</Box>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {stats ? stats[key] : '—'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {label}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
        {t('admin.recentUsers')}
      </Typography>
      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, mb: 2 }}>
        {usersLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('admin.name')}</TableCell>
                <TableCell>{t('admin.email')}</TableCell>
                <TableCell>{t('admin.role')}</TableCell>
                <TableCell>{t('admin.status')}</TableCell>
                <TableCell>{t('admin.joined')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentUsers.map((u) => (
                <TableRow
                  key={u.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/admin/users/${u.id}`)}
                >
                  <TableCell>{u.display_name}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{u.email}</TableCell>
                  <TableCell>{u.role === 'admin' ? t('admin.adminRole') : t('admin.userRole')}</TableCell>
                  <TableCell>{u.is_active ? t('admin.activeStatus') : t('admin.suspendedStatus')}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>
                    {new Date(u.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Typography
          component="button"
          variant="body2"
          sx={{
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            color: 'primary.main',
            fontWeight: 600,
          }}
          onClick={() => navigate('/admin/users')}
        >
          {t('admin.viewAllUsers')}
          <ArrowForwardIcon fontSize="small" />
        </Typography>
      </Box>
    </>
  );
};

export default AdminDashboard;
