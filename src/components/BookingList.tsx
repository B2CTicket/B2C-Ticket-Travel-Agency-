import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Booking, BookingStatus, Client } from '@/types';
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
  isDarkMode?: boolean;
}

const BookingList: React.FC<Props> = ({ bookings, clients, onAdd, isDarkMode }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

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
    onAdd(formData);
    setIsSynchronizing(false);
    setShowModal(false);
    setFormData({
      clientId: '', clientName: '', clientPhone: '', type: 'Air Ticket',
      date: new Date().toISOString().split('T')[0], issueDate: new Date().toISOString().split('T')[0],
      flyingDate: '', from: '', to: '', checkIn: '', checkOut: '', hotelName: '',
      amount: 0, cost: 0,
      status: BookingStatus.PENDING, description: '', pax: 1, pnr: '', bookingSource: ''
    });
  };

  const handleAbort = () => {
    setShowModal(false);
    setFormData({
      clientId: '', clientName: '', clientPhone: '', type: 'Air Ticket',
      date: new Date().toISOString().split('T')[0], issueDate: new Date().toISOString().split('T')[0],
      flyingDate: '', from: '', to: '', checkIn: '', checkOut: '', hotelName: '',
      amount: 0, cost: 0,
      status: BookingStatus.PENDING, description: '', pax: 1, pnr: '', bookingSource: ''
    });
  };

  return (
    <div className="space-y-12 pb-20">
      
      {/* Dynamic Command Header */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <motion.div 
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              className="w-14 h-14 bg-indigo-600 rounded-[20px] flex items-center justify-center shadow-2xl shadow-indigo-500/40 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
              <Activity className="text-white relative z-10" size={28} />
            </motion.div>
            <div>
              <h2 className={`text-5xl font-black tracking-tighter uppercase leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Booking <span className="text-indigo-600">Manager</span>
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">System Connected / Inventory Real-time</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          <div className="relative group w-full sm:w-96">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-all" size={20} />
            <input 
              type="text" 
              placeholder="Query PNR, Route, or Client..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-16 pr-8 py-5 text-sm font-bold border-2 rounded-[30px] outline-none transition-all ${
                isDarkMode ? 'bg-slate-900 border-slate-800 text-white focus:border-indigo-500/50' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/20 focus:border-indigo-500/50'
              }`} 
            />
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowModal(true)} 
            className="w-full sm:w-auto vibrant-gradient text-white px-10 py-5 rounded-[30px] shadow-2xl shadow-indigo-500/40 font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 whitespace-nowrap"
          >
            <Plus size={20} className="stroke-[4]" />
            New Reservation
          </motion.button>
        </div>
      </header>

      {/* Focus View: Next Priority Booking */}
      {upcomingTravel && !searchTerm && (
        <section className="animate-in fade-in slide-in-from-top-10 duration-1000">
          <div className={`p-1 flex flex-col md:flex-row rounded-[50px] border-2 relative overflow-hidden ${
            isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-100 shadow-2xl shadow-slate-200/50'
          }`}>
             {/* Scanner Line Decoration */}
             <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
                <div className="w-full h-px bg-indigo-500 absolute top-0 animate-scan"></div>
                <div className={`grid grid-cols-12 h-full w-full ${isDarkMode ? 'divide-slate-800' : 'divide-slate-200'} divide-x`}>
                   {[...Array(12)].map((_, i) => <div key={i}></div>)}
                </div>
             </div>

              <div className="flex-1 p-6 md:p-14 space-y-6 md:space-y-8 relative z-10">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="px-3 md:px-5 py-1.5 md:py-2 rounded-xl md:rounded-2xl bg-indigo-600 text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <Zap size={12} className="fill-current" /> Next Departure
                  </div>
                  <div className={`px-3 md:px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                    Flying In: {Math.ceil((new Date(upcomingTravel.flyingDate || upcomingTravel.checkIn || '').getTime() - new Date().getTime()) / (1000 * 3600 * 24))} Days
                  </div>
                </div>

                <div className="space-y-3 md:space-y-4">
                  <h3 className={`text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter uppercase leading-[0.9] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {upcomingTravel.type === 'Hotel' 
                      ? <><span className="text-indigo-600">STAY @</span> <br/> {upcomingTravel.hotelName}</>
                      : <>{upcomingTravel.from} <span className="text-indigo-600 font-sans">➔</span> {upcomingTravel.to}</>
                    }
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 md:gap-8">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-[24px] overflow-hidden border-2 md:border-4 border-indigo-500/20 bg-white shadow-lg">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${upcomingTravel.clientName}`} className="w-full h-full" />
                      </div>
                      <div>
                        <p className="text-sm md:text-lg font-black leading-none mb-1">{upcomingTravel.clientName}</p>
                        <p className="text-[9px] md:text-[11px] font-bold text-slate-500 uppercase tracking-widest font-mono">{upcomingTravel.pnr || 'UNSPECIFIED-ID'}</p>
                      </div>
                    </div>
                    <div className="h-10 w-px bg-slate-200 dark:bg-slate-800 hidden lg:block"></div>
                    <div className="space-y-0.5 md:space-y-1">
                      <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">Record Detail</p>
                      <div className="flex items-center gap-2 md:gap-3">
                         <span className={`text-lg md:text-2xl font-black ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>৳{upcomingTravel.amount.toLocaleString()}</span>
                         <span className="hidden xs:inline-block px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-500 text-[10px] font-black tracking-widest">+ Settlement Clear</span>
                      </div>
                    </div>
                  </div>
                </div>
             </div>

             <div className={`md:w-96 flex flex-col justify-between p-8 md:p-14 relative z-10 ${isDarkMode ? 'bg-indigo-600/10' : 'bg-slate-50'}`}>
                <div className="space-y-6 md:space-y-8 flex md:flex-col items-center md:items-start justify-between md:justify-start w-full">
                   <div className="space-y-1 md:space-y-4">
                      <div className="flex items-center justify-between gap-10 md:gap-0 font-black uppercase tracking-widest text-slate-400">
                         <span className="text-[8px] md:text-[11px]">Departure Date</span>
                         <Calendar size={12} className="hidden md:block" />
                      </div>
                      <p className="text-sm md:text-2xl font-black font-mono tracking-tighter">{upcomingTravel.flyingDate || upcomingTravel.checkIn}</p>
                   </div>
                   <div className="space-y-1 md:space-y-4">
                      <div className="flex items-center justify-between gap-10 md:gap-0 font-black uppercase tracking-widest text-slate-400">
                         <span className="text-[8px] md:text-[11px]">Pax Config</span>
                         <Users size={12} className="hidden md:block" />
                      </div>
                      <p className="text-sm md:text-2xl font-black font-mono tracking-tighter">0{upcomingTravel.pax || 1} UNIT(S)</p>
                   </div>
                </div>
                
                <motion.button 
                  whileHover={{ x: 10 }}
                  onClick={() => setSelectedBooking(upcomingTravel)}
                  className="mt-10 md:mt-0 w-full py-6 vibrant-gradient text-white rounded-3xl font-black uppercase text-[11px] tracking-[0.3em] shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-4 group"
                >
                  Review Booking <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                </motion.button>
             </div>
          </div>
        </section>
      )}

      {/* Cyber Boarding Pass Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredBookings.length > 0 ? filteredBookings.map((booking) => (
            <motion.div 
              layout
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              key={booking.id}
              onClick={() => setSelectedBooking(booking)}
              className={`group relative flex flex-col h-full rounded-[40px] border-2 transition-all cursor-pointer overflow-hidden ${
                isDarkMode 
                  ? 'bg-slate-900/60 border-slate-800 hover:border-indigo-500/50' 
                  : 'bg-white border-slate-100 shadow-xl shadow-slate-200/30 hover:border-indigo-300'
              }`}
            >
              {/* Boarding Pass Decorations */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-transparent -mr-16 -mt-16 rounded-full group-hover:scale-150 transition-all duration-700"></div>
              
              {/* Card Header (Tear-off Top) */}
              <div className={`px-8 py-6 flex items-center justify-between border-b-2 border-dashed ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${isDarkMode ? 'bg-slate-800 shadow-inner' : 'bg-indigo-50'}`}>
                    {booking.type === 'Air Ticket' ? <Plane size={18} className="text-indigo-600 rotate-45" /> : booking.type === 'Hotel' ? <Building2 size={18} className="text-indigo-600" /> : <Globe size={18} className="text-indigo-600" />}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-[0.3em] font-mono ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                    INV#{booking.id.split('-')[0].toUpperCase()}
                  </span>
                </div>
                <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                  booking.status === BookingStatus.CONFIRMED ? 'bg-emerald-500/10 text-emerald-500' : 
                  booking.status === BookingStatus.PENDING ? 'bg-amber-500/10 text-amber-500' : 
                  'bg-rose-500/10 text-rose-500'
                }`}>
                  {booking.status}
                </div>
              </div>

              {/* Main Body */}
              <div className="flex-1 p-8 space-y-7 relative">
                {/* Boarding Pass Notches */}
                <div className={`absolute left-0 top-0 -translate-x-1/2 w-8 h-8 rounded-full ${isDarkMode ? 'bg-slate-950 shadow-[inset_-4px_0_0_#1e293b]' : 'bg-[#f8f9ff] shadow-[inset_-4px_0_0_#f1f5f9]'}`}></div>
                <div className={`absolute right-0 top-0 translate-x-1/2 w-8 h-8 rounded-full ${isDarkMode ? 'bg-slate-950 shadow-[inset_4px_0_0_#1e293b]' : 'bg-[#f8f9ff] shadow-[inset_4px_0_0_#f1f5f9]'}`}></div>

                <div className="flex justify-between items-end">
                   <div className="space-y-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Passenger Master</p>
                      <div className="flex items-center gap-3">
                         <div className="w-12 h-12 rounded-[18px] border-2 border-indigo-500/20 bg-white shadow-lg overflow-hidden group-hover:scale-110 transition-transform">
                             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${booking.clientName}`} alt="Pax" className="w-full h-full" />
                         </div>
                         <div>
                            <h4 className="text-base font-black truncate max-w-[120px]">{booking.clientName}</h4>
                            <p className="text-[10px] font-bold text-slate-500 font-mono">PNR: {booking.pnr || '---'}</p>
                         </div>
                      </div>
                   </div>
                   <div className="text-right space-y-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Yield Settlement</p>
                      <p className={`text-2xl font-black font-mono tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>৳{booking.amount.toLocaleString()}</p>
                   </div>
                </div>

                <div className={`p-6 rounded-[30px] border-2 relative overflow-hidden flex items-center justify-between group-hover:bg-indigo-500/5 transition-all ${
                  isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-100'
                }`}>
                   <div className="absolute top-0 right-0 w-full h-full pointer-events-none opacity-[0.05]">
                      <div className="w-full h-full repeating-grid-dots"></div>
                   </div>

                   {booking.type === 'Hotel' ? (
                     <>
                        <div className="text-center">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Check-In</p>
                          <p className="text-xs font-black font-mono tracking-widest">{booking.checkIn?.split('-').reverse().slice(0,2).join('.') || '00.00'}</p>
                        </div>
                        <div className="flex-1 px-4 flex flex-col items-center">
                           <div className="w-full h-px border-t-2 border-dashed border-indigo-500/20 relative">
                              <Bed size={16} className="absolute -top-[9px] left-1/2 -translate-x-1/2 text-indigo-500" />
                           </div>
                        </div>
                        <div className="text-center">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Check-Out</p>
                          <p className="text-xs font-black font-mono tracking-widest">{booking.checkOut?.split('-').reverse().slice(0,2).join('.') || '00.00'}</p>
                        </div>
                     </>
                   ) : (
                     <>
                        <div className="text-center">
                          <p className="text-base font-black font-mono tracking-tighter text-indigo-500">{booking.from || '---'}</p>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Origin</p>
                        </div>
                        <div className="flex-1 px-6">
                           <div className="w-full h-px bg-slate-300 dark:bg-slate-700 relative">
                              <Plane size={14} className="absolute -top-[6px] left-1/2 -translate-x-1/2 text-indigo-500 group-hover:left-[90%] transition-all duration-700" />
                              <div className="absolute inset-0 bg-indigo-500 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                           </div>
                        </div>
                        <div className="text-center">
                          <p className="text-base font-black font-mono tracking-tighter text-indigo-500">{booking.to || '---'}</p>
                          <p className={`text-[8px] font-black ${isDarkMode ? 'text-slate-400' : 'text-slate-400'} uppercase tracking-widest mt-1`}>Terminal</p>
                        </div>
                     </>
                   )}
                </div>
              </div>

              {/* Footer Part */}
              <div className={`px-8 py-5 border-t-2 flex items-center justify-between ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                <div className="flex items-center gap-2">
                   <Clock size={12} className="text-slate-400" />
                   <p className="text-[10px] font-black font-mono text-slate-500 uppercase tracking-widest">
                     Booking Date: {booking.flyingDate || booking.checkIn || 'PENDING'}
                   </p>
                </div>
                <div className="flex items-center gap-2">
                   <div className="h-1.5 w-1.5 rounded-full bg-indigo-500"></div>
                   <p className="text-[10px] font-black text-slate-400 tracking-widest">{booking.pax || 1} UNIT(S)</p>
                </div>
              </div>

              {/* Bottom Decoration: Barcode Style */}
              <div className="px-8 pb-4 flex gap-1 h-3 opacity-20 group-hover:opacity-40 transition-opacity">
                 {[...Array(24)].map((_, i) => (
                   <div key={i} className={`flex-1 ${i % 3 === 0 ? 'bg-slate-900 dark:bg-white' : 'bg-transparent'}`}></div>
                 ))}
              </div>
            </motion.div>
          )) : (
            <div className="col-span-full py-32 flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative">
                <Globe size={120} className="text-slate-700 dark:text-slate-200 animate-pulse-slow opacity-20" />
                <AlertTriangle size={40} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-500/30" />
              </div>
              <div>
                <h3 className={`text-2xl font-black uppercase tracking-[0.3em] ${isDarkMode ? 'text-slate-400' : 'text-slate-300'}`}>No Recent Booking Data</h3>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 opacity-50 mt-2">Enter search criteria to find bookings</p>
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
            className="fixed inset-0 z-[120] bg-slate-950/90 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className={`w-full h-full flex flex-col relative ${
                isDarkMode ? 'bg-[#0f172a] text-white' : 'bg-white'
              }`}
            >
               <div className="h-2 w-full vibrant-gradient shrink-0"></div>
               
               {/* Modal Header */}
               <div className={`px-8 py-8 sm:px-16 border-b shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                  <div>
                     <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest">Live Record</span>
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>UID: {selectedBooking.id.toUpperCase()}</span>
                     </div>
                     <h3 className="text-4xl sm:text-5xl font-black tracking-tighter uppercase leading-none">
                        {selectedBooking.type} <span className="opacity-30">/ {selectedBooking.pnr || 'UNASSIGNED'}</span>
                     </h3>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedBooking(null)} 
                    className={`p-4 rounded-2xl transition-all ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500 shadow-sm'}`}
                  >
                    <X size={28} />
                  </motion.button>
               </div>
               
               <div className="flex-1 overflow-y-auto no-scrollbar">
                  <div className="max-w-7xl mx-auto p-8 sm:p-16 space-y-16">

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-16">
                    <div className="space-y-12">
                       {/* Section 01: Customer Profile */}
                       <section className="space-y-4">
                          <div className="flex items-center gap-3">
                             <span className="w-8 h-8 rounded-lg bg-indigo-600/10 flex items-center justify-center text-indigo-600 font-bold text-xs">01</span>
                             <label className="text-sm font-bold text-slate-800 dark:text-slate-200">Customer Profile</label>
                          </div>
                          <div className={`p-6 rounded-3xl border flex items-center gap-6 ${isDarkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200 shadow-sm'}`}>
                             <div className="relative">
                               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedBooking.clientName}`} className="w-20 h-20 rounded-2xl bg-white shadow-lg relative z-10" />
                               <div className="absolute -inset-1 bg-indigo-500/10 blur-lg"></div>
                             </div>
                             <div className="flex-1">
                                <p className="text-2xl font-black tracking-tight">{selectedBooking.clientName}</p>
                                <div className="flex items-center gap-2 text-sm font-bold text-slate-500 mt-1">
                                  <Phone size={16} className="text-indigo-500" />
                                  <span>{selectedBooking.clientPhone || 'No contact provided'}</span>
                                </div>
                                <div className="flex gap-2 mt-3 text-[10px] font-bold uppercase tracking-widest">
                                  <span className="px-3 py-1 rounded-lg bg-indigo-600 text-white">{selectedBooking.pax || 1} PAX</span>
                                  <span className={`px-3 py-1 rounded-lg border ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-400' : 'bg-white border-slate-200 text-slate-500'}`}>Verified</span>
                                </div>
                             </div>
                          </div>
                       </section>

                       {/* Section 02: Itinerary Data */}
                       <section className="space-y-4">
                          <div className="flex items-center gap-3">
                             <span className="w-8 h-8 rounded-lg bg-indigo-600/10 flex items-center justify-center text-indigo-600 font-bold text-xs">02</span>
                             <label className="text-sm font-bold text-slate-800 dark:text-slate-200">Itinerary Data</label>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                             {selectedBooking.type === 'Hotel' ? (
                               <>
                                 <div className={`p-6 rounded-3xl border text-center flex flex-col justify-center ${isDarkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-100 bg-white shadow-sm'}`}>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Check-In</p>
                                    <p className="text-lg font-mono font-bold text-indigo-500">{selectedBooking.checkIn || '--'}</p>
                                 </div>
                                 <div className={`p-6 rounded-3xl border text-center flex flex-col justify-center ${isDarkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-100 bg-white shadow-sm'}`}>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Check-Out</p>
                                    <p className="text-lg font-mono font-bold text-indigo-500">{selectedBooking.checkOut || '--'}</p>
                                 </div>
                                 <div className={`col-span-2 p-6 rounded-3xl border-2 border-dashed flex items-center justify-between ${isDarkMode ? 'border-indigo-500/20 bg-indigo-500/5' : 'border-indigo-100 bg-indigo-50/30'}`}>
                                    <div className="flex items-center gap-4">
                                       <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-md">
                                          <Building2 size={20} className="text-indigo-600" />
                                       </div>
                                       <div>
                                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Hotel Name</p>
                                          <span className="text-base font-bold">{selectedBooking.hotelName || 'Pending Assignment'}</span>
                                       </div>
                                    </div>
                                    <ShieldCheck size={24} className="text-emerald-500" />
                                 </div>
                               </>
                             ) : (
                               <>
                                 <div className={`p-6 rounded-3xl border text-center flex flex-col justify-center ${isDarkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-100 bg-white shadow-sm'}`}>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest">Departure</p>
                                    <p className="text-3xl font-mono font-black text-indigo-500 uppercase leading-none">{selectedBooking.from || '--'}</p>
                                 </div>
                                 <div className={`p-6 rounded-3xl border text-center flex flex-col justify-center ${isDarkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-100 bg-white shadow-sm'}`}>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest">Arrival</p>
                                    <p className="text-3xl font-mono font-black text-indigo-500 uppercase leading-none">{selectedBooking.to || '--'}</p>
                                 </div>
                                 <div className={`col-span-2 p-6 rounded-3xl border grid grid-cols-2 gap-6 ${isDarkMode ? 'bg-indigo-600/10 border-indigo-500/20' : 'bg-slate-50 border-slate-100'}`}>
                                    <div className="flex items-center gap-4">
                                       <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-md">
                                          <Clock size={20} className="text-indigo-600" />
                                       </div>
                                       <div>
                                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Flight Date</p>
                                          <p className="text-xs font-bold font-mono">{selectedBooking.flyingDate || 'Awaiting Date'}</p>
                                       </div>
                                    </div>
                                    <div className="flex items-center gap-4 border-l border-slate-200 dark:border-slate-800 pl-6">
                                       <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-md">
                                          <ShieldCheck size={20} className="text-emerald-500" />
                                       </div>
                                       <div>
                                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">PNR Record</p>
                                          <p className="text-xs font-bold font-mono uppercase text-indigo-500">{selectedBooking.pnr || 'Not Assigned'}</p>
                                       </div>
                                    </div>
                                 </div>
                               </>
                             )}
                          </div>
                       </section>
                    </div>

                    <div className="space-y-12">
                       {/* Section 03: Booking Metadata */}
                       <section className="space-y-4">
                          <div className="flex items-center gap-3">
                             <span className="w-8 h-8 rounded-lg bg-indigo-600/10 flex items-center justify-center text-indigo-600 font-bold text-xs">03</span>
                             <label className="text-sm font-bold text-slate-800 dark:text-slate-200">Booking Metadata</label>
                          </div>
                          <div className={`p-8 rounded-3xl border grid grid-cols-1 md:grid-cols-2 gap-8 ${isDarkMode ? 'bg-slate-900/40 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
                             <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                   <Calendar className="text-indigo-500" size={14} />
                                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Issue Date</p>
                                </div>
                                <p className="text-lg font-bold font-mono text-slate-800 dark:text-slate-200">{selectedBooking.issueDate || selectedBooking.date}</p>
                             </div>
                             <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                   <Globe className="text-indigo-500" size={14} />
                                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reference</p>
                                </div>
                                <p className="text-lg font-bold font-mono uppercase text-indigo-600">{selectedBooking.category || 'Direct Entry'}</p>
                             </div>
                             <div className="col-span-1 md:col-span-2 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
                                <div className="flex items-center gap-2">
                                   <Info className="text-indigo-500" size={14} />
                                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Service Notes</p>
                                </div>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed italic">
                                   "{selectedBooking.description || 'No additional service notes provided.'}"
                                </p>
                             </div>
                          </div>
                       </section>

                       {/* Section 04: Accounting Overview */}
                       <section className="space-y-4">
                          <div className="flex items-center gap-3">
                             <span className="w-8 h-8 rounded-lg bg-indigo-600/10 flex items-center justify-center text-indigo-600 font-bold text-xs">04</span>
                             <label className="text-sm font-bold text-slate-800 dark:text-slate-200">Accounting Overview</label>
                          </div>
                          <div className={`p-8 rounded-3xl border relative overflow-hidden ${isDarkMode ? 'bg-indigo-600/5 border-indigo-500/20' : 'bg-slate-50 border-slate-200'}`}>
                             <div className="space-y-4 relative z-10">
                                <div className="flex justify-between items-center text-slate-500">
                                   <div className="flex items-center gap-2">
                                      <span className="uppercase tracking-widest text-[10px] font-bold">Total Revenue</span>
                                   </div>
                                   <span className="font-bold text-xl font-mono">৳{selectedBooking.amount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-slate-500">
                                   <div className="flex items-center gap-2">
                                      <span className="uppercase tracking-widest text-[10px] font-bold text-rose-500">Operational Cost</span>
                                   </div>
                                   <span className="font-bold text-xl font-mono text-rose-500">৳{selectedBooking.cost.toLocaleString()}</span>
                                </div>
                                <div className="pt-6 border-t-2 border-indigo-500/20 flex flex-col gap-1 text-center">
                                   <p className="font-bold text-[10px] uppercase tracking-widest text-indigo-500">Net Profit</p>
                                   <p className="text-5xl font-black tracking-tighter text-indigo-600 font-mono">৳{(selectedBooking.amount - selectedBooking.cost).toLocaleString()}</p>
                                </div>
                             </div>
                          </div>
                       </section>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-6 pt-12 pb-20">
                     <motion.button 
                       whileHover={{ backgroundColor: isDarkMode ? '#1e293b' : '#e2e8f0' }}
                       onClick={() => setSelectedBooking(null)}
                       className={`flex-1 py-6 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                        Return to List
                      </motion.button>
                     <motion.button 
                       whileHover={{ scale: 1.02 }}
                       whileTap={{ scale: 0.98 }}
                       className="flex-1 py-6 vibrant-gradient text-white rounded-2xl text-xs font-bold uppercase tracking-widest shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-4"
                     >
                        <Download size={20} />
                        Generate Financial Report
                     </motion.button>
                  </div>
               </div>
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
            className="fixed inset-0 z-[150] bg-slate-950/95 backdrop-blur-xl"
          >
            <motion.form 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 35, stiffness: 300 }}
              onSubmit={handleSubmit}
              className={`w-full h-full flex flex-col ${
                isDarkMode ? 'bg-[#0b1120] text-white' : 'bg-white'
              }`}
            >
              {/* Header */}
              <div className={`px-8 py-8 sm:px-16 border-b flex items-center justify-between shrink-0 ${isDarkMode ? 'border-slate-800 bg-[#0b1120]' : 'bg-white border-slate-100'}`}>
                <div className="flex items-center gap-5">
                   <div className="w-14 h-14 vibrant-gradient rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/30">
                      <Zap size={28} className="text-white fill-current" />
                   </div>
                   <div>
                      <h3 className="text-3xl sm:text-4xl font-black tracking-tighter leading-none uppercase">Entry <span className="text-indigo-600">Terminal</span></h3>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-2">Initializing new reservation sequence</p>
                   </div>
                </div>
                <motion.button 
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={handleAbort} 
                  className={`p-4 rounded-2xl transition-all ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500'}`}
                >
                  <X size={28} />
                </motion.button>
              </div>
              
              <div className="flex-1 overflow-y-auto no-scrollbar">
                <div className="max-w-5xl mx-auto p-8 sm:p-16 space-y-20">
                 <section className="space-y-6">
                    <div className="flex items-center gap-3">
                       <span className="w-8 h-8 rounded-lg bg-indigo-600/10 flex items-center justify-center text-indigo-600 font-bold text-xs">01</span>
                       <label className="text-sm font-bold text-slate-800 dark:text-slate-200">Reservation Type</label>
                    </div>
                    <div className="flex p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                      {['Air Ticket', 'Hotel', 'Visa', 'Package'].map(type => (
                        <button 
                          key={type}
                          type="button"
                          onClick={() => setFormData({...formData, type: type as any})}
                          className={`flex-1 py-3.5 rounded-xl text-xs font-bold transition-all ${formData.type === type ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                 </section>

                 <section className="space-y-8">
                    <div className="flex items-center gap-3">
                       <span className="w-8 h-8 rounded-lg bg-indigo-600/10 flex items-center justify-center text-indigo-600 font-bold text-xs">02</span>
                       <label className="text-sm font-bold text-slate-800 dark:text-slate-200">Customer Details</label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="col-span-1 md:col-span-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2.5">Select from Inventory</label>
                          <select 
                            required
                            value={formData.clientId}
                            onChange={e => handleClientChange(e.target.value)}
                            className={`w-full px-6 py-4 border rounded-2xl font-bold text-sm outline-none transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800 focus:border-indigo-500' : 'bg-slate-50 border-slate-200 focus:border-indigo-500 shadow-sm'}`}>
                            <option value="">Find customer in system...</option>
                            {clients.map(cl => <option key={cl.id} value={cl.id}>{cl.name} ({cl.phone})</option>)}
                          </select>
                       </div>
                       
                       <div className="space-y-2.5">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Customer Name</label>
                          <div className="relative">
                            <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input required placeholder="Enter name" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} className={`w-full pl-12 pr-6 py-4 border rounded-2xl font-bold text-sm transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800 focus:border-indigo-500 shadow-sm' : 'bg-white border-slate-200 focus:border-indigo-500 shadow-sm'}`} />
                          </div>
                       </div>
                       
                       <div className="space-y-2.5">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Phone Number</label>
                          <div className="relative">
                            <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input required placeholder="Contact number" value={formData.clientPhone} onChange={e => setFormData({...formData, clientPhone: e.target.value})} className={`w-full pl-12 pr-6 py-4 border rounded-2xl font-bold text-sm transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800 focus:border-indigo-500 shadow-sm' : 'bg-white border-slate-200 focus:border-indigo-500 shadow-sm'}`} />
                          </div>
                       </div>
 
                       <div className="space-y-2.5">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Travelers (PAX)</label>
                          <div className="relative">
                            <Users className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input required type="number" min="1" value={formData.pax} onChange={e => setFormData({...formData, pax: Number(e.target.value)})} className={`w-full pl-12 pr-6 py-4 border rounded-2xl font-bold text-sm outline-none transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800 focus:border-indigo-500 shadow-sm' : 'bg-white border-slate-200 focus:border-indigo-500 shadow-sm'}`} />
                          </div>
                       </div>
 
                       <div className="space-y-2.5">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Booking Platform</label>
                          <div className="relative">
                            <Globe className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input placeholder="GDS, B2B, Direct..." value={formData.bookingSource} onChange={e => setFormData({...formData, bookingSource: e.target.value})} className={`w-full pl-12 pr-6 py-4 border rounded-2xl font-bold text-sm transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800 focus:border-indigo-500 shadow-sm' : 'bg-white border-slate-200 focus:border-indigo-500 shadow-sm'}`} />
                          </div>
                       </div>
                       
                       <div className="col-span-1 md:col-span-2 space-y-2.5">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Reference / PNR</label>
                          <div className="relative">
                            <Hash className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-500" size={18} />
                            <input required placeholder="Enter PNR or Ref ID" value={formData.pnr} onChange={e => setFormData({...formData, pnr: e.target.value.toUpperCase()})} className={`w-full pl-12 pr-6 py-4 border rounded-2xl font-bold text-sm uppercase transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800 focus:border-indigo-500 shadow-sm' : 'bg-white border-slate-200 focus:border-indigo-500 shadow-sm'}`} />
                          </div>
                       </div>
                    </div>
                 </section>

                 <section className="space-y-8">
                    <div className="flex items-center gap-3">
                       <span className="w-8 h-8 rounded-lg bg-indigo-600/10 flex items-center justify-center text-indigo-600 font-bold text-xs">03</span>
                       <label className="text-sm font-bold text-slate-800 dark:text-slate-200">Travel Logistics</label>
                    </div>
                    <div className={`p-8 rounded-3xl border-2 border-dashed border-indigo-500/20 grid grid-cols-1 md:grid-cols-2 gap-8 ${isDarkMode ? 'bg-indigo-500/5' : 'bg-slate-50/50'}`}>
                       {formData.type === 'Hotel' ? (
                         <>
                           <div className="col-span-1 md:col-span-2 space-y-2.5">
                             <label className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Hotel Name</label>
                             <input required placeholder="e.g. Radisson Blu" value={formData.hotelName} onChange={e => setFormData({...formData, hotelName: e.target.value})} className={`w-full px-6 py-4 border rounded-xl font-bold text-sm ${isDarkMode ? 'bg-slate-950 border-slate-800 focus:border-indigo-500' : 'bg-white border-slate-200 focus:border-indigo-500 shadow-sm'}`} />
                           </div>
                           <div className="space-y-2.5">
                             <label className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Check-in</label>
                             <input required type="date" value={formData.checkIn} onChange={e => setFormData({...formData, checkIn: e.target.value})} className={`w-full px-6 py-4 border rounded-xl font-bold text-sm ${isDarkMode ? 'bg-slate-950 border-slate-800 focus:border-indigo-500' : 'bg-white border-slate-200 focus:border-indigo-500 shadow-sm'}`} />
                           </div>
                           <div className="space-y-2.5">
                             <label className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Check-out</label>
                             <input required type="date" value={formData.checkOut} onChange={e => setFormData({...formData, checkOut: e.target.value})} className={`w-full px-6 py-4 border rounded-xl font-bold text-sm ${isDarkMode ? 'bg-slate-950 border-slate-800 focus:border-indigo-500' : 'bg-white border-slate-200 focus:border-indigo-500 shadow-sm'}`} />
                           </div>
                         </>
                       ) : (
                         <>
                           <div className="space-y-2.5">
                              <label className="text-xs font-bold text-indigo-600 uppercase tracking-widest">From (Origin)</label>
                              <input required placeholder="e.g. DAC" value={formData.from} onChange={e => setFormData({...formData, from: e.target.value.toUpperCase()})} className={`w-full px-6 py-4 border rounded-xl font-bold text-sm uppercase ${isDarkMode ? 'bg-slate-950 border-slate-800 focus:border-indigo-500' : 'bg-white border-slate-200 focus:border-indigo-500 shadow-sm'}`} />
                           </div>
                           <div className="space-y-2.5">
                              <label className="text-xs font-bold text-indigo-600 uppercase tracking-widest">To (Dest.)</label>
                              <input required placeholder="e.g. DXB" value={formData.to} onChange={e => setFormData({...formData, to: e.target.value.toUpperCase()})} className={`w-full px-6 py-4 border rounded-xl font-bold text-sm uppercase ${isDarkMode ? 'bg-slate-950 border-slate-800 focus:border-indigo-500' : 'bg-white border-slate-200 focus:border-indigo-500 shadow-sm'}`} />
                           </div>
                           <div className="space-y-2.5">
                              <label className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Travel Date</label>
                              <input required type="date" value={formData.flyingDate} onChange={e => setFormData({...formData, flyingDate: e.target.value})} className={`w-full px-6 py-4 border rounded-xl font-bold text-sm ${isDarkMode ? 'bg-slate-950 border-slate-800 focus:border-indigo-500' : 'bg-white border-slate-200 focus:border-indigo-500 shadow-sm'}`} />
                           </div>
                           <div className="space-y-2.5">
                              <label className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Issue Date</label>
                              <input required type="date" value={formData.issueDate} onChange={e => setFormData({...formData, issueDate: e.target.value})} className={`w-full px-6 py-4 border rounded-xl font-bold text-sm ${isDarkMode ? 'bg-slate-950 border-slate-800 focus:border-indigo-500' : 'bg-white border-slate-200 focus:border-indigo-500 shadow-sm'}`} />
                           </div>
                         </>
                       )}
                    </div>
                 </section>

                 <section className="space-y-8">
                    <div className="flex items-center gap-3">
                       <span className="w-8 h-8 rounded-lg bg-indigo-600/10 flex items-center justify-center text-indigo-600 font-bold text-xs">04</span>
                       <label className="text-sm font-bold text-slate-800 dark:text-slate-200">Accounting Details</label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className={`p-8 rounded-3xl border transition-all focus-within:ring-2 focus-within:ring-indigo-500/20 ${isDarkMode ? 'bg-indigo-950/20 border-indigo-500/20' : 'bg-indigo-50/50 border-indigo-100 shadow-sm'}`}>
                          <label className="text-[10px] font-black text-indigo-600 uppercase block mb-3 tracking-widest">Invoice Amount (৳)</label>
                          <div className="relative">
                            <Banknote className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-500" size={28} />
                            <input required type="number" placeholder="0.00" value={formData.amount || ''} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} className={`w-full pl-16 pr-6 py-6 border rounded-2xl font-black text-3xl outline-none transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800 text-indigo-400' : 'bg-white border-indigo-100 text-indigo-700 shadow-inner'}`} />
                          </div>
                       </div>
                       <div className={`p-8 rounded-3xl border transition-all focus-within:ring-2 focus-within:ring-rose-500/20 ${isDarkMode ? 'bg-rose-950/20 border-rose-500/20' : 'bg-rose-50/50 border-rose-100 shadow-sm'}`}>
                          <label className="text-[10px] font-black text-rose-600 uppercase block mb-3 tracking-widest">Service Cost (৳)</label>
                          <div className="relative">
                            <Briefcase className="absolute left-6 top-1/2 -translate-y-1/2 text-rose-500" size={28} />
                            <input required type="number" placeholder="0.00" value={formData.cost || ''} onChange={e => setFormData({...formData, cost: Number(e.target.value)})} className={`w-full pl-16 pr-6 py-6 border rounded-2xl font-black text-3xl outline-none transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800 text-rose-400' : 'bg-white border-rose-100 text-rose-700 shadow-inner'}`} />
                          </div>
                       </div>
                       <div className="col-span-1 md:col-span-2 space-y-2.5">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Service Notes</label>
                          <textarea 
                            required
                            placeholder="Specify baggage details, inclusions, or specific requests..."
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            className={`w-full px-6 py-5 border rounded-2xl font-medium text-sm h-32 resize-none outline-none transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800 focus:border-indigo-500' : 'bg-slate-50 border-slate-200 focus:border-indigo-500 shadow-inner'}`}
                          />
                       </div>
                    </div>
                 </section>
              </div>

              </div>

            <div className={`p-10 border-t shrink-0 ${isDarkMode ? 'bg-[#0b1120] border-slate-800' : 'bg-slate-50/80 border-slate-200'}`}>
                 <div className="max-w-5xl mx-auto flex flex-col sm:flex-row gap-6">
                   <motion.button 
                    whileHover={{ backgroundColor: isDarkMode ? '#1e293b' : '#e2e8f0' }}
                    type="button" 
                    onClick={handleAbort} 
                    disabled={isSynchronizing}
                    className={`flex-1 py-6 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all ${isDarkMode ? 'bg-slate-800 text-slate-400 disabled:opacity-50' : 'bg-slate-200 text-slate-600 disabled:opacity-50'}`}>
                      Cancel Entry
                    </motion.button>
                   <motion.button 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit" 
                    disabled={isSynchronizing}
                    className="flex-1 py-6 vibrant-gradient text-white text-xs font-bold uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-500/30 disabled:opacity-70 transition-all flex items-center justify-center gap-3"
                  >
                      {isSynchronizing ? (
                        <>
                           <Activity size={20} className="animate-spin" />
                           <span>Synchronizing...</span>
                        </>
                      ) : (
                        <>
                           <CheckCircle size={20} />
                           <span>Commit Reservation</span>
                        </>
                      )}
                    </motion.button>
                 </div>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookingList;
