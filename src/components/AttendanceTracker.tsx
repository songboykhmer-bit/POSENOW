import React, { useState } from 'react';
import { Employee, Attendance } from '../types';
import { UserCheck, LogOut, Trash2, CalendarDays, Filter } from 'lucide-react';

interface AttendanceTrackerProps {
  employees: Employee[];
  attendance: Attendance[];
  onAttendanceChange: (updated: Attendance[]) => void;
  onActivityLogged: (msg: string) => void;
  lang: 'en' | 'kh';
}

export default function AttendanceTracker({
  employees,
  attendance,
  onAttendanceChange,
  onActivityLogged,
  lang,
}: AttendanceTrackerProps) {
  const isKh = lang === 'kh';

  const [activeEmpId, setActiveEmpId] = useState('');
  const [timeIn, setTimeIn] = useState('08:00');
  const [timeOut, setTimeOut] = useState('17:00');
  const [filterMonth, setFilterMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });

  React.useEffect(() => {
    if (employees.length > 0 && !activeEmpId) {
      setActiveEmpId(employees[0].id);
    }
  }, [employees, activeEmpId]);

  const handleClockIn = () => {
    const emp = employees.find((e) => e.id === activeEmpId);
    if (!emp) return;

    const todayStr = new Date().toLocaleDateString();

    // Check if employee already clocked in today
    if (attendance.some((a) => a.id === activeEmpId && a.date === todayStr)) {
      alert(isKh ? 'បុគ្គលិកនេះបានចុះវត្តមានថ្ងៃនេះរួចហើយ!' : 'Employee has already clocked in today!');
      return;
    }

    const newLabel: Attendance = {
      id: emp.id,
      name: emp.name,
      date: todayStr,
      checkIn: timeIn,
      checkOut: '--:--',
      status: 'Present',
    };

    const updated = [newLabel, ...attendance];
    onAttendanceChange(updated);
    onActivityLogged(`Inward status logged for: ${emp.name} (${emp.id}) at ${timeIn}`);
  };

  const handleClockOut = () => {
    const todayStr = new Date().toLocaleDateString();
    
    // Find active clock-in session for today
    const targetIdx = attendance.findIndex((a) => a.id === activeEmpId && a.date === todayStr);

    if (targetIdx === -1) {
      alert(isKh ? 'រកមិនឃើញប្រវត្តិចូលរបស់បុគ្គលិកនេះនៅថ្ងៃនេះទេ!' : 'No matching active clock-in session found for this employee today.');
      return;
    }

    const updated = [...attendance];
    updated[targetIdx].checkOut = timeOut;

    onAttendanceChange(updated);
    onActivityLogged(`Outward status logged for: ${attendance[targetIdx].name} (${activeEmpId}) at ${timeOut}`);
  };

  const handlePurgeSession = (idx: number) => {
    if (confirm(isKh ? 'ចង់លុបកំណត់ហេតុវត្តមាននេះមែនទេ?' : 'Purge selected roster log entry?')) {
      const updated = [...attendance];
      const removed = updated.splice(idx, 1)[0];
      onAttendanceChange(updated);
      onActivityLogged(`Purged roster log entry for: ${removed.name} on ${removed.date}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-purple-100 pb-3">
        <h2 className="text-2xl font-black text-purple-900 font-sans">
          {isKh ? '📅 ប្រព័ន្ធកត់ត្រាវត្តមានបុគ្គលិក' : '📅 Attendance Tracking Ledger'}
        </h2>
        <p className="text-gray-500 text-xs mt-1 uppercase font-bold tracking-wider">
          {isKh ? 'ចុះវត្តមានចូល វត្តមានចេញ និងគ្រប់គ្រងសន្លឹករបាយការណ៍' : 'Check staff rosters, register daily attendance hours, and review ledgers'}
        </p>
      </div>

      {/* Clock-in actions wrapper */}
      <div className="bg-white p-6 rounded-2xl hover:shadow-md transition-shadow duration-300 border border-purple-50">
        <h4 className="text-xs font-extrabold uppercase text-gray-400 tracking-wider mb-3">Roster Clock Action (ចុះវត្តមានទូទៅ):</h4>
        <div className="flex flex-col md:flex-row items-end gap-4">
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Select Employee Staff:</label>
            <select
              value={activeEmpId}
              onChange={(e) => setActiveEmpId(e.target.value)}
              className="w-full border-2 border-gray-150 rounded-xl p-2.5 outline-none font-bold text-gray-800 focus:border-purple-600 bg-gray-50 focus:bg-white text-sm"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.id} - {emp.name}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full md:w-36">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">In time (ម៉ោងចូល):</label>
            <input
              type="time"
              value={timeIn}
              onChange={(e) => setTimeIn(e.target.value)}
              className="w-full border-2 border-gray-150 rounded-xl p-2.5 outline-none font-bold text-gray-800 focus:border-purple-600 text-center bg-gray-50 focus:bg-white text-sm"
            />
          </div>

          <div className="w-full md:w-36">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Out time (ម៉ោងចេញ):</label>
            <input
              type="time"
              value={timeOut}
              onChange={(e) => setTimeOut(e.target.value)}
              className="w-full border-2 border-gray-150 rounded-xl p-2.5 outline-none font-bold text-gray-800 focus:border-purple-600 text-center bg-gray-50 focus:bg-white text-sm"
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={handleClockIn}
              className="flex-1 md:flex-none px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-md shadow-green-150 transform active:scale-98 transition-all cursor-pointer text-xs"
            >
              <UserCheck size={16} />
              <span>Clock In (ចូល)</span>
            </button>

            <button
              onClick={handleClockOut}
              className="flex-1 md:flex-none px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-md shadow-rose-150 transform active:scale-98 transition-all cursor-pointer text-xs"
            >
              <LogOut size={16} />
              <span>Clock Out (ចេញ)</span>
            </button>
          </div>
        </div>
      </div>

      {/* filter bar */}
      <div className="flex items-center gap-3 bg-purple-50/50 p-4 rounded-xl border border-purple-100 max-w-sm">
        <Filter size={16} className="text-purple-700" />
        <div className="flex items-center gap-2">
          <label className="text-xs font-black uppercase text-purple-900">Roster Month Filter:</label>
          <input
            type="month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="border-2 border-purple-200 focus:border-purple-600 rounded-xl p-1 px-2.5 outline-none font-bold text-gray-800 bg-white text-xs"
          />
        </div>
      </div>

      {/* Roster list ledger index */}
      <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border border-gray-100">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-400 uppercase tracking-widest text-[10px] font-extrabold">
              <th className="p-4">{isKh ? 'លសម្គាល់' : 'Employee ID'}</th>
              <th className="p-4">{isKh ? 'ឈ្មោះពេញ' : 'Staff Name'}</th>
              <th className="p-4">{isKh ? 'កាលបរិច្ឆេទ' : 'Workforce Date'}</th>
              <th className="p-4">{isKh ? 'ម៉ោងចូល' : 'Clock In'}</th>
              <th className="p-4">{isKh ? 'ម៉ោងចេញ' : 'Clock Out'}</th>
              <th className="p-4">{isKh ? 'ស្ថានភាព' : 'Roster Tag'}</th>
              <th className="p-4 text-center">{isKh ? 'សកម្មភាព' : 'Actions Map'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700 font-semibold">
            {attendance.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-400 italic">
                  {isKh ? 'គ្មានទិន្នន័យវត្តមានកត់ត្រាទុកក្នុងខែនេះទេ' : 'No captured attendance hours matched.'}
                </td>
              </tr>
            ) : (
              attendance.map((entry, idx) => (
                <tr key={entry.id + '-' + entry.date} className="hover:bg-purple-50/10 transition-colors">
                  <td className="p-4 text-purple-800 font-extrabold">{entry.id}</td>
                  <td className="p-4 text-gray-900">{entry.name}</td>
                  <td className="p-4 text-xs font-bold text-gray-500">{entry.date}</td>
                  <td className="p-4 text-green-700 font-black">{entry.checkIn}</td>
                  <td className="p-4 text-rose-700 font-black">{entry.checkOut}</td>
                  <td className="p-4">
                    <span className="p-1 px-3 bg-green-50 border border-green-200 text-green-700 rounded-full font-bold text-[10px] uppercase">
                      Present (វត្តមាន)
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handlePurgeSession(idx)}
                      className="p-1 px-2 border border-red-100 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                      title="Clear session logging row"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
