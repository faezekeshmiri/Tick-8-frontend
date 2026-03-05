import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
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
import AvatarUpload from '../components/AvatarUpload';

// ── Profile form ──────────────────────────────────────────────────────────────
const profileSchema = z.object({
  display_name: z.string().min(1, 'Display name is required').max(100),
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
  const { user, updateUser, refreshUser } = useAuth();
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
    },
  });

  const emailForm = useForm<EmailForm>({ resolver: zodResolver(emailSchema) });
  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  React.useEffect(() => {
    if (user) {
      profileForm.reset({
        display_name: user.display_name ?? '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only sync when user from server changes
  }, [user]);

  if (!user) return null;

  const onSaveProfile = async (data: ProfileForm) => {
    try {
      const updated = await authApi.updateProfile({
        display_name: data.display_name,
      });
      updateUser(updated);
      setEditingProfile(false);
      setToast({ message: 'Profile updated successfully.', severity: 'success' });
    } catch (err) {
      setToast({ message: extractErrorMessage(err, 'Failed to update profile.'), severity: 'error' });
    }
  };

  const onAvatarUploaded = async (url: string) => {
    try {
      const updated = await authApi.updateProfile({ avatar_url: url });
      updateUser(updated);
      setToast({ message: 'Profile picture updated.', severity: 'success' });
    } catch (err) {
      setToast({ message: extractErrorMessage(err, 'Failed to save profile picture.'), severity: 'error' });
    }
  };

  const onAvatarRemoved = async () => {
    try {
      const updated = await authApi.updateProfile({ avatar_url: '' });
      updateUser(updated);
      setToast({ message: 'Profile picture removed.', severity: 'success' });
    } catch (err) {
      setToast({ message: extractErrorMessage(err, 'Failed to remove profile picture.'), severity: 'error' });
      throw err;
    }
  };

  const onChangeEmail = async (data: EmailForm) => {
    try {
      const msg = await authApi.changeEmail({
        new_email: data.new_email,
        current_password: data.current_password,
      });
      emailForm.reset();
      await refreshUser();
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
        Profile
      </Typography>

      {/* ── Profile Card ── */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'center', sm: 'flex-start' },
              gap: 3,
              mb: 2,
            }}
          >
            <AvatarUpload
              currentUrl={user.avatar_url}
              initials={initials}
              onUploaded={onAvatarUploaded}
              onRemoved={onAvatarRemoved}
              onError={(msg) => setToast({ message: msg, severity: 'error' })}
            />

            <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  justifyContent: { xs: 'center', sm: 'flex-start' },
                }}
              >
                <Typography variant="h6">{user.display_name}</Typography>
                <Chip
                  label={user.role === 'admin' ? 'Admin' : 'User'}
                  size="small"
                  color={user.role === 'admin' ? 'secondary' : 'default'}
                />
                {!editingProfile && (
                  <IconButton onClick={() => setEditingProfile(true)} title="Edit profile" size="small">
                    <Edit fontSize="small" />
                  </IconButton>
                )}
              </Box>
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>

              {editingProfile && (
                <form onSubmit={profileForm.handleSubmit(onSaveProfile)} noValidate>
                  <TextField
                    fullWidth
                    label="Display Name"
                    {...profileForm.register('display_name')}
                    error={!!profileForm.formState.errors.display_name}
                    helperText={profileForm.formState.errors.display_name?.message}
                    sx={{ mt: 2, mb: 2 }}
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
            </Box>
          </Box>
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
