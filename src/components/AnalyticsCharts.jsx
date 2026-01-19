import React, { useMemo, memo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useGains } from '../context/GainsContext';
import { formatCurrency } from '../utils/format';

const AnalyticsCharts = memo(() => {
  const { taxMetrics } = useGains();
  if (!taxMetrics) return null;

  // Data for Bar Chart: Pre vs Post
  const barData = useMemo(() => [
    {
      name: 'Pre-Harvest',
      STCG: Math.max(0, taxMetrics.current.stcg.net),
      LTCG: Math.max(0, taxMetrics.current.ltcg.net),
    },
    {
      name: 'Post-Harvest',
      STCG: Math.max(0, taxMetrics.projected.stcg.net),
      LTCG: Math.max(0, taxMetrics.projected.ltcg.net),
    }
  ], [taxMetrics]);

  // Data for Pie Chart: STCG vs LTCG Current Distribution
  const pieData = useMemo(() => [
    { name: 'STCG Net Gain', value: Math.max(0, taxMetrics.current.stcg.net) },
    { name: 'LTCG Net Gain', value: Math.max(0, taxMetrics.current.ltcg.net) },
  ].filter(d => d.value > 0), [taxMetrics]);

  const COLORS = ['#3b82f6', '#10b981']; // Blue and Emerald

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 lg:gap-16 mt-16 pb-8">
      {/* Bar Chart Card */}
      <div className="bg-[#0f172a] rounded-[2.5rem] p-10 border border-white/5 shadow-2xl">
        <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-8">Harvest Impact</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#64748b', fontWeight: 700}} axisLine={false} tickLine={false} />
              <YAxis stroke="#64748b" tick={{fill: '#64748b', fontWeight: 700}} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} />
              <RechartsTooltip 
                cursor={{ fill: '#ffffff05' }}
                contentStyle={{ backgroundColor: '#060b13', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', fontWeight: 'bold' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px', fontWeight: 'bold' }} />
              <Bar dataKey="STCG" name="STCG Net Gains" stackId="a" fill="#3b82f6" radius={[0, 0, 8, 8]} />
              <Bar dataKey="LTCG" name="LTCG Net Gains" stackId="a" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart Card */}
      <div className="bg-[#0f172a] rounded-[2.5rem] p-10 border border-white/5 shadow-2xl">
        <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-8">Gain Distribution</h3>
        <div className="h-80 w-full flex items-center justify-center relative">
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#060b13', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', fontWeight: 'bold' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value) => `₹${formatCurrency(value)}`}
                />
                <Legend wrapperStyle={{ paddingTop: '10px', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
             <div className="flex flex-col items-center justify-center opacity-40">
                <p className="font-black uppercase tracking-[0.3em] text-xs">No Positive Net Gains</p>
             </div>
          )}
          
          {/* Center text for donut */}
          {pieData.length > 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-20px]">
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">Total Valid</span>
              <span className="text-2xl font-black text-white tabular-nums tracking-tighter">
                ₹{formatCurrency(pieData.reduce((acc, curr) => acc + curr.value, 0))}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default AnalyticsCharts;
