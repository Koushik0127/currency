// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

export default function Dashboard() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [depositAmt, setDepositAmt] = useState("");
  const [withdrawAmt, setWithdrawAmt] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resBalance, resTx] = await Promise.all([
        api.get("/wallet/balance"),
        api.get("/wallet/history"),
      ]);
      setBalance(resBalance.data.balance || 0);
      setTransactions(resTx.data || []);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDeposit = async () => {
    try {
      await api.post("/wallet/deposit", { amount: Number(depositAmt) });
      setDepositAmt("");
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Deposit failed");
    }
  };

  const handleWithdraw = async () => {
    try {
      await api.post("/wallet/withdraw", { amount: Number(withdrawAmt) });
      setWithdrawAmt("");
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Withdraw failed");
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  const chartData = transactions.map((tx) => ({
    date: new Date(tx.createdAt).toLocaleDateString(),
    deposit: tx.type === "deposit" ? Number(tx.amount) : 0,
    withdraw: tx.type === "withdraw" ? Number(tx.amount) : 0,
  }));

  return (
    <section className="dashboard">
      <div className="dashboard-top">
        <div className="card balance-card">
          <div className="card-title">Current Balance</div>
          <div className="balance-amount">₹{Number(balance).toFixed(2)}</div>
        </div>

        <div className="card actions-card">
          <div className="form-row">
            <input
              className="input"
              placeholder="Enter deposit amount"
              value={depositAmt}
              onChange={e => setDepositAmt(e.target.value)}
            />
            <button className="btn btn-primary" onClick={handleDeposit}>
              Deposit
            </button>
          </div>
          <div className="form-row">
            <input
              className="input"
              placeholder="Enter withdraw amount"
              value={withdrawAmt}
              onChange={e => setWithdrawAmt(e.target.value)}
            />
            <button className="btn btn-danger" onClick={handleWithdraw}>
              Withdraw
            </button>
          </div>
        </div>
      </div>

      <div className="card history-card">
        <h3>Transaction history</h3>
        {transactions.length === 0 ? (
          <p className="muted">No transactions yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="tx-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Currency</th>
                  <th>Converted</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx._id}>
                    <td>{tx.type}</td>
                    <td>{Number(tx.amount).toFixed(2)}</td>
                    <td>{tx.currency || "-"}</td>
                    <td>{tx.convertedAmount ? `${Number(tx.convertedAmount).toFixed(2)} ${tx.targetCurrency || ""}` : "-"}</td>
                    <td>{tx.fromUser || "-"}</td>
                    <td>{tx.toUser || "-"}</td>
                    <td>{new Date(tx.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card chart-card">
        <h3>Transaction Trends</h3>
        {transactions.length === 0 ? (
          <p className="muted">No transactions yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="deposit" stroke="#4CAF50" name="Deposits" />
              <Line type="monotone" dataKey="withdraw" stroke="#F44336" name="Withdrawals" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
