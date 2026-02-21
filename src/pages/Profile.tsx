import React, { useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import { Edit, Visibility, VisibilityOff } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';
import * as authApi from '../api/auth';
import { extractErrorMessage } from '../utils/error';

// ── Profile form ──────────────────────────────────────────────────────────────
const profileSchema = z.object({
  display_name: z.string().min(1, 'Display name is required').max(100),
  avatar_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});
type ProfileForm = z.infer<typeof profileSchema>;

// ── Change email form ──────────────────────────────────────────────────────────
const emailSchema = z.object({
  new_email: z.string().email('Invalid email address'),
  current_password: z.string().min(1, 'Current password is required'),
});
type EmailForm = z.infer<typeof emailSchema>;

// ── Change password form ──────────────────────────────────────────────────────
const passwordSchema = z
  .object({
    current_password: z.string().min(1, 'Current password is required'),
    new_password: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/\d/, 'Must contain a number'),
    confirm_password: z.string(),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  });
type PasswordForm = z.infer<typeof passwordSchema>;

// ── Component ─────────────────────────────────────────────────────────────────
const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(
    null
  );
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      display_name: user?.display_name ?? '',
      avatar_url: user?.avatar_url ?? '',
    },
  });

  const emailForm = useForm<EmailForm>({ resolver: zodResolver(emailSchema) });
  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  if (!user) return null;

  const onSaveProfile = async (data: ProfileForm) => {
    try {
      const updated = await authApi.updateProfile({
        display_name: data.display_name,
        avatar_url: data.avatar_url || undefined,
      });
      updateUser(updated);
      setEditingProfile(false);
      setToast({ message: 'Profile updated successfully.', severity: 'success' });
    } catch (err) {
      setToast({ message: extractErrorMessage(err, 'Failed to update profile.'), severity: 'error' });
    }
  };

  const onChangeEmail = async (data: EmailForm) => {
    try {
      const msg = await authApi.changeEmail({
        new_email: data.new_email,
        current_password: data.current_password,
      });
      emailForm.reset();
      setToast({ message: msg, severity: 'success' });
    } catch (err) {
      setToast({ message: extractErrorMessage(err, 'Failed to update email.'), severity: 'error' });
    }
  };

  const onChangePassword = async (data: PasswordForm) => {
    try {
      const msg = await authApi.changePassword({
        current_password: data.current_password,
        new_password: data.new_password,
      });
      passwordForm.reset();
      setToast({ message: msg, severity: 'success' });
    } catch (err) {
      setToast({
        message: extractErrorMessage(err, 'Failed to change password.'),
        severity: 'error',
      });
    }
  };

  const initials = user.display_name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Box sx={{ maxWidth: 680, mx: 'auto', py: 4, px: 2 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Account Settings
      </Typography>

      {/* ── Profile Card ── */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar
              src={user.avatar_url ?? undefined}
              sx={{ width: 64, height: 64, fontSize: 24, bgcolor: 'primary.main' }}
            >
              {initials}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6">{user.display_name}</Typography>
                <Chip
                  label={user.role === 'admin' ? 'Admin' : 'User'}
                  size="small"
                  color={user.role === 'admin' ? 'secondary' : 'default'}
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
            {!editingProfile && (
              <IconButton onClick={() => setEditingProfile(true)} title="Edit profile">
                <Edit />
              </IconButton>
            )}
          </Box>

          {editingProfile && (
            <form onSubmit={profileForm.handleSubmit(onSaveProfile)} noValidate>
              <TextField
                fullWidth
                label="Display Name"
                {...profileForm.register('display_name')}
                error={!!profileForm.formState.errors.display_name}
                helperText={profileForm.formState.errors.display_name?.message}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Avatar URL"
                placeholder="https://example.com/avatar.jpg"
                {...profileForm.register('avatar_url')}
                error={!!profileForm.formState.errors.avatar_url}
                helperText={profileForm.formState.errors.avatar_url?.message}
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={profileForm.formState.isSubmitting}
                >
                  Save
                </Button>
                <Button variant="outlined" onClick={() => setEditingProfile(false)}>
                  Cancel
                </Button>
              </Box>
            </form>
          )}
        </CardContent>
      </Card>

      {/* ── Change Email ── */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Change Email Address
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Your current email: <strong>{user.email}</strong>
            {user.pending_email && (
              <> · Pending confirmation: <strong>{user.pending_email}</strong></>
            )}
          </Typography>
          <form onSubmit={emailForm.handleSubmit(onChangeEmail)} noValidate>
            <TextField
              fullWidth
              label="New Email Address"
              type="email"
              autoComplete="email"
              {...emailForm.register('new_email')}
              error={!!emailForm.formState.errors.new_email}
              helperText={emailForm.formState.errors.new_email?.message}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Current Password (to confirm)"
              type="password"
              autoComplete="current-password"
              {...emailForm.register('current_password')}
              error={!!emailForm.formState.errors.current_password}
              helperText={emailForm.formState.errors.current_password?.message}
              sx={{ mb: 2 }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={emailForm.formState.isSubmitting}
            >
              {emailForm.formState.isSubmitting ? 'Sending…' : 'Send Verification Link'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ── Change Password ── */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Change Password
          </Typography>
          <form onSubmit={passwordForm.handleSubmit(onChangePassword)} noValidate>
            <TextField
              fullWidth
              label="Current Password"
              type={showCurrentPw ? 'text' : 'password'}
              autoComplete="current-password"
              {...passwordForm.register('current_password')}
              error={!!passwordForm.formState.errors.current_password}
              helperText={passwordForm.formState.errors.current_password?.message}
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowCurrentPw((p) => !p)} edge="end">
                      {showCurrentPw ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="New Password"
              type={showNewPw ? 'text' : 'password'}
              autoComplete="new-password"
              {...passwordForm.register('new_password')}
              error={!!passwordForm.formState.errors.new_password}
              helperText={
                passwordForm.formState.errors.new_password?.message ||
                'At least 8 characters, one uppercase letter, one number'
              }
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowNewPw((p) => !p)} edge="end">
                      {showNewPw ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              type={showConfirmPw ? 'text' : 'password'}
              autoComplete="new-password"
              {...passwordForm.register('confirm_password')}
              error={!!passwordForm.formState.errors.confirm_password}
              helperText={passwordForm.formState.errors.confirm_password?.message}
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirmPw((p) => !p)} edge="end">
                      {showConfirmPw ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={passwordForm.formState.isSubmitting}
            >
              {passwordForm.formState.isSubmitting ? 'Updating…' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Snackbar
        open={!!toast}
        autoHideDuration={5000}
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

export default Profile;
