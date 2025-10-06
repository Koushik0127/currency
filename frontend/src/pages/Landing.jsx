// src/pages/Landing.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./Landing.css"; // optional if you want custom styles later

export default function Landing() {
  return (
    <div className="landing-container">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-text">
          <h1 className="hero-title">Mobile Currency Wallet</h1>
          <p className="hero-subtitle">
            Secure multicurrency wallet with real-time transfers and live conversion rates.
          </p>
          <div className="hero-buttons">
            <Link to="/signup" className="btn btn-primary">Sign Up</Link>
            <Link to="/login" className="btn btn-secondary">Log In</Link>
          </div>
        </div>
        <div className="hero-image">
       <img
  src="/Transfer.png"
  alt="Wallet illustration"
  className="transfer-img"
/>



        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="feature">
          <h3>🔐 Secure</h3>
          <p>All transactions are protected with JWT authentication and encryption.</p>
        </div>
        <div className="feature">
          <h3>💱 Multi-Currency</h3>
          <p>Send, receive, and convert between multiple currencies instantly.</p>
        </div>
        <div className="feature">
          <h3>📊 Live Rates</h3>
          <p>Get real-time conversion rates updated on every transaction.</p>
        </div>
      </section>
    </div>
  );
}
