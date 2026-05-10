import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Booking, BookingStatus, Client } from '@/types';
import { formatDate, formatToDDMMYYYY } from '../lib/dateUtils';
import { 
  Search, Plus, X, Download, Plane, 
  Calendar, Users, Globe, ArrowRight, 
  ShieldCheck, MapPin, Hash, Banknote, 
  Briefcase, CheckCircle, Building2, 
  Bed, LogIn, LogOut, Phone, User,
  Navigation, Clock, Zap, ExternalLink,
  ClipboardList, Info, Activity, AlertTriangle
} from 'lucide-react';

interface Props {
  bookings: Booking[];
  clients: Client[];
  onAdd: (booking: Omit<Booking, 'id'>) => void;
  onUpdate: (booking: Booking) => void;
  onDelete: (id: string) => void;
  isDarkMode?: boolean;
  triggerAddModalKey?: number;
}

const BookingList: React.FC<Props> = ({ bookings, clients, onAdd, onUpdate, onDelete, isDarkMode, triggerAddModalKey }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (triggerAddModalKey && triggerAddModalKey > 0) {
      setShowModal(true);
    }
  }, [triggerAddModalKey]);

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => 
      b.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (b.pnr && b.pnr.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.from && b.from.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.to && b.to.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.hotelName && b.hotelName.toLowerCase().includes(searchTerm.toLowerCase()))
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [bookings, searchTerm]);

  const upcomingTravel = useMemo(() => {
    const today = new Date();
    today.setHours(0,0,0,0);
    return [...bookings]
      .filter(b => b.flyingDate || b.checkIn)
      .map(b => ({
        ...b,
        sortDate: new Date(b.flyingDate || b.checkIn || '')
      }))
      .filter(b => b.sortDate >= today)
      .sort((a, b) => a.sortDate.getTime() - b.sortDate.getTime())[0];
  }, [bookings]);

  const [formData, setFormData] = useState({
    clientId: '', clientName: '', clientPhone: '', type: 'Air Ticket' as any,
    date: new Date().toISOString().split('T')[0], issueDate: new Date().toISOString().split('T')[0],
    flyingDate: '', from: '', to: '', checkIn: '', checkOut: '', hotelName: '',
    amount: 0, cost: 0,
    status: BookingStatus.PENDING, description: '', pax: 1, pnr: '', bookingSource: ''
  });

  const handleClientChange = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setFormData({ ...formData, clientId, clientName: client.name, clientPhone: client.phone });
    } else {
      setFormData({ ...formData, clientId: '', clientName: '', clientPhone: '' });
    }
  };

  const [isSynchronizing, setIsSynchronizing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSynchronizing(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    if (editingBookingId) {
      onUpdate({ ...formData, id: editingBookingId } as Booking);
    } else {
      onAdd(formData);
    }
    
    setIsSynchronizing(false);
    setShowModal(false);
    setEditingBookingId(null);
    setFormData({
      clientId: '', clientName: '', clientPhone: '', type: 'Air Ticket',
      date: new Date().toISOString().split('T')[0], issueDate: new Date().toISOString().split('T')[0],
      flyingDate: '', from: '', to: '', checkIn: '', checkOut: '', hotelName: '',
      amount: 0, cost: 0,
      status: BookingStatus.PENDING, description: '', pax: 1, pnr: '', bookingSource: ''
    });
  };

  const handleExportData = () => {
    if (!selectedBooking) return;
    
    const b = selectedBooking;
    const client = clients.find(c => c.id === b.clientId);
    
    // Creating a more reliable print implementation for both mobile and desktop
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Please allow popups to export the invoice.");
      return;
    }

    const invoiceHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice - ${b.id.toUpperCase()}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
          body { font-family: 'Plus Jakarta Sans', sans-serif; padding: 20px; color: #1e293b; line-height: 1.5; background: #fff; }
          .container { max-width: 800px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 40px; border-radius: 16px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; border-bottom: 2px solid #6366f1; padding-bottom: 20px; }
          .logo { font-size: 24px; font-weight: 800; color: #6366f1; }
          .logo span { color: #3b82f6; }
          .inv-details { text-align: right; }
          .inv-details h2 { font-size: 28px; margin: 0; font-weight: 800; color: #0f172a; }
          .inv-meta { font-size: 12px; color: #64748b; margin-top: 5px; font-weight: 600; }
          .billing-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
          .section-title { font-size: 9px; text-transform: uppercase; font-weight: 800; color: #94a3b8; letter-spacing: 0.15em; margin-bottom: 10px; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px; }
          .info-box h4 { font-size: 15px; margin: 0 0 4px 0; font-weight: 700; }
          .info-box p { font-size: 12px; margin: 1px 0; color: #475569; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
          th { text-align: left; background: #f8fafc; padding: 12px; border-bottom: 2px solid #e2e8f0; font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 800; }
          td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
          .item-desc { font-weight: 700; color: #1e293b; }
          .totals-container { display: flex; justify-content: flex-end; }
          .totals-table { width: 220px; }
          .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; font-weight: 600; }
          .grand-total { border-top: 2px solid #e2e8f0; margin-top: 8px; padding-top: 12px; font-weight: 800; font-size: 18px; color: #6366f1; }
          .footer { margin-top: 40px; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 20px; font-size: 10px; color: #94a3b8; }
          @media print { 
            body { padding: 0; }
            .container { border: none; padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">B2C <span>TRAVEL</span></div>
            <div class="inv-details">
              <h2>INVOICE</h2>
              <div class="inv-meta">
                Ref: ${b.id.split('-')[0].toUpperCase()}<br>
                Booking Date: ${formatToDDMMYYYY(new Date(b.date))}<br>
                Status: ${b.status}
              </div>
            </div>
          </div>

          <div class="billing-grid">
            <div class="info-box">
              <div class="section-title">Billing To</div>
              <h4>${b.clientName}</h4>
              <p>Phone: ${b.clientPhone || 'N/A'}</p>
              <p>Service Date: ${b.flyingDate || b.checkIn || 'N/A'}</p>
            </div>
            <div class="info-box">
              <div class="section-title">Reservation Details</div>
              <p><strong>Category:</strong> ${b.type}</p>
              <p><strong>Pax:</strong> ${b.pax || 1} Person(s)</p>
              <p><strong>Reference:</strong> ${b.pnr?.toUpperCase() || 'UNSPECIFIED'}</p>
              ${b.type === 'Hotel' ? `<p><strong>Hotel:</strong> ${b.hotelName || 'N/A'}</p>` : `<p><strong>Route:</strong> ${b.from || '--'} TO ${b.to || '--'}</p>`}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 75%">Description</th>
                <th style="text-align: right; width: 25%">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div class="item-desc">${b.description || b.type + ' Reservation'}</div>
                  <div style="font-size: 10px; color: #64748b; margin-top: 4px;">Date: ${b.flyingDate || b.checkIn || b.date} | Pax: ${b.pax || 1}</div>
                </td>
                <td style="text-align: right; font-weight: 700;">৳${b.amount.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <div class="totals-container">
            <div class="totals-table">
              <div class="total-row"><span>Subtotal</span><span>৳${b.amount.toLocaleString()}</span></div>
              <div class="total-row grand-total"><span>Grand Total</span><span>৳${b.amount.toLocaleString()}</span></div>
            </div>
          </div>

          <div class="footer">
            <p>This is a computer-generated document. No signature required.</p>
            <p style="margin-top: 5px;">B2C Ticket Accountings - Logistics Management Terminal</p>
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
  };

  const handleEdit = (booking: Booking) => {
    setFormData({
      clientId: booking.clientId || '',
      clientName: booking.clientName,
      clientPhone: booking.clientPhone || '',
      type: booking.type,
      date: booking.date,
      issueDate: booking.issueDate || booking.date,
      flyingDate: booking.flyingDate || '',
      from: booking.from || '',
      to: booking.to || '',
      checkIn: booking.checkIn || '',
      checkOut: booking.checkOut || '',
      hotelName: booking.hotelName || '',
      amount: booking.amount,
      cost: booking.cost,
      status: booking.status,
      description: booking.description || '',
      pax: booking.pax || 1,
      pnr: booking.pnr || '',
      bookingSource: booking.bookingSource || ''
    });
    setEditingBookingId(booking.id);
    setSelectedBooking(null);
    setShowModal(true);
  };

  const handleAbort = () => {
    setShowModal(false);
    setEditingBookingId(null);
    setFormData({
      clientId: '', clientName: '', clientPhone: '', type: 'Air Ticket',
      date: new Date().toISOString().split('T')[0], issueDate: new Date().toISOString().split('T')[0],
      flyingDate: '', from: '', to: '', checkIn: '', checkOut: '', hotelName: '',
      amount: 0, cost: 0,
      status: BookingStatus.PENDING, description: '', pax: 1, pnr: '', bookingSource: ''
    });
  };

  return (
    <div className="space-y-8 pb-20">
      
      {/* Main Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Reservation <span className="text-indigo-600">Ledger</span>
            </h2>
            <div className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-[10px] font-bold text-indigo-500 uppercase tracking-widest border border-indigo-500/20">
              Live
            </div>
          </div>
          <p className="text-xs font-medium text-slate-500">Manage, track and verify client bookings globally.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <div className="relative group w-full sm:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search bookings..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-11 pr-4 py-3 text-sm font-medium border rounded-xl outline-none transition-all ${
                isDarkMode ? 'bg-slate-900 border-slate-700 text-white focus:border-indigo-500' : 'bg-white border-slate-200 shadow-sm focus:border-indigo-500'
              }`} 
            />
          </div>
          <button 
            onClick={() => setShowModal(true)} 
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg shadow-indigo-600/20 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Plus size={18} />
            New Booking
          </button>
        </div>
      </header>

      {/* Upcoming Priority section */}
      {upcomingTravel && !searchTerm && (
        <section className="animate-in fade-in slide-in-from-top-4 duration-700">
          <div className={`p-1 flex flex-col md:flex-row rounded-3xl border relative overflow-hidden ${
            isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-lg shadow-slate-200/40'
          }`}>
              <div className="flex-1 p-8 md:p-10 space-y-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1.5 rounded-lg bg-indigo-600/10 text-indigo-600 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                    <Clock size={12} /> Next Departure
                  </div>
                  <div className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                    In {Math.ceil((new Date(upcomingTravel.flyingDate || upcomingTravel.checkIn || '').getTime() - new Date().getTime()) / (1000 * 3600 * 24))} Days
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className={`text-3xl md:text-5xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {upcomingTravel.type === 'Hotel' 
                      ? <><span className="text-slate-400 font-medium">STAY AT</span> {upcomingTravel.hotelName}</>
                      : <>{upcomingTravel.from} <ArrowRight className="inline-block text-indigo-500 mx-1" size={24} /> {upcomingTravel.to}</>
                    }
                  </h3>
                  <div className="flex flex-wrap items-center gap-8">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-indigo-500/20 bg-white">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${upcomingTravel.clientName}`} className="w-full h-full" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{upcomingTravel.clientName}</p>
                        <p className="text-[11px] font-medium text-slate-500 uppercase tracking-widest font-mono">Reference: {upcomingTravel.pnr || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="h-10 w-px bg-slate-200 dark:bg-slate-700 hidden lg:block"></div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Invoice</p>
                      <div className="flex items-center gap-3">
                         <span className={`text-2xl font-bold ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>৳{upcomingTravel.amount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

             <div className={`md:w-80 flex flex-col justify-between p-8 md:p-10 relative z-10 ${isDarkMode ? 'bg-indigo-600/10' : 'bg-slate-50/80'}`}>
                <div className="space-y-6 flex md:flex-col items-center md:items-start justify-between md:justify-start w-full">
                   <div className="space-y-1">
                      <div className="flex items-center justify-between gap-4 font-bold uppercase tracking-widest text-slate-400">
                         <span className="text-[10px]">Departure</span>
                      </div>
                      <p className="text-xl font-bold font-mono text-slate-800 dark:text-slate-200">{upcomingTravel.flyingDate || upcomingTravel.checkIn}</p>
                   </div>
                   <div className="space-y-1">
                      <div className="flex items-center justify-between gap-4 font-bold uppercase tracking-widest text-slate-400">
                         <span className="text-[10px]">Pax Unit</span>
                      </div>
                      <p className="text-xl font-bold font-mono text-slate-800 dark:text-slate-200">{upcomingTravel.pax || 1} Person(s)</p>
                   </div>
                </div>
                
                <motion.button 
                   whileHover={{ scale: 1.02 }}
                   whileTap={{ scale: 0.98 }}
                   onClick={() => setSelectedBooking(upcomingTravel)}
                   className="mt-8 md:mt-0 w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 group transition-all"
                >
                  View Details <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </motion.button>
             </div>
          </div>
        </section>
      )}

      {/* Booking Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredBookings.length > 0 ? filteredBookings.map((booking) => (
            <motion.div 
              layout
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              key={booking.id}
              onClick={() => setSelectedBooking(booking)}
              className={`group flex flex-col h-full rounded-2xl border transition-all cursor-pointer ${
                isDarkMode 
                  ? 'bg-slate-900 border-slate-800 hover:border-indigo-500/50' 
                  : 'bg-white border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md'
              }`}
            >
              {/* Card Header */}
              <div className={`px-6 py-4 flex items-center justify-between border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-indigo-50'}`}>
                    {booking.type === 'Air Ticket' ? <Plane size={14} className="text-indigo-600 rotate-45" /> : booking.type === 'Hotel' ? <Building2 size={14} className="text-indigo-600" /> : <Globe size={14} className="text-indigo-600" />}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                    {booking.id.split('-')[0].toUpperCase()}
                  </span>
                </div>
                <div className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                  booking.status === BookingStatus.CONFIRMED ? 'bg-emerald-500/10 text-emerald-500' : 
                  booking.status === BookingStatus.PENDING ? 'bg-amber-500/10 text-amber-500' : 
                  'bg-rose-500/10 text-rose-500'
                }`}>
                  {booking.status}
                </div>
              </div>

              {/* Card Body */}
              <div className="flex-1 p-6 space-y-6">
                <div className="flex justify-between items-start">
                   <div className="space-y-3">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${booking.clientName}`} alt="Client" className="w-full h-full" />
                         </div>
                         <div>
                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{booking.clientName}</h4>
                            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">{booking.type}</p>
                         </div>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-lg font-bold text-slate-900 dark:text-white font-mono">৳{booking.amount.toLocaleString()}</p>
                   </div>
                </div>

                <div className={`p-4 rounded-xl border flex items-center justify-between ${
                  isDarkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-100'
                }`}>
                   {booking.type === 'Hotel' ? (
                     <>
                        <div className="text-left">
                          <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">In</p>
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{formatDate(booking.checkIn)}</p>
                        </div>
                        <ArrowRight size={14} className="text-slate-300" />
                        <div className="text-right">
                          <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Out</p>
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{formatDate(booking.checkOut)}</p>
                        </div>
                     </>
                   ) : booking.type === 'Air Ticket' ? (
                     <>
                        <div className="text-left">
                          <p className="text-sm font-bold text-indigo-600 uppercase">{booking.from || '--'}</p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">Origin</p>
                        </div>
                        <Plane size={14} className="text-indigo-300" />
                        <div className="text-right">
                          <p className="text-sm font-bold text-indigo-600 uppercase">{booking.to || '--'}</p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">Dest</p>
                        </div>
                     </>
                   ) : (
                     <div className="w-full text-center">
                        <p className="text-sm font-bold text-indigo-600 uppercase">{booking.to || '--'}</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">
                          {booking.type === 'Visa' ? 'Country' : 'Destination'}
                        </p>
                     </div>
                   )}
                </div>
              </div>

              {/* Card Footer */}
              <div className={`px-6 py-4 border-t flex items-center justify-between ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50/50 border-slate-100'}`}>
                <div className="flex items-center gap-2">
                   <Calendar size={12} className="text-slate-400" />
                   <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">
                     {formatDate(booking.flyingDate || booking.checkIn || '')}
                   </p>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">{booking.pax || 1} PAX</p>
              </div>
            </motion.div>
          )) : (
            <div className="col-span-full py-24 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                <Search size={32} className="text-slate-300" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No matching bookings</h3>
                <p className="text-sm text-slate-400">Try adjusting your search criteria</p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Booking Review Modal */}
      <AnimatePresence>
        {selectedBooking && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
            onClick={() => setSelectedBooking(null)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col relative overflow-hidden ${
                isDarkMode ? 'bg-slate-900 text-white border border-slate-800' : 'bg-white text-slate-900'
              }`}
            >
               {/* Modal Header */}
               <div className={`px-8 py-5 border-b flex justify-between items-center shrink-0 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                  <div className="flex items-center gap-3">
                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                        <ClipboardList size={22} />
                     </div>
                     <div>
                        <h3 className="text-xl font-bold tracking-tight">Booking Summary</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">PNR: {selectedBooking.pnr || 'N/A'}</p>
                          <span className={`w-1 h-1 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></span>
                          <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest leading-none">{selectedBooking.type}</p>
                        </div>
                     </div>
                  </div>
                  <button 
                    onClick={() => setSelectedBooking(null)} 
                    className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-600'}`}
                  >
                    <X size={20} />
                  </button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-8 sm:p-10 scrollbar-hide">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-8">
                       {/* Customer section */}
                       <section className="space-y-3">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Client Profile</label>
                          <div className={`p-5 rounded-2xl border flex items-center gap-4 ${isDarkMode ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                             <div className="w-14 h-14 rounded-xl bg-white p-0.5 shadow-sm border border-slate-100 relative shrink-0">
                               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedBooking.clientName}`} className="w-full h-full rounded-lg" alt="Avatar" />
                               <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full flex items-center justify-center">
                                 <CheckCircle size={10} className="text-white" />
                               </div>
                             </div>
                             <div className="flex-1 min-w-0">
                                <p className="text-base font-bold truncate leading-tight">{selectedBooking.clientName}</p>
                                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mt-1">
                                  <Phone size={12} className="text-indigo-500" />
                                  <span className="truncate">{selectedBooking.clientPhone || 'No contact provided'}</span>
                                </div>
                                <div className="flex gap-2 mt-2">
                                  <span className="px-2 py-0.5 rounded-md bg-indigo-600/10 text-indigo-600 text-[10px] font-bold">{selectedBooking.pax || 1} PAX</span>
                                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                    selectedBooking.status === BookingStatus.CONFIRMED ? 'bg-emerald-500/10 text-emerald-500' : 
                                    selectedBooking.status === BookingStatus.PENDING ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'
                                  }`}>
                                    {selectedBooking.status}
                                  </span>
                                </div>
                             </div>
                          </div>
                       </section>

                       {/* Logistics section */}
                       <section className="space-y-3">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Itinerary Detail</label>
                          <div className="grid grid-cols-2 gap-3">
                             {selectedBooking.type === 'Hotel' ? (
                               <>
                                 <div className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center ${isDarkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-100 bg-white'}`}>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Check-In</p>
                                    <p className="text-sm font-bold text-indigo-600 font-mono">{selectedBooking.checkIn || '--'}</p>
                                 </div>
                                 <div className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center ${isDarkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-100 bg-white'}`}>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Check-Out</p>
                                    <p className="text-sm font-bold text-indigo-600 font-mono">{selectedBooking.checkOut || '--'}</p>
                                 </div>
                                 <div className={`col-span-2 p-4 rounded-xl border flex items-center gap-4 ${isDarkMode ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                                    <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center shadow-sm shrink-0">
                                       <Building2 size={18} className="text-indigo-500" />
                                    </div>
                                    <div className="min-w-0">
                                       <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Hotel Property</p>
                                       <p className="text-sm font-bold truncate">{selectedBooking.hotelName || 'N/A'}</p>
                                    </div>
                                 </div>
                               </>
                             ) : selectedBooking.type === 'Air Ticket' ? (
                               <>
                                 <div className={`p-4 rounded-xl border text-center ${isDarkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-100 bg-white'}`}>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1 tracking-widest">Origin</p>
                                    <p className="text-xl font-bold text-indigo-600 uppercase">{selectedBooking.from || '--'}</p>
                                 </div>
                                 <div className={`p-4 rounded-xl border text-center ${isDarkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-100 bg-white'}`}>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1 tracking-widest">Destination</p>
                                    <p className="text-xl font-bold text-indigo-600 uppercase">{selectedBooking.to || '--'}</p>
                                 </div>
                                 <div className={`col-span-2 p-4 rounded-xl border grid grid-cols-2 gap-4 ${isDarkMode ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                                    <div className="flex items-center gap-3">
                                       <Calendar size={16} className="text-indigo-500 shrink-0" />
                                       <div className="min-w-0">
                                          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Travel Date</p>
                                          <p className="text-xs font-bold font-mono truncate">{selectedBooking.flyingDate || 'N/A'}</p>
                                       </div>
                                    </div>
                                    <div className="flex items-center gap-3 border-l border-slate-200 dark:border-slate-700 pl-4">
                                       <Activity size={16} className="text-emerald-500 shrink-0" />
                                       <div className="min-w-0">
                                          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Status</p>
                                          <p className="text-[10px] font-bold text-indigo-600 uppercase">{selectedBooking.status}</p>
                                       </div>
                                    </div>
                                 </div>
                               </>
                             ) : (
                               <>
                                  <div className={`col-span-2 p-4 rounded-xl border text-center ${isDarkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-100 bg-white'}`}>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1 tracking-widest">{selectedBooking.type === 'Visa' ? 'Country' : 'Destination'}</p>
                                    <p className="text-xl font-bold text-indigo-600 uppercase">{selectedBooking.to || '--'}</p>
                                 </div>
                                  <div className={`col-span-2 p-4 rounded-xl border grid grid-cols-2 gap-4 ${isDarkMode ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                                    <div className="flex items-center gap-3">
                                       <Calendar size={16} className="text-indigo-500 shrink-0" />
                                       <div className="min-w-0">
                                          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{selectedBooking.type === 'Visa' ? 'Application Date' : 'Travel Date'}</p>
                                          <p className="text-xs font-bold font-mono truncate">{selectedBooking.issueDate || selectedBooking.flyingDate || 'N/A'}</p>
                                       </div>
                                    </div>
                                    <div className="flex items-center gap-3 border-l border-slate-200 dark:border-slate-700 pl-4">
                                       <Activity size={16} className="text-emerald-500 shrink-0" />
                                       <div className="min-w-0">
                                          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Status</p>
                                          <p className="text-[10px] font-bold text-indigo-600 uppercase">{selectedBooking.status}</p>
                                       </div>
                                    </div>
                                 </div>
                               </>
                             )}
                          </div>
                       </section>
                    </div>

                    <div className="space-y-8">
                       <section className="space-y-3">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Financial Overview</label>
                          <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-indigo-50/30 border-indigo-100/50'}`}>
                             <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                   <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Revenue</span>
                                   <span className="font-bold text-lg font-mono">৳{selectedBooking.amount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-rose-500">
                                   <span className="text-[11px] font-bold uppercase tracking-wider">Operating Cost</span>
                                   <span className="font-bold text-lg font-mono">- ৳{selectedBooking.cost.toLocaleString()}</span>
                                </div>
                                <div className="pt-4 border-t border-indigo-200 dark:border-indigo-800 flex justify-between items-end">
                                   <div>
                                      <p className="text-[10px] font-bold uppercase text-indigo-400 mb-1 leading-none">Net Profit</p>
                                      <p className="text-3xl font-extrabold text-indigo-600 font-mono leading-none">৳{(selectedBooking.amount - selectedBooking.cost).toLocaleString()}</p>
                                   </div>
                                   <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${
                                     (selectedBooking.amount - selectedBooking.cost) > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                                   }`}>
                                      {(selectedBooking.amount - selectedBooking.cost) > 0 ? 'Profitable' : 'Loss'}
                                   </div>
                                </div>
                             </div>
                          </div>
                                               </section>

                        <section className="space-y-3">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">System Remarks</label>
                          <div className={`p-5 rounded-2xl border flex gap-3 ${isDarkMode ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                             <Info size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                             <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">
                               {selectedBooking.description || 'No specialized service notes provided for this record.'}
                             </p>
                          </div>
                       </section>
                    </div>
                 </div>
              </div>

               <div className="flex flex-col sm:flex-row gap-4 bg-slate-50/50 dark:bg-slate-900/50 px-10 py-8 border-t border-slate-100 dark:border-slate-800 shrink-0">
                  <button 
                    onClick={() => {
                      onDelete(selectedBooking.id);
                      setSelectedBooking(null);
                    }}
                    className={`flex-1 py-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all bg-rose-500/10 text-rose-500 hover:bg-rose-500/20`}>
                    Delete Record
                  </button>
                  <button 
                    onClick={() => handleEdit(selectedBooking)}
                    className={`flex-1 py-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${isDarkMode ? 'bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}>
                    Edit Reservation
                  </button>
                  <button 
                    onClick={handleExportData}
                    className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <Download size={18} />
                    Export Data
                  </button>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booking Entry Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[250] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
            onClick={handleAbort}
          >
            <motion.form 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onSubmit={handleSubmit}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden ${
                isDarkMode ? 'bg-slate-900 border border-slate-800 text-white' : 'bg-white text-slate-900'
              }`}
            >
              {/* Header */}
              <div className={`px-8 py-5 border-b flex items-center justify-between shrink-0 ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'bg-white border-slate-50'}`}>
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
                      <Zap size={20} className="text-white fill-current" />
                   </div>
                   <div>
                      <h3 className="text-xl font-bold tracking-tight">{editingBookingId ? 'Edit Reservation' : 'New Reservation'}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{editingBookingId ? 'Modifying existing entry in ledger' : 'Registering entry into ledger'}</p>
                   </div>
                </div>
                <button 
                  type="button"
                  onClick={handleAbort} 
                  className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-400'}`}
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 sm:p-10 scrollbar-hide">
                <div className="space-y-10">
                 {/* Type Selection */}
                 <section className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Categorization</label>
                    <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                      {['Air Ticket', 'Hotel', 'Visa', 'Package'].map(type => (
                        <button 
                          key={type}
                          type="button"
                          onClick={() => setFormData({...formData, type: type as any})}
                          className={`flex-1 py-3 rounded-lg text-xs font-bold transition-all ${formData.type === type ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                 </section>

                {/* Status Selection (Removed as requested) */}
                <div className="hidden">
                  <section className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Booking Status</label>
                    <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                      {[BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.CANCELLED].map(status => (
                        <button 
                          key={status}
                          type="button"
                          onClick={() => setFormData({...formData, status: status})}
                          className={`flex-1 py-3 rounded-lg text-xs font-bold transition-all ${formData.status === status ? 
                            status === BookingStatus.CONFIRMED ? 'bg-emerald-500 text-white shadow-sm' :
                            status === BookingStatus.CANCELLED ? 'bg-rose-500 text-white shadow-sm' :
                            'bg-amber-500 text-white shadow-sm' : 
                            'text-slate-500 hover:text-slate-700'}`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </section>
                </div>

                 {/* Information Grid */}
                 <section className="space-y-6">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Identity & Logistics</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                       <div className="col-span-1 md:col-span-2">
                          <label className="text-[11px] font-bold text-slate-500 mb-1.5 block uppercase tracking-wide">Connect to existing profile</label>
                          <select 
                            value={formData.clientId}
                            onChange={e => handleClientChange(e.target.value)}
                            className={`w-full px-4 py-3 border rounded-xl font-medium text-sm outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 focus:border-indigo-500' : 'bg-white border-slate-200 focus:border-indigo-500'}`}>
                            <option value="">None (Manual entry)</option>
                            {clients.map(cl => <option key={cl.id} value={cl.id}>{cl.name} ({cl.phone})</option>)}
                          </select>
                       </div>
                       
                       <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-500 block uppercase tracking-wide">Traveller Name</label>
                          <input required placeholder="As shown on document" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} className={`w-full px-4 py-3 border rounded-xl font-medium text-sm transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 focus:border-indigo-500' : 'bg-white border-slate-200 focus:border-indigo-500'}`} />
                       </div>
                       
                       <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-500 block uppercase tracking-wide">Contact Access</label>
                          <input required placeholder="+880..." value={formData.clientPhone} onChange={e => setFormData({...formData, clientPhone: e.target.value})} className={`w-full px-4 py-3 border rounded-xl font-medium text-sm transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 focus:border-indigo-500' : 'bg-white border-slate-200 focus:border-indigo-500'}`} />
                       </div>

                       <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-500 block uppercase tracking-wide">Unit Count (PAX)</label>
                          <input required type="number" min="1" value={formData.pax} onChange={e => setFormData({...formData, pax: Number(e.target.value)})} className={`w-full px-4 py-3 border rounded-xl font-medium text-sm transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 focus:border-indigo-500' : 'bg-white border-slate-200 focus:border-indigo-500'}`} />
                       </div>

                       <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-500 block uppercase tracking-wide">Reference Code (PNR)</label>
                          <input required placeholder="ABC12D" value={formData.pnr} onChange={e => setFormData({...formData, pnr: e.target.value.toUpperCase()})} className={`w-full px-4 py-3 border rounded-xl font-bold text-sm uppercase transition-all tracking-wider ${isDarkMode ? 'bg-slate-950 border-slate-800 focus:border-indigo-500' : 'bg-white border-slate-200 focus:border-indigo-500 text-indigo-600'}`} />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-500 block uppercase tracking-wide">Booking Source</label>
                          <input placeholder="Ex: OTA" value={formData.bookingSource} onChange={e => setFormData({...formData, bookingSource: e.target.value})} className={`w-full px-4 py-3 border rounded-xl font-medium text-sm transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 focus:border-indigo-500' : 'bg-white border-slate-200 focus:border-indigo-500'}`} />
                       </div>
                    </div>
                 </section>

                 {/* Travel Detail section */}
                 <section className="space-y-5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Specifics & Schedule</label>
                    <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-800/20 border-slate-800' : 'bg-slate-50/50 border-slate-200'}`}>
                       {formData.type === 'Hotel' ? (
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="col-span-1 md:col-span-2 space-y-1.5">
                              <label className="text-[11px] font-bold text-slate-500 uppercase">Hotel Designation</label>
                              <input required placeholder="Enter property name" value={formData.hotelName} onChange={e => setFormData({...formData, hotelName: e.target.value})} className={`w-full px-4 py-3 border rounded-xl font-medium text-sm ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`} />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[11px] font-bold text-slate-500 uppercase">Check-in Date</label>
                              <input required type="date" value={formData.checkIn} onChange={e => setFormData({...formData, checkIn: e.target.value})} className={`w-full px-4 py-3 border rounded-xl font-medium text-sm ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`} />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[11px] font-bold text-slate-500 uppercase">Check-out Date</label>
                              <input required type="date" value={formData.checkOut} onChange={e => setFormData({...formData, checkOut: e.target.value})} className={`w-full px-4 py-3 border rounded-xl font-medium text-sm ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`} />
                            </div>
                         </div>
                       ) : formData.type === 'Visa' ? (
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="col-span-1 md:col-span-2 space-y-1.5">
                              <label className="text-[11px] font-bold text-slate-500 uppercase">Country</label>
                              <input required placeholder="Enter country name" value={formData.to} onChange={e => setFormData({...formData, to: e.target.value})} className={`w-full px-4 py-3 border rounded-xl font-medium text-sm ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`} />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[11px] font-bold text-slate-500 uppercase">Application/Issue Date</label>
                              <input required type="date" value={formData.issueDate} onChange={e => setFormData({...formData, issueDate: e.target.value})} className={`w-full px-4 py-3 border rounded-xl font-medium text-sm ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`} />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[11px] font-bold text-slate-500 uppercase">Travel Date</label>
                              <input required type="date" value={formData.flyingDate} onChange={e => setFormData({...formData, flyingDate: e.target.value})} className={`w-full px-4 py-3 border rounded-xl font-medium text-sm ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`} />
                            </div>
                         </div>
                       ) : formData.type === 'Package' ? (
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="col-span-1 md:col-span-2 space-y-1.5">
                              <label className="text-[11px] font-bold text-slate-500 uppercase">Destination</label>
                              <input required placeholder="Enter destination" value={formData.to} onChange={e => setFormData({...formData, to: e.target.value})} className={`w-full px-4 py-3 border rounded-xl font-medium text-sm ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`} />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[11px] font-bold text-slate-500 uppercase">Start Date</label>
                              <input required type="date" value={formData.flyingDate} onChange={e => setFormData({...formData, flyingDate: e.target.value})} className={`w-full px-4 py-3 border rounded-xl font-medium text-sm ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`} />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[11px] font-bold text-slate-500 uppercase">End Date</label>
                              <input type="date" value={formData.issueDate} onChange={e => setFormData({...formData, issueDate: e.target.value})} className={`w-full px-4 py-3 border rounded-xl font-medium text-sm ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`} />
                            </div>
                         </div>
                       ) : (
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                               <label className="text-[11px] font-bold text-slate-500 uppercase">Origin (ICAO)</label>
                               <input required placeholder="DAC" value={formData.from} onChange={e => setFormData({...formData, from: e.target.value.toUpperCase()})} className={`w-full px-4 py-3 border rounded-xl font-medium text-sm uppercase ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`} />
                            </div>
                            <div className="space-y-1.5">
                               <label className="text-[11px] font-bold text-slate-500 uppercase">Destination (ICAO)</label>
                               <input required placeholder="DXB" value={formData.to} onChange={e => setFormData({...formData, to: e.target.value.toUpperCase()})} className={`w-full px-4 py-3 border rounded-xl font-medium text-sm uppercase ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`} />
                            </div>
                            <div className="space-y-1.5">
                               <label className="text-[11px] font-bold text-slate-500 uppercase">Travel Date</label>
                               <input required type="date" value={formData.flyingDate} onChange={e => setFormData({...formData, flyingDate: e.target.value})} className={`w-full px-4 py-3 border rounded-xl font-medium text-sm ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`} />
                            </div>
                            <div className="space-y-1.5">
                               <label className="text-[11px] font-bold text-slate-500 uppercase">Issue Date</label>
                               <input required type="date" value={formData.issueDate} onChange={e => setFormData({...formData, issueDate: e.target.value})} className={`w-full px-4 py-3 border rounded-xl font-medium text-sm ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`} />
                            </div>
                         </div>
                       )}
                    </div>
                 </section>

                 <section className="space-y-6">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Financial Attributes</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-500 uppercase">Selling Price (৳)</label>
                          <input required type="number" placeholder="0" value={formData.amount || ''} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} className={`w-full px-4 py-3 border rounded-xl font-bold text-lg text-indigo-600 focus:ring-2 focus:ring-indigo-500/10 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`} />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-500 uppercase">Direct Cost (৳)</label>
                          <input required type="number" placeholder="0" value={formData.cost || ''} onChange={e => setFormData({...formData, cost: Number(e.target.value)})} className={`w-full px-4 py-3 border rounded-xl font-bold text-lg text-rose-500 focus:ring-2 focus:ring-rose-500/10 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`} />
                       </div>
                       <div className="col-span-1 md:col-span-2 space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-500 uppercase">Internal Ledger Notes</label>
                          <textarea 
                            placeholder="Specify baggage, inclusions, or variations..."
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            className={`w-full px-4 py-3 border rounded-xl font-medium text-sm h-28 resize-none outline-none transition-all focus:ring-2 focus:ring-indigo-500/10 ${isDarkMode ? 'bg-slate-950 border-slate-800 focus:border-indigo-500' : 'bg-white border-slate-200 focus:border-indigo-500'}`}
                          />
                       </div>
                    </div>
                 </section>
                </div>
              </div>

              <div className={`px-8 py-5 border-t flex flex-col sm:flex-row gap-3 shrink-0 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-50'}`}>
                <button 
                  type="button" 
                  onClick={handleAbort}
                  disabled={isSynchronizing}
                  className={`flex-1 py-3 px-6 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}>
                    Abort Entry
                </button>
                <button 
                  type="submit" 
                  disabled={isSynchronizing}
                  className="flex-[2] py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  {isSynchronizing ? <><Activity size={16} className="animate-spin" /> Committing...</> : <><CheckCircle size={16} /> {editingBookingId ? 'Update Entry' : 'Confirm Entry'}</>}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookingList;
