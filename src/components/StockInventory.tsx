import React, { useState } from 'react';
import { Inventory } from '../types';
import { Search, Plus, Filter, Info, Trash2, Edit3, ClipboardList, PenTool } from 'lucide-react';
import { RESORT_LOGO_B64 } from '../data/seedPhoto';

interface StockInventoryProps {
  inventory: Inventory[];
  onInventoryChange: (updated: Inventory[]) => void;
  onActivityLogged: (msg: string) => void;
  lang: 'en' | 'kh';
}

export default function StockInventory({
  inventory,
  onInventoryChange,
  onActivityLogged,
  lang,
}: StockInventoryProps) {
  const isKh = lang === 'kh';

  // Filters
  const [filterTag, setFilterTag] = useState<'all' | 'new' | 'old' | 'low'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  // Form inputs
  const [formName, setFormName] = useState('');
  const [formUnit, setFormUnit] = useState('Kilogram');
  const [formQtyNum, setFormQtyNum] = useState('');
  const [formQtyIn, setFormQtyIn] = useState('');
  const [formQtyOut, setFormQtyOut] = useState('');
  const [formDateIn, setFormDateIn] = useState('');
  const [formDatePurchase, setFormDatePurchase] = useState('');
  const [formCost, setFormCost] = useState('');
  const [formAlertThreshold, setFormAlertThreshold] = useState('');
  const [formAgeTag, setFormAgeTag] = useState<'new' | 'old'>('new');

  const openAddModal = () => {
    setEditIndex(null);
    setFormName('');
    setFormUnit('Kilogram');
    setFormQtyNum('1');
    setFormQtyIn('0');
    setFormQtyOut('');
    setFormDateIn(new Date().toISOString().split('T')[0]);
    setFormDatePurchase(new Date().toISOString().split('T')[0]);
    setFormCost('');
    setFormAlertThreshold('5');
    setFormAgeTag('new');
    setIsModalOpen(true);
  };

  const openEditModal = (idx: number) => {
    const item = inventory[idx];
    setEditIndex(idx);
    setFormName(item.name);
    setFormUnit(item.unit);
    setFormQtyNum(String(item.qtyNum));
    setFormQtyIn(String(item.qtyIn));
    setFormQtyOut(item.qtyOut);
    setFormDateIn(item.dateIn);
    setFormDatePurchase(item.datePurchase);
    setFormCost(String(item.cost));
    setFormAlertThreshold(String(item.alertThreshold));
    setFormAgeTag(item.ageTag || 'new');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName) {
      alert('Please fill out the Item Name.');
      return;
    }

    const payload: Inventory = {
      name: formName.trim(),
      unit: formUnit,
      qtyNum: parseFloat(formQtyNum) || 0,
      qtyIn: parseFloat(formQtyIn) || 0,
      qtyOut: formQtyOut.trim(),
      dateIn: formDateIn,
      datePurchase: formDatePurchase,
      cost: parseFloat(formCost) || 0,
      alertThreshold: parseInt(formAlertThreshold) || 0,
      ageTag: formAgeTag,
    };

    const updated = [...inventory];
    if (editIndex === null) {
      updated.push(payload);
      onActivityLogged(`Logged new stock asset: ${payload.name}`);
    } else {
      updated[editIndex] = payload;
      onActivityLogged(`Updated stock detail records: ${payload.name}`);
    }

    onInventoryChange(updated);
    setIsModalOpen(false);
  };

  const handleDelete = (idx: number) => {
    const item = inventory[idx];
    if (confirm(isKh ? `លុបសារពើភ័ណ្ឌ ${item.name} ចេញពីស្តុក?` : `Expunge stock listing profile for ${item.name}?`)) {
      const updated = [...inventory];
      updated.splice(idx, 1);
      onActivityLogged(`Purged inventory record: ${item.name}`);
      onInventoryChange(updated);
    }
  };

  const showPrintWorksheetPDF = () => {
    let rows = '';
    inventory.forEach((item, i) => {
      const isLow = item.qtyNum <= item.alertThreshold;
      const ageTagHtml = item.ageTag === 'old'
        ? `<span style="background:#FEEBC8; color:#7B341E; padding:3px 8px; border-radius:12px; font-weight:bold; font-size:10px;">OLD</span>`
        : `<span style="background:#C6F6D5; color:#22543D; padding:3px 8px; border-radius:12px; font-weight:bold; font-size:10px;">NEW</span>`;

      rows += `
        <tr style="background:${isLow ? '#FFF5F5' : (i % 2 === 0 ? 'white' : '#F7FAFC')};">
          <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; text-align:center; font-weight:bold; color:#6B46C1;">${i + 1}</td>
          <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; font-weight:700;">${item.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; text-align:center; font-weight:700;">${item.qtyNum} ${item.unit}</td>
          <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; text-align:right; font-weight:700; color:#38A169;">$${item.qtyIn.toFixed(2)}</td>
          <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; text-align:right;">$${item.cost.toFixed(2)}</td>
          <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; font-size:9.5px; color:#4A5568;">${item.qtyOut || '-'}</td>
          <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; text-align:center;">${ageTagHtml}</td>
          <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; text-align:center; font-weight:bold; color:${isLow ? '#C53030' : '#2F855A'};">${isLow ? '⚠️ LOW STOCK' : '✅ STABLE'}</td>
        </tr>
      `;
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>PHE SAMOUT Beach Resort - Stock Worksheet</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&family=Hanuman:wght@400;700&display=swap');
          body { font-family: 'Poppins', 'Hanuman', sans-serif; background: #fff; padding: 20px; color: #2D3748; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 4px solid #6B46C1; padding-bottom: 12px; }
          .logo { display: flex; align-items: center; gap:12px; }
          .logo img { width:70px; height:70px; object-fit: contain; }
          .title { font-size: 18px; font-weight: 800; color: #6B46C1; text-transform: uppercase; }
          .subtitle { font-size: 10px; color: #718096; text-transform: uppercase; }
          .ribbon { height: 4px; background: gold; margin-top:2px; }
          table { width: 100%; border-collapse: collapse; margin-top: 30px; font-size:11px; }
          th { background: #6B46C1; color: white; padding: 12px; border: 1px solid #6B46C1; font-weight:700; text-transform:uppercase; }
          td { border: 1px solid #E2E8F0; }
          .print-btn { background:#6B46C1; color:white; border:none; padding:8px 18px; border-radius:8px; cursor:pointer; font-weight:700; font-size:11px; margin-top:10px; }
          @media print { .print-btn { display:none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">
            <img src="${RESORT_LOGO_B64}" alt="logo">
            <div>
              <div class="title">PHE SAMOUT BEACH RESORT</div>
              <div class="subtitle">Complete Stock &amp; Assets Worksheet (សន្លឹកបញ្ជីសារពើភ័ណ្ឌរួម)</div>
              <button class="print-btn" onclick="window.print()">🖨️ Print Stock Sheet</button>
            </div>
          </div>
          <div style="text-align:right; font-size:10px; color:#718096;">
            <div>Inventory Items: <strong>${inventory.length} Records</strong></div>
            <div>Date Printed: ${new Date().toLocaleDateString()}</div>
          </div>
        </div>
        <div class="ribbon"></div>

        <table>
          <thead>
            <tr>
              <th style="width:30px;">#</th>
              <th>Item / Product Name</th>
              <th>Available Qty</th>
              <th style="text-align:right;">Asset Valuation ($)</th>
              <th style="text-align:right;">Unit Cost</th>
              <th>Remarks / Note</th>
              <th style="text-align:center; width:60px;">Tag</th>
              <th style="text-align:center;">Safety status</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const printWin = window.open('', '_blank', 'width=1100,height=800');
    if (printWin) {
      printWin.document.write(htmlContent);
      printWin.document.close();
      printWin.focus();
    } else {
      alert('Allow browser pop-ups to open inventory worksheet.');
    }
  };

  // Filter application
  const todayStr = new Date().toISOString().split('T')[0];
  
  const filteredInventory = inventory.filter((item) => {
    // Category filter
    if (filterTag === 'new' && item.dateIn !== todayStr) return false;
    if (filterTag === 'old' && item.dateIn >= todayStr) return false;
    if (filterTag === 'low' && item.qtyNum > item.alertThreshold) return false;

    // Search query matches name
    if (searchQuery) {
      return item.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-purple-100 pb-3">
        <div>
          <h2 className="text-2xl font-black text-purple-900 font-sans">
            {isKh ? '📦 សារពើភ័ណ្ឌស្តុក និងទ្រព្យសម្បត្តិ' : '📦 Resort Asset & Stock Inventory'}
          </h2>
          <p className="text-gray-500 text-xs mt-1 uppercase font-bold tracking-wider">
            {isKh ? 'គ្រប់គ្រងគ្រឿងផ្គត់ផ្គង់ សម្ភារៈបន្ទប់ និងគ្រឿងផ្សំផ្ទះបាយរីសត' : 'Manage hotel room amenities, pantry ingredients and assets.'}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={showPrintWorksheetPDF}
            className="px-4 py-2 border-2 border-purple-300 hover:border-purple-700 text-purple-700 hover:text-white hover:bg-purple-700 rounded-xl font-bold transition-all text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <ClipboardList size={16} />
            <span>{isKh ? 'បោះពុម្ពបញ្ជីស្តុក' : 'Print A4 Report'}</span>
          </button>

          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-purple-100 transform active:scale-98 transition-all cursor-pointer text-xs"
          >
            <Plus size={16} />
            <span>{isKh ? '+ បន្ថែមទំនិញថ្មី' : '+ Log New Asset'}</span>
          </button>
        </div>
      </div>

      {/* Advanced search bars and category filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full max-w-sm">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isKh ? 'ស្វែងរកទំនិញតាមឈ្មោះ...' : 'Search stock item by name...'}
            className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl outline-none focus:border-purple-600 bg-white"
          />
        </div>

        {/* Filter Tab pills selection */}
        <div className="flex gap-2 bg-gray-100 p-1.5 rounded-xl border border-gray-200 w-full md:w-auto overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setFilterTag('all')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${filterTag === 'all' ? 'bg-purple-700 text-white shadow-sm' : 'text-gray-600 hover:text-purple-600'}`}
          >
            {isKh ? 'ទាំងអស់' : 'All Stocks'}
          </button>
          <button
            onClick={() => setFilterTag('new')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${filterTag === 'new' ? 'bg-green-600 text-white shadow-sm' : 'text-gray-600 hover:text-green-600'}`}
          >
            {isKh ? 'ទើបចូលថ្មី' : 'Added Today (New)'}
          </button>
          <button
            onClick={() => setFilterTag('old')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${filterTag === 'old' ? 'bg-amber-600 text-white shadow-sm' : 'text-gray-600 hover:text-amber-600'}`}
          >
            {isKh ? 'សល់យូរ' : 'Old Stock'}
          </button>
          <button
            onClick={() => setFilterTag('low')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${filterTag === 'low' ? 'bg-red-600 text-white shadow-sm' : 'text-gray-600 hover:text-red-600'}`}
          >
            ⚠️ {isKh ? 'ស្តុកដែលជិតអស់' : 'Low Stock Alerts'}
          </button>
        </div>
      </div>

      {/* Main Stock spreadsheet listing */}
      <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border border-gray-100">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-400 uppercase tracking-widest text-[10px] font-extrabold">
              <th className="p-4">{isKh ? 'ឈ្មោះទំនិញ' : 'Item Name'}</th>
              <th className="p-4">{isKh ? 'ខ្នាតឯកតា' : 'Unit'}</th>
              <th className="p-4">{isKh ? 'ចំនួនសរុប' : 'Available Qty'}</th>
              <th className="p-4">{isKh ? 'តម្លៃវាយតម្លៃសរុប' : 'Total Value'}</th>
              <th className="p-4">{isKh ? 'ការកត់ចំណាំ' : 'Description / Remark'}</th>
              <th className="p-4">{isKh ? 'តម្លៃទិញចូល (ឯកតា)' : 'Unit Cost'}</th>
              <th className="p-4">{isKh ? 'ស្ថានភាពស្តុក' : 'Age Status'}</th>
              <th className="p-4">{isKh ? 'សុវត្ថិភាពស្តុក' : 'Safety Tag'}</th>
              <th className="p-4 text-center">{isKh ? 'សកម្មភាព' : 'Actions Map'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700 font-semibold">
            {filteredInventory.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-gray-400 italic">
                  {isKh ? 'រកមិនឃើញទំនិញដែលស្វែងរកទេ' : 'No items recorded in selected stock category.'}
                </td>
              </tr>
            ) : (
              filteredInventory.map((item) => {
                const totalAssetValue = item.qtyNum * item.cost;
                const isLow = item.qtyNum <= item.alertThreshold;
                const isItemNew = item.dateIn === todayStr;

                let rowStyle = '';
                if (isLow) rowStyle = 'bg-red-50/20 text-red-900 border-l-4 border-red-500';
                else if (isItemNew) rowStyle = 'bg-green-50/15 border-l-4 border-green-500';

                return (
                  <tr key={item.name} className={`hover:bg-purple-50/10 transition-colors ${rowStyle}`}>
                    <td className="p-4 font-bold text-gray-900">{item.name}</td>
                    <td className="p-4 text-xs text-gray-500 font-bold">{item.unit}</td>
                    <td className="p-4 text-sm font-extrabold text-gray-800">{item.qtyNum}</td>
                    <td className="p-4 font-bold text-green-700">${totalAssetValue.toFixed(2)}</td>
                    <td className="p-4 text-xs max-w-xs truncate text-gray-600 font-medium">{item.qtyOut || '-'}</td>
                    <td className="p-4 font-bold text-gray-950">${item.cost.toFixed(2)}</td>
                    <td className="p-4">
                      {item.ageTag === 'old' ? (
                        <span className="p-1 px-2.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-[9px] font-bold uppercase">
                          OLD Stock
                        </span>
                      ) : (
                        <span className="p-1 px-2.5 bg-green-50 border border-green-200 text-green-800 rounded-lg text-[9px] font-bold uppercase">
                          NEW Stock
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {isLow ? (
                        <span className="p-1 px-2.5 bg-red-50 border border-red-200 text-red-700 rounded-full font-bold text-[10px] uppercase">
                          ⚠️ LOW DUES
                        </span>
                      ) : (
                        <span className="p-1 px-2.5 bg-green-50 border border-green-200 text-green-700 rounded-full font-bold text-[10px] uppercase">
                          ✅ Stable
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(inventory.indexOf(item))}
                          className="p-1 px-1.5 border border-gray-200 bg-gray-50 text-gray-600 hover:text-purple-600 hover:bg-white rounded-lg transition-all cursor-pointer"
                          title="Edit"
                        >
                          <Edit3 size={13} />
                        </button>

                        <button
                          onClick={() => handleDelete(inventory.indexOf(item))}
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

      {/* Stock logger modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-purple-900 p-5 text-white flex justify-between items-center">
              <h3 className="text-base font-black font-sans uppercase">
                {editIndex === null ? '+ Add Stock Asset Profile' : '⚙️ Adjust Stock Asset Profile'}
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
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Item Title Name (ឈ្មោះទំនិញ)</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                    placeholder="e.g. Bed Linen Suite..."
                    className="w-full border-2 border-gray-200 focus:border-purple-600 rounded-xl p-2.5 outline-none bg-gray-50 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Quantity Unit (ឯកតា)</label>
                  <input
                    type="text"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    required
                    placeholder="e.g. Box, set, Case..."
                    className="w-full border-2 border-gray-200 focus:border-purple-600 rounded-xl p-2.5 outline-none bg-gray-50 font-bold text-purple-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">On-hand Stock Quantity (ចំនួន)</label>
                  <input
                    type="number"
                    value={formQtyNum}
                    onChange={(e) => setFormQtyNum(e.target.value)}
                    required
                    placeholder="1"
                    className="w-full border-2 border-gray-200 focus:border-purple-600 rounded-xl p-2.5 outline-none bg-gray-50 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Buying entry value ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formQtyIn}
                    onChange={(e) => setFormQtyIn(e.target.value)}
                    required
                    placeholder="0.00"
                    className="w-full border-2 border-gray-200 focus:border-purple-600 rounded-xl p-2.5 outline-none bg-gray-50 font-bold text-green-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Unit Cost in USD (តម្លៃទិញក្នុងមួយខ្នាត)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formCost}
                    onChange={(e) => setFormCost(e.target.value)}
                    required
                    placeholder="0.00"
                    className="w-full border-2 border-gray-200 focus:border-purple-600 rounded-xl p-2.5 outline-none bg-gray-50 font-bold text-green-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Stock In Date (ថ្ងៃបញ្ចូលស្តុក)</label>
                  <input
                    type="date"
                    value={formDateIn}
                    onChange={(e) => setFormDateIn(e.target.value)}
                    required
                    className="w-full border-2 border-gray-200 focus:border-purple-600 rounded-xl p-2.5 outline-none bg-gray-50 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Purchase Date (ថ្ងៃទិញ)</label>
                  <input
                    type="date"
                    value={formDatePurchase}
                    onChange={(e) => setFormDatePurchase(e.target.value)}
                    required
                    className="w-full border-2 border-gray-200 focus:border-purple-600 rounded-xl p-2.5 outline-none bg-gray-50 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Alert Threshold - Low warning (កម្រិតរោទិ៍ប្រាប់)</label>
                  <input
                    type="number"
                    value={formAlertThreshold}
                    onChange={(e) => setFormAlertThreshold(e.target.value)}
                    required
                    placeholder="5"
                    className="w-full border-2 border-gray-200 focus:border-purple-600 rounded-xl p-2.5 outline-none bg-gray-50 font-bold text-red-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Stock status classifying Tag (រចនាសម្ព័ន្ធទុក)</label>
                  <select
                    value={formAgeTag}
                    onChange={(e) => setFormAgeTag(e.target.value as any)}
                    className="w-full border-2 border-gray-200 focus:border-purple-600 rounded-xl p-2.5 outline-none bg-gray-50 font-bold text-gray-800"
                  >
                    <option value="new">NEW Fresh Stock (ទំនិញថ្មី)</option>
                    <option value="old">OLD Legacy Stock (ទំនិញសល់ពីមុន/ចាស់)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Description / Location Roster (ទីតាំង ឬ កំណត់ចំណាំ)</label>
                  <textarea
                    rows={2}
                    value={formQtyOut}
                    onChange={(e) => setFormQtyOut(e.target.value)}
                    placeholder="Pantry shelves, Suite details, condition tags..."
                    className="w-full border-2 border-gray-200 focus:border-purple-600 rounded-xl p-2.5 outline-none bg-gray-50 text-xs font-medium"
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
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
