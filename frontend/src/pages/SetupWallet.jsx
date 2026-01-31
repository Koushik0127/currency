import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Auth.css"; // Reuse the same CSS for consistent look

export default function SetupWallet() {
  const [currency, setCurrency] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [ifsc, setIfsc] = useState("");
  const token = localStorage.getItem("token");

  // Center the page and remove scroll
  useEffect(() => {
    document.body.classList.add("auth-page");
    return () => document.body.classList.remove("auth-page");
  }, []);

  const handleSetup = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/users/setup-wallet",
        { bankAccount, ifsc, currency },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      localStorage.setItem("user", JSON.stringify(res.data.user));
      alert("Wallet setup successful!");
      window.location.href = "/dashboard";
    } catch (err) {
      console.error(err.response?.data || err);
      alert(err.response?.data?.message || "Error setting up wallet");
    }
  };

  return (
    <div className="auth-container">
      <section className="auth-card">
        <h2 className="auth-title">Setup Your Wallet</h2>
        <form onSubmit={handleSetup} className="auth-form">
          <input
            type="text"
            placeholder="Bank Account Number"
            value={bankAccount}
            onChange={(e) => setBankAccount(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="IFSC Code"
            value={ifsc}
            onChange={(e) => setIfsc(e.target.value)}
            required
          />
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            required
          >
            <option value="">Select Currency</option>
            <option value="INR">INR</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="JPY">JPY</option>
          </select>
          <button type="submit" className="btn-primary" style={{ marginTop: "1rem" }}>
            Setup Wallet
          </button>
        </form>
      </section>
    </div>
  );
}
