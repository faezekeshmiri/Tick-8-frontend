import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  Link,
  TextField,
  Typography,
  useTheme,
  alpha,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import AuthLayout from '../layouts/AuthLayout';
import { forgotPassword } from '../api/auth';
import { extractErrorMessage } from '../utils/error';

const schema = z.object({
  email: z.string().email('Invalid email address'),
});
type FormData = z.infer<typeof schema>;

const ForgotPassword: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');

  const primary = theme.palette.primary.main;
  const isDark = theme.palette.mode === 'dark';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      setError('');
      const msg = await forgotPassword(data.email);
      setSuccessMsg(msg);
    } catch (err) {
      setError(extractErrorMessage(err, t('forgotPassword.genericError')));
    }
  };

  return (
    <AuthLayout>
      <Card
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: '28rem',
          p: { xs: 3, sm: 4 },
          borderRadius: 4,
          bgcolor: alpha(theme.palette.background.paper, isDark ? 0.55 : 0.75),
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(theme.palette.divider, isDark ? 0.12 : 0.08)}`,
          boxShadow: isDark
            ? '0 8px 32px rgba(0,0,0,0.25)'
            : '0 8px 32px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: 'text.primary',
              mb: 0.75,
            }}
          >
            {t('forgotPassword.heading')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('forgotPassword.description')}
          </Typography>
        </Box>

        {successMsg ? (
          <>
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMsg}
            </Alert>
            <Typography variant="body2" textAlign="center">
              <Link
                component={RouterLink}
                to="/login"
                sx={{ color: 'primary.main', fontWeight: 600 }}
              >
                {t('forgotPassword.backToLogin')}
              </Link>
            </Typography>
          </>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              fullWidth
              label={t('forgotPassword.email')}
              type="email"
              autoComplete="email"
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
              sx={{ mb: 2 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isSubmitting}
              sx={{
                py: 1.5,
                mb: 2,
                borderRadius: 2.5,
                fontWeight: 700,
                fontSize: '0.95rem',
                textTransform: 'none',
                boxShadow: `0 4px 14px ${alpha(primary, 0.35)}`,
                transition: 'all 0.25s ease',
                '&:hover': {
                  boxShadow: `0 6px 20px ${alpha(primary, 0.45)}`,
                  transform: 'translateY(-1px)',
                },
              }}
            >
              {isSubmitting ? t('common.sendingEllipsis') : t('forgotPassword.sendResetLink')}
            </Button>
            <Typography variant="body2" textAlign="center" color="text.secondary">
              <Link
                component={RouterLink}
                to="/login"
                sx={{ color: 'primary.main', fontWeight: 600 }}
              >
                {t('forgotPassword.backToLogin')}
              </Link>
            </Typography>
          </form>
        )}
      </Card>
    </AuthLayout>
  );
};

export default ForgotPassword;
