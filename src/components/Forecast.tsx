
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Sparkles, TrendingUp, Calendar, Zap, AlertCircle, Loader2, ArrowUpRight, Database } from 'lucide-react';
import { generateForecast } from '@/services/gemini';
import { Booking } from '@/types';

interface ForecastData {
  predictions: Array<{ month: string; predictedRevenue: number; confidence: number }>;
  insights: string[];
  topService: string;
}

interface Props {
  bookings: Booking[];
  isDarkMode?: boolean;
}

const Forecast: React.FC<Props> = ({ bookings, isDarkMode }) => {
  const [data, setData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bookings.length === 0) {
      setLoading(false);
      return;
    }
    const fetchForecast = async () => {
      setLoading(true);
      const result = await generateForecast(bookings);
      if (result) setData(result);
      setLoading(false);
    };
    fetchForecast();
  }, [bookings]);

  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-center">
        <div className={`p-6 rounded-full ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
          <Database size={48} className="text-slate-400" />
        </div>
        <div className="max-w-md">
          <h3 className={`font-bold text-xl mb-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>No Data for Analysis</h3>
          <p className="text-slate-500 text-sm">Please add some bookings first. AI needs at least a few records to identify patterns and generate meaningful forecasts.</p>
        </div>
      </div>
    );
  }

  const chartData = [
    { month: 'Historical', revenue: 0, type: 'actual' },
    ...(data?.predictions.map(p => ({ month: p.month, revenue: p.predictedRevenue, type: 'predicted' })) || [])
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
        <div className="text-center">
          <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Analyzing Agency Patterns</h3>
          <p className="text-slate-500 text-sm">Gemini AI is calculating seasonal trends...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl md:text-3xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            TRENDS & <span className="text-violet-600">FORECAST</span>
          </h2>
          <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-xs font-bold uppercase tracking-widest mt-1`}>AI-powered revenue projections</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 self-start ${isDarkMode ? 'bg-indigo-900/20 border-indigo-800 text-indigo-400' : 'bg-indigo-50 border-indigo-100 text-indigo-700'}`}>
          <Sparkles size={18} />
          <span className="text-[10px] font-black uppercase tracking-widest">Predictive Model Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className={`xl:col-span-2 p-6 md:p-8 rounded-[40px] border-2 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-50 shadow-xl shadow-slate-200/50'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h3 className={`text-sm font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Revenue Projection (3 Months)</h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Seasonal Trend Analysis</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-violet-600"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Actual</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full border-2 border-dashed border-violet-400 bg-transparent"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">AI Predicted</span>
              </div>
            </div>
          </div>
          <div className="h-[250px] md:h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#1e293b" : "#f1f5f9"} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(value) => `৳${value/1000}k`} />
                <Tooltip 
                  contentStyle={{
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    backgroundColor: isDarkMode ? '#1e293b' : '#fff',
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#4f46e5" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  strokeDasharray={(entry: any) => entry.type === 'predicted' ? '5 5' : '0'}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                <Zap size={20} />
              </div>
              <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>High Demand Alert</h3>
            </div>
            <p className="text-sm text-slate-500 mb-4">Highest predicted demand for:</p>
            <div className={`inline-block px-4 py-2 rounded-xl font-bold text-lg mb-4 ${isDarkMode ? 'bg-indigo-900/40 text-indigo-400' : 'bg-indigo-50 text-indigo-700'}`}>
              {data?.topService || 'N/A'}
            </div>
          </div>

          <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                <Calendar size={20} />
              </div>
              <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>AI Key Findings</h3>
            </div>
            <ul className="space-y-4">
              {data?.insights.length ? data.insights.map((insight, i) => (
                <li key={i} className="flex gap-3">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></div>
                  <p className="text-sm text-slate-500 leading-relaxed">{insight}</p>
                </li>
              )) : (
                <li className="text-sm text-slate-400 italic text-center">No insights generated yet.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forecast;
