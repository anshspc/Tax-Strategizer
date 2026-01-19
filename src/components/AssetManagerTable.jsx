import React, { memo, useState, useMemo } from 'react';
import { useGains } from '../context/GainsContext';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency, formatCrypto } from '../utils/format';

const SkeletonRow = memo(() => (
  <tr className="animate-pulse">
    <td className="p-8"><div className="h-5 w-5 bg-slate-800 rounded-lg mx-auto"></div></td>
    <td className="p-8">
      <div className="flex items-center space-x-5">
        <div className="w-12 h-12 bg-slate-800 rounded-2xl"></div>
        <div className="space-y-3">
          <div className="h-5 w-32 bg-slate-800 rounded-lg"></div>
          <div className="h-3 w-16 bg-slate-800 rounded-lg"></div>
        </div>
      </div>
    </td>
    <td className="p-8 space-y-3 text-right"><div className="h-5 w-24 bg-slate-800 rounded-lg ml-auto"></div><div className="h-3 w-20 bg-slate-800 rounded-lg ml-auto"></div></td>
    <td className="p-8 space-y-3 text-right"><div className="h-5 w-24 bg-slate-800 rounded-lg ml-auto"></div><div className="h-3 w-20 bg-slate-800 rounded-lg ml-auto"></div></td>
    <td className="p-8 space-y-3 text-right"><div className="h-5 w-24 bg-slate-800 rounded-lg ml-auto"></div><div className="h-3 w-20 bg-slate-800 rounded-lg ml-auto"></div></td>
    <td className="p-8 text-right"><div className="h-11 w-24 bg-slate-800 rounded-2xl ml-auto"></div></td>
  </tr>
));

const AssetManagerTable = memo(() => {
  const { 
    assets = [], 
    selectedIds = [], 
    toggleSelection: onToggle, 
    selectAll: onBatchSelect, 
    clearAll: onBatchClear, 
    loading: isLoading 
  } = useGains();
  const [showAll, setShowAll] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [sortBy, setSortBy] = useState('HighestGain');
  
  // Using 3 as the default visible count to keep the UI clean
  const PAGE_SIZE = 3;

  const filteredAssets = useMemo(() => {
    let list = [...assets];
    
    // Quick search filter
    if (query) {
      list = list.filter(a => 
        a.coinName.toLowerCase().includes(query.toLowerCase()) || 
        a.coin.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Advanced filters
    if (filter === 'Profit') {
      list = list.filter(a => ((a.stcg?.gain || 0) + (a.ltcg?.gain || 0)) > 0);
    } else if (filter === 'Loss') {
      list = list.filter(a => ((a.stcg?.gain || 0) + (a.ltcg?.gain || 0)) < 0);
    } else if (filter === 'STCG') {
      list = list.filter(a => (a.stcg?.gain || 0) !== 0 || (a.stcg?.balance || 0) > 0);
    } else if (filter === 'LTCG') {
      list = list.filter(a => (a.ltcg?.gain || 0) !== 0 || (a.ltcg?.balance || 0) > 0);
    }

    // Dynamic Sorting
    list.sort((a, b) => {
      if (sortBy === 'HighestGain') {
        const aNet = (a.stcg?.gain || 0) + (a.ltcg?.gain || 0);
        const bNet = (b.stcg?.gain || 0) + (b.ltcg?.gain || 0);
        return bNet - aNet;
      } else if (sortBy === 'HighestLoss') {
        const aNet = (a.stcg?.gain || 0) + (a.ltcg?.gain || 0);
        const bNet = (b.stcg?.gain || 0) + (b.ltcg?.gain || 0);
        return aNet - bNet;
      } else if (sortBy === 'Price') {
        return (b.currentPrice || 0) - (a.currentPrice || 0);
      }
      return 0;
    });

    return list;
  }, [assets, query, filter, sortBy]);

  const displayedItems = useMemo(() => showAll ? filteredAssets : filteredAssets.slice(0, PAGE_SIZE), [showAll, filteredAssets]);
  const hasExtra = useMemo(() => filteredAssets.length > PAGE_SIZE, [filteredAssets]);
  const isFullySelected = useMemo(() => filteredAssets.length > 0 && selectedIds.length >= filteredAssets.length, [filteredAssets, selectedIds]);

  return (
    <div className="space-y-8">
      {/* Table Controls */}
      <div className="flex flex-col lg:flex-row gap-6 justify-between items-center px-2">
        <div className="relative w-full lg:w-[450px] group">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input 
            type="text" 
            placeholder="Search assets..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="block w-full pl-14 pr-12 py-4 bg-[#0f172a]/40 border border-[#334155] rounded-3xl text-sm font-bold text-white placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-xl"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="absolute inset-y-0 right-0 pr-6 flex items-center text-slate-500 hover:text-white"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-3 bg-white/5 px-4 py-3 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest hidden sm:inline">Filter:</span>
             <select 
               value={filter} 
               onChange={(e) => setFilter(e.target.value)}
               className="bg-transparent text-[11px] uppercase tracking-widest font-bold text-white focus:outline-none cursor-pointer"
             >
               <option className="bg-[#0f172a] text-xs normal-case" value="All">All Assets</option>
               <option className="bg-[#0f172a] text-xs normal-case" value="Profit">Net Profit</option>
               <option className="bg-[#0f172a] text-xs normal-case" value="Loss">Net Loss</option>
               <option className="bg-[#0f172a] text-xs normal-case" value="STCG">STCG Exposure</option>
               <option className="bg-[#0f172a] text-xs normal-case" value="LTCG">LTCG Exposure</option>
             </select>
          </div>
          <div className="flex items-center space-x-3 bg-white/5 px-4 py-3 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest hidden sm:inline">Sort:</span>
             <select 
               value={sortBy} 
               onChange={(e) => setSortBy(e.target.value)}
               className="bg-transparent text-[11px] uppercase tracking-widest font-bold text-white focus:outline-none cursor-pointer"
             >
               <option className="bg-[#0f172a] text-xs normal-case" value="HighestGain">Highest Gain</option>
               <option className="bg-[#0f172a] text-xs normal-case" value="HighestLoss">Highest Loss</option>
               <option className="bg-[#0f172a] text-xs normal-case" value="Price">Market Price</option>
             </select>
          </div>
        </div>
      </div>

      <div className="bg-[#0f172a] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-white/[0.01] border-b border-white/5">
                <th className="p-8 w-20 text-center">
                  <input 
                    type="checkbox" 
                    checked={!isLoading && filteredAssets.length > 0 && selectedIds.length >= filteredAssets.length}
                    onChange={isFullySelected ? onBatchClear : onBatchSelect}
                    disabled={isLoading || filteredAssets.length === 0}
                    className="w-6 h-6 rounded-lg border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:opacity-20"
                  />
                </th>
                <th className="p-8 text-[11px] font-black text-slate-500 uppercase tracking-widest">Asset</th>
                <th className="p-8 text-[11px] font-black text-slate-500 uppercase tracking-widest text-right">Balance Info</th>
                <th className="p-8 text-[11px] font-black text-slate-500 uppercase tracking-widest text-right">Market Price</th>
                <th className="p-8 text-[11px] font-black text-slate-500 uppercase tracking-widest text-right">STCG</th>
                <th className="p-8 text-[11px] font-black text-slate-500 uppercase tracking-widest text-right">LTCG</th>
                <th className="p-8 text-[11px] font-black text-slate-500 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.025]">
              {isLoading ? (
                Array(3).fill(0).map((_, i) => <SkeletonRow key={i} />)
              ) : filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-24 text-center">
                    <div className="flex flex-col items-center space-y-4 opacity-40">
                       <svg className="w-16 h-16 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                       </svg>
                       <p className="font-black uppercase tracking-[0.3em] text-xs">No assets found for "{query}"</p>
                    </div>
                  </td>
                </tr>
              ) : (
                displayedItems.map((asset) => {
                  const id = asset.coin;
                  const isChecked = selectedIds.includes(id);
                  const st = asset.stcg?.gain || 0;
                  const lt = asset.ltcg?.gain || 0;
                  
                  // Logic for tax harvesting opportunity
                  const isHarvestable = (st < 0 || lt < 0) && (st + lt <= 0);

                  return (
                    <motion.tr 
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      key={id} 
                      className={`group transition-all duration-300 cursor-pointer relative hover:z-10 hover:shadow-2xl hover:-translate-y-1 ${
                        isChecked 
                          ? 'bg-blue-600/[0.12] border-l-[6px] border-blue-500' 
                          : isHarvestable 
                            ? 'bg-amber-500/[0.03] hover:bg-amber-500/[0.06] border-l-[6px] border-amber-500/30' 
                            : 'hover:bg-white/[0.015] border-l-[6px] border-transparent'
                      }`}
                      onClick={() => onToggle(id)}
                    >
                      <td className="p-8 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col items-center space-y-2">
                          <input 
                            type="checkbox" 
                            checked={isChecked}
                            onChange={() => onToggle(id)}
                            className={`w-6 h-6 rounded-lg border-slate-700 bg-slate-800 focus:ring-2 cursor-pointer transition-all ${
                              isHarvestable && !isChecked ? 'ring-2 ring-amber-500/50' : ''
                            } ${isChecked ? 'text-blue-600' : 'text-slate-600'}`}
                          />
                          {isHarvestable && !isChecked && (
                            <span className="text-[7px] font-black text-amber-500 uppercase tracking-tighter animate-pulse">Optimize</span>
                          )}
                        </div>
                      </td>

                      <td className="p-8">
                        <div className="flex items-center space-x-5">
                          <div className="relative">
                            <img 
                              src={asset.logo} 
                              alt={asset.coinName} 
                              className="w-12 h-12 rounded-2xl bg-white/5 p-1.5 border border-white/10 group-hover:scale-110 transition-transform duration-500" 
                              onError={(e) => { e.target.src = 'https://via.placeholder.com/48?text=' + id[0] }}
                            />
                            {isHarvestable && (
                              <div className="absolute -top-2 -right-2 bg-amber-500 text-[#060b13] w-5 h-5 rounded-full flex items-center justify-center shadow-lg border-2 border-[#0f172a]">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center space-x-3">
                              <span className="font-black text-white text-lg tracking-tight leading-tight">{asset.coinName}</span>
                              {isHarvestable && (
                                <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[8px] font-black uppercase rounded-md tracking-widest flex items-center">
                                   TAX OPPORTUNITY
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{id}</div>
                          </div>
                        </div>
                      </td>

                      <td className="p-8 text-right">
                        <div className="font-bold text-white text-sm tabular-nums mb-1">{formatCrypto(asset.totalHolding)} <span className="text-slate-400 text-[10px] ml-1 uppercase">{id}</span></div>
                        <div className="text-[10px] font-black text-slate-500 tracking-widest">AVG ₹{formatCurrency(asset.averageBuyPrice)}</div>
                      </td>

                      <td className="p-8 text-right">
                        <div className="font-black text-white text-base tabular-nums mb-1">₹{formatCurrency(asset.currentPrice)}</div>
                        <div className="text-[10px] font-black text-blue-400 uppercase bg-blue-500/10 px-2 py-0.5 rounded inline-block">Live</div>
                      </td>

                      <td className="p-8 text-right">
                        <div className={`font-black text-sm tabular-nums mb-1 ${st > 0 ? 'text-emerald-400' : st < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                          {st > 0 ? '+' : ''}₹{formatCurrency(st)}
                        </div>
                        <div className="text-[10px] font-black text-slate-500 tracking-widest">BAL {formatCrypto(asset.stcg?.balance)}</div>
                      </td>

                      <td className="p-8 text-right">
                         <div className={`font-black text-sm tabular-nums mb-1 ${lt > 0 ? 'text-emerald-400' : lt < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                          {lt > 0 ? '+' : ''}₹{formatCurrency(lt)}
                        </div>
                        <div className="text-[10px] font-black text-slate-500 tracking-widest">BAL {formatCrypto(asset.ltcg?.balance)}</div>
                      </td>

                      <td className="p-8 text-right">
                        <div className={`px-5 py-2.5 rounded-2xl text-[10px] font-black tracking-widest transition-all duration-300 ${
                          isChecked ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/5 text-slate-600'
                        }`}>
                          {isChecked ? formatCrypto(asset.totalHolding) : 'Hold'}
                        </div>
                      </td>
                    </motion.tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        
        {!isLoading && hasExtra && (
          <div className="p-8 bg-white/[0.01] border-t border-white/5 flex justify-center">
            <button 
              onClick={() => setShowAll(!showAll)}
              className="px-10 py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-[10px] font-black text-slate-400 hover:text-white transition-all uppercase tracking-[0.2em]"
            >
              {showAll ? 'Collapse List' : `Full Portfolio (${filteredAssets.length})`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

export default AssetManagerTable;
