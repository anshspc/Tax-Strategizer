import React, { useState, useEffect } from 'react';
import DashboardStats from './components/DashboardStats';
import AssetManagerTable from './components/AssetManagerTable';
import AnalyticsCharts from './components/AnalyticsCharts';
import { useGains } from './context/GainsContext';
import { formatCurrency, formatCrypto } from './utils/format';

const App = () => {
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 'dark'
  );

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const {
    loading,
    error,
    taxMetrics,
    autoSelect,
    selectAll,
    clearAll,
    taxRate,
    setTaxRate,
    assets,
    selectedIds
  } = useGains();

  const [activeTab, setActiveTab] = useState('optimizer');

  // SQL Explorer States
  const [sqlQuery, setSqlQuery] = useState("SELECT * FROM holdings WHERE stcg_gain < 0;");
  const [queryResult, setQueryResult] = useState([]);
  const [queryError, setQueryError] = useState(null);

  // Initialize query results when assets load
  useEffect(() => {
    if (assets && assets.length > 0 && queryResult.length === 0) {
      // Run default query
      runQuery("SELECT * FROM holdings WHERE stcg_gain < 0;");
    }
  }, [assets]);

  const runQuery = (queryText) => {
    setSqlQuery(queryText);
    setQueryError(null);
    const cleaned = queryText.trim().toLowerCase().replace(/\s+/g, ' ');

    try {
      if (cleaned.startsWith("select * from holdings")) {
        let result = assets.map(a => ({
          coin: a.coin,
          coinName: a.coinName,
          currentPrice: a.currentPrice,
          totalHolding: a.totalHolding,
          stcg_gain: a.stcg?.gain || 0,
          ltcg_gain: a.ltcg?.gain || 0,
        }));
        
        if (cleaned.includes("where stcg_gain < 0")) {
          result = result.filter(a => a.stcg_gain < 0);
        } else if (cleaned.includes("where ltcg_gain < 0")) {
          result = result.filter(a => a.ltcg_gain < 0);
        } else if (cleaned.includes("where coin =")) {
          const match = cleaned.match(/where coin\s*=\s*['"]([^'"]+)['"]/);
          if (match && match[1]) {
            const coin = match[1].toUpperCase();
            result = result.filter(a => a.coin === coin);
          } else {
            throw new Error("Syntax error in WHERE clause. Example: WHERE coin = 'MATIC'");
          }
        }
        
        if (cleaned.includes("order by currentprice desc")) {
          result.sort((a, b) => b.currentPrice - a.currentPrice);
        } else if (cleaned.includes("order by stcg_gain asc")) {
          result.sort((a, b) => a.stcg_gain - b.stcg_gain);
        }

        setQueryResult(result);
      } else if (cleaned.startsWith("select coin, totalholding, currentprice from holdings")) {
        let result = assets.map(a => ({
          coin: a.coin,
          totalHolding: a.totalHolding,
          currentPrice: a.currentPrice
        }));
        
        if (cleaned.includes("order by currentprice desc")) {
          result.sort((a, b) => b.currentPrice - a.currentPrice);
        }

        setQueryResult(result);
      } else {
        throw new Error("SQL syntax error: Only SELECT queries from 'holdings' table are supported. e.g. SELECT * FROM holdings;");
      }
    } catch (err) {
      setQueryError(err.message);
      setQueryResult([]);
    }
  };

  // Recommendations calculations
  const unselectedLossAssets = assets.filter(
    a => !selectedIds.includes(a.coin) && ((a.stcg?.gain || 0) < 0 || (a.ltcg?.gain || 0) < 0)
  );
  const totalUnselectedLoss = unselectedLossAssets.reduce((acc, curr) => {
    const loss = Math.abs(Math.min(curr.stcg?.gain || 0, 0)) + Math.abs(Math.min(curr.ltcg?.gain || 0, 0));
    return acc + loss;
  }, 0);
  const savingsPotential = totalUnselectedLoss * (taxRate / 100);

  const selectedGainAssets = assets.filter(
    a => selectedIds.includes(a.coin) && ((a.stcg?.gain || 0) > 0 || (a.ltcg?.gain || 0) > 0)
  );
  const totalSelectedGain = selectedGainAssets.reduce((acc, curr) => {
    const profit = Math.max(curr.stcg?.gain || 0, 0) + Math.max(curr.ltcg?.gain || 0, 0);
    return acc + profit;
  }, 0);

  const resetAllFilters = () => {
    clearAll();
    setTaxRate(30);
  };

  return (
    <div className="min-h-screen dark:bg-[#0a0f1d] bg-slate-50 dark:text-slate-200 text-slate-800 transition-colors duration-300 selection:bg-blue-500/30 flex flex-col lg:flex-row">
      
      {/* Sidebar Controls - Aligned with Ride system */}
      <aside className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r dark:border-white/5 border-slate-200 dark:bg-[#0d1527] bg-white p-8 flex flex-col shrink-0">
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-emerald-400 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-lg">T</div>
          <span className="text-2xl font-black tracking-[-0.05em] bg-gradient-to-r from-blue-500 to-emerald-400 bg-clip-text text-transparent">TaxSync Pro</span>
        </div>

        <div className="space-y-8 flex-1">
          <div>
            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-500 mb-2">Dashboard Controls</h2>
            <p className="text-xs text-slate-500 font-medium">Configure parameters and simulate harvesting scenarios dynamically.</p>
          </div>

          {/* Reset Filters */}
          <div>
            <button 
              onClick={resetAllFilters}
              className="w-full py-3 bg-slate-800/50 hover:bg-slate-800 border dark:border-white/5 border-slate-200 rounded-xl text-xs font-black uppercase tracking-wider text-slate-300 hover:text-white transition-all flex items-center justify-center space-x-2"
            >
              <span>🔄 Reset All Parameters</span>
            </button>
          </div>

          {/* Tax Rate Slider */}
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider text-slate-400">
              <span>Simulated Tax Rate</span>
              <span className="text-emerald-400 text-sm">{taxRate}%</span>
            </div>
            <input 
              type="range" 
              min="10" 
              max="40" 
              step="5"
              value={taxRate}
              onChange={(e) => setTaxRate(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-[9px] font-black text-slate-600">
              <span>10%</span>
              <span>20%</span>
              <span>30%</span>
              <span>40%</span>
            </div>
          </div>

          {/* Quick Portfolio Selections */}
          <div className="space-y-4 pt-4 border-t dark:border-white/5 border-slate-200">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Quick Harvest Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={autoSelect} 
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-[11px] font-black tracking-wider text-white uppercase transition-all shadow-md active:scale-95 flex items-center justify-center space-x-2"
              >
                <span>✨ Auto Select Best Assets</span>
              </button>
              <button 
                onClick={selectAll} 
                className="w-full py-3 bg-slate-800/40 hover:bg-slate-800/80 border dark:border-white/5 border-slate-200 rounded-xl text-[11px] font-black tracking-wider text-slate-400 hover:text-white uppercase transition-all"
              >
                Select All
              </button>
              <button 
                onClick={clearAll} 
                className="w-full py-3 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-xl text-[11px] font-black tracking-wider text-slate-500 hover:text-red-400 uppercase transition-all"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-8 border-t dark:border-white/5 border-slate-200 mt-8 flex items-center justify-between">
          <button 
            onClick={toggleTheme}
            className="p-3 dark:bg-white/5 bg-slate-900/5 hover:dark:bg-white/10 hover:bg-slate-900/10 rounded-xl transition-colors"
            title="Toggle Theme"
          >
            {theme === 'dark' ? (
              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4.22 4.22a1 1 0 011.415 0l.708.708a1 1 0 01-1.414 1.414l-.708-.708a1 1 0 010-1.414zM17 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zm-4.22 4.22a1 1 0 010 1.415l-.708.708a1 1 0 01-1.414-1.414l.708-.708a1 1 0 011.415 0zM10 16a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm-4.22-1.414a1 1 0 01-1.414 0l-.708.708a1 1 0 011.414 1.414l.708-.708a1 1 0 010-1.414zM4 10a1 1 0 01-1 1H2a1 1 0 110-2h1a1 1 0 011 1zm1.414-4.22a1 1 0 010-1.415l.708-.708a1 1 0 011.414 1.414l-.708.708a1 1 0 01-1.414 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider">v1.2.0</span>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto space-y-12">
        
        {/* Error Notification */}
        {error && (
          <div className="bg-rose-500/5 border-2 border-rose-500/20 p-8 rounded-3xl flex items-center gap-6 shadow-[0_0_50px_rgba(244,63,94,0.1)]">
            <svg className="w-8 h-8 text-rose-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="font-black text-white text-lg">Failed to sync portfolio</h3>
              <p className="text-slate-500 text-sm font-bold">{error}</p>
            </div>
          </div>
        )}

        {/* Dashboard Title - Aligned with Ride main-title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-2">
            <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-blue-500 via-[#10b981] to-emerald-400 bg-clip-text text-transparent tracking-tight">
              🚗 Tax Loss Harvesting Workspace
            </h1>
            <p className="text-slate-500 font-bold text-sm lg:text-base max-w-2xl leading-relaxed">
              Interactive tax intelligence, SQL database explorer & harvesting optimization engine.
            </p>
          </div>
          
          {/* Estimated Savings KPI Card */}
          {!loading && taxMetrics && taxMetrics.estimatedSavings > 0 && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 px-8 py-5 rounded-2xl flex items-center gap-6 shadow-xl shrink-0">
              <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <div className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] mb-0.5">Projected Savings</div>
                <p className="text-emerald-400 font-black text-3xl tracking-tighter tabular-nums drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                  ₹{formatCurrency(taxMetrics.estimatedSavings)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Tabs - Aligned with Ride tabs */}
        <div className="border-b dark:border-white/5 border-slate-200">
          <div className="flex space-x-8 -mb-px">
            <button 
              onClick={() => setActiveTab('optimizer')}
              className={`pb-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${
                activeTab === 'optimizer' 
                  ? 'border-blue-500 text-blue-400' 
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              📈 Interactive KPIs & Optimizer
            </button>
            <button 
              onClick={() => setActiveTab('recommendations')}
              className={`pb-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${
                activeTab === 'recommendations' 
                  ? 'border-blue-500 text-blue-400' 
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              🎯 Strategy Recommendations
            </button>
            <button 
              onClick={() => setActiveTab('database')}
              className={`pb-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${
                activeTab === 'database' 
                  ? 'border-blue-500 text-blue-400' 
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              🖥️ SQL Database Explorer
            </button>
          </div>
        </div>

        {/* Tab 1: Interactive KPIs & Optimizer */}
        {activeTab === 'optimizer' && (
          <div className="space-y-12 animate-fade-in">
            {/* Analytics Stats Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
              <DashboardStats 
                title="Analysis: Base Exposure" 
                total={taxMetrics?.current.total || 0}
                stcg={taxMetrics?.current.stcg || { profits: 0, losses: 0, net: 0 }}
                ltcg={taxMetrics?.current.ltcg || { profits: 0, losses: 0, net: 0 }}
                theme="dark"
                loading={loading}
              />
              <DashboardStats 
                title="Strategy: Harvest Projection" 
                total={taxMetrics?.projected.total || 0}
                stcg={taxMetrics?.projected.stcg || { profits: 0, losses: 0, net: 0 }}
                ltcg={taxMetrics?.projected.ltcg || { profits: 0, losses: 0, net: 0 }}
                theme="blue"
                loading={loading}
              />
            </div>

            {/* Charts Section */}
            {!loading && taxMetrics && (
              <AnalyticsCharts />
            )}

            {/* Portfolio Table Section */}
            <div className="space-y-6">
              <div className="px-2">
                 <h2 className="text-2xl font-black dark:text-white text-slate-900 tracking-tight uppercase">Holdings Harvester</h2>
                 <p className="text-slate-500 font-bold text-sm">Select specific positions below to simulate realization offsets in real time.</p>
              </div>
              <AssetManagerTable />
            </div>
          </div>
        )}

        {/* Tab 2: Strategy Recommendations */}
        {activeTab === 'recommendations' && (
          <div className="space-y-8 animate-fade-in">
            <div className="px-2">
               <h2 className="text-2xl font-black dark:text-white text-slate-900 tracking-tight uppercase">💡 Strategy Action Plans</h2>
               <p className="text-slate-500 font-bold text-sm">Automated wealth intelligence recommendations generated from current asset exposure.</p>
            </div>

            <div className="space-y-6 max-w-4xl">
              
              {/* Unselected Loss Recovery Card */}
              {totalUnselectedLoss > 0 ? (
                <div className="recommendation-box-premium border-l-[#3b82f6]">
                  <div className="recommendation-title-premium text-blue-400 flex items-center space-x-2">
                    <span>🎯 Recovery Action Plan (Target: Offset Unrealized Losses)</span>
                  </div>
                  <div className="recommendation-desc-premium">
                    You have unharvested losses in <strong className="text-white">{unselectedLossAssets.map(a => a.coin).join(', ')}</strong> totaling <strong className="text-white">₹{formatCurrency(totalUnselectedLoss)}</strong>. 
                    By selecting and harvesting these assets in the Optimizer workspace, you can realize these losses to directly offset your taxable gains, reducing your taxable burden by up to <strong className="text-emerald-400">₹{formatCurrency(savingsPotential)}</strong> under the simulated {taxRate}% tax rate.
                  </div>
                </div>
              ) : (
                <div className="recommendation-box-premium">
                  <div className="recommendation-title-premium text-emerald-400">✨ Losses Fully Optimized</div>
                  <div className="recommendation-desc-premium">
                    Excellent! You have successfully selected all available loss-bearing positions for harvesting. No further unharvested losses remain in your current portfolio.
                  </div>
                </div>
              )}

              {/* High Positive Gains Caution Card */}
              {totalSelectedGain > 0 && (
                <div className="recommendation-box-premium border-l-amber-500" style={{ borderLeftColor: '#f59e0b' }}>
                  <div className="recommendation-title-premium text-amber-400">⚠️ Realized Gains Caution</div>
                  <div className="recommendation-desc-premium">
                    You have selected asset positions with net profits in <strong className="text-white">{selectedGainAssets.map(a => a.coin).join(', ')}</strong> totaling <strong className="text-white">₹{formatCurrency(totalSelectedGain)}</strong>. 
                    Realizing these positions will increase your net capital gains exposure. We recommend reviewing if you can harvest additional matching loss-bearing positions to offset this tax burden.
                  </div>
                </div>
              )}

              {/* Active Harvesting Plan Summary */}
              {!loading && taxMetrics && taxMetrics.estimatedSavings > 0 && (
                <div className="recommendation-box-premium border-l-emerald-500">
                  <div className="recommendation-title-premium text-emerald-400">💰 Active Harvest Summary (Savings: ₹{formatCurrency(taxMetrics.estimatedSavings)})</div>
                  <div className="recommendation-desc-premium">
                    Your current selections project an active saving of <strong className="text-white">₹{formatCurrency(taxMetrics.estimatedSavings)}</strong>. 
                    To lock in these savings, you would need to execute sells on your selected loss-bearing assets before the end of the current tax cycle. Make sure to consult your accountant before executing high-volume trades.
                  </div>
                </div>
              )}

              {/* Educational Explanation Box */}
              <div className="bg-[#0f172a]/50 rounded-xl p-8 border border-white/5 space-y-4">
                <h4 className="font-black text-slate-300 text-sm uppercase tracking-wider">How Tax Loss Harvesting Works</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-bold">
                  Tax-loss harvesting is the practice of selling assets that have experienced a loss to offset capital gains taxes liability. 
                  Short-Term Capital Losses can offset both Short-Term and Long-Term Capital Gains. 
                  Long-Term Capital Losses can typically only offset Long-Term Capital Gains. 
                  Under current simulated policies, a flat tax rate is applied to net taxable gains.
                </p>
              </div>

            </div>
          </div>
        )}

        {/* Tab 3: SQL Database Explorer */}
        {activeTab === 'database' && (
          <div className="space-y-8 animate-fade-in">
            <div className="px-2">
               <h2 className="text-2xl font-black dark:text-white text-slate-900 tracking-tight uppercase">🖥️ SQL Query Workspace</h2>
               <p className="text-slate-500 font-bold text-sm">Query your raw portfolio digital assets table using mock SQLite syntax.</p>
            </div>

            {/* SQL Terminal Console */}
            <div className="bg-[#0b0f19] rounded-[1.5rem] border border-slate-700 overflow-hidden shadow-2xl max-w-5xl">
              <div className="bg-slate-900 px-6 py-4 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-[10px] font-mono text-slate-500 pl-4 uppercase font-bold tracking-widest">SQLite Console - holdings_db</span>
                </div>
                <div className="text-[9px] font-mono text-slate-500">Connected</div>
              </div>

              {/* Console Input Area */}
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <div className="text-slate-400 font-mono text-xs font-bold flex items-center">
                    <span className="text-blue-500 mr-2">&gt;</span> Enter SQL query:
                  </div>
                  <div className="flex gap-4">
                    <input 
                      type="text" 
                      value={sqlQuery}
                      onChange={(e) => setSqlQuery(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') runQuery(sqlQuery); }}
                      className="flex-1 bg-[#060b13] border border-slate-700 rounded-lg p-3 text-sm font-mono text-emerald-400 focus:outline-none focus:border-blue-500"
                    />
                    <button 
                      onClick={() => runQuery(sqlQuery)}
                      className="px-8 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-mono font-bold tracking-wider uppercase transition-colors"
                    >
                      Run
                    </button>
                  </div>
                </div>

                {/* Preset SQL Buttons */}
                <div className="space-y-2">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Preset Queries (Click to Run):</div>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => runQuery("SELECT * FROM holdings WHERE stcg_gain < 0;")}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-[10px] font-mono text-slate-400 hover:text-white rounded-lg border border-slate-800 transition-colors"
                    >
                      Show negative STCG positions
                    </button>
                    <button 
                      onClick={() => runQuery("SELECT * FROM holdings WHERE ltcg_gain < 0;")}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-[10px] font-mono text-slate-400 hover:text-white rounded-lg border border-slate-800 transition-colors"
                    >
                      Show negative LTCG positions
                    </button>
                    <button 
                      onClick={() => runQuery("SELECT coin, totalHolding, currentPrice FROM holdings ORDER BY currentPrice DESC;")}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-[10px] font-mono text-slate-400 hover:text-white rounded-lg border border-slate-800 transition-colors"
                    >
                      List by currentPrice DESC
                    </button>
                    <button 
                      onClick={() => runQuery("SELECT * FROM holdings;")}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-[10px] font-mono text-slate-400 hover:text-white rounded-lg border border-slate-800 transition-colors"
                    >
                      Select all assets
                    </button>
                  </div>
                </div>

                {/* Query Error Console */}
                {queryError && (
                  <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg font-mono text-xs text-red-400">
                    {queryError}
                  </div>
                )}

                {/* Query Results Table */}
                {!queryError && queryResult.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                      Query returned {queryResult.length} rows:
                    </div>
                    <div className="overflow-x-auto border border-slate-800 rounded-lg">
                      <table className="w-full text-left border-collapse font-mono text-xs">
                        <thead>
                          <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
                            {Object.keys(queryResult[0]).map(key => (
                              <th key={key} className="p-3 text-[10px] font-bold uppercase tracking-wider">{key}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {queryResult.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-900/50">
                              {Object.values(row).map((val, valIdx) => (
                                <td key={valIdx} className="p-3 text-slate-300">
                                  {typeof val === 'number' 
                                    ? val % 1 === 0 ? val : val.toFixed(4)
                                    : val.toString()}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;
