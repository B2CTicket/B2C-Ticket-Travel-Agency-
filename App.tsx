
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Ticket, 
  Receipt, 
  Users, 
  Settings, 
  Plus, 
  TrendingUp, 
  CreditCard, 
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
import { Booking, BookingStatus, Transaction, TransactionType, Client } from './types';
import Dashboard from './components/Dashboard';
import BookingList from './components/BookingList';
import TransactionList from './components/TransactionList';
import ClientList from './components/ClientList';
import AIChat from './components/AIChat';
import Forecast from './components/Forecast';
import InvoiceList from './components/InvoiceList';
import StatementView from './components/StatementView';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'bookings' | 'accounts' | 'ai' | 'clients' | 'forecast' | 'invoices' | 'statements'>('dashboard');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
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
  };

  return (
    <div className={`flex h-screen overflow-hidden font-sans transition-all duration-500 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#f8faff] text-slate-900'}`}>
      
      {/* Unique Sidebar with Gradient & Blur */}
      <aside className={`${isSidebarOpen ? 'w-72' : 'w-24'} ${isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-100'} border-r transition-all duration-500 flex flex-col z-50 relative group`}>
        <div className="p-8 flex items-center gap-4">
          <div className="vibrant-gradient p-2.5 rounded-2xl vibrant-glow shrink-0">
            <Plane className="text-white w-6 h-6 rotate-45" />
          </div>
          {isSidebarOpen && (
            <div className="animate-in fade-in slide-in-from-left-2 duration-300">
              <h1 className={`font-black text-lg tracking-tighter transition-colors ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                B2C <span className="text-violet-600">TRAVEL</span>
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest -mt-1">ERP Systems</p>
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem icon={<LayoutDashboard />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} />
          <NavItem icon={<Users />} label="Client Base" active={activeTab === 'clients'} onClick={() => setActiveTab('clients')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} />
          <NavItem icon={<Ticket />} label="Active Bookings" active={activeTab === 'bookings'} onClick={() => setActiveTab('bookings')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} />
          <NavItem icon={<FileText />} label="Invoices" active={activeTab === 'invoices'} onClick={() => setActiveTab('invoices')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} />
          <NavItem icon={<History />} label="Statements" active={activeTab === 'statements'} onClick={() => setActiveTab('statements')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} />
          <NavItem icon={<BarChart3 />} label="AI Forecast" active={activeTab === 'forecast'} onClick={() => setActiveTab('forecast')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} />
          <NavItem icon={<CreditCard />} label="Financials" active={activeTab === 'accounts'} onClick={() => setActiveTab('accounts')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} />
          <NavItem icon={<MessageSquareText />} label="Gemini AI" active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} collapsed={!isSidebarOpen} isDarkMode={isDarkMode} />
        </nav>

        <div className={`p-6 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-50'}`}>
           {deferredPrompt && (
             <button onClick={handleInstallClick} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all mb-4 bg-indigo-600 text-white hover:vibrant-gradient shadow-lg">
              <DownloadCloud size={20} />
              {isSidebarOpen && <span className="font-bold text-sm">Install App</span>}
            </button>
           )}
           <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
             <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-xl transition-all ${isDarkMode ? 'bg-amber-500/20 text-amber-500' : 'bg-violet-600 text-white shadow-md'}`}>
               {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
             </button>
             {isSidebarOpen && <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>}
           </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Subtle Background Accent */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/5 blur-[120px] rounded-full pointer-events-none"></div>
        
        <header className={`h-20 ${isDarkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-white/80 border-slate-100'} backdrop-blur-md border-b flex items-center justify-between px-10 shrink-0 z-40 transition-colors`}>
          <div className="flex items-center gap-4">
             <button onClick={() => setSidebarOpen(!isSidebarOpen)} className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-50'}`}>
               <Menu size={22} />
             </button>
             <div className="relative w-80 hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input type="text" placeholder="Search itinerary, PNR..." className={`w-full pl-12 pr-4 py-2.5 ${isDarkMode ? 'bg-slate-900 text-slate-100 border-slate-800' : 'bg-slate-100/50 text-slate-900 border-transparent'} rounded-2xl text-xs font-medium outline-none focus:ring-2 focus:ring-violet-500/20 transition-all`} />
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <button onClick={() => setActiveTab('bookings')} className="vibrant-gradient text-white px-6 py-2.5 rounded-2xl flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all text-xs font-bold shadow-lg shadow-violet-500/20">
              <Plus size={18} />
              NEW RESERVATION
            </button>
            <div className="h-10 w-[1px] bg-slate-200 dark:bg-slate-800 hidden md:block"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className={`text-xs font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Admin Panel</p>
                <p className="text-[10px] text-violet-500 font-bold uppercase tracking-widest">B2C Ticket</p>
              </div>
              <div className="w-11 h-11 rounded-2xl vibrant-gradient p-[2px] shadow-lg">
                <div className={`w-full h-full rounded-[14px] overflow-hidden border-2 ${isDarkMode ? 'border-slate-900' : 'border-white'}`}>
                  <img src="https://picsum.photos/80/80?random=1" alt="Avatar" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 no-scrollbar z-10">
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
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative ${active ? 'vibrant-gradient text-white shadow-xl shadow-violet-500/20' : isDarkMode ? 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-200' : 'text-slate-500 hover:bg-violet-50 hover:text-violet-700'}`}>
    <span className={`${active ? 'text-white' : isDarkMode ? 'text-slate-500 group-hover:text-violet-400' : 'text-slate-400 group-hover:text-violet-600'} transition-colors`}>
      {React.cloneElement(icon, { size: 22 })}
    </span>
    {!collapsed && <span className="font-bold text-xs uppercase tracking-widest truncate">{label}</span>}
    {active && collapsed && <div className="absolute right-0 w-1.5 h-6 bg-white rounded-l-full"></div>}
  </button>
);

export default App;
