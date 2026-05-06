
import React, { useState, useMemo } from 'react';
import { Booking, Client, BookingStatus } from '../types';
import { 
  FileText, Search, Printer, Download, Filter, 
  ChevronRight, Calendar, DollarSign, User, Plane,
  CheckCircle2, AlertCircle, XCircle, Building2,
  ArrowUpDown, SortAsc, SortDesc
} from 'lucide-react';

interface Props {
  bookings: Booking[];
  clients: Client[];
  isDarkMode?: boolean;
}

type SortOption = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';

const InvoiceList: React.FC<Props> = ({ bookings, clients, isDarkMode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');

  const filteredInvoices = useMemo(() => {
    let result = bookings.filter(b => {
      const matchesSearch = b.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           (b.pnr && b.pnr.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (b.hotelName && b.hotelName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           b.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'ALL' || b.status === filterStatus;
      return matchesSearch && matchesStatus;
    });

    // Apply Sorting
    result.sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'amount-desc') return b.amount - a.amount;
      if (sortBy === 'amount-asc') return a.amount - b.amount;
      return 0;
    });

    return result;
  }, [bookings, searchTerm, filterStatus, sortBy]);

  const handlePrint = (booking: Booking) => {
    const client = clients.find(c => c.id === booking.clientId);
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const invoiceHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Invoice - ${booking.id.toUpperCase()}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
          body { font-family: 'Plus Jakarta Sans', sans-serif; padding: 40px; color: #0f172a; line-height: 1.6; background: #fff; }
          .container { max-width: 800px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 40px; border-radius: 12px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #7c3aed; padding-bottom: 20px; }
          .logo { font-size: 28px; font-weight: 800; color: #7c3aed; letter-spacing: -1px; }
          .logo span { color: #2563eb; }
          .inv-details { text-align: right; }
          .inv-details h2 { font-size: 32px; margin: 0; font-weight: 800; color: #1e293b; }
          .inv-meta { font-size: 13px; color: #64748b; margin-top: 5px; }
          .billing-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
          .section-title { font-size: 10px; text-transform: uppercase; font-weight: 800; color: #94a3b8; letter-spacing: 0.1em; margin-bottom: 12px; border-bottom: 1px solid #f1f5f9; padding-bottom: 5px; }
          .info-box h4 { font-size: 16px; margin: 0 0 5px 0; font-weight: 700; }
          .info-box p { font-size: 13px; margin: 2px 0; color: #475569; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th { text-align: left; background: #f8fafc; padding: 15px; border-bottom: 2px solid #e2e8f0; font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 800; }
          td { padding: 15px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
          .item-desc { font-weight: 700; }
          .totals-container { display: flex; justify-content: flex-end; }
          .totals-table { width: 250px; }
          .total-row { display: flex; justify-content: space-between; padding: 10px 0; font-size: 14px; font-weight: 600; }
          .grand-total { border-top: 2px solid #e2e8f0; margin-top: 10px; padding-top: 15px; font-weight: 800; font-size: 20px; color: #7c3aed; }
          .footer { margin-top: 50px; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 20px; font-size: 11px; color: #94a3b8; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">B2C <span>TRAVEL</span></div>
            <div class="inv-details">
              <h2>INVOICE</h2>
              <div class="inv-meta">
                #INV-${booking.id.toUpperCase()}<br>
                Date: ${new Date(booking.date).toLocaleDateString()}<br>
                Status: ${booking.status}
              </div>
            </div>
          </div>

          <div class="billing-grid">
            <div class="info-box">
              <div class="section-title">Client / Passenger</div>
              <h4>${booking.clientName}</h4>
              <p>Phone: ${booking.clientPhone || client?.phone || 'N/A'}</p>
              <p>Email: ${client?.email || 'N/A'}</p>
              <p>Address: ${client?.address || 'N/A'}</p>
            </div>
            <div class="info-box">
              <div class="section-title">Travel & Reservation Details</div>
              <p><strong>Service:</strong> ${booking.type}</p>
              <p><strong>Pax:</strong> ${booking.pax || 1} Person(s)</p>
              ${booking.type === 'Air Ticket' ? `
                <p><strong>Route:</strong> ${booking.from} ➔ ${booking.to}</p>
                <p><strong>Flying Date:</strong> ${booking.flyingDate || 'N/A'}</p>
                <p><strong>PNR:</strong> ${booking.pnr?.toUpperCase() || 'N/A'}</p>
              ` : booking.type === 'Hotel' ? `
                <p><strong>Hotel:</strong> ${booking.hotelName || 'N/A'}</p>
                <p><strong>Check-in:</strong> ${booking.checkIn || 'N/A'}</p>
                <p><strong>Check-out:</strong> ${booking.checkOut || 'N/A'}</p>
                <p><strong>Booking ID:</strong> ${booking.pnr?.toUpperCase() || 'N/A'}</p>
              ` : ''}
              <p><strong>Source:</strong> ${booking.bookingSource || 'Direct'}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 70%">Service Description</th>
                <th style="text-align: right; width: 30%">Amount (BDT)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div class="item-desc">${booking.description || booking.type + ' Reservation'}</div>
                  <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Ref: ${booking.id.toUpperCase()} ${booking.pax ? `| Pax: ${booking.pax}` : ''} ${booking.pnr ? `| ID: ${booking.pnr.toUpperCase()}` : ''}</div>
                </td>
                <td style="text-align: right; font-weight: 700;">৳${booking.amount.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <div class="totals-container">
            <div class="totals-table">
              <div class="total-row"><span>Subtotal</span><span>৳${booking.amount.toLocaleString()}</span></div>
              <div class="total-row"><span>Tax (0%)</span><span>৳0.00</span></div>
              <div class="total-row grand-total"><span>Total</span><span>৳${booking.amount.toLocaleString()}</span></div>
            </div>
          </div>

          <div class="footer">
            <p>Thank you for choosing B2C Travel Agency. For queries, contact support@b2cticket.com</p>
            <p style="margin-top: 10px; font-weight: 700;">Authorized Electronic Signature</p>
          </div>
        </div>
        <script>window.print();</script>
      </body>
      </html>
    `;

    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h2 className={`text-3xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            BILLING & <span className="text-violet-600">INVOICES</span>
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Passenger Ledger & Revenue Tracking</p>
            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
              {filteredInvoices.length} RECORDS FOUND
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search Client, Hotel, or INV#..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-12 pr-6 py-3.5 rounded-2xl border-2 outline-none transition-all text-sm font-bold w-full md:w-64 ${
                isDarkMode ? 'bg-slate-900 border-slate-800 text-white focus:border-violet-500/50' : 'bg-white border-slate-100 focus:border-violet-500/50 shadow-sm'
              }`}
            />
          </div>
          
          {/* Status Filter Dropdown */}
          <div className="relative group">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`pl-10 pr-8 py-3.5 rounded-2xl border-2 outline-none text-[10px] font-black uppercase tracking-widest transition-all appearance-none cursor-pointer ${
                isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300 focus:border-violet-500/50' : 'bg-white border-slate-100 text-slate-600 shadow-sm focus:border-violet-500/50'
              }`}
            >
              <option value="ALL">Status: All Records</option>
              <option value={BookingStatus.CONFIRMED}>Confirmed Only</option>
              <option value={BookingStatus.PENDING}>Unpaid/Pending</option>
              <option value={BookingStatus.CANCELLED}>Cancelled</option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="relative group">
            <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className={`pl-10 pr-8 py-3.5 rounded-2xl border-2 outline-none text-[10px] font-black uppercase tracking-widest transition-all appearance-none cursor-pointer ${
                isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300 focus:border-violet-500/50' : 'bg-white border-slate-100 text-slate-600 shadow-sm focus:border-violet-500/50'
              }`}
            >
              <option value="date-desc">Sort: Newest First</option>
              <option value="date-asc">Sort: Oldest First</option>
              <option value="amount-desc">Amount: High to Low</option>
              <option value="amount-asc">Amount: Low to High</option>
            </select>
          </div>
        </div>
      </div>

      <div className={`rounded-[40px] border-2 overflow-hidden shadow-2xl transition-all ${
        isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-50'
      }`}>
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className={`border-b-2 ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50/50 border-slate-100'}`}>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Invoice Reference</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Client Profile</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Service Category</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Current Status</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Yield Amount</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y-2 ${isDarkMode ? 'divide-slate-800/50' : 'divide-slate-50'}`}>
              {filteredInvoices.length > 0 ? filteredInvoices.map((inv) => (
                <tr key={inv.id} className={`group transition-all ${isDarkMode ? 'hover:bg-violet-600/5' : 'hover:bg-violet-50/50'}`}>
                  <td className="px-10 py-7">
                    <div className="flex items-center gap-4">
                      <div className={`p-3.5 rounded-2xl transition-all ${isDarkMode ? 'bg-slate-800 text-violet-400 group-hover:scale-110' : 'bg-violet-50 text-violet-600 group-hover:scale-110'}`}>
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className={`text-sm font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>INV-{inv.id.toUpperCase()}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                          <Calendar size={10} /> {inv.date}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-7">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-[10px] text-indigo-500">
                          {inv.clientName.charAt(0)}
                       </div>
                       <span className={`text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{inv.clientName}</span>
                    </div>
                  </td>
                  <td className="px-10 py-7">
                    <div className="flex items-center gap-2">
                       {inv.type === 'Hotel' ? <Building2 size={14} className="text-amber-400" /> : <Plane size={14} className="text-indigo-400" />}
                       <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">{inv.type} • {inv.pax || 1} Pax</span>
                    </div>
                  </td>
                  <td className="px-10 py-7">
                     <StatusBadge status={inv.status} isDarkMode={isDarkMode} />
                  </td>
                  <td className="px-10 py-7 text-right">
                    <p className={`text-base font-black tracking-tighter ${isDarkMode ? 'text-violet-400' : 'text-violet-700'}`}>৳{inv.amount.toLocaleString()}</p>
                  </td>
                  <td className="px-10 py-7 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={() => handlePrint(inv)}
                        title="Print Invoice"
                        className={`p-3 rounded-xl transition-all ${
                          isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-white hover:bg-violet-600' : 'bg-white border border-slate-100 text-slate-500 hover:text-violet-700 hover:border-violet-200 shadow-sm'
                        }`}
                      >
                        <Printer size={18} />
                      </button>
                      <button 
                        onClick={() => handlePrint(inv)}
                        title="Download PDF"
                        className={`p-3 rounded-xl transition-all ${
                          isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-white hover:bg-emerald-600' : 'bg-white border border-slate-100 text-slate-500 hover:text-emerald-700 hover:border-emerald-200 shadow-sm'
                        }`}
                      >
                        <Download size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-10 py-24 text-center">
                    <div className="flex flex-col items-center opacity-30">
                      <div className="p-8 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                        <FileText size={48} className="text-slate-400" />
                      </div>
                      <p className="text-xs font-black uppercase tracking-[0.2em]">No Invoices Match Your Selection</p>
                      <button 
                        onClick={() => {setSearchTerm(''); setFilterStatus('ALL');}}
                        className="mt-4 text-[10px] font-black text-violet-600 uppercase tracking-widest hover:underline"
                      >
                        Clear All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status, isDarkMode }: { status: BookingStatus, isDarkMode?: boolean }) => {
  const configs = {
    [BookingStatus.CONFIRMED]: { icon: <CheckCircle2 size={12} />, styles: isDarkMode ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    [BookingStatus.PENDING]: { icon: <AlertCircle size={12} />, styles: isDarkMode ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' : 'bg-amber-50 text-amber-600 border-amber-100' },
    [BookingStatus.CANCELLED]: { icon: <XCircle size={12} />, styles: isDarkMode ? 'bg-rose-500/10 text-rose-500 border-rose-500/30' : 'bg-rose-50 text-rose-600 border-rose-100' },
  };
  const config = configs[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest shadow-sm ${config.styles}`}>
      {config.icon}
      {status === 'PENDING' ? 'UNPAID' : status}
    </span>
  );
};

export default InvoiceList;
