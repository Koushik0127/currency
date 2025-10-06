// src/pages/Transfer.jsx
import React, { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Transfer() {
  const [recipientEmail, setRecipientEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [targetCurrency, setTargetCurrency] = useState("USD");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const body = { recipientEmail, amount: Number(amount), currency, targetCurrency };
      const res = await api.post("/wallet/transfer", body);
      alert(res.data.message + ` — Received: ${res.data.received}`);
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Transfer failed");
    }
  };

  return (
    <section className="card transfer-card">
      <h2 className="heading">Send / Convert</h2>
      <form className="form" onSubmit={handleSubmit}>
        <input className="input" placeholder="Recipient email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} required />
        <input className="input" placeholder="Amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        <div className="form-row">
          <select className="select" value={currency} onChange={(e) => setCurrency(e.target.value)}>
            <option>USD</option><option>INR</option><option>EUR</option><option>GBP</option><option>JPY</option>
          </select>
          <select className="select" value={targetCurrency} onChange={(e) => setTargetCurrency(e.target.value)}>
            <option>USD</option><option>INR</option><option>EUR</option><option>GBP</option><option>JPY</option>
          </select>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">Send</button>
        </div>
      </form>
    </section>
  );
}
