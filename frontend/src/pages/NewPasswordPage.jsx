import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { InputAdornment, IconButton } from '@mui/material';
import axios from "axios";

import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  Snackbar,
  Alert,
} from '@mui/material';
import './NewPasswordPage.css';

const NewPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // Toast
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastSeverity, setToastSeverity] = useState('error');

  const showToast = (msg, severity = 'error') => {
    setToastMsg(msg);
    setToastSeverity(severity);
    setToastOpen(true);
  };

  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setToken(urlToken);
    } else {
      showToast("Jeton manquant ou invalide.");
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      showToast("Veuillez remplir tous les champs.");
      return;
    }

    if (password !== confirmPassword) {
      showToast("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    try {
  const response = await axios.post(
    'http://localhost:8080/api/users/edit-password',
    { password },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = response.data;

  if (data.token) {
    localStorage.setItem('token', data.token);
    showToast('Mot de passe mis à jour avec succès.', 'success');
    setTimeout(() => navigate('/upload'), 1500);
  } else {
    showToast(data.message || 'Échec de la mise à jour du mot de passe.');
  }
} catch (err) {
  showToast(
    err.response?.data?.message || 'Erreur serveur. Veuillez réessayer.',
    'error'
  );
}






  };

  return (
    <Box className="new-password-container">
      <Container maxWidth="sm" className="new-password-form-container">
        <Card className="new-password-card">
          <CardContent>
            <Typography variant="h4" className="new-password-title">
              Nouveau mot de passe
            </Typography>
            <Typography variant="body1" className="new-password-subtitle">
              Entrez et confirmez votre nouveau mot de passe
            </Typography>

            <form onSubmit={handleSubmit}>
<TextField
  fullWidth
  type={showPassword ? 'text' : 'password'}
  label="Nouveau mot de passe"
  value={password}
  autoComplete="off"
  onChange={(e) => setPassword(e.target.value)}
  margin="normal"
  required
  className="new-password-input"
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
  type={showConfirmPassword ? 'text' : 'password'}
  label="Confirmer le mot de passe"
  value={confirmPassword}
  autoComplete="off"
  onChange={(e) => setConfirmPassword(e.target.value)}
  margin="normal"
  required
  className="new-password-input"
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
                size="large"
                disabled={loading}
                className="submit-button"
              >
                {loading ? "Enregistrement..." : "Enregistrer le mot de passe"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Container>

      <Snackbar
        open={toastOpen}
        autoHideDuration={3000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setToastOpen(false)} severity={toastSeverity} sx={{ width: '100%' }}>
          {toastMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NewPasswordPage;
