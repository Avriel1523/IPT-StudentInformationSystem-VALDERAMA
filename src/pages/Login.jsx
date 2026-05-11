import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Box, Typography, Paper, Container, Alert, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case "name":
        if (!value && !isLogin) {
          newErrors.name = "Name is required";
        } else if (value && !/^[a-zA-Z\s]+$/.test(value)) {
          newErrors.name = "Name must contain only alphabets";
        } else {
          delete newErrors.name;
        }
        break;
        
      case "email":
        if (!value) {
          newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = "Please enter a valid email";
        } else {
          delete newErrors.email;
        }
        break;
        
      case "password":
        if (!value) {
          newErrors.password = "Password is required";
        } else if (value.length < 6) {
          newErrors.password = "Password must be at least 6 characters";
        } else {
          delete newErrors.password;
        }
        break;
        
      case "confirmPassword":
        if (!value && !isLogin) {
          newErrors.confirmPassword = "Please confirm your password";
        } else if (value && value !== password) {
          newErrors.confirmPassword = "Passwords do not match";
        } else {
          delete newErrors.confirmPassword;
        }
        break;
        
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'email') {
      setEmail(value);
    } else if (name === 'password') {
      setPassword(value);
    } else if (name === 'name') {
      setName(value);
    } else if (name === 'confirmPassword') {
      setConfirmPassword(value);
    }
    
    // Validate the field
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLogin) {
      // Login validation
      if (!email || !password) {
        setMessage('Please fill in all required fields.');
        return;
      }
      
      // Validate email format
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setMessage('Please enter a valid email address.');
        return;
      }
      
      // Validate password length
      if (password.length < 6) {
        setMessage('Password must be at least 6 characters long.');
        return;
      }
    } else {
      // Registration validation
      if (!name || !email || !password || !confirmPassword) {
        setMessage('Please fill in all required fields.');
        return;
      }
      
      // Validate name
      if (!/^[a-zA-Z\s]+$/.test(name)) {
        setMessage('Name must contain only alphabets.');
        return;
      }
      
      // Validate email format
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setMessage('Please enter a valid email address.');
        return;
      }
      
      // Validate password length
      if (password.length < 6) {
        setMessage('Password must be at least 6 characters long.');
        return;
      }
      
      // Validate password match
      if (password !== confirmPassword) {
        setMessage('Passwords do not match.');
        return;
      }
    }
    
    setLoading(true);
    setMessage('');
    
    try {
      if (isLogin) {
        // Login request
        const response = await axios.post('http://localhost:5555/login', {
          email,
          password
        });
        
        if (response.data.success) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
          localStorage.setItem('token', response.data.token);
          
          setMessage('Login successful! Redirecting...');
          setTimeout(() => {
            navigate('/dashboard');
          }, 1500);
        } else {
          setMessage(response.data.message || 'Login failed. Please try again.');
        }
      } else {
        // Registration request
        const response = await axios.post('http://localhost:5555/register', {
          name,
          email,
          password
        });
        
        if (response.data.success) {
          setMessage('Registration successful! You can now login.');
          setIsLogin(true);
          setName('');
          setConfirmPassword('');
        } else {
          setMessage(response.data.message || 'Registration failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      if (error.response?.status === 401) {
        setMessage('Invalid email or password.');
      } else if (error.response?.status === 404) {
        setMessage('User not found. Please check your email.');
      } else if (error.response?.status === 400) {
        setMessage(error.response.data.message || 'Registration failed.');
      } else {
        setMessage('Error: ' + (error.response?.data || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setMessage('Password reset functionality coming soon!');
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            maxWidth: 400
          }}
        >
          <Typography component="h1" variant="h4" gutterBottom>
            {isLogin ? 'Sign In' : 'Create Account'}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Student Information System
          </Typography>

          {message && (
            <Alert 
              severity={message.includes('successful') ? 'success' : 'error'} 
              sx={{ width: '100%', mb: 2 }}
            >
              {message}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            {!isLogin && (
              <TextField
                margin="normal"
                required
                fullWidth
                id="name"
                label="Full Name"
                name="name"
                autoComplete="name"
                autoFocus
                value={name}
                onChange={handleInputChange}
                error={!!errors.name}
                helperText={errors.name}
                disabled={loading}
              />
            )}
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus={isLogin}
              value={email}
              onChange={handleInputChange}
              error={!!errors.email}
              helperText={errors.email}
              disabled={loading}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              value={password}
              onChange={handleInputChange}
              error={!!errors.password}
              helperText={errors.password}
              disabled={loading}
            />
            
            {!isLogin && (
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                id="confirmPassword"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={handleInputChange}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                disabled={loading}
              />
            )}
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading || Object.keys(errors).some(key => errors[key])}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </Button>
            
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button
                type="button"
                variant="text"
                size="small"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setMessage('');
                  setErrors({});
                  setName('');
                  setConfirmPassword('');
                }}
                disabled={loading}
              >
                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
              </Button>
            </Box>
            
            {isLogin && (
              <Box sx={{ textAlign: 'center', mt: 1 }}>
                <Button
                  type="button"
                  variant="text"
                  size="small"
                  onClick={handleForgotPassword}
                  disabled={loading}
                >
                  Forgot Password?
                </Button>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default Login;