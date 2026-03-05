import React, { useState } from 'react';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  IconButton,
  InputAdornment,
  Link,
  TextField,
  Typography,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import AuthLayout from '../layouts/AuthLayout';
import { resetPassword } from '../api/auth';
import { extractErrorMessage } from '../utils/error';

const schema = z
  .object({
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
type FormData = z.infer<typeof schema>;

const ResetPassword: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    if (!token) {
      setError(t('resetPassword.invalidToken'));
      return;
    }
    try {
      setError('');
      await resetPassword(token, data.new_password);
      navigate('/login', {
        state: { message: t('resetPassword.resetSuccess') },
      });
    } catch (err) {
      setError(extractErrorMessage(err, t('resetPassword.resetFailed')));
    }
  };

  return (
    <AuthLayout>
      <Card
        sx={{
          width: '100%',
          maxWidth: '28rem',
          padding: '2rem',
          borderRadius: 3,
          boxShadow: 6,
        }}
      >
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {t('resetPassword.heading')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('resetPassword.description')}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!token ? (
          <Alert severity="error">
            {t('resetPassword.invalidLink')}{' '}
            <Link component={RouterLink} to="/forgot-password">
              {t('resetPassword.requestNew')}
            </Link>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <TextField
              fullWidth
              label={t('resetPassword.newPassword')}
              type={showNew ? 'text' : 'password'}
              autoComplete="new-password"
              {...register('new_password')}
              error={!!errors.new_password}
              helperText={
                errors.new_password?.message ||
                t('resetPassword.passwordHint')
              }
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowNew((p) => !p)} edge="end">
                      {showNew ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label={t('resetPassword.confirmNewPassword')}
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              {...register('confirm_password')}
              error={!!errors.confirm_password}
              helperText={errors.confirm_password?.message}
              sx={{ mb: 3 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirm((p) => !p)} edge="end">
                      {showConfirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isSubmitting}
              sx={{ py: 1.5 }}
            >
              {isSubmitting ? t('common.resettingEllipsis') : t('resetPassword.resetButton')}
            </Button>
          </form>
        )}
      </Card>
    </AuthLayout>
  );
};

export default ResetPassword;
