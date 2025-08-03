import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2';
import axios from "axios";

import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  Divider,
  Container,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Person,
  Phone,
  Lock,
  ArrowRight,
} from '@mui/icons-material';
import './RegisterPage.css';

const RegisterPage = () => {
  const navigate = useNavigate(); 
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

 
const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  if (formData.password !== formData.confirmPassword) {
    Swal.fire({
      position: "top-end",
      icon: "error",      // Use 'error' (not 'erreur') for Swal icon
      title: "Passwords do not match",
      showConfirmButton: false,
      backdrop: false,
      timer: 1500
    });
    return;
  }

  setLoading(true);
  

  try {
    const response = await axios.post(
      "http://localhost:8080/api/users/register",
      formData,
      {
        headers: { "Content-Type": "application/json" }
      }
    );

    const token = response.data;
    localStorage.setItem('token', token);

    Swal.fire({
      position: "top-end",
      icon: "success",
      title: "Registration successful!",
      showConfirmButton: false,
      backdrop: false,
      timer: 1500
    });

    
    navigate('/login'); 
  } catch (error) {
    Swal.fire({
      position: "top-end",
      icon: "error",
      title: error.response?.data || "Registration failed",
      showConfirmButton: false,
      backdrop: false,
      timer: 1500
    });
  } finally {
    setLoading(false);
  }
};


  return (
    <Box className="register-container">
      <Container maxWidth="sm" className="register-form-container">
        <Card className="register-card">
          <CardContent>
            <Typography variant="h4" className="register-title">
              Create Account
            </Typography>
            <Typography variant="body1" className="register-subtitle">
              Join us to get started
            </Typography>

            {error && <Alert severity="error" className="error-alert">{error}</Alert>}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                name="name"
                autoComplete="off"
                label="Full Name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                margin="normal"
                required
                className="register-input"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                name="email"
                autoComplete="off"
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                margin="normal"
                required
                className="register-input"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                name="phone"
                autoComplete="off"
                label="Phone Number"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                margin="normal"
                className="register-input"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                name="password"
                autoComplete="off"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
                margin="normal"
                required
                className="register-input"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
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
                name="confirmPassword"
                autoComplete="off"
                label="Confirm Password"
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleInputChange}
                margin="normal"
                required
                className="register-input"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                className="submit-button"
                endIcon={<ArrowRight />}
              >
                {loading ? 'Creating Account...' : 'Register'}
              </Button>

              <Divider className="divider">
                <br></br>
                <Typography variant="body2"><b>ALREADY HAVE AN ACCOUNT?</b></Typography>
                <br></br>
              </Divider>

              <Button
                component={Link}
                to="/"
                fullWidth
                variant="outlined"
                size="large"
                className="login-button"
              >
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default RegisterPage;