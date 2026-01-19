import { useState, useEffect, useCallback } from 'react';
import { fetchHoldings, fetchCapitalGains } from '../services/api';

/**
 * Custom hook to manage holdings, capital gains and selection logic.
 * @returns {Object} { holdings, baseCapitalGains, selectedHoldings, loading, error, toggleSelection, selectAll, deselectAll }
 */
const useHoldings = () => {
  const [holdings, setHoldings] = useState([]);
  const [baseCapitalGains, setBaseCapitalGains] = useState(null);
  const [selectedHoldings, setSelectedHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initial data fetch
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [holdingsData, gainsData] = await Promise.all([
          fetchHoldings(),
          fetchCapitalGains()
        ]);
        setHoldings(holdingsData);
        setBaseCapitalGains(gainsData.capitalGains);
        setError(null);
      } catch (err) {
        setError("Failed to load portfolio data. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  /**
   * Toggles the selection of a specific coin
   */
  const toggleSelection = useCallback((coinSymbol) => {
    setSelectedHoldings((prev) => 
      prev.includes(coinSymbol) 
        ? prev.filter((s) => s !== coinSymbol) 
        : [...prev, coinSymbol]
    );
  }, []);

  /**
   * Selects all current holdings
   */
  const selectAll = useCallback(() => {
    setSelectedHoldings(holdings.map(h => h.coin));
  }, [holdings]);

  /**
   * Delselects all holdings
   */
  const deselectAll = useCallback(() => {
    setSelectedHoldings([]);
  }, []);

  return {
    holdings,
    baseCapitalGains,
    selectedHoldings,
    loading,
    error,
    toggleSelection,
    selectAll,
    deselectAll
  };
};

export default useHoldings;
