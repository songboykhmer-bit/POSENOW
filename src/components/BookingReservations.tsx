import React, { useState } from 'react';
import { Booking } from '../types';
import { Search, Plus, Calendar, BadgeAlert, Coins, HelpCircle, CheckCircle, Table, Trash2, Edit3, ClipboardList, Printer, Image, FileDown, Download } from 'lucide-react';
import { RESORT_LOGO_B64 } from '../data/seedPhoto';
import { downloadAsImage, downloadAsPDFB2 } from '../utils/exportUtils';

interface BookingReservationsProps {
  bookings: Booking[];
  onBookingsChange: (updated: Booking[]) => void;
  onActivityLogged: (msg: string) => void;
  lang: 'en' | 'kh';
}

const roomTypeLabels = {
  one_bed: '🛏️ One Bed',
  two_bed: '🛏️🛏️ Two Bed',
  add_mattress: '🛌 Add Mattress',
};

export default function BookingReservations({
  bookings,
  onBookingsChange,
  onActivityLogged,
  lang,
}: BookingReservationsProps) {
  const isKh = lang === 'kh';

  // Filters
  const [filterDate, setFilterDate] = useState('');

  // B2 Portrait Print State
  const [activePrintBooking, setActivePrintBooking] = useState<Booking | null>(null);
  const [selectedBookingForB2, setSelectedBookingForB2] = useState<string>('');
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAvailModalOpen, setIsAvailModalOpen] = useState(false);
  const [availCheckDate, setAvailCheckDate] = useState(new Date().toISOString().split('T')[0]);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  // Form inputs
  const [formGuestName, setFormGuestName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRoomType, setFormRoomType] = useState<'one_bed' | 'two_bed' | 'add_mattress'>('one_bed');
  const [formUnitsOne, setFormUnitsOne] = useState(0);
  const [formUnitsTwo, setFormUnitsTwo] = useState(0);
  const [formUnitsMattress, setFormUnitsMattress] = useState(0);
  const [formPeopleCount, setFormPeopleCount] = useState(2);
  const [formCheckIn, setFormCheckIn] = useState('');
  const [formCheckOut, setFormCheckOut] = useState('');
  const [formDeposit, setFormDeposit] = useState(0);
  const [formBalance, setFormBalance] = useState(0);
  const [formRemark, setFormRemark] = useState('');
  const [formRejectReason, setFormRejectReason] = useState('');
  const [formStatus, setFormStatus] = useState<'Confirmed' | 'Pending' | 'Rejected' | 'Changed'>('Confirmed');

  const [isDuplicate, setIsDuplicate] = useState(false);

  // Auto duplicate validation
  const checkDuplicateBooking = (roomType: string, checkIn: string, checkOut: string, selfIndex: number | null) => {
    if (!roomType || !checkIn || !checkOut) {
      setIsDuplicate(false);
      return;
    }
    const dup = bookings.find(
      (b, i) =>
        b.roomType === roomType &&
        b.checkInDate === checkIn &&
        b.checkOutDate === checkOut &&
        i !== selfIndex
    );
    setIsDuplicate(!!dup);
  };

  const handleDateChange = (field: 'in' | 'out', val: string) => {
    let nextCheckIn = formCheckIn;
    let nextCheckOut = formCheckOut;
    if (field === 'in') {
      setFormCheckIn(val);
      nextCheckIn = val;
    } else {
      setFormCheckOut(val);
      nextCheckOut = val;
    }
    checkDuplicateBooking(formRoomType, nextCheckIn, nextCheckOut, editIndex);
  };

  const handleRoomTypeSelect = (type: 'one_bed' | 'two_bed' | 'add_mattress') => {
    setFormRoomType(type);
    checkDuplicateBooking(type, formCheckIn, formCheckOut, editIndex);
  };

  const openAddModal = () => {
    setEditIndex(null);
    setFormGuestName('');
    setFormPhone('');
    setFormRoomType('one_bed');
    setFormUnitsOne(1);
    setFormUnitsTwo(0);
    setFormUnitsMattress(0);
    setFormPeopleCount(2);
    setFormCheckIn(new Date().toISOString().split('T')[0]);
    // Next day checkout
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setFormCheckOut(tomorrow.toISOString().split('T')[0]);
    setFormDeposit(0);
    setFormBalance(0);
    setFormRemark('');
    setFormRejectReason('');
    setFormStatus('Confirmed');
    setIsDuplicate(false);
    setIsModalOpen(true);
  };

  const openEditModal = (idx: number) => {
    const b = bookings[idx];
    setEditIndex(idx);
    setFormGuestName(b.guestName);
    setFormPhone(b.phone);
    setFormRoomType(b.roomType);
    setFormUnitsOne(b.unitsOne || 0);
    setFormUnitsTwo(b.unitsTwo || 0);
    setFormUnitsMattress(b.unitsMattress || 0);
    setFormPeopleCount(b.peopleCount);
    setFormCheckIn(b.checkInDate);
    setFormCheckOut(b.checkOutDate);
    setFormDeposit(b.deposit);
    setFormBalance(b.balance);
    setFormRemark(b.remark);
    setFormRejectReason(b.rejectReason || '');
    setFormStatus(b.status);
    checkDuplicateBooking(b.roomType, b.checkInDate, b.checkOutDate, idx);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formGuestName || !formCheckIn || !formCheckOut) {
      alert('Key guest names and check-in timeline records are required.');
      return;
    }

    const payload: Booking = {
      guestName: formGuestName.trim(),
      phone: formPhone.trim(),
      roomType: formRoomType,
      units: formUnitsOne + formUnitsTwo + formUnitsMattress,
      unitsOne: formUnitsOne,
      unitsTwo: formUnitsTwo,
      unitsMattress: formUnitsMattress,
      peopleCount: formPeopleCount,
      checkInDate: formCheckIn,
      checkOutDate: formCheckOut,
      price: formDeposit + formBalance,
      deposit: formDeposit,
      balance: formBalance,
      remark: formRemark.trim(),
      rejectReason: formRejectReason.trim() || undefined,
      status: formStatus,
    };

    const updated = [...bookings];
    if (editIndex === null) {
      updated.push(payload);
      onActivityLogged(`Logged new reservation: ${payload.guestName} ($${payload.price.toFixed(2)})`);
    } else {
      updated[editIndex] = payload;
      onActivityLogged(`Modified reservation logs for: ${payload.guestName}`);
    }

    onBookingsChange(updated);
    setIsModalOpen(false);
  };

  const handleDelete = (idx: number) => {
    const b = bookings[idx];
    if (confirm(isKh ? `តើអ្នកចង់លុបការកក់ទីតាំងរបស់ភ្ញៀវ ${b.guestName}?` : `Expunge reservation listing metadata for guest ${b.guestName}?`)) {
      const updated = [...bookings];
      updated.splice(idx, 1);
      onActivityLogged(`Canceled reservation instance for: ${b.guestName}`);
      onBookingsChange(updated);
    }
  };

  // Occupied Rooms analysis checklist output
  const renderVacancyMap = () => {
    const bookedMapping: Record<string, Booking> = {};
    bookings.forEach((b) => {
      if (b.remark && b.status === 'Confirmed') {
        const rooms = b.remark.split(',').map((r) => r.trim());
        rooms.forEach((r) => {
          if (b.checkInDate <= availCheckDate && b.checkOutDate >= availCheckDate) {
            bookedMapping[r] = b;
          }
        });
      }
    });

    const bookedKeys = Object.keys(bookedMapping);

    return (
      <div className="space-y-4">
        <h5 className="font-extrabold text-sm uppercase text-red-500 border-b pb-1.5 flex items-center gap-1">
          <span>🔴 Occupied Rooms on Check-date:</span>
        </h5>
        {bookedKeys.length === 0 ? (
          <p className="text-xs text-gray-400 italic py-2">No rooms logged as booked for this date range.</p>
        ) : (
          <div className="space-y-2">
            {bookedKeys.map((room) => {
              const b = bookedMapping[room];
              return (
                <div key={room} className="flex justify-between items-center bg-red-50/60 border border-red-100 p-3 rounded-lg text-xs font-semibold">
                  <div>
                    <span className="text-sm font-extrabold text-red-700">Room {room}</span>
                    <span className="text-gray-400 font-bold mx-2">|</span>
                    <span className="text-gray-600">Guest: <strong className="text-gray-800">{b.guestName}</strong></span>
                    <span className="text-gray-400 font-bold mx-2">|</span>
                    <span className="text-gray-500">{b.checkInDate} → {b.checkOutDate}</span>
                  </div>
                  <span className="bg-red-500 text-white font-bold px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wide">
                    Booked
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <div className="bg-green-50/60 p-4 border border-green-200 text-green-800 rounded-xl text-xs font-medium space-y-1">
          <p className="font-bold flex items-center gap-1">
            <CheckCircle size={14} />
            <span>✅ Vacancy &amp; Stable Availability Statement</span>
          </p>
          <p className="text-gray-600 leading-relaxed">
            All resort suites or villa allocations NOT listed in the occupied red tags above are completely vacant for booking on {availCheckDate}.
            Please configure room numbers in the &quot;Room No.&quot; descriptor block to maintain an analytical occupancy check ledger database.
          </p>
        </div>
      </div>
    );
  };

  const showA4LandscapeWorkbook = () => {
    let rows = '';
    let totalPrice = 0;
    
    // Select entries covered within filter or complete ledger
    const targets = filterDate
      ? bookings.filter((b) => b.checkInDate <= filterDate && b.checkOutDate >= filterDate)
      : bookings;

    targets.forEach((b, i) => {
      const balance = (b.price || 0) - (b.deposit || 0);
      totalPrice += (b.price || 0);

      const statusMap = {
        Confirmed: 'background:#C6F6D5;color:#22543D;',
        Pending: 'background:#FEFCBF;color:#744210;',
        Rejected: 'background:#FED7D7;color:#742A2A;',
        Changed: 'background:#BEE3F8;color:#2A4365;',
      };

      const breakdown = [
        b.unitsOne > 0 ? `1Bed×${b.unitsOne}` : '',
        b.unitsTwo > 0 ? `2Bed×${b.unitsTwo}` : '',
        b.unitsMattress > 0 ? `Mattress×${b.unitsMattress}` : '',
      ].filter(Boolean).join(', ');

      rows += `
        <tr style="background:${i % 2 === 0 ? 'white' : '#F7FAFC'};">
          <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; text-align:center; font-weight:bold; color:#6B46C1;">${i + 1}</td>
          <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; font-weight:700;">${b.guestName}</td>
          <td style="padding: 10px; border-bottom: 1px solid #E2E8F0;">${b.phone || '-'}</td>
          <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; font-weight:bold;">${roomTypeLabels[b.roomType]} ${breakdown ? `<br><small style="color:#718096;font-size:8px;">(${breakdown})</small>` : ''}</td>
          <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; text-align:center; font-weight:bold;">${b.peopleCount} Pax</td>
          <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; text-align:center;">${b.checkInDate}</td>
          <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; text-align:center;">${b.checkOutDate}</td>
          <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; text-align:right; font-weight:700; color:#38A169;">$${b.price.toFixed(2)}</td>
          <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; text-align:right; color:#3182CE;">$${b.deposit.toFixed(2)}</td>
          <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; text-align:right; color:${balance > 0 ? '#E53E3E' : '#2F855A'}; font-weight:bold;">$${balance.toFixed(2)}</td>
          <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; font-weight:bold;">${b.remark || '-'}</td>
          <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; text-align:center;"><span style="${statusMap[b.status] || ''} padding:3px 10px; border-radius:12px; font-weight:bold; font-size:9px;">${b.status}</span></td>
        </tr>
      `;
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>PHE SAMOUT Beach Resort - Bookings Sheet</title>
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
              <div class="subtitle">Complete Resort Guest Booking details (បញ្ជីគ្រប់គ្រងការកក់បន្ទប់)</div>
              <button class="print-btn" onclick="window.print()">🖨️ Print Booking Worksheet</button>
            </div>
          </div>
          <div style="text-align:right; font-size:10px; color:#718096;">
            <div>Statement Month: <strong>${filterDate ? filterDate : 'Full Ledger'}</strong></div>
            <div>Grand Total price: <strong>$${totalPrice.toFixed(2)}</strong></div>
          </div>
        </div>
        <div class="ribbon"></div>

        <table>
          <thead>
            <tr>
              <th style="width:30px;">#</th>
              <th>Lead Guest Name</th>
              <th>Contact Phone</th>
              <th>Suite Allocation Type</th>
              <th style="text-align:center; width:50px;">Pax</th>
              <th style="text-align:center;">Check-In</th>
              <th style="text-align:center;">Check-Out</th>
              <th style="text-align:right;">Subtotal Dues</th>
              <th style="text-align:right;">Deposit Paid</th>
              <th style="text-align:right;">Balance due</th>
              <th>Room No.</th>
              <th style="text-align:center;">Status</th>
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
      alert('Allow browser pop-ups to open workforce sheet.');
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filterDate) {
      return b.checkInDate <= filterDate && b.checkOutDate >= filterDate;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-purple-100 pb-3">
        <div>
          <h2 className="text-2xl font-black text-purple-900 font-sans">
            {isKh ? '🏨 ប្រព័ន្ធគ្រប់គ្រងការកក់បន្ទប់ស្នាក់នៅ' : '🏨 Guest Booking Check-In Ledger'}
          </h2>
          <p className="text-gray-500 text-xs mt-1 uppercase font-bold tracking-wider">
            {isKh ? 'កម្ចីកន្លែងស្នាក់នៅ កក់ទុកជាមុន គ្រប់គ្រងបន្ទប់ទំនេរ និងព័ត៌មានទូទាត់' : 'Roster check-ins, vacancy logs and advanced booking parameters'}
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setIsAvailModalOpen(true)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <span>🟢 {isKh ? 'ពិនិត្យបន្ទប់ទំនេរ' : 'Room Vacancy Checker'}</span>
          </button>

          <button
            onClick={showA4LandscapeWorkbook}
            className="px-4 py-2 border-2 border-purple-300 hover:border-purple-700 text-purple-700 hover:text-white hover:bg-purple-700 rounded-xl font-bold transition-all text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <ClipboardList size={16} />
            <span>{isKh ? 'សន្លឹកឯកសាររួម' : 'Show Details (A4 Report)'}</span>
          </button>

          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-purple-100 transform active:scale-98 transition-all cursor-pointer text-xs"
          >
            <Plus size={16} />
            <span>{isKh ? '+ បង្កើតការកក់' : '+ Book Reservation'}</span>
          </button>
        </div>
      </div>

      {/* filter date selector */}
      <div className="flex items-center gap-2 bg-gray-50 p-4 border rounded-2xl max-w-sm">
        <Calendar size={16} className="text-purple-700" />
        <span className="text-xs font-black uppercase text-gray-600">{isKh ? 'កាលបរិច្ឆេទសកម្មលម្អិត:' : 'Check Date availability:'}</span>
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

      {/* Main spreadsheets data grid */}
      <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border border-gray-100">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-400 uppercase tracking-widest text-[10px] font-extrabold">
              <th className="p-4">{isKh ? 'ភ្ញៀវដឹកនាំ' : 'Lead Guest'}</th>
              <th className="p-4">{isKh ? 'ទូរស័ព្ទ' : 'Phone'}</th>
              <th className="p-4">{isKh ? 'រចនាសម្ព័ន្ធបន្ទប់' : 'Suite Allocation'}</th>
              <th className="p-4 text-center">{isKh ? 'សមាជិក' : 'Pax'}</th>
              <th className="p-4 text-center">{isKh ? 'ចូលស្នាក់នៅ' : 'Check In'}</th>
              <th className="p-4 text-center">{isKh ? 'ចាកចេញ' : 'Check Out'}</th>
              <th className="p-4">{isKh ? 'ស្ថានភាពទូទាត់' : 'Payment Breakdowns'}</th>
              <th className="p-4">{isKh ? 'បន្ទប់លេខ' : 'Room No.'}</th>
              <th className="p-4">{isKh ? 'ស្ថានភាព' : ' Roster status'}</th>
              <th className="p-4 text-center">{isKh ? 'សកម្មភាព' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700 font-semibold">
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan={10} className="p-8 text-center text-gray-400 italic">
                  {isKh ? 'គ្មានទិន្នន័យកក់បន្ទប់នៅក្នុងកាលបរិច្ឆេទនេះទេ' : 'No guest reservations found for selected timelines.'}
                </td>
              </tr>
            ) : (
              filteredBookings.map((b) => {
                const total = b.price;
                const deposit = b.deposit;
                const balance = b.balance;

                const breakdown = [
                  b.unitsOne > 0 ? `1Bed×${b.unitsOne}` : '',
                  b.unitsTwo > 0 ? `2Bed×${b.unitsTwo}` : '',
                  b.unitsMattress > 0 ? `AddMatt×${b.unitsMattress}` : '',
                ].filter(Boolean).join(', ');

                const statusStyles: Record<string, React.CSSProperties> = {
                  Confirmed: { backgroundColor: '#C6F6D5', color: '#22543D' },
                  Pending: { backgroundColor: '#FEFCBF', color: '#744210' },
                  Rejected: { backgroundColor: '#FED7D7', color: '#742A2A' },
                  Changed: { backgroundColor: '#BEE3F8', color: '#2A4365' },
                };
                const sc = statusStyles[b.status] || statusStyles.Pending;

                return (
                  <tr key={b.guestName + b.checkInDate} className="hover:bg-purple-50/10 transition-colors">
                    <td className="p-4 font-bold text-gray-900">{b.guestName}</td>
                    <td className="p-4 text-xs font-semibold text-gray-500">{b.phone || '-'}</td>
                    <td className="p-4 font-bold">
                      <span className="block">{roomTypeLabels[b.roomType] || b.roomType}</span>
                      {breakdown && <small className="block text-[9px] text-purple-600 font-extrabold uppercase">{breakdown}</small>}
                    </td>
                    <td className="p-4 text-center text-xs font-extrabold text-blue-900">{b.peopleCount} Pax</td>
                    <td className="p-4 text-xs text-gray-600 tracking-wider text-center">{b.checkInDate}</td>
                    <td className="p-4 text-xs text-gray-600 tracking-wider text-center">{b.checkOutDate}</td>
                    <td className="p-4 text-xs space-y-0.5">
                      <div className="flex justify-between gap-3 text-green-700"><span>Price:</span> <strong>${total.toFixed(2)}</strong></div>
                      <div className="flex justify-between gap-3 text-blue-700"><span>Paid:</span> <strong>${deposit.toFixed(2)}</strong></div>
                      <div className="flex justify-between gap-3 text-red-600"><span>Due:</span> <strong>${balance.toFixed(2)}</strong></div>
                    </td>
                    <td className="p-4">
                      <span className="bg-purple-100 text-purple-800 p-1 px-3 rounded-xl border border-purple-200 text-xs font-black">
                        Room {b.remark || '-'}
                      </span>
                      {b.rejectReason && (
                        <div className="text-[10px] text-red-600 font-extrabold mt-1 uppercase">⚠️ Notes: {b.rejectReason}</div>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="p-1 px-2.5 rounded-full font-bold text-[10px] uppercase tracking-wide" style={{ ...statusStyles[b.status] }}>
                        {b.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(bookings.indexOf(b))}
                          className="p-1 px-1.5 border border-gray-200 bg-gray-50 text-gray-600 hover:text-purple-600 hover:bg-white rounded-lg transition-all cursor-pointer"
                          title="Edit"
                        >
                          <Edit3 size={13} />
                        </button>

                        <button
                          onClick={() => handleDelete(bookings.indexOf(b))}
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

      {/* PREMIUM B2 PORTRAIT VOUCHER PRINTER SELECTION PANEL */}
      <div className="bg-gradient-to-br from-purple-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xl border border-purple-700/50 mt-6 no-print">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <h3 className="text-lg font-black tracking-wide text-yellow-400 flex items-center gap-2">
              <Printer size={20} className="text-yellow-300 animate-pulse animate-spin-slow" />
              <span>{isKh ? '🖨️ ម៉ាស៊ីនបោះពុម្ភប្លង់ធំ B2 Portrait - Premium Guest Voucher' : '🖨️ Premium B2 Portrait Guest Voucher Printer'}</span>
            </h3>
            <p className="text-xs text-purple-200 leading-relaxed uppercase tracking-wider font-semibold">
              {isKh ? 'ជ្រើសរើសឈ្មោះភ្ញៀវដើម្បីរចនានិងបោះពុម្ពសន្លឹកបញ្ជិកាធំ B2 ជាមួយរូបភាពផ្ទាំងកង់នាវាពណ៌មាសរបស់រីសត' : 'Select a guest name to generate and print a grand, luxury high-performance B2 Portrait confirmation sheet featuring the gold steering wheel logo.'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <select
              value={selectedBookingForB2}
              onChange={(e) => setSelectedBookingForB2(e.target.value)}
              className="bg-white/10 hover:bg-white/15 text-white font-extrabold text-xs outline-none focus:bg-white focus:text-purple-950 p-3 px-4 rounded-xl border border-white/20 transition-all min-w-[220px]"
            >
              <option value="" className="text-gray-500 font-bold">-- {isKh ? 'ជ្រើសរើសឈ្មោះភ្ញៀវ' : 'Select Lead Guest'} --</option>
              {bookings.map((b, idx) => (
                <option key={idx} value={idx.toString()} className="text-gray-900 font-bold">
                  {b.guestName} {b.remark ? `(Room ${b.remark})` : '(No Room)'}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                if (selectedBookingForB2 === '') {
                  alert(isKh ? 'សូមជ្រើសរើសឈ្មោះភ្ញៀវយាងហោចណាស់ម្នាក់!' : 'Please select a lead guest booking first!');
                  return;
                }
                const targetB = bookings[parseInt(selectedBookingForB2)];
                setActivePrintBooking(targetB);
              }}
              className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 transform active:scale-95 cursor-pointer border border-yellow-300"
            >
              <Printer size={15} />
              <span>{isKh ? 'បោះពុម្ភប្លង់ B2' : 'Generate B2 Poster'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* GRAND B2 PORTRAIT PREMIUM PRINT MODAL */}
      {activePrintBooking && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn no-print">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden max-h-[95vh] flex flex-col border border-slate-200">
            {/* Header with Title and Control Buttons */}
            <div className="bg-purple-900 px-5 py-3 text-white flex justify-between items-center relative gap-2 shrink-0">
              <div className="flex items-center gap-2 z-10">
                <Printer size={14} className="text-purple-200" />
                <h3 className="text-[10px] font-black uppercase tracking-widest font-sans hidden xs:block">
                  B2 Portrait
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
                onClick={() => setActivePrintBooking(null)}
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1 px-3 rounded-lg text-xs transition-colors cursor-pointer font-bold z-10"
              >
                ✕ {isKh ? 'បិទ' : 'Close'}
              </button>
            </div>

            {/* Simulated Canvas Scroll zone */}
            <div className="overflow-y-auto flex-1 p-4 bg-slate-100 flex justify-center">
              {/* B2 Portrait confirmation sheet container */}
              <div
                id="print-b2-section"
                className="bg-white text-slate-900 p-8 w-full border-4 border-double border-yellow-500 shadow-lg tracking-tight flex flex-col print:border-none print:shadow-none print:p-0"
                style={{
                  fontFamily: '"Hanuman", "Poppins", sans-serif',
                  minHeight: '680px',
                  position: 'relative'
                }}
              >
                {/* Vintage Corner Ornaments */}
                <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-yellow-600 pointer-events-none print:hidden"></div>
                <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-yellow-600 pointer-events-none print:hidden"></div>
                <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-yellow-600 pointer-events-none print:hidden"></div>
                <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-yellow-600 pointer-events-none print:hidden"></div>

                {/* Grand centered Steering Wheel Logo */}
                <div className="flex flex-col items-center justify-center text-center space-y-2 mt-4">
                  <img src={RESORT_LOGO_B64} alt="LOGO" className="w-24 h-24 object-contain shadow-sm" />
                  <div className="space-y-0.5">
                    <h1 className="text-sm font-black tracking-widest text-blue-950 uppercase font-sans">PHE SAMOUT BEACH RESORT</h1>
                    <p className="text-[9px] uppercase font-bold tracking-widest text-slate-500">KAMPOT PROVINCE, KINGDOM OF CAMBODIA</p>
                  </div>
                </div>

                <div className="w-full border-t border-dashed border-gray-300 my-4"></div>

                <div className="text-center space-y-1 mb-6">
                  <h2 className="text-xs font-black tracking-widest text-yellow-600 uppercase font-sans">
                    {isKh ? 'សន្លឹកបញ្ជីកាធានាការកក់កន្លែងស្នាក់នៅ' : 'OFFICIAL BOOKING CONFIRMATION STATEMENT'}
                  </h2>
                  <p className="text-[9px] text-gray-500 uppercase font-mono">BOOKING LETTER</p>
                </div>

                {/* Primary Data Grid */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-xs font-semibold flex-1">
                  <div className="border-b border-gray-100 pb-2">
                    <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-bold">{isKh ? 'ឈ្មោះភ្នាក់ងារ / Lead Guest:' : 'Lead Guest Name'}</span>
                    <span className="text-xs font-extrabold text-slate-900">{activePrintBooking.guestName}</span>
                  </div>
                  <div className="border-b border-gray-100 pb-2">
                    <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-bold">{isKh ? 'លេខទូរស័ព្ទ / Contact Phone:' : 'Contact Phone'}</span>
                    <span className="text-xs font-extrabold text-blue-800">{activePrintBooking.phone || '-'}</span>
                  </div>

                  <div className="border-b border-gray-100 pb-2">
                    <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-bold">{isKh ? 'ប្រភេទបន្ទប់ / Suite Category:' : 'Suite Room Type'}</span>
                    <span className="text-[10px] font-extrabold text-slate-900">{roomTypeLabels[activePrintBooking.roomType] || activePrintBooking.roomType}</span>
                  </div>
                  <div className="border-b border-gray-100 pb-2">
                    <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-bold">{isKh ? 'លេខបន្ទប់ / Assigned Key:' : 'Assigned Room No.'}</span>
                    <span className="text-xs font-black text-purple-950">Room {activePrintBooking.remark || 'TBA'}</span>
                  </div>

                  <div className="border-b border-gray-100 pb-2">
                    <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-bold">{isKh ? 'ថ្ងៃចូលស្នាក់នៅ / Check-In Date:' : 'Check-In Timelines'}</span>
                    <span className="text-[10px] font-bold text-slate-700">{activePrintBooking.checkInDate}</span>
                  </div>
                  <div className="border-b border-gray-100 pb-2">
                    <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-bold">{isKh ? 'ថ្ងៃចាកចេញ / Check-Out Date:' : 'Check-Out Timelines'}</span>
                    <span className="text-[10px] font-bold text-slate-700">{activePrintBooking.checkOutDate}</span>
                  </div>

                  <div className="border-b border-gray-100 pb-2">
                    <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-bold">{isKh ? 'សមាជិកគ្រួសារ / Total Pax:' : 'Total Guest Count'}</span>
                    <span className="text-[10px] font-bold text-slate-700">{activePrintBooking.peopleCount} Adults / Children</span>
                  </div>
                  <div className="border-b border-gray-100 pb-2">
                    <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-bold">{isKh ? 'ស្ថានភាព / Roster Status:' : 'Reservation Status'}</span>
                    <span className="inline-block bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">
                      {activePrintBooking.status}
                    </span>
                  </div>
                </div>

                {/* Pricing Table block */}
                <div className="mt-6 bg-slate-50 border border-slate-100 rounded-2xl p-4">
                  <h4 className="text-[9px] uppercase font-black tracking-widest text-slate-500 mb-2 border-b pb-1">
                    {isKh ? 'សេចក្តីលម្អិតអំពីតម្លៃ / Financial Position Details' : 'Financial Position Statement'}
                  </h4>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-500 text-[10px]">{isKh ? 'តម្លៃបន្ទប់សរុប:' : 'Base Room Price:'}</span>
                      <span className="text-[10px]">${activePrintBooking.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-blue-700">
                      <span className="text-[10px]">{isKh ? 'ប្រាក់កក់ដែលបានបង់រួច:' : 'Down-deposit Paid (Cr.):'}</span>
                      <span className="text-[10px]">-${activePrintBooking.deposit.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-dashed border-gray-300 my-1"></div>
                    <div className="flex justify-between font-extrabold text-xs text-red-600">
                      <span>{isKh ? 'ប្រាក់នៅសល់ត្រូវទូទាត់:' : 'Total Balance Remaining due:'}</span>
                      <span>${activePrintBooking.balance.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Circular Compass Watermark/Seal in design background */}
                <div className="flex justify-center items-center my-6 py-2">
                  <div className="w-16 h-16 border-2 border-double border-yellow-600 rounded-full flex flex-col items-center justify-center text-[7px] text-yellow-600 uppercase font-black font-mono leading-none tracking-tighter shadow-sm">
                    <span>SECURITY</span>
                    <span className="text-[9px] font-bold">★ VERIFIED ★</span>
                    <span>PHE SAMOUT BEACH</span>
                  </div>
                </div>

                {/* Dual Signature zones */}
                <div className="grid grid-cols-2 gap-10 text-[9px] text-center mt-auto pt-6 border-t border-gray-150 font-sans">
                  <div>
                    <div className="h-10"></div>
                    <div className="border-t border-slate-400 pt-1 text-slate-800 uppercase font-bold tracking-widest">
                      {isKh ? 'ហត្ថលេខាភ្ញៀវដឹកនាំ' : 'Lead Guest Signature'}
                    </div>
                    <span className="text-[7px] text-gray-400">{activePrintBooking.guestName}</span>
                  </div>
                  <div>
                    <div className="h-10"></div>
                    <div className="border-t border-slate-400 pt-1 text-slate-800 uppercase font-bold tracking-widest">
                      {isKh ? 'តំណាងរមណីយដ្ឋាន' : 'Resort Representative'}
                    </div>
                    <span className="text-[7px] text-gray-400">Authorized Signature Seal</span>
                  </div>
                </div>

                {/* Tail guidelines footer */}
                <div className="text-center text-[8px] text-slate-400 mt-6 pt-2 uppercase font-medium leading-normal tracking-wide">
                  {isKh ? '❤️ សូមអរគុណសម្រាប់ការជ្រើសរើស ផែសមុទ្រ ប៊ិច រីសត! យើងធានាផ្តល់ជូននូវសេវាកម្មដ៏ល្អបំផុត!' : '❤️ Thank you for choosing Phe Samout Beach Resort! We strive to make your journey extraordinary!'}
                </div>
              </div>
            </div>

            {/* Bottom Actions Tray */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col gap-3 no-print shrink-0">
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
                  onClick={() => downloadAsPDFB2('print-b2-section', `Booking_Invoice_${activePrintBooking.guestName.replace(/\s+/g, '_')}`)}
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-all w-full truncate border-none shadow-sm hover:shadow-red-200"
                >
                  <FileDown size={13} />
                  <span>{isKh ? 'រក្សាទុកជា PDF (B2)' : 'Save PDF B2'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => downloadAsImage('print-b2-section', `Booking_Invoice_${activePrintBooking.guestName.replace(/\s+/g, '_')}`, 'jpeg')}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-all w-full truncate border-none shadow-sm hover:shadow-blue-200"
                >
                  <Image size={13} />
                  <span>{isKh ? 'រក្សាទុកជា JPEG' : 'Save JPEG'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => downloadAsImage('print-b2-section', `Booking_Invoice_${activePrintBooking.guestName.replace(/\s+/g, '_')}`, 'png')}
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
                  onClick={() => setActivePrintBooking(null)}
                  className="px-4 py-1.5 font-bold text-[11px] text-gray-500 hover:text-gray-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer w-24 text-center font-sans"
                >
                  {isKh ? 'បិទ' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Embedded print high scale portrait layout styles */}
      <style>{`
        @media print {
          /* Hide absolutely everything on the viewport first */
          body * {
            visibility: hidden !important;
          }
          /* Ensure only our specific ticket or B2 confirmation layout wrapper and all its text contents are targeted for visibility */
          #print-receipt-section, #print-receipt-section *, #print-b2-section, #print-b2-section * {
            visibility: visible !important;
          }
          /* Pin exactly to the absolute upper-left Corner of paper printable zone for standard POS slates */
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
          /* Pin B2 Portrait confirming printout to standard portrait page geometry */
          #print-b2-section {
            position: absolute !important;
            left: 0px !important;
            top: 0px !important;
            width: 100% !important;
            height: 100% !important;
            margin: 0px !important;
            padding: 2cm !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            color: black !important;
          }
          /* Strip page elements like header footers on print dialogs if supported */
          @page {
            margin: 0.2cm !important;
            size: portrait !important;
          }
          /* Ensure explicit hide of custom items marked no-print */
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Room available vacancy map checker modal popup */}
      {isAvailModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[85vh] flex flex-col p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3 border-purple-100">
              <h3 className="font-extrabold font-sans text-purple-900 text-base uppercase">🟢 Checked vacant list allocation check</h3>
              <button
                onClick={() => setIsAvailModalOpen(false)}
                className="text-gray-400 hover:text-purple-600 p-1 px-2.5 rounded-lg text-sm bg-gray-50 hover:bg-gray-100 transition-all font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs uppercase font-extrabold text-gray-500">Pick check date:</span>
              <input
                type="date"
                value={availCheckDate}
                onChange={(e) => setAvailCheckDate(e.target.value)}
                className="border-2 border-gray-200 rounded-xl p-2 font-bold text-gray-800 outline-none focus:border-purple-600 bg-gray-50"
              />
            </div>

            <div className="flex-1 overflow-y-auto">
              {renderVacancyMap()}
            </div>
          </div>
        </div>
      )}

      {/* Main Reservation setup modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="bg-purple-900 p-5 text-white flex justify-between items-center">
              <h3 className="text-sm font-black font-sans uppercase">
                {editIndex === null ? '🏨 NEW GUEST ALLOCATION' : '⚙️ MODIFY GUEST DETAILS'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-1 px-2.5 rounded-lg text-sm transition-all"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="overflow-y-auto flex-1 p-6 space-y-5">
              {/* Duplicate banner */}
              {isDuplicate && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                  <p className="text-xs font-black text-red-700 uppercase">
                    ⚠️ Double Check Alert: Occupant overlaps on selected room type &amp; dates already exist!
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Lead Guest Name (ឈ្មោះភ្ញៀវ)</label>
                  <input
                    type="text"
                    value={formGuestName}
                    onChange={(e) => setFormGuestName(e.target.value)}
                    required
                    placeholder="e.g. SOK SAN"
                    className="w-full border-2 border-gray-200 focus:border-purple-600 rounded-xl p-2.5 outline-none bg-gray-50 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Contact Phone (លេខទូរស័ព្ទ)</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="e.g. +855 96 123 456"
                    className="w-full border-2 border-gray-200 focus:border-purple-600 rounded-xl p-2.5 outline-none bg-gray-50 font-bold text-purple-900"
                  />
                </div>

                {/* Selection Cards */}
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-xs font-black text-purple-900 uppercase">Select Target Room Type (ប្រភេទបន្ទប់):</label>
                  <div className="grid grid-cols-3 gap-3">
                    {Object.entries(roomTypeLabels).map(([key, label]) => {
                      const isActive = formRoomType === key;
                      return (
                        <div
                          key={key}
                          onClick={() => handleRoomTypeSelect(key as any)}
                          className={`p-4 border-2 rounded-xl text-center cursor-pointer transition-all ${isActive ? 'border-purple-700 bg-purple-50/50 text-purple-700' : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-purple-300'}`}
                        >
                          <div className="text-xl mb-1">{key === 'one_bed' ? '🛏️' : key === 'two_bed' ? '🛏️🛏️' : '🛌'}</div>
                          <span className="text-xs font-bold uppercase">{label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Units per Type */}
                <div className="md:col-span-2 grid grid-cols-3 gap-3 p-4 bg-purple-50/30 rounded-2xl border border-purple-50">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">🛏️ One Bed Units</label>
                    <input
                      type="number"
                      min="0"
                      value={formUnitsOne}
                      onChange={(e) => setFormUnitsOne(parseInt(e.target.value) || 0)}
                      className="w-full border-2 border-gray-200 rounded-xl p-2 text-center font-bold text-gray-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">🛏️🛏️ Two Bed Units</label>
                    <input
                      type="number"
                      min="0"
                      value={formUnitsTwo}
                      onChange={(e) => setFormUnitsTwo(parseInt(e.target.value) || 0)}
                      className="w-full border-2 border-gray-200 rounded-xl p-2 text-center font-bold text-gray-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">🛌 Extra Mattress Units</label>
                    <input
                      type="number"
                      min="0"
                      value={formUnitsMattress}
                      onChange={(e) => setFormUnitsMattress(parseInt(e.target.value) || 0)}
                      className="w-full border-2 border-gray-200 rounded-xl p-2 text-center font-bold text-gray-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Check-In Date (ថ្ងៃចូលស្នាក់នៅ)</label>
                  <input
                    type="date"
                    value={formCheckIn}
                    onChange={(e) => handleDateChange('in', e.target.value)}
                    required
                    className="w-full border-2 border-gray-200 focus:border-purple-600 rounded-xl p-2.5 outline-none bg-gray-50 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Check-Out Date (ថ្ងៃចាកចេញ)</label>
                  <input
                    type="date"
                    value={formCheckOut}
                    onChange={(e) => handleDateChange('out', e.target.value)}
                    required
                    className="w-full border-2 border-gray-200 focus:border-purple-600 rounded-xl p-2.5 outline-none bg-gray-50 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Guest Occupants Pax (ចំនួនមនុស្សសរុប)</label>
                  <input
                    type="number"
                    min="1"
                    value={formPeopleCount}
                    onChange={(e) => setFormPeopleCount(parseInt(e.target.value) || 1)}
                    required
                    className="w-full border-2 border-gray-200 focus:border-purple-600 rounded-xl p-2.5 outline-none bg-gray-50 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Deposited Amount ($) (បានកក់ប្រាក់)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formDeposit}
                    onChange={(e) => setFormDeposit(parseFloat(e.target.value) || 0)}
                    required
                    className="w-full border-2 border-gray-200 focus:border-purple-600 rounded-xl p-2.5 outline-none bg-gray-50 font-bold text-blue-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Remaining Balance Due ($) (ប្រាក់នៅខ្វះ)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formBalance}
                    onChange={(e) => setFormBalance(parseFloat(e.target.value) || 0)}
                    required
                    className="w-full border-2 border-gray-200 focus:border-purple-600 rounded-xl p-2.5 outline-none bg-gray-50 font-bold text-red-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Assigned Suite / Room No. (លេខបន្ទប់)</label>
                  <input
                    type="text"
                    value={formRemark}
                    onChange={(e) => setFormRemark(e.target.value)}
                    placeholder="e.g. Room 101, 102"
                    className="w-full border-2 border-gray-200 focus:border-purple-600 rounded-xl p-2.5 outline-none bg-gray-50 font-bold"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Reject / Change requested Notes (មូលហេតុការបដិសេធ)</label>
                  <input
                    type="text"
                    value={formRejectReason}
                    onChange={(e) => setFormRejectReason(e.target.value)}
                    placeholder="List modification remarks or rejection notes here..."
                    className="w-full border-2 border-gray-200 focus:border-purple-600 rounded-xl p-2.5 outline-none bg-gray-50 text-xs font-bold"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Workflow Status (ស្ថានភាពការកក់)</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full border-2 border-gray-200 focus:border-purple-600 rounded-xl p-2.5 outline-none bg-gray-50 font-bold text-gray-800"
                  >
                    <option value="Confirmed">✅ Confirmed (កក់រៀបចំរួចរាល់)</option>
                    <option value="Pending">⏳ Pending Audit (រង់ចាំការវាយតម្លៃ)</option>
                    <option value="Rejected">❌ Rejected (បដិសេធការកក់)</option>
                    <option value="Changed">🔄 Change Requested (ផ្លាស់ប្តូរការកក់)</option>
                  </select>
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
                  Save Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Room available vacancy map checker modal popup */}
      {isAvailModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[85vh] flex flex-col p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3 border-purple-100">
              <h3 className="font-extrabold font-sans text-purple-900 text-base uppercase">🟢 Checked vacant list allocation check</h3>
              <button
                onClick={() => setIsAvailModalOpen(false)}
                className="text-gray-400 hover:text-purple-600 p-1 px-2.5 rounded-lg text-sm bg-gray-50 hover:bg-gray-100 transition-all font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs uppercase font-extrabold text-gray-500">Pick check date:</span>
              <input
                type="date"
                value={availCheckDate}
                onChange={(e) => setAvailCheckDate(e.target.value)}
                className="border-2 border-gray-200 rounded-xl p-2 font-bold text-gray-800 outline-none focus:border-purple-600 bg-gray-50"
              />
            </div>

            <div className="flex-1 overflow-y-auto">
              {renderVacancyMap()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export { roomTypeLabels };
