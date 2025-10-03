import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./login.jsx";
import DashboardPage from "./dashboard.jsx";
import { Analytics } from '@vercel/analytics/react';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
      <Analytics />
    </Router>
  );
}
