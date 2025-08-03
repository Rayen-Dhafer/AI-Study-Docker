import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'; // Import axios
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
} from '@mui/material';
import './ResetPassword.css';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    setErrorMsg('');

    try {
      const response = await axios.post('http://localhost:8080/api/users/reset-password', { email });
      if (response.status === 200) {
        setStatus('success');
      }
    } catch (error) {
      setStatus('error');
      setErrorMsg(
        error.response?.data || 'Erreur lors de l\'envoi de l\'email de réinitialisation.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="reset-container">
      <Container maxWidth="sm" className="reset-form-container">
        <Card className="reset-card">
          <CardContent>
            <Typography variant="h4" className="reset-title">
              Réinitialiser le mot de passe
            </Typography>
            <Typography variant="body1" className="reset-subtitle">
              Entrez votre email pour recevoir un lien de réinitialisation
            </Typography>

            {status === 'success' && (
              <Alert severity="success" className="success-alert">
                Le lien de réinitialisation a été envoyé à votre adresse email.
              </Alert>
            )}

            {status === 'error' && (
              <Alert severity="error" className="error-alert">
                {errorMsg}
              </Alert>
            )}

            {status !== 'success' && (
              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  autoComplete="off"
                  name="email"
                  label="Adresse email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  margin="normal"
                  required
                  className="reset-input"
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  className="submit-button"
                >
                  {loading ? 'Envoi...' : 'Envoyer le lien'}
                </Button>

                <Box className="back-to-login">
                  <Link to="/login" className="back-to-login-link">
                    Retour à la connexion
                  </Link>
                </Box>
              </form>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default ResetPassword;
