import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Alert, Box, Button, Card, Link, TextField, Typography } from '@mui/material';
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
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');

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
              <Link component={RouterLink} to="/login" sx={{ color: 'primary.main' }}>
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
              sx={{ py: 1.5, mb: 2 }}
            >
              {isSubmitting ? t('common.sendingEllipsis') : t('forgotPassword.sendResetLink')}
            </Button>
            <Typography variant="body2" textAlign="center">
              <Link component={RouterLink} to="/login" sx={{ color: 'primary.main' }}>
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
