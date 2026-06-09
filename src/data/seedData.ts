import { Employee, Inventory, MenuItem, Booking } from '../types';

export const SEED_EMPLOYEES: Employee[] = [
  {
    id: 'PB001',
    name: 'EEM SEYHAA',
    position: 'Assowner & Media',
    gender: 'Male',
    dob: '1998-08-08',
    joinDate: '2026-05-29',
    salary: 300,
    phone: '0963561358',
    parentContact: '0716777824',
    photo: ''
  },
  {
    id: 'PB002',
    name: 'PHEM SOPARA',
    position: 'Leader & Reservation',
    gender: 'Male',
    dob: '1987-05-07',
    joinDate: '2026-06-01',
    salary: 400,
    phone: '0962078978',
    parentContact: '0962078978',
    photo: ''
  },
  {
    id: 'PB003',
    name: 'HAP LYMASLUON',
    position: 'Chef',
    gender: 'Female',
    dob: '2000-02-10',
    joinDate: '2026-05-11',
    salary: 175,
    phone: '0882593670',
    parentContact: '0882832151',
    photo: ''
  },
  {
    id: 'PB004',
    name: 'DUER VANSUO',
    position: 'Chef',
    gender: 'Female',
    dob: '1991-07-02',
    joinDate: '2026-06-01',
    salary: 175,
    phone: '0967828370',
    parentContact: '0962281989',
    photo: ''
  },
  {
    id: 'PB005',
    name: 'NOV BUNSALIN',
    position: 'Housekeeping',
    gender: 'Male',
    dob: '2004-05-02',
    joinDate: '2026-05-03',
    salary: 170,
    phone: '0979502154',
    parentContact: '0974774275',
    photo: ''
  },
  {
    id: 'PB006',
    name: 'EAL LIDA',
    position: 'Housekeeping',
    gender: 'Female',
    dob: '2015-02-02',
    joinDate: '2026-05-11',
    salary: 150,
    phone: '096246754',
    parentContact: '070660186',
    photo: ''
  },
  {
    id: 'PB007',
    name: 'KHUN PHEAKHIN',
    position: 'Service',
    gender: 'Male',
    dob: '2013-03-03',
    joinDate: '2026-05-25',
    salary: 137.5,
    phone: '067662645',
    parentContact: '0718446424',
    photo: ''
  },
  {
    id: 'PB008',
    name: 'SUER EI',
    position: 'Service',
    gender: 'Male',
    dob: '2011-07-07',
    joinDate: '2026-05-08',
    salary: 150,
    phone: '070578240',
    parentContact: '0963886723',
    photo: ''
  }
];

export const SEED_INVENTORY: Inventory[] = [
  {
    name: 'Pendant Lamp',
    unit: 'Box',
    qtyNum: 5,
    qtyIn: 60.0,
    qtyOut: 'Normal condition',
    dateIn: '2026-06-01',
    datePurchase: '2026-05-25',
    cost: 12.0,
    alertThreshold: 2,
    ageTag: 'new'
  },
  {
    name: 'Luxury Bed Linens',
    unit: 'Set',
    qtyNum: 25,
    qtyIn: 450.0,
    qtyOut: 'Guest suites',
    dateIn: '2026-05-15',
    datePurchase: '2026-05-10',
    cost: 18.0,
    alertThreshold: 28, // triggers low stock warning net (25 <= 28)
    ageTag: 'old'
  },
  {
    name: 'Organic Green Tea Bag',
    unit: 'Box',
    qtyNum: 2,
    qtyIn: 30.0,
    qtyOut: 'F&B Pantry',
    dateIn: '2026-06-08',
    datePurchase: '2026-06-07',
    cost: 15.0,
    alertThreshold: 3, // triggers low stock warning (2 <= 3)
    ageTag: 'new'
  }
];

export const SEED_MENU_ITEMS: MenuItem[] = [
  {
    name: 'Grilled Garlic Lobster',
    cat: 'food',
    price: 28.0,
    desc: 'Fresh local lobster grilled with homemade organic herb garlic butter.',
    badge: 'Chef Special',
    avail: 'available'
  },
  {
    name: 'Smoked Salmon Benedict',
    cat: 'food',
    price: 14.5,
    desc: 'Poached free-range eggs, smoked salmon on toasted English muffin with citrus hollandaise.',
    badge: 'Popular',
    avail: 'available'
  },
  {
    name: 'Fresh Organic Coconut Water',
    cat: 'drink',
    price: 4.5,
    desc: 'Served ice cold straight from the beach palms of Kep.',
    badge: 'Local Fav',
    avail: 'available'
  },
  {
    name: 'Spicy Beach Mai Tai',
    cat: 'drink',
    price: 8.5,
    desc: 'Dark rum, fresh lime, orange curacao, almond syrup with a signature chili garnish.',
    badge: 'New',
    avail: 'available'
  }
];

export const SEED_BOOKINGS: Booking[] = [
  {
    guestName: 'Sokha Rithy',
    phone: '+855 12 345 678',
    roomType: 'two_bed',
    units: 2,
    unitsOne: 0,
    unitsTwo: 2,
    unitsMattress: 0,
    peopleCount: 4,
    checkInDate: '2026-06-08',
    checkOutDate: '2026-06-12',
    price: 180.0,
    deposit: 80.0,
    balance: 100.0,
    remark: 'Room 205A',
    status: 'Confirmed'
  },
  {
    guestName: 'William Thornton',
    phone: '+1 415 889 2314',
    roomType: 'one_bed',
    units: 1,
    unitsOne: 1,
    unitsTwo: 0,
    unitsMattress: 0,
    peopleCount: 2,
    checkInDate: '2026-06-09',
    checkOutDate: '2026-06-15',
    price: 120.0,
    deposit: 50.0,
    balance: 70.0,
    remark: 'Room 101',
    status: 'Confirmed'
  }
];
