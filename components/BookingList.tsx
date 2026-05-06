
import React, { useState, useMemo } from 'react';
import { Booking, BookingStatus, Client } from '../types';
import { 
  Search, Plus, X, Download, Plane, 
  Calendar, Users, Globe, ArrowRight, 
  ShieldCheck, MapPin, Hash, DollarSign, 
  Briefcase, CheckCircle, Building2, 
  Bed, LogIn, LogOut, Phone, User,
  Navigation, Clock, Zap, ExternalLink,
  ClipboardList, Info
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
    const now = new Date();
    return [...bookings]
      .filter(b => b.flyingDate || b.checkIn)
      .sort((a, b) => {
        const dateA = new Date(a.flyingDate || a.checkIn || '');
        const dateB = new Date(b.flyingDate || b.checkIn || '');
        return dateA.getTime() - dateB.getTime();
      })[0];
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
    
    // Simulate synchronization delay
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
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 vibrant-gradient rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
               <Zap className="text-white fill-current" size={20} />
            </div>
            <h2 className={`text-4xl font-black tracking-tighter uppercase ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Reservation <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-400">Hub</span>
            </h2>
          </div>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] ml-1">Terminal: Global-Inventory-Active</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch gap-4 w-full xl:w-auto">
          <div className="relative group flex-1 sm:w-80">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-all" size={18} />
            <input 
              type="text" 
              placeholder="Track PNR, Route, or Client..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-14 pr-6 py-4 text-sm font-bold border-2 rounded-[24px] outline-none transition-all ${
                isDarkMode ? 'bg-slate-900 border-slate-800 text-white focus:border-indigo-500/50' : 'bg-white border-slate-100 shadow-sm focus:border-indigo-500/50'
              }`} 
            />
          </div>
          <button 
            onClick={() => setShowModal(true)} 
            className="vibrant-gradient text-white px-10 py-4 rounded-[24px] shadow-2xl shadow-indigo-500/40 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <Plus size={22} className="stroke-[3]" />
            <span className="text-xs font-black uppercase tracking-[0.2em]">New Entry</span>
          </button>
        </div>
      </div>

      {/* Unique Focus Section: Upcoming Mission */}
      {upcomingTravel && !searchTerm && (
        <div className={`p-8 rounded-[40px] border-2 relative overflow-hidden transition-all ${
          isDarkMode ? 'bg-indigo-950/20 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100 shadow-xl shadow-indigo-100/50'
        }`}>
           <div className="absolute top-0 right-0 p-8 opacity-10">
              {upcomingTravel.type === 'Air Ticket' ? <Plane size={140} /> : <Building2 size={140} />}
           </div>
           
           <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="space-y-4">
                 <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest">Next Operations</span>
                    <span className="text-xs font-black text-indigo-500 flex items-center gap-1.5"><Clock size={14}/> {upcomingTravel.flyingDate || upcomingTravel.checkIn}</span>
                 </div>
                 <h3 className={`text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                   {upcomingTravel.type === 'Hotel' ? `Stay at ${upcomingTravel.hotelName}` : `Flight: ${upcomingTravel.from} ➔ ${upcomingTravel.to}`}
                 </h3>
                 <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                       <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${upcomingTravel.clientName}`} className="w-10 h-10 rounded-xl bg-white shadow-md" />
                       <div>
                          <p className="text-xs font-black">{upcomingTravel.clientName}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase">{upcomingTravel.pnr}</p>
                       </div>
                    </div>
                    <div className="h-10 w-[1px] bg-indigo-500/20 hidden sm:block"></div>
                    <div className="hidden sm:block">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Yield Balance</p>
                       <p className="text-lg font-black text-indigo-600">৳{upcomingTravel.amount.toLocaleString()}</p>
                    </div>
                 </div>
              </div>
              
              <button 
                onClick={() => setSelectedBooking(upcomingTravel)}
                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 group"
              >
                Access Terminal <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
           </div>
        </div>
      )}

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredBookings.length > 0 ? filteredBookings.map((booking) => (
          <div 
            key={booking.id}
            onClick={() => setSelectedBooking(booking)}
            className={`group relative overflow-hidden rounded-[36px] border-2 transition-all hover:scale-[1.03] cursor-pointer ${
              isDarkMode 
                ? 'bg-slate-900/50 border-slate-800 hover:border-indigo-500/40 hover:bg-slate-900' 
                : 'bg-white border-slate-50 shadow-xl shadow-slate-200/40 hover:border-indigo-200'
            }`}
          >
            {/* Boarding Pass Notches */}
            <div className={`absolute left-0 top-[60%] -translate-y-1/2 w-4 h-8 rounded-r-full border-y border-r ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-[#f8faff] border-slate-100'}`}></div>
            <div className={`absolute right-0 top-[60%] -translate-y-1/2 w-4 h-8 rounded-l-full border-y border-l ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-[#f8faff] border-slate-100'}`}></div>

            <div className="p-8 space-y-7 relative z-10">
              {/* Top: Type & ID */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:rotate-12 ${
                    isDarkMode ? 'bg-slate-800 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
                  }`}>
                    {booking.type === 'Air Ticket' ? <Plane size={24} className="rotate-45" /> : booking.type === 'Hotel' ? <Building2 size={24} /> : <Globe size={24} />}
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-indigo-500 tracking-[0.2em] block">{booking.type}</span>
                    <span className="text-base font-mono font-black tracking-tighter uppercase block group-hover:text-indigo-500 transition-colors">
                      {booking.pnr || 'NO-REF'}
                    </span>
                  </div>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border-2 shadow-sm ${
                  booking.status === BookingStatus.CONFIRMED ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/20' : 
                  booking.status === BookingStatus.PENDING ? 'bg-amber-500/5 text-amber-500 border-amber-500/20' : 
                  'bg-rose-500/5 text-rose-500 border-rose-500/20'
                }`}>
                  {booking.status}
                </div>
              </div>

              {/* Middle: Data Visualization */}
              <div className={`p-6 rounded-[28px] border-2 flex items-center justify-between ${
                isDarkMode ? 'bg-slate-950/40 border-slate-800/60' : 'bg-slate-50 border-slate-100'
              }`}>
                {booking.type === 'Hotel' ? (
                  <>
                    <div className="text-center">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">IN</p>
                      <p className="text-xs font-black tracking-tighter uppercase font-mono">{booking.checkIn?.split('-').reverse().slice(0,2).join('/') || '--/--'}</p>
                    </div>
                    <div className="flex-1 px-4 flex flex-col items-center">
                       <div className="w-full h-[2px] border-t-2 border-dashed border-indigo-500/30 relative">
                          <Bed size={16} className="absolute -top-[9px] left-1/2 -translate-x-1/2 text-indigo-500" />
                       </div>
                    </div>
                    <div className="text-center">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">OUT</p>
                      <p className="text-xs font-black tracking-tighter uppercase font-mono">{booking.checkOut?.split('-').reverse().slice(0,2).join('/') || '--/--'}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-center">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{booking.from || 'DEP'}</p>
                      <Navigation size={14} className="mx-auto text-indigo-500 mb-1" />
                    </div>
                    <div className="flex-1 px-4">
                       <div className="w-full h-[2px] bg-gradient-to-r from-indigo-500 to-transparent relative">
                          <Plane size={14} className="absolute -top-[6px] right-0 text-indigo-500 transition-all group-hover:translate-x-2" />
                       </div>
                    </div>
                    <div className="text-center">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{booking.to || 'ARR'}</p>
                      <MapPin size={14} className="mx-auto text-indigo-500 mb-1" />
                    </div>
                  </>
                )}
              </div>

              {/* Bottom: Client & Financials */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl overflow-hidden border-2 border-indigo-500/20 group-hover:border-indigo-500 transition-colors">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${booking.clientName}`} alt="Pax" className="w-full h-full bg-slate-100 dark:bg-slate-800" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black truncate leading-none mb-1">{booking.clientName}</p>
                    <div className="flex items-center gap-2">
                       <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[8px] font-black text-slate-500 uppercase">{booking.pax || 1} PAX</span>
                       <span className="text-[9px] font-bold text-slate-400">{booking.flyingDate || booking.checkIn}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Yield</p>
                  <p className="text-xl font-black tracking-tighter text-indigo-600 dark:text-indigo-400">৳{booking.amount.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-32 flex flex-col items-center justify-center opacity-30 text-center space-y-4">
            <Globe size={100} className="text-slate-400 animate-pulse" />
            <h3 className="text-2xl font-black uppercase tracking-[0.3em]">No Active Signals</h3>
            <p className="text-xs font-bold uppercase tracking-widest">Global Reservation Database Clear</p>
          </div>
        )}
      </div>

      {/* Reservation Review Terminal (Modal) */}
      {selectedBooking && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-0 sm:p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className={`rounded-none sm:rounded-[48px] w-full max-w-4xl shadow-2xl h-full sm:h-auto max-h-[95vh] overflow-hidden flex flex-col relative ${
            isDarkMode ? 'bg-[#0f172a] border border-slate-800' : 'bg-white'
          }`}>
             <div className="h-2 w-full vibrant-gradient"></div>
             
             <div className="p-8 sm:p-12 overflow-y-auto no-scrollbar space-y-12">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-600 block mb-3">Signal ID: {selectedBooking.id.toUpperCase()}</span>
                    <h3 className="text-4xl font-black tracking-tighter uppercase leading-none">
                      {selectedBooking.type} <span className="text-slate-400">/ {selectedBooking.pnr || 'UNREF'}</span>
                    </h3>
                  </div>
                  <button onClick={() => setSelectedBooking(null)} className={`p-4 rounded-3xl transition-all ${isDarkMode ? 'bg-slate-800 hover:bg-rose-500 text-white' : 'bg-slate-100 hover:bg-rose-50 text-rose-500'}`}>
                    <X size={28} />
                  </button>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                  <div className="space-y-10">
                     {/* Traveler Section */}
                     <section className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Passenger Manifest</label>
                        <div className={`p-6 rounded-[32px] border-2 flex items-center gap-5 ${isDarkMode ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                           <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedBooking.clientName}`} className="w-16 h-16 rounded-[24px] bg-white shadow-xl" />
                           <div className="flex-1">
                              <p className="text-xl font-black tracking-tight">{selectedBooking.clientName}</p>
                              <div className="flex items-center gap-2 text-sm font-bold text-slate-500 mt-1">
                                <Phone size={14} className="text-indigo-500" />
                                <span>{selectedBooking.clientPhone || 'No Contact Provided'}</span>
                              </div>
                              <div className="flex gap-2 mt-3">
                                <span className="px-3 py-1 rounded-xl bg-indigo-600 text-[9px] font-black text-white uppercase tracking-widest">{selectedBooking.pax || 1} PAX</span>
                                <span className="px-3 py-1 rounded-xl bg-indigo-500/20 text-[9px] font-black text-indigo-500 border border-indigo-500/20 uppercase tracking-widest">Client ID: {selectedBooking.clientId || 'GUEST'}</span>
                              </div>
                           </div>
                        </div>
                     </section>

                     {/* Logistics Section */}
                     <section className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Logistics Terminal</label>
                        <div className="grid grid-cols-2 gap-5">
                           {selectedBooking.type === 'Hotel' ? (
                             <>
                               <div className={`p-5 rounded-3xl border-2 text-center ${isDarkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-100 bg-white shadow-sm'}`}>
                                  <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Check-in</p>
                                  <p className="text-base font-mono font-black">{selectedBooking.checkIn || '--'}</p>
                               </div>
                               <div className={`p-5 rounded-3xl border-2 text-center ${isDarkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-100 bg-white shadow-sm'}`}>
                                  <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Check-out</p>
                                  <p className="text-base font-mono font-black">{selectedBooking.checkOut || '--'}</p>
                               </div>
                               <div className="col-span-2 p-5 rounded-3xl border-2 border-dashed border-indigo-500/20 flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                     <Building2 size={20} className="text-indigo-600" />
                                     <span className="text-sm font-black">{selectedBooking.hotelName || 'Property Not Specified'}</span>
                                  </div>
                                  <ShieldCheck size={20} className="text-emerald-500" />
                               </div>
                             </>
                           ) : (
                             <>
                               <div className={`p-5 rounded-3xl border-2 text-center ${isDarkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-100 bg-white shadow-sm'}`}>
                                  <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Origin (From)</p>
                                  <p className="text-2xl font-mono font-black text-indigo-500 uppercase">{selectedBooking.from || '--'}</p>
                               </div>
                               <div className={`p-5 rounded-3xl border-2 text-center ${isDarkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-100 bg-white shadow-sm'}`}>
                                  <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Destination (To)</p>
                                  <p className="text-2xl font-mono font-black text-indigo-500 uppercase">{selectedBooking.to || '--'}</p>
                               </div>
                               <div className="col-span-2 p-6 rounded-3xl bg-indigo-600/10 border-2 border-indigo-500/20 grid grid-cols-2 gap-6">
                                  <div className="flex items-center gap-4">
                                     <Clock size={22} className="text-indigo-600" />
                                     <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Flying Date</p>
                                        <p className="text-sm font-black">{selectedBooking.flyingDate || 'PENDING'}</p>
                                     </div>
                                  </div>
                                  <div className="flex items-center gap-4 border-l-2 border-indigo-500/20 pl-6">
                                     <ShieldCheck size={22} className="text-emerald-500" />
                                     <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Airline PNR</p>
                                        <p className="text-sm font-black font-mono uppercase">{selectedBooking.pnr || 'NONE'}</p>
                                     </div>
                                  </div>
                               </div>
                             </>
                           )}
                        </div>
                     </section>
                  </div>

                  <div className="space-y-10">
                     {/* Meta/Source Section */}
                     <section className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Operational Metadata</label>
                        <div className={`grid grid-cols-2 gap-5 p-6 rounded-[32px] border-2 ${isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                           <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Issue Date</p>
                              <div className="flex items-center gap-2 text-xs font-black">
                                 <Calendar size={14} className="text-indigo-500" />
                                 {selectedBooking.issueDate || selectedBooking.date}
                              </div>
                           </div>
                           <div className="border-l-2 border-slate-200 dark:border-slate-800 pl-5">
                              <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Booking Source</p>
                              <div className="flex items-center gap-2 text-xs font-black">
                                 <ExternalLink size={14} className="text-indigo-500" />
                                 {selectedBooking.bookingSource || 'DIRECT'}
                              </div>
                           </div>
                           <div className="col-span-2 pt-4 border-t-2 border-slate-200 dark:border-slate-800">
                              <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Reference Terminal</p>
                              <div className="flex items-center gap-2 text-xs font-black font-mono">
                                 <ClipboardList size={14} className="text-indigo-500" />
                                 {selectedBooking.id.toUpperCase()}
                              </div>
                           </div>
                        </div>
                     </section>

                     {/* Financial Section */}
                     <section className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Financial Settlement</label>
                        <div className={`p-8 rounded-[40px] border-2 relative overflow-hidden ${isDarkMode ? 'bg-slate-800/20 border-slate-800' : 'bg-slate-50 border-slate-100 shadow-sm'}`}>
                           <div className="space-y-5 relative z-10">
                              <div className="flex justify-between items-center">
                                 <span className="text-slate-500 uppercase tracking-widest text-[10px] font-black">Gross Quote (৳):</span>
                                 <span className="font-black text-xl">৳{selectedBooking.amount.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                 <span className="text-slate-500 uppercase tracking-widest text-[10px] font-black">Base Net Cost (৳):</span>
                                 <span className="text-rose-500 font-black text-xl">৳{selectedBooking.cost.toLocaleString()}</span>
                              </div>
                              <div className="pt-6 border-t-2 border-dashed border-slate-200 dark:border-slate-800 flex justify-between items-center">
                                 <span className="font-black text-xs uppercase tracking-[0.2em] text-indigo-500">Operation Yield:</span>
                                 <span className="text-3xl font-black tracking-tighter text-emerald-500">৳{(selectedBooking.amount - selectedBooking.cost).toLocaleString()}</span>
                              </div>
                           </div>
                        </div>
                     </section>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 pt-10 border-t-2 border-slate-100 dark:border-slate-800">
                   <button 
                    onClick={() => setSelectedBooking(null)}
                    className={`flex-1 py-6 rounded-[28px] text-xs font-black uppercase tracking-[0.2em] transition-all ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                      Return to Command
                    </button>
                   <button className="flex-1 py-6 vibrant-gradient text-white rounded-[28px] text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-500/40 active:scale-95 transition-all flex items-center justify-center gap-4">
                      <Download size={22} />
                      Export Invoice
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Data Entry Console (Modal) */}
      {showModal && (
        <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center bg-slate-950/90 backdrop-blur-md animate-in slide-in-from-bottom-20 duration-500">
          <form 
            onSubmit={handleSubmit}
            className={`rounded-t-[48px] sm:rounded-[48px] w-full max-w-3xl shadow-2xl h-[95vh] sm:h-auto max-h-[92vh] overflow-hidden flex flex-col ${
              isDarkMode ? 'bg-[#0b1120] text-white border border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            {/* Fixed Header */}
            <div className={`px-8 py-8 border-b-2 flex items-center justify-between shrink-0 ${isDarkMode ? 'border-slate-800 bg-[#0b1120]' : 'bg-white border-slate-100'}`}>
              <div>
                <h3 className="text-3xl font-black uppercase tracking-tighter">Mission <span className="text-indigo-600">Console</span></h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2">Initialize Operational Record</p>
              </div>
              <button 
                type="button"
                onClick={handleAbort} 
                className={`p-4 rounded-3xl transition-all ${isDarkMode ? 'bg-slate-800 hover:bg-rose-500 text-white' : 'bg-slate-100 hover:bg-rose-50 text-rose-500'}`}
              >
                <X size={28} />
              </button>
            </div>
            
            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-8 sm:p-10 space-y-12 no-scrollbar">
               {/* 1. Service Sector */}
               <section className="space-y-6">
                  <label className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] block">01 / Service Intelligence</label>
                  <div className="flex p-2 bg-slate-100 dark:bg-slate-900 rounded-[28px] border-2 border-transparent focus-within:border-indigo-500/20">
                    {['Air Ticket', 'Hotel', 'Visa', 'Package'].map(type => (
                      <button 
                        key={type}
                        type="button"
                        onClick={() => setFormData({...formData, type: type as any})}
                        className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.type === type ? 'vibrant-gradient text-white shadow-xl scale-105 z-10' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
               </section>

               {/* 2. Target Profile */}
               <section className="space-y-6">
                  <label className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] block">02 / Entity Verification</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="col-span-1 md:col-span-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Database Lookup <span className="text-rose-500">*</span></label>
                        <select 
                          required
                          value={formData.clientId}
                          onChange={e => handleClientChange(e.target.value)}
                          className={`w-full px-8 py-5 border-2 rounded-[28px] font-black text-sm outline-none transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800 focus:border-indigo-500' : 'bg-slate-50 border-slate-100 focus:border-indigo-500'}`}>
                          <option value="">Search Existing Traveler Profile</option>
                          {clients.map(cl => <option key={cl.id} value={cl.id}>{cl.name} ({cl.phone})</option>)}
                        </select>
                     </div>
                     
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Signal Name (Passenger)</label>
                        <div className="relative">
                          <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input required placeholder="Manual Name Entry" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} className={`w-full pl-16 pr-8 py-5 border-2 rounded-[28px] font-black text-sm transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-100'}`} />
                        </div>
                     </div>
                     
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Contact Key (Phone)</label>
                        <div className="relative">
                          <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input required placeholder="Terminal Phone" value={formData.clientPhone} onChange={e => setFormData({...formData, clientPhone: e.target.value})} className={`w-full pl-16 pr-8 py-5 border-2 rounded-[28px] font-black text-sm transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-100'}`} />
                        </div>
                     </div>

                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Group Count (PAX)</label>
                        <div className="relative">
                          <Users className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input required type="number" min="1" value={formData.pax} onChange={e => setFormData({...formData, pax: Number(e.target.value)})} className={`w-full pl-16 pr-8 py-5 border-2 rounded-[28px] font-black text-sm outline-none transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-100'}`} />
                        </div>
                     </div>

                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Booking Source</label>
                        <div className="relative">
                          <Globe className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input placeholder="e.g. B2B, Direct, Agency" value={formData.bookingSource} onChange={e => setFormData({...formData, bookingSource: e.target.value})} className={`w-full pl-16 pr-8 py-5 border-2 rounded-[28px] font-black text-sm transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-100'}`} />
                        </div>
                     </div>
                     
                     <div className="col-span-1 md:col-span-2 space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Airline PNR / Reference</label>
                        <div className="relative">
                          <Hash className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input required placeholder="GDS-REF-PNR" value={formData.pnr} onChange={e => setFormData({...formData, pnr: e.target.value.toUpperCase()})} className={`w-full pl-16 pr-8 py-5 border-2 rounded-[28px] font-black text-sm uppercase transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-100'}`} />
                        </div>
                     </div>
                  </div>
               </section>

               {/* 3. Operational Data */}
               <section className="space-y-6">
                  <label className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] block">03 / Logistics Terminal</label>
                  <div className={`p-8 rounded-[40px] border-2 border-dashed border-indigo-500/30 grid grid-cols-1 md:grid-cols-2 gap-8 ${isDarkMode ? 'bg-indigo-500/5' : 'bg-slate-50'}`}>
                     {formData.type === 'Hotel' ? (
                       <>
                         <div className="col-span-1 md:col-span-2 space-y-2">
                           <label className="text-[9px] font-black text-indigo-500 uppercase">Hospitality Center Name</label>
                           <input required placeholder="The Plaza, NY" value={formData.hotelName} onChange={e => setFormData({...formData, hotelName: e.target.value})} className={`w-full px-8 py-5 border-2 rounded-2xl font-black text-xs ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-100'}`} />
                         </div>
                         <div className="space-y-2">
                           <label className="text-[9px] font-black text-indigo-500 uppercase">Check-in Terminal</label>
                           <input required type="date" value={formData.checkIn} onChange={e => setFormData({...formData, checkIn: e.target.value})} className={`w-full px-8 py-5 border-2 rounded-2xl font-black text-xs ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-100'}`} />
                         </div>
                         <div className="space-y-2">
                           <label className="text-[9px] font-black text-indigo-500 uppercase">Checkout Terminal</label>
                           <input required type="date" value={formData.checkOut} onChange={e => setFormData({...formData, checkOut: e.target.value})} className={`w-full px-8 py-5 border-2 rounded-2xl font-black text-xs ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-100'}`} />
                         </div>
                       </>
                     ) : (
                       <>
                         <div className="space-y-2">
                            <label className="text-[9px] font-black text-indigo-500 uppercase">Origin Port (From)</label>
                            <input required placeholder="DAC" value={formData.from} onChange={e => setFormData({...formData, from: e.target.value.toUpperCase()})} className={`w-full px-8 py-5 border-2 rounded-2xl font-black text-xs uppercase ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-100'}`} />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[9px] font-black text-indigo-500 uppercase">Destination Port (To)</label>
                            <input required placeholder="DXB" value={formData.to} onChange={e => setFormData({...formData, to: e.target.value.toUpperCase()})} className={`w-full px-8 py-5 border-2 rounded-2xl font-black text-xs uppercase ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-100'}`} />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[9px] font-black text-indigo-500 uppercase">Departure Date (Flying)</label>
                            <input required type="date" value={formData.flyingDate} onChange={e => setFormData({...formData, flyingDate: e.target.value})} className={`w-full px-8 py-5 border-2 rounded-2xl font-black text-xs ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-100'}`} />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[9px] font-black text-indigo-500 uppercase">Issue Date (Finalized)</label>
                            <input required type="date" value={formData.issueDate} onChange={e => setFormData({...formData, issueDate: e.target.value})} className={`w-full px-8 py-5 border-2 rounded-2xl font-black text-xs ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-100'}`} />
                         </div>
                       </>
                     )}
                  </div>
               </section>

               {/* 4. Financial Matrix */}
               <section className="space-y-6">
                  <label className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] block">04 / Financial Settlement</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className={`p-8 rounded-[40px] border-2 transition-all focus-within:ring-4 focus-within:ring-indigo-500/10 ${isDarkMode ? 'bg-indigo-950/20 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'}`}>
                        <label className="text-[10px] font-black text-indigo-600 uppercase block mb-3">Consumer Quote (৳)</label>
                        <div className="relative">
                          <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-500" size={26} />
                          <input required type="number" placeholder="0.00" value={formData.amount || ''} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} className={`w-full pl-16 pr-8 py-6 border-2 rounded-[28px] font-black text-3xl outline-none transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800 text-indigo-400' : 'bg-white border-indigo-100 text-indigo-700'}`} />
                        </div>
                     </div>
                     <div className={`p-8 rounded-[40px] border-2 transition-all focus-within:ring-4 focus-within:ring-rose-500/10 ${isDarkMode ? 'bg-rose-950/20 border-rose-500/20' : 'bg-rose-50 border-rose-100'}`}>
                        <label className="text-[10px] font-black text-rose-600 uppercase block mb-3">Net Cost Base (৳)</label>
                        <div className="relative">
                          <Briefcase className="absolute left-6 top-1/2 -translate-y-1/2 text-rose-500" size={26} />
                          <input required type="number" placeholder="0.00" value={formData.cost || ''} onChange={e => setFormData({...formData, cost: Number(e.target.value)})} className={`w-full pl-16 pr-8 py-6 border-2 rounded-[28px] font-black text-3xl outline-none transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800 text-rose-400' : 'bg-white border-rose-100 text-rose-700'}`} />
                        </div>
                     </div>
                     <div className="col-span-1 md:col-span-2 space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Signal Log / Description</label>
                        <textarea 
                          required
                          placeholder="Log operational notes, flight numbers, or baggage restrictions..."
                          value={formData.description}
                          onChange={e => setFormData({...formData, description: e.target.value})}
                          className={`w-full px-8 py-6 border-2 rounded-[32px] font-bold text-sm h-36 resize-none outline-none transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800 focus:border-indigo-500' : 'bg-slate-50 border-slate-100 focus:border-indigo-500'}`}
                        />
                     </div>
                  </div>
               </section>
            </div>

            {/* Fixed Footer */}
            <div className={`p-8 sm:p-10 border-t-2 shrink-0 ${isDarkMode ? 'bg-[#0b1120] border-slate-800' : 'bg-white border-slate-50'}`}>
               <div className="flex flex-col sm:flex-row gap-5">
                 <button 
                  type="button" 
                  onClick={handleAbort} 
                  disabled={isSynchronizing}
                  className={`flex-1 py-5 rounded-[28px] text-[10px] font-black uppercase tracking-[0.3em] transition-all ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-white disabled:opacity-50' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 disabled:opacity-50'}`}>
                    Abort Entry
                  </button>
                 <button 
                  type="submit" 
                  disabled={isSynchronizing}
                  className="flex-1 py-5 vibrant-gradient text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-[28px] shadow-2xl shadow-indigo-500/40 active:scale-95 disabled:scale-100 transition-all flex items-center justify-center gap-3"
                >
                    {isSynchronizing ? (
                      <>
                        <Zap size={18} className="animate-pulse" />
                        <span>Synchronizing...</span>
                      </>
                    ) : (
                      <>
                        <Zap size={18} className="fill-current" />
                        <span>Synchronize Records</span>
                      </>
                    )}
                 </button>
               </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default BookingList;
