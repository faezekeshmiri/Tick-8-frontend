import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
      setToast({ message: extractErrorMessage(err, 'Failed to load users.'), severity: 'error' });
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
      setToast({ message: 'Action completed successfully.', severity: 'success' });
    } catch (err) {
      setToast({ message: extractErrorMessage(err, 'Action failed.'), severity: 'error' });
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {total} user{total !== 1 ? 's' : ''} matching filters
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3, alignItems: 'center' }}>
        <Box component="form" onSubmit={handleSearchSubmit} sx={{ minWidth: 240, maxWidth: 320 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by name or email…"
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
          <InputLabel>Role</InputLabel>
          <Select
            value={roleFilter}
            label="Role"
            onChange={handleRoleChange}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={handleStatusChange}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="suspended">Suspended</MenuItem>
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
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Verified</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell align="right">Actions</TableCell>
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
                        label={u.role === 'admin' ? 'Admin' : 'User'}
                        size="small"
                        color={u.role === 'admin' ? 'secondary' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={u.is_active ? 'Active' : 'Suspended'}
                        size="small"
                        color={u.is_active ? 'success' : 'error'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={u.is_email_verified ? 'Verified' : 'Unverified'}
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
                          View details
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
                                Suspend
                              </Button>
                            ) : (
                              <Button
                                size="small"
                                color="success"
                                variant="outlined"
                                onClick={() => openConfirm(u.id, 'reactivate', u.display_name)}
                              >
                                Reactivate
                              </Button>
                            )}
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => openConfirm(u.id, 'make-admin', u.display_name)}
                            >
                              Make Admin
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
                              Remove Admin
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
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          {confirmDialog?.action === 'suspend' &&
            `Suspend ${confirmDialog.name}? They will not be able to log in until reactivated.`}
          {confirmDialog?.action === 'reactivate' &&
            `Reactivate ${confirmDialog.name}? They will regain full access.`}
          {confirmDialog?.action === 'make-admin' &&
            `Promote ${confirmDialog.name} to Administrator? This grants full platform access.`}
          {confirmDialog?.action === 'remove-admin' &&
            `Remove administrator role from ${confirmDialog.name}? They will become a regular user.`}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(null)}>Cancel</Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            color={confirmDialog?.action === 'make-admin' || confirmDialog?.action === 'remove-admin' ? 'secondary' : 'primary'}
            autoFocus
          >
            Confirm
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
