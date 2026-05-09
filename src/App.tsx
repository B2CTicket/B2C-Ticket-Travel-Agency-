
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Ticket, 
  Receipt, 
  Users, 
  Settings, 
  Plus, 
  TrendingUp, 
  Banknote, 
  MessageSquareText,
  Search,
  ChevronRight,
  Menu,
  X,
  Sun,
  Moon,
  BarChart3,
  DownloadCloud,
  Plane,
  FileText,
  History
} from 'lucide-react';
import { Booking, BookingStatus, Transaction, TransactionType, Client } from '@/types';
import Dashboard from '@/components/Dashboard';
import BookingList from '@/components/BookingList';
import TransactionList from '@/components/TransactionList';
import ClientList from '@/components/ClientList';
import AIChat from '@/components/AIChat';
import Forecast from '@/components/Forecast';
import InvoiceList from '@/components/InvoiceList';
import StatementView from '@/components/StatementView';

const App: React.FC = () => {
  console.log("App component initializing...");
  const [activeTab, setActiveTab] = useState<'dashboard' | 'bookings' | 'accounts' | 'ai' | 'clients' | 'forecast' | 'invoices' | 'statements'>('dashboard');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('darkMode');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    let lastWidth = window.innerWidth;
    const handleResize = () => {
      const width = window.innerWidth;
      const isNowMobile = width < 1024;
      const wasMobile = lastWidth < 1024;
      
      if (isNowMobile !== wasMobile) {
        setIsMobile(isNowMobile);
        setSidebarOpen(!isNowMobile);
      }
      lastWidth = width;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    } catch (e) {
      console.warn("Storage blocked", e);
    }
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#020617';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#f8faff';
    }

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, [isDarkMode]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };
  
  const [clients, setClients] = useState<Client[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const stats = useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);

    const netProfit = totalIncome - totalExpense;
    const pendingCount = bookings.filter(b => b.status === BookingStatus.PENDING).length;

    return { 
      totalSales: totalIncome, 
      totalCost: totalExpense, 
      netProfit: netProfit, 
      pendingInvoices: pendingCount 
    };
  }, [transactions, bookings]);

  const addBooking = (newBooking: Omit<Booking, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setBookings(prev => [...prev, { ...newBooking, id }]);
    
    const transId = 't' + Math.random().toString(36).substr(2, 5);
    setTransactions(prev => [...prev, {
      id: transId,
      date: new Date().toISOString().split('T')[0],
      category: `${newBooking.type} Sale`,
      amount: newBooking.amount,
      type: TransactionType.INCOME,
      bookingId: id,
      reference: `BOOKING-${id}`
    }]);
  };

  const addTransaction = (newTransaction: Omit<Transaction, 'id'>) => {
    const id = 't' + Math.random().toString(36).substr(2, 7);
    setTransactions(prev => [ { ...newTransaction, id }, ...prev ]);
  };

  const addClient = (newClient: Omit<Client, 'id' | 'createdAt'>) => {
    const id = 'c' + Math.random().toString(36).substr(2, 9);
    setClients(prev => [...prev, { ...newClient, id, createdAt: new Date().toISOString() }]);
  };

  const updateClient = (updatedClient: Client) => {
    setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
    setBookings(prev => prev.map(b => b.clientId === updatedClient.id ? { ...b, clientName: updatedClient.name } : b));
  };

  const navigateToStatement = (clientId: string) => {
    setSelectedClientId(clientId);
    setActiveTab('statements');
    if (isMobile) setSidebarOpen(false);
  };

  const menuItems = [
    { id: 'dashboard', icon: <LayoutDashboard />, label: "DASHBOARD" },
    { id: 'bookings', icon: <Ticket />, label: "ACTIVE BOOKINGS" },
    { id: 'clients', icon: <Users />, label: "CLIENT BASE" },
    { id: 'accounts', icon: <Banknote />, label: "FINANCIALS" },
    { id: 'statements', icon: <History />, label: "STATEMENTS" },
    { id: 'invoices', icon: <FileText />, label: "INVOICES" },
    { id: 'forecast', icon: <BarChart3 />, label: "AI FORECAST" },
    { id: 'ai', icon: <MessageSquareText />, label: "GEMINI AI" },
  ];

  return (
    <div className={`flex h-screen overflow-hidden font-sans transition-all duration-500 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#f8faff] text-slate-900'}`}>
      
      {/* Sidebar Overlay for Mobile */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] transition-all animate-in fade-in duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Unique Sidebar with Gradient & Blur */}
      <aside className={`
        ${isMobile ? 'fixed inset-y-0 left-0 z-[70]' : 'relative'}
        ${isMobile 
          ? isSidebarOpen ? 'w-80 translate-x-0 shadow-2xl' : 'w-80 -translate-x-full'
          : isSidebarOpen ? 'w-72 translate-x-0' : 'w-24'
        }
        ${isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-100'} 
        border-r transition-all duration-500 flex flex-col group
      `}>
        <div className={`flex items-center shrink-0 transition-all duration-500 ${!isSidebarOpen && !isMobile ? 'p-6 justify-center' : 'p-8 justify-between gap-4'}`}>
          <div className="flex items-center gap-4">
            <div className={`vibrant-gradient rounded-2xl vibrant-glow shrink-0 transition-all duration-500 ${!isSidebarOpen && !isMobile ? 'p-3' : 'p-2.5'}`}>
              <Plane className="text-white w-6 h-6 rotate-45" />
            </div>
            {(isSidebarOpen || isMobile) && (
              <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                <h1 className={`font-black text-lg tracking-tighter transition-colors ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                  B2C <span className="text-violet-600">TICKET</span>
                </h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest -mt-1">ACCOUNTINGS</p>
              </div>
            )}
          </div>
          {isMobile && isSidebarOpen && (
            <button 
              onClick={() => setSidebarOpen(false)}
              className={`p-2 rounded-xl border ${isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'}`}
            >
              <X size={18} />
            </button>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto no-scrollbar">
          {menuItems.map(item => (
            <NavItem 
              key={item.id}
              icon={item.icon} 
              label={item.label} 
              active={activeTab === item.id} 
              onClick={() => {
                if (item.id === 'install') {
                  if (deferredPrompt) {
                    handleInstallClick();
                  } else {
                    alert("To install the app, use your browser's 'Add to Home Screen' option.");
                  }
                  return;
                }
                setActiveTab(item.id as any);
                if (isMobile) setSidebarOpen(false);
              }} 
              collapsed={!isSidebarOpen && !isMobile} 
              isDarkMode={isDarkMode} 
            />
          ))}
        </nav>

        <div className={`border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-50'} shrink-0 transition-all duration-500 ${!isSidebarOpen && !isMobile ? 'p-3' : 'p-6'} space-y-4`}>
           {/* Install App Button */}
           <button 
             onClick={handleInstallClick}
             className={`w-full flex items-center gap-3 transition-all duration-300 rounded-2xl ${
               !isSidebarOpen && !isMobile ? 'justify-center p-2' : 'p-3'
             } ${isDarkMode ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'bg-indigo-50 text-indigo-700 border border-indigo-100'} hover:scale-[1.02] active:scale-95`}
           >
             <div className="shrink-0 p-1 bg-indigo-600 text-white rounded-lg shadow-lg">
               <DownloadCloud size={16} />
             </div>
             {(isSidebarOpen || isMobile) && (
               <div className="text-left animate-in fade-in slide-in-from-left-2 duration-300">
                 <p className="text-[10px] font-black uppercase tracking-widest leading-none">Download</p>
                 <p className="text-[8px] font-bold opacity-60 uppercase tracking-tighter mt-0.5">Desktop & Mobile</p>
               </div>
             )}
           </button>

           <div className={`flex items-center rounded-2xl transition-all duration-500 ${isDarkMode ? 'bg-slate-800/60' : 'bg-slate-50'} ${!isSidebarOpen && !isMobile ? 'justify-center p-1.5' : 'gap-3 px-3 py-2.5'}`}>
             <button 
              onClick={() => setIsDarkMode(!isDarkMode)} 
              className={`p-2 rounded-xl transition-all duration-300 ${isDarkMode ? 'bg-amber-500/20 text-amber-500 hover:bg-amber-500/30' : 'bg-violet-600 text-white shadow-md hover:shadow-lg'}`}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
               {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
             </button>
             {(isSidebarOpen || isMobile) && <span className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">{isDarkMode ? 'Light' : 'Dark'} Mode</span>}
           </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Subtle Background Accent */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>
        
        <header className={`h-20 ${isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-white/90 border-slate-100'} backdrop-blur-xl border-b flex items-center justify-between px-4 md:px-8 shrink-0 z-30 transition-all sticky top-0`}>
          <div className="flex items-center gap-2 md:gap-4 flex-1">
             <button 
                onClick={() => setSidebarOpen(!isSidebarOpen)} 
                className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'}`}
                aria-label="Toggle Sidebar"
             >
                <Menu size={22} />
             </button>
             <div className="relative w-full max-w-sm hidden lg:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Quick search itinerary..." 
                className={`w-full pl-11 pr-4 py-2.5 text-sm font-medium border transparent outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all rounded-xl ${
                  isDarkMode ? 'bg-slate-900 text-slate-100 border-slate-800' : 'bg-slate-100/50 text-slate-900 border-transparent hover:bg-slate-100'
                }`} 
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3 md:gap-5">
            <button 
              onClick={() => {
                setActiveTab('bookings');
                if (isMobile) setSidebarOpen(false);
              }} 
              className="vibrant-gradient text-white px-4 md:px-6 py-2.5 rounded-xl flex items-center gap-2 hover:shadow-indigo-500/30 active:scale-95 transition-all text-[11px] md:text-sm font-bold shadow-lg shadow-indigo-500/20 shrink-0"
            >
              <Plus size={18} className="shrink-0" />
              <span className="hidden sm:block">NEW ENTRY</span>
              <span className="sm:hidden">ADD</span>
            </button>
            <div className={`h-8 w-px ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'} hidden sm:block`}></div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right hidden md:block">
                <p className={`text-xs font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Admin Terminal</p>
                <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest mt-0.5">Global Access</p>
              </div>
              <div className="w-10 h-10 rounded-xl vibrant-gradient p-[1.5px] shadow-lg group cursor-pointer">
                <div className={`w-full h-full rounded-[10px] overflow-hidden border ${isDarkMode ? 'border-slate-950' : 'border-white'} transition-transform group-hover:scale-95`}>
                  <img src="https://picsum.photos/80/80?random=1" alt="Avatar" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar scroll-smooth">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && <Dashboard stats={stats} bookings={bookings} isDarkMode={isDarkMode} />}
            {activeTab === 'clients' && <ClientList clients={clients} bookings={bookings} onAdd={addClient} onUpdate={updateClient} onNavigateToStatement={navigateToStatement} isDarkMode={isDarkMode} />}
            {activeTab === 'bookings' && <BookingList bookings={bookings} clients={clients} onAdd={addBooking} isDarkMode={isDarkMode} />}
            {activeTab === 'invoices' && <InvoiceList bookings={bookings} clients={clients} isDarkMode={isDarkMode} />}
            {activeTab === 'statements' && <StatementView clients={clients} bookings={bookings} transactions={transactions} defaultClientId={selectedClientId} isDarkMode={isDarkMode} />}
            {activeTab === 'forecast' && <Forecast bookings={bookings} isDarkMode={isDarkMode} />}
            {activeTab === 'accounts' && <TransactionList transactions={transactions} stats={stats} onAddTransaction={addTransaction} isDarkMode={isDarkMode} />}
            {activeTab === 'ai' && <AIChat bookings={bookings} transactions={transactions} isDarkMode={isDarkMode} />}
          </div>
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick, collapsed, isDarkMode }: any) => (
  <button 
    onClick={onClick} 
    className={`
      w-full flex items-center rounded-2xl transition-all duration-300 group relative
      ${collapsed ? 'justify-center p-3.5' : 'gap-4 px-4 py-3.5'}
      ${active 
        ? 'vibrant-gradient text-white shadow-xl shadow-violet-500/20' 
        : isDarkMode 
          ? 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-200' 
          : 'text-slate-500 hover:bg-violet-50 hover:text-violet-700'
      }
    `}
  >
    <div className={`
      flex items-center justify-center transition-colors
      ${active ? 'text-white' : isDarkMode ? 'text-slate-500 group-hover:text-violet-400' : 'text-slate-400 group-hover:text-violet-600'}
    `}>
      {React.cloneElement(icon, { size: collapsed ? 24 : 22 })}
    </div>
    {!collapsed && <span className="font-bold text-[10px] sm:text-xs uppercase tracking-widest truncate">{label}</span>}
    {active && collapsed && <div className="absolute right-0 w-1.5 h-6 bg-white rounded-l-full"></div>}
  </button>
);

export default App;
