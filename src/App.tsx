
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Ticket, 
  Receipt, 
  Users, 
  Settings, 
  Plus, 
  TrendingUp, 
  Banknote, 
  MessageSquareText,
  Search,
  ChevronRight,
  Menu,
  X,
  Sun,
  Moon,
  BarChart3,
  DownloadCloud,
  Plane,
  FileText,
  History,
  Lock,
  ArrowRight
} from 'lucide-react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth, loginWithGoogle, logout as firebaseLogout, googleProvider } from '@/lib/firebase';
import { Booking, BookingStatus, Transaction, TransactionType, Client } from '@/types';
import Dashboard from '@/components/Dashboard';
import BookingList from '@/components/BookingList';
import TransactionList from '@/components/TransactionList';
import ClientList from '@/components/ClientList';
import AIChat from '@/components/AIChat';
import Forecast from '@/components/Forecast';
import InvoiceList from '@/components/InvoiceList';
import StatementView from '@/components/StatementView';

const App: React.FC = () => {
  console.log("App component initializing...");
  const [activeTab, setActiveTab] = useState<'dashboard' | 'bookings' | 'accounts' | 'ai' | 'clients' | 'forecast' | 'invoices' | 'statements' | 'settings'>('dashboard');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [preselectedBookingId, setPreselectedBookingId] = useState<string | null>(null);
  const [openTransactionModalKey, setOpenTransactionModalKey] = useState(0);
  const [openBookingModalKey, setOpenBookingModalKey] = useState(0);
  const [isSidebarOpen, setSidebarOpen] = useState(false); // Default to closed on all loads for better mobile start, then useEffect handles desktop
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 1024 : true);
  
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Firebase Auth State
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authStage, setAuthStage] = useState<string>('Initializing');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('darkMode');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return localStorage.getItem('isLoggedIn') === 'true';
    } catch {
      return false;
    }
  });

  const [adminCreds, setAdminCreds] = useState({ 
    username: 'admin', 
    password: '1234',
    recoveryQuestion: 'What is your base of operations?', 
    recoveryAnswer: 'Dhaka' 
  });

  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [recoveryAnswer, setRecoveryAnswer] = useState('');
  const [recoveryMessage, setRecoveryMessage] = useState('');
  const [settingsForm, setSettingsForm] = useState({ ...adminCreds });
  const [settingsMessage, setSettingsMessage] = useState('');

  // Firestore Error Handler
  const handleFirestoreError = (error: any, operation: string, path: string) => {
    console.error(`Firestore Error [${operation}] on [${path}]:`, error);
    if (error.code === 'permission-denied') {
      setDbError("Unauthorized Access: Your account does not have permission to modify this data.");
    } else {
      setDbError(`Database Error: ${error.message}`);
    }
    setTimeout(() => setDbError(null), 5000);
  };

  // Auth Listener
  useEffect(() => {
    console.log("Setting up Auth Listener...");
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", user ? `UID: ${user.uid}` : "No Firebase user.");
      setFirebaseUser(user);
      setIsAuthReady(true);
    }, (error) => {
      console.error("Auth observer error:", error);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Settings Listener
  useEffect(() => {
    // Data sync logic - works if authenticated with Google, otherwise uses local-first/defaults
    const unsub = onSnapshot(doc(db, 'settings', 'admin'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as any;
        setAdminCreds(data);
        setSettingsForm(data);
      } else {
        const defaultSettings = { 
          username: 'admin', 
          password: '1234',
          recoveryQuestion: 'What is your base of operations?', 
          recoveryAnswer: 'Dhaka' 
        };
        setDoc(doc(db, 'settings', 'admin'), defaultSettings).catch(() => {});
      }
    }, () => {
      // If Firestore errors, we still permit the local password login
      console.warn("Firestore settings inaccessible. Using local defaults.");
    });
    return unsub;
  }, []);

  // Data Listeners
  const [clients, setClients] = useState<Client[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    // We attempt to load data regardless of firebaseUser, 
    // relying on the updated public rules for functional access.
    const unsubClients = onSnapshot(query(collection(db, 'clients'), orderBy('createdAt', 'desc')), (snapshot) => {
      setClients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client)));
    }, (e) => handleFirestoreError(e, 'READ', 'clients'));

    const unsubBookings = onSnapshot(query(collection(db, 'bookings'), orderBy('date', 'desc')), (snapshot) => {
      setBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking)));
    }, (e) => handleFirestoreError(e, 'READ', 'bookings'));

    const unsubTransactions = onSnapshot(query(collection(db, 'transactions'), orderBy('date', 'desc')), (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction)));
    }, (e) => handleFirestoreError(e, 'READ', 'transactions'));

    return () => {
      unsubClients();
      unsubBookings();
      unsubTransactions();
    };
  }, []);

  const stats = useMemo(() => {
    const manualIncome = transactions
      .filter(t => t.type === TransactionType.INCOME && !t.bookingId)
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    
    const manualExpense = transactions
      .filter(t => t.type === TransactionType.EXPENSE && !t.bookingId)
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
      
    const bookingRevenue = bookings.reduce((sum, b) => sum + Number(b.amount || 0), 0);
    const bookingCost = bookings.reduce((sum, b) => sum + Number(b.cost || 0), 0);

    const totalIncome = bookingRevenue + manualIncome;
    const totalExpense = bookingCost + manualExpense;
    const netProfit = totalIncome - totalExpense;

    const pendingCount = bookings.filter(b => b.status && b.status.toString().toUpperCase() === BookingStatus.PENDING).length;
    console.log("App - pendingCount:", pendingCount, "bookings:", bookings.length);

    return { 
      totalSales: totalIncome, 
      totalCost: totalExpense, 
      netProfit: netProfit, 
      pendingInvoices: pendingCount 
    };
  }, [transactions, bookings]);

  const addBooking = async (newBooking: Omit<Booking, 'id'>) => {
    try {
      const bookingRef = await addDoc(collection(db, 'bookings'), newBooking);
      
      // Auto-create income transaction
      await addDoc(collection(db, 'transactions'), {
        date: new Date().toISOString().split('T')[0],
        category: `${newBooking.type} Sale`,
        amount: newBooking.amount,
        type: TransactionType.INCOME,
        bookingId: bookingRef.id,
        reference: `BOOKING-${bookingRef.id}`,
        createdAt: serverTimestamp()
      });

      // Auto-create expense transaction for cost
      if (newBooking.cost > 0) {
        await addDoc(collection(db, 'transactions'), {
          date: new Date().toISOString().split('T')[0],
          category: `${newBooking.type} Cost`,
          amount: newBooking.cost,
          type: TransactionType.EXPENSE,
          bookingId: bookingRef.id,
          reference: `COST-${bookingRef.id}`,
          createdAt: serverTimestamp()
        });
      }
    } catch (e) {
      handleFirestoreError(e, 'CREATE', 'bookings');
    }
  };

  const updateBooking = async (updatedBooking: Booking) => {
    try {
      const { id, ...data } = updatedBooking;
      await updateDoc(doc(db, 'bookings', id), data);
      
      // Update linked income transaction if it exists
      const linkedIncome = transactions.find(t => t.bookingId === id && t.type === TransactionType.INCOME);
      if (linkedIncome) {
        await updateDoc(doc(db, 'transactions', linkedIncome.id), {
          amount: updatedBooking.amount,
          category: `${updatedBooking.type} Sale`
        });
      }

      // Update linked expense transaction if it exists, or create if needed
      const linkedExpense = transactions.find(t => t.bookingId === id && (t.type === TransactionType.EXPENSE || t.type === TransactionType.COST_VOLUME));
      if (linkedExpense) {
        if (updatedBooking.cost > 0) {
          await updateDoc(doc(db, 'transactions', linkedExpense.id), {
            amount: updatedBooking.cost,
            category: `${updatedBooking.type} Cost`,
            type: TransactionType.EXPENSE
          });
        } else {
          await deleteDoc(doc(db, 'transactions', linkedExpense.id));
        }
      } else if (updatedBooking.cost > 0) {
         await addDoc(collection(db, 'transactions'), {
          date: new Date().toISOString().split('T')[0],
          category: `${updatedBooking.type} Cost`,
          amount: updatedBooking.cost,
          type: TransactionType.EXPENSE,
          bookingId: id,
          reference: `COST-${id}`,
          createdAt: serverTimestamp()
        });
      }
    } catch (e) {
      handleFirestoreError(e, 'UPDATE', 'bookings');
    }
  };

  const addTransaction = async (newTransaction: Omit<Transaction, 'id'>) => {
    try {
      await addDoc(collection(db, 'transactions'), {
        ...newTransaction,
        createdAt: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, 'CREATE', 'transactions');
    }
  };

  const updateTransaction = async (updatedTransaction: Transaction) => {
    try {
      const { id, ...data } = updatedTransaction;
      await updateDoc(doc(db, 'transactions', id), data);
    } catch (e) {
      handleFirestoreError(e, 'UPDATE', 'transactions');
    }
  };

  const deleteTransaction = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction record?')) {
      try {
        await deleteDoc(doc(db, 'transactions', id));
      } catch (e) {
        handleFirestoreError(e, 'DELETE', 'transactions');
      }
    }
  };

  const deleteBooking = async (id: string) => {
    if (window.confirm('Deleting this reservation will NOT automatically delete associated transactions. Proceed?')) {
      try {
        await deleteDoc(doc(db, 'bookings', id));
      } catch (e) {
        handleFirestoreError(e, 'DELETE', 'bookings');
      }
    }
  };

  const addClient = async (newClient: Omit<Client, 'id' | 'createdAt'>) => {
    try {
      await addDoc(collection(db, 'clients'), {
        ...newClient,
        createdAt: new Date().toISOString()
      });
    } catch (e) {
      handleFirestoreError(e, 'CREATE', 'clients');
    }
  };

  const updateClient = async (updatedClient: Client) => {
    try {
      const { id, ...data } = updatedClient;
      await updateDoc(doc(db, 'clients', id), data);
    } catch (e) {
      handleFirestoreError(e, 'UPDATE', 'clients');
    }
  };

  const isAuthorized = true; // Bypassing email check as requested

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Attempting terminal login with:", loginForm.username);
    if (loginForm.username === adminCreds.username && loginForm.password === adminCreds.password) {
      console.log("Terminal login successful");
      setIsAuthenticated(true);
      try { localStorage.setItem('isLoggedIn', 'true'); } catch {}
      setLoginError('');
      setLoginForm({ username: '', password: '' });
    } else {
      console.warn("Terminal login failed: mapping mismatch");
      setLoginError('Invalid credentials. Access denied.');
    }
  };

  const handleDeveloperBypass = () => {
    if (isAuthorized) {
      console.log("Developer bypass triggered");
      setIsAuthenticated(true);
      try { localStorage.setItem('isLoggedIn', 'true'); } catch {}
      setLoginError('');
    }
  };

  const updateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'settings', 'admin'), settingsForm);
      setSettingsMessage('Credentials updated successfully!');
      setTimeout(() => setSettingsMessage(''), 3000);
    } catch (e) {
      setSettingsMessage('Error saving credentials.');
      handleFirestoreError(e, 'UPDATE', 'settings/admin');
    }
  };

  const handleGoogleSignIn = async () => {
    console.log("handleGoogleSignIn triggered");
    if (loginLoading) {
      console.log("Sign-in already in progress, ignoring request");
      return;
    }
    setLoginLoading(true);
    setAuthError(null);
    try {
      console.log("Initiating Google Sign-in...");
      
      // Add a safety timeout for the popup
      const loginPromise = loginWithGoogle();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('SIGNIN_TIMEOUT')), 25000)
      );

      await Promise.race([loginPromise, timeoutPromise]);
      console.log("Google Sign-in popup completed successfully");
    } catch (e: any) {
      console.error("Sign-in error details:", e);
      if (e.message === 'SIGNIN_TIMEOUT') {
        setAuthError("The login popup is taking too long to respond. This usually means it was blocked or is hanging. Please try the Alternative (Redirect) Mode below.");
      } else if (e.code === 'auth/cancelled-popup-request' || e.code === 'auth/popup-closed-by-user') {
        console.warn("Sign-in popup was cancelled or closed prematurely.");
      } else if (e.code === 'auth/unauthorized-domain') {
        setAuthError("This domain is not authorized for Firebase login. I am attempting to fix this. Please try again in a moment.");
      } else if (e.code === 'auth/popup-blocked') {
        setAuthError("The sign-in popup was blocked by your browser. Please allow popups for this site.");
      } else if (e.code === 'auth/network-request-failed') {
        setAuthError("Network error. Please check your internet connection.");
      } else {
        setAuthError(e.message || "Failed to sign in. Please try again.");
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleGoogleRedirectSignIn = async () => {
    setLoginLoading(true);
    setAuthError(null);
    try {
      const { signInWithRedirect } = await import('firebase/auth');
      await signInWithRedirect(auth, googleProvider);
    } catch (e: any) {
      setAuthError(e.message || "Redirect failed.");
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setRecoveryAnswer('');
    setIsAuthenticated(false);
    try { localStorage.removeItem('isLoggedIn'); } catch {}
    firebaseLogout();
  };

  useEffect(() => {
    let lastWidth = window.innerWidth;
    const handleResize = () => {
      const width = window.innerWidth;
      const isNowMobile = width < 1024;
      const wasMobile = lastWidth < 1024;
      
      if (isNowMobile !== wasMobile) {
        setIsMobile(isNowMobile);
        setSidebarOpen(!isNowMobile);
      }
      lastWidth = width;
    };

    window.addEventListener('resize', handleResize);
    
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#020617';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#f8faff';
    }
  }, [isDarkMode]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the A2HS prompt');
        setDeferredPrompt(null);
      } else {
        console.log('User dismissed the A2HS prompt');
      }
    } else {
      alert("To download this app:\n\n1. On Android/Chrome: Use the 'Install' option in your browser menu.\n2. On iOS/Safari: Tap 'Share' then 'Add to Home Screen'.");
    }
  };

  const navigateToStatement = (clientId: string) => {
    setSelectedClientId(clientId);
    setActiveTab('statements');
    if (isMobile) setSidebarOpen(false);
  };

  const menuItems = [
    { id: 'dashboard', icon: <LayoutDashboard />, label: "DASHBOARD" },
    { id: 'bookings', icon: <Ticket />, label: "ACTIVE BOOKINGS" },
    { id: 'clients', icon: <Users />, label: "CLIENT BASE" },
    { id: 'accounts', icon: <Banknote />, label: "FINANCIALS" },
    { id: 'statements', icon: <History />, label: "STATEMENTS" },
    { id: 'invoices', icon: <FileText />, label: "INVOICES" },
    { id: 'forecast', icon: <BarChart3 />, label: "AI FORECAST" },
    { id: 'ai', icon: <MessageSquareText />, label: "GEMINI AI" },
    { id: 'settings', icon: <Settings />, label: "SYSTEM SETTINGS" },
  ];

  if (!isAuthReady) {
    return (
      <div className={`min-h-[100dvh] flex items-center justify-center transition-colors ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className="flex flex-col items-center gap-6 max-w-xs text-center">
          <Plane className="text-indigo-600 animate-bounce w-12 h-12" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={`min-h-[100dvh] flex items-center justify-center p-4 transition-colors ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-600/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>
        
        <div className={`w-full max-w-md p-8 md:p-12 rounded-[40px] shadow-2xl border transition-all ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-100'}`}>
          <div className="text-center mb-10">
            <div className="inline-flex p-4 vibrant-gradient rounded-3xl shadow-lg mb-6">
              <Plane className="text-white w-8 h-8 rotate-45" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter mb-2">
              ADMIN <span className="text-indigo-600">LOGIN</span>
            </h1>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Financial Accounts Ledger</p>
          </div>

          {dbError && (
             <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-[10px] font-bold animate-in slide-in-from-top-4 duration-300">
               {dbError}
             </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Access Username</label>
              <div className="relative group">
                <Users className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                <input 
                  type="text" 
                  placeholder="admin"
                  required
                  value={loginForm.username}
                  onChange={e => setLoginForm({...loginForm, username: e.target.value})}
                  className={`w-full pl-14 pr-6 py-4 rounded-2xl outline-none border-2 transition-all font-bold ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 focus:border-indigo-500/50' : 'bg-slate-50 border-slate-100 focus:border-indigo-500/50 shadow-inner'
                  }`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Passcode</label>
              <div className="relative group">
                <Settings className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors" size={20} />
                <input 
                  type="password" 
                  placeholder="••••"
                  required
                  value={loginForm.password}
                  onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                  className={`w-full pl-14 pr-6 py-4 rounded-2xl outline-none border-2 transition-all font-bold ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 focus:border-violet-500/50' : 'bg-slate-50 border-slate-100 focus:border-violet-500/50 shadow-inner'
                  }`}
                />
              </div>
            </div>

            {loginError && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-xs font-bold text-center animate-in shake duration-300">
                {loginError}
              </div>
            )}

            <div className="space-y-3">
              <button 
                type="submit"
                className="w-full py-4 vibrant-gradient text-white rounded-2xl shadow-xl shadow-indigo-500/30 font-black tracking-widest uppercase hover:scale-[1.02] active:scale-95 transition-all mt-4"
              >
                Authorize Access
              </button>
              
              {isAuthorized && (
                <button 
                  type="button"
                  onClick={handleDeveloperBypass}
                  className={`w-full py-3 rounded-2xl border-2 border-dashed font-black tracking-widest uppercase text-[10px] transition-all hover:bg-indigo-500/5 ${
                    isDarkMode ? 'border-slate-700 text-slate-400 hover:text-indigo-400' : 'border-slate-100 text-slate-400 hover:text-indigo-600'
                  }`}
                >
                  Quick Connect (Authorized)
                </button>
              )}
            </div>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => setShowForgot(true)}
              className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-500 transition-colors"
            >
              Forgot Passcode?
            </button>
          </div>

          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-full mt-8 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-500 transition-colors"
          >
            Switch to {isDarkMode ? 'Light' : 'Dark'} Mode
          </button>
        </div>

        {/* Forgot Password Modal */}
        {showForgot && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className={`w-full max-w-md p-10 rounded-[40px] border shadow-2xl ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
              <div className="mb-8 items-center flex flex-col text-center">
                <div className="p-4 bg-rose-500/10 text-rose-500 rounded-2xl mb-4">
                  <Settings className="animate-spin-slow" size={32} />
                </div>
                <h3 className="text-2xl font-black tracking-tight uppercase">Terminal Recovery</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 px-6">
                  Answer your security challenge to reset access credentials.
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">
                    Challenge: <span className="text-slate-400">{adminCreds.recoveryQuestion}</span>
                  </label>
                  <input 
                    type="text"
                    placeholder="Provide your secret answer"
                    value={recoveryAnswer}
                    onChange={e => setRecoveryAnswer(e.target.value)}
                    className={`w-full px-6 py-4 rounded-2xl outline-none border-2 transition-all font-bold ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 focus:border-rose-500/50' : 'bg-slate-50 border-slate-100 focus:border-rose-500/50 shadow-inner'
                    }`}
                  />
                </div>

                {recoveryMessage && (
                  <div className={`p-4 rounded-2xl text-[10px] font-bold text-center ${
                    recoveryMessage.includes('Reset') ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                  }`}>
                    {recoveryMessage}
                  </div>
                )}

                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                      setShowForgot(false);
                      setRecoveryMessage('');
                      setRecoveryAnswer('');
                    }}
                    className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}
                  >
                    Abort
                  </button>
                  <button 
                    onClick={() => {
                      if (recoveryAnswer.toLowerCase().trim() === adminCreds.recoveryAnswer.toLowerCase().trim()) {
                        const defaultCreds = { 
                          username: 'admin', 
                          password: '1234',
                          recoveryQuestion: adminCreds.recoveryQuestion,
                          recoveryAnswer: adminCreds.recoveryAnswer
                        };
                        setAdminCreds(defaultCreds);
                        setSettingsForm(defaultCreds);
                        localStorage.setItem('adminCredentials', JSON.stringify(defaultCreds));
                        setRecoveryMessage('Reset Successful! admin / 1234 restored.');
                        setTimeout(() => {
                          setShowForgot(false);
                          setRecoveryMessage('');
                          setRecoveryAnswer('');
                        }, 2500);
                      } else {
                        setRecoveryMessage('Verification failed. Invalid answer.');
                      }
                    }}
                    className="flex-[2] py-4 bg-rose-600 text-white rounded-2xl shadow-lg shadow-rose-500/20 font-black tracking-widest uppercase hover:scale-105 active:scale-95 transition-all"
                  >
                    Reset System Access
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex h-[100dvh] overflow-hidden font-sans transition-all duration-500 pb-safe ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#f8faff] text-slate-900'}`}>
      
      {/* Sidebar Overlay for Mobile */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] transition-all animate-in fade-in duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Unique Sidebar with Gradient & Blur */}
      <aside className={`
        fixed top-0 left-0 h-[100dvh] pb-safe z-[110]
        ${isMobile 
          ? isSidebarOpen ? 'w-[280px] translate-x-0 shadow-2xl' : 'w-[280px] -translate-x-full'
          : isSidebarOpen ? 'w-72 translate-x-0' : 'w-24 translate-x-0'
        }
        ${isDarkMode ? 'bg-slate-900/95 border-slate-800 backdrop-blur-xl' : 'bg-white/95 border-slate-100 backdrop-blur-xl'} 
        border-r transition-all duration-500 flex flex-col group
      `}>
        <div className={`flex items-center shrink-0 transition-all duration-500 ${!isSidebarOpen && !isMobile ? 'p-6 justify-center' : 'p-8 justify-between gap-4'}`}>
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className={`vibrant-gradient rounded-2xl vibrant-glow shrink-0 transition-all duration-500 ${!isSidebarOpen && !isMobile ? 'p-3' : 'p-2.5'}`}>
              <Plane className="text-white w-6 h-6 rotate-45" />
            </div>
            {(isSidebarOpen || isMobile) && (
              <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                <h1 className={`font-black text-lg tracking-tighter transition-colors ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                  B2C <span className="text-violet-600">TICKET</span>
                </h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest -mt-1">ACCOUNTINGS</p>
              </div>
            )}
          </div>
          {isMobile && isSidebarOpen && (
            <button 
              onClick={() => setSidebarOpen(false)}
              className={`p-2 rounded-xl border ${isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'}`}
            >
              <X size={18} />
            </button>
          )}
        </div>

        <nav className="flex-1 px-4 mt-4 overflow-y-auto no-scrollbar min-h-0 pb-16">
          <div className="space-y-1">
            {menuItems.map(item => (
              <NavItem 
                key={item.id}
                icon={item.icon} 
                label={item.label} 
                active={activeTab === item.id} 
                onClick={() => {
                  setActiveTab(item.id as any);
                  if (isMobile) setSidebarOpen(false);
                }} 
                collapsed={!isSidebarOpen && !isMobile} 
                isDarkMode={isDarkMode} 
              />
            ))}
          </div>
          <div className="pt-4 mt-4 pb-4 border-t border-slate-100 dark:border-slate-800">
            <NavItem 
              icon={<History className="rotate-180" />} 
              label="SIGN OUT" 
              onClick={handleLogout} 
              collapsed={!isSidebarOpen && !isMobile} 
              isDarkMode={isDarkMode}
              danger
            />
          </div>
        </nav>

        <div className={`border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-50'} shrink-0 transition-all duration-500 ${!isSidebarOpen && !isMobile ? 'p-3' : 'p-6'} space-y-4`}>
           {/* Install App Button */}
           <button 
             onClick={handleInstallClick}
             className={`w-full flex items-center gap-3 transition-all duration-300 rounded-2xl ${
               !isSidebarOpen && !isMobile ? 'justify-center p-2' : 'p-3'
             } ${isDarkMode ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'bg-indigo-50 text-indigo-700 border border-indigo-100'} hover:scale-[1.02] active:scale-95`}
           >
             <div className="shrink-0 p-1 bg-indigo-600 text-white rounded-lg shadow-lg">
               <DownloadCloud size={16} />
             </div>
             {(isSidebarOpen || isMobile) && (
               <div className="text-left animate-in fade-in slide-in-from-left-2 duration-300">
                 <p className="text-[10px] font-black uppercase tracking-widest leading-none">Download</p>
                 <p className="text-[8px] font-bold opacity-60 uppercase tracking-tighter mt-0.5">Desktop & Mobile</p>
               </div>
             )}
           </button>

           <div className={`flex items-center rounded-2xl transition-all duration-500 ${isDarkMode ? 'bg-slate-800/60' : 'bg-slate-50'} ${!isSidebarOpen && !isMobile ? 'justify-center p-1.5' : 'gap-3 px-3 py-2.5'}`}>
             <button 
              onClick={() => setIsDarkMode(!isDarkMode)} 
              className={`p-2 rounded-xl transition-all duration-300 ${isDarkMode ? 'bg-amber-500/20 text-amber-500 hover:bg-amber-500/30' : 'bg-violet-600 text-white shadow-md hover:shadow-lg'}`}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
               {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
             </button>
             {(isSidebarOpen || isMobile) && <span className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">{isDarkMode ? 'Light' : 'Dark'} Mode</span>}
           </div>
        </div>
      </aside>

      <main className={`flex-1 flex flex-col overflow-hidden relative transition-all duration-500 ${!isMobile ? (isSidebarOpen ? 'ml-72' : 'ml-24') : ''}`}>
        {/* Subtle Background Accent */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>
        <header className={`h-16 md:h-20 pt-safe ${isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-white/90 border-slate-100'} backdrop-blur-xl border-b flex items-center justify-between px-3 md:px-8 shrink-0 z-40 transition-all sticky top-0`}>
          <div className="flex items-center gap-3 md:gap-4 flex-1">
             <button 
                onClick={() => setSidebarOpen(!isSidebarOpen)} 
                className={`p-2 rounded-lg md:p-2.5 md:rounded-xl transition-all duration-300 ${isDarkMode ? 'text-slate-400 bg-slate-900/50 hover:bg-slate-800 hover:text-white' : 'text-slate-500 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 shadow-sm hover:shadow-md'}`}
                aria-label="Toggle Sidebar"
             >
                {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
             </button>
             

             <div className="md:hidden flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
                <div className="w-7 h-7 flex items-center justify-center vibrant-gradient rounded-lg shadow-sm shrink-0">
                   <Plane className="text-white w-4 h-4 rotate-45" />
                </div>
                <div className="flex flex-col">
                  <h1 className={`font-black text-[10px] tracking-tighter leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    B2C <span className="text-violet-600">TICKET</span>
                  </h1>
                  <p className="text-[6px] font-bold text-slate-500 uppercase tracking-[0.1em] mt-0.5 leading-none">ACCOUNTINGS</p>
                </div>
             </div>

             <div className="hidden md:block lg:hidden cursor-pointer" onClick={() => setActiveTab('dashboard')}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center vibrant-gradient rounded-xl shadow-md shrink-0">
                     <Plane className="text-white w-5 h-5 rotate-45" />
                  </div>
                  <div className="flex flex-col">
                    <h1 className={`font-black text-base tracking-tighter transition-colors ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                      B2C <span className="text-violet-600">TICKET</span>
                    </h1>
                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-0.5 leading-none">ACCOUNTINGS</p>
                  </div>
                </div>
             </div>

             <div className="relative w-full max-w-xs hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search itinerary..." 
                className={`w-full pl-11 pr-4 py-2.5 text-xs font-bold border outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all rounded-xl ${
                  isDarkMode ? 'bg-slate-900 text-slate-100 border-slate-800 focus:border-indigo-500/50' : 'bg-slate-50 text-slate-900 border-slate-200/50 focus:border-indigo-500/50'
                }`} 
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-5">
            <button 
              onClick={() => {
                setActiveTab('accounts');
                setOpenTransactionModalKey(Date.now());
                if (isMobile) setSidebarOpen(false);
              }} 
              className="bg-emerald-600 text-white p-2 md:px-6 md:py-2.5 rounded-lg md:rounded-xl flex items-center gap-2 hover:shadow-emerald-500/30 active:scale-95 transition-all text-[10px] md:text-sm font-bold shadow-lg shadow-emerald-500/20 shrink-0"
              title="Financial Entry"
            >
              <Banknote size={16} className="md:w-[18px] md:h-[18px] shrink-0" />
              <span className="hidden md:block">
                <span className="hidden lg:inline">FINANCIAL</span> ENTRY
              </span>
            </button>
            <button 
              onClick={() => {
                setActiveTab('bookings');
                setOpenBookingModalKey(Date.now());
                if (isMobile) setSidebarOpen(false);
              }} 
              className="bg-indigo-600 text-white p-2 md:px-6 md:py-2.5 rounded-lg md:rounded-xl flex items-center gap-2 hover:shadow-indigo-500/30 active:scale-95 transition-all text-[10px] md:text-sm font-bold shadow-lg shadow-indigo-500/20 shrink-0"
              title="Active Bookings"
            >
              <Ticket size={16} className="md:w-[18px] md:h-[18px] shrink-0" />
              <span className="hidden md:block">
                <span className="hidden lg:inline">ACTIVE</span> BOOKINGS
              </span>
            </button>
            <div className="flex items-center gap-2 md:gap-3 shrink-0 ml-1">
              <div className="text-right hidden xl:block">
                <p className={`text-[10px] font-black tracking-tight leading-none ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{firebaseUser?.displayName || 'Admin'}</p>
                <p className="text-[8px] text-indigo-500 font-bold uppercase tracking-widest mt-0.5 opacity-60">Manager</p>
              </div>
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl vibrant-gradient p-[1.5px] shadow-lg group cursor-pointer overflow-hidden">
                <img src={firebaseUser?.photoURL || "https://picsum.photos/80/80?random=1"} alt="Avatar" className="w-full h-full object-cover rounded-[7px] md:rounded-[9px] border-2 border-transparent group-hover:scale-110 transition-transform" />
              </div>
            </div>
          </div>
        </header>

        <div className={`flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar scroll-smooth ${isMobile ? 'pb-28' : ''}`}>
          <div className="max-w-7xl mx-auto">
            {dbError && (
              <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-xs font-bold animate-in slide-in-from-top-4 duration-300">
                {dbError}
              </div>
            )}
            {activeTab === 'dashboard' && (
              <Dashboard 
                stats={stats} 
                bookings={bookings} 
                setActiveTab={setActiveTab} 
                onBookingClick={(id) => {
                  setPreselectedBookingId(id);
                  setActiveTab('bookings');
                }}
                isDarkMode={isDarkMode} 
              />
            )}
            {activeTab === 'clients' && <ClientList clients={clients} bookings={bookings} onAdd={addClient} onUpdate={updateClient} onNavigateToStatement={navigateToStatement} isDarkMode={isDarkMode} />}
            {activeTab === 'bookings' && (
              <BookingList 
                bookings={bookings} 
                clients={clients} 
                onAdd={addBooking} 
                onUpdate={updateBooking} 
                onDelete={deleteBooking} 
                isDarkMode={isDarkMode} 
                triggerAddModalKey={openBookingModalKey} 
                initialSelectedBookingId={preselectedBookingId}
                onSelectionCleared={() => setPreselectedBookingId(null)}
              />
            )}
            {activeTab === 'invoices' && <InvoiceList bookings={bookings} clients={clients} isDarkMode={isDarkMode} />}
            {activeTab === 'statements' && <StatementView clients={clients} bookings={bookings} transactions={transactions} defaultClientId={selectedClientId} isDarkMode={isDarkMode} />}
            {activeTab === 'forecast' && <Forecast bookings={bookings} isDarkMode={isDarkMode} />}
            {activeTab === 'accounts' && <TransactionList transactions={transactions} stats={stats} onAddTransaction={addTransaction} onUpdateTransaction={updateTransaction} onDeleteTransaction={deleteTransaction} isDarkMode={isDarkMode} triggerAddModalKey={openTransactionModalKey} />}
            {activeTab === 'ai' && <AIChat bookings={bookings} transactions={transactions} isDarkMode={isDarkMode} />}
            {activeTab === 'settings' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-10">
                  <h2 className="text-3xl font-black tracking-tight mb-2">SYSTEM <span className="text-indigo-600">SETTINGS</span></h2>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Global account & terminal configuration</p>
                </div>

                <div className={`max-w-xl p-10 rounded-[40px] border shadow-2xl transition-all ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-100'}`}>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 vibrant-gradient rounded-2xl shadow-lg">
                      <Users className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold tracking-tight">Access Credentials</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Manage administrative login data</p>
                    </div>
                  </div>

                  <form onSubmit={updateSettings} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Terminal Username</label>
                      <input 
                        type="text" 
                        value={settingsForm.username}
                        onChange={e => setSettingsForm({...settingsForm, username: e.target.value})}
                        className={`w-full px-6 py-4 rounded-2xl outline-none border-2 transition-all font-bold ${
                          isDarkMode ? 'bg-slate-800 border-slate-700 focus:border-indigo-500/50' : 'bg-slate-50 border-slate-100 focus:border-indigo-500/50 shadow-inner'
                        }`}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Access Passcode</label>
                      <input 
                        type="password" 
                        value={settingsForm.password}
                        onChange={e => setSettingsForm({...settingsForm, password: e.target.value})}
                        className={`w-full px-6 py-4 rounded-2xl outline-none border-2 transition-all font-bold ${
                          isDarkMode ? 'bg-slate-800 border-slate-700 focus:border-indigo-500/50' : 'bg-slate-50 border-slate-100 focus:border-indigo-500/50 shadow-inner'
                        }`}
                      />
                    </div>

                    <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2 mb-2">
                        <History size={16} className="text-violet-500" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Security Recovery Details</h4>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Recovery Question</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Favorite childhood pet?"
                          value={settingsForm.recoveryQuestion || ''}
                          onChange={e => setSettingsForm({...settingsForm, recoveryQuestion: e.target.value})}
                          className={`w-full px-6 py-4 rounded-2xl outline-none border-2 transition-all font-bold ${
                            isDarkMode ? 'bg-slate-800 border-slate-700 focus:border-violet-500/50' : 'bg-slate-50 border-slate-100 focus:border-violet-500/50 shadow-inner'
                          }`}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Secret Answer</label>
                        <input 
                          type="text" 
                          value={settingsForm.recoveryAnswer || ''}
                          onChange={e => setSettingsForm({...settingsForm, recoveryAnswer: e.target.value})}
                          className={`w-full px-6 py-4 rounded-2xl outline-none border-2 transition-all font-bold ${
                            isDarkMode ? 'bg-slate-800 border-slate-700 focus:border-violet-500/50' : 'bg-slate-50 border-slate-100 focus:border-violet-500/50 shadow-inner'
                          }`}
                        />
                      </div>
                    </div>

                    {settingsMessage && (
                      <div className={`p-4 rounded-2xl text-xs font-bold text-center animate-in zoom-in duration-300 ${
                        settingsMessage.includes('successfully') ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                      }`}>
                        {settingsMessage}
                      </div>
                    )}

                    <button 
                      type="submit"
                      className="w-full py-4 vibrant-gradient text-white rounded-2xl shadow-xl shadow-indigo-500/30 font-black tracking-widest uppercase hover:scale-[1.02] active:scale-95 transition-all mt-4"
                    >
                      Update Terminal Data
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <nav className={`fixed bottom-0 left-0 right-0 z-[100] px-4 pb-safe pt-2 ${isDarkMode ? 'bg-slate-900/80' : 'bg-white/90'} backdrop-blur-xl border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'} flex items-center justify-around animate-in slide-in-from-bottom-full duration-500`}>
          {menuItems.slice(0, 5).map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex flex-col items-center gap-1.5 py-2 px-3 rounded-2xl transition-all ${
                (activeTab as string) === item.id 
                  ? isDarkMode ? 'text-indigo-400' : 'text-indigo-600'
                  : 'text-slate-400'
              }`}
            >
              <div className={`transition-transform duration-300 ${activeTab === (item.id as any) ? 'scale-110' : ''}`}>
                {React.isValidElement(item.icon) ? React.cloneElement(item.icon as React.ReactElement<any>, { size: 20 }) : item.icon}
              </div>
              <span className={`text-[8px] font-black uppercase tracking-widest ${activeTab === item.id ? 'opacity-100' : 'opacity-60'}`}>
                {item.label.split(' ')[0]}
              </span>
              {activeTab === item.id && (
                <div className="absolute -bottom-1 w-1 h-1 rounded-full vibrant-gradient"></div>
              )}
            </button>
          ))}
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center gap-1.5 py-2 px-3 rounded-2xl transition-all ${
              activeTab === 'settings' 
                ? isDarkMode ? 'text-indigo-400' : 'text-indigo-600'
                : 'text-slate-400'
            }`}
          >
            <Settings size={20} />
            <span className="text-[8px] font-black uppercase tracking-widest opacity-60">System</span>
          </button>
        </nav>
      )}
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick, collapsed, isDarkMode, danger }: any) => (
  <button 
    onClick={onClick} 
    className={`
      w-full flex items-center rounded-2xl transition-all duration-300 group relative
      ${collapsed ? 'justify-center p-3.5' : 'gap-4 px-4 py-3.5'}
      ${active 
        ? 'vibrant-gradient text-white shadow-xl shadow-violet-500/20' 
        : danger
          ? 'text-rose-500 hover:bg-rose-500/10'
          : isDarkMode 
            ? 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-200' 
            : 'text-slate-500 hover:bg-violet-50 hover:text-violet-700'
      }
    `}
  >
    <div className={`
      flex items-center justify-center transition-colors
      ${active ? 'text-white' : isDarkMode ? 'text-slate-500 group-hover:text-violet-400' : 'text-slate-400 group-hover:text-violet-600'}
    `}>
      {React.cloneElement(icon, { size: collapsed ? 24 : 22 })}
    </div>
    {!collapsed && <span className="font-bold text-[10px] sm:text-xs uppercase tracking-widest truncate">{label}</span>}
    {active && collapsed && <div className="absolute right-0 w-1.5 h-6 bg-white rounded-l-full"></div>}
  </button>
);

export default App;
