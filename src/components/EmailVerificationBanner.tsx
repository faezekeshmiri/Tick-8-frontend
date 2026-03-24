import React, { useState } from 'react';
import { Alert, AlertTitle, Box, Button, Snackbar } from '@mui/material';
import { MarkEmailRead } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { resendVerification } from '../api/auth';

const EmailVerificationBanner: React.FC = () => {
  const { t } = useTranslation();
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
      setToast(err?.response?.data?.detail ?? t('emailBanner.resendFailed'));
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Alert
        severity="warning"
        icon={<MarkEmailRead />}
        sx={{ borderRadius: 0, px: 3, bgcolor: 'background.default' }}
        action={
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button
              size="small"
              variant="outlined"
              color="warning"
              onClick={handleResend}
              disabled={sending}
            >
              {sending ? t('common.sendingEllipsis') : t('emailBanner.resendEmail')}
            </Button>
            <Button size="small" color="warning" onClick={() => setDismissed(true)}>
              {t('emailBanner.dismiss')}
            </Button>
          </Box>
        }
      >
        <AlertTitle>{t('emailBanner.title')}</AlertTitle>
        {t('emailBanner.message')}
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
