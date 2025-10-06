// src/pages/Docs.jsx
import React from "react";

export default function Docs() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">API Documentation (short)</h1>

      <h2 className="mt-4 font-semibold">Auth</h2>
      <p><strong>POST /api/users/signup</strong> — body: {`{name,email,password}`} → returns token</p>
      <p><strong>POST /api/users/login</strong> — body: {`{email,password}`} → returns token</p>

      <h2 className="mt-4 font-semibold">Wallet</h2>
      <p>All wallet requests require header <code>Authorization: Bearer &lt;token&gt;</code></p>
      <p><strong>GET /api/wallets</strong> — get user wallets</p>
      <p><strong>POST /api/wallets/deposit</strong> — body: {`{amount}`}</p>
      <p><strong>POST /api/wallets/withdraw</strong> — body: {`{amount}`}</p>
      <p><strong>POST /api/wallets/transfer</strong> — body: {`{toUserId, amount, currency, targetCurrency}`}</p>
      <p><strong>GET /api/wallets/history</strong> — get transactions</p>
    </div>
  );
}
