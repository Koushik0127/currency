// src/pages/SetupWallet.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function SetupWallet() {
  const [bankAccount, setBankAccount] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [currency, setCurrency] = useState("INR"); // default
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validateFields = () => {
    let tempErrors = {};

    if (!/^\d{9,18}$/.test(bankAccount)) {
      tempErrors.bankAccount = "Bank account must be 9–18 digits";
    }

    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(ifsc)) {
      tempErrors.ifsc = "IFSC must be in format ABCD0XXXXXX";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!validateFields()) {
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErrors({ general: "User not authenticated" });
        setLoading(false);
        return;
      }

      const res = await axios.post(
        "http://localhost:5000/api/users/setup-wallet",
        { bankAccount, ifsc: ifsc.toUpperCase(), currency },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // ✅ store updated user info in localStorage
      localStorage.setItem("user", JSON.stringify(res.data.user));

      alert("✅ Wallet setup successful!");
      navigate("/dashboard");
    } catch (err) {
      setErrors({
        general: err.response?.data?.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <div className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-md">
        <h1 className="text-3xl font-extrabold mb-6 text-center text-blue-800">
          Setup Your Wallet
        </h1>

        {errors.general && (
          <div className="text-red-600 mb-4 text-base font-medium">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-semibold text-gray-800 text-lg">
              Bank Account Number
            </label>
            <input
              type="text"
              className={`w-full border rounded-lg p-3 mt-2 text-base focus:ring-2 focus:ring-blue-400 outline-none ${
                errors.bankAccount ? "border-red-500" : "border-gray-300"
              }`}
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              required
            />
            {errors.bankAccount && (
              <p className="text-red-500 text-sm mt-1">{errors.bankAccount}</p>
            )}
          </div>

          <div>
            <label className="block font-semibold text-gray-800 text-lg">
              IFSC Code
            </label>
            <input
              type="text"
              className={`w-full border rounded-lg p-3 mt-2 text-base focus:ring-2 focus:ring-blue-400 outline-none uppercase ${
                errors.ifsc ? "border-red-500" : "border-gray-300"
              }`}
              value={ifsc}
              onChange={(e) => setIfsc(e.target.value.toUpperCase())}
              required
            />
            {errors.ifsc && (
              <p className="text-red-500 text-sm mt-1">{errors.ifsc}</p>
            )}
          </div>

          <div>
            <label className="block font-semibold text-gray-800 text-lg">
              Default Currency
            </label>
            <select
              className="w-full border rounded-lg p-3 mt-2 text-base focus:ring-2 focus:ring-blue-400 outline-none"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="INR">🇮🇳 INR</option>
              <option value="USD">🇺🇸 USD</option>
              <option value="EUR">🇪🇺 EUR</option>
              <option value="GBP">🇬🇧 GBP</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white text-lg font-semibold py-3 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            {loading ? "Saving..." : "Save & Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
