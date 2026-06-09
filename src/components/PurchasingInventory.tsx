import React, { useState } from 'react';
import { PurchaseInv } from '../types';
import { Search, Plus, Filter, Trash2, Edit3, ShoppingCart, KeyRound } from 'lucide-react';

interface PurchasingInventoryProps {
  purchaseInv: PurchaseInv[];
  onPurchaseInvChange: (updated: PurchaseInv[]) => void;
  onActivityLogged: (msg: string) => void;
  lang: 'en' | 'kh';
}

export default function PurchasingInventory({
  purchaseInv,
  onPurchaseInvChange,
  onActivityLogged,
  lang,
}: PurchasingInventoryProps) {
  const isKh = lang === 'kh';

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMonth, setFilterMonth] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  // Form inputs
  const [formPoRef, setFormPoRef] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formItem, setFormItem] = useState('');
  const [formCat, setFormCat] = useState('Meat');
  const [formSupplier, setFormSupplier] = useState('');
  const [formQtyUnit, setFormQtyUnit] = useState('Item');
  const [formQty, setFormQty] = useState(1);
  const [formUnitCost, setFormUnitCost] = useState(0);
  const [formDelivery, setFormDelivery] = useState('');
  const [formStatus, setFormStatus] = useState<'Pending' | 'Ordered' | 'Received' | 'Cancelled'>('Pending');
  const [formNotes, setFormNotes] = useState('');

  const openAddModal = () => {
    setEditIndex(null);
    setFormPoRef('PO-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-4));
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormItem('');
    setFormCat('Meat');
    setFormSupplier('');
    setFormQtyUnit('Item');
    setFormQty(1);
    setFormUnitCost(0);
    setFormDelivery('');
    setFormNotes('');
    setFormStatus('Pending');
    setIsModalOpen(true);
  };

  const openEditModal = (idx: number) => {
    const p = purchaseInv[idx];
    setEditIndex(idx);
    setFormPoRef(p.poRef);
    setFormDate(p.date);
    setFormItem(p.item);
    setFormCat(p.cat);
    setFormSupplier(p.supplier);
    setFormQtyUnit(p.qtyUnit || 'Item');
    setFormQty(p.qty);
    setFormUnitCost(p.unitCost);
    setFormDelivery(p.delivery);
    setFormStatus(p.status);
    setFormNotes(p.notes);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formItem) {
      alert('Key item ordered Name is required.');
      return;
    }

    const payload: PurchaseInv = {
      poRef: formPoRef.trim(),
      date: formDate,
      item: formItem.trim(),
      cat: formCat,
      supplier: formSupplier.trim(),
      qtyUnit: formQtyUnit,
      qty: formQty,
      unitCost: formUnitCost,
      delivery: formDelivery,
      status: formStatus,
      notes: formNotes,
    };

    const updated = [...purchaseInv];
    if (editIndex === null) {
      updated.push(payload);
      onActivityLogged(`Logged new F&B purchase order: ${payload.poRef} — ${payload.item}`);
    } else {
      updated[editIndex] = payload;
      onActivityLogged(`Modified purchase order lines for: ${payload.poRef}`);
    }

    onPurchaseInvChange(updated);
    setIsModalOpen(false);
  };

  const handleDelete = (idx: number) => {
    const p = purchaseInv[idx];
    if (confirm(isKh ? `តើអ្នកចង់លុបការបញ្ជាទិញទំនិញ ${p.poRef}?` : `Cancel and delete purchase order ${p.poRef}?`)) {
      const updated = [...purchaseInv];
      updated.splice(idx, 1);
      onActivityLogged(`Cancelled/removed PO inventory element: ${p.poRef}`);
      onPurchaseInvChange(updated);
    }
  };

  // Filter application
  const filteredPOs = purchaseInv.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = p.item.toLowerCase().includes(q) || (p.supplier || '').toLowerCase().includes(q) || (p.poRef || '').toLowerCase().includes(q);
    const matchMonth = !filterMonth || p.date.startsWith(filterMonth);
    return matchSearch && matchMonth;
  });

  // Analytics totals
  const totalValue = filteredPOs.reduce((sum, p) => sum + p.unitCost, 0);
  const pendingCount = filteredPOs.filter((p) => p.status === 'Pending' || p.status === 'Ordered').length;
  const receivedCount = filteredPOs.filter((p) => p.status === 'Received').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-purple-100 pb-3">
        <div>
          <h2 className="text-2xl font-black text-purple-900 font-sans">
            {isKh ? '🛒 ប្រព័ន្ធគ្រប់គ្រងការទិញទំនិញស្តុក F&B' : '🛒 Purchasing Inventory Stock Ledger'}
          </h2>
          <p className="text-gray-500 text-xs mt-1 uppercase font-bold tracking-wider">
            {isKh ? 'តាមដានការបញ្ជាទិញសាច់ បន្លែ និងគ្រឿងផ្សំសម្រាប់ភោជនីយដ្ឋាន' : 'Track and manage kitchen supply shipments, vegetable and meat purchase orders.'}
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-purple-100 transform active:scale-98 transition-all cursor-pointer text-xs"
        >
          <Plus size={16} />
          <span>{isKh ? '+ បង្កើតការទិញ' : '+ Create Purchase Order'}</span>
        </button>
      </div>

      {/* Advanced search and month filter */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full max-w-sm">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isKh ? 'ស្វែងរកការទិញតាមទំនិញ ក្រុមហ៊ុន ឬ លេខPO...' : 'Search PO by item, vendor or reference...'}
            className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl outline-none focus:border-purple-600 bg-white"
          />
        </div>

        <div className="flex items-center gap-2 bg-purple-50/50 p-2.5 rounded-xl border border-purple-100">
          <Filter size={16} className="text-purple-700" />
          <span className="text-xs font-black uppercase text-purple-900">Roster Month Filter:</span>
          <input
            type="month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="border border-purple-200 outline-none p-1 px-2.5 rounded-xl text-xs font-bold text-gray-800 bg-white"
          />
        </div>
      </div>

      {/* Summary KPI boards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-150">
          <span className="block text-[10px] font-bold text-gray-400 uppercase">Total Orders</span>
          <span className="text-xl font-black text-purple-700 mt-0.5 block">{filteredPOs.length}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-150">
          <span className="block text-[10px] font-bold text-gray-400 uppercase">Pending</span>
          <span className="text-xl font-black text-amber-500 mt-0.5 block">{pendingCount}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-150">
          <span className="block text-[10px] font-bold text-gray-400 uppercase">Received</span>
          <span className="text-xl font-black text-green-600 mt-0.5 block">{receivedCount}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-150">
          <span className="block text-[10px] font-bold text-gray-400 uppercase">Cumulative Budget Dues</span>
          <span className="text-xl font-black text-purple-900 mt-0.5 block">${totalValue.toFixed(2)}</span>
        </div>
      </div>

      {/* PO records table spreadsheet list */}
      <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border border-gray-100">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-400 uppercase tracking-widest text-[10px] font-extrabold">
              <th className="p-4">PO Ref #</th>
              <th className="p-4">Date</th>
              <th className="p-4">Item Name</th>
              <th className="p-4">Category</th>
              <th className="p-4">Vendor</th>
              <th className="p-4 text-center">Amount Ordered</th>
              <th className="p-4">Total Cost ($)</th>
              <th className="p-4 text-center">Expected delivery</th>
              <th className="p-4">Roster Status</th>
              <th className="p-4 text-center">Actions MAP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700 font-semibold">
            {filteredPOs.length === 0 ? (
              <tr>
                <td colSpan={10} className="p-8 text-center text-gray-400 italic">
                  {isKh ? 'គ្មានកំណត់ហេតុបញ្ជាទិញក្នុងទម្រង់នេះទេ' : 'No running purchase orders matching logs.'}
                </td>
              </tr>
            ) : (
              filteredPOs.map((p) => {
                const statusColors: Record<string, React.CSSProperties> = {
                  Pending: { backgroundColor: '#FEFCBF', color: '#744210' },
                  Ordered: { backgroundColor: '#BEE3F8', color: '#2A4365' },
                  Received: { backgroundColor: '#C6F6D5', color: '#22543D' },
                  Cancelled: { backgroundColor: '#FED7D7', color: '#742A2A' },
                };
                const sc = statusColors[p.status] || {};

                return (
                  <tr key={p.poRef} className="hover:bg-purple-50/15 transition-colors">
                    <td className="p-4 font-bold text-purple-800">{p.poRef}</td>
                    <td className="p-4 text-xs font-semibold text-gray-500">{p.date}</td>
                    <td className="p-4 text-gray-900 font-bold">{p.item}</td>
                    <td className="p-4"><span className="p-1 px-2.5 bg-purple-50 text-purple-700 rounded-lg text-[9px] font-bold uppercase">{p.cat}</span></td>
                    <td className="p-4 text-xs font-semibold">{p.supplier || '-'}</td>
                    <td className="p-4 text-center text-xs font-extrabold">{p.qty} {p.qtyUnit}</td>
                    <td className="p-4 font-extrabold text-green-700">${p.unitCost.toFixed(2)}</td>
                    <td className="p-4 text-xs text-center font-bold text-gray-500">{p.delivery || '-'}</td>
                    <td className="p-4">
                      <span className="p-1 px-2.5 rounded-full font-bold text-[10px] uppercase tracking-wide" style={{ ...sc }}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(purchaseInv.indexOf(p))}
                          className="p-1 px-1.5 border border-gray-200 bg-gray-50 text-gray-600 hover:text-purple-600 hover:bg-white rounded-lg transition-all cursor-pointer"
                          title="Edit"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(purchaseInv.indexOf(p))}
                          className="p-1 px-1.5 border border-red-100 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* PO entry modal form popup */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-purple-900 p-5 text-white flex justify-between items-center">
              <h3 className="text-base font-black font-sans uppercase">
                {editIndex === null ? '🆕 GUEST ALLOCATION PO ENTRY' : '⚙️ MODIFY PO RESERVATION DETAILS'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-1 px-2.5 rounded-lg text-sm transition-all"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="overflow-y-auto flex-1 p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">PO Reference # (លេខសម្គាល់ PO)</label>
                  <input
                    type="text"
                    value={formPoRef}
                    onChange={(e) => setFormPoRef(e.target.value)}
                    required
                    placeholder="e.g. PO-2026-001"
                    className="w-full border-2 border-gray-200 focus:border-purple-600 rounded-xl p-2.5 outline-none bg-gray-50 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Order Date (ថ្ងៃបញ្ជាទិញ)</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    required
                    className="w-full border-2 border-gray-200 focus:border-purple-600 rounded-xl p-2.5 outline-none bg-gray-50 font-bold"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Ordered Item / Product Name (ឈ្មោះទំនិញបញ្ជាទិញ)</label>
                  <input
                    type="text"
                    value={formItem}
                    onChange={(e) => setFormItem(e.target.value)}
                    required
                    placeholder="e.g. Grass-fed Angus Sirloin Beef..."
                    className="w-full border-2 border-gray-200 focus:border-purple-600 rounded-xl p-2.5 outline-none bg-gray-50 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Category (ប្រភេទគ្រួសារ)</label>
                  <select
                    value={formCat}
                    onChange={(e) => setFormCat(e.target.value)}
                    className="w-full border-2 border-gray-200 focus:border-purple-600 rounded-xl p-2.5 outline-none bg-gray-50 font-bold text-gray-800"
                  >
                    <option value="Meat">🍖 Meat Supplies (សាច់)</option>
                    <option value="Vegetables">🥦 Fresh Vegetables (បន្លែ)</option>
                    <option value="Ingredient">🥫 Culinary Ingredients (គ្រឿងផ្សំ)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Supplier / Vendor (ក្រុមហ៊ុនផ្គត់ផ្គង់)</label>
                  <input
                    type="text"
                    value={formSupplier}
                    onChange={(e) => setFormSupplier(e.target.value)}
                    placeholder="Supplier naming details..."
                    className="w-full border-2 border-gray-200 focus:border-purple-600 rounded-xl p-2.5 outline-none bg-gray-50 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Quantity Unit Category (ប្រភេទខ្នាត)</label>
                  <select
                    value={formQtyUnit}
                    onChange={(e) => setFormQtyUnit(e.target.value)}
                    className="w-full border-2 border-gray-200 focus:border-purple-600 rounded-xl p-2.5 outline-none bg-gray-50 font-bold text-gray-800"
                  >
                    <option value="Item">Item</option>
                    <option value="Kg">Kg</option>
                    <option value="L-Case">Box (Casse)</option>
                    <option value="Pack">Pack</option>
                    <option value="Can">Can</option>
                    <option value="Bottle">Bottle</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Quantity Ordered Amount (ចំនួនបញ្ជាទិញ)</label>
                  <input
                    type="number"
                    min="1"
                    value={formQty}
                    onChange={(e) => setFormQty(parseFloat(e.target.value) || 1)}
                    required
                    className="w-full border-2 border-gray-200 focus:border-purple-600 rounded-xl p-2.5 outline-none bg-gray-50 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Cumulative Budget Cost ($) (តម្លៃចំណាយសរុប)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formUnitCost}
                    onChange={(e) => setFormUnitCost(parseFloat(e.target.value) || 0)}
                    required
                    placeholder="0.00"
                    className="w-full border-2 border-gray-200 focus:border-purple-600 rounded-xl p-2.5 outline-none bg-gray-50 font-bold text-green-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Expected Delivery Date (ថ្ងៃទទួលទំនិញ)</label>
                  <input
                    type="date"
                    value={formDelivery}
                    onChange={(e) => setFormDelivery(e.target.value)}
                    className="w-full border-2 border-gray-200 focus:border-purple-600 rounded-xl p-2.5 outline-none bg-gray-50 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Disbursement Status (ស្ថានភាព)</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full border-2 border-gray-200 focus:border-purple-600 rounded-xl p-2.5 outline-none bg-gray-50 font-bold text-gray-800"
                  >
                    <option value="Pending">⏳ Pending Order (កំពុងស្នើ)</option>
                    <option value="Ordered">🛒 Ordered Active (បោះបញ្ជាទិញរួច)</option>
                    <option value="Received">✅ Received &amp; Stocked (ទទួលបានទំនិញរួច)</option>
                    <option value="Cancelled">❌ Cancelled PO (បដិសេធសន្លឹក)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Order log Remarks (កំណត់ចំណាំបន្ថែម)</label>
                  <textarea
                    rows={2}
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Pantry allocation notes, special requested remarks..."
                    className="w-full border-2 border-gray-200 focus:border-purple-600 rounded-xl p-2.5 outline-none bg-gray-50 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-gray-150 hover:bg-gray-250 font-bold text-gray-700 rounded-xl transition-all cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl shadow-md cursor-pointer text-xs"
                >
                  Save Entry Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
