import React, { useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable"; // optional for tables if needed
import { Print, PictureAsPdf } from '@mui/icons-material';


import {
  Alert,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Checkbox,
} from "@mui/material";

import "./ExercisesPage.css";

function Loader({ color }) {
  return (
    <div className="ex-loader">
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <circle
          cx="18"
          cy="18"
          r="15"
          stroke={color}
          strokeWidth="5"
          strokeDasharray="80"
          strokeDashoffset="50"
          strokeLinecap="round"
          style={{ opacity: 0.2 }}
        />
        <circle
          cx="18"
          cy="18"
          r="15"
          stroke={color}
          strokeWidth="5"
          strokeDasharray="30"
          strokeDashoffset="10"
          strokeLinecap="round"
          style={{
            transformOrigin: "center",
            animation: "spin 1s linear infinite",
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

function ExercisesPage({ colors }) {
  const token = localStorage.getItem("token") || "";
  const selectedTitle = localStorage.getItem("selectedTitle") || "";

  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [anim, setAnim] = useState(false);
  const [part, setPart] = useState("");
  const [allPdf, setAllPdf] = useState(false);
  const [exerciseType, setExerciseType] = useState("qcm");
  const [numQuestions, setNumQuestions] = useState(1);
  const [error, setError] = useState("");
  const [questions, setQuestions] = useState([]);
  const [validated, setValidated] = useState({});

  const parseQuestions = (text) => {
    const regex = /Q\d+\)([\s\S]*?)(?=Q\d+\)|$)/g;
    const matches = [...text.matchAll(regex)];
    return matches.map((match) => {
      const block = match[1].trim();
      let [questionPart, answerPart] = block.split(/\n(?:correcte réponse:|Réponse:)/i);
      if (!answerPart) {
        const lastNewline = block.lastIndexOf("\n");
        if (lastNewline !== -1) {
          questionPart = block.substring(0, lastNewline).trim();
          answerPart = block.substring(lastNewline + 1).trim();
        } else {
          answerPart = "";
        }
      }
      return {
        question: questionPart.trim(),
        answer: answerPart.trim(),
      };
    });
  };

  const handleGenerate = async () => {
    setError("");
    setShow(false);
    setQuestions([]);
    setValidated({});
    if (!allPdf && part.trim() === "") {
      setError("Veuillez sélectionner une partie spécifique ou cocher 'Génération sur tout le PDF'.");
      return;
    }
    if (numQuestions < 1 || numQuestions > 10) {
      setError("Le nombre de questions doit être entre 1 et 10.");
      return;
    }
    setLoading(true);
    setAnim(false);
    try {
      const formData = new URLSearchParams();
      formData.append("title", selectedTitle);
      formData.append("allPdf", allPdf);
      formData.append("partie", allPdf ? " " : part);
      formData.append("type", exerciseType);
      formData.append("number", numQuestions);

      const response = await axios.post(
        "http://localhost:8080/api/documents/generer",
        formData,
      {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
      );
 
      if(response.data == "Type de génération non reconnu."){
      setError("Aucune information trouvée dans le PDF");
      return;
      }
      else {
      const parsedQuestions = parseQuestions(response.data);
      setQuestions(parsedQuestions);
      setShow(true);
      setTimeout(() => setAnim(true), 100);
      }

    } catch (err) {
      setError(err.message || "Erreur lors de la génération des exercices.");
    } finally {
      setLoading(false);
    }
  };

  const toggleAnswer = (index) => {
    setValidated((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    let y = 20;

    doc.text("Exercice généré", 10, y);
    y += 10;

    if (selectedTitle) {
      doc.setFontSize(12);
      doc.text(` ${selectedTitle}`, 10, y);
      y += 8;
    }

    if (!allPdf && part.trim() !== "") {
      doc.text(`Partie: ${part}`, 10, y);
      y += 10;
    }

    questions.forEach((q, i) => {
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      const qText = `Q${i + 1}) ${q.question}`;
      const questionLines = doc.splitTextToSize(qText, 180);
      doc.text(questionLines, 10, y);
      y += questionLines.length * 6;


      doc.setTextColor(0, 128, 0); // green
      const answerText =
        q.answer.length > 1
          ? `Réponse :\n${q.answer}`
          : `Correcte réponse : ${q.answer.toUpperCase()}`;
      const answerLines = doc.splitTextToSize(answerText, 180);
      doc.text(answerLines, 10, y);
      y += answerLines.length * 7 + 5;

      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save("exercices.pdf");
  };

  return (
    <div className="ex-container">
      <h2 className="ex-title">
        Générer des exercices
        <br />
        <small style={{ fontWeight: "normal", fontSize: 20, color: "#666" }}>
          {selectedTitle || "Aucun PDF sélectionné"}
        </small>
      </h2>

      <div className="ex-option-block">
        <label className="ex-input-label">Génération sur une partie spécifique</label>
        <div className="ex-input-row">
          <input
            type="text"
            autoComplete="off"
            value={allPdf ? "" : part}
            onChange={(e) => setPart(e.target.value)}
            disabled={allPdf}
            placeholder="Ex: chapitre 1, introduction..."
            className="ex-input"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={allPdf}
                onChange={(e) => setAllPdf(e.target.checked)}
                sx={{ color: "#3b82f6", "&.Mui-checked": { color: "#3b82f6" } }}
              />
            }
            label="Génération sur tout le PDF"
          />
        </div>

        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <label
            htmlFor="numQuestions"
            className="ex-input-label"
            style={{ marginBottom: 0, whiteSpace: "nowrap" }}
          >
            Nombre de questions (min 1 max 10)
            <input
              id="numQuestions"
              type="number"
              min={1}
              max={10}
              value={numQuestions}
              onChange={(e) => {
                const val = Number(e.target.value);
                setNumQuestions(Math.max(1, Math.min(val, 10)));
              }}
              className="ex-input"
              style={{ width: 80, marginTop: 0, marginLeft: 8 }}
            />
          </label>
        </div>
<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", marginTop: "12px", flexWrap: "wrap" }}>
  <FormControl>
    <RadioGroup
      value={exerciseType}
      onChange={(e) => setExerciseType(e.target.value)}
      row
    >
      <FormControlLabel
        value="qcm"
        control={<Radio sx={{ color: "#3b82f6", "&.Mui-checked": { color: "#3b82f6" } }} />}
        label="QCM (3 choix avec une seule bonne réponse)"
      />
      <FormControlLabel
        value="ouvertes"
        control={<Radio sx={{ color: "#3b82f6", "&.Mui-checked": { color: "#3b82f6" } }} />}
        label="Questions ouvertes"
      />
    </RadioGroup>
  </FormControl>

    {questions.length > 0 && (
      <button
        onClick={downloadPDF}
        style={{
          backgroundColor: "#4766f0ff",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          border: "none",
          padding: "8px 12px",
          borderRadius: "6px",
          color: "white",
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        <Print  /> {/* Or <Print /> */}
        Télécharger les exercices
      </button>
    )}

</div>

      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
        <button
          onClick={handleGenerate}
          className="ex-btn"
          disabled={loading}
          style={loading ? { opacity: 0.7, cursor: "not-allowed" } : {}}
        >
          {loading ? "Génération..." : "Générer des exercices"}
        </button>
      </div>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {loading && <Loader color={colors.primary} />}

      <div className="ex-content">
        {show && (
          <div className={"ex-anim" + (anim ? "" : " hide")}>
            {questions.map((q, i) => (
              <div key={i} className="ex-card" style={{ marginBottom: 20 }}>
                <div className="ex-q">{q.question}</div>
                <button
                  onClick={() => toggleAnswer(i)}
                  style={{
                    marginTop: 8,
                    padding: "6px 12px",
                    backgroundColor: "#3558f5d7",
                    border: "none",
                    color: "white",
                    borderRadius: 4,
                    cursor: "pointer",
                  }}
                >
                  {validated[i] ? "Masquer la réponse" : "Valider"}
                </button>
                {validated[i] && (
                  <div
                    style={{
                      marginTop: 12,
                      padding: 12,
                      backgroundColor: "#50ca7f5b",
                      borderRadius: 6,
                      whiteSpace: "pre-line",
                    }}
                  >
                    {q.answer.length > 1 ? (
                      <>
                        Réponse :<br /><br />
                        {q.answer}
                      </>
                    ) : (
                      <>Correcte réponse : {q.answer.toUpperCase()}</>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ExercisesPage;
