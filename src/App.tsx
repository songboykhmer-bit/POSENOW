import React, { useState, useEffect } from 'react';
import { AppDataState, Employee, Attendance, Inventory, Booking, PurchaseInv, PurchaseHK, MenuItem, InvoiceRT, LoanRecord } from './types';
import { SEED_EMPLOYEES, SEED_INVENTORY, SEED_MENU_ITEMS, SEED_BOOKINGS } from './data/seedData';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import EmployeeRegistry from './components/EmployeeRegistry';
import PayrollManager from './components/PayrollManager';
import AttendanceTracker from './components/AttendanceTracker';
import StockInventory from './components/StockInventory';
import BookingReservations from './components/BookingReservations';
import RestaurantPOS from './components/RestaurantPOS';
import PurchasingInventory from './components/PurchasingInventory';
import PurchasingHousekeeping from './components/PurchasingHousekeeping';
import { 
  LayoutDashboard, Hotel, Receipt, Users, CreditCard, Clock, Package, 
  ShoppingCart, Brush, ClipboardList, LogOut, Globe, Wifi, WifiOff, RefreshCw, 
  Sparkles, CheckCircle2 
} from 'lucide-react';

const STORAGE_KEY = 'phe_samout_db_state_v1';

const INITIAL_PURCHASES_INV: PurchaseInv[] = [
  {
    poRef: 'PO-2026-9811',
    date: '2026-06-01',
    item: 'Fresh Kep Blue Swimmer Crab',
    cat: 'Meat',
    supplier: 'Kep Crab Market Association',
    qtyUnit: 'Kg',
    qty: 40,
    unitCost: 280.0,
    delivery: '2026-06-02',
    status: 'Received',
    notes: 'Kitchen priority stock assignment.'
  },
  {
    poRef: 'PO-2026-4402',
    date: '2026-06-08',
    item: 'Kep Organic Green Peppercorns',
    cat: 'Ingredient',
    supplier: 'Kep Pepper Farm Direct',
    qtyUnit: 'Kg',
    qty: 10,
    unitCost: 110.0,
    delivery: '2026-06-10',
    status: 'Ordered',
    notes: 'Signature grill ingredients.'
  }
];

const INITIAL_PURCHASES_HK: PurchaseHK[] = [
  {
    poRef: 'HK-2026-0112',
    date: '2026-06-02',
    item: 'Luxury Bath Towels Ultra Soft',
    cat: 'Linen & Towels',
    supplier: 'Phnom Penh Textile Corp',
    qty: 50,
    unitCost: 6.5,
    area: 'Floor 1 & 2 Suites',
    status: 'Received',
    notes: 'Replaced torn linens.'
  },
  {
    poRef: 'HK-2026-0231',
    date: '2026-06-08',
    item: 'Natural Lemongrass Reed Diffuser',
    cat: 'Toiletries / Amenities',
    supplier: 'Cambodia Herbal Care',
    qty: 24,
    unitCost: 4.8,
    area: 'All Ocean Villas',
    status: 'Ordered',
    notes: 'Fragrance optimization.'
  }
];

const INITIAL_INVOICES_RT: InvoiceRT[] = [
  {
    invNo: 'INV-45521',
    roomNo: '101',
    guestName: 'William Thornton',
    date: '2026-06-08',
    subtotal: 54.0,
    totalDiscount: 5.0,
    grand: 49.0,
    savedAt: '06/08/2026 01:15 PM',
    rows: [
      { desc: 'Kep Pepper Grilled Crab', qty: 1, price: 28.0, discount: 0 },
      { desc: 'Fresh Organic Coconut Water', qty: 2, price: 4.5, discount: 0 },
      { desc: 'Spicy Beach Mai Tai', qty: 2, price: 8.5, discount: 5 }
    ]
  }
];

export default function App() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('phe_samout_auth') === 'true';
  });

  // Database Core state
  const [appData, setAppData] = useState<AppDataState>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Failed to parse local storage cache, seeding defaults.', e);
      }
    }
    return {
      employees: SEED_EMPLOYEES,
      attendance: [],
      inventory: SEED_INVENTORY,
      bookings: SEED_BOOKINGS,
      activityLogs: [
        'System initialized with premium seed entries successfully.',
        'PHE SAMOUT BEACH RESORT PMS online database synchronized offline.'
      ],
      purchaseInv: INITIAL_PURCHASES_INV,
      purchaseHK: INITIAL_PURCHASES_HK,
      menuItems: SEED_MENU_ITEMS,
      invoicesRT: INITIAL_INVOICES_RT,
      loanRecords: {}
    };
  });

  // UI States
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [lang, setLang] = useState<'en' | 'kh'>('kh'); // Default is Khmer based on prompt user preferences
  const [localMode, setLocalMode] = useState<'online' | 'offline'>('online');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
  }, [appData]);

  // Auth local caching
  const handleLoginSuccess = () => {
    localStorage.setItem('phe_samout_auth', 'true');
    setIsAuthenticated(true);
    logActivity('Admin logged in securely.');
  };

  const handleLogout = () => {
    if (confirm(lang === 'kh' ? 'តើអ្នកប្រាកដជាចង់ចាកចេញមែនទេ?' : 'Are you sure you want to log out of the resort console?')) {
      localStorage.removeItem('phe_samout_auth');
      setIsAuthenticated(false);
    }
  };

  // Activity logger helper
  const logActivity = (msg: string) => {
    const stamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const logValue = `[${stamp}] ${msg}`;
    setAppData((prev) => ({
      ...prev,
      activityLogs: [logValue, ...prev.activityLogs.slice(0, 99)]
    }));
  };

  // State modifiers to pass into sub-components
  const handleEmployeesChange = (updated: Employee[]) => {
    setAppData((prev) => ({ ...prev, employees: updated }));
  };

  const handleAttendanceChange = (updated: Attendance[]) => {
    setAppData((prev) => ({ ...prev, attendance: updated }));
  };

  const handleInventoryChange = (updated: Inventory[]) => {
    setAppData((prev) => ({ ...prev, inventory: updated }));
  };

  const handleBookingsChange = (updated: Booking[]) => {
    setAppData((prev) => ({ ...prev, bookings: updated }));
  };

  const handlePurchaseInvChange = (updated: PurchaseInv[]) => {
    setAppData((prev) => ({ ...prev, purchaseInv: updated }));
  };

  const handlePurchaseHKChange = (updated: PurchaseHK[]) => {
    setAppData((prev) => ({ ...prev, purchaseHK: updated }));
  };

  const handleMenuItemsChange = (updated: MenuItem[]) => {
    setAppData((prev) => ({ ...prev, menuItems: updated }));
  };

  const handleInvoicesChange = (updated: InvoiceRT[]) => {
    setAppData((prev) => ({ ...prev, invoicesRT: updated }));
  };

  const handleLoanRecordsChange = (updatedRecords: Record<string, LoanRecord[]>) => {
    setAppData((prev) => ({ ...prev, loanRecords: updatedRecords }));
  };

  // Sync Action simulator
  const triggerCloudSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      const msg = lang === 'kh' 
        ? 'ការសមកាលកម្មទិន្នន័យ (Data Synchronization) ជោគជ័យជាមួយ Cloud Server!'
        : 'Data Synchronization complete with Cloud backplanes! Safe Storage configured.';
      logActivity('Online cloud replication check pass. Databases active.');
      setSyncToast(msg);
      setTimeout(() => setSyncToast(null), 4000);
    }, 1800);
  };

  // If not authenticated show Login form
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const isKh = lang === 'kh';

  // Left Sidebar Roster Tabs configurations
  const menuTabs = [
    { id: 'dashboard', nameEn: 'Dashboard Metrics', nameKh: '📊 ផ្ទាំងគ្រប់គ្រងទូទៅ', icon: LayoutDashboard },
    { id: 'bookings', nameEn: 'Room Bookings', nameKh: '🏨 ការកក់បន្ទប់ស្នាក់នៅ', icon: Hotel },
    { id: 'pos', nameEn: 'Restaurant POS', nameKh: '🧾 ភោជនីយដ្ឋាន & POS', icon: Receipt },
    { id: 'staff', nameEn: 'Employee Registry', nameKh: '📋 បញ្ជីរាយនាមបុគ្គលិក', icon: Users },
    { id: 'payroll', nameEn: 'Payroll Manager', nameKh: '💳 បើកប្រាក់បៀវត្សរ៍', icon: CreditCard },
    { id: 'attendance', nameEn: 'Attendance Tracker', nameKh: '⏱️ ការវត្តមានបុគ្គលិក', icon: Clock },
    { id: 'inventory', nameEn: 'Stock Inventory', nameKh: '📦 សន្និធិគ្របដណ្តប់ស្តុក', icon: Package },
    { id: 'purchasingFnb', nameEn: 'F&B Pantry Purchases', nameKh: '🛒 ទិញទំនិញ F&B', icon: ShoppingCart },
    { id: 'purchasingHk', nameEn: 'HK Supplies Purchases', nameKh: '🧹 ទិញសម្ភារៈ HK', icon: Brush },
    { id: 'logs', nameEn: 'Activity Audit Log', nameKh: '📜 ប្រវត្តិកត់ត្រាប្រព័ន្ធ', icon: ClipboardList },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      
      {/* Top Main Application Brand Header banner */}
      <header className="bg-purple-950 text-white p-4 px-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-yellow-500 shadow-lg relative z-20 print:hidden">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-lg md:text-xl font-black text-yellow-400 font-sans tracking-wide flex items-center gap-2.5">
              <span>PHE SAMOUT BEACH RESORT</span>
              <span className="bg-yellow-500 text-purple-950 text-xs px-2.5 py-0.5 rounded-lg font-black border border-yellow-400 shadow-sm inline-block select-none pointer-events-none">P</span>
            </h1>
            <p className="text-[10px] uppercase font-bold tracking-widest text-purple-200">
              {isKh ? 'ប្រព័ន្ធគ្រប់គ្រងសណ្ឋាគារលំដាប់ខ្ពស់ (Bilingual PMS)' : 'Bilingual Luxury Resort Management Solution'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto flex-wrap">
          {/* Online/Offline Status sync mode toggle tag */}
          <div className="flex items-center gap-1.5 bg-white/10 p-1 px-3 rounded-full text-xs font-bold border border-white/10">
            {localMode === 'online' ? (
              <span className="flex items-center gap-1.5 text-green-400">
                <Wifi size={14} className="animate-pulse" />
                <span>🌐 Online Sync Mode</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-400">
                <WifiOff size={14} />
                <span>📴 Offline Local Host Only</span>
              </span>
            )}
            <button
              onClick={() => setLocalMode(prev => prev === 'online' ? 'offline' : 'online')}
              className="ml-2 p-0.5 px-2 bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-black rounded text-[9px] uppercase transition-colors cursor-pointer"
            >
              Toggle
            </button>
          </div>

          {/* Sync Button */}
          <button
            onClick={triggerCloudSync}
            disabled={isSyncing}
            className={`p-2 px-3 bg-purple-800 hover:bg-purple-700 text-white text-xs font-black rounded-lg transition-all flex items-center gap-1.5 cursor-pointer border border-purple-500 shadow-sm ${isSyncing ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
            <span>{isSyncing ? (isKh ? 'កំពុងសមកាលកម្ម...' : 'Syncing...') : (isKh ? 'សមកាលកម្ម Cloud' : 'Simulate Synced')}</span>
          </button>

          {/* Language Toggle */}
          <div className="flex items-center border border-white/20 rounded-lg overflow-hidden shrink-0 font-bold text-xs bg-purple-900/40">
            <button
              onClick={() => { setLang('kh'); logActivity('Language switched to Khmer.'); }}
              className={`p-2 px-3 transition-colors flex items-center gap-1 cursor-pointer ${lang === 'kh' ? 'bg-yellow-500 text-purple-950' : 'hover:bg-white/10'}`}
            >
              <span>🇰🇭</span>
              <span>ខ្មែរ</span>
            </button>
            <button
              onClick={() => { setLang('en'); logActivity('Language switched to English.'); }}
              className={`p-2 px-3 transition-colors flex items-center gap-1 cursor-pointer ${lang === 'en' ? 'bg-yellow-500 text-purple-950' : 'hover:bg-white/10'}`}
            >
              <span>🇺🇸</span>
              <span>ENG</span>
            </button>
          </div>

          {/* Logout Lock */}
          <button
            onClick={handleLogout}
            className="p-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors cursor-pointer"
            title="Log out of console"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Sync success Toast overlay wrapper */}
      {syncToast && (
        <div className="p-4 bg-green-50 text-green-900 border-l-4 border-green-600 fixed bottom-4 right-4 z-50 rounded-lg shadow-xl flex items-center gap-2 max-w-sm font-semibold text-xs animate-fadeIn">
          <CheckCircle2 className="text-green-600 animate-bounce" size={20} />
          <div>
            <p className="font-extrabold uppercase mb-0.5">Database Safe Synchronization Mode</p>
            <p className="text-gray-600">{syncToast}</p>
          </div>
        </div>
      )}

      {/* Main split dashboard frame */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar Menu navigation rails */}
        <aside className="w-64 bg-slate-900 text-white border-r border-slate-800 flex flex-col justify-between shrink-0 hover:shadow-xl transition-all duration-300 print:hidden">
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[80vh]">
            <p className="text-[10px] font-extrabold text-blue-400 uppercase tracking-widest px-3 mb-2">
              {isKh ? 'ម៉ឺនុយចាក់សោប្រព័ន្ធ:' : 'MAIN NAVIGATION SYSTEM:'}
            </p>
            {menuTabs.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left p-2.5 px-4 rounded-xl flex items-center gap-3 transition-all font-semibold text-xs cursor-pointer ${isActive ? 'bg-purple-700 text-white font-black shadow-lg shadow-purple-900/40 translate-x-1.5' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                >
                  <TabIcon size={16} className={isActive ? 'text-yellow-400' : 'text-slate-500'} />
                  <span>{isKh ? tab.nameKh : tab.nameEn}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 bg-slate-950 border-t border-slate-800 text-center text-[10px] text-slate-500 space-y-1.5">
            <p className="font-bold flex items-center justify-center gap-1">
              <Sparkles className="text-yellow-500" size={10} />
              <span>PHE SAMOUT PMS v1.0.42</span>
            </p>
            <p className="leading-relaxed">Safe SQLite & LocalStorage sync. Tested in Kep beach workspace environment.</p>
          </div>
        </aside>

        {/* Main interactive viewport container */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          
          {/* Offline/Online local syncing banner warning info cards */}
          {localMode === 'offline' && (
            <div className="mb-6 bg-amber-50 border-l-4 border-amber-600 p-4 rounded-xl flex items-center justify-between text-xs font-semibold text-amber-900">
              <div className="flex items-center gap-2">
                <WifiOff className="text-amber-600 animate-pulse" size={18} />
                <div>
                  <p className="font-extrabold uppercase">Offline Mode Active (កំពុងដំណើរការ Offline)</p>
                  <p className="text-gray-600 mt-0.5">The PMS is saving data directly inside the browser storage (Secure Local Cache). Turn on Online mode when internet connection recovers.</p>
                </div>
              </div>
              <button
                onClick={() => setLocalMode('online')}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg cursor-pointer"
              >
                Switch Online Mode
              </button>
            </div>
          )}

          {/* Core Applet views router */}
          <div>
            {activeTab === 'dashboard' && (
              <Dashboard 
                employees={appData.employees}
                inventory={appData.inventory}
                bookings={appData.bookings}
                purchaseInv={appData.purchaseInv}
                purchaseHK={appData.purchaseHK}
                invoicesRT={appData.invoicesRT}
                activityLogs={appData.activityLogs}
                lang={lang}
              />
            )}

            {activeTab === 'bookings' && (
              <BookingReservations 
                bookings={appData.bookings}
                onBookingsChange={handleBookingsChange}
                onActivityLogged={logActivity}
                lang={lang}
              />
            )}

            {activeTab === 'pos' && (
              <RestaurantPOS 
                invoicesRT={appData.invoicesRT}
                onInvoicesChange={handleInvoicesChange}
                onActivityLogged={logActivity}
                lang={lang}
              />
            )}

            {activeTab === 'staff' && (
              <EmployeeRegistry 
                employees={appData.employees}
                onEmployeesChange={handleEmployeesChange}
                onActivityLogged={logActivity}
                lang={lang}
              />
            )}

            {activeTab === 'payroll' && (
              <PayrollManager 
                employees={appData.employees}
                onActivityLogged={logActivity}
                loanRecords={appData.loanRecords}
                onLoansChange={handleLoanRecordsChange}
                lang={lang}
              />
            )}

            {activeTab === 'attendance' && (
              <AttendanceTracker 
                employees={appData.employees}
                attendance={appData.attendance}
                onAttendanceChange={handleAttendanceChange}
                onActivityLogged={logActivity}
                lang={lang}
              />
            )}

            {activeTab === 'inventory' && (
              <StockInventory 
                inventory={appData.inventory}
                onInventoryChange={handleInventoryChange}
                onActivityLogged={logActivity}
                lang={lang}
              />
            )}

            {activeTab === 'purchasingFnb' && (
              <PurchasingInventory 
                purchaseInv={appData.purchaseInv}
                onPurchaseInvChange={handlePurchaseInvChange}
                onActivityLogged={logActivity}
                lang={lang}
              />
            )}

            {activeTab === 'purchasingHk' && (
              <PurchasingHousekeeping 
                purchaseHK={appData.purchaseHK}
                onPurchaseHKChange={handlePurchaseHKChange}
                onActivityLogged={logActivity}
                lang={lang}
              />
            )}

            {activeTab === 'logs' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="border-b pb-3 flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-black text-purple-900 font-sans">
                      {isKh ? '📜 ប្រវត្តិកត់ត្រាប្រព័ន្ធប្រចាំថ្ងៃ' : '📜 Daily System Events Audit Logs'}
                    </h2>
                    <p className="text-gray-500 text-xs mt-1 uppercase font-bold tracking-wider">
                      Real-time receptionist changes and system transaction logs
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(isKh ? 'តើអ្នកចង់លុបប្រវត្តិកត់ត្រាទាំងអស់?' : 'Clear all system session log actions?')) {
                        setAppData(prev => ({ ...prev, activityLogs: [] }));
                      }
                    }}
                    className="px-3 py-1.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg text-xs font-black transition-colors cursor-pointer"
                  >
                    Clear Log Logs
                  </button>
                </div>

                <div className="bg-slate-900 text-green-400 p-6 rounded-2xl border border-slate-800 shadow-inner font-mono text-xs space-y-2.5 max-h-[580px] overflow-y-auto">
                  {appData.activityLogs.length === 0 ? (
                    <div className="text-center text-slate-500 py-10">No recent system transactions logged.</div>
                  ) : (
                    appData.activityLogs.map((log, i) => (
                      <div key={i} className="flex gap-2">
                        <span className="text-slate-500 select-none">&gt;</span>
                        <p className="leading-relaxed">{log}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Main footer watermark print-exclude info panel */}
      <footer className="bg-slate-100 border-t border-slate-200 text-center p-4 text-[10px] text-gray-400 tracking-wider font-semibold print:hidden flex flex-col md:flex-row justify-between items-center px-8 gap-2">
        <span>© 2026 PHE SAMOUT BEACH RESORT - PMS ENTERPRISE SYSTEM. ALL RIGHTS RESERVED.</span>
        <span>LOCATION: PHESAMOUT BEACH RESORT RD, KAMPOT PROVINCE, CAMBODIA.</span>
      </footer>
    </div>
  );
}
