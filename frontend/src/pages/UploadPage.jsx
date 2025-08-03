import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { UploadFile, CheckCircle, Delete } from "@mui/icons-material";
import {
  Snackbar,
  Alert,
  Card,
  CardContent,
  Typography,
  Radio,
  FormControlLabel,
  FormControl,
  RadioGroup,
  IconButton,
} from "@mui/material";

import "./UploadPage.css";

function Spinner({ color }) {
  return (
    <div className="upload-loader">
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <circle
          cx="24"
          cy="24"
          r="20"
          stroke={color}
          strokeWidth="6"
          strokeDasharray="100"
          strokeDashoffset="60"
          strokeLinecap="round"
          style={{ opacity: 0.2 }}
        />
        <circle
          cx="24"
          cy="24"
          r="20"
          stroke={color}
          strokeWidth="6"
          strokeDasharray="40"
          strokeDashoffset="20"
          strokeLinecap="round"
          style={{
            transformOrigin: "center",
            animation: "spin 1s linear infinite"
          }}
        />
        <style>{`
          @keyframes spin {
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </svg>
    </div>
  );
}

function UploadPage({ colors }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const [titles, setTitles] = useState([]);
  const [selectedTitle, setSelectedTitle] = useState(localStorage.getItem("selectedTitle") || "");

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastSeverity, setToastSeverity] = useState('success');

  const showToast = (msg, severity = 'success') => {
    setToastMsg(msg);
    setToastSeverity(severity);
    setToastOpen(true);
  };

  const handleToastClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setToastOpen(false);
  };

  const handleFileChange = (e) => {
    if (e.target.files.length === 0) return;
    const selectedFile = e.target.files[0];

    if (selectedFile.type !== "application/pdf") {
      setError("Veuillez sélectionner un fichier PDF valide.");
      showToast("Veuillez sélectionner un fichier PDF valide.", "error");
      return;
    }

    setFile(selectedFile);
    setError("");
  };

  const handleClearFile = () => {
    setFile(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openFileDialog = () => {
    if (!file) {
      fileInputRef.current?.click();
    }
  };

  const fetchTitles = async () => {
    try {
      const token = localStorage.getItem("token");
const res = await axios.post(
        "http://localhost:8080/api/documents/titles",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      if (Array.isArray(res.data)) {
        setTitles(res.data);
      }
    } catch (e) {
      console.error("Error fetching titles:", e);
    }
  };

  const handleDeleteTitle = async (titleToDelete) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:8080/api/documents/delete",
        {}, // empty body
        {
          params: {
            title: titleToDelete,  
          },
          headers: {
            Authorization: `Bearer ${token}`  
          }
        }
      );


      showToast("PDF supprimé avec succès !");
      setTitles((prev) => prev.filter((title) => title !== titleToDelete));

      if (selectedTitle === titleToDelete) {
        setSelectedTitle("");
        localStorage.removeItem("selectedTitle");
      }
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      showToast("Erreur lors de la suppression du PDF.", "error");
    }
  };

  useEffect(() => {
    fetchTitles();
  }, []);

  const handleUpload = async () => {
    if (!file) {
      setError("Veuillez sélectionner un fichier PDF.");
      showToast("Veuillez sélectionner un fichier PDF.", "error");
      return;
    }
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    const token = localStorage.getItem("token");

    try {
      const response = await axios.post(
        "http://localhost:8080/api/documents/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${token}`  
          }
        }
      );

      showToast("Votre fichier a été traité avec succès!", "success");

      const filename = file.name;
      if (!titles.includes(filename)) {
        setTitles((prev) => [...prev, filename]);
      }

    } catch (err) {
      setError("Erreur lors de l'upload ou de l'extraction du texte.");
      showToast("Erreur lors de l'upload ou de l'extraction du texte.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleTitleSelect = (e) => {
    const title = e.target.value;
    setSelectedTitle(title);
    localStorage.setItem("selectedTitle", title);
  };

  return (
    <div className="upload-container">
      <h2 className="upload-title">Uploader un PDF</h2>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="upload-input-hidden"
      />

      <div
        className={`upload-file-button ${file ? "file-selected" : ""}`}
        onClick={openFileDialog}
        aria-label="Choisir un fichier PDF"
      >
        {!file && (
          <>
            <UploadFile className="upload-icon" />
            <span>Choisir un fichier PDF</span>
          </>
        )}
        {file && (
          <>
            <CheckCircle className="upload-icon success" />
            <span className="upload-filename">{file.name}</span>
            <Delete
              className="upload-clear-icon"
              onClick={(e) => {
                e.stopPropagation();
                handleClearFile();
              }}
              title="Supprimer le fichier"
            />
          </>
        )}
      </div>

      <button
        onClick={handleUpload}
        className="upload-btn"
        disabled={loading || !file}
      >
        {loading ? "Lecture en cours..." : "Envoyer"}
      </button>

      {loading && <Spinner color={colors.primary} />}

      {error && <div className="upload-error">{error}</div>}

      <div style={{ marginTop: 30, width: "100%" }}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Sélectionnez le pdf :
            </Typography>
            <FormControl component="fieldset">
              <RadioGroup value={selectedTitle} onChange={handleTitleSelect}>
{titles.map((title, index) => (
  <div
    key={index}
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
    }}
  >
    <div style={{ flex: 1 }}>
      <FormControlLabel
        value={title}
        control={<Radio />}
        label={title}
      />
    </div>
    <IconButton
      onClick={() => handleDeleteTitle(title)}
      color="error"
      className="title-icon"
      title="Supprimer"
    >
      <Delete />
    </IconButton>
  </div>
))}

              </RadioGroup>
            </FormControl>
          </CardContent>
        </Card>
      </div>

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
    </div>
  );
}

export default UploadPage;
