import React, { useState, useEffect } from 'react';
import { Employee, LoanRecord } from '../types';
import { DollarSign, Printer, Plus, Trash2, Info, Landmark } from 'lucide-react';
import { RESORT_LOGO_B64 } from '../data/seedPhoto';

interface PayrollManagerProps {
  employees: Employee[];
  loanRecords: Record<string, LoanRecord[]>;
  onLoansChange: (records: Record<string, LoanRecord[]>) => void;
  onActivityLogged: (msg: string) => void;
  lang: 'en' | 'kh';
}

export default function PayrollManager({
  employees,
  loanRecords,
  onLoansChange,
  onActivityLogged,
  lang,
}: PayrollManagerProps) {
  const isKh = lang === 'kh';

  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [payPeriod, setPayPeriod] = useState<'mid' | 'final' | 'full'>('full');
  const [payMonth, setPayMonth] = useState('06'); // June default

  // Live adjustments
  const [workingDays, setWorkingDays] = useState(30);
  const [advancePaid, setAdvancePaid] = useState(0);
  const [absentDays, setAbsentDays] = useState(0);
  const [deductionPerAbsent, setDeductionPerAbsent] = useState(15);
  const [allowance, setAllowance] = useState(45);
  const [incentiveNote, setIncentiveNote] = useState('');
  const [leaveType, setLeaveType] = useState<'none' | 'unpaid' | 'sick'>('none');

  useEffect(() => {
    if (employees.length > 0 && !selectedEmpId) {
      setSelectedEmpId(employees[0].id);
    }
  }, [employees, selectedEmpId]);

  const selectedEmp = employees.find((e) => e.id === selectedEmpId);

  // Load borrower records for active employee
  const activeLoans = loanRecords[selectedEmpId] || [];

  const handleAddLoan = () => {
    if (!selectedEmpId) return;
    const newRecord: LoanRecord = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      note: '',
    };
    const updated = {
      ...loanRecords,
      [selectedEmpId]: [...activeLoans, newRecord],
    };
    onLoansChange(updated);
    onActivityLogged(`Logged new draft loan record for: ${selectedEmp?.name}`);
  };

  const handleRemoveLoan = (loanId: number) => {
    const updatedLoans = activeLoans.filter((l) => l.id !== loanId);
    const updated = {
      ...loanRecords,
      [selectedEmpId]: updatedLoans,
    };
    onLoansChange(updated);
    onActivityLogged(`Removed loan record for: ${selectedEmp?.name}`);
  };

  const handleLoanFieldChange = (loanId: number, field: keyof LoanRecord, val: any) => {
    const updatedLoans = activeLoans.map((l) => {
      if (l.id === loanId) {
        return { ...l, [field]: field === 'amount' ? parseFloat(val) || 0 : val };
      }
      return l;
    });
    const updated = {
      ...loanRecords,
      [selectedEmpId]: updatedLoans,
    };
    onLoansChange(updated);
  };

  // Salary calculations
  const calculateSalarySlip = (emp: Employee) => {
    const baseSalary = emp.salary;
    const totalAbsentDeduction = absentDays * deductionPerAbsent;
    let adjustedBase = baseSalary;

    if (leaveType === 'unpaid') {
      adjustedBase = baseSalary * Math.max(0, (workingDays - absentDays - 5) / workingDays);
    }

    const otherIncentiveNum = parseFloat(incentiveNote) || 0;

    // Split based on period
    let periodMultiplier = 1;
    if (payPeriod === 'mid') periodMultiplier = 0.5;
    if (payPeriod === 'final') periodMultiplier = 1; // Handled below in remainder comparison

    const periodAdjustedBase = adjustedBase * (payPeriod === 'mid' ? 0.5 : 1);

    // Calculate loan deduction based on payment cycle date of loan
    let periodLoanDeduction = 0;
    const loans = loanRecords[emp.id] || [];
    loans.forEach((loan) => {
      if (loan.date) {
        const borrowDateObj = new Date(loan.date);
        const day = borrowDateObj.getDate();
        
        if (payPeriod === 'mid' && day >= 1 && day <= 15) {
          periodLoanDeduction += loan.amount;
        } else if (payPeriod === 'final' && day >= 16 && day <= 28) {
          periodLoanDeduction += loan.amount;
        } else if (payPeriod === 'full') {
          periodLoanDeduction += loan.amount;
        }
      }
    });

    let netPay = 0;
    if (payPeriod === 'mid') {
      netPay = advancePaid > 0 ? advancePaid : periodAdjustedBase;
      netPay = Math.max(0, netPay - periodLoanDeduction);
    } else if (payPeriod === 'final') {
      const fullMonthNet = adjustedBase + allowance + otherIncentiveNum - totalAbsentDeduction;
      const alreadyPaidMid = advancePaid > 0 ? advancePaid : adjustedBase * 0.5;
      netPay = Math.max(0, fullMonthNet - alreadyPaidMid - periodLoanDeduction);
    } else {
      netPay = adjustedBase + allowance + otherIncentiveNum - totalAbsentDeduction - periodLoanDeduction;
      netPay = Math.max(0, netPay);
    }

    return {
      baseSalary,
      adjustedBase,
      totalAbsentDeduction,
      allowance,
      otherIncentiveNum,
      periodLoanDeduction,
      netPay,
    };
  };

  const currentResult = selectedEmp ? calculateSalarySlip(selectedEmp) : null;

  const printSingleSlipFrame = () => {
    if (!selectedEmp || !currentResult) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>PHE SAMOUT Pay Slip - ${selectedEmp.name}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&family=Hanuman:wght@400;700&display=swap');
          body { font-family: 'Poppins', 'Hanuman', sans-serif; padding: 30px; background: white; color: #2D3748; }
          .container { max-width: 700px; margin: 0 auto; border: 2.5px double #6B46C1; border-radius: 16px; padding: 30px; }
          .header { text-align: center; border-bottom: 3.5px double #6B46C1; padding-bottom: 12px; margin-bottom: 20px; }
          .resort-title { font-size: 22px; font-weight: 800; color: #6B46C1; letter-spacing: 1px; }
          .tag { text-transform: uppercase; font-size: 10px; color: #718096; font-weight:700; letter-spacing: 0.5px; margin-top:2px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px; border-bottom: 1px solid #E2E8F0; padding-bottom: 15px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { background: #6B46C1; color: white; padding: 10px; font-weight: bold; border: 1px solid #6B46C1; }
          td { border: 1px solid #E2E8F0; padding: 10px; }
          .num-val { text-align: right; font-weight: 700; }
          .net-pay { font-size: 16px; font-weight: 800; color: #6B46C1; background: #FAF5FF; }
          .signatures { display: flex; justify-content: space-between; margin-top: 50px; }
          .sig-box { width: 150px; border-top: 1.5px solid #4A5568; padding-top: 5px; text-align: center; font-size: 10px; color:#4A5568; }
          .print-btn { background:#6B46C1; color:white; border:none; padding:8px 18px; border-radius:8px; cursor:pointer; font-weight:700; font-size:11px; margin-bottom:10px; }
          @media print { .print-btn { display:none; } }
        </style>
      </head>
      <body>
        <div style="text-align:center;">
          <button class="print-btn" onclick="window.print()">🖨️ Print Employee Pay Slip</button>
        </div>
        <div class="container">
          <div class="header">
            <div class="resort-title">PHE SAMOUT BEACH RESORT</div>
            <div class="tag">Official Roster Wage &amp; Salary Slip (ប្រាក់បៀវត្សរ៍បុគ្គលិក)</div>
          </div>

          <div class="info-grid">
            <div>
              <p><strong>Employee ID:</strong> ${selectedEmp.id}</p>
              <p><strong>Full Name:</strong> ${selectedEmp.name}</p>
              <p><strong>Position:</strong> ${selectedEmp.position}</p>
            </div>
            <div style="text-align:right;">
              <p><strong>Statement Month:</strong> ${payMonth}/2026</p>
              <p><strong>Disbursed Date:</strong> ${new Date().toLocaleDateString()}</p>
              <p><strong>Payment Cycle:</strong> ${payPeriod === 'full' ? 'Monthly' : payPeriod === 'mid' ? '16th Semi-monthly' : '29th Final Balance'}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="text-align:left;">Wage Allocation Component</th>
                <th style="text-align:right; width:140px;">Disbursed Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>ប្រាក់ខែគោល (Base Salary)</strong></td>
                <td class="num-val">$${currentResult.baseSalary.toFixed(2)}</td>
              </tr>
              <tr>
                <td><strong>ប្រាក់ខែបង្គ្រប់តាមថ្ងៃធ្វើការ (Adjusted Base)</strong></td>
                <td class="num-val">$${currentResult.adjustedBase.toFixed(2)}</td>
              </tr>
              <tr>
                <td>ប្រាក់ឧបត្ថម្ភការងារ (Allowance Benefit)</td>
                <td class="num-val text-green-700">+$${currentResult.allowance.toFixed(2)}</td>
              </tr>
              <tr>
                <td>ប្រាក់លើកទឹកចិត្តបន្ថែម (Other Incentives - ${incentiveNote || 'N/A'})</td>
                <td class="num-val text-green-700">+$${currentResult.otherIncentiveNum.toFixed(2)}</td>
              </tr>
              <tr style="background:#FFF5F5;">
                <td style="color:#C53030;">ប្រាក់ពិន័យអវត្តមាន (Absent Deduction - ${absentDays} Days)</td>
                <td class="num-val" style="color:#C53030;">-$${currentResult.totalAbsentDeduction.toFixed(2)}</td>
              </tr>
              ${
                currentResult.periodLoanDeduction > 0
                  ? `<tr style="background:#FFF5F5;">
                      <td style="color:#C53030; font-weight:bold;">ប្រាក់កាត់រំលោះកម្ចីបុគ្គលិក (Loan Dues Auto-deducted)</td>
                      <td class="num-val" style="color:#C53030;">-$${currentResult.periodLoanDeduction.toFixed(2)}</td>
                    </tr>`
                  : ''
              }
              <tr class="net-pay">
                <td><strong>ប្រាក់បៀវត្សទទួលបានពិតប្រាកដ (Take Home Pay)</strong></td>
                <td class="num-val" style="color:#6B46C1; font-size:16px;">$${currentResult.netPay.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div class="signatures">
            <div class="sig-box">Recipient Roster Sign</div>
            <div class="sig-box">Accounting &amp; Finance</div>
            <div class="sig-box">General Manager APPROVED</div>
          </div>
        </div>
      </body>
      </html>
    `;

    const printWin = window.open('', '_blank', 'width=900,height=700');
    if (printWin) {
      printWin.document.write(htmlContent);
      printWin.document.close();
      printWin.focus();
    } else {
      alert('Allow browser pop-ups to print payslip.');
    }
  };

  const printAllStaffSlips = () => {
    let slipContainerHTML = '';
    employees.forEach((emp) => {
      const res = calculateSalarySlip(emp);
      
      const dobLabel = emp.dob ? new Date(emp.dob).toLocaleDateString() : '-';
      const avatarHtml = emp.photo
        ? `<img src="${emp.photo}" style="width:48px; height:48px; object-fit:cover; border-radius:50%; border:2px solid #6B46C1;" />`
        : `<div style="width:48px; height:48px; border-radius:50%; background:#eedffd; display:flex; align-items:center; justify-content:center; font-size:1.5rem; border:2px solid #6B46C1; color:#6B46C1;">👤</div>`;

      slipContainerHTML += `
        <div style="border: 1.5px solid #CBD5E0; border-radius: 12px; padding: 20px; background: white; margin-bottom: 25px; page-break-inside: avoid;">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 2px solid #6B46C1; padding-bottom:8px; margin-bottom:12px;">
            <div style="display:flex; align-items:center; gap:10px;">
              ${avatarHtml}
              <div>
                <div style="font-size:14px; font-weight:800; color:#6B46C1;">${emp.name}</div>
                <div style="font-size:10px; color:#718096; font-weight:bold;">${emp.position} (ID: ${emp.id})</div>
              </div>
            </div>
            <div style="text-align:right; font-size:10px; color:#718096;">
              <div>Payroll Month: <strong>${payMonth}/2026</strong></div>
              <div>Cycle: <strong>${payPeriod === 'full' ? 'Monthly' : payPeriod === 'mid' ? '16th Advance' : '29th Final Balance'}</strong></div>
            </div>
          </div>

          <table style="width:100%; border-collapse:collapse; font-size:11px;">
            <thead>
              <tr style="background:#6B46C1; color:white;">
                <th style="padding:6px; text-align:left;">Description</th>
                <th style="padding:6px; text-align:right; width:130px;">Amount ($)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style="padding:5px; border:1px solid #E2E8F0;">Base Roster salary</td><td style="padding:5px; border:1px solid #E2E8F0; text-align:right; font-weight:700;">$${res.baseSalary.toFixed(2)}</td></tr>
              <tr><td style="padding:5px; border:1px solid #E2E8F0;">Adjusted Base wage</td><td style="padding:5px; border:1px solid #E2E8F0; text-align:right;">$${res.adjustedBase.toFixed(2)}</td></tr>
              <tr><td style="padding:5px; border:1px solid #E2E8F0; color:green;">Disbursed Allowance</td><td style="padding:5px; border:1px solid #E2E8F0; text-align:right; color:green; font-weight:700;">+$${res.allowance.toFixed(2)}</td></tr>
              <tr><td style="padding:5px; border:1px solid #E2E8F0; color:green;">Incentive addons</td><td style="padding:5px; border:1px solid #E2E8F0; text-align:right; color:green; font-weight:700;">+$${res.otherIncentiveNum.toFixed(2)}</td></tr>
              <tr style="background:#FFF5F5;"><td style="padding:5px; border:1px solid #E2E8F0; color:#C53030;">Attendance fine dues</td><td style="padding:5px; border:1px solid #E2E8F0; text-align:right; color:#C53030;">-$${res.totalAbsentDeduction.toFixed(2)}</td></tr>
              ${
                res.periodLoanDeduction > 0
                  ? `<tr style="background:#FFF5F5;"><td style="padding:5px; border:1px solid #E2E8F0; color:#C53030; font-weight:bold;">Roster Loan Deducted</td><td style="padding:5px; border:1px solid #E2E8F0; text-align:right; color:#C53030; font-weight:bold;">-$${res.periodLoanDeduction.toFixed(2)}</td></tr>`
                  : ''
              }
              <tr style="background:#FAF5FF; font-weight:700;"><td style="padding:8px; border:1px solid #E2E8F0; color:#6B46C1; font-size:12px;">NET PAY DISBURSED</td><td style="padding:8px; border:1px solid #E2E8F0; text-align:right; color:#6B46C1; font-size:12px;">$${res.netPay.toFixed(2)}</td></tr>
            </tbody>
          </table>

          <div style="display:flex; justify-content:space-between; margin-top:20px;">
            <div style="width:130px; border-top:1px solid #CBD5E0; text-align:center; font-size:8px; padding-top:2px;">Roster Signature</div>
            <div style="width:130px; border-top:1px solid #CBD5E0; text-align:center; font-size:8px; padding-top:2px;">HR Verified</div>
            <div style="width:130px; border-top:1px solid #CBD5E0; text-align:center; font-size:8px; padding-top:2px;">Finance Approved</div>
          </div>
        </div>
      `;
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>PHE SAMOUT complete wage payroll sheets</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&family=Hanuman:wght@400;700&display=swap');
          body { font-family: 'Poppins', 'Hanuman', sans-serif; padding: 20px; background: white; color: #2D3748; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 4px solid #6B46C1; padding-bottom: 12px; margin-bottom: 25px; }
          .logo { display: flex; align-items: center; gap: 12px; }
          .logo img { width: 70px; height: 70px; object-fit: contain; }
          .title { font-size: 18px; font-weight: 800; color: #6B46C1; text-transform: uppercase; }
          .subtitle { font-size: 10px; color: #718096; text-transform: uppercase; }
          .ribbon { height: 4px; background: gold; margin-top:2px; margin-bottom:20px; }
          .print-btn { background:#6B46C1; color:white; border:none; padding:8px 18px; border-radius:8px; cursor:pointer; font-weight:700; font-size:11px; margin-bottom:10px; }
          @media print { .print-btn { display:none; } }
        </style>
      </head>
      <body>
        <div style="text-align:center;">
          <button class="print-btn" onclick="window.print()">🖨️ Print Complete Staff Wage Slips</button>
        </div>
        <div class="header">
          <div class="logo">
            <img src="${RESORT_LOGO_B64}" alt="logo">
            <div>
              <div class="title">PHE SAMOUT BEACH RESORT</div>
              <div class="subtitle">Salary Payslips - Monthly Batch (បញ្ជីទូទាត់ប្រាក់បៀវត្សរ៍រួម)</div>
            </div>
          </div>
          <div style="text-align:right; font-size:10px; color:#718096;">
            <div>Statement Month: <strong>${payMonth}/2026</strong></div>
            <div>Staff Count: <strong>${employees.length} Employees</strong></div>
          </div>
        </div>
        <div class="ribbon"></div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
          ${slipContainerHTML}
        </div>
      </body>
      </html>
    `;

    const printWin = window.open('', '_blank', 'width=1100,height=800');
    if (printWin) {
      printWin.document.write(htmlContent);
      printWin.document.close();
      printWin.focus();
    } else {
      alert('Allow browser pop-ups to view salary sheet print batch.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-purple-100 pb-3">
        <div>
          <h2 className="text-2xl font-black text-purple-900 font-sans">
            {isKh ? '👔 ប្រព័ន្ធទូទាត់ប្រាក់បៀវត្សរ៍លម្អិត' : '👔 Payroll System & Pay Slips Registry'}
          </h2>
          <p className="text-gray-500 text-xs mt-1 uppercase font-bold tracking-wider">
            {isKh ? 'គ្រប់គ្រងការទូទាត់ប្រាក់ប្រចាំខែ ប្រាក់បុរេប្រទាន និងប្រាក់ពិន័យអវត្តមាន' : 'Calculate base salaries, adjustments, absent fines and borrower dues'}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={printAllStaffSlips}
            className="px-4 py-2 border-2 border-purple-300 hover:border-purple-700 text-purple-700 hover:text-white hover:bg-purple-700 rounded-xl font-bold transition-all text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Printer size={16} />
            <span>{isKh ? 'បោះពុម្ពសន្លឹកបើកលុយរួម' : 'Show Slip Bundle'}</span>
          </button>
        </div>
      </div>

      {/* Roster / Wage adjustment inputs */}
      <div className="bg-white p-6 rounded-2xl hover:shadow-md transition-shadow duration-300 border border-purple-50 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-black uppercase text-gray-400 mb-1.5">Select Staff Profile (ជ្រើសរើសបុគ្គលិក):</label>
            <select
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              className="w-full border-2 border-gray-100 rounded-xl p-2.5 outline-none font-bold text-gray-800 bg-gray-50 focus:border-purple-600 focus:bg-white"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.id} - {emp.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-gray-400 mb-1.5">Disbursement Period (វគ្គបើកប្រាក់បៀវត្ស):</label>
            <select
              value={payPeriod}
              onChange={(e) => setPayPeriod(e.target.value as any)}
              className="w-full border-2 border-gray-100 rounded-xl p-2.5 outline-none font-bold text-gray-800 bg-gray-50 focus:border-purple-600 focus:bg-white"
            >
              <option value="full">Full Month Cycle (បើកទាំងស្រុង - 29th)</option>
              <option value="mid">Mid-Month Advance (បើកមុន 50% - 16th)</option>
              <option value="final">Final End-Month Remainder (ទូទាត់បង្គ្រប់ - 29th)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-gray-400 mb-1.5">Roster statement month (ខែទូទាត់):</label>
            <select
              value={payMonth}
              onChange={(e) => setPayMonth(e.target.value)}
              className="w-full border-2 border-gray-100 rounded-xl p-2.5 outline-none font-bold text-teal-800 bg-gray-50 focus:border-purple-600 focus:bg-white"
            >
              <option value="01">January</option>
              <option value="02">February</option>
              <option value="03">March</option>
              <option value="04">April</option>
              <option value="05">May</option>
              <option value="06">June</option>
              <option value="07">July</option>
              <option value="08">August</option>
              <option value="09">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>
          </div>
        </div>

        {/* Live Variable adjustments */}
        <div>
          <h4 className="text-xs font-extrabold uppercase text-gray-400 tracking-wider mb-3">Live Roster Variable adjustments (ទិន្នន័យអវត្តមាន និងប្រាក់បន្ថែម):</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Total Working Days</label>
              <input
                type="number"
                value={workingDays}
                onChange={(e) => setWorkingDays(parseInt(e.target.value) || 30)}
                className="w-full border-2 border-gray-100 rounded-xl p-2 outline-none font-semibold focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Disbursed 16th Advance ($)</label>
              <input
                type="number"
                value={advancePaid}
                onChange={(e) => setAdvancePaid(parseFloat(e.target.value) || 0)}
                placeholder="Disbursed Advance"
                className="w-full border-2 border-gray-100 rounded-xl p-2 outline-none font-semibold focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Absenteeism Days</label>
              <input
                type="number"
                value={absentDays}
                onChange={(e) => setAbsentDays(parseInt(e.target.value) || 0)}
                className="w-full border-2 border-gray-100 rounded-xl p-2 outline-none font-semibold focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Fine per Absent Day ($)</label>
              <input
                type="number"
                value={deductionPerAbsent}
                onChange={(e) => setDeductionPerAbsent(parseFloat(e.target.value) || 0)}
                className="w-full border-2 border-gray-100 rounded-xl p-2 outline-none font-semibold focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Allowance Benefit ($)</label>
              <input
                type="number"
                value={allowance}
                onChange={(e) => setAllowance(parseFloat(e.target.value) || 0)}
                className="w-full border-2 border-gray-100 rounded-xl p-2 outline-none font-semibold focus:border-purple-600 text-green-700"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Additional Incentives (Text / Amount)</label>
              <input
                type="text"
                value={incentiveNote}
                onChange={(e) => setIncentiveNote(e.target.value)}
                placeholder="e.g. 50.00 Holiday Bonus"
                className="w-full border-2 border-gray-100 rounded-xl p-2 outline-none font-semibold focus:border-purple-600 text-green-700"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Authorized Leave type</label>
              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value as any)}
                className="w-full border-2 border-gray-100 rounded-xl p-2 outline-none font-bold text-gray-800 bg-white"
              >
                <option value="none">No Leave Requested</option>
                <option value="unpaid">Unpaid Leave (Suspends base wage)</option>
                <option value="sick">Authorized Medical/Sick Leave</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Loan / Borrow tracking sub-section */}
      {selectedEmp && (
        <div className="border-2 border-rose-100 rounded-2xl overflow-hidden bg-rose-50/10">
          <div className="bg-gradient-to-r from-red-600 to-rose-700 p-4 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <Landmark size={20} />
              <div>
                <h4 className="font-extrabold text-sm tracking-wider uppercase">
                  {isKh ? '💸 គណនេយ្យបន្ទាត់កម្ចីបុគ្គលិក' : '💸 Employee Loan & Borrow Ledger'}
                </h4>
                <p className="text-[10px] text-white/80 font-bold uppercase tracking-wide">
                  {isKh ? 'កត់ត្រាប្រាក់កម្ចីមុនរបស់បុគ្គលិក ដកដោយស្វ័យប្រវត្តក្នុងសន្លឹកបើកប្រាក់' : 'Disburse advance borrow funds and link auto-deductions directly to cycles'}
                </p>
              </div>
            </div>

            <button
              onClick={handleAddLoan}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 border border-white/50 rounded-xl text-xs font-bold text-white transition-all cursor-pointer"
            >
              + {isKh ? 'កត់ត្រាកម្ចីថ្មី' : 'Log Loan Entry'}
            </button>
          </div>

          <div className="p-4 space-y-4">
            {activeLoans.length === 0 ? (
              <p className="text-center text-xs text-gray-400 italic">No loan records tracked. Click &quot;Log Loan Entry&quot; above if needed.</p>
            ) : (
              activeLoans.map((loan) => {
                const day = new Date(loan.date).getDate();
                let periodTag = '';
                if (day >= 1 && day <= 15) {
                  periodTag = (
                    <span className="bg-amber-100/70 border border-amber-200 text-amber-800 p-1 px-2.5 rounded-full font-bold text-[9px] block text-center mt-2.5 uppercase">
                      → Deduct on 16th Pay Cycle
                    </span>
                  );
                } else if (day >= 16 && day <= 28) {
                  periodTag = (
                    <span className="bg-rose-100/70 border border-rose-200 text-rose-800 p-1 px-2.5 rounded-full font-bold text-[9px] block text-center mt-2.5 uppercase">
                      → Deduct on 29th Balance Cycle
                    </span>
                  );
                } else {
                  periodTag = (
                    <span className="bg-indigo-100/70 border border-indigo-200 text-indigo-800 p-1 px-2.5 rounded-full font-bold text-[9px] block text-center mt-2.5 uppercase">
                      → Deduct next pay period
                    </span>
                  );
                }

                return (
                  <div key={loan.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center bg-white border border-rose-100 p-3 rounded-xl shadow-sm">
                    <div>
                      <span className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Borrow Date</span>
                      <input
                        type="date"
                        value={loan.date}
                        onChange={(e) => handleLoanFieldChange(loan.id, 'date', e.target.value)}
                        className="w-full border border-rose-200 rounded-lg p-1.5 text-xs text-gray-800 outline-none font-bold"
                      />
                      {periodTag}
                    </div>

                    <div className="md:col-span-2">
                      <span className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Reason / Note for borrower ledger</span>
                      <textarea
                        rows={2}
                        value={loan.note}
                        onChange={(e) => handleLoanFieldChange(loan.id, 'note', e.target.value)}
                        placeholder="Detail reasons for borrowing here..."
                        className="w-full border border-rose-200 rounded-lg p-1.5 text-xs outline-none text-gray-800"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <span className="block text-[9px] font-extrabold text-red-500 uppercase mb-1">Amount ($)</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={loan.amount}
                          onChange={(e) => handleLoanFieldChange(loan.id, 'amount', e.target.value)}
                          className="w-full border border-red-300 focus:border-red-600 rounded-lg p-2 text-sm font-extrabold text-red-600 outline-none text-center bg-red-50/30"
                        />
                      </div>

                      <button
                        onClick={() => handleRemoveLoan(loan.id)}
                        className="p-1 px-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs font-extrabold cursor-pointer"
                        title="Remove Borrow Record"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Pay slip presentation box view representation */}
      {selectedEmp && currentResult && (
        <div className="flex justify-center">
          <div className="w-full max-w-2xl bg-white border-2 border-purple-200 rounded-2xl shadow-xl p-8 relative overflow-hidden">
            {/* Header branding */}
            <div className="text-center border-b-2 border-purple-400 pb-4 mb-6">
              <h3 className="text-xl font-black text-purple-900 font-sans tracking-wide">PHE SAMOUT BEACH RESORT</h3>
              <p className="text-[10px] text-gray-400 tracking-widest font-extrabold uppercase mt-1">Official Salary Ledger &amp; Payslip Receipt</p>
              <span className="inline-block bg-purple-50 text-purple-600 px-3 py-1 rounded-full text-xs font-black uppercase mt-3">
                📅 Period: {payPeriod === 'full' ? 'Monthly Full Invoice' : payPeriod === 'mid' ? '16th Semi-monthly Advance' : '29th Final Balance Due'}
              </span>
            </div>

            {/* Profile info */}
            <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-gray-700 border-b pb-4 mb-6">
              <div>
                <p>Employee Name: <strong className="text-gray-900 font-bold">{selectedEmp.name}</strong></p>
                <p className="mt-1">Employee ID: <strong className="text-purple-800 font-bold">{selectedEmp.id}</strong></p>
                <p className="mt-1">Position Role: <span className="text-purple-600">{selectedEmp.position}</span></p>
              </div>
              <div className="text-right">
                <p>Disbursement Month: <strong className="text-gray-900 font-bold">{payMonth}/2026</strong></p>
                <p className="mt-1">Receipt Date: <span>{new Date().toLocaleDateString()}</span></p>
                <p className="mt-1">Verification Status: <span className="text-green-600 font-extrabold">APPROVED</span></p>
              </div>
            </div>

            {/* Calculations Breakdown list template */}
            <div className="space-y-3 font-semibold text-xs text-gray-700">
              <div className="flex justify-between py-1 border-b border-dashed border-gray-100">
                <span>Base wage contract:</span>
                <span className="font-bold text-gray-900">${currentResult.baseSalary.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-dashed border-gray-100 text-indigo-700 font-bold">
                <span>Working days wage adjusted base:</span>
                <span>${currentResult.adjustedBase.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-dashed border-gray-100 text-green-700">
                <span>Disbursed allowances:</span>
                <span>+${currentResult.allowance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-dashed border-gray-100 text-green-700">
                <span>Disbursed incentives:</span>
                <span>+${currentResult.otherIncentiveNum.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-dashed border-gray-100 text-red-600">
                <span>Absenteeism fine deduction:</span>
                <span>-${currentResult.totalAbsentDeduction.toFixed(2)}</span>
              </div>
              {currentResult.periodLoanDeduction > 0 && (
                <div className="flex justify-between py-1 border-b border-dashed border-red-200 text-red-600 font-extrabold bg-red-50 p-1.5 rounded-md">
                  <span>Roster Loan payback deductor:</span>
                  <span>-${currentResult.periodLoanDeduction.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-4 border-t-2 border-purple-400 text-sm font-black text-purple-900">
                <span className="uppercase tracking-widest text-[#2d3748]">Net Disbursed Take-home:</span>
                <span className="text-lg text-purple-700 font-black">${currentResult.netPay.toFixed(2)}</span>
              </div>
            </div>

            {/* Bottom Actions footer buttons */}
            <div className="flex justify-between items-center mt-8 pt-4 border-t border-dashed border-gray-150">
              <div className="w-[120px] text-center border-t border-gray-300 pt-2 font-bold text-[9px] text-gray-400 uppercase">
                Recipient Sign
              </div>

              <button
                onClick={printSingleSlipFrame}
                className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold shadow-md cursor-pointer flex items-center justify-center gap-1.5 text-xs"
              >
                <Printer size={14} />
                <span>{isKh ? 'បោះពុម្ពសន្លឹកបើកលុយ' : 'Print Slip Receipt'}</span>
              </button>

              <div className="w-[120px] text-center border-t border-gray-300 pt-2 font-bold text-[9px] text-gray-400 uppercase">
                Finance Auditor
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
