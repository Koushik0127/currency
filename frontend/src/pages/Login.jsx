// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/users/login", form);

      // Save token
      localStorage.setItem("token", res.data.token);

      // Save user data
      localStorage.setItem("user", JSON.stringify(res.data));

      // ✅ If wallet is not set up, redirect to wallet setup
      if (!res.data.bankAccount) {
        navigate("/setup-wallet");
      } else {
        // Otherwise, go straight to dashboard
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <section className="card auth-card">
      <h2 className="heading">Login</h2>
      <form onSubmit={handleSubmit} className="form">
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          className="input"
          required
        />
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
          className="input"
          required
        />
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Login
          </button>
        </div>
      </form>
      {error && <p className="error">{error}</p>}
    </section>
  );
}

export default Login;
