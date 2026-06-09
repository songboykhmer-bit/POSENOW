import { useMemo } from 'react';
import { Employee, Booking, Inventory, PurchaseInv, PurchaseHK, InvoiceRT } from '../types';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import { Users, BookOpen, Ban, Compass, DollarSign, ListCollapse, CalendarDays, TrendingUp } from 'lucide-react';

interface DashboardProps {
  employees: Employee[];
  bookings: Booking[];
  inventory: Inventory[];
  purchaseInv: PurchaseInv[];
  purchaseHK: PurchaseHK[];
  invoicesRT: InvoiceRT[];
  activityLogs: string[];
  lang: 'en' | 'kh';
}

export default function Dashboard({
  employees,
  bookings,
  inventory,
  purchaseInv,
  purchaseHK,
  invoicesRT,
  activityLogs,
  lang,
}: DashboardProps) {
  // Translate labels based on active language
  const isKh = lang === 'kh';

  // Dynamic daily restaurant revenue trends based on invoicesRT
  const dailyTrends = useMemo(() => {
    const revenueMap: Record<string, { date: string; revenue: number; rawDate: string }> = {};
    
    invoicesRT.forEach((inv) => {
      if (!inv.date) return;
      const d = inv.date;
      if (!revenueMap[d]) {
        revenueMap[d] = { date: d, revenue: 0, rawDate: d };
      }
      revenueMap[d].revenue += inv.grand || 0;
    });

    let sortedData = Object.values(revenueMap).sort((a, b) => {
      return new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime();
    });

    // Handle backfilling for beautiful chart rendering under sparse data conditions
    if (sortedData.length > 0 && sortedData.length < 5) {
      const baseDate = new Date(sortedData[0].rawDate);
      const backfilled: typeof sortedData = [];
      for (let i = 3; i >= 1; i--) {
        const prev = new Date(baseDate);
        prev.setDate(baseDate.getDate() - i);
        const prevStr = prev.toISOString().split('T')[0];
        backfilled.push({ date: prevStr, revenue: 0, rawDate: prevStr });
      }
      sortedData = [...backfilled, ...sortedData];
    } else if (sortedData.length === 0) {
      const today = new Date();
      for (let i = 4; i >= 0; i--) {
        const prev = new Date(today);
        prev.setDate(today.getDate() - i);
        const prevStr = prev.toISOString().split('T')[0];
        sortedData.push({ date: prevStr, revenue: 0, rawDate: prevStr });
      }
    }

    return sortedData.map(item => {
      let formattedDate = item.date;
      try {
        const dObj = new Date(item.rawDate);
        if (!isNaN(dObj.getTime())) {
          formattedDate = dObj.toLocaleDateString(isKh ? 'km-KH' : 'en-US', { day: '2-digit', month: 'short' });
        }
      } catch (e) {
        // ignore
      }
      return {
        ...item,
        formattedDate,
      };
    });
  }, [invoicesRT, isKh]);

  // Calculations
  const totalEmployees = employees.length;
  const activeBookings = bookings.filter((b) => b.status === 'Confirmed').length;
  const rejectedOrChanged = bookings.filter((b) => b.status === 'Rejected' || b.status === 'Changed').length;

  // Revenue Streams
  const bookingRevenue = bookings.filter((b) => b.status === 'Confirmed').reduce((sum, b) => sum + (b.price || 0), 0);
  const restaurantRevenue = invoicesRT.reduce((sum, inv) => sum + (inv.subtotal || 0), 0); // F&B or POS total
  const payrollCollected = employees.reduce((sum, e) => sum + (e.salary || 0), 0); // Payroll total revenue side
  const invoiceRTRevenue = invoicesRT.reduce((sum, inv) => sum + (inv.grand || 0), 0);

  const totalRevenue = bookingRevenue + restaurantRevenue + invoiceRTRevenue;

  // Spending Component Costs
  const spendPayroll = payrollCollected; // Employees' gross salaries
  const spendStock = inventory.reduce((sum, item) => sum + (item.qtyNum * item.cost), 0);
  const spendPInv = purchaseInv.reduce((sum, p) => sum + (p.unitCost || 0), 0);
  const spendPHK = purchaseHK.reduce((sum, p) => sum + (p.qty * p.unitCost), 0);

  const totalSpending = spendPayroll + spendStock + spendPInv + spendPHK;

  // Recharts overall pie data
  const grossData = [
    { name: isKh ? 'ចំណូលសរុប (Revenue)' : 'Total Revenue', value: totalRevenue, color: '#10B981' },
    { name: isKh ? 'ចំណាយសរុប (Spending)' : 'Total Spending', value: totalSpending, color: '#EF4444' },
  ];

  // Recharts revenue distribution data
  const streamsData = [
    { name: isKh ? 'ការកក់បន្ទប់ (Booking)' : 'Rooms & Reservations', value: bookingRevenue, color: '#3B82F6' },
    { name: isKh ? 'ភោជនីយដ្ឋាន (POS)' : 'Restaurant Sales', value: restaurantRevenue, color: '#F59E0B' },
    { name: isKh ? 'គណនេយ្យប្រាក់ (Payroll)' : 'Payroll Billed', value: payrollCollected, color: '#10B981' },
    { name: isKh ? 'វិក្កយបត្រ (Invoice RT)' : 'Invoice RT Fees', value: invoiceRTRevenue, color: '#8B5CF6' },
  ];

  // Recharts spending distribution analytics
  const spendingStreamData = [
    { name: isKh ? 'បើកប្រាក់បុគ្គលិក' : 'Payroll Cost', value: spendPayroll, color: '#DC2626' },
    { name: isKh ? 'តម្លៃទំនិញស្តុក' : 'On-hand Inventory', value: spendStock, color: '#F97316' },
    { name: isKh ? 'ការទិញអាហារចំណី' : 'F&B Pantry Purchases', value: spendPInv, color: '#EC4899' },
    { name: isKh ? 'សារពើភ័ណ្ឌបន្ទប់' : 'Housekeeping Supplies', value: spendPHK, color: '#6366F1' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn" id="mod-dashboard">
      <div>
        <h2 className="text-2xl font-extrabold text-purple-900 border-b-4 border-purple-100 pb-3 font-sans">
          {isKh ? '📊 ផ្ទាំងវិភាគទិន្នន័យរីសត PHE SAMOUT' : '📊 PHE SAMOUT Resorts Business Analytics'}
        </h2>
        <p className="text-gray-500 text-xs mt-1 tracking-wider uppercase font-semibold">
          {isKh ? 'ព័ត៌មានវិភាគ និងសុខភាពហិរញ្ញវត្ថុពេលជាក់ស្តែង' : 'Real-time financial performance and overview'}
        </p>
      </div>

      {/* Row 1: KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-purple-600 transition-all duration-300 hover:shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs uppercase font-extrabold text-gray-400 tracking-wider">
                {isKh ? '👥 បុគ្គលិកសរុប' : '👥 Total Employees'}
              </span>
              <h3 className="text-3xl font-black text-purple-700 mt-1">{totalEmployees}</h3>
            </div>
            <div className="p-3 bg-purple-50 rounded-xl text-purple-700">
              <Users size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-green-500 transition-all duration-300 hover:shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs uppercase font-extrabold text-gray-400 tracking-wider">
                {isKh ? '✅ ការកក់សកម្ម' : '✅ Active Bookings'}
              </span>
              <h3 className="text-3xl font-black text-green-600 mt-1">{activeBookings}</h3>
            </div>
            <div className="p-3 bg-green-50 rounded-xl text-green-600">
              <BookOpen size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-red-500 transition-all duration-300 hover:shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs uppercase font-extrabold text-gray-400 tracking-wider">
                {isKh ? '❌ ការកក់បានច្រានចោល/ផ្លាស់ប្តូរ' : '❌ Cancelled / Modified'}
              </span>
              <h3 className="text-3xl font-black text-red-600 mt-1">{rejectedOrChanged}</h3>
            </div>
            <div className="p-3 bg-red-50 rounded-xl text-red-600">
              <Ban size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Financial Breakdown (Income/Outcome) */}
      <div>
        <h4 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-4">
          {isKh ? '💸 របាយការណ៍ហិរញ្ញវត្ថុរួម' : '💸 Financial Revenue vs Spending'}
        </h4>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h5 className="font-bold text-gray-800 mb-4 text-xs tracking-wider uppercase border-b pb-2">
              {isKh ? '📈 ប្រភពចំណូលលម្អិត' : '📈 Revenue Streams breakdown'}
            </h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <span className="text-[10px] uppercase font-bold text-blue-800 block">🏨 Rooms Income</span>
                <span className="text-lg font-extrabold text-blue-900 block mt-1">${bookingRevenue.toFixed(2)}</span>
              </div>
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                <span className="text-[10px] uppercase font-bold text-amber-800 block">🍽️ Restaurant</span>
                <span className="text-lg font-extrabold text-amber-900 block mt-1">${restaurantRevenue.toFixed(2)}</span>
              </div>
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                <span className="text-[10px] uppercase font-bold text-purple-800 block">💼 Billed Staff</span>
                <span className="text-lg font-extrabold text-purple-900 block mt-1">${payrollCollected.toFixed(2)}</span>
              </div>
              <div className="bg-violet-50 p-4 rounded-xl border border-violet-100">
                <span className="text-[10px] uppercase font-bold text-violet-800 block">🧾 Invoice RT</span>
                <span className="text-lg font-extrabold text-violet-900 block mt-1">${invoiceRTRevenue.toFixed(2)}</span>
              </div>
            </div>
            <div className="mt-4 bg-green-50 p-5 rounded-2xl border border-green-100 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-extrabold text-green-800 block">💰 Total Registered Income (ចំណូលសរុប)</span>
                <span className="text-2xl font-black text-green-700 block mt-1">${totalRevenue.toFixed(2)}</span>
              </div>
              <DollarSign className="text-green-600 animate-bounce" size={32} />
            </div>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h5 className="font-bold text-gray-800 mb-4 text-xs tracking-wider uppercase border-b pb-2 text-rose-800 border-rose-100">
              {isKh ? '📉 ចំណាយប្រតិបត្តិការសរុប' : '📉 Operating Expenses breakdown'}
            </h5>
            <div className="space-y-3 font-medium text-xs">
              <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-100">
                <span className="text-gray-500">👔 Staff Payroll Total:</span>
                <span className="font-bold text-gray-800">${spendPayroll.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-100">
                <span className="text-gray-500">📦 Assets & Stock Cost:</span>
                <span className="font-bold text-gray-800">${spendStock.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-100">
                <span className="text-gray-500">🛒 Food & Beverage POs:</span>
                <span className="font-bold text-gray-800">${spendPInv.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-100">
                <span className="text-gray-500">🧹 Housekeeping Supplies:</span>
                <span className="font-bold text-gray-800">${spendPHK.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-3 text-sm text-red-700 font-bold">
                <span className="uppercase tracking-wider">💸 Total Running Spending:</span>
                <span className="font-black text-red-600">${totalSpending.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Recharts Graphical Visuals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <h5 className="font-bold text-gray-800 mb-4 text-xs tracking-wider uppercase border-b pb-2">
            {isKh ? '📊 រចនាសម្ព័ន្ធធៀបប្រាក់ចំណូល និងចំណាយ' : '📊 Gross Income vs Outgoings Statement'}
          </h5>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={grossData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {grossData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <h5 className="font-bold text-gray-800 mb-4 text-xs tracking-wider uppercase border-b pb-2">
            {isKh ? '📊 ប្រភពលំហូរចំណូលដាច់ដោយឡែក' : '📊 Revenue Streams Contribution'}
          </h5>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={streamsData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 700 }} />
                <YAxis tickFormatter={(val) => `$${val}`} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                <Bar dataKey="value" name="Amount" radius={[8, 8, 0, 0]}>
                  {streamsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3.5: Daily Restaurant Revenue Line Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-3 mb-4 gap-2">
          <div>
            <h5 className="font-bold text-gray-800 text-xs tracking-wider uppercase">
              {isKh ? '📈 និន្នាការចំណូលភោជនីយដ្ឋានប្រចាំថ្ងៃ' : '📈 Daily Restaurant Revenue Trends'}
            </h5>
            <p className="text-[10px] text-gray-400 mt-0.5">
              {isKh ? 'ការវិភាគនិងតាមដានលំហូរប្រាក់ចំនូលពីការលក់ម្ហូបអាហារតាមថ្ងៃនីមួយៗ' : 'Analytical tracking of daily food & beverage sales and POS invoices'}
            </p>
          </div>
          <div className="bg-purple-50 text-purple-700 text-[10px] px-2.5 py-1 rounded-lg font-bold border border-purple-200 uppercase tracking-widest flex items-center gap-1.5 shrink-0">
            <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></span>
            <span>{isKh ? 'ទិន្នន័យផ្ទាល់' : 'Live Stream'}</span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyTrends} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis 
                dataKey="formattedDate" 
                tick={{ fontSize: 9, fontWeight: 700, fill: '#64748B' }} 
                stroke="#CBD5E1"
              />
              <YAxis 
                tickFormatter={(val) => `$${val}`} 
                tick={{ fontSize: 9, fontWeight: 600, fill: '#64748B' }}
                stroke="#CBD5E1"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1E293B', 
                  borderRadius: '12px', 
                  color: '#F8FAFC',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: '600',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, isKh ? 'ប្រាក់ចំណូល' : 'Revenue']}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#8B5CF6" 
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, fill: '#FFFFFF', stroke: '#8B5CF6' }}
                activeDot={{ r: 6, strokeWidth: 0, fill: '#7C3AED' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 4: Timeframe Financial Statements Projection */}
      <div>
        <h4 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-4">
          {isKh ? '📅 របាយការណ៍ព្យាករបណ្ដោះអាសន្នតាមពេលកំណត់' : '📅 Timeframe Projections & Statements'}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full flex items-center justify-center pr-3 pb-3 text-blue-500 opacity-20">
              <CalendarDays size={32} />
            </div>
            <h5 className="font-bold text-purple-900 border-b border-gray-100 pb-2 mb-3 tracking-wider text-xs uppercase">
              {isKh ? 'របាយការណ៍ប្រចាំសប្តាហ៍' : 'Weekly Statement'}
            </h5>
            <div className="space-y-2 text-xs font-semibold">
              <div className="flex justify-between">
                <span className="text-gray-500">Weekly Income:</span>
                <span className="text-green-600 font-bold" id="val-w-income">${(totalRevenue * 0.23).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Weekly Spending:</span>
                <span className="text-red-500 font-bold" id="val-w-spending">${(totalSpending * 0.21).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-bl-full flex items-center justify-center pr-3 pb-3 text-green-500 opacity-20">
              <TrendingUp size={32} />
            </div>
            <h5 className="font-bold text-purple-900 border-b border-gray-100 pb-2 mb-3 tracking-wider text-xs uppercase">
              {isKh ? 'របាយការណ៍ប្រចាំខែ' : 'Monthly Statement'}
            </h5>
            <div className="space-y-2 text-xs font-semibold">
              <div className="flex justify-between">
                <span className="text-gray-500 font-bold">Monthly Income:</span>
                <span className="text-green-600 font-bold">${totalRevenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-bold">Monthly Spending:</span>
                <span className="text-red-500 font-bold">${totalSpending.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-50 rounded-bl-full flex items-center justify-center pr-3 pb-3 text-yellow-600 opacity-20">
              <Compass size={32} />
            </div>
            <h5 className="font-bold text-purple-900 border-b border-gray-100 pb-2 mb-3 tracking-wider text-xs uppercase">
              {isKh ? 'របាយការណ៍ប្រចាំឆ្នាំ' : 'Yearly statement'}
            </h5>
            <div className="space-y-2 text-xs font-semibold">
              <div className="flex justify-between">
                <span className="text-gray-500">Yearly Income Projection:</span>
                <span className="text-green-600 font-bold">${(totalRevenue * 12).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Yearly Spending:</span>
                <span className="text-red-500 font-bold">${(totalSpending * 12).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 5: Activity logs */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4 border-b pb-3">
          <ListCollapse size={18} className="text-purple-700" />
          <h4 className="font-extrabold text-[#2d3748] tracking-wider uppercase text-xs" id="t-sys-logs">
            {isKh ? 'កំណត់ហេតុប្រតិបត្តិការប្រព័ន្ធ' : 'System Transaction Logs'}
          </h4>
        </div>
        <div className="h-44 overflow-y-auto space-y-2.5 font-mono text-[11px] text-gray-600 pr-2">
          {activityLogs.length === 0 ? (
            <p className="text-center text-gray-400 py-6 italic">No action logged yet.</p>
          ) : (
            activityLogs.map((log, index) => (
              <div
                key={index}
                className="py-1.5 px-3 border-l-2 border-purple-400 bg-purple-50/50 rounded-r-md transition-all duration-200 hover:bg-purple-50 tracking-wide font-medium"
              >
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
