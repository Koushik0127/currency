import React, { useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import "./Transfer.css";

export default function Transfer() {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [targetCurrency, setTargetCurrency] = useState("USD");
  const [converted, setConverted] = useState(null);
  const [loadingConvert, setLoadingConvert] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [senderInfo, setSenderInfo] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // set sender info from localStorage (your logged-in user)
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setSenderInfo(user.email || user.phone || "");
    }
  }, []);

  useEffect(() => {
    const fetchConversion = async () => {
      if (!amount || amount <= 0 || currency === targetCurrency) {
        setConverted(null);
        return;
      }
      try {
        setLoadingConvert(true);
        const res = await api.post("/wallet/convert-preview", {
          from: currency,
          to: targetCurrency,
          amount: Number(amount),
        });
        setConverted(res.data.convertedAmount);
        setErrorMsg("");
      } catch (err) {
        console.error("Conversion preview failed", err);
        setConverted(null);
        setErrorMsg("Failed to fetch conversion rate");
      } finally {
        setLoadingConvert(false);
      }
    };
    fetchConversion();
  }, [amount, currency, targetCurrency]);

  const getRecipientType = () => {
    if (!recipient) return null;
    return /^\S+@\S+\.\S+$/.test(recipient) ? "email" : "phone";
  };

  const isValidRecipient = () => {
    const type = getRecipientType();
    if (!type) return false;
    if (type === "email") return true;
    if (type === "phone") {
      const cleanPhone = recipient.replace(/\D/g, "");
      return /^[6-9]\d{9}$/.test(cleanPhone);
    }
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const type = getRecipientType();
    if (!isValidRecipient()) {
      return alert(
        type === "email"
          ? "Enter a valid email"
          : "Enter a valid 10-digit Indian phone number"
      );
    }

    if (!amount || amount <= 0) return alert("Enter a valid amount greater than 0");

    const body = {
      recipient,
      transferMethod: type,
      amount: Number(amount),
      currency,
      targetCurrency,
    };

    try {
      const res = await api.post("/wallet/transfer", body);
      alert(`${res.data.message}\nReceived: ${res.data.received}`);
      navigate("/dashboard");
    } catch (err) {
      console.error(err.response?.data);
      alert(err.response?.data?.message || "Transfer failed");
    }
  };

  return (
    <div className="transfer-container">
      <div className="transfer-card">
        <h2 className="transfer-title">Send / Convert</h2>
        <form onSubmit={handleSubmit} className="transfer-form">
          <input
            placeholder="Recipient Email or Phone (10 digits)"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            required
          />
          <input
            placeholder="Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <div className="currency-select">
            <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
              {["USD", "INR", "EUR", "GBP", "JPY"].map((cur) => (
                <option key={cur}>{cur}</option>
              ))}
            </select>
            <select value={targetCurrency} onChange={(e) => setTargetCurrency(e.target.value)}>
              {["USD", "INR", "EUR", "GBP", "JPY"].map((cur) => (
                <option key={cur}>{cur}</option>
              ))}
            </select>
          </div>

          {loadingConvert && <p className="info-msg">Checking conversion rate...</p>}
          {!loadingConvert && converted !== null && (
            <p className="info-msg">
              💱 You will send {amount} {currency} ≈ {converted.toFixed(2)} {targetCurrency}
            </p>
          )}
          {!loadingConvert && converted === null && amount && currency === targetCurrency && (
            <p className="info-msg">You will send {amount} {currency}</p>
          )}
          {errorMsg && <p className="error-msg">{errorMsg}</p>}

          {/* Sender Preview */}
          <p className="info-msg">From: {senderInfo}</p>

          <button type="submit" className="btn-primary">Send</button>
        </form>
      </div>
    </div>
  );
}
