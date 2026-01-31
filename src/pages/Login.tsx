import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Card,
  TextField,
  Button,
  Typography,
  Box,
  IconButton,
  InputAdornment,
  Link,
  Alert,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AuthLayout from '../layouts/AuthLayout';
import { useAuth } from '../contexts/AuthContext';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError('');
      await login(data.email, data.password);
      navigate('/');
    } catch (err) {
      setError('Failed to log in. Please check your credentials.');
    }
  };

  return (
    <AuthLayout>
      <Card
        className="w-full max-w-md p-8 shadow-lg"
        sx={{
          width: '100%',
          maxWidth: '28rem',
          padding: '2rem',
        }}
      >
        <Box className="mb-6">
          <Typography
            variant="h4"
            component="h1"
            className="text-center font-bold mb-2"
            sx={{ fontWeight: 'bold', marginBottom: '0.5rem' }}
          >
            Welcome Back
          </Typography>
          <Typography
            variant="body2"
            className="text-center text-gray-600 dark:text-gray-400"
            color="text.secondary"
          >
            Log in to your account
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
            className="mb-4"
            sx={{ marginBottom: '1rem' }}
          />

          <TextField
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
            className="mb-6"
            sx={{ marginBottom: '1.5rem' }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={isSubmitting}
            className="mb-4 py-3"
            sx={{
              marginBottom: '1rem',
              padding: '0.75rem',
            }}
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </Button>

          <Typography
            variant="body2"
            className="text-center"
            sx={{ textAlign: 'center' }}
          >
            Don't have an account?{' '}
            <Link
              component={RouterLink}
              to="/signup"
              className="text-primary hover:underline"
              sx={{ color: 'primary.main' }}
            >
              Sign up
            </Link>
          </Typography>
        </form>
      </Card>
    </AuthLayout>
  );
};

export default Login;
