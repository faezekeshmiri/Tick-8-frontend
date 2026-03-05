import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
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

const passwordRules = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/\d/, 'Password must contain at least one number');

const signupSchema = z
  .object({
    display_name: z
      .string()
      .min(1, 'Display name is required')
      .max(100, 'Display name must be 100 characters or fewer'),
    email: z.string().email('Invalid email address'),
    password: passwordRules,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type SignupFormData = z.infer<typeof signupSchema>;

const Signup: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      setError('');
      await registerUser({
        display_name: data.display_name,
        email: data.email,
        password: data.password,
      });
      navigate('/');
    } catch (err) {
      setError(extractErrorMessage(err, t('signup.signupFailed')));
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
            {t('signup.createAccount')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('signup.subtitle')}
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
            label={t('signup.displayName')}
            autoComplete="name"
            {...register('display_name')}
            error={!!errors.display_name}
            helperText={errors.display_name?.message}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label={t('signup.email')}
            type="email"
            autoComplete="email"
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label={t('signup.password')}
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            {...register('password')}
            error={!!errors.password}
            helperText={
              errors.password?.message ||
              t('signup.passwordHint')
            }
            sx={{ mb: 2 }}
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

          <TextField
            fullWidth
            label={t('signup.confirmPassword')}
            type={showConfirm ? 'text' : 'password'}
            autoComplete="new-password"
            {...register('confirmPassword')}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
            sx={{ mb: 3 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirm((p) => !p)}
                    edge="end"
                    aria-label={showConfirm ? t('login.hidePassword') : t('login.showPassword')}
                  >
                    {showConfirm ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isSubmitting}
            sx={{ py: 1.5, mb: 2 }}
          >
            {isSubmitting ? t('common.creatingAccountEllipsis') : t('signup.signUpButton')}
          </Button>

          <Typography variant="body2" textAlign="center">
            {t('signup.haveAccount')}{' '}
            <Link component={RouterLink} to="/login" sx={{ color: 'primary.main' }}>
              {t('signup.logInLink')}
            </Link>
          </Typography>
        </form>
      </Card>
    </AuthLayout>
  );
};

export default Signup;
