import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import ListWalls from "./pages/listWallsPage";

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
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/walls" element={<ListWalls />}/>
       
      </Routes>
    </BrowserRouter>
  );
}

export default App;
