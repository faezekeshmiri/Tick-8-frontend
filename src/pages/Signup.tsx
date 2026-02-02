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

const signupSchema = z
  .object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type SignupFormData = z.infer<typeof signupSchema>;

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
      await signup(data.username, data.email, data.password);
      navigate('/');
    } catch (err) {
      setError('Failed to create account. Please try again.');
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
            Create Account
          </Typography>
          <Typography
            variant="body2"
            className="text-center text-gray-600 dark:text-gray-400"
            color="text.secondary"
          >
            Sign up to get started
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
            label="Username"
            {...register('username')}
            error={!!errors.username}
            helperText={errors.username?.message}
            className="mb-4"
            sx={{ marginBottom: '1rem' }}
          />

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
            className="mb-4"
            sx={{ marginBottom: '1rem' }}
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

          <TextField
            fullWidth
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            {...register('confirmPassword')}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
            className="mb-6"
            sx={{ marginBottom: '1.5rem' }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
            className="mb-4 py-3"
            sx={{
              marginBottom: '1rem',
              padding: '0.75rem',
              backgroundColor: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
            }}
          >
            {isSubmitting ? 'Creating account...' : 'Sign Up'}
          </Button>

          <Typography
            variant="body2"
            className="text-center"
            sx={{ textAlign: 'center' }}
          >
            Already have an account?{' '}
            <Link
              component={RouterLink}
              to="/login"
              className="text-primary hover:underline"
              sx={{ color: 'primary.main' }}
            >
              Log in
            </Link>
          </Typography>
        </form>
      </Card>
    </AuthLayout>
  );
};

export default Signup;
