export interface Employee {
  id: string;
  name: string;
  position: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  joinDate: string;
  salary: number;
  phone: string;
  parentContact: string;
  photo?: string;
}

export interface Attendance {
  id: string; // matches Employee.id
  name: string;
  date: string; // DD/MM/YYYY or YYYY-MM-DD
  checkIn: string;
  checkOut: string;
  status: 'Present' | 'Absent' | 'Late' | 'Leave';
}

export interface Inventory {
  name: string;
  unit: string;
  qtyNum: number;
  qtyIn: number; // Price or QtyIn total
  qtyOut: string; // Remark or qty out
  dateIn: string;
  datePurchase: string;
  cost: number;
  alertThreshold: number;
  ageTag: 'new' | 'old';
}

export interface Booking {
  guestName: string;
  phone: string;
  roomType: 'one_bed' | 'two_bed' | 'add_mattress';
  units: number;
  unitsOne: number;
  unitsTwo: number;
  unitsMattress: number;
  peopleCount: number;
  checkInDate: string;
  checkOutDate: string;
  price: number;
  deposit: number;
  balance: number;
  remark: string; // Room numbers
  rejectReason?: string;
  status: 'Confirmed' | 'Pending' | 'Rejected' | 'Changed';
}

export interface PurchaseInv {
  poRef: string;
  date: string;
  item: string;
  cat: string;
  supplier: string;
  qtyUnit: string;
  qty: number;
  unitCost: number;
  delivery: string;
  status: 'Pending' | 'Ordered' | 'Received' | 'Cancelled';
  notes: string;
}

export interface PurchaseHK {
  poRef: string;
  date: string;
  item: string;
  cat: string;
  supplier: string;
  qtyUnit?: string;
  qty: number;
  unitCost: number;
  area: string;
  status: 'Pending' | 'Ordered' | 'Received' | 'Cancelled';
  notes: string;
}

export interface MenuItem {
  name: string;
  cat: 'food' | 'drink';
  price: number;
  desc: string;
  badge: string;
  avail: 'available' | 'unavailable';
  photo?: string;
}

export interface InvoiceRTRow {
  desc: string;
  qty: number;
  price: number;
  discount: number;
}

export interface InvoiceRT {
  invNo: string;
  roomNo: string;
  guestName: string;
  date: string;
  rows: InvoiceRTRow[];
  subtotal: number;
  totalDiscount: number;
  grand: number;
  savedAt: string;
}

export interface LoanRecord {
  id: number;
  date: string;
  amount: number;
  note: string;
}

export interface AppDataState {
  employees: Employee[];
  attendance: Attendance[];
  inventory: Inventory[];
  bookings: Booking[];
  activityLogs: string[];
  purchaseInv: PurchaseInv[];
  purchaseHK: PurchaseHK[];
  menuItems: MenuItem[];
  invoicesRT: InvoiceRT[];
  loanRecords: Record<string, LoanRecord[]>; // Key is Employee ID
}
