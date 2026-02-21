import React, { useCallback, useEffect, useState } from 'react';
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
  InputAdornment,
  Pagination,
  Paper,
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
import { Search } from '@mui/icons-material';
import * as adminApi from '../../api/admin';
import { AdminUserView } from '../../types/auth.types';
import { extractErrorMessage } from '../../utils/error';

const PAGE_SIZE = 20;

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<AdminUserView[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    userId: number;
    action: 'suspend' | 'reactivate' | 'make-admin';
    name: string;
  } | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.listUsers({ search: search || undefined, page, page_size: PAGE_SIZE });
      setUsers(res.users);
      setTotal(res.total);
    } catch (err) {
      setToast({ message: extractErrorMessage(err, 'Failed to load users.'), severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const openConfirm = (
    userId: number,
    action: 'suspend' | 'reactivate' | 'make-admin',
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
      else updated = await adminApi.makeAdmin(userId);

      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      setToast({ message: 'Action completed successfully.', severity: 'success' });
    } catch (err) {
      setToast({ message: extractErrorMessage(err, 'Action failed.'), severity: 'error' });
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        User Management
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {total} registered user{total !== 1 ? 's' : ''}
      </Typography>

      {/* Search */}
      <Box component="form" onSubmit={handleSearchSubmit} sx={{ mb: 3, maxWidth: 400 }}>
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
                  <TableRow key={u.id} hover>
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
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                        {u.role !== 'admin' && (
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(null)}>Cancel</Button>
          <Button onClick={handleConfirm} variant="contained" color="primary" autoFocus>
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
