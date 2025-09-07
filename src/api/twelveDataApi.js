// src/api/twelveDataApi.js

const TWELVE_DATA_API_KEY = import.meta.env.VITE_TWELVE_DATA_API_KEY;

export const fetchAptosPriceData = async () => {
  const url = `https://api.twelvedata.com/time_series?symbol=APT/USD&interval=1day&outputsize=7&apikey=${TWELVE_DATA_API_KEY}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch market data from Twelve Data API");
  }

  const data = await response.json();
  if (data.status === "error" || !data.values) {
    throw new Error(data.message || "Invalid market data returned");
  }

  return data.values.reverse(); // Return the data on success
};