import { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import PatientAuth from './pages/patient/PatientAuth';
import PatientDashboard from './pages/patient/PatientDashboard';
import DoctorLogin from './pages/doctor/DoctorLogin';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import DeveloperRegister from './pages/developer/DeveloperRegister';
import { dummyCredentials } from './utils/dummyData';

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [currentUser, setCurrentUser] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('patients')) {
      const initialPatients = dummyCredentials.patients.map((cred) => ({
        ...cred,
        name: cred.username === 'patient1' ? 'John Doe' : 'Jane Smith',
        gender: 'MALE',
        age: 35,
        bmi: 24.5,
        address: '123 Main Street, City',
        bloodGroup: 'O_POSITIVE',
        income: 50000,
        religion: 'Christianity',
        occupation: 'Software Engineer',
        familyDiseases: 'Diabetes',
        documents: [],
        appointments: [],
        previousDetails: []
      }));
      localStorage.setItem('patients', JSON.stringify(initialPatients));
    }

    if (!localStorage.getItem('doctors')) {
      const initialDoctors = dummyCredentials.doctors.map((cred, idx) => ({
        ...cred,
        email: cred.email || cred.username + '@hospital.com',
        name: cred.username === 'dr.smith' ? 'Dr. John Smith' : 'Dr. Sarah Wilson',
        specialization: 'Cardiology',
        qualification: 'MBBS, MD',
        experience: idx === 0 ? 10 : 8,
        phoneNumber: '1234567890',
        departmentId: 'Cardiology',
        department: 'Cardiology',
        hospital: 'City General Hospital',
        appointments: [],
        treatmentHistory: [
          { date: '2024-12-10', patientsCount: 12 },
          { date: '2024-12-09', patientsCount: 15 },
          { date: '2024-12-08', patientsCount: 10 }
        ]
      }));
      localStorage.setItem('doctors', JSON.stringify(initialDoctors));
    }

    if (!localStorage.getItem('admins')) {
      const initialAdmins = dummyCredentials.admins.map((cred) => ({
        ...cred,
        email: cred.email || cred.username + '@hospital.com',
        hospitalName: 'City General Hospital',
        hospitalLocation: 'Downtown, Main Street',
        hospitalPhone: '1234567890',
        hospitalEmail: 'info@hospital.com',
        hospitalLogo: '',
        departments: []
      }));
      localStorage.setItem('admins', JSON.stringify(initialAdmins));
    }
  }, []);

  const handleRoleSelect = (role) => {
    switch (role) {
      case 'patient':
        setCurrentPage('patient-auth');
        break;
      case 'doctor':
        setCurrentPage('doctor-login');
        break;
      case 'admin':
        setCurrentPage('admin-login');
        break;
      case 'developer':
        setCurrentPage('developer');
        break;
    }
  };

  const handlePatientLogin = (patientIdentifier) => {
    setCurrentUser(patientIdentifier);
    setCurrentPage('patient-dashboard');
  };

  const handleDoctorLogin = (username) => {
    setCurrentUser(username);
    setCurrentPage('doctor-dashboard');
  };

  const handleAdminLogin = (username) => {
    setCurrentUser(username);
    setCurrentPage('admin-dashboard');
  };

  const handleLogout = () => {
    setCurrentUser('');
    setCurrentPage('landing');
    localStorage.removeItem('currentPatient');
    localStorage.removeItem('currentDoctor');
    localStorage.removeItem('currentAdmin');
  };

  const handleBack = () => {
    setCurrentPage('landing');
  };

  return (
    <>
      {currentPage === 'landing' && <LandingPage onRoleSelect={handleRoleSelect} />}

      {currentPage === 'patient-auth' && (
        <PatientAuth onBack={handleBack} onLogin={handlePatientLogin} />
      )}

      {currentPage === 'patient-dashboard' && (
        <PatientDashboard userEmail={currentUser} onLogout={handleLogout} />
      )}

      {currentPage === 'doctor-login' && (
        <DoctorLogin onBack={handleBack} onLogin={handleDoctorLogin} />
      )}

      {currentPage === 'doctor-dashboard' && (
        <DoctorDashboard userEmail={currentUser} onLogout={handleLogout} />
      )}

      {currentPage === 'admin-login' && (
        <AdminLogin onBack={handleBack} onLogin={handleAdminLogin} />
      )}

      {currentPage === 'admin-dashboard' && (
        <AdminDashboard userEmail={currentUser} onLogout={handleLogout} />
      )}

      {currentPage === 'developer' && <DeveloperRegister onBack={handleBack} />}
    </>
  );
}

export default App;

