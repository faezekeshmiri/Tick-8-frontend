import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { Alert, Box, Button, Card, CircularProgress, Link, Typography } from '@mui/material';
import AuthLayout from '../layouts/AuthLayout';
import { verifyEmail } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided.');
      return;
    }
    verifyEmail(token)
      .then((msg) => {
        setMessage(msg);
        setStatus('success');
        refreshUser().catch(() => {});
      })
      .catch((err) => {
        const detail = err?.response?.data?.detail ?? 'This verification link is invalid or has expired.';
        setMessage(detail);
        setStatus('error');
      });
  }, [token]);

  return (
    <AuthLayout>
      <Card sx={{ width: '100%', maxWidth: '28rem', padding: '2rem', borderRadius: 3, boxShadow: 6 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Email Verification
          </Typography>

          {status === 'loading' && (
            <Box sx={{ mt: 3 }}>
              <CircularProgress />
              <Typography variant="body2" sx={{ mt: 2 }}>
                Verifying your email…
              </Typography>
            </Box>
          )}

          {status === 'success' && (
            <>
              <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
                {message}
              </Alert>
              <Button component={RouterLink} to="/" variant="contained">
                Go to Dashboard
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                {message}
              </Alert>
              <Typography variant="body2">
                <Link component={RouterLink} to="/login" sx={{ color: 'primary.main' }}>
                  Back to login
                </Link>
              </Typography>
            </>
          )}
        </Box>
      </Card>
    </AuthLayout>
  );
};

export default VerifyEmail;
