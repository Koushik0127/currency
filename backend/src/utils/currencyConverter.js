// Simple demo conversion rates, can integrate real API
const rates = {
  USD: { INR: 83, EUR: 0.91, GBP: 0.78, JPY: 142 },
  INR: { USD: 0.012, EUR: 0.011, GBP: 0.0094, JPY: 1.71 },
  EUR: { USD: 1.10, INR: 91, GBP: 0.86, JPY: 156 },
  GBP: { USD: 1.28, INR: 106, EUR: 1.16, JPY: 181 },
  JPY: { USD: 0.0070, INR: 0.58, EUR: 0.0064, GBP: 0.0055 },
};

export const convertCurrency = async (from, to, amount) => {
  if (from === to) return amount;
  const rate = rates[from]?.[to];
  if (!rate) throw new Error(`Conversion rate not found for ${from} -> ${to}`);
  return amount * rate;
};
