
import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType, AgencyStats } from '@/types';
import { 
  ArrowUpCircle, ArrowDownCircle, Download, FileSpreadsheet, 
  Plus, X, Calendar, Tag, Banknote, Filter, Printer, RefreshCw,
  Search, ChevronDown, BookOpen
} from 'lucide-react';

interface Props {
  transactions: Transaction[];
  stats: AgencyStats;
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  isDarkMode?: boolean;
}

const TransactionList: React.FC<Props> = ({ transactions, stats, onAddTransaction, isDarkMode }) => {
  const [showModal, setShowModal] = useState(false);
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  
  // Date states - Default to current month
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: '',
    amount: 0,
    type: TransactionType.INCOME,
    reference: ''
  });

  const [customCategory, setCustomCategory] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  const categories = {
    [TransactionType.INCOME]: [
      'Ticket Sale', 
      'Visa Fee', 
      'Package Sale', 
      'Hotel Booking',
      'Tour Package',
      'Hajj & Umrah',
      'Attestation',
      'Insurance',
      'Service Charge', 
      'Consultation', 
      'Other Income'
    ],
    [TransactionType.EXPENSE]: [
      'BSP Payment', 
      'Vendor Payment',
      'Office Rent', 
      'Electricity Bill', 
      'Internet Bill', 
      'Salaries', 
      'Marketing', 
      'Tea/Snacks', 
      'Office Supplies',
      'Travel Allowance',
      'Client Refund',
      'Bank Charges',
      'Printing & Stationery',
      'Other Expense'
    ]
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTransaction({
      ...formData,
      category: isCustom ? customCategory : formData.category
    });
    setShowModal(false);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      category: '',
      amount: 0,
      type: TransactionType.INCOME,
      reference: ''
    });
    setCustomCategory('');
    setIsCustom(false);
  };

  // Filter transactions based on date and type
  const { filteredTransactions, periodStats } = useMemo(() => {
    const filtered = transactions.filter(t => {
      const matchesType = filterType === 'ALL' || t.type === (filterType as unknown as TransactionType);
      const matchesDate = t.date >= startDate && t.date <= endDate;
      return matchesType && matchesDate;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const periodIncome = filtered.filter(t => t.type === TransactionType.INCOME).reduce((sum, t) => sum + t.amount, 0);
    const periodExpense = filtered.filter(t => t.type === TransactionType.EXPENSE).reduce((sum, t) => sum + t.amount, 0);

    return { 
      filteredTransactions: filtered, 
      periodStats: { income: periodIncome, expense: periodExpense, profit: periodIncome - periodExpense } 
    };
  }, [transactions, filterType, startDate, endDate]);

  const resetFilters = () => {
    const d = new Date();
    d.setDate(1);
    setStartDate(d.toISOString().split('T')[0]);
    setEndDate(new Date().toISOString().split('T')[0]);
    setFilterType('ALL');
  };

  const handlePrintLedger = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Financial Ledger - B2C Travel</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
          body { font-family: 'Plus Jakarta Sans', sans-serif; padding: 40px; color: #0f172a; }
          .header { display: flex; justify-content: space-between; border-bottom: 3px solid #7c3aed; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: 800; color: #7c3aed; }
          .report-meta { text-align: right; font-size: 12px; color: #64748b; }
          .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
          .stat-card { border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; background: #f8fafc; }
          .stat-label { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #94a3b8; }
          .stat-val { font-size: 20px; font-weight: 800; color: #1e293b; margin-top: 5px; }
          table { width: 100%; border-collapse: collapse; }
          th { text-align: left; background: #f1f5f9; padding: 12px; font-size: 11px; text-transform: uppercase; color: #64748b; border-bottom: 2px solid #e2e8f0; }
          td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
          .income { color: #10b981; font-weight: 700; }
          .expense { color: #f43f5e; font-weight: 700; }
          .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #94a3b8; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">B2C TRAVEL AGENCY</div>
            <div style="margin-top:5px; font-size:14px; font-weight:600">Financial Ledger Report</div>
          </div>
          <div class="report-meta">
            Period: ${startDate} to ${endDate}<br>
            Generated: ${new Date().toLocaleString()}
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">Total Period Income</div>
            <div class="stat-val income">৳${periodStats.income.toLocaleString()}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Total Period Expense</div>
            <div class="stat-val expense">৳${periodStats.expense.toLocaleString()}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Net Period Profit</div>
            <div class="stat-val" style="color:#7c3aed">৳${periodStats.profit.toLocaleString()}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Reference</th>
              <th style="text-align: right">Type</th>
              <th style="text-align: right">Amount (৳)</th>
            </tr>
          </thead>
          <tbody>
            ${filteredTransactions.map(t => `
              <tr>
                <td>${t.date}</td>
                <td style="font-weight:600">${t.category}</td>
                <td style="font-size:11px; color:#64748b">${t.reference || 'N/A'}</td>
                <td style="text-align: right; text-transform: uppercase; font-size:10px; font-weight:800">${t.type}</td>
                <td style="text-align: right" class="${t.type === TransactionType.INCOME ? 'income' : 'expense'}">
                  ${t.type === TransactionType.INCOME ? '+' : '-'}৳${t.amount.toLocaleString()}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>Confidential Financial Document - B2C Ticket Travel Agency ERP</p>
          <p>This report summarizes all transactions filtered for the specified range.</p>
        </div>
        <script>window.print();</script>
      </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className={`text-3xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            FINANCIAL <span className="text-violet-600">ACCOUNTS</span>
          </h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time Ledger & Audit Management</p>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-3 bg-white/40 dark:bg-slate-900/40 p-3 rounded-[32px] border-2 border-slate-100 dark:border-slate-800 backdrop-blur-md">
          {/* Date Filter */}
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="relative w-full sm:w-auto">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className={`w-full sm:w-auto pl-10 pr-3 py-2.5 rounded-2xl border-2 outline-none font-bold text-[11px] transition-all ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-50 text-slate-700 shadow-sm'
                }`}
              />
            </div>
            <span className="text-slate-400 text-xs font-black uppercase tracking-widest">to</span>
            <div className="relative w-full sm:w-auto">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className={`w-full sm:w-auto pl-10 pr-3 py-2.5 rounded-2xl border-2 outline-none font-bold text-[11px] transition-all ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-50 text-slate-700 shadow-sm'
                }`}
              />
            </div>
          </div>

          <div className="h-8 w-[2px] bg-slate-200 dark:bg-slate-700 mx-2 hidden md:block"></div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => handlePrintLedger()}
              className={`flex-1 md:flex-initial p-2.5 flex justify-center rounded-2xl transition-all ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-50 text-slate-400 hover:text-violet-600 shadow-sm'}`}
              title="Print Financial Report"
            >
              <Printer size={18} />
            </button>
            <button 
              onClick={resetFilters}
              className={`flex-1 md:flex-initial p-2.5 flex justify-center rounded-2xl transition-all ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-50 text-slate-400 hover:text-violet-600 shadow-sm'}`}
              title="Reset Filters"
            >
              <RefreshCw size={18} />
            </button>
            <button 
              onClick={() => setShowModal(true)}
              className="flex-[2] md:flex-initial px-6 py-2.5 vibrant-gradient text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-violet-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Plus size={16} />
              Manual Entry
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
        <StatSummaryCard 
          label="Period Income" 
          value={`৳${periodStats.income.toLocaleString()}`} 
          icon={<ArrowUpCircle className="text-emerald-500" />} 
          isDarkMode={isDarkMode}
          colorClass="text-emerald-500"
        />
        <StatSummaryCard 
          label="Period Expense" 
          value={`৳${periodStats.expense.toLocaleString()}`} 
          icon={<ArrowDownCircle className="text-rose-500" />} 
          isDarkMode={isDarkMode}
          colorClass="text-rose-500"
        />
        <StatSummaryCard 
          label="Period Net Profit" 
          value={`৳${periodStats.profit.toLocaleString()}`} 
          icon={<Banknote className="text-violet-500" />} 
          isDarkMode={isDarkMode}
          highlight
          colorClass="text-violet-600 dark:text-violet-400"
        />
      </div>

      <div className={`rounded-[40px] border-2 overflow-hidden shadow-2xl transition-all ${
        isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-50 shadow-xl shadow-slate-200/50'
      }`}>
        <div className={`px-6 md:px-10 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50/50 border-slate-100'}`}>
           <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-indigo-600/10 text-indigo-500">
                <BookOpen size={20} />
              </div>
              <div>
                <h3 className={`text-sm font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Transaction Ledger</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Showing {filteredTransactions.length} items</p>
              </div>
           </div>
           
           <div className={`flex items-center p-1 rounded-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
              <FilterTab active={filterType === 'ALL'} label="All" onClick={() => setFilterType('ALL')} isDarkMode={isDarkMode} />
              <FilterTab active={filterType === 'INCOME'} label="Income" onClick={() => setFilterType('INCOME')} isDarkMode={isDarkMode} />
              <FilterTab active={filterType === 'EXPENSE'} label="Expense" onClick={() => setFilterType('EXPENSE')} isDarkMode={isDarkMode} />
           </div>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          {/* Desktop Table */}
          <table className="w-full text-left hidden md:table">
            <thead>
              <tr className={`${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Category / Purpose</th>
                <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Reference ID</th>
                <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Amount (৳)</th>
              </tr>
            </thead>
            <tbody className={`divide-y-2 ${isDarkMode ? 'divide-slate-800/50' : 'divide-slate-50'}`}>
              {filteredTransactions.map((t) => (
                <tr key={t.id} className={`group transition-all ${isDarkMode ? 'hover:bg-violet-600/5' : 'hover:bg-violet-50/50'}`}>
                  <td className="px-10 py-6">
                    <span className={`text-[10px] font-black uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{t.date}</span>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:rotate-6 ${
                        t.type === TransactionType.INCOME 
                          ? 'bg-emerald-500/10 text-emerald-500' 
                          : 'bg-rose-500/10 text-rose-500'
                      }`}>
                        {t.type === TransactionType.INCOME ? <ArrowUpCircle size={18} /> : <ArrowDownCircle size={18} />}
                      </div>
                      <span className={`text-sm font-black tracking-tight ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{t.category}</span>
                    </div>
                  </td>
                  <td className={`px-10 py-6 text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    {t.reference || 'N/A'}
                  </td>
                  <td className={`px-10 py-6 text-right font-black text-sm tracking-tighter ${
                    t.type === TransactionType.INCOME 
                      ? isDarkMode ? 'text-emerald-400' : 'text-emerald-600' 
                      : isDarkMode ? 'text-rose-400' : 'text-rose-600'
                  }`}>
                    {t.type === TransactionType.INCOME ? '+' : '-'}৳{t.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y-2 divide-slate-50 dark:divide-slate-800/50">
            {filteredTransactions.map((t) => (
              <div key={t.id} className="p-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    t.type === TransactionType.INCOME 
                      ? 'bg-emerald-500/10 text-emerald-500' 
                      : 'bg-rose-500/10 text-rose-500'
                  }`}>
                    {t.type === TransactionType.INCOME ? <ArrowUpCircle size={18} /> : <ArrowDownCircle size={18} />}
                  </div>
                  <div>
                    <p className={`text-sm font-black tracking-tight ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{t.category}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.date} • {t.reference || 'NO REF'}</p>
                  </div>
                </div>
                <p className={`font-black text-sm tracking-tighter shrink-0 ${
                  t.type === TransactionType.INCOME 
                    ? isDarkMode ? 'text-emerald-400' : 'text-emerald-600' 
                    : isDarkMode ? 'text-rose-400' : 'text-rose-600'
                }`}>
                  {t.type === TransactionType.INCOME ? '+' : '-'}৳{t.amount.toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          {filteredTransactions.length === 0 && (
            <div className="px-10 py-24 text-center">
              <div className="flex flex-col items-center opacity-30">
                <Banknote size={48} className="mb-4" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">No Ledger Activity</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Manual Entry Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className={`rounded-[40px] w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
            <div className={`px-10 py-8 border-b-2 flex items-center justify-between ${isDarkMode ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50/50 border-slate-100'}`}>
              <div>
                <h3 className="font-black text-xl tracking-tighter uppercase">Add Entry</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Update Financial Logs</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-rose-500 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800 rounded-[20px]">
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, type: TransactionType.INCOME, category: ''})}
                  className={`flex-1 py-3 rounded-[14px] text-[10px] font-black uppercase tracking-widest transition-all ${formData.type === TransactionType.INCOME ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500'}`}
                >
                  Income
                </button>
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, type: TransactionType.EXPENSE, category: ''})}
                  className={`flex-1 py-3 rounded-[14px] text-[10px] font-black uppercase tracking-widest transition-all ${formData.type === TransactionType.EXPENSE ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-500'}`}
                >
                  Expense
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Transaction Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      required
                      type="date"
                      value={formData.date}
                      onChange={e => setFormData({...formData, date: e.target.value})}
                      className={`w-full pl-12 pr-6 py-4 border-2 rounded-2xl outline-none text-sm font-bold transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 focus:border-violet-500/50' : 'bg-slate-50 border-slate-100 focus:border-violet-500/50'}`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Category</label>
                  <div className="relative">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <select 
                      required
                      value={isCustom ? 'CUSTOM' : formData.category}
                      onChange={e => {
                        if (e.target.value === 'CUSTOM') {
                          setIsCustom(true);
                          setFormData({...formData, category: ''});
                        } else {
                          setIsCustom(false);
                          setFormData({...formData, category: e.target.value});
                        }
                      }}
                      className={`w-full pl-12 pr-10 py-4 border-2 rounded-2xl outline-none text-sm font-bold appearance-none transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 focus:border-violet-500/50' : 'bg-slate-50 border-slate-100 focus:border-violet-500/50'}`}
                    >
                      <option value="">Select Category</option>
                      {categories[formData.type].map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      <option value="CUSTOM">Other (Manual Type...)</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                  </div>
                </div>

                {isCustom && (
                  <div className="animate-in slide-in-from-top-2 duration-300">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Custom Category Name</label>
                    <input 
                      required
                      type="text"
                      placeholder="Type custom category name..."
                      value={customCategory}
                      onChange={e => setCustomCategory(e.target.value)}
                      className={`w-full px-6 py-4 border-2 rounded-2xl outline-none text-sm font-bold transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 focus:border-violet-500/50' : 'bg-slate-50 border-slate-100 focus:border-violet-500/50'}`}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Amount (৳)</label>
                  <input 
                    required
                    type="number"
                    placeholder="0.00"
                    value={formData.amount || ''}
                    onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
                    className={`w-full px-6 py-4 border-2 rounded-2xl outline-none text-lg font-black transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-violet-400 focus:border-violet-500/50' : 'bg-slate-50 border-slate-100 text-violet-700 focus:border-violet-500/50'}`}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Ref / Note</label>
                  <input 
                    type="text"
                    placeholder="Reference ID"
                    value={formData.reference}
                    onChange={e => setFormData({...formData, reference: e.target.value})}
                    className={`w-full px-6 py-4 border-2 rounded-2xl outline-none text-sm font-bold transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 focus:border-violet-500/50' : 'bg-slate-50 border-slate-100 focus:border-violet-500/50'}`}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all ${isDarkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-50 border-2 border-slate-100'}`}
                >
                  Discard
                </button>
                <button 
                  type="submit" 
                  className={`flex-1 py-4 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl transition-all active:scale-95 ${formData.type === TransactionType.INCOME ? 'bg-emerald-600 shadow-emerald-500/20' : 'bg-rose-600 shadow-rose-500/20'}`}
                >
                  Commit Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const StatSummaryCard = ({ label, value, icon, isDarkMode, highlight, colorClass }: any) => (
  <div className={`p-8 rounded-[32px] border-2 transition-all ${
    isDarkMode 
      ? highlight ? 'bg-violet-900/10 border-violet-500/30' : 'bg-slate-900 border-slate-800' 
      : highlight ? 'bg-violet-50 border-violet-100 shadow-xl shadow-violet-200/20' : 'bg-white border-slate-100 shadow-lg shadow-slate-200/40'
  }`}>
    <div className="flex items-center gap-5">
      <div className={`p-4 rounded-2xl transition-transform hover:rotate-6 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
        <p className={`text-2xl font-black tracking-tighter ${colorClass}`}>{value}</p>
      </div>
    </div>
  </div>
);

const FilterTab = ({ active, label, onClick, isDarkMode }: any) => (
  <button 
    onClick={onClick}
    className={`px-6 py-2.5 rounded-[14px] text-[10px] font-black uppercase tracking-widest transition-all ${
      active 
        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' 
        : isDarkMode ? 'text-slate-500 hover:text-slate-200' : 'text-slate-500 hover:text-slate-900'
    }`}
  >
    {label}
  </button>
);

export default TransactionList;
