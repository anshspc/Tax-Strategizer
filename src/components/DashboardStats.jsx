import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../utils/format';

// Common sub-component for the STCG/LTCG rows
const TaxInfoBlock = ({ label, data, highlight = false }) => {
  const isLoss = data.net < 0;
  
  return (
    <div className={`p-6 rounded-2xl transition-all border ${
      highlight 
        ? 'bg-blue-500/5 border-blue-500/10' 
        : 'bg-[#1e293b]/30 border-white/5'
    }`}>
      <div className={`text-[10px] font-black uppercase tracking-[0.2em] mb-5 ${highlight ? 'text-blue-400' : 'text-slate-500'}`}>
        {label}
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-center text-sm">
          <span className={highlight ? 'text-slate-300' : 'text-slate-400 font-medium'}>Profits</span>
          <span className={`${highlight ? 'text-emerald-400' : 'text-emerald-400'} font-bold tabular-nums`}>
            ₹{formatCurrency(data.profits)}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className={highlight ? 'text-slate-300' : 'text-slate-400 font-medium'}>Losses</span>
          <span className={`${highlight ? 'text-rose-400' : 'text-rose-400'} font-bold tabular-nums`}>
            ₹{formatCurrency(data.losses)}
          </span>
        </div>
        <div className={`w-full h-px ${highlight ? 'bg-blue-500/10' : 'bg-white/5'} my-1`}></div>
        <div className="flex justify-between items-center text-sm pt-1">
          <span className={`text-[11px] font-black uppercase tracking-tight ${highlight ? 'text-blue-300' : 'text-slate-300'}`}>Net {label}</span>
          <span className={`font-black tabular-nums ${isLoss ? (highlight ? 'text-rose-400' : 'text-rose-400') : (highlight ? 'text-emerald-400' : 'text-emerald-400')}`}>
            ₹{formatCurrency(data.net)}
          </span>
        </div>
      </div>
    </div>
  );
};

const DashboardStats = memo(({ title, total, stcg, ltcg, theme = 'dark', loading = false }) => {
  const isBlue = theme === 'blue';
  
  if (loading) {
    return (
      <div className={`p-10 rounded-[2.5rem] border ${isBlue ? 'bg-slate-900 border-blue-500/20' : 'bg-[#0f172a] border-white/5'} animate-pulse h-[420px] flex flex-col space-y-8 shadow-2xl`}>
        <div className="space-y-4">
          <div className="h-3 w-32 rounded-full bg-slate-800/50"></div>
          <div className="h-14 w-64 rounded-2xl bg-slate-800/50"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="h-44 rounded-2xl bg-slate-800/50"></div>
          <div className="h-44 rounded-2xl bg-slate-800/50"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
      className={`p-10 rounded-[2.5rem] border transition-all duration-700 hover:-translate-y-2 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] group ${
      isBlue 
        ? 'bg-gradient-to-br from-blue-950/40 via-[#0f172a] to-slate-950 border-blue-500/30 text-white shadow-[0_20px_50px_rgba(59,130,246,0.15)] relative overflow-hidden hover:border-blue-500/60' 
        : 'metric-card-premium text-white'
    }`}>
      {/* Glow effect for the blue card */}
      {isBlue && (
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] -mr-32 -mt-32 rounded-full pointer-events-none"></div>
      )}
      
      <div className="flex flex-col space-y-8 relative z-10">
        <div>
          <h3 className={`text-[11px] font-black uppercase tracking-[0.3em] mb-2 ${isBlue ? 'text-blue-400' : 'text-blue-400'}`}>
            {title}
          </h3>
          <div className="flex items-baseline space-x-3">
            <span className="text-5xl md:text-6xl font-black tracking-tighter tabular-nums leading-none">
              ₹{formatCurrency(total)}
            </span>
            <span className={`text-[10px] font-black ${isBlue ? 'text-blue-300/80' : 'text-slate-500'} uppercase tracking-[0.2em]`}>
              REALISED
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TaxInfoBlock label="Short Term" data={stcg} highlight={isBlue} />
          <TaxInfoBlock label="Long Term" data={ltcg} highlight={isBlue} />
        </div>
      </div>
    </motion.div>
  );
});

export default DashboardStats;
