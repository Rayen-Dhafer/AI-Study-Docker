import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Snackbar,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  ArrowRight,
} from '@mui/icons-material';
import './LoginPage.css';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Toast states
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastSeverity, setToastSeverity] = useState('error'); // 'success' | 'error' | 'info' | 'warning'

  const showToast = (msg, severity = 'error') => {
    setToastMsg(msg);
    setToastSeverity(severity);
    setToastOpen(true);
  };

  const handleToastClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setToastOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post(
        "http://localhost:8080/api/users/login",
        formData,
        {
          headers: { "Content-Type": "application/json" }
        }
      );

      localStorage.setItem('token', response.data);
      showToast("Connexion réussie!", "success");

      setTimeout(() => {
        navigate('/upload');
      }, 1000);

    } catch (error) {
      let message = "Erreur inconnue";
      if (error.response && error.response.data) {
        message = error.response.data;

        if (message.toLowerCase().includes("email")) {
          message = "Connexion incorrecte";
        } else if (message.toLowerCase().includes("password")) {
          message = "Connexion incorrecte";
        }
      } else if (error.message) {
        message = error.message;
      }

      setError(message);
    }
  };

  return (
    <Box className="login-container">
      <Container maxWidth="sm" className="login-form-container">
        <Card className="login-card">
          <CardContent>
            <Typography variant="h4" className="login-title">
              Bienvenue
            </Typography>
            <Typography variant="body1" className="login-subtitle">
              Connectez-vous à votre compte
            </Typography>

            {error && <Alert severity="error" className="error-alert">{error}</Alert>}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                name="email"
                autoComplete="off"
                label="Adresse Email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                margin="normal"
                required
                className="login-input"
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
                name="password"
                autoComplete="off"
                label="Mot de passe"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
                margin="normal"
                required
                className="login-input"
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

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                className="submit-button"
                endIcon={<ArrowRight />}
              >
                Se connecter
              </Button>

              <Box className="forgot-password">
                <Link to="/reset-password" className="forgot-password-link">
                  Mot de passe oublié ?
                </Link>
              </Box>

              <Divider className="divider">
                <Typography variant="body2">OU</Typography>
              </Divider>

              <Button
                component={Link}
                to="/register"
                fullWidth
                variant="outlined"
                size="large"
                className="register-button"
              >
                Créer un compte
              </Button>
            </form>
          </CardContent>
        </Card>
      </Container>

      {/* Toast Snackbar */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={3000}
        onClose={handleToastClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleToastClose} severity={toastSeverity} sx={{ width: '100%' }}>
          {toastMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Login;
