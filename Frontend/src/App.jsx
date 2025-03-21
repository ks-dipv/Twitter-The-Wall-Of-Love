import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import ListWalls from "./pages/listWallsPage";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/protectedRoute";
import Home from "./pages/Home";
import WallPage from "./pages/WallPage";
import UpdateWallPage from "./pages/UpdateWallPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route
            path="/walls"
            element={
              <ProtectedRoute>
                <ListWalls />
              </ProtectedRoute>
            }
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/walls/:id" element={<WallPage />} />
          <Route path="/wall/:id/update" element={<UpdateWallPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
