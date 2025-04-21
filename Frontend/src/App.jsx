import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import ShareableWallPage from "./pages/ShareableWallPage";
import VerifyEmail from "./pages/VerifyEmail";
import ResendEmail from "./pages/ResendEmail";
import PublicWalls from "./pages/PublicWalls";
import PublicShareableWallPage from "./pages/PublicShareableWall";
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/public-walls" element={<PublicWalls />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/resend-email" element={<ResendEmail />} />
          <Route
            path="/walls/:wallId/link/:uniqueId"
            element={<ShareableWallPage />}
          />
          <Route
            path="/walls/:wallId/public"
            element={<PublicShareableWallPage />}
          />
          <Route
            path="/verify-email/:verificationToken"
            element={<VerifyEmail />}
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
