import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Alert, Box, Button, Card, Link, TextField, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AuthLayout from '../layouts/AuthLayout';
import { forgotPassword } from '../api/auth';
import { extractErrorMessage } from '../utils/error';

const schema = z.object({
  email: z.string().email('Invalid email address'),
});
type FormData = z.infer<typeof schema>;

const ForgotPassword: React.FC = () => {
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
      setError(extractErrorMessage(err, 'Something went wrong. Please try again.'));
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
            Forgot Password
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Enter your email and we'll send you a reset link.
          </Typography>
        </Box>

        {successMsg ? (
          <>
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMsg}
            </Alert>
            <Typography variant="body2" textAlign="center">
              <Link component={RouterLink} to="/login" sx={{ color: 'primary.main' }}>
                Back to login
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
              label="Email"
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
              {isSubmitting ? 'Sending…' : 'Send Reset Link'}
            </Button>
            <Typography variant="body2" textAlign="center">
              <Link component={RouterLink} to="/login" sx={{ color: 'primary.main' }}>
                Back to login
              </Link>
            </Typography>
          </form>
        )}
      </Card>
    </AuthLayout>
  );
};

export default ForgotPassword;
