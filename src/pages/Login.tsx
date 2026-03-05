import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  Checkbox,
  FormControlLabel,
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
import { useAuth } from '../contexts/AuthContext';
import { extractErrorMessage } from '../utils/error';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  remember_me: z.boolean(),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { remember_me: false },
  });

  const rememberMe = watch('remember_me');

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError('');
      await login({ email: data.email, password: data.password, remember_me: data.remember_me });
      navigate('/');
    } catch (err) {
      setError(extractErrorMessage(err, t('login.invalidCredentials')));
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
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            {t('login.welcomeBack')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('login.subtitle')}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <TextField
            fullWidth
            label={t('login.email')}
            type="email"
            autoComplete="email"
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label={t('login.password')}
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
            sx={{ mb: 1 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((p) => !p)}
                    edge="end"
                    aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2.5,
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setValue('remember_me', e.target.checked)}
                  size="small"
                />
              }
              label={<Typography variant="body2">{t('login.rememberMe')}</Typography>}
            />
            <Link
              component={RouterLink}
              to="/forgot-password"
              variant="body2"
              sx={{ color: 'primary.main' }}
            >
              {t('login.forgotPassword')}
            </Link>
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isSubmitting}
            sx={{ py: 1.5, mb: 2 }}
          >
            {isSubmitting ? t('common.loggingInEllipsis') : t('login.loginButton')}
          </Button>

          <Typography variant="body2" textAlign="center">
            {t('login.noAccount')}{' '}
            <Link component={RouterLink} to="/signup" sx={{ color: 'primary.main' }}>
              {t('login.signUpLink')}
            </Link>
          </Typography>
        </form>
      </Card>
    </AuthLayout>
  );
};

export default Login;
