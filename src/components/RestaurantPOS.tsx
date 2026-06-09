import React, { useState } from 'react';
import { InvoiceRT, InvoiceRTRow } from '../types';
import { Receipt, Search, Plus, Trash2, Printer, Calendar, FileText, CheckCircle, Image, FileDown, Download } from 'lucide-react';
import { RESORT_LOGO_B64 } from '../data/seedPhoto';
import { downloadAsImage, downloadAsPDFB2 } from '../utils/exportUtils';

interface RestaurantPOSProps {
  invoicesRT: InvoiceRT[];
  onInvoicesChange: (updated: InvoiceRT[]) => void;
  onActivityLogged: (msg: string) => void;
  lang: 'en' | 'kh';
}

export default function RestaurantPOS({
  invoicesRT,
  onInvoicesChange,
  onActivityLogged,
  lang,
}: RestaurantPOSProps) {
  const isKh = lang === 'kh';

  // Filters
  const [filterDate, setFilterDate] = useState('');

  // Invoice RT state
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [activePrintInvoice, setActivePrintInvoice] = useState<InvoiceRT | null>(null);
  const [invRoomNo, setInvRoomNo] = useState('');
  const [invGuestName, setInvGuestName] = useState('');
  const [invDate, setInvDate] = useState(new Date().toISOString().split('T')[0]);
  const [invRows, setInvRows] = useState<InvoiceRTRow[]>([]);

  const handleOpenInvoiceModal = () => {
    setInvRoomNo('');
    setInvGuestName('');
    setInvDate(new Date().toISOString().split('T')[0]);
    // Start with 1 blank row
    setInvRows([{ desc: '', qty: 1, price: 0, discount: 0 }]);
    setIsInvoiceModalOpen(true);
  };

  const handleAddRow = () => {
    setInvRows([...invRows, { desc: '', qty: 1, price: 0, discount: 0 }]);
  };

  const handleRemoveRow = (idx: number) => {
    const updated = [...invRows];
    updated.splice(idx, 1);
    setInvRows(updated);
  };

  const handleRowChange = (idx: number, field: keyof InvoiceRTRow, val: any) => {
    const updated = [...invRows];
    if (field === 'desc') {
      updated[idx].desc = val;
    } else {
      updated[idx][field] = parseFloat(val) || 0;
    }
    setInvRows(updated);
  };

  // Calculations
  const calculateTotals = (rows: InvoiceRTRow[]) => {
    let subtotal = 0;
    let totalDiscount = 0;
    rows.forEach((r) => {
      subtotal += r.qty * r.price;
      totalDiscount += r.discount;
    });
    const grand = Math.max(0, subtotal - totalDiscount);
    return { subtotal, totalDiscount, grand };
  };

  const { subtotal, totalDiscount, grand } = calculateTotals(invRows);

  const handleSaveInvoice = () => {
    if (!invRoomNo) {
      alert('Please provide a Room number.');
      return;
    }
    const filteredRows = invRows.filter((r) => r.desc.trim() !== '');
    if (filteredRows.length === 0) {
      alert('Invoice must contain at least one descriptive line item.');
      return;
    }

    const { subtotal: s, totalDiscount: d, grand: g } = calculateTotals(filteredRows);

    const payload: InvoiceRT = {
      invNo: 'INV-' + String(Date.now()).slice(-6),
      roomNo: invRoomNo.trim(),
      guestName: invGuestName.trim() || 'Walk-In Guest',
      date: invDate,
      rows: filteredRows,
      subtotal: s,
      totalDiscount: d,
      grand: g,
      savedAt: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updated = [payload, ...invoicesRT];
    onInvoicesChange(updated);
    onActivityLogged(`Billed Room ${payload.roomNo} - Grand Total: $${payload.grand.toFixed(2)}`);
    setIsInvoiceModalOpen(false);
  };

  const handleDeleteInvoice = (idx: number) => {
    const inv = invoicesRT[idx];
    if (confirm(isKh ? `តើអ្នកចង់លុបវិក្កយបត្របន្ទប់ ${inv.roomNo}?` : `Delete saved invoice ${inv.invNo} for Room ${inv.roomNo}?`)) {
      const updated = [...invoicesRT];
      updated.splice(idx, 1);
      onActivityLogged(`Deleted Invoice RT: ${inv.invNo} for Room ${inv.roomNo}`);
      onInvoicesChange(updated);
    }
  };

  const handlePrintDraftInvoice = () => {
    const filteredRows = invRows.filter((r) => r.desc.trim() !== '');
    if (filteredRows.length === 0) {
      alert('Cannot print empty invoice, enter at least one line!');
      return;
    }
    const targetPayload: InvoiceRT = {
      invNo: 'DRAFT-' + String(Date.now()).slice(-4),
      roomNo: invRoomNo || 'N/A',
      guestName: invGuestName || 'Valued Guest',
      date: invDate,
      rows: filteredRows,
      subtotal: subtotal,
      totalDiscount: totalDiscount,
      grand: grand,
      savedAt: new Date().toLocaleDateString(),
    };
    printInvoiceRT(targetPayload);
  };

  const printInvoiceRT = (inv: InvoiceRT) => {
    setActivePrintInvoice(inv);
  };

  const filteredInvoices = invoicesRT.filter((inv) => {
    if (filterDate) return inv.date === filterDate;
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-purple-100 pb-3">
        <div>
          <h2 className="text-2xl font-black text-purple-900 font-sans">
            {isKh ? '🍽️ ប្រភពចំណូលលក់ ភោជនីយដ្ឋាន & POS' : '🍽️ Hospitality Sales Ledger (Restaurant POS)'}
          </h2>
          <p className="text-gray-500 text-xs mt-1 uppercase font-bold tracking-wider">
            {isKh ? 'គ្រប់គ្រងវិក្កយបត្របន្ទប់ស្នាក់នៅ រៀបចំបញ្ជីទូទាត់ចំណីអាហារ' : 'Manage restaurant POS billing and track room spending receipts'}
          </p>
        </div>

        <button
          onClick={handleOpenInvoiceModal}
          className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-md shadow-green-100 transform active:scale-98 transition-all cursor-pointer text-xs"
        >
          <Receipt size={16} />
          <span>{isKh ? '🧾 បង្កើតវិក្កយបត្រថ្មី' : '🧾 Create Invoice RT'}</span>
        </button>
      </div>

      {/* filter date selector */}
      <div className="flex items-center gap-2 bg-gray-50 p-4 border rounded-2xl max-w-sm">
        <Calendar size={16} className="text-purple-700" />
        <span className="text-xs font-black uppercase text-gray-600">{isKh ? 'កាលបរិច្ឆេទលក់លម្អិត:' : 'Verify Invoice Sales Date:'}</span>
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="border-2 border-slate-200 outline-none p-1.5 rounded-xl text-xs font-bold text-gray-800 bg-white"
        />
        {filterDate && (
          <button
            onClick={() => setFilterDate('')}
            className="p-1 px-2 border hover:bg-white bg-gray-150 rounded-lg text-xs font-black cursor-pointer text-gray-500"
          >
            ✕
          </button>
        )}
      </div>

      {/* Saved Invoices RT table registry */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h4 className="text-xs font-extrabold uppercase text-gray-400 tracking-wider">
          {isKh ? 'ច្បាប់ចម្លងវិក្កយបត្រដែលបានរក្សាទុក :' : 'Saved Room Spending Receipts Ledger (Invoices RT)'}
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-400 uppercase tracking-widest text-[10px] font-extrabold">
                <th className="p-4">{isKh ? 'លេខវិក្កយបត្រ' : 'Invoice ID'}</th>
                <th className="p-4">{isKh ? 'លេខបន្ទប់' : 'Room No'}</th>
                <th className="p-4">{isKh ? 'ឈ្មោះភ្ញៀវ' : 'Guest Name'}</th>
                <th className="p-4 text-center">{isKh ? 'កាលបរិច្ឆេទ' : 'Posting Date'}</th>
                <th className="p-4 text-center">{isKh ? 'មុខទំនិញ' : 'Total Items'}</th>
                <th className="p-4 text-right">{isKh ? 'កាត់ប្រាក់' : 'Discounts (-)'}</th>
                <th className="p-4 text-right">{isKh ? 'សរុបរួម' : 'Invoice Total'}</th>
                <th className="p-4">{isKh ? 'ម៉ោងបញ្ជូន' : 'Logged At'}</th>
                <th className="p-4 text-center">{isKh ? 'សកម្មភាព' : 'Actions Map'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700 font-semibold">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-400 italic">
                    {isKh ? 'គ្មានវិក្កយបត្របានកត់ត្រាទុកក្នុងថ្ងៃនេះទេ' : 'No saved invoices listed.'}
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv, idx) => (
                  <tr key={inv.invNo} className="hover:bg-purple-50/15 transition-colors">
                    <td className="p-4 font-bold text-purple-800">{inv.invNo}</td>
                    <td className="p-4 text-sm font-extrabold text-gray-900">Room {inv.roomNo}</td>
                    <td className="p-4 text-xs font-semibold text-gray-600">{inv.guestName}</td>
                    <td className="p-4 text-xs text-center font-bold">{inv.date}</td>
                    <td className="p-4 text-xs text-center font-semibold text-gray-500">{inv.rows.length} Component(s)</td>
                    <td className="p-4 text-right text-xs font-bold text-rose-600">-${inv.totalDiscount.toFixed(2)}</td>
                    <td className="p-4 text-right font-black text-green-700 text-sm">${inv.grand.toFixed(2)}</td>
                    <td className="p-4 text-[10px] text-gray-400 font-bold uppercase">{inv.savedAt}</td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => printInvoiceRT(inv)}
                          className="px-2 py-1 bg-purple-50 hover:bg-purple-100 border border-purple-100 text-purple-800 hover:text-purple-900 text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1"
                        >
                          <Printer size={12} />
                          <span>Print</span>
                        </button>
                        <button
                          onClick={() => handleDeleteInvoice(invoicesRT.indexOf(inv))}
                          className="p-1 px-1.5 border border-red-50 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive billing invoice creator Modal popup */}
      {isInvoiceModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="bg-purple-950 p-5 text-white flex justify-between items-center">
              <h3 className="text-base font-black font-sans uppercase">🧾 Create New Invoice RT</h3>
              <button
                onClick={() => setIsInvoiceModalOpen(false)}
                className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-1 px-2.5 rounded-lg text-sm transition-all"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6 space-y-5">
              {/* Header configs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Room No. (លេខបន្ទប់)</label>
                  <input
                    type="text"
                    value={invRoomNo}
                    onChange={(e) => setInvRoomNo(e.target.value)}
                    required
                    placeholder="e.g. 101, 205A"
                    className="w-full border-2 border-gray-200 focus:border-purple-600 rounded-xl p-2 outline-none bg-gray-50 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Guest Name (ឈ្មោះភ្ញៀវ)</label>
                  <input
                    type="text"
                    value={invGuestName}
                    onChange={(e) => setInvGuestName(e.target.value)}
                    placeholder="e.g. SOK SAN"
                    className="w-full border-2 border-gray-200 focus:border-purple-600 rounded-xl p-2 outline-none bg-gray-50 font-bold text-purple-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Invoice Date (កាលបរិច្ឆេទ)</label>
                  <input
                    type="date"
                    value={invDate}
                    onChange={(e) => setInvDate(e.target.value)}
                    required
                    className="w-full border-2 border-gray-200 focus:border-purple-600 rounded-xl p-2 outline-none bg-gray-50 font-bold"
                  />
                </div>
              </div>

              {/* Rows items table inputs */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-black text-gray-400 uppercase tracking-widest">
                  <h4>Component components list (លម្អិតមុខម្ហូប/ការទូទាត់):</h4>
                  <button
                    type="button"
                    onClick={handleAddRow}
                    className="px-2.5 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg font-extrabold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>+ Item Row</span>
                  </button>
                </div>

                <div className="border border-gray-150 rounded-xl overflow-hidden">
                  <table className="w-full border-collapse text-xs text-left">
                    <thead>
                      <tr className="bg-purple-900 text-white font-bold">
                        <th className="p-3 w-10 text-center">#</th>
                        <th className="p-3">Component / Item Description</th>
                        <th className="p-3 w-20 text-center">Qty</th>
                        <th className="p-3 w-24 text-center">Price ($)</th>
                        <th className="p-3 w-24 text-center">Discount ($)</th>
                        <th className="p-3 w-28 text-right">Subtotal ($)</th>
                        <th className="p-3 w-10 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
                      {invRows.map((row, idx) => {
                        const rowTotal = row.qty * row.price - row.discount;
                        return (
                          <tr key={idx} className="hover:bg-purple-50/10">
                            <td className="p-3 text-center">{idx + 1}</td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={row.desc}
                                onChange={(e) => handleRowChange(idx, 'desc', e.target.value)}
                                placeholder="Pantry orders, SPA, Vehicles..."
                                className="w-full border border-gray-200 p-2 rounded-lg outline-none focus:border-purple-600 bg-white"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                min="1"
                                value={row.qty}
                                onChange={(e) => handleRowChange(idx, 'qty', e.target.value)}
                                className="w-full border border-gray-200 p-2 text-center rounded-lg outline-none font-bold"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={row.price}
                                onChange={(e) => handleRowChange(idx, 'price', e.target.value)}
                                className="w-full border border-gray-200 p-2 text-center rounded-lg outline-none font-bold text-green-700"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={row.discount}
                                onChange={(e) => handleRowChange(idx, 'discount', e.target.value)}
                                className="w-full border border-red-200 p-2 text-center rounded-lg outline-none font-bold text-red-600"
                              />
                            </td>
                            <td className="p-3 text-right font-black text-green-700">
                              ${Math.max(0, rowNetValueRecalculator(row)).toFixed(2)}
                            </td>
                            <td className="p-2 text-center">
                              {invRows.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveRow(idx)}
                                  className="p-1 px-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white"
                                >
                                  ✕
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals Summary */}
              <div className="flex justify-end pt-4 border-t">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 min-w-[280px] space-y-3 font-semibold text-xs text-gray-700">
                  <div className="flex justify-between">
                    <span>Base Subtotal:</span>
                    <span className="font-bold">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Total Discount:</span>
                    <span className="font-bold">-${totalDiscount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-black text-purple-900 border-t pt-2 border-purple-200">
                    <span>💳 GRAND TOTAL:</span>
                    <span className="text-base text-green-700 font-extrabold">${grand.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 bg-slate-50 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsInvoiceModalOpen(false)}
                className="px-5 py-2.5 bg-gray-150 hover:bg-gray-250 font-bold text-gray-700 rounded-xl transition-all cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePrintDraftInvoice}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md cursor-pointer text-xs flex items-center gap-1"
              >
                <Printer size={14} />
                <span>Print Draft</span>
              </button>
              <button
                type="button"
                onClick={handleSaveInvoice}
                className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl shadow-md cursor-pointer text-xs"
              >
                💾 Save Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GORGEOUS PRINT PREVIEW MODAL */}
      {activePrintInvoice && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn no-print">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden max-h-[92vh] flex flex-col border border-slate-200">
            {/* Header with Title and Control Buttons */}
            <div className="bg-purple-900 px-5 py-3 text-white flex justify-between items-center relative gap-2">
              <div className="flex items-center gap-2 z-10">
                <Printer size={14} className="text-purple-200" />
                <h3 className="text-[10px] font-black uppercase tracking-widest font-sans hidden xs:block">
                  {isKh ? 'មើលប្លង់បោះពុម្ភ' : 'Print Preview'}
                </h3>
              </div>

              {/* Middle Tool Bar: Centered Resort Logo and Resort Name */}
              <div className="absolute inset-x-0 mx-auto flex items-center justify-center gap-2.5 max-w-[55%] pointer-events-none select-none z-0">
                <div className="w-6 h-6 bg-white rounded-full p-0.5 flex items-center justify-center border border-yellow-500 shrink-0 shadow-sm">
                  <img src={RESORT_LOGO_B64} alt="LOGO" className="w-full h-full object-contain" />
                </div>
                <span className="text-[10px] font-black tracking-widest text-yellow-400 truncate uppercase font-sans">
                  PHE SAMOUT
                </span>
              </div>

              <button
                onClick={() => setActivePrintInvoice(null)}
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1 px-3 rounded-lg text-xs transition-colors cursor-pointer font-bold z-10"
              >
                ✕ {isKh ? 'បិទ' : 'Close'}
              </button>
            </div>

            {/* Inner scroll wrapper containing the simulated physical receipt slip */}
            <div className="overflow-y-auto flex-1 p-4 bg-slate-100 flex justify-center">
              {/* This is the element that gets printed. It's styled like a classical thermal receipt. */}
              <div
                id="print-receipt-section"
                className="bg-white text-black p-4 w-[80mm] max-w-full text-xs font-mono border border-gray-300 print:border-none print:shadow-none print:p-0 print:w-full tracking-tight"
                style={{ fontFamily: '"Courier New", Courier, monospace, "Hanuman", sans-serif', color: '#000000' }}
              >
                <div className="text-center space-y-1 mb-3">
                  {/* Resort Logo */}
                  <div className="flex justify-center mb-1">
                    <img src={RESORT_LOGO_B64} alt="LOGO" className="w-12 h-12 object-contain" style={{ filter: 'grayscale(100%) contrast(200%)' }} />
                  </div>
                  <h2 className="text-xs font-black tracking-tight leading-tight">{isKh ? 'រមណីយដ្ឋាន ភី សាមុត ប៊ិច រីសត' : 'PHE SAMOUT BEACH RESORT'}</h2>
                  <p className="text-[9px] text-gray-700 leading-none">
                    {isKh ? 'ខេត្តកែប ព្រះរាជាណាចក្រកម្ពុជា' : 'Kep Province, Kingdom of Cambodia'}
                    <br />
                    Tel: +855 (0) 78 888 999
                  </p>
                  <div className="border-t border-dashed border-black my-1.5"></div>
                  <h3 className="text-[11px] font-bold uppercase tracking-wider">{isKh ? 'វិក្កយបត្រកត់ចូលបន្ទប់' : 'F&B ROOM CHARGE SLIP'}</h3>
                  <p className="text-[9px] font-bold">{activePrintInvoice.invNo}</p>
                </div>

                {/* Meta details */}
                <div className="space-y-0.5 mb-2 text-[9px] leading-snug">
                  <div className="flex justify-between">
                    <span>{isKh ? 'លេខបន្ទប់:' : 'Room No:'}</span>
                    <span className="font-extrabold text-black">Room {activePrintInvoice.roomNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{isKh ? 'ឈ្មោះភ្ញៀវ:' : 'Guest Name:'}</span>
                    <span className="font-bold underline">{activePrintInvoice.guestName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{isKh ? 'កាលបរិច្ឆេទ:' : 'Bill Date:'}</span>
                    <span>{activePrintInvoice.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{isKh ? 'ម៉ោងបញ្ជូន:' : 'Logged At:'}</span>
                    <span>{activePrintInvoice.savedAt}</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-black my-1.5"></div>

                {/* Items list */}
                <table className="w-full text-[9px] my-2 leading-tight border-collapse">
                  <thead>
                    <tr className="border-b border-dashed border-black text-left font-bold">
                      <th className="pb-0.5 text-left">{isKh ? 'មុខទំនិញ' : 'Item'}</th>
                      <th className="pb-0.5 text-center w-6">{isKh ? 'ចន' : 'Qty'}</th>
                      <th className="pb-0.5 text-right w-10">{isKh ? 'តម្លៃ' : 'Price'}</th>
                      <th className="pb-0.5 text-right w-10">{isKh ? 'បញ្ចុះ' : 'Disc'}</th>
                      <th className="pb-0.5 text-right w-12">{isKh ? 'សរុប' : 'Total'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activePrintInvoice.rows.map((r, idx) => {
                      const rowNet = r.qty * r.price - r.discount;
                      return (
                        <tr key={idx} className="align-top border-b border-dashed border-gray-100">
                          <td className="py-0.5 text-left font-bold max-w-[120px] break-words text-[8px] leading-tight text-black">
                            {r.desc}
                          </td>
                          <td className="py-0.5 text-center font-bold">{r.qty}</td>
                          <td className="py-0.5 text-right">${r.price.toFixed(2)}</td>
                          <td className="py-0.5 text-right">-{r.discount > 0 ? `$${r.discount.toFixed(2)}` : '0'}</td>
                          <td className="py-0.5 text-right font-bold text-black">${rowNet.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div className="border-t border-dashed border-black my-1.5"></div>

                {/* Subtotal, discounts and final Grand Total sections */}
                <div className="space-y-0.5 text-[9px] leading-snug">
                  <div className="flex justify-between">
                    <span>{isKh ? 'សរុបបឋម:' : 'Subtotal:'}</span>
                    <span>${activePrintInvoice.subtotal.toFixed(2)}</span>
                  </div>
                  {activePrintInvoice.totalDiscount > 0 && (
                    <div className="flex justify-between">
                      <span>{isKh ? 'ការបញ្ចុះតម្លៃ:' : 'Discounts:'}</span>
                      <span>-${activePrintInvoice.totalDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-double border-black my-0.5"></div>
                  <div className="flex justify-between text-xs font-black uppercase">
                    <span>{isKh ? 'សរុបត្រូវទូទាត់:' : 'TOTAL TO PAY:'}</span>
                    <span className="font-extrabold text-black">${activePrintInvoice.grand.toFixed(2)}</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-black my-3"></div>

                {/* Bottom Signature section for standard POS hotel charge logic */}
                <div className="grid grid-cols-2 gap-3 text-[8px] text-center my-4 font-sans">
                  <div>
                    <div className="h-8"></div>
                    <div className="border-t border-black pt-0.5 text-black">
                      {isKh ? 'ហត្ថលេខាភ្ញៀវ' : 'Guest Signature'}
                    </div>
                  </div>
                  <div>
                    <div className="h-8"></div>
                    <div className="border-t border-black pt-0.5 text-black">
                      {isKh ? 'បេឡាករ / Cashier' : 'Cashier Signature'}
                    </div>
                  </div>
                </div>

                {/* Greeting footer banner */}
                <div className="text-center text-[8px] text-black pt-2 border-t border-dashed border-black italic leading-tight">
                  {isKh ? '❤️ សូមអរគុណសម្រាប់ការស្នាក់នៅ! សូមធ្វើដំណើរដោយសុវត្ថិភាព!' : '❤️ Thanks for staying! Have a safe journey!'}
                </div>
              </div>
            </div>

            {/* Action Bottom Tray in Modal */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col gap-3 no-print">
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-black uppercase text-purple-900 flex items-center gap-1 font-sans">
                  <Download size={12} />
                  {isKh ? 'ជម្រើសទាញយក និង បោះពុម្ភ' : 'Download & Print Choices'}
                </span>
                <span className="text-[9px] font-bold text-gray-500 font-mono">B2 Portrait Setup</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => downloadAsPDFB2('print-receipt-section', `Invoice_${activePrintInvoice.invNo}`)}
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-all w-full truncate border-none shadow-sm hover:shadow-red-200"
                >
                  <FileDown size={13} />
                  <span>{isKh ? 'រក្សាទុកជា PDF (B2)' : 'Save PDF B2'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => downloadAsImage('print-receipt-section', `Invoice_${activePrintInvoice.invNo}`, 'jpeg')}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-all w-full truncate border-none shadow-sm hover:shadow-blue-200"
                >
                  <Image size={13} />
                  <span>{isKh ? 'រក្សាទុកជា JPEG' : 'Save JPEG'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => downloadAsImage('print-receipt-section', `Invoice_${activePrintInvoice.invNo}`, 'png')}
                  className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-[10px] rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-all w-full truncate border-none shadow-sm hover:shadow-teal-200"
                >
                  <Image size={13} />
                  <span>{isKh ? 'រក្សាទុកជា PNG' : 'Save PNG'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-[10px] rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-all w-full truncate border-none shadow-sm hover:shadow-purple-200"
                >
                  <Printer size={13} />
                  <span>{isKh ? 'បោះពុម្ភផ្ទាំង B2' : 'Print B2 Canvas'}</span>
                </button>
              </div>
              <div className="flex justify-end mt-1">
                <button
                  type="button"
                  onClick={() => setActivePrintInvoice(null)}
                  className="px-4 py-1.5 font-bold text-[11px] text-gray-500 hover:text-gray-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer w-24 text-center font-sans"
                >
                  {isKh ? 'បិទ' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Embedded print hide styles */}
      <style>{`
        @media print {
          /* Hide absolutely everything on the viewport first */
          body * {
            visibility: hidden !important;
          }
          /* Ensure our specific ticket wrapper and all its parts of text are targeted for visibility */
          #print-receipt-section, #print-receipt-section * {
            visibility: visible !important;
          }
          /* Pin exactly to the absolute upper-left Corner of paper printable zone */
          #print-receipt-section {
            position: absolute !important;
            left: 0px !important;
            top: 0px !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0px !important;
            padding: 0px !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            color: black !important;
          }
          /* Strip page elements like header footers on print dialogs if supported */
          @page {
            margin: 0.4cm !important;
          }
          /* Ensure explicit hide of custom items marked no-print */
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

// Simple logic helper
function rowNetValueRecalculator(row: InvoiceRTRow): number {
  return Math.max(0, row.qty * row.price - row.discount);
}
