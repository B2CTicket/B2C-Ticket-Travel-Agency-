const fs = require('fs');
let content = fs.readFileSync('src/components/BookingList.tsx', 'utf8');

const target = `                           <input required placeholder="ABC12D" value={formData.pnr} onChange={e => setFormData({...formData, pnr: e.target.value.toUpperCase()})} className={\`w-full px-4 py-3 border rounded-xl font-bold text-sm uppercase transition-all tracking-wider \${isDarkMode ? 'bg-slate-950 border-slate-800 focus:border-indigo-500' : 'bg-white border-slate-200 focus:border-indigo-500 text-indigo-600'}\`} />
                        </div>`;

const replacement = target + `

                        <div className="space-y-1.5">
                           <label className="text-[11px] font-bold text-slate-500 block uppercase tracking-wide">Booking Source</label>
                           <input placeholder="Ex: OTA" value={formData.bookingSource} onChange={e => setFormData({...formData, bookingSource: e.target.value})} className={\`w-full px-4 py-3 border rounded-xl font-medium text-sm transition-all \${isDarkMode ? 'bg-slate-950 border-slate-800 focus:border-indigo-500' : 'bg-white border-slate-200 focus:border-indigo-500'}\`} />
                        </div>`;

content = content.replace(target, replacement);

fs.writeFileSync('src/components/BookingList.tsx', content);
console.log('Done');
