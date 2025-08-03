import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UploadPage from "./pages/UploadPage";
import ChatPage from "./pages/ChatPage";
import ExercisesPage from "./pages/ExercisesPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ResetPassword from "./pages/ResetPassword";
import NewPassword from "./pages/NewPasswordPage";

import Navbar from "./pages/Navbar";

const colors = {
  primary: "#4f46e5",
  secondary: "#0ea5e9",
  background: "#f8fafc",
  card: "#fff",
  accent: "#f59e42",
  text: "#1e293b",
  textSecondary: "#64748b",
  error: "#ef4444",
  success: "#22c55e",
  navBg: "#fff",
  navShadow: "#e0e7ef",
  gradient: "linear-gradient(135deg, #e0e7ff 0%, #f8fafc 100%)",
};

function App() {
  return (
    <Router>
      <div style={{
        background: colors.gradient,
        minHeight: "100vh",
        fontFamily: "Inter, Segoe UI, Arial, sans-serif",
      }}>
        <Routes>
          {/* Auth routes without navbar */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/edit-password" element={<NewPassword />} />

          {/* Main routes with navbar */}
          <Route path="*" element={
            <>
              <Navbar colors={colors} />
              <div style={{ paddingTop: 80 }}>
                <Routes>
                  <Route path="/upload" element={<UploadPage colors={colors} />} />
                  <Route path="/chat" element={<ChatPage colors={colors} />} />
                  <Route path="/exercises" element={<ExercisesPage colors={colors} />} />
                </Routes>
              </div>
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;