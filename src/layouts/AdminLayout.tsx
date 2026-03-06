import React from 'react';
import { Box, Breadcrumbs, Link, Paper, Tab, Tabs, Typography } from '@mui/material';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import ShieldIcon from '@mui/icons-material/ShieldOutlined';
import { useTranslation } from 'react-i18next';

const AdminLayout: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const pathSegments = location.pathname.replace(/^\/admin\/?/, '').split('/').filter(Boolean);

  const adminNav = [
    { label: t('admin.dashboard'), path: '/admin', end: true, icon: <DashboardIcon /> },
    { label: t('admin.userManagement'), path: '/admin/users', end: false, icon: <ManageAccountsIcon /> },
  ];

  const breadcrumbLabels: Record<string, string> = {
    '': t('admin.dashboard'),
    users: t('admin.userManagement'),
    content: t('admin.manageContent'),
  };
  const isUserIdSegment = (seg: string) => /^\d+$/.test(seg);

  const currentTab = location.pathname === '/admin' ? 0 : location.pathname.startsWith('/admin/users') ? 1 : 0;

  return (
    <Box className="w-full">
      <Box className="mx-auto w-full px-4 pb-20 pt-6 sm:px-6 lg:px-8">

      {/* ── Header ── */}
      <Box className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Box>
          <Box className="flex items-center gap-2">
            <ShieldIcon />
            <Typography variant="h4" className="font-bold">
              {t('admin.panelTitle')}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link component={NavLink} to="/admin" color="inherit" underline="hover">
          {t('admin.breadcrumbAdmin')}
        </Link>
        {pathSegments.map((seg, i) => (
          <Typography key={seg} color="text.primary" variant="body2">
            {breadcrumbLabels[seg] ?? (isUserIdSegment(seg) ? t('admin.userDetails') : seg)}
          </Typography>
        ))}
      </Breadcrumbs>

      <Paper variant="outlined" sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider', minHeight: 48 }}
        >
          {adminNav.map((item, idx) => (
            <Tab
              key={item.path}
              component={NavLink}
              to={item.path}
              end={item.end}
              label={item.label}
              icon={item.icon}
              iconPosition="start"
              sx={{ textTransform: 'none', fontWeight: 600 }}
            />
          ))}
        </Tabs>
      </Paper>

      <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;
