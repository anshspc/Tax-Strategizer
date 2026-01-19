import React, { memo } from 'react';

const GainsCard = memo(({ title, totalRealised, stcg, ltcg, type = 'dark', isLoading = false }) => {
  const isBlue = type === 'blue';
  
  if (isLoading) {
    return (
      <div className={`p-10 rounded-[2.5rem] border ${
        isBlue ? 'bg-blue-600 border-blue-400' : 'bg-[#0f172a] border-white/5'
      } animate-pulse h-[420px] flex flex-col space-y-8 shadow-2xl`}>
        <div className="space-y-4">
          <div className={`h-3 w-32 rounded-full ${isBlue ? 'bg-white/20' : 'bg-slate-800'}`}></div>
          <div className={`h-14 w-64 rounded-2xl ${isBlue ? 'bg-white/20' : 'bg-slate-800'}`}></div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className={`h-44 rounded-2xl ${isBlue ? 'bg-white/20' : 'bg-slate-800'}`}></div>
          <div className={`h-44 rounded-2xl ${isBlue ? 'bg-white/20' : 'bg-slate-800'}`}></div>
        </div>
      </div>
    );
  }

  const Section = ({ label, data }) => (
    <div className={`p-6 rounded-2xl ${isBlue ? 'bg-white/10' : 'bg-[#1e293b]/30'} border ${isBlue ? 'border-white/10' : 'border-white/5'} transition-all duration-300 hover:bg-opacity-50`}>
      <div className={`text-[10px] font-black uppercase tracking-[0.2em] mb-5 ${isBlue ? 'text-white/60' : 'text-slate-500'}`}>
        {label}
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-center text-sm">
          <span className={isBlue ? 'text-white/80' : 'text-slate-400 font-medium'}>Profits</span>
          <span className={`${isBlue ? 'text-white' : 'text-emerald-400'} font-bold tabular-nums`}>
            ₹{data.profits.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className={isBlue ? 'text-white/80' : 'text-slate-400 font-medium'}>Losses</span>
          <span className={`${isBlue ? 'text-white/90' : 'text-rose-400'} font-bold tabular-nums`}>
            ₹{data.losses.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className={`w-full h-px ${isBlue ? 'bg-white/10' : 'bg-white/5'} my-1`}></div>
        <div className="flex justify-between items-center text-sm pt-1">
          <span className={`text-[11px] font-black uppercase tracking-tight ${isBlue ? 'text-white' : 'text-slate-300'}`}>Net {label}</span>
          <span className={`font-black tabular-nums ${data.net >= 0 ? (isBlue ? 'text-white' : 'text-emerald-400') : (isBlue ? 'text-white/90' : 'text-rose-400')}`}>
            ₹{data.net.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`p-10 rounded-[2.5rem] border transition-all duration-700 hover:translate-y-[-4px] group ${
      isBlue 
        ? 'bg-blue-600 border-blue-400 text-white shadow-[0_20px_50px_rgba(37,99,235,0.3)] relative overflow-hidden' 
        : 'bg-[#0f172a] border-white/5 text-white shadow-2xl'
    }`}>
      {isBlue && (
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[100px] -mr-32 -mt-32 rounded-full pointer-events-none"></div>
      )}
      
      <div className="flex flex-col space-y-8 relative z-10">
        <div>
          <h3 className={`text-[11px] font-black uppercase tracking-[0.3em] mb-2 ${isBlue ? 'text-white/60' : 'text-indigo-400'}`}>
            {title}
          </h3>
          <div className="flex items-baseline space-x-3">
            <span className="text-6xl font-black tracking-tighter tabular-nums">
              ₹{totalRealised.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className={`text-[10px] font-black ${isBlue ? 'text-white/70' : 'text-slate-500'} uppercase tracking-[0.2em]`}>
              TOTAL REALISED
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Section label="Short Term" data={stcg} />
          <Section label="Long Term" data={ltcg} />
        </div>
      </div>
    </div>
  );
});

export default GainsCard;
