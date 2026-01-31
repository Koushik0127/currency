// src/App.jsx
import "./App.css";
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";

import Landing from "./pages/Landing";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Transfer from "./pages/Transfer";
import Docs from "./pages/Docs";
import SetupWallet from "./pages/SetupWallet";

// Navbar component — only shown if token exists AND not on public pages
function Navbar() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
    window.dispatchEvent(new Event("storage"));
  };

  // Hide navbar on public pages
  const publicPaths = ["/", "/signup", "/login"];
  if (!token || publicPaths.includes(location.pathname)) return null;

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link to="/dashboard" className="logo">Currency Wallet</Link>
        <nav className="nav-links">
          <Link to="/dashboard" className="btn btn-link">Dashboard</Link>
          <Link to="/transfer" className="btn btn-link">Transfer</Link>
          <button onClick={handleLogout} className="btn btn-primary">Logout</button>
        </nav>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <Router>
      <Navbar />
      <main className="container">
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<Landing />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />

          {/* Wallet & Dashboard */}
          <Route path="/setup-wallet" element={<SetupWallet />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transfer" element={<Transfer />} />
          <Route path="/docs" element={<Docs />} />
        </Routes>
      </main>
    </Router>
  );
}
