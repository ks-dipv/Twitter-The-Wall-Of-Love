import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import ListWalls from "./pages/listWallsPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/walls" element={<ListWalls />} />
      </Routes>
    </Router>
  );
}

export default App;
