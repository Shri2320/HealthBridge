export const dummyCredentials = {
  patients: [
    { username: 'patient1', email: 'patient1@example.com', password: 'Patient@123' },
    { username: 'john.doe', email: 'john.doe@example.com', password: 'John@2024' }
  ],
  doctors: [
    { username: 'dr.smith', email: 'dr.smith@hospital.com', password: 'Doctor@123' },
    { username: 'dr.wilson', email: 'dr.wilson@hospital.com', password: 'Wilson@2024' }
  ],
  admins: [
    { username: 'admin1', email: 'admin1@hospital.com', password: 'Admin@123' },
    { username: 'hospital.admin', email: 'hospital.admin@hospital.com', password: 'HospitalAdmin@2024' }
  ]
};

// In frontend: utils/dummyData.js

export const departments = [
  'CARDIOLOGY',
  'ORTHOPEDICS',
  'NEUROLOGY',
  'PEDIATRICS',
  'GYNECOLOGY',       // Added to match Backend
  'DERMATOLOGY',
  'ENT',
  'OPHTHALMOLOGY',    // Added to match Backend
  'PSYCHIATRY',       // Added to match Backend
  'GENERAL_MEDICINE', // CHANGED: Replaced space with underscore
  'EMERGENCY',        // Added to match Backend
  'ICU'               // Added to match Backend
  // 'ONCOLOGY'       <-- REMOVED because your Backend Enum doesn't have it!
];

export const hospitals = [
  {
    id: '1',
    name: 'City General Hospital',
    location: 'Downtown, Main Street',
    fullAddress: '123 Main Street, Downtown, City, State 12345, Country',
    googleMapsLink: 'https://www.google.com/maps/search/?api=1&query=City+General+Hospital+Downtown',
    departments: departments
  },
  {
    id: '2',
    name: 'Medicare Center',
    location: 'North Avenue, Block A',
    fullAddress: '456 North Avenue, Block A, City, State 12346, Country',
    googleMapsLink: 'https://www.google.com/maps/search/?api=1&query=Medicare+Center+North+Avenue',
    departments: departments
  },
  {
    id: '3',
    name: 'Healthcare Plus',
    location: 'East Side, Medical District',
    fullAddress: '789 Medical District Road, East Side, City, State 12347, Country',
    googleMapsLink: 'https://www.google.com/maps/search/?api=1&query=Healthcare+Plus+East+Side',
    departments: departments
  },
  {
    id: '4',
    name: 'Royal Medical Institute',
    location: 'West End, Hospital Road',
    fullAddress: '321 Hospital Road, West End, City, State 12348, Country',
    googleMapsLink: 'https://www.google.com/maps/search/?api=1&query=Royal+Medical+Institute+West+End',
    departments: departments
  }
];

export const documentTypes = [
  'LAB_REPORT',
  'PRESCRIPTION',
  'XRAY',
  'MRI_SCAN',
  'CT_SCAN',
  'ULTRASOUND',
  'ECG',
  'OTHER'
];

export const doctors = [
  {
    id: '1',
    name: 'Dr. John Smith',
    department: 'Cardiology',
    availability: [
      { day: 'Monday', slots: ['09:00 AM - 12:00 PM', '02:00 PM - 05:00 PM'] },
      { day: 'Wednesday', slots: ['09:00 AM - 12:00 PM', '02:00 PM - 05:00 PM'] },
      { day: 'Friday', slots: ['09:00 AM - 12:00 PM'] }
    ],
    hospital: 'City General Hospital'
  },
  {
    id: '2',
    name: 'Dr. Sarah Wilson',
    department: 'Cardiology',
    availability: [
      { day: 'Tuesday', slots: ['10:00 AM - 01:00 PM', '03:00 PM - 06:00 PM'] },
      { day: 'Thursday', slots: ['10:00 AM - 01:00 PM', '03:00 PM - 06:00 PM'] }
    ],
    hospital: 'City General Hospital'
  },
  {
    id: '3',
    name: 'Dr. Michael Brown',
    department: 'Orthopedics',
    availability: [
      { day: 'Monday', slots: ['08:00 AM - 11:00 AM', '01:00 PM - 04:00 PM'] },
      { day: 'Tuesday', slots: ['08:00 AM - 11:00 AM', '01:00 PM - 04:00 PM'] },
      { day: 'Thursday', slots: ['08:00 AM - 11:00 AM'] }
    ],
    hospital: 'Medicare Center'
  },
  {
    id: '4',
    name: 'Dr. Emily Davis',
    department: 'Neurology',
    availability: [
      { day: 'Wednesday', slots: ['09:00 AM - 12:00 PM', '02:00 PM - 05:00 PM'] },
      { day: 'Friday', slots: ['09:00 AM - 12:00 PM', '02:00 PM - 05:00 PM'] }
    ],
    hospital: 'Healthcare Plus'
  },
  {
    id: '5',
    name: 'Dr. James Taylor',
    department: 'Pediatrics',
    availability: [
      { day: 'Monday', slots: ['10:00 AM - 01:00 PM'] },
      { day: 'Tuesday', slots: ['10:00 AM - 01:00 PM'] },
      { day: 'Wednesday', slots: ['10:00 AM - 01:00 PM'] },
      { day: 'Thursday', slots: ['10:00 AM - 01:00 PM'] },
      { day: 'Friday', slots: ['10:00 AM - 01:00 PM'] }
    ],
    hospital: 'Royal Medical Institute'
  },
  {
    id: '6',
    name: 'Dr. Lisa Anderson',
    department: 'General Medicine',
    availability: [
      { day: 'Monday', slots: ['09:00 AM - 05:00 PM'] },
      { day: 'Tuesday', slots: ['09:00 AM - 05:00 PM'] },
      { day: 'Wednesday', slots: ['09:00 AM - 05:00 PM'] },
      { day: 'Thursday', slots: ['09:00 AM - 05:00 PM'] },
      { day: 'Friday', slots: ['09:00 AM - 05:00 PM'] }
    ],
    hospital: 'City General Hospital'
  }
];

export const bloodGroups = ['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE'];

export const genderOptions = ['MALE', 'FEMALE', 'OTHER'];

export const religionOptions = ['Christianity', 'Islam', 'Hinduism', 'Buddhism', 'Judaism', 'Sikhism', 'Other', 'Prefer not to say'];

