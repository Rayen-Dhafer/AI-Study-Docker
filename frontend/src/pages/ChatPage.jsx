import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Alert, Snackbar } from '@mui/material'; // Import Alert & Snackbar
import "./ChatPage.css";

function ChatPage({ colors }) {

  const token = localStorage.getItem("token") || "";
  const selectedTitle = localStorage.getItem("selectedTitle") || "";

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [animIdx, setAnimIdx] = useState(-1);
  const [error, setError] = useState(""); // error message state
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Toast for non-error messages if you want
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastSeverity, setToastSeverity] = useState("success");

  const showToast = (msg, severity = "success") => {
    setToastMsg(msg);
    setToastSeverity(severity);
    setToastOpen(true);
  };

  const handleToastClose = (event, reason) => {
    if (reason === "clickaway") return;
    setToastOpen(false);
  };

  useEffect(() => {
    if (messages.length > 0) {
      setAnimIdx(messages.length - 1);
      setTimeout(() => setAnimIdx(-1), 700);
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);



  const handleSend = async () => {
    const question = input.trim();

    // Reset error on new send attempt
    setError("");

    if (!selectedTitle) {
      setError("Veuillez sélectionner un PDF avant de poser une question.");
      return;
    }

    if (!question) {
      setError("La question ne peut pas être vide.");
      return;
    }

    setMessages((prev) => [...prev, { text: question, from: "user" }]);
    setInput("");
    inputRef.current?.focus();

    try {
      const params = new URLSearchParams();
      params.append("question", question);
      params.append("title", selectedTitle);

      const response = await axios.post(
        "http://localhost:8080/api/documents/ask",
        params,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data) {
        setMessages((prev) => [...prev, { text: response.data, from: "bot" }]);
      }
    } catch (error) {
      setError("Erreur lors de la récupération de la réponse.");
      setMessages((prev) => [
        ...prev,
        { text: "Erreur lors de la récupération de la réponse.", from: "bot" },
      ]);
      console.error("Ask question error:", error);
    }
  };

  return (
    <div className="chat-container">
      <h2 className="chat-title">
        Poser une question
        <br />
        <small style={{ fontWeight: "normal", fontSize: 20, color: "#666" }}>
           {selectedTitle || "Aucun PDF sélectionné "}
        </small>
      </h2>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">Aucun message pour l'instant.</div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={
                "chat-message-row" + (msg.from === "user" ? "" : " left")
              }
              style={
                animIdx === idx
                  ? { opacity: 0, transform: "translateY(30px)" }
                  : {}
              }
            >
              <span className="chat-bubble">{msg.text}</span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-row">
        <input
          autoComplete="off"
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Écrivez votre question..."
          className="chat-input"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
        />
        <button onClick={handleSend} className="chat-send-btn">
          Envoyer
        </button>
      </div>

      {/* Error alert below input like Login page */}
      {error && (
        <Alert severity="error" sx={{ mt: 1, mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Optional: Snackbar for success/info */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={3000}
        onClose={handleToastClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleToastClose}
          severity={toastSeverity}
          sx={{ width: "100%" }}
          variant="filled"
        >
          {toastMsg}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default ChatPage;
