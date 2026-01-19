import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import toast from 'react-hot-toast';
import { getPortfolio, getTaxDetails } from '../services/api';
import { getNetGain, getTotalTaxableAmount, projectHarvestingImpact } from '../utils/taxCalculations';

const GainsContext = createContext();

export const GainsProvider = ({ children }) => {
  const [assets, setAssets] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedIds, setSelectedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('koinx_selected_assets');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [taxRate, setTaxRate] = useState(() => {
    try {
      const saved = localStorage.getItem('koinx_tax_rate');
      return saved ? Number(saved) : 30;
    } catch {
      return 30;
    }
  });

  useEffect(() => {
    localStorage.setItem('koinx_selected_assets', JSON.stringify(selectedIds));
  }, [selectedIds]);

  useEffect(() => {
    localStorage.setItem('koinx_tax_rate', taxRate.toString());
  }, [taxRate]);

  const [status, setStatus] = useState({ loading: true, error: null });

  useEffect(() => {
    const loadData = async () => {
      try {
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

  const toggleSelection = useCallback((ticker) => {
    setSelectedIds(prev => {
      const isSelected = prev.includes(ticker);
      if (isSelected) toast.success(`Deselected ${ticker}`, { id: 'toggle' });
      else toast.success(`Selected ${ticker}`, { id: 'toggle' });
      return isSelected ? prev.filter(t => t !== ticker) : [...prev, ticker];
    });
  }, []);

  const selectAll = useCallback(() => {
    toast.success('Selected all assets');
    setSelectedIds(assets.map(a => a.coin));
  }, [assets]);

  const autoSelect = useCallback(() => {
    const harvestable = assets
      .filter(a => (a.stcg?.gain < 0 || a.ltcg?.gain < 0))
      .filter(a => ((a.stcg?.gain || 0) + (a.ltcg?.gain || 0)) <= 0)
      .sort((a, b) => {
        const aLoss = Math.min(a.stcg?.gain || 0, 0) + Math.min(a.ltcg?.gain || 0, 0);
        const bLoss = Math.min(b.stcg?.gain || 0, 0) + Math.min(b.ltcg?.gain || 0, 0);
        return aLoss - bLoss; 
      });
    
    toast.success('Auto-selected best tax saving assets', { icon: '✨' });
    setSelectedIds(harvestable.map(a => a.coin));
  }, [assets]);

  const clearAll = useCallback(() => {
    toast.success('Cleared all selections');
    setSelectedIds([]);
  }, []);

  const taxMetrics = useMemo(() => {
    if (!assets.length || !summary) return null;

    const selectedData = assets.filter(a => selectedIds.includes(a.coin));

    const currentStcgNet = getNetGain(summary.stcg.profits, summary.stcg.losses);
    const currentLtcgNet = getNetGain(summary.ltcg.profits, summary.ltcg.losses);
    const initialRealised = getTotalTaxableAmount(currentStcgNet, currentLtcgNet);

    const harvestImpact = projectHarvestingImpact(summary, selectedData);
    const projectedStcgNet = getNetGain(harvestImpact.stcg.profits, harvestImpact.stcg.losses);
    const projectedLtcgNet = getNetGain(harvestImpact.ltcg.profits, harvestImpact.ltcg.losses);
    const finalRealised = getTotalTaxableAmount(projectedStcgNet, projectedLtcgNet);

    return {
      current: {
        total: initialRealised,
        stcg: { ...summary.stcg, net: currentStcgNet },
        ltcg: { ...summary.ltcg, net: currentLtcgNet }
      },
      projected: {
        total: finalRealised,
        stcg: { ...harvestImpact.stcg, net: projectedStcgNet },
        ltcg: { ...harvestImpact.ltcg, net: projectedLtcgNet }
      },
      estimatedSavings: (initialRealised - finalRealised) * (taxRate / 100)
    };
  }, [assets, summary, selectedIds, taxRate]);

  const prevSavingsRef = useRef(0);
  useEffect(() => {
    if (taxMetrics && taxMetrics.estimatedSavings !== prevSavingsRef.current) {
      if (taxMetrics.estimatedSavings > prevSavingsRef.current && taxMetrics.estimatedSavings > 0 && selectedIds.length > 0) {
        toast.success(`Savings increased! Now at ₹${taxMetrics.estimatedSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, { icon: '💰' });
      }
      prevSavingsRef.current = taxMetrics.estimatedSavings;
    }
  }, [taxMetrics, selectedIds]);

  return (
    <GainsContext.Provider value={{
      assets,
      summary,
      selectedIds,
      loading: status.loading,
      error: status.error,
      taxMetrics,
      toggleSelection,
      selectAll,
      autoSelect,
      clearAll,
      taxRate,
      setTaxRate
    }}>
      {children}
    </GainsContext.Provider>
  );
};

export const useGains = () => useContext(GainsContext);
