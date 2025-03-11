import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import ListWalls from "./pages/listWallsPage";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/protectedRoute";
function Home() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Welcome to the Home Page</h1>
      <nav className="mt-4">
        <Link to="/signin" className="mr-4 text-blue-600 hover:underline">
          Sign In
        </Link>
        <Link to="/signup" className="text-blue-600 hover:underline">
          Sign Up
        </Link>
      </nav>
    </div>
  );
}

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
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
