import React from 'react';
import { Box, Breadcrumbs, Link, Paper, Tab, Tabs, Typography } from '@mui/material';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import ShieldIcon from '@mui/icons-material/Shield';

const adminNav = [
  { label: 'Dashboard', path: '/admin', end: true, icon: <DashboardIcon /> },
  { label: 'User Management', path: '/admin/users', end: false, icon: <ManageAccountsIcon /> },
];

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const pathSegments = location.pathname.replace(/^\/admin\/?/, '').split('/').filter(Boolean);
  const breadcrumbLabels: Record<string, string> = {
    '': 'Dashboard',
    users: 'User Management',
    content: 'Manage content',
  };
  const isUserIdSegment = (seg: string) => /^\d+$/.test(seg);

  const currentTab = location.pathname === '/admin' ? 0 : location.pathname.startsWith('/admin/users') ? 1 : 0;

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <ShieldIcon color="secondary" sx={{ fontSize: 32 }} />
        <Typography variant="h4" fontWeight="bold">
          Admin Panel
        </Typography>
      </Box>

      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link component={NavLink} to="/admin" color="inherit" underline="hover">
          Admin
        </Link>
        {pathSegments.map((seg, i) => (
          <Typography key={seg} color="text.primary" variant="body2">
            {breadcrumbLabels[seg] ?? (isUserIdSegment(seg) ? 'User details' : seg)}
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
  );
};

export default AdminLayout;
