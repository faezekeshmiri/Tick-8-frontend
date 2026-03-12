import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  Link,
  Typography,
  useTheme,
  alpha,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import AuthLayout from '../layouts/AuthLayout';
import { verifyEmail } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const { refreshUser } = useAuth();
  const { t } = useTranslation();
  const theme = useTheme();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  const isDark = theme.palette.mode === 'dark';

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage(t('verifyEmail.noToken'));
      return;
    }
    verifyEmail(token)
      .then((msg) => {
        setMessage(msg);
        setStatus('success');
        refreshUser().catch(() => {});
      })
      .catch((err) => {
        const detail = err?.response?.data?.detail ?? t('verifyEmail.invalidToken');
        setMessage(detail);
        setStatus('error');
      });
  }, [token]);

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
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: 'text.primary',
              mb: 1,
            }}
          >
            {t('verifyEmail.heading')}
          </Typography>

          {status === 'loading' && (
            <Box sx={{ mt: 3 }}>
              <CircularProgress />
              <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                {t('verifyEmail.verifying')}
              </Typography>
            </Box>
          )}

          {status === 'success' && (
            <>
              <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
                {message}
              </Alert>
              <Button component={RouterLink} to="/" variant="contained">
                {t('verifyEmail.goToDashboard')}
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                {message}
              </Alert>
              <Typography variant="body2">
                <Link
                  component={RouterLink}
                  to="/login"
                  sx={{ color: 'primary.main', fontWeight: 600 }}
                >
                  {t('verifyEmail.backToLogin')}
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
