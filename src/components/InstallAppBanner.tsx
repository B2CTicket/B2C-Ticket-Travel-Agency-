
import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Globe, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  isDarkMode?: boolean;
}

const InstallAppBanner: React.FC<Props> = ({ isDarkMode }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Show the installation banner
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);

    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className={`fixed bottom-6 left-6 right-6 md:left-auto md:w-[400px] z-50 p-6 rounded-[32px] border shadow-2xl transition-all ${
            isDarkMode ? 'bg-[#1e293b] border-slate-700 text-white' : 'bg-white border-slate-100 text-slate-900'
          }`}
        >
          <button 
            onClick={() => setShowBanner(false)}
            className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X size={18} className="text-slate-400" />
          </button>

          <div className="flex items-start gap-4">
            <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
              <Smartphone size={32} />
            </div>
            <div className="flex-1">
              <h3 className="font-black text-lg tracking-tight mb-1">Download Mobile App</h3>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Install ERP on your device</p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">
                   <ShieldCheck size={14} className="text-emerald-500" />
                   Secure Native Experience
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">
                   <Globe size={14} className="text-blue-500" />
                   Offline Access Enabled
                </div>
              </div>

              <button
                onClick={handleInstallClick}
                className="w-full vibrant-gradient text-white py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
              >
                <Download size={16} />
                Install Now
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InstallAppBanner;
