
import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AgencyStats, Booking, BookingStatus } from '@/types';
import { 
  Banknote, UserCheck, Clock, TrendingUp, ArrowUpRight, 
  Ticket, Bell, PlaneTakeoff, AlertCircle, ChevronRight,
  ShieldAlert, CalendarDays, Zap, Activity, Download, ShieldCheck, Smartphone
} from 'lucide-react';

interface Props {
  stats: AgencyStats;
  bookings: Booking[];
  isDarkMode?: boolean;
}

const Dashboard: React.FC<Props> = ({ stats, bookings, isDarkMode }) => {
  const chartData = bookings.length > 0 ? [
    { name: 'Prev', sales: 0, profit: 0 },
    { name: 'Current', sales: stats.totalSales, profit: stats.netProfit },
  ] : [
    { name: 'Jan', sales: 0, profit: 0 },
    { name: 'Feb', sales: 0, profit: 0 },
    { name: 'Mar', sales: 0, profit: 0 },
    { name: 'Apr', sales: 0, profit: 0 },
    { name: 'May', sales: 0, profit: 0 },
    { name: 'Jun', sales: 0, profit: 0 },
  ];

  const flightAlerts = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(today.getDate() + 7);

    return bookings
      .filter(b => b.type === 'Air Ticket' && b.flyingDate)
      .map(b => ({
        ...b,
        fDate: new Date(b.flyingDate!)
      }))
      .filter(b => b.fDate >= today && b.fDate <= sevenDaysLater)
      .sort((a, b) => a.fDate.getTime() - b.fDate.getTime());
  }, [bookings]);

  const todayFlights = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return bookings.filter(b => b.type.toLowerCase() === 'air ticket' && b.flyingDate === todayStr);
  }, [bookings]);

  const handleExportAudit = () => {
    if (bookings.length === 0) return;
    
    const headers = ["Reference", "Date", "Client", "Type", "Status", "Amount (BDT)", "Cost (BDT)", "Profit (BDT)"];
    const rows = bookings.map(b => [
      b.id.toUpperCase(),
      b.date,
      b.clientName,
      b.type,
      b.status,
      b.amount,
      b.cost,
      b.amount - b.cost
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `audit_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-10">
      {/* Flight Board Style Announcements */}
      {flightAlerts.length > 0 && (
        <section className={`rounded-2xl md:rounded-[32px] overflow-hidden shadow-2xl transition-all ${
          isDarkMode ? 'bg-[#0f172a] border border-slate-800' : 'bg-white border border-slate-100'
        }`}>
          <div className={`px-5 md:px-8 py-4 md:py-5 flex items-center justify-between border-b ${isDarkMode ? 'bg-indigo-600/10 border-slate-800' : 'bg-violet-50 border-violet-100'}`}>
            <div className="flex items-center gap-3 md:gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-violet-600 blur-md opacity-30 animate-pulse-soft"></div>
                <Bell size={20} className="text-violet-600 md:w-6 md:h-6 relative z-10" />
              </div>
              <div>
                <h3 className={`font-black text-xs md:text-lg uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Operational Flight Board
                </h3>
                <p className="text-[8px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest">Real-time Departure Tracking</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
                <div className={`h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-emerald-500 animate-pulse`}></div>
                <span className={`text-[10px] font-black px-2 md:px-4 py-1 rounded-full ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-white text-slate-600 shadow-sm'}`}>
                {flightAlerts.length} <span className="hidden xs:inline">ACTIVE</span> ALERTS
                </span>
            </div>
          </div>
          
          <div className="p-3 md:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {flightAlerts.map(alert => {
              const diffTime = alert.fDate.getTime() - new Date().setHours(0,0,0,0);
              const daysLeft = Math.ceil(diffTime / (1000 * 3600 * 24));
              const isUrgent = daysLeft <= 1;
              const profit = alert.amount - alert.cost;
              
              return (
                <div key={alert.id} className={`p-5 rounded-3xl border-2 transition-all hover:scale-[1.03] group ${
                  isUrgent 
                    ? isDarkMode ? 'bg-rose-500/5 border-rose-500/30' : 'bg-rose-50 border-rose-100'
                    : isDarkMode ? 'bg-slate-800/20 border-slate-700/50' : 'bg-white border-slate-100 shadow-sm'
                }`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${isUrgent ? 'bg-rose-500/20 text-rose-500' : 'bg-violet-500/20 text-violet-500'}`}>
                        <PlaneTakeoff size={16} />
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${isUrgent ? 'text-rose-600 animate-pulse' : 'text-slate-400'}`}>
                        {isUrgent ? 'PRIORITY 01' : 'ON SCHEDULE'}
                      </span>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-black ${isUrgent ? 'bg-rose-600 text-white' : 'bg-violet-600 text-white'}`}>
                      {daysLeft === 0 ? 'BOARDING' : daysLeft === 1 ? 'TOMORROW' : `${daysLeft}d LEFT`}
                    </div>
                  </div>
                  
                  <h4 className={`font-black text-sm truncate mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {alert.clientName}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-500">{alert.from}</span>
                    <div className="flex-1 h-[1px] bg-slate-200 dark:bg-slate-700 relative">
                        <div className="absolute -top-[5px] left-1/2 -translate-x-1/2 text-slate-300">
                            <ChevronRight size={10} />
                        </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-500">{alert.to}</span>
                  </div>

                  <div className="mt-5 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Yield/Profit</p>
                      <p className={`text-xs font-black ${isUrgent ? 'text-rose-600' : 'text-emerald-500'}`}>৳{profit.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Flight Date</p>
                       <p className={`text-xs font-black ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{alert.flyingDate}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Modern KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <StatCard 
          label="Total Revenue" 
          value={`৳${stats.totalSales.toLocaleString()}`} 
          icon={<Banknote />} 
          trend="+12%" 
          gradient="from-violet-600 to-indigo-600"
          isDarkMode={isDarkMode}
        />
        <StatCard 
          label="Agency Profit" 
          value={`৳${stats.netProfit.toLocaleString()}`} 
          icon={<TrendingUp />} 
          trend="+5.4%" 
          gradient="from-emerald-500 to-teal-500"
          isDarkMode={isDarkMode}
        />
        <StatCard 
          label="Flight Volume" 
          value={todayFlights.length.toString()} 
          icon={<Activity />} 
          trend="ACTIVE" 
          gradient="from-amber-500 to-orange-500"
          isDarkMode={isDarkMode}
        />
        <StatCard 
          label="Pending Tasks" 
          value={stats.pendingInvoices.toString()} 
          icon={<Clock />} 
          trend="REVIEW" 
          gradient="from-rose-500 to-pink-500"
          isDarkMode={isDarkMode}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className={`lg:col-span-2 p-5 md:p-8 rounded-2xl md:rounded-[32px] border transition-all ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/50'}`}>
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div>
               <h3 className={`font-black text-base md:text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Revenue Performance</h3>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Financial Analytics Terminal</p>
            </div>
            <div className="flex gap-1 md:gap-2">
                <button className={`px-2 md:px-4 py-1 rounded-xl text-[9px] md:text-[10px] font-black tracking-widest uppercase transition-all ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-50 text-slate-500'}`}>WTD</button>
                <button className="px-2 md:px-4 py-1 rounded-xl text-[9px] md:text-[10px] font-black tracking-widest uppercase vibrant-gradient text-white shadow-lg">MTD</button>
            </div>
          </div>
          <div className="h-[250px] md:h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#1e293b" : "#f1f5f9"} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <Tooltip 
                  contentStyle={{
                    borderRadius: '20px', 
                    border: 'none', 
                    boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
                    backgroundColor: isDarkMode ? '#1e293b' : '#fff',
                    color: isDarkMode ? '#f8fafc' : '#1e293b',
                    padding: '15px'
                  }}
                  itemStyle={{color: '#7c3aed', fontWeight: 800}}
                />
                <Area type="monotone" dataKey="sales" stroke="#7c3aed" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`p-6 md:p-8 rounded-2xl md:rounded-[32px] border transition-all ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/50'}`}>
          <div className="mb-6 md:mb-8">
            <h3 className={`font-black text-base md:text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Operations Log</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Service Pipeline</p>
          </div>
          <div className="space-y-4">
            {bookings.length > 0 ? bookings.slice(0, 5).map((booking) => (
              <div key={booking.id} className={`flex items-center gap-4 p-4 rounded-3xl transition-all cursor-pointer group ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-violet-50'}`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isDarkMode ? 'bg-slate-800 group-hover:bg-violet-600 text-slate-400 group-hover:text-white' : 'bg-slate-50 group-hover:bg-violet-600 text-slate-400 group-hover:text-white'}`}>
                  <Ticket size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-black truncate ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{booking.clientName}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{booking.type} • {booking.date}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-black ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>৳{booking.amount.toLocaleString()}</p>
                  <StatusBadge status={booking.status} isDarkMode={isDarkMode} />
                </div>
              </div>
            )) : (
              <div className="py-20 text-center opacity-40">
                <ShieldAlert className="mx-auto text-slate-300 mb-4" size={48} />
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest">No Active Records</p>
              </div>
            )}
          </div>
          <button 
            onClick={handleExportAudit}
            className={`w-full mt-8 py-4 text-[10px] tracking-widest font-black uppercase rounded-2xl transition-all ${
            isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-violet-50 text-violet-700 hover:bg-violet-100'
          }`}>
            EXPORT AUDIT REPORT
          </button>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, trend, gradient, isDarkMode }: any) => (
  <div className={`p-4 md:p-8 rounded-2xl md:rounded-[32px] border transition-all hover:scale-[1.05] duration-500 ${isDarkMode ? 'bg-[#0f172a] border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900 shadow-xl shadow-slate-200/40'} relative overflow-hidden group`}>
    <div className={`absolute top-0 right-0 w-24 md:w-32 h-24 md:h-32 bg-gradient-to-br ${gradient} opacity-[0.03] -mr-12 -mt-12 md:-mr-16 md:-mt-16 rounded-full group-hover:scale-150 transition-all duration-700`}></div>
    
    <div className="flex items-start justify-between mb-4 md:mb-6 relative z-10">
      <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg transition-transform group-hover:rotate-6`}>
        {React.cloneElement(icon, { size: isMobileWindow() ? 18 : 24 })}
      </div>
      <div className={`px-2 md:px-3 py-1 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest border ${
        trend === 'ACTIVE' || trend === 'REVIEW' ? 'border-amber-500/30 text-amber-500 bg-amber-500/5' : 'border-emerald-500/30 text-emerald-500 bg-emerald-500/5'
      }`}>
        {trend}
      </div>
    </div>
    <div className="relative z-10">
        <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-1`}>{label}</p>
        <h4 className="text-xl md:text-3xl font-black tracking-tighter">{value}</h4>
    </div>
  </div>
);

const isMobileWindow = () => typeof window !== 'undefined' && window.innerWidth < 768;

const StatusBadge = ({ status, isDarkMode }: { status: BookingStatus, isDarkMode?: boolean }) => {
  const styles = {
    [BookingStatus.CONFIRMED]: isDarkMode ? 'bg-emerald-500/10 text-emerald-500' : 'bg-emerald-50 text-emerald-600',
    [BookingStatus.PENDING]: isDarkMode ? 'bg-amber-500/10 text-amber-500' : 'bg-amber-50 text-amber-600',
    [BookingStatus.CANCELLED]: isDarkMode ? 'bg-rose-500/10 text-rose-500' : 'bg-rose-50 text-rose-600',
  };
  return (
    <span className={`text-[9px] px-2 py-0.5 rounded-lg font-black uppercase tracking-tighter ${styles[status]}`}>
      {status}
    </span>
  );
};

export default Dashboard;
