import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import * as studyApi from '../api/study';
import { useAuth } from '../contexts/AuthContext';
import * as authApi from '../api/auth';
import { extractErrorMessage } from '../utils/error';
import { SUPPORTED_LOCALES, type SupportedLocale } from '../assets/theme';

const LOCALE_LABELS: Record<SupportedLocale, string> = {
  en: 'English',
  fa: 'فارسی',
};

const Settings: React.FC = () => {
  const { user, updateUser, refreshUser } = useAuth();
  const { t } = useTranslation();
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(
    null
  );
  const [languageSaving, setLanguageSaving] = useState(false);
  const [dailyNewCardLimit, setDailyNewCardLimit] = useState<number>(20);
  const [sessionCap, setSessionCap] = useState<number>(50);
  const [phaseRegressionEnabled, setPhaseRegressionEnabled] = useState<boolean>(true);
  const [warnOffScheduleProgress, setWarnOffScheduleProgress] = useState<boolean>(true);
  const [studySettingsSaving, setStudySettingsSaving] = useState(false);

  React.useEffect(() => {
    studyApi
      .getStudySettings()
      .then((d) => {
        setDailyNewCardLimit(d.daily_new_card_limit);
        setSessionCap(d.session_cap);
        setPhaseRegressionEnabled(d.phase_regression_enabled);
        setWarnOffScheduleProgress(!d.skip_off_schedule_progress_prompt);
      })
      .catch(() => {});
  }, []);

  const currentLocale =
    user?.preferred_language && SUPPORTED_LOCALES.includes(user.preferred_language as SupportedLocale)
      ? (user.preferred_language as SupportedLocale)
      : 'en';

  const onLanguageChange = async (newLocale: SupportedLocale) => {
    setLanguageSaving(true);
    try {
      const updated = await authApi.updateProfile({ preferred_language: newLocale });
      updateUser(updated);
      await refreshUser();
      setToast({
        message: t('settings.languageSaved'),
        severity: 'success',
      });
    } catch (err) {
      setToast({
        message: extractErrorMessage(err, t('settings.languageSaveFailed')),
        severity: 'error',
      });
    } finally {
      setLanguageSaving(false);
    }
  };

  const onSaveStudySettings = async () => {
    setStudySettingsSaving(true);
    try {
      const d = await studyApi.updateStudySettings({
        daily_new_card_limit: dailyNewCardLimit,
        session_cap: sessionCap,
        phase_regression_enabled: phaseRegressionEnabled,
        skip_off_schedule_progress_prompt: !warnOffScheduleProgress,
      });
      setDailyNewCardLimit(d.daily_new_card_limit);
      setSessionCap(d.session_cap);
      setPhaseRegressionEnabled(d.phase_regression_enabled);
      setWarnOffScheduleProgress(!d.skip_off_schedule_progress_prompt);
      setToast({ message: t('settings.studySaved'), severity: 'success' });
    } catch (err) {
      setToast({
        message: extractErrorMessage(err, t('settings.studySaveFailed')),
        severity: 'error',
      });
    } finally {
      setStudySettingsSaving(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 680, mx: 'auto', py: 4, px: 2 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        {t('settings.heading')}
      </Typography>

      {/* ── Language ── */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            {t('settings.languageHeading')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('settings.languageDescription')}
          </Typography>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="settings-language-label">{t('settings.languageLabel')}</InputLabel>
            <Select
              labelId="settings-language-label"
              label={t('settings.languageLabel')}
              value={currentLocale}
              onChange={(e) => onLanguageChange(e.target.value as SupportedLocale)}
              disabled={languageSaving}
            >
              {SUPPORTED_LOCALES.map((code) => (
                <MenuItem key={code} value={code}>
                  {LOCALE_LABELS[code]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {/* ── Study Preferences ── */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            {t('settings.studyHeading')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('settings.studyDescription')}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                type="number"
                label={t('settings.dailyNewCards')}
                value={dailyNewCardLimit}
                onChange={(e) =>
                  setDailyNewCardLimit(Math.min(50, Math.max(5, Number(e.target.value) || 5)))
                }
                inputProps={{ min: 5, max: 50 }}
                size="small"
                sx={{ width: 140 }}
              />
              <TextField
                type="number"
                label={t('settings.maxDailyCards')}
                value={sessionCap}
                onChange={(e) =>
                  setSessionCap(Math.min(200, Math.max(20, Number(e.target.value) || 20)))
                }
                inputProps={{ min: 20, max: 200 }}
                size="small"
                sx={{ width: 160 }}
              />
              <Button
                variant="contained"
                onClick={onSaveStudySettings}
                disabled={
                  studySettingsSaving ||
                  dailyNewCardLimit < 5 ||
                  dailyNewCardLimit > 50 ||
                  sessionCap < 20 ||
                  sessionCap > 200
                }
              >
                {studySettingsSaving ? t('common.savingEllipsis') : t('common.save')}
              </Button>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={phaseRegressionEnabled}
                  onChange={(_, v) => setPhaseRegressionEnabled(v)}
                />
              }
              label={t('settings.phaseRegression')}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={warnOffScheduleProgress}
                  onChange={(_, v) => setWarnOffScheduleProgress(v)}
                />
              }
              label={t('settings.warnOffSchedule')}
            />
          </Box>
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

export default Settings;
