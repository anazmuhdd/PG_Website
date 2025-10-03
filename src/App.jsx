import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./login.jsx";
import DashboardPage from "./dashboard.jsx";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </Router>
  );
}
