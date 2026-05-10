const fs = require('fs');
let content = fs.readFileSync('src/components/BookingList.tsx', 'utf8');
const lines = content.split('\n');
lines[620] = "                                  <div className={`col-span-2 p-4 rounded-xl border text-center ${isDarkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-100 bg-white'}`}>";
lines[624] = "                                  <div className={`col-span-2 p-4 rounded-xl border grid grid-cols-2 gap-4 ${isDarkMode ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>";
fs.writeFileSync('src/components/BookingList.tsx', lines.join('\n'));
console.log('Done');
