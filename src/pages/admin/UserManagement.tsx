import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { Search, Visibility as VisibilityIcon } from '@mui/icons-material';
import * as adminApi from '../../api/admin';
import { AdminUserView } from '../../types/auth.types';
import { extractErrorMessage } from '../../utils/error';
import { useAuth } from '../../contexts/AuthContext';

const PAGE_SIZE = 20;

type RoleFilter = 'all' | 'user' | 'admin';
type StatusFilter = 'all' | 'active' | 'suspended';

const UserManagement: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUserView[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    userId: number;
    action: 'suspend' | 'reactivate' | 'make-admin' | 'remove-admin';
    name: string;
  } | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.listUsers({
        search: search || undefined,
        role: roleFilter === 'all' ? undefined : roleFilter,
        is_active: statusFilter === 'all' ? undefined : statusFilter === 'active',
        page,
        page_size: PAGE_SIZE,
      });
      setUsers(res.users);
      setTotal(res.total);
    } catch (err) {
      setToast({ message: extractErrorMessage(err, t('admin.loadUsersFailed')), severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, statusFilter, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleRoleChange = (e: { target: { value: unknown } }) => {
    setRoleFilter(e.target.value as RoleFilter);
    setPage(1);
  };

  const handleStatusChange = (e: { target: { value: unknown } }) => {
    setStatusFilter(e.target.value as StatusFilter);
    setPage(1);
  };

  const openConfirm = (
    userId: number,
    action: 'suspend' | 'reactivate' | 'make-admin' | 'remove-admin',
    name: string
  ) => setConfirmDialog({ open: true, userId, action, name });

  const handleConfirm = async () => {
    if (!confirmDialog) return;
    const { userId, action } = confirmDialog;
    setConfirmDialog(null);
    try {
      let updated: AdminUserView;
      if (action === 'suspend') updated = await adminApi.suspendUser(userId);
      else if (action === 'reactivate') updated = await adminApi.reactivateUser(userId);
      else if (action === 'make-admin') updated = await adminApi.makeAdmin(userId);
      else updated = await adminApi.removeAdmin(userId);

      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      setToast({ message: t('admin.actionSuccess'), severity: 'success' });
    } catch (err) {
      setToast({ message: extractErrorMessage(err, t('admin.actionFailed')), severity: 'error' });
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {t('admin.matchingFilters', { count: total })}
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3, alignItems: 'center' }}>
        <Box component="form" onSubmit={handleSearchSubmit} sx={{ minWidth: 240, maxWidth: 320 }}>
          <TextField
            fullWidth
            size="small"
            placeholder={t('admin.searchPlaceholder')}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>{t('admin.role')}</InputLabel>
          <Select
            value={roleFilter}
            label={t('admin.role')}
            onChange={handleRoleChange}
          >
            <MenuItem value="all">{t('admin.all')}</MenuItem>
            <MenuItem value="user">{t('admin.userRole')}</MenuItem>
            <MenuItem value="admin">{t('admin.adminRole')}</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>{t('admin.status')}</InputLabel>
          <Select
            value={statusFilter}
            label={t('admin.status')}
            onChange={handleStatusChange}
          >
            <MenuItem value="all">{t('admin.all')}</MenuItem>
            <MenuItem value="active">{t('admin.activeStatus')}</MenuItem>
            <MenuItem value="suspended">{t('admin.suspendedStatus')}</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('admin.name')}</TableCell>
                  <TableCell>{t('admin.email')}</TableCell>
                  <TableCell>{t('admin.role')}</TableCell>
                  <TableCell>{t('admin.status')}</TableCell>
                  <TableCell>{t('admin.verified')}</TableCell>
                  <TableCell>{t('admin.joined')}</TableCell>
                  <TableCell align="right">{t('admin.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((u) => (
                  <TableRow
                  key={u.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/admin/users/${u.id}`)}
                >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          src={u.avatar_url ?? undefined}
                          sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 13 }}
                        >
                          {u.display_name.slice(0, 2).toUpperCase()}
                        </Avatar>
                        <Typography variant="body2">{u.display_name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {u.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={u.role === 'admin' ? t('admin.adminRole') : t('admin.userRole')}
                        size="small"
                        color={u.role === 'admin' ? 'secondary' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={u.is_active ? t('admin.activeStatus') : t('admin.suspendedStatus')}
                        size="small"
                        color={u.is_active ? 'success' : 'error'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={u.is_email_verified ? t('admin.verified') : t('admin.unverified')}
                        size="small"
                        color={u.is_email_verified ? 'success' : 'warning'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(u.created_at).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<VisibilityIcon />}
                          onClick={() => navigate(`/admin/users/${u.id}`)}
                        >
                          {t('admin.viewDetails')}
                        </Button>
                        {u.role !== 'admin' ? (
                          <>
                            {u.is_active ? (
                              <Button
                                size="small"
                                color="error"
                                variant="outlined"
                                onClick={() => openConfirm(u.id, 'suspend', u.display_name)}
                              >
                                {t('admin.suspend')}
                              </Button>
                            ) : (
                              <Button
                                size="small"
                                color="success"
                                variant="outlined"
                                onClick={() => openConfirm(u.id, 'reactivate', u.display_name)}
                              >
                                {t('admin.reactivate')}
                              </Button>
                            )}
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => openConfirm(u.id, 'make-admin', u.display_name)}
                            >
                              {t('admin.makeAdmin')}
                            </Button>
                          </>
                        ) : (
                          currentUser?.id !== u.id && (
                            <Button
                              size="small"
                              color="secondary"
                              variant="outlined"
                              onClick={() => openConfirm(u.id, 'remove-admin', u.display_name)}
                            >
                              {t('admin.removeAdmin')}
                            </Button>
                          )
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, p) => setPage(p)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      {/* Confirm dialog */}
      <Dialog open={!!confirmDialog?.open} onClose={() => setConfirmDialog(null)}>
        <DialogTitle>{t('admin.confirmAction')}</DialogTitle>
        <DialogContent>
          {confirmDialog?.action === 'suspend' &&
            t('admin.suspendConfirm', { name: confirmDialog.name })}
          {confirmDialog?.action === 'reactivate' &&
            t('admin.reactivateConfirm', { name: confirmDialog.name })}
          {confirmDialog?.action === 'make-admin' &&
            t('admin.makeAdminConfirm', { name: confirmDialog.name })}
          {confirmDialog?.action === 'remove-admin' &&
            t('admin.removeAdminConfirm', { name: confirmDialog.name })}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(null)}>{t('common.cancel')}</Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            color={confirmDialog?.action === 'make-admin' || confirmDialog?.action === 'remove-admin' ? 'secondary' : 'primary'}
            autoFocus
          >
            {t('common.confirm')}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!toast}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={toast?.severity} onClose={() => setToast(null)}>
          {toast?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserManagement;
