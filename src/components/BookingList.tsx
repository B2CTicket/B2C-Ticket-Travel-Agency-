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
                Operational <span className="text-indigo-600">Sync</span>
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Grid Status: Online / Inventory Secured</p>
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
            New Mission
          </motion.button>
        </div>
      </header>

      {/* Focus View: Current Priority Mission */}
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

             <div className="flex-1 p-10 md:p-14 space-y-8 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="px-5 py-2 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <Zap size={14} className="fill-current" /> Priority Mission
                  </div>
                  <div className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                    T-Minus: {Math.ceil((new Date(upcomingTravel.flyingDate || upcomingTravel.checkIn || '').getTime() - new Date().getTime()) / (1000 * 3600 * 24))} Days
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className={`text-5xl md:text-6xl font-black tracking-tighter uppercase leading-[0.9] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {upcomingTravel.type === 'Hotel' 
                      ? <><span className="text-indigo-600">STAY @</span> <br/> {upcomingTravel.hotelName}</>
                      : <>{upcomingTravel.from} <span className="text-indigo-600">➔</span> {upcomingTravel.to}</>
                    }
                  </h3>
                  <div className="flex flex-wrap items-center gap-8">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-[24px] overflow-hidden border-4 border-indigo-500/20 bg-white">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${upcomingTravel.clientName}`} className="w-full h-full" />
                      </div>
                      <div>
                        <p className="text-lg font-black leading-none mb-1">{upcomingTravel.clientName}</p>
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest font-mono">{upcomingTravel.pnr || 'UNSPECIFIED-ID'}</p>
                      </div>
                    </div>
                    <div className="h-12 w-px bg-slate-200 dark:bg-slate-800 hidden lg:block"></div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Operation Pulse</p>
                      <div className="flex items-center gap-3">
                         <span className={`text-2xl font-black ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>৳{upcomingTravel.amount.toLocaleString()}</span>
                         <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-500 text-[10px] font-black tracking-widest">+ Settlement Clear</span>
                      </div>
                    </div>
                  </div>
                </div>
             </div>

             <div className={`md:w-96 flex flex-col justify-between p-10 md:p-14 relative z-10 ${isDarkMode ? 'bg-indigo-600/10' : 'bg-slate-50'}`}>
                <div className="space-y-8">
                   <div className="space-y-4">
                      <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-slate-400">
                         <span>Departure Date</span>
                         <Calendar size={14} />
                      </div>
                      <p className="text-2xl font-black font-mono tracking-tighter">{upcomingTravel.flyingDate || upcomingTravel.checkIn}</p>
                   </div>
                   <div className="space-y-4">
                      <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-slate-400">
                         <span>Pax Configuration</span>
                         <Users size={14} />
                      </div>
                      <p className="text-2xl font-black font-mono tracking-tighter">0{upcomingTravel.pax || 1} UNIT(S)</p>
                   </div>
                </div>
                
                <motion.button 
                  whileHover={{ x: 10 }}
                  onClick={() => setSelectedBooking(upcomingTravel)}
                  className="mt-10 md:mt-0 w-full py-6 vibrant-gradient text-white rounded-3xl font-black uppercase text-[11px] tracking-[0.3em] shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-4 group"
                >
                  Sync Terminal <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
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
                     Mission: {booking.flyingDate || booking.checkIn || 'PENDING'}
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
                <h3 className={`text-2xl font-black uppercase tracking-[0.3em] ${isDarkMode ? 'text-slate-400' : 'text-slate-300'}`}>No Active Mission Data</h3>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 opacity-50 mt-2">Initialize synchronization to populate terminal</p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Reservation Terminal Modal */}
      <AnimatePresence>
        {selectedBooking && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center p-0 sm:p-6 bg-slate-950/90 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className={`rounded-none sm:rounded-[60px] w-full max-w-5xl shadow-2xl h-full sm:h-auto max-h-[95vh] overflow-hidden flex flex-col relative ${
                isDarkMode ? 'bg-[#0f172a] border border-slate-800' : 'bg-white'
              }`}
            >
               <div className="h-3 w-full vibrant-gradient"></div>
               
               <div className="p-10 sm:p-16 overflow-y-auto no-scrollbar space-y-16">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="px-5 py-1.5 rounded-2xl bg-indigo-600 text-white text-[11px] font-black uppercase tracking-widest">Active Data Stream</span>
                        <span className={`text-[11px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Node ID: {selectedBooking.id.toUpperCase()}</span>
                      </div>
                      <h3 className="text-5xl md:text-6xl font-black tracking-tighter uppercase leading-none">
                        {selectedBooking.type} <span className="opacity-30">/ {selectedBooking.pnr || 'UNREF'}</span>
                      </h3>
                    </div>
                    <button onClick={() => setSelectedBooking(null)} className={`p-5 rounded-full transition-all ${isDarkMode ? 'bg-slate-800 hover:bg-rose-500 text-white' : 'bg-slate-100 hover:bg-rose-50 text-rose-500 shadow-xl shadow-slate-200/50'}`}>
                      <X size={32} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-16">
                    <div className="space-y-12">
                       {/* Section 01: Profile */}
                       <section className="space-y-6">
                          <label className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] block">01 / Subject Identity</label>
                          <div className={`p-8 rounded-[40px] border-2 flex items-center gap-8 ${isDarkMode ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                             <div className="relative">
                               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedBooking.clientName}`} className="w-24 h-24 rounded-[32px] bg-white shadow-2xl relative z-10" />
                               <div className="absolute -inset-2 bg-indigo-500/20 blur-xl animate-pulse-slow"></div>
                             </div>
                             <div className="flex-1">
                                <p className="text-3xl font-black tracking-tight">{selectedBooking.clientName}</p>
                                <div className="flex items-center gap-3 text-base font-bold text-slate-500 mt-2">
                                  <Phone size={18} className="text-indigo-500" />
                                  <span>{selectedBooking.clientPhone || 'Node Offline'}</span>
                                </div>
                                <div className="flex gap-3 mt-4 text-[10px] font-black uppercase tracking-widest">
                                  <span className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white">{selectedBooking.pax || 1} PAX UNIT</span>
                                  <span className={`px-4 py-1.5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-400' : 'bg-white border-slate-200 text-slate-500'}`}>ID_VERIFIED</span>
                                </div>
                             </div>
                          </div>
                       </section>

                       {/* Section 02: Logistics */}
                       <section className="space-y-6">
                          <label className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] block">02 / Mission Logistics</label>
                          <div className="grid grid-cols-2 gap-6">
                             {selectedBooking.type === 'Hotel' ? (
                               <>
                                 <div className={`p-8 rounded-[36px] border-2 text-center flex flex-col justify-center ${isDarkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-100 bg-white shadow-sm'}`}>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">IN-Bound</p>
                                    <p className="text-xl font-mono font-black text-indigo-500">{selectedBooking.checkIn || '--'}</p>
                                 </div>
                                 <div className={`p-8 rounded-[36px] border-2 text-center flex flex-col justify-center ${isDarkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-100 bg-white shadow-sm'}`}>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">OUT-Bound</p>
                                    <p className="text-xl font-mono font-black text-indigo-500">{selectedBooking.checkOut || '--'}</p>
                                 </div>
                                 <div className={`col-span-2 p-8 rounded-[36px] border-2 border-dashed flex items-center justify-between ${isDarkMode ? 'border-indigo-500/20 bg-indigo-500/5' : 'border-indigo-100 bg-indigo-50/30'}`}>
                                    <div className="flex items-center gap-4">
                                       <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                                          <Building2 size={24} className="text-indigo-600" />
                                       </div>
                                       <div>
                                          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Assigned Facility</p>
                                          <span className="text-lg font-black">{selectedBooking.hotelName || 'PENDING ASSIGNMENT'}</span>
                                       </div>
                                    </div>
                                    <ShieldCheck size={28} className="text-emerald-500" />
                                 </div>
                               </>
                             ) : (
                               <>
                                 <div className={`p-8 rounded-[36px] border-2 text-center flex flex-col justify-center ${isDarkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-100 bg-white shadow-sm'}`}>
                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Base Port</p>
                                    <p className="text-4xl font-mono font-black text-indigo-500 uppercase leading-none">{selectedBooking.from || '--'}</p>
                                 </div>
                                 <div className={`p-8 rounded-[36px] border-2 text-center flex flex-col justify-center ${isDarkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-100 bg-white shadow-sm'}`}>
                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Target Port</p>
                                    <p className="text-4xl font-mono font-black text-indigo-500 uppercase leading-none">{selectedBooking.to || '--'}</p>
                                 </div>
                                 <div className={`col-span-2 p-8 rounded-[36px] border-2 grid grid-cols-2 gap-8 ${isDarkMode ? 'bg-indigo-600/10 border-indigo-500/20' : 'bg-slate-50 border-slate-100'}`}>
                                    <div className="flex items-center gap-5">
                                       <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-lg">
                                          <Clock size={24} className="text-indigo-600" />
                                       </div>
                                       <div>
                                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Flight Time</p>
                                          <p className="text-sm font-black font-mono">{selectedBooking.flyingDate || 'PENDING_SIGNAL'}</p>
                                       </div>
                                    </div>
                                    <div className="flex items-center gap-5 border-l-2 border-slate-200 dark:border-slate-800 pl-8">
                                       <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-lg">
                                          <ShieldCheck size={24} className="text-emerald-500" />
                                       </div>
                                       <div>
                                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PNR Manifest</p>
                                          <p className="text-sm font-black font-mono uppercase text-indigo-500">{selectedBooking.pnr || 'UNREF'}</p>
                                       </div>
                                    </div>
                                 </div>
                               </>
                             )}
                          </div>
                       </section>
                    </div>

                    <div className="space-y-12">
                       {/* Section 03: Operational Intelligence */}
                       <section className="space-y-6">
                          <label className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] block">03 / Operational Intelligence</label>
                          <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 p-10 rounded-[50px] border-2 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/40'}`}>
                             <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                   <Calendar className="text-indigo-500" size={16} />
                                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Issue Date</p>
                                </div>
                                <p className="text-xl font-black font-mono">{selectedBooking.issueDate || selectedBooking.date}</p>
                             </div>
                             <div className="space-y-4 md:border-l-2 md:border-slate-100 md:dark:border-slate-800 md:pl-8">
                                <div className="flex items-center gap-3">
                                   <Globe className="text-indigo-500" size={16} />
                                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Signal Source</p>
                                </div>
                                <p className="text-xl font-black font-mono uppercase">{selectedBooking.bookingSource || 'DIRECT_CHANNEL'}</p>
                             </div>
                             <div className="col-span-1 md:col-span-2 pt-6 border-t-2 border-slate-100 dark:border-slate-800 mt-2 space-y-4">
                                <div className="flex items-center gap-3">
                                   <Info className="text-indigo-500" size={16} />
                                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mission Notes</p>
                                </div>
                                <p className="text-sm font-bold text-slate-500 italic leading-relaxed">
                                   {selectedBooking.description || 'Transmission received without additional metadata. Mission status remains nominal.'}
                                </p>
                             </div>
                          </div>
                       </section>

                       {/* Section 04: Financial Settlement */}
                       <section className="space-y-6">
                          <label className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] block">04 / Financial Settlement</label>
                          <div className={`p-10 rounded-[50px] border-2 relative overflow-hidden group ${isDarkMode ? 'bg-indigo-600/5 border-indigo-500/20' : 'bg-slate-50 border-slate-100 shadow-inner'}`}>
                             <div className="space-y-6 relative z-10">
                                <div className="flex justify-between items-center text-slate-500">
                                   <div className="flex items-center gap-3">
                                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                                      <span className="uppercase tracking-widest text-[11px] font-black">Gross Signal Quote</span>
                                   </div>
                                   <span className="font-black text-2xl font-mono">৳{selectedBooking.amount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-slate-500">
                                   <div className="flex items-center gap-3">
                                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                                      <span className="uppercase tracking-widest text-[11px] font-black">Node Operations Cost</span>
                                   </div>
                                   <span className="font-black text-2xl font-mono text-rose-500">৳{selectedBooking.cost.toLocaleString()}</span>
                                </div>
                                <div className="pt-8 border-t-4 border-double border-indigo-500/20 flex flex-col gap-2">
                                   <p className="font-black text-xs uppercase tracking-[0.4em] text-indigo-500 text-center">Net Yield Performance</p>
                                   <p className="text-6xl font-black tracking-tighter text-indigo-600 text-center font-mono">৳{(selectedBooking.amount - selectedBooking.cost).toLocaleString()}</p>
                                </div>
                             </div>
                          </div>
                       </section>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-8 pt-12">
                     <motion.button 
                       whileHover={{ x: -10 }}
                       onClick={() => setSelectedBooking(null)}
                       className={`flex-1 py-7 rounded-[35px] text-[11px] font-black uppercase tracking-[0.4em] transition-all ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                        End Link
                      </motion.button>
                     <motion.button 
                       whileHover={{ scale: 1.02 }}
                       whileTap={{ scale: 0.98 }}
                       className="flex-1 py-7 vibrant-gradient text-white rounded-[35px] text-[11px] font-black uppercase tracking-[0.4em] shadow-2xl shadow-indigo-600/40 flex items-center justify-center gap-5"
                     >
                        <Download size={22} className="stroke-[3]" />
                        Export Data Log
                     </motion.button>
                  </div>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Data Entry Terminal Modal (Modal) */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center bg-slate-950/95 backdrop-blur-md"
          >
            <motion.form 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              onSubmit={handleSubmit}
              className={`rounded-t-[60px] sm:rounded-[60px] w-full max-w-4xl shadow-2xl h-[95vh] sm:h-auto max-h-[92vh] overflow-hidden flex flex-col ${
                isDarkMode ? 'bg-[#0b1120] text-white border border-slate-800' : 'bg-white'
              }`}
            >
              <div className={`px-10 py-10 border-b-2 flex items-center justify-between shrink-0 ${isDarkMode ? 'border-slate-800 bg-[#0b1120]' : 'bg-white border-slate-50'}`}>
                <div className="flex items-center gap-5">
                   <div className="w-14 h-14 vibrant-gradient rounded-[24px] flex items-center justify-center shadow-xl">
                      <Zap size={28} className="text-white fill-current" />
                   </div>
                   <div>
                      <h3 className="text-4xl font-black uppercase tracking-tighter leading-none">Console <span className="text-indigo-600">Entry</span></h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2">Initializing Operational Node</p>
                   </div>
                </div>
                <button 
                  type="button"
                  onClick={handleAbort} 
                  className={`p-5 rounded-full transition-all ${isDarkMode ? 'bg-slate-800 hover:bg-rose-500 text-white' : 'bg-slate-100 hover:bg-rose-50 text-rose-500'}`}
                >
                  <X size={32} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-10 sm:p-14 space-y-16 no-scrollbar">
                 <section className="space-y-10">
                    <div className="flex items-center gap-4">
                       <span className="w-10 h-10 rounded-full bg-indigo-600/10 flex items-center justify-center text-indigo-600 font-black text-xs">01</span>
                       <label className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.4em] block">Domain Specification</label>
                    </div>
                    <div className="flex p-3 bg-slate-100 dark:bg-slate-900 rounded-[35px] border-2 border-transparent focus-within:border-indigo-500/30">
                      {['Air Ticket', 'Hotel', 'Visa', 'Package'].map(type => (
                        <button 
                          key={type}
                          type="button"
                          onClick={() => setFormData({...formData, type: type as any})}
                          className={`flex-1 py-5 rounded-[28px] text-[11px] font-black uppercase tracking-widest transition-all ${formData.type === type ? 'vibrant-gradient text-white shadow-2xl scale-105 z-10' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                 </section>

                 <section className="space-y-10">
                    <div className="flex items-center gap-4">
                       <span className="w-10 h-10 rounded-full bg-indigo-600/10 flex items-center justify-center text-indigo-600 font-black text-xs">02</span>
                       <label className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.4em] block">Entity Verification</label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                       <div className="col-span-1 md:col-span-2">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-4">Database Signal Match <span className="text-rose-500">*</span></label>
                          <select 
                            required
                            value={formData.clientId}
                            onChange={e => handleClientChange(e.target.value)}
                            className={`w-full px-10 py-6 border-2 rounded-[35px] font-black text-sm outline-none transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800 focus:border-indigo-500' : 'bg-slate-50 border-slate-100 focus:border-indigo-500 shadow-inner'}`}>
                            <option value="">Query Existing Subject Database</option>
                            {clients.map(cl => <option key={cl.id} value={cl.id}>{cl.name} ({cl.phone})</option>)}
                          </select>
                       </div>
                       
                       <div className="space-y-4">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">Subject Descriptor (Name)</label>
                          <div className="relative">
                            <User className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input required placeholder="Manual Override Name" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} className={`w-full pl-16 pr-10 py-6 border-2 rounded-[35px] font-black text-sm transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-100'}`} />
                          </div>
                       </div>
                       
                       <div className="space-y-4">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">Link ID (Phone)</label>
                          <div className="relative">
                            <Phone className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input required placeholder="Subject Contact Hub" value={formData.clientPhone} onChange={e => setFormData({...formData, clientPhone: e.target.value})} className={`w-full pl-16 pr-10 py-6 border-2 rounded-[35px] font-black text-sm transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-100'}`} />
                          </div>
                       </div>

                       <div className="space-y-4">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">Unit Configuration (PAX)</label>
                          <div className="relative">
                            <Users className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input required type="number" min="1" value={formData.pax} onChange={e => setFormData({...formData, pax: Number(e.target.value)})} className={`w-full pl-16 pr-10 py-6 border-2 rounded-[35px] font-black text-sm outline-none transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-100'}`} />
                          </div>
                       </div>

                       <div className="space-y-4">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">Signal Source</label>
                          <div className="relative">
                            <Globe className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input placeholder="GDS, B2B, DIRECT_CHANNEL" value={formData.bookingSource} onChange={e => setFormData({...formData, bookingSource: e.target.value})} className={`w-full pl-16 pr-10 py-6 border-2 rounded-[35px] font-black text-sm transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-100'}`} />
                          </div>
                       </div>
                       
                       <div className="col-span-1 md:col-span-2 space-y-4">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">Reference Terminal (PNR / ID)</label>
                          <div className="relative">
                            <Hash className="absolute left-7 top-1/2 -translate-y-1/2 text-indigo-500" size={20} />
                            <input required placeholder="SYSTEM-REF-MANIFEST-PNR" value={formData.pnr} onChange={e => setFormData({...formData, pnr: e.target.value.toUpperCase()})} className={`w-full pl-16 pr-10 py-6 border-2 rounded-[35px] font-black text-sm uppercase transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-100'}`} />
                          </div>
                       </div>
                    </div>
                 </section>

                 <section className="space-y-10">
                    <div className="flex items-center gap-4">
                       <span className="w-10 h-10 rounded-full bg-indigo-600/10 flex items-center justify-center text-indigo-600 font-black text-xs">03</span>
                       <label className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.4em] block">Logistics Specification</label>
                    </div>
                    <div className={`p-10 rounded-[50px] border-2 border-dashed border-indigo-500/30 grid grid-cols-1 md:grid-cols-2 gap-10 ${isDarkMode ? 'bg-indigo-500/5' : 'bg-slate-50'}`}>
                       {formData.type === 'Hotel' ? (
                         <>
                           <div className="col-span-1 md:col-span-2 space-y-3">
                             <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Property Metadata</label>
                             <input required placeholder="Mission Luxury Hub, NY" value={formData.hotelName} onChange={e => setFormData({...formData, hotelName: e.target.value})} className={`w-full px-10 py-6 border-2 rounded-[30px] font-black text-xs ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`} />
                           </div>
                           <div className="space-y-3">
                             <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Entry T-Clock (In)</label>
                             <input required type="date" value={formData.checkIn} onChange={e => setFormData({...formData, checkIn: e.target.value})} className={`w-full px-10 py-6 border-2 rounded-[30px] font-black text-xs ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`} />
                           </div>
                           <div className="space-y-3">
                             <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Exit T-Clock (Out)</label>
                             <input required type="date" value={formData.checkOut} onChange={e => setFormData({...formData, checkOut: e.target.value})} className={`w-full px-10 py-6 border-2 rounded-[30px] font-black text-xs ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`} />
                           </div>
                         </>
                       ) : (
                         <>
                           <div className="space-y-3">
                              <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Origin Port ID</label>
                              <input required placeholder="DAC-HQ" value={formData.from} onChange={e => setFormData({...formData, from: e.target.value.toUpperCase()})} className={`w-full px-10 py-6 border-2 rounded-[30px] font-black text-xs uppercase ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`} />
                           </div>
                           <div className="space-y-3">
                              <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Destination Port ID</label>
                              <input required placeholder="DXB-NODE" value={formData.to} onChange={e => setFormData({...formData, to: e.target.value.toUpperCase()})} className={`w-full px-10 py-6 border-2 rounded-[30px] font-black text-xs uppercase ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`} />
                           </div>
                           <div className="space-y-3">
                              <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Departure Sequence (Final)</label>
                              <input required type="date" value={formData.flyingDate} onChange={e => setFormData({...formData, flyingDate: e.target.value})} className={`w-full px-10 py-6 border-2 rounded-[30px] font-black text-xs ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`} />
                           </div>
                           <div className="space-y-3">
                              <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Signal Locked (Issue)</label>
                              <input required type="date" value={formData.issueDate} onChange={e => setFormData({...formData, issueDate: e.target.value})} className={`w-full px-10 py-6 border-2 rounded-[30px] font-black text-xs ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`} />
                           </div>
                         </>
                       )}
                    </div>
                 </section>

                 <section className="space-y-10">
                    <div className="flex items-center gap-4">
                       <span className="w-10 h-10 rounded-full bg-indigo-600/10 flex items-center justify-center text-indigo-600 font-black text-xs">04</span>
                       <label className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.4em] block">Financial Matrix</label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                       <div className={`p-10 rounded-[50px] border-2 transition-all focus-within:scale-[1.02] ${isDarkMode ? 'bg-indigo-950/20 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'}`}>
                          <label className="text-[10px] font-black text-indigo-600 uppercase block mb-4 tracking-widest">Yield Input (৳)</label>
                          <div className="relative">
                            <Banknote className="absolute left-8 top-1/2 -translate-y-1/2 text-indigo-500" size={32} />
                            <input required type="number" placeholder="0.00" value={formData.amount || ''} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} className={`w-full pl-24 pr-10 py-8 border-2 rounded-[35px] font-black text-4xl outline-none transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800 text-indigo-400' : 'bg-white border-indigo-100 text-indigo-700 shadow-xl shadow-indigo-200/20'}`} />
                          </div>
                       </div>
                       <div className={`p-10 rounded-[50px] border-2 transition-all focus-within:scale-[1.02] ${isDarkMode ? 'bg-rose-950/20 border-rose-500/20' : 'bg-rose-50 border-rose-100'}`}>
                          <label className="text-[10px] font-black text-rose-600 uppercase block mb-4 tracking-widest">Node Operations Cost (৳)</label>
                          <div className="relative">
                            <Briefcase className="absolute left-8 top-1/2 -translate-y-1/2 text-rose-500" size={32} />
                            <input required type="number" placeholder="0.00" value={formData.cost || ''} onChange={e => setFormData({...formData, cost: Number(e.target.value)})} className={`w-full pl-24 pr-10 py-8 border-2 rounded-[35px] font-black text-4xl outline-none transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800 text-rose-400' : 'bg-white border-rose-100 text-rose-700 shadow-xl shadow-rose-200/20'}`} />
                          </div>
                       </div>
                       <div className="col-span-1 md:col-span-2 space-y-4">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">Signal Intelligence Log</label>
                          <textarea 
                            required
                            placeholder="Operational metadata, baggage limits, or node overrides..."
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            className={`w-full px-10 py-8 border-2 rounded-[40px] font-bold text-sm h-48 resize-none outline-none transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800 focus:border-indigo-500' : 'bg-slate-50 border-slate-100 focus:border-indigo-500 shadow-inner'}`}
                          />
                       </div>
                    </div>
                 </section>
              </div>

              <div className={`p-10 sm:p-14 border-t-2 shrink-0 ${isDarkMode ? 'bg-[#0b1120] border-slate-800' : 'bg-white border-slate-50 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]'}`}>
                 <div className="flex flex-col sm:flex-row gap-8">
                   <motion.button 
                    whileHover={{ scale: 1.02 }}
                    type="button" 
                    onClick={handleAbort} 
                    disabled={isSynchronizing}
                    className={`flex-1 py-7 rounded-[35px] text-[11px] font-black uppercase tracking-[0.4em] transition-all ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-white disabled:opacity-50' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 disabled:opacity-50 shadow-lg shadow-slate-200/30'}`}>
                      Abort Mission
                    </motion.button>
                   <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit" 
                    disabled={isSynchronizing}
                    className="flex-1 py-7 vibrant-gradient text-white text-[11px] font-black uppercase tracking-[0.4em] rounded-[35px] shadow-2xl shadow-indigo-500/40 disabled:scale-100 transition-all flex items-center justify-center gap-4"
                  >
                      {isSynchronizing ? (
                        <>
                          <Activity size={24} className="animate-spin" />
                          <span>Synchronizing...</span>
                        </>
                      ) : (
                        <>
                          <Zap size={24} className="fill-current" />
                          <span>Finalize Node</span>
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
