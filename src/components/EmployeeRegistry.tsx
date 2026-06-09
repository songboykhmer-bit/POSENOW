import React, { useState } from 'react';
import { Employee } from '../types';
import { Search, UserPlus, Phone, Clipboard, Image, Trash2, Edit3, CircleUser, MapPin } from 'lucide-react';
import { RESORT_LOGO_B64 } from '../data/seedPhoto';

interface EmployeeRegistryProps {
  employees: Employee[];
  onEmployeesChange: (updated: Employee[]) => void;
  onActivityLogged: (msg: string) => void;
  lang: 'en' | 'kh';
}

export default function EmployeeRegistry({
  employees,
  onEmployeesChange,
  onActivityLogged,
  lang,
}: EmployeeRegistryProps) {
  const isKh = lang === 'kh';

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  // Form inputs
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formGender, setFormGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [formDob, setFormDob] = useState('');
  const [formPosition, setFormPosition] = useState('');
  const [formJoinDate, setFormJoinDate] = useState('');
  const [formSalary, setFormSalary] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formParentContact, setFormParentContact] = useState('');
  const [formPhoto, setFormPhoto] = useState('');

  // Handle image upload & base64 conversion
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setFormPhoto(uploadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const openAddModal = () => {
    setEditIndex(null);
    setFormId('PB' + String(employees.length + 1).padStart(3, '0'));
    setFormName('');
    setFormGender('Male');
    setFormDob('');
    setFormPosition('');
    setFormJoinDate(new Date().toISOString().split('T')[0]);
    setFormSalary('');
    setFormPhone('');
    setFormParentContact('');
    setFormPhoto('');
    setIsModalOpen(true);
  };

  const openEditModal = (idx: number) => {
    const emp = employees[idx];
    setEditIndex(idx);
    setFormId(emp.id);
    setFormName(emp.name);
    setFormGender(emp.gender);
    setFormDob(emp.dob);
    setFormPosition(emp.position);
    setFormJoinDate(emp.joinDate);
    setFormSalary(String(emp.salary));
    setFormPhone(emp.phone);
    setFormParentContact(emp.parentContact || '');
    setFormPhoto(emp.photo || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formId || !formPosition) {
      alert('Please fill out all key fields.');
      return;
    }

    const payload: Employee = {
      id: formId.trim().toUpperCase(),
      name: formName.trim(),
      position: formPosition.trim(),
      gender: formGender,
      dob: formDob,
      joinDate: formJoinDate,
      salary: parseFloat(formSalary) || 0,
      phone: formPhone.trim(),
      parentContact: formParentContact.trim(),
      photo: formPhoto,
    };

    const updated = [...employees];
    if (editIndex === null) {
      // Check for duplicate ID
      if (employees.some((emp) => emp.id === payload.id)) {
        alert('Employee ID already exists.');
        return;
      }
      updated.push(payload);
      onActivityLogged(`Registered new profile: ${payload.name} (${payload.id})`);
    } else {
      updated[editIndex] = payload;
      onActivityLogged(`Updated profile details for: ${payload.name} (${payload.id})`);
    }

    onEmployeesChange(updated);
    setIsModalOpen(false);
  };

  const handleDelete = (idx: number) => {
    const emp = employees[idx];
    if (confirm(isKh ? `តើអ្នកចង់លុបប្រវត្តិរូបបុគ្គលិក ${emp.name}?` : `Delete employee profile for ${emp.name}?`)) {
      const updated = [...employees];
      updated.splice(idx, 1);
      onActivityLogged(`Deleted employee profile: ${emp.name}`);
      onEmployeesChange(updated);
    }
  };

  const showSingleEmployeePrintout = (emp: Employee) => {
    const dobLabel = emp.dob ? new Date(emp.dob).toLocaleDateString(isKh ? 'km-KH' : 'en-GB') : '-';
    const joinLabel = emp.joinDate ? new Date(emp.joinDate).toLocaleDateString(isKh ? 'km-KH' : 'en-GB') : '-';
    const avatarHtml = emp.photo
      ? `<img src="${emp.photo}" style="width:110px; height:110px; object-fit:cover; border-radius:50%; border:3px solid #6B46C1; box-shadow:0 4px 6px rgba(0,0,0,0.1);" />`
      : `<div style="width:110px; height:110px; border-radius:50%; background:#eedffd; display:flex; align-items:center; justify-content:center; font-size:2.5rem; border:3px solid #6B46C1; color:#6B46C1;">👤</div>`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>PHE SAMOUT Staff - ${emp.name}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&family=Hanuman:wght@400;700&display=swap');
          body { font-family: 'Poppins', 'Hanuman', sans-serif; background: #fff; padding: 20px; color: #2D3748; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 4px solid #6B46C1; padding-bottom: 12px; }
          .logo { display: flex; align-items: center; gap:12px; }
          .logo img { width:70px; height:70px; object-fit: contain; }
          .title { font-size: 18px; font-weight: 800; color: #6B46C1; text-transform: uppercase; }
          .subtitle { font-size: 10px; color: #718096; text-transform: uppercase; }
          .ribbon { height: 4px; background: gold; margin-top:2px; }
          .profile-container { display: flex; gap: 30px; margin-top: 30px; background: #F7FAFC; border: 1.5px solid #E2E8F0; border-radius: 16px; padding: 24px; }
          .profile-photo { flex-shrink: 0; }
          .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; width: 100%; }
          .field { border-bottom: 1.5px solid #E2E8F0; padding-bottom: 6px; }
          .f-label { font-size: 9px; font-weight: 700; uppercase; color: #718096; }
          .f-val { font-size: 14px; font-weight: 700; color: #2D3748; margin-top: 2px; }
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
              <div class="subtitle">Official Staff Information Sheet (ប្រវត្តិរូបបុគ្គលិក)</div>
              <button class="print-btn" onclick="window.print()">🖨️ Print Employee Profile</button>
            </div>
          </div>
          <div style="text-align:right; font-size: 10px; color: #718096;">
            <div>Employee ID: <strong style="color:#6B46C1;">${emp.id}</strong></div>
            <div>Date Printed: ${new Date().toLocaleDateString()}</div>
          </div>
        </div>
        <div class="ribbon"></div>

        <div class="profile-container">
          <div class="profile-photo">
            ${avatarHtml}
          </div>
          <div class="details-grid">
            <div class="field"><div class="f-label">Full Name</div><div class="f-val">${emp.name}</div></div>
            <div class="field"><div class="f-label">Gender</div><div class="f-val">${emp.gender}</div></div>
            <div class="field"><div class="f-label">Date of Birth</div><div class="f-val">${dobLabel}</div></div>
            <div class="field"><div class="f-label">Position / Role</div><div class="f-val text-purple-700">${emp.position}</div></div>
            <div class="field"><div class="f-label">Monthly Base Salary</div><div class="f-val" style="color:#38A169;">$${emp.salary.toFixed(2)}</div></div>
            <div class="field"><div class="f-label">Join Date</div><div class="f-val">${joinLabel}</div></div>
            <div class="field"><div class="f-label">Phone Contact</div><div class="f-val">${emp.phone}</div></div>
            <div class="field"><div class="f-label">Emergency Parental Contact</div><div class="f-val">${emp.parentContact || '-'}</div></div>
          </div>
        </div>
      </body>
      </html>
    `;

    const printWin = window.open('', '_blank', 'width=900,height=600');
    if (printWin) {
      printWin.document.write(htmlContent);
      printWin.document.close();
      printWin.focus();
    } else {
      alert('Allow browser pop-ups to open workforce sheet.');
    }
  };

  const showAllWorkforcePrintout = () => {
    let rows = '';
    employees.forEach((emp, i) => {
      const avatarHtml = emp.photo
        ? `<img src="${emp.photo}" style="width:36px; height:36px; border-radius:50%; object-fit:cover;" />`
        : `<div style="width:36px; height:36px; border-radius:50%; background:#eedffd; display:flex; align-items:center; justify-content:center; text-align:center; font-size:10px; color:#6B46C1; font-weight:bold;">👤</div>`;
      
      rows += `
        <tr style="background:${i % 2 === 0 ? 'white' : '#F7FAFC'};">
          <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; text-align:center;">${emp.id}</td>
          <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; text-align:center;">${avatarHtml}</td>
          <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; font-weight:700;">${emp.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #E2E8F0;">${emp.position}</td>
          <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; text-align:center;">${emp.gender}</td>
          <td style="padding: 10px; border-bottom: 1px solid #E2E8F0;">${emp.phone}</td>
          <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; text-align:right; font-weight:700; color:#38A169;">$${emp.salary.toFixed(2)}</td>
          <td style="padding: 10px; border-bottom: 1px solid #E2E8F0;">${emp.parentContact || '-'}</td>
        </tr>
      `;
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>PHE SAMOUT Beach Resort - Workforce Registry</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&family=Hanuman:wght@400;700&display=swap');
          body { font-family: 'Poppins', 'Hanuman', sans-serif; background: #fff; padding: 20px; color: #2D3748; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 4px solid #6B46C1; padding-bottom: 12px; }
          .logo { display: flex; align-items: center; gap:12px; }
          .logo img { width:70px; height:70px; object-fit: contain; }
          .title { font-size: 18px; font-weight: 800; color: #6B46C1; text-transform: uppercase; }
          .subtitle { font-size: 10px; color: #718096; text-transform: uppercase; }
          .ribbon { height: 4px; background: gold; margin-top:2px; }
          table { width: 100%; border-collapse: collapse; margin-top: 30px; font-size:12px; }
          th { background: #6B46C1; color: white; padding: 12px; border: 1px solid #6B46C1; font-weight:700; }
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
              <div class="subtitle">Complete Resort Workforce Registry (បញ្ជីឈ្មោះបុគ្គលិកទាំងអស់)</div>
              <button class="print-btn" onclick="window.print()">🖨️ Print Registry Worksheet</button>
            </div>
          </div>
          <div style="text-align:right; font-size:10px; color:#718096;">
            <div>Workforce Headcount: <strong>${employees.length} Staff</strong></div>
            <div>Date Printed: ${new Date().toLocaleDateString()}</div>
          </div>
        </div>
        <div class="ribbon"></div>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Avatar</th>
              <th>Full Name</th>
              <th>Position</th>
              <th>Gender</th>
              <th>Phone Contact</th>
              <th style="text-align:right;">Monthly Salary</th>
              <th>Emergency Contact</th>
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

  const filteredEmployees = employees.filter((emp) => {
    const q = searchQuery.toLowerCase();
    return emp.name.toLowerCase().includes(q) || emp.id.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-purple-100 pb-3">
        <div>
          <h2 className="text-2xl font-black text-purple-900 font-sans">
            {isKh ? '📋 ប្រព័ន្ធគ្រប់គ្រងប្រវត្តិរូបបុគ្គលិក' : '📋 Employee Registry Management'}
          </h2>
          <p className="text-gray-500 text-xs mt-1 uppercase font-bold tracking-wider">
            {isKh ? 'គ្រប់គ្រងព័ត៌មានបុគ្គលិក ប្រាក់បៀវត្ស និងទំនាក់ទំនងអាសន្ន' : 'Manage employee profiles, emergency details and base wages'}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={showAllWorkforcePrintout}
            className="px-4 py-2 border-2 border-purple-200 hover:border-purple-600 text-purple-700 hover:text-white hover:bg-purple-600 rounded-xl font-bold transition-all text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Clipboard size={16} />
            <span>{isKh ? 'បោះពុម្ពបញ្ជីឈ្មោះ' : 'Workforce Worksheet'}</span>
          </button>

          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-purple-100 transform active:scale-98 transition-all cursor-pointer text-xs"
          >
            <UserPlus size={16} />
            <span>{isKh ? '+ បន្ថែមបុគ្គលិក' : '+ Register Staff'}</span>
          </button>
        </div>
      </div>

      {/* Advanced search bar */}
      <div className="relative max-w-md">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
          <Search size={18} />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={isKh ? 'ស្វែងរកបុគ្គលិកតាម ឈ្មោះ ឬ លេខសម្គាល់...' : 'Search employees by name or ID...'}
          className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl outline-none focus:border-purple-600 bg-white focus:shadow-md transition-all text-sm font-medium"
        />
      </div>

      {/* Employee Registry Grid/Table view */}
      <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border border-gray-100">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-400 uppercase tracking-widest text-[10px] font-extrabold">
              <th className="p-4 w-16 text-center">{isKh ? 'រូបថត' : 'Photo'}</th>
              <th className="p-4">{isKh ? 'លេខសម្គាល់' : 'ID'}</th>
              <th className="p-4">{isKh ? 'ឈ្មោះពេញ' : 'Name'}</th>
              <th className="p-4">{isKh ? 'ភេទ' : 'Gender'}</th>
              <th className="p-4">{isKh ? 'តួនាទី' : 'Position'}</th>
              <th className="p-4">{isKh ? 'ប្រាក់ខែដើម' : 'Base Salary'}</th>
              <th className="p-4">{isKh ? 'លេខទូរស័ព្ទ' : 'Phone'}</th>
              <th className="p-4">{isKh ? 'ទំនាក់ទំនងបន្ទាន់' : 'Parent Contact'}</th>
              <th className="p-4 text-center">{isKh ? 'សកម្មភាព' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-gray-400 italic">
                  {isKh ? 'រកមិនឃើញបុគ្គលិកដែលស្វែងរកទេ' : 'No employees matching search queries.'}
                </td>
              </tr>
            ) : (
              filteredEmployees.map((emp, idx) => {
                const avatar = emp.photo ? (
                  <img src={emp.photo} alt={emp.name} className="w-10 h-10 object-cover rounded-full border border-purple-200" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-700 font-extrabold text-sm border border-purple-200">
                    👤
                  </div>
                );

                return (
                  <tr key={emp.id} className="hover:bg-purple-50/20 transition-all">
                    <td className="p-4 flex items-center justify-center">{avatar}</td>
                    <td className="p-4 font-extrabold text-purple-800">{emp.id}</td>
                    <td className="p-4 font-bold text-gray-900">{emp.name}</td>
                    <td className="p-4 text-xs font-semibold text-gray-500">{emp.gender}</td>
                    <td className="p-4 text-xs font-bold text-indigo-700">{emp.position}</td>
                    <td className="p-4 font-bold text-green-700">${emp.salary.toFixed(2)}</td>
                    <td className="p-4 text-xs font-semibold text-gray-600">{emp.phone}</td>
                    <td className="p-4 text-xs text-gray-600 font-medium">
                      <span className="block">{emp.parentContact || '-'}</span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => showSingleEmployeePrintout(emp)}
                          className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 text-[10px] font-bold rounded-lg transition-colors border border-purple-100 cursor-pointer flex items-center gap-1"
                        >
                          <Clipboard size={12} />
                          <span>Show Info</span>
                        </button>

                        <button
                          onClick={() => openEditModal(employees.indexOf(emp))}
                          className="p-1 px-1.5 border border-gray-200 bg-gray-50 text-gray-600 hover:text-purple-600 hover:bg-white rounded-lg transition-all cursor-pointer"
                          title="Edit"
                        >
                          <Edit3 size={14} />
                        </button>

                        <button
                          onClick={() => handleDelete(employees.indexOf(emp))}
                          className="p-1 px-1.5 border border-red-100 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 size={14} />
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

      {/* Roster & Sign up Form Modal popup */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-purple-900 p-6 text-white flex justify-between items-center">
              <h3 className="text-lg font-black font-sans uppercase">
                {editIndex === null ? (isKh ? '🆕 បន្ថែមបុគ្គលិកថ្មី' : '🆕 Add Employee Profile') : (isKh ? '⚙️ កែប្រែប្រវត្តិរូបបុគ្គលិក' : '⚙️ Edit Employee Profile')}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-1 px-2.5 rounded-lg text-sm transition-all"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="overflow-y-auto flex-1 p-6 space-y-6">
              {/* Photo uploader area */}
              <div className="text-center">
                <div
                  onClick={() => document.getElementById('file-loader')?.click()}
                  className="w-24 h-24 mx-auto rounded-full border-4 border-dashed border-purple-400 overflow-hidden flex items-center justify-center bg-purple-50 cursor-pointer shadow-md group relative"
                >
                  {formPhoto ? (
                    <img src={formPhoto} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-gray-400 group-hover:text-purple-600 flex flex-col items-center">
                      <Image size={24} />
                      <span className="text-[10px] font-bold mt-1 uppercase">Upload</span>
                    </div>
                  )}
                </div>
                <input id="file-loader" type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                <p className="text-[11px] text-gray-500 font-bold uppercase mt-2">Click inside target to upload avatar</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Employee ID (លេខសម្គាល់)</label>
                  <input
                    type="text"
                    value={formId}
                    onChange={(e) => setFormId(e.target.value)}
                    required
                    disabled={editIndex !== null}
                    placeholder="e.g. PB001"
                    className="w-full border-2 border-gray-200 focus:border-purple-600 rounded-xl p-2.5 outline-none bg-gray-50 font-bold disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Full Name (ឈ្មោះ)</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                    placeholder="e.g. SOK SAN"
                    className="w-full border-2 border-gray-200 focus:border-purple-600 rounded-xl p-2.5 outline-none bg-gray-50 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Gender (ភេទ)</label>
                  <select
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value as any)}
                    className="w-full border-2 border-gray-200 focus:border-purple-600 rounded-xl p-2.5 outline-none bg-gray-50 font-bold"
                  >
                    <option value="Male">Male (ប្រុស)</option>
                    <option value="Female">Female (ស្រី)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Date of Birth (ថ្ងៃខែឆ្នាំកំណើត)</label>
                  <input
                    type="date"
                    value={formDob}
                    onChange={(e) => setFormDob(e.target.value)}
                    required
                    className="w-full border-2 border-gray-200 focus:border-purple-600 rounded-xl p-2.5 outline-none bg-gray-50 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Position Role (តួនាទី)</label>
                  <input
                    type="text"
                    value={formPosition}
                    onChange={(e) => setFormPosition(e.target.value)}
                    required
                    placeholder="e.g. Chef, Receptionist..."
                    className="w-full border-2 border-gray-200 focus:border-purple-600 rounded-xl p-2.5 outline-none bg-gray-50 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Join Date (ថ្ងៃចូលបំពេញការងារ)</label>
                  <input
                    type="date"
                    value={formJoinDate}
                    onChange={(e) => setFormJoinDate(e.target.value)}
                    required
                    className="w-full border-2 border-gray-200 focus:border-purple-600 rounded-xl p-2.5 outline-none bg-gray-50 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Monthly Wage / Salary in USD (ប្រាក់ខែគោល)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formSalary}
                    onChange={(e) => setFormSalary(e.target.value)}
                    required
                    placeholder="e.g. 150.00"
                    className="w-full border-2 border-gray-200 focus:border-purple-600 rounded-xl p-2.5 outline-none bg-gray-50 font-bold text-green-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Phone Contact (លេខទូរស័ព្ទ)</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    required
                    placeholder="e.g. 096 123 456"
                    className="w-full border-2 border-gray-200 focus:border-purple-600 rounded-xl p-2.5 outline-none bg-gray-50 font-bold"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Parental / Emergency Contact (ទំនាក់ទំនងសាច់ញាតិ)</label>
                  <input
                    type="text"
                    value={formParentContact}
                    onChange={(e) => setFormParentContact(e.target.value)}
                    required
                    placeholder="Parents names and Relationships, Phone contacts..."
                    className="w-full border-2 border-gray-200 focus:border-purple-600 rounded-xl p-2.5 outline-none bg-gray-50 font-bold text-purple-950"
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
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
