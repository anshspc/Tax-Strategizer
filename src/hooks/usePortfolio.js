import { useState, useEffect, useCallback } from 'react';
import { getPortfolio, getTaxDetails } from '../services/api';

/**
 * Main hook for handling the portfolio state and selection logic
 */
const usePortfolio = () => {
  const [assets, setAssets] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedTickers, setSelectedTickers] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: null });

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetching both in parallel to save some time
        const [portfolioData, taxData] = await Promise.all([
          getPortfolio(),
          getTaxDetails()
        ]);
        
        setAssets(portfolioData);
        setSummary(taxData.capitalGains);
        setStatus({ loading: false, error: null });
      } catch (err) {
        console.error('Failed to sync portfolio:', err);
        setStatus({ loading: false, error: 'Failed to sync portfolio data. Please try again.' });
      }
    };

    loadData();
  }, []);

  const toggleTicker = useCallback((ticker) => {
    setSelectedTickers(prev => 
      prev.includes(ticker) 
        ? prev.filter(t => t !== ticker) 
        : [...prev, ticker]
    );
  }, []);

  const selectAll = useCallback(() => {
    setSelectedTickers(assets.map(a => a.coin));
  }, [assets]);

  const autoSelect = useCallback(() => {
    const harvestable = assets
      .filter(a => (a.stcg?.gain < 0 || a.ltcg?.gain < 0))
      // Filter out assets with significant net gains to follow "avoid strong positive gains" rule
      .filter(a => ((a.stcg?.gain || 0) + (a.ltcg?.gain || 0)) <= 0)
      .sort((a, b) => {
        const aLoss = Math.min(a.stcg?.gain || 0, 0) + Math.min(a.ltcg?.gain || 0, 0);
        const bLoss = Math.min(b.stcg?.gain || 0, 0) + Math.min(b.ltcg?.gain || 0, 0);
        return aLoss - bLoss; // Most negative first
      });
    
    setSelectedTickers(harvestable.map(a => a.coin));
  }, [assets]);

  const clearAll = useCallback(() => {
    setSelectedTickers([]);
  }, []);

  return {
    assets,
    summary,
    selectedTickers,
    loading: status.loading,
    error: status.error,
    toggleTicker,
    selectAll,
    autoSelect,
    clearAll
  };
};

export default usePortfolio;
