
import React, { useState } from 'react';
import { Client, Booking } from '@/types';
import { 
  Search, Plus, Mail, Phone, User, MoreVertical, 
  Edit2, Trash2, ExternalLink, FileText, X, History, Download 
} from 'lucide-react';

interface Props {
  clients: Client[];
  bookings: Booking[];
  onAdd: (client: Omit<Client, 'id' | 'createdAt'>) => void;
  onUpdate: (client: Client) => void;
  onNavigateToStatement?: (clientId: string) => void;
  isDarkMode?: boolean;
}

const ClientList: React.FC<Props> = ({ clients, bookings, onAdd, onUpdate, onNavigateToStatement, isDarkMode }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    passportNumber: '',
    address: ''
  });

  const getClientBookingsCount = (clientId: string) => {
    return bookings.filter(b => b.clientId === clientId).length;
  };

  const getClientTotalBilled = (clientId: string) => {
    return bookings.filter(b => b.clientId === clientId).reduce((sum, b) => sum + b.amount, 0);
  };

  const openAddModal = () => {
    setEditingClient(null);
    setFormData({ name: '', email: '', phone: '', passportNumber: '', address: '' });
    setShowModal(true);
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone,
      passportNumber: client.passportNumber || '',
      address: client.address || ''
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClient) {
      onUpdate({ ...editingClient, ...formData });
    } else {
      onAdd(formData);
    }
    setShowModal(false);
  };

  const handleSendEmail = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  const handleDownloadDirectory = () => {
    if (clients.length === 0) return;
    
    const headers = ["Name", "Email", "Phone", "Passport", "Address", "Total Billed"];
    const rows = clients.map(c => [
      c.name.replace(/,/g, ' '),
      c.email,
      c.phone,
      (c.passportNumber || "").replace(/,/g, ' '),
      (c.address || "").replace(/,/g, ' '),
      getClientTotalBilled(c.id)
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `clients_directory_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Client Directory</h2>
          <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-sm`}>Manage your customer database and profiles</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleDownloadDirectory}
            className={`px-6 py-2.5 rounded-2xl flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all text-sm font-bold border transition-all ${
              isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-emerald-400' : 'bg-slate-50 border-slate-100 text-slate-700 hover:text-emerald-700'
            }`}
          >
            <Download size={18} />
            Export Directory
          </button>
          <button 
            onClick={openAddModal}
            className="vibrant-gradient text-white px-6 py-2.5 rounded-2xl flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all text-sm font-bold shadow-lg shadow-violet-500/20"
          >
            <Plus size={18} />
            Register New Client
          </button>
        </div>
      </div>

      <div className={`rounded-[32px] border-2 shadow-2xl overflow-hidden transition-all ${
        isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/50'
      }`}>
        <div className="overflow-x-auto no-scrollbar">
          {/* Desktop Table */}
          <table className="w-full text-left border-collapse hidden md:table">
            <thead>
              <tr className={`${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50/50 border-slate-100'} border-b-2`}>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Client Profile</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Contact / Email</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Passport / Ref</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Ledger Balance</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Statements</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Manage</th>
              </tr>
            </thead>
            <tbody className={`divide-y-2 ${isDarkMode ? 'divide-slate-800/50' : 'divide-slate-50'}`}>
              {clients.map((client) => (
                <tr key={client.id} className={`transition-all group ${isDarkMode ? 'hover:bg-violet-600/5' : 'hover:bg-violet-50/50'}`}>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all group-hover:rotate-6 ${
                        isDarkMode ? 'bg-slate-800 text-violet-400 border border-slate-700' : 'bg-violet-50 text-violet-600 border border-violet-100'
                      }`}>
                        {client.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className={`font-black text-sm truncate tracking-tight ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{client.name}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Added {new Date(client.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold group/email">
                        <Mail size={12} className="text-violet-500" /> 
                        <span className="truncate max-w-[150px]">{client.email}</span>
                        <button 
                          onClick={() => handleSendEmail(client.email)}
                          className={`p-1 rounded-md transition-all opacity-0 group-hover/email:opacity-100 ${
                            isDarkMode ? 'hover:bg-slate-700 text-indigo-400' : 'hover:bg-indigo-50 text-indigo-600'
                          }`}
                        >
                          <ExternalLink size={10} />
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
                        <Phone size={12} className="text-emerald-500" /> {client.phone}
                      </div>
                    </div>
                  </td>
                  <td className={`px-8 py-6 text-xs font-black tracking-widest uppercase ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    {client.passportNumber || '---'}
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <p className={`text-sm font-black tracking-tighter ${isDarkMode ? 'text-violet-400' : 'text-violet-700'}`}>
                        ৳{getClientTotalBilled(client.id).toLocaleString()}
                      </p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Billed</p>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => onNavigateToStatement?.(client.id)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                        isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-violet-400' : 'bg-slate-50 border-slate-100 text-slate-700 hover:text-violet-700'
                      }`}
                    >
                      <History size={12} />
                      LEDGER
                    </button>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                        onClick={() => openEditModal(client)}
                        className={`p-2.5 rounded-xl transition-all ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-white hover:bg-violet-600' : 'bg-white border border-slate-100 text-slate-500 hover:text-violet-700 hover:border-violet-200'}`}
                      >
                        <Edit2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
            {clients.map((client) => (
              <div key={client.id} className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${
                      isDarkMode ? 'bg-slate-800 text-violet-400' : 'bg-violet-50 text-violet-600'
                    }`}>
                      {client.name.charAt(0)}
                    </div>
                    <div>
                      <p className={`font-black text-sm tracking-tight ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{client.name}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{client.phone}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => openEditModal(client)}
                    className={`p-2.5 rounded-xl ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}
                  >
                    <Edit2 size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Passport</p>
                    <p className={`text-xs font-black ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{client.passportNumber || 'N/A'}</p>
                  </div>
                  <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Sales</p>
                    <p className={`text-xs font-black text-violet-600`}>৳{getClientTotalBilled(client.id).toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => handleSendEmail(client.email)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-700'
                    }`}
                  >
                    <Mail size={14} />
                    Email
                  </button>
                  <button 
                    onClick={() => onNavigateToStatement?.(client.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 vibrant-gradient text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-violet-500/20"
                  >
                    <History size={14} />
                    Statement
                  </button>
                </div>
              </div>
            ))}
          </div>

          {clients.length === 0 && (
            <div className="px-8 py-20 text-center opacity-40">
              <User size={48} className="mx-auto mb-4 text-slate-300" />
              <p className="text-xs font-black uppercase tracking-[0.2em]">No Clients Registered</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className={`rounded-[40px] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden ${
            isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'
          }`}>
            <div className={`px-10 py-8 border-b-2 flex items-center justify-between ${
              isDarkMode ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50/50 border-slate-100'
            }`}>
              <div>
                <h3 className="font-black text-xl uppercase tracking-tighter">{editingClient ? 'Update Profile' : 'New Passenger Registration'}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enter mandatory traveler details</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-rose-500 transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Full Legal Name</label>
                  <input 
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    type="text" 
                    placeholder="As per Passport"
                    className={`w-full px-6 py-4 border-2 rounded-2xl outline-none text-sm font-bold transition-all ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-violet-500/50' : 'bg-slate-50 border-slate-100 text-slate-900 focus:border-violet-500/50'
                    }`} />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Email Address</label>
                    <input 
                      required
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className={`w-full px-6 py-4 border-2 rounded-2xl outline-none text-sm font-bold ${
                        isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-violet-500/50' : 'bg-slate-50 border-slate-100 text-slate-900 focus:border-violet-500/50'
                      }`} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Phone Number</label>
                    <input 
                      required
                      type="tel"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className={`w-full px-6 py-4 border-2 rounded-2xl outline-none text-sm font-bold ${
                        isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-violet-500/50' : 'bg-slate-50 border-slate-100 text-slate-900 focus:border-violet-500/50'
                      }`} />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Passport ID (Optional)</label>
                  <input 
                    value={formData.passportNumber}
                    onChange={e => setFormData({...formData, passportNumber: e.target.value})}
                    type="text" className={`w-full px-6 py-4 border-2 rounded-2xl outline-none text-sm font-bold ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-violet-500/50' : 'bg-slate-50 border-slate-100 text-slate-900 focus:border-violet-500/50'
                    }`} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Home Address</label>
                  <textarea 
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                    className={`w-full px-6 py-4 border-2 rounded-2xl outline-none text-sm font-bold h-24 resize-none ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-violet-500/50' : 'bg-slate-50 border-slate-100 text-slate-900 focus:border-violet-500/50'
                    }`} />
                </div>
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setShowModal(false)} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all ${
                  isDarkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-50 border-2 border-slate-100'
                }`}>Discard</button>
                <button type="submit" className="flex-1 py-4 vibrant-gradient text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-violet-500/30 hover:scale-105 active:scale-95 transition-all">
                  {editingClient ? 'Finalize Updates' : 'Complete Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientList;
