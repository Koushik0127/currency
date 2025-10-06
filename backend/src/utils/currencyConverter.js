import axios from "axios";

export const convertCurrency = async (from, to, amount) => {
  try {
    const url = `https://api.frankfurter.app/latest?amount=${amount}&from=${from}&to=${to}`;
    const response = await axios.get(url);

    if (response.data && response.data.rates && response.data.rates[to]) {
      console.log("Currency API response:", response.data);
      return Number(response.data.rates[to]); // ✅ actual converted value
    } else {
      throw new Error("Invalid API response");
    }
  } catch (error) {
    console.error("Currency conversion failed:", error.message);
    return amount; // fallback so it doesn’t break transfers
  }
};
