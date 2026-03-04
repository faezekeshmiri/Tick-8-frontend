import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  FormControlLabel,
  Snackbar,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import * as studyApi from '../api/study';
import { extractErrorMessage } from '../utils/error';

const Settings: React.FC = () => {
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(
    null
  );
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
      setToast({ message: 'Study preferences saved.', severity: 'success' });
    } catch (err) {
      setToast({
        message: extractErrorMessage(err, 'Failed to save study preferences.'),
        severity: 'error',
      });
    } finally {
      setStudySettingsSaving(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 680, mx: 'auto', py: 4, px: 2 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Settings
      </Typography>

      {/* ── Study Preferences ── */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Study Preferences
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Daily new cards: how many new cards to introduce per day (5–50). Maximum daily cards: session cap (20–200).
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                type="number"
                label="Daily new cards"
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
                label="Maximum daily cards"
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
                {studySettingsSaving ? 'Saving…' : 'Save'}
              </Button>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={phaseRegressionEnabled}
                  onChange={(_, v) => setPhaseRegressionEnabled(v)}
                />
              }
              label="Offer Phase 1 revisit after 3 consecutive forgets (Phase 2)"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={warnOffScheduleProgress}
                  onChange={(_, v) => setWarnOffScheduleProgress(v)}
                />
              }
              label="Warn when recording progress on cards not due today (in subcategories)"
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
