import React, { useState } from 'react';
import { Alert, AlertTitle, Box, Button, Snackbar } from '@mui/material';
import { MarkEmailRead } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { resendVerification } from '../api/auth';

const EmailVerificationBanner: React.FC = () => {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState('');

  if (!user || user.is_email_verified || dismissed) return null;

  const handleResend = async () => {
    setSending(true);
    try {
      const msg = await resendVerification();
      setToast(msg);
    } catch (err: any) {
      setToast(err?.response?.data?.detail ?? 'Failed to resend. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Alert
        severity="warning"
        icon={<MarkEmailRead />}
        sx={{ borderRadius: 0, px: 3 }}
        action={
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button
              size="small"
              variant="outlined"
              color="warning"
              onClick={handleResend}
              disabled={sending}
            >
              {sending ? 'Sending…' : 'Resend email'}
            </Button>
            <Button size="small" color="warning" onClick={() => setDismissed(true)}>
              Dismiss
            </Button>
          </Box>
        }
      >
        <AlertTitle>Verify your email address</AlertTitle>
        Please check your inbox and click the verification link. Some features require a verified
        email.
      </Alert>

      <Snackbar
        open={!!toast}
        autoHideDuration={5000}
        onClose={() => setToast('')}
        message={toast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  );
};

export default EmailVerificationBanner;
