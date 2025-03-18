import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import WallPage from "./pages/WallPage";
import UpdateWallPage from "./pages/UpdateWallPage";
import AdminDashboard from "./pages/AdminDashboard";
import AddTweet from "./pages/AddTweet";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/walls/:id" element={<WallPage />} />
          <Route path="/wall/:id/update" element={<UpdateWallPage />} />
          <Route path="/wall/:wallId/add-tweet" element={<AddTweet />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
