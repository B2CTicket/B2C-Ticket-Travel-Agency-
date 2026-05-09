
import React, { useState, useMemo, useEffect } from 'react';
import { Client, Booking, Transaction, TransactionType } from '@/types';
import { 
  History, Search, Printer, User, ArrowUpRight, 
  ArrowDownRight, Wallet, Download, Calendar, 
  ChevronDown, Filter, RefreshCw, Users
} from 'lucide-react';

interface Props {
  clients: Client[];
  bookings: Booking[];
  transactions: Transaction[];
  defaultClientId?: string | null;
  isDarkMode?: boolean;
}

const StatementView: React.FC<Props> = ({ clients, bookings, transactions, defaultClientId, isDarkMode }) => {
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(1); // Default to start of current month
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (defaultClientId) setSelectedClientId(defaultClientId);
  }, [defaultClientId]);

  const selectedClient = useMemo(() => 
    clients.find(c => c.id === selectedClientId), [clients, selectedClientId]);

  const { filteredData, openingBalance, periodTotals } = useMemo(() => {
    if (!selectedClientId) return { filteredData: [], openingBalance: 0, periodTotals: { debit: 0, credit: 0 } };

    // 1. Collect all raw entries for this client
    const clientBookings = bookings
      .filter(b => b.clientId === selectedClientId)
      .map(b => ({
        date: b.date,
        description: `${b.type} Reservation: ${b.from || ''} - ${b.to || ''} (${b.pnr || 'N/A'})`,
        pax: b.pax,
        debit: b.amount,
        credit: 0,
        ref: `BOOKING-${b.id.toUpperCase()}`
      }));

    const clientPayments = transactions
      .filter(t => {
        const linkedBooking = bookings.find(b => b.id === t.bookingId);
        return linkedBooking && linkedBooking.clientId === selectedClientId && t.type === TransactionType.INCOME;
      })
      .map(t => ({
        date: t.date,
        description: `Payment Received: ${t.category}`,
        pax: null,
        debit: 0,
        credit: t.amount,
        ref: t.reference || `TRANS-${t.id.toUpperCase()}`
      }));

    const allEntries = [...clientBookings, ...clientPayments].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // 2. Calculate Opening Balance (everything before startDate)
    const openingBal = allEntries
      .filter(e => e.date < startDate)
      .reduce((acc, curr) => acc + (curr.debit - curr.credit), 0);

    // 3. Filter entries for the selected period
    const periodEntries = allEntries.filter(e => e.date >= startDate && e.date <= endDate);

    // 4. Calculate running balance for the filtered period starting from opening balance
    let currentBalance = openingBal;
    const filteredData = periodEntries.map(entry => {
      currentBalance += (entry.debit - entry.credit);
      return { ...entry, balance: currentBalance };
    });

    // 5. Calculate totals for the period itself
    const periodTotals = periodEntries.reduce((acc, curr) => ({
      debit: acc.debit + curr.debit,
      credit: acc.credit + curr.credit
    }), { debit: 0, credit: 0 });

    return { filteredData, openingBalance: openingBal, periodTotals };
  }, [selectedClientId, bookings, transactions, startDate, endDate]);

  const resetDates = () => {
    const d = new Date();
    d.setDate(1);
    setStartDate(d.toISOString().split('T')[0]);
    setEndDate(new Date().toISOString().split('T')[0]);
  };

  const handlePrint = () => {
    if (!selectedClient) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("The report viewer was blocked. Please allow popups for this site to view/print statements.");
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Statement - ${selectedClient.name}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
          body { font-family: 'Plus Jakarta Sans', sans-serif; padding: 40px; color: #0f172a; line-height: 1.5; background: #fff; }
          .header { display: flex; justify-content: space-between; border-bottom: 3px solid #7c3aed; padding-bottom: 20px; margin-bottom: 40px; }
          .logo { font-size: 24px; font-weight: 800; color: #7c3aed; }
          .logo span { color: #2563eb; }
          .period-badge { background: #f1f5f9; padding: 5px 15px; border-radius: 20px; font-size: 11px; font-weight: 700; color: #64748b; margin-top: 10px; display: inline-block; }
          .info { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
          .info h4 { font-size: 10px; color: #94a3b8; text-transform: uppercase; margin-bottom: 8px; border-bottom: 1px solid #f1f5f9; }
          table { width: 100%; border-collapse: collapse; }
          th { text-align: left; background: #f8fafc; padding: 12px; font-size: 11px; text-transform: uppercase; color: #64748b; border-bottom: 2px solid #e2e8f0; }
          td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
          .amount { text-align: right; font-family: monospace; }
          .opening-row { background-color: #fdf4ff; font-weight: 700; }
          .total-box { margin-top: 40px; display: flex; justify-content: flex-end; }
          .total-table { width: 320px; border: 2px solid #7c3aed; border-radius: 12px; padding: 20px; }
          .total-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 13px; font-weight: 600; }
          .grand-total { font-size: 18px; font-weight: 800; color: #7c3aed; margin-top: 10px; border-top: 1px solid #e2e8f0; padding-top: 10px; }
          @media print { .no-print { display: none; } body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">B2C <span>TRAVEL</span></div>
            <div class="period-badge">Statement Period: ${startDate} to ${endDate}</div>
          </div>
          <div style="text-align: right">
            <h2 style="margin:0">ACCOUNT STATEMENT</h2>
            <p style="margin:5px 0; color:#64748b; font-size:12px">Generated: ${new Date().toLocaleDateString()}</p>
          </div>
        </div>
        <div class="info">
          <div>
            <h4>Client Information</h4>
            <p><strong>${selectedClient.name}</strong></p>
            <p>${selectedClient.phone}</p>
            <p>${selectedClient.email || 'N/A'}</p>
            <p>${selectedClient.address || ''}</p>
          </div>
          <div style="text-align: right">
            <h4>Agency Details</h4>
            <p><strong>B2C Ticket Travel Agency</strong></p>
            <p>Uttara Sector 10, Dhaka</p>
            <p>Support: +880 1XXX-XXXXXX</p>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description / Reference</th>
              <th style="text-align: right">Debit (Charge)</th>
              <th style="text-align: right">Credit (Payment)</th>
              <th style="text-align: right">Balance</th>
            </tr>
          </thead>
          <tbody>
            <tr class="opening-row">
              <td>${startDate}</td>
              <td>OPENING BALANCE B/F</td>
              <td class="amount">-</td>
              <td class="amount">-</td>
              <td class="amount">৳${openingBalance.toLocaleString()}</td>
            </tr>
            ${filteredData.map(row => `
              <tr>
                <td>${row.date}</td>
                <td>
                  <div style="font-weight:700">${row.description}</div>
                  ${row.pax ? `<div style="font-size:11px; color:#64748b">Travel Pax: ${row.pax}</div>` : ''}
                  <div style="font-size:10px; color:#94a3b8">${row.ref}</div>
                </td>
                <td class="amount">${row.debit > 0 ? '৳' + row.debit.toLocaleString() : '-'}</td>
                <td class="amount">${row.credit > 0 ? '৳' + row.credit.toLocaleString() : '-'}</td>
                <td class="amount" style="font-weight:700">৳${row.balance.toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="total-box">
          <div class="total-table">
            <div class="total-row"><span>Opening Balance</span><span>৳${openingBalance.toLocaleString()}</span></div>
            <div class="total-row"><span>Period Total Charges</span><span>৳${periodTotals.debit.toLocaleString()}</span></div>
            <div class="total-row"><span>Period Total Payments</span><span>৳${periodTotals.credit.toLocaleString()}</span></div>
            <div class="total-row grand-total"><span>Closing Balance</span><span>৳${(openingBalance + periodTotals.debit - periodTotals.credit).toLocaleString()}</span></div>
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { 
              if (window.matchMedia('(pointer: fine)').matches) {
                window.close(); 
              }
            }, 1000);
          };
        </script>
      </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
      {/* Header with Date Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className={`text-3xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            ACCOUNT <span className="text-violet-600">STATEMENTS</span>
          </h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Date-Wise Ledger & Period Audit</p>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white/40 dark:bg-slate-900/40 p-3 rounded-[32px] border-2 border-slate-100 dark:border-slate-800 backdrop-blur-md w-full lg:w-auto">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            {/* Client Selector */}
            <div className="relative w-full sm:w-auto">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select 
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className={`w-full sm:w-48 pl-10 pr-10 py-2.5 rounded-2xl border-2 outline-none font-black text-[11px] uppercase tracking-wider appearance-none transition-all ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-violet-500/50' : 'bg-white border-slate-50 text-slate-700 shadow-sm'
                }`}
              >
                <option value="">Select Client</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
            </div>

            {/* Date Pickers */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className={`w-full pl-10 pr-3 py-2.5 rounded-2xl border-2 outline-none font-bold text-[11px] transition-all ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-50 text-slate-700'
                  }`}
                />
              </div>
              <span className="text-slate-400 text-xs font-bold shrink-0">to</span>
              <div className="relative flex-1 sm:flex-initial">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className={`w-full pl-10 pr-3 py-2.5 rounded-2xl border-2 outline-none font-bold text-[11px] transition-all ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-50 text-slate-700'
                  }`}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button 
              onClick={resetDates}
              className={`flex-1 md:flex-initial p-2.5 flex justify-center rounded-2xl transition-all ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-50 text-slate-400 hover:text-violet-600'}`}
              title="Reset to current month"
            >
              <RefreshCw size={18} />
            </button>

            <button 
              disabled={!selectedClientId}
              onClick={handlePrint}
              className="flex-[3] md:flex-initial px-6 py-2.5 rounded-2xl vibrant-gradient text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-violet-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Printer size={16} />
              Print Report
            </button>
          </div>
        </div>
      </div>

      {!selectedClientId ? (
        <div className={`p-12 md:p-24 text-center rounded-[48px] border-2 border-dashed animate-in fade-in duration-700 ${isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-violet-500 blur-2xl opacity-20 animate-pulse"></div>
            <History className="text-violet-500 relative z-10" size={60} />
          </div>
          <h3 className={`text-lg md:text-xl font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>Initialize Ledger Inquiry</h3>
          <p className="text-xs text-slate-500 mt-2 font-medium max-w-sm mx-auto">Please select a passenger from the terminal menu above to generate their date-wise financial statement.</p>
        </div>
      ) : (
        <>
          {/* Summary Dashboard for the Selected Period */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 animate-in slide-in-from-bottom-4 duration-500">
            <StatCard 
              label="Opening Bal" 
              value={`৳${openingBalance.toLocaleString()}`} 
              icon={<History className="text-slate-400" />} 
              isDarkMode={isDarkMode} 
            />
            <StatCard 
              label="Period Billed" 
              value={`৳${periodTotals.debit.toLocaleString()}`} 
              icon={<ArrowUpRight className="text-rose-500" />} 
              isDarkMode={isDarkMode} 
            />
            <StatCard 
              label="Period Paid" 
              value={`৳${periodTotals.credit.toLocaleString()}`} 
              icon={<ArrowDownRight className="text-emerald-500" />} 
              isDarkMode={isDarkMode} 
            />
            <StatCard 
              label="Closing Bal" 
              value={`৳${(openingBalance + periodTotals.debit - periodTotals.credit).toLocaleString()}`} 
              icon={<Wallet className="text-violet-500" />} 
              isDarkMode={isDarkMode}
              highlight
            />
          </div>

          <div className={`rounded-[40px] border-2 overflow-hidden shadow-2xl transition-all ${
            isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-50 shadow-xl shadow-slate-200/50'
          }`}>
            <div className="overflow-x-auto no-scrollbar">
              {/* Desktop Table */}
              <table className="w-full text-left hidden md:table">
                <thead>
                  <tr className={`border-b-2 ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50/50 border-slate-100'}`}>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Transaction Date</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Description / Ledger Ref</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Debit (+)</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Credit (-)</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Balance B/F</th>
                  </tr>
                </thead>
                <tbody className={`divide-y-2 ${isDarkMode ? 'divide-slate-800/50' : 'divide-slate-50'}`}>
                  {/* Opening Balance Row */}
                  <tr className={`${isDarkMode ? 'bg-violet-900/5' : 'bg-violet-50/30'} italic`}>
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-black text-violet-500 uppercase tracking-widest">{startDate}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-violet-500"></div>
                        <p className={`text-xs font-black uppercase tracking-tight ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Opening Balance Carried Forward</p>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right text-slate-300">--</td>
                    <td className="px-8 py-6 text-right text-slate-300">--</td>
                    <td className="px-8 py-6 text-right">
                      <span className={`text-sm font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>৳{openingBalance.toLocaleString()}</span>
                    </td>
                  </tr>

                  {filteredData.map((row, idx) => (
                    <tr key={idx} className={`group transition-all ${isDarkMode ? 'hover:bg-violet-600/5' : 'hover:bg-violet-50/50'}`}>
                      <td className="px-8 py-6">
                        <span className={`text-[10px] font-black uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{row.date}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div>
                          <p className={`text-sm font-black truncate tracking-tight transition-colors ${isDarkMode ? 'text-slate-100 group-hover:text-violet-400' : 'text-slate-800 group-hover:text-violet-700'}`}>{row.description}</p>
                          {row.pax && (
                            <div className="flex items-center gap-1.5 mt-0.5 px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500 w-fit">
                               <Users size={10} />
                               <span className="text-[9px] font-black uppercase tracking-widest">{row.pax} Pax</span>
                            </div>
                          )}
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{row.ref}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        {row.debit > 0 && <span className="text-sm font-black text-rose-500">৳{row.debit.toLocaleString()}</span>}
                      </td>
                      <td className="px-8 py-6 text-right">
                        {row.credit > 0 && <span className="text-sm font-black text-emerald-500">৳{row.credit.toLocaleString()}</span>}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span className={`text-sm font-black tracking-tighter ${isDarkMode ? 'text-violet-400' : 'text-violet-700'}`}>৳{row.balance.toLocaleString()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile List View */}
              <div className="md:hidden divide-y-2 divide-slate-50 dark:divide-slate-800/50">
                {/* Opening Balance Card */}
                <div className="p-6 bg-violet-50/30 dark:bg-violet-900/5">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-black text-violet-500 uppercase tracking-widest">{startDate}</span>
                    <span className={`text-sm font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>৳{openingBalance.toLocaleString()}</span>
                  </div>
                  <p className={`text-[10px] font-black uppercase tracking-tight ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Opening Balance Forward</p>
                </div>

                {filteredData.map((row, idx) => (
                  <div key={idx} className="p-6 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1 pr-4">
                        <p className={`text-sm font-black leading-tight tracking-tight ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{row.description}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{row.date} • {row.ref}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-sm font-black tracking-tighter ${isDarkMode ? 'text-violet-400' : 'text-violet-700'}`}>৳{row.balance.toLocaleString()}</p>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Balance</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 pt-2 border-t border-slate-50 dark:border-slate-800/50">
                      {row.debit > 0 && (
                        <div className="flex-1">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Debit (+)</p>
                          <p className="text-xs font-black text-rose-500">৳{row.debit.toLocaleString()}</p>
                        </div>
                      )}
                      {row.credit > 0 && (
                        <div className="flex-1">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Credit (-)</p>
                          <p className="text-xs font-black text-emerald-500">৳{row.credit.toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {(filteredData.length === 0 && openingBalance === 0) && (
                <div className="px-8 py-24 text-center">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">No transactions recorded.</p>
                </div>
              )}
            </div>
            
            {/* Detailed Summary Footer */}
            <div className={`p-6 md:p-10 border-t-2 ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50/50 border-slate-100'} flex flex-col xl:flex-row justify-between items-center gap-8`}>
              <div className="flex items-center gap-4">
                 <div className="p-4 rounded-2xl bg-violet-600/10 border border-violet-500/20 text-violet-500">
                    <Filter size={24} />
                 </div>
                 <div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Reporting Range</p>
                    <p className={`text-sm font-black ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{startDate} <span className="text-violet-500 mx-2">➔</span> {endDate}</p>
                 </div>
              </div>

              <div className="w-full max-w-sm space-y-3 bg-white/50 dark:bg-black/20 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <span>Opening Balance</span>
                  <span className="text-slate-600 dark:text-slate-300">৳{openingBalance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <span>Period Changes</span>
                  <span className={periodTotals.debit >= periodTotals.credit ? 'text-rose-500' : 'text-emerald-500'}>
                    {periodTotals.debit >= periodTotals.credit ? '+' : ''}৳{(periodTotals.debit - periodTotals.credit).toLocaleString()}
                  </span>
                </div>
                <div className="pt-3 border-t-2 border-slate-200 dark:border-slate-800 flex justify-between items-center">
                  <span className="text-xs font-black uppercase tracking-tight text-slate-800 dark:text-white">Closing Balance</span>
                  <span className={`text-xl md:text-2xl font-black tracking-tighter ${ (openingBalance + periodTotals.debit - periodTotals.credit) > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                    ৳{(openingBalance + periodTotals.debit - periodTotals.credit).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const StatCard = ({ label, value, icon, isDarkMode, highlight }: any) => (
  <div className={`p-6 rounded-[32px] border-2 transition-all group hover:scale-[1.02] ${
    isDarkMode 
      ? highlight ? 'bg-violet-900/10 border-violet-500/30' : 'bg-slate-900 border-slate-800' 
      : highlight ? 'bg-violet-50 border-violet-100 shadow-xl shadow-violet-200/20' : 'bg-white border-slate-100 shadow-lg shadow-slate-200/40'
  }`}>
    <div className="flex items-center gap-4">
      <div className={`p-3.5 rounded-2xl transition-transform group-hover:rotate-6 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
        {icon}
      </div>
      <div>
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
        <p className={`text-lg font-black tracking-tighter transition-colors ${isDarkMode ? highlight ? 'text-violet-400' : 'text-white' : highlight ? 'text-violet-700' : 'text-slate-900'}`}>{value}</p>
      </div>
    </div>
  </div>
);

export default StatementView;
