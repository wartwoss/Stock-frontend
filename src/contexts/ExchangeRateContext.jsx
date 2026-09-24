import { createContext, useContext, useState, useEffect } from 'react';

const ExchangeRateContext = createContext(null);

export function ExchangeRateProvider({ children }) {
  const [exchangeRate, setExchangeRate] = useState(150000); // Default to 150k per $100
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRate() {
      try {
        const response = await fetch('https://v6.exchangerate-api.com/v6/e4c22a4454b8d7df74482dbf/latest/USD');
        const data = await response.json();
        if (data && data.rates && data.rates.IQD) {
          // The API gives rate per 1 USD (e.g., 1310). We want rate per 100 USD (e.g., 131000).
          setExchangeRate(data.rates.IQD * 100);
        }
      } catch (error) {
        console.error("Failed to fetch exchange rate:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRate();
  }, []);

  return (
    <ExchangeRateContext.Provider value={{ exchangeRate, loading }}>
      {children}
    </ExchangeRateContext.Provider>
  );
}

export function useExchangeRate() {
  return useContext(ExchangeRateContext);
}
