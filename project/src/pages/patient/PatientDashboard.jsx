import { useState, useEffect } from 'react';
import {
  LogOut,
  Upload,
  FileText,
  Building2,
  Search,
  Calendar,
  Clock,
  User,
  ChevronRight,
  MapPin,
  ExternalLink,
  CheckCircle,
  XCircle,
  ClipboardList,
  UserCircle2
} from 'lucide-react';
import { hospitals, departments, doctors, documentTypes } from '../../utils/dummyData';
import { validateRequired, validateAge, validateBMI, validateEmail } from '../../utils/validation';

const PatientDashboard = ({ userEmail, onLogout }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [patientData, setPatientData] = useState(null);
  const [profileForm, setProfileForm] = useState(null);
  const [searchMode, setSearchMode] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState('');
  const [documentDescription, setDocumentDescription] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [appointmentForm, setAppointmentForm] = useState({
    hospitalId: '',
    doctorId: '',
    date: '',
    symptoms: ''
  });
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [profileErrors, setProfileErrors] = useState({});
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const toProfileForm = (patient) => ({
    name: patient.name || '',
    email: patient.email || patient.username || '',
    gender: patient.gender || '',
    age: patient.age || '',
    bmi: patient.bmi || '',
    address: patient.address || '',
    bloodGroup: patient.bloodGroup || '',
    income: patient.income || '',
    religion: patient.religion || '',
    occupation: patient.occupation || '',
    familyBackgroundDiseases: patient.familyBackgroundDiseases || patient.familyDiseases || ''
  });

  useEffect(() => {
    const storedPatients = JSON.parse(localStorage.getItem('patients') || '[]');
    const identifier = userEmail || localStorage.getItem('currentPatient');
    const patient = storedPatients.find(
      (p) =>
        p.email?.toLowerCase() === identifier?.toLowerCase() ||
        p.username?.toLowerCase() === identifier?.toLowerCase()
    );
    if (patient) {
      setPatientData(patient);
      setProfileForm(toProfileForm(patient));
    }
  }, [userEmail]);

  const persistPatient = (updatedPatient) => {
    const storedPatients = JSON.parse(localStorage.getItem('patients') || '[]');
    const updatedPatients = storedPatients.map((p) =>
      (p.email?.toLowerCase() === (patientData.email || '').toLowerCase() ||
        p.username?.toLowerCase() === (patientData.username || '').toLowerCase())
        ? updatedPatient
        : p
    );
    localStorage.setItem('patients', JSON.stringify(updatedPatients));
    setPatientData(updatedPatient);
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleFileUpload = () => {
    if (!selectedFile || !patientData) {
      alert('Please select a file');
      return;
    }

    if (!documentType) {
      alert('Please select document type');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const newDocument = {
        id: Date.now().toString(),
        name: selectedFile.name,
        uploadDate: new Date().toLocaleDateString(),
        type: documentType,
        description: documentDescription || 'N/A',
        dataUrl: reader.result
      };

      const updatedPatient = {
        ...patientData,
        documents: [...(patientData.documents || []), newDocument]
      };

      persistPatient(updatedPatient);
      setSelectedFile(null);
      setDocumentType('');
      setDocumentDescription('');
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleViewDocument = (doc) => {
    if (doc.dataUrl) {
      const newWindow = window.open();
      newWindow.document.write(`<iframe src="${doc.dataUrl}" style="width:100%;height:100%;" frameborder="0"></iframe>`);
    } else {
      alert('Document preview is not available.');
    }
  };

  const handleBookAppointment = () => {
    if (!patientData) return;

    if (!appointmentForm.hospitalId || !appointmentForm.doctorId || !appointmentForm.date || !appointmentForm.symptoms) {
      alert('Please fill all fields including symptoms');
      return;
    }

    const hospital = hospitals.find((h) => h.id === appointmentForm.hospitalId);
    const doctor = doctors.find((d) => d.id === appointmentForm.doctorId);

    const newAppointment = {
      id: Date.now().toString(),
      hospitalId: appointmentForm.hospitalId,
      hospitalName: hospital?.name || '',
      department: doctor?.department || '',
      doctorId: appointmentForm.doctorId,
      doctorName: doctor?.name || '',
      date: appointmentForm.date,
      symptoms: appointmentForm.symptoms,
      status: 'pending',
      message: ''
    };

    const updatedPatient = {
      ...patientData,
      appointments: [...(patientData.appointments || []), newAppointment]
    };

    persistPatient(updatedPatient);
    setAppointmentForm({
      hospitalId: '',
      doctorId: '',
      date: '',
      symptoms: ''
    });
    setShowAppointmentForm(false);
    setSelectedDoctor(null);
    alert('Appointment booked successfully!');
  };

  const filteredHospitals = hospitals.filter((h) =>
    h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.fullAddress.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDoctorsByHospital = (hospitalId) => {
    const hospital = hospitals.find((h) => h.id === hospitalId);
    if (!hospital) return [];
    return doctors.filter((d) => d.hospital === hospital.name);
  };

  const filteredDoctors = selectedHospital
    ? getDoctorsByHospital(selectedHospital).filter((d) =>
        selectedDepartment ? d.department === selectedDepartment : true
      )
    : doctors.filter((d) =>
        selectedDepartment ? d.department === selectedDepartment : true
      );

  const isDoctorAvailable = (doctor) => {
    const today = new Date();
    const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
    const todaySlot = doctor.availability.find((slot) => slot.day === dayName);
    if (!todaySlot) return { available: false, message: 'Not available today' };
    return { available: true, slots: todaySlot.slots };
  };

  const getAvailableTimeSlots = (doctor) => {
    const today = new Date();
    const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
    const slot = doctor.availability.find((s) => s.day === dayName);
    return slot ? slot.slots : [];
  };

  const validateProfile = () => {
    const newErrors = {};
    if (!validateRequired(profileForm.name) || profileForm.name.trim().length < 2 || profileForm.name.trim().length > 100) {
      newErrors.name = 'Name must be between 2 and 100 characters';
    }
    if (!validateEmail(profileForm.email || '')) {
      newErrors.email = 'Valid email is required';
    }
    if (!profileForm.gender) newErrors.gender = 'Gender is required';
    if (!validateAge(Number(profileForm.age))) newErrors.age = 'Age must be 1-150';
    if (!validateBMI(Number(profileForm.bmi))) newErrors.bmi = 'BMI must be 10-60';
    if (!validateRequired(profileForm.address || '')) newErrors.address = 'Address is required';
    if (!validateRequired(profileForm.bloodGroup || '')) newErrors.bloodGroup = 'Blood group is required';
    if (profileForm.income === '' || Number(profileForm.income) < 0) newErrors.income = 'Income must be 0 or more';
    if (!validateRequired(profileForm.religion || '')) newErrors.religion = 'Religion is required';
    if (!validateRequired(profileForm.occupation || '')) newErrors.occupation = 'Occupation is required';
    setProfileErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileUpdate = () => {
    if (!patientData || !profileForm) return;
    if (!validateProfile()) return;

    const previousSnapshot = {
      gender: patientData.gender,
      bmi: patientData.bmi,
      address: patientData.address,
      income: patientData.income,
      occupation: patientData.occupation,
      capturedAt: new Date().toLocaleString()
    };

    const updatedPatient = {
      ...patientData,
      ...profileForm,
      familyDiseases: profileForm.familyBackgroundDiseases,
      familyBackgroundDiseases: profileForm.familyBackgroundDiseases,
      previousDetails: [previousSnapshot, ...(patientData.previousDetails || [])].slice(0, 5)
    };

    persistPatient(updatedPatient);
    setProfileForm(toProfileForm(updatedPatient));
    setIsEditingProfile(false);
    alert('Profile updated successfully');
  };

  const handleCancelEditProfile = () => {
    if (patientData) {
      setProfileForm(toProfileForm(patientData));
    }
    setProfileErrors({});
    setIsEditingProfile(false);
  };

  const renderStatusBadge = (status) => {
    const base = 'px-3 py-1 rounded-full text-xs font-semibold';
    switch (status) {
      case 'accepted':
        return <span className={`${base} bg-green-100 text-green-700`}>Accepted</span>;
      case 'rejected':
        return <span className={`${base} bg-red-100 text-red-700`}>Rejected</span>;
      default:
        return <span className={`${base} bg-yellow-100 text-yellow-700`}>Pending</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-[#00235B] to-[#0066B2] text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{patientData?.name || 'Patient'}</h1>
                <p className="text-[#A0E7FF]">{patientData?.email || patientData?.username}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors duration-300"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => {
              setActiveTab('upload');
              setSearchMode(null);
            }}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === 'upload'
                ? 'bg-gradient-to-r from-[#0066B2] to-[#00A8E8] text-white shadow-lg'
                : 'bg-white text-gray-700 hover:shadow-md'
            }`}
          >
            <Upload className="w-5 h-5" />
            <span>Upload Documents</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('documents');
              setSearchMode(null);
            }}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === 'documents'
                ? 'bg-gradient-to-r from-[#0066B2] to-[#00A8E8] text-white shadow-lg'
                : 'bg-white text-gray-700 hover:shadow-md'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>My Documents</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('appointments');
              setSearchMode(null);
            }}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === 'appointments'
                ? 'bg-gradient-to-r from-[#0066B2] to-[#00A8E8] text-white shadow-lg'
                : 'bg-white text-gray-700 hover:shadow-md'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span>Booked Appointments</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('hospitals');
              setSearchMode(null);
            }}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === 'hospitals'
                ? 'bg-gradient-to-r from-[#0066B2] to-[#00A8E8] text-white shadow-lg'
                : 'bg-white text-gray-700 hover:shadow-md'
            }`}
          >
            <Building2 className="w-5 h-5" />
            <span>Hospitals</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('search');
              setSearchMode(null);
            }}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === 'search'
                ? 'bg-gradient-to-r from-[#0066B2] to-[#00A8E8] text-white shadow-lg'
                : 'bg-white text-gray-700 hover:shadow-md'
            }`}
          >
            <Search className="w-5 h-5" />
            <span>Book / Check Availability</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('profile');
              setSearchMode(null);
            }}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === 'profile'
                ? 'bg-gradient-to-r from-[#0066B2] to-[#00A8E8] text-white shadow-lg'
                : 'bg-white text-gray-700 hover:shadow-md'
            }`}
          >
            <UserCircle2 className="w-5 h-5" />
            <span>Profile</span>
          </button>
        </div>

        {activeTab === 'upload' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-[#00235B] mb-6">Upload Medical Documents</h2>

            {uploadSuccess && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                Document uploaded successfully!
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Document Type *</label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066B2] focus:border-transparent"
                >
                  <option value="">Select document type</option>
                  {documentTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description (optional)</label>
                <textarea
                  value={documentDescription}
                  onChange={(e) => setDocumentDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066B2] focus:border-transparent"
                  placeholder="Enter document description"
                  rows={3}
                />
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-[#0066B2] transition-colors duration-300">
                <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-4">
                  {selectedFile ? selectedFile.name : 'Choose a file or drag it here'}
                </p>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-[#0066B2] to-[#00A8E8] text-white rounded-lg cursor-pointer hover:shadow-lg transition-all duration-300"
                >
                  Select File
                </label>
              </div>

              {selectedFile && (
                <div className="flex justify-end">
                  <button
                    onClick={handleFileUpload}
                    className="px-8 py-3 bg-gradient-to-r from-[#00A8E8] to-[#40C9FF] text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                  >
                    Upload Document
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-[#00235B] mb-6">My Documents</h2>

            {patientData?.documents && patientData.documents.length > 0 ? (
              <div className="grid gap-4">
                {patientData.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-300"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <FileText className="w-8 h-8 text-[#0066B2]" />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{doc.name}</p>
                        <p className="text-sm text-gray-500">Type: {doc.type?.replace('_', ' ') || 'N/A'}</p>
                        <p className="text-sm text-gray-500">Description: {doc.description || 'N/A'}</p>
                        <p className="text-sm text-gray-500">Uploaded on {doc.uploadDate}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewDocument(doc)}
                      className="px-4 py-2 text-[#0066B2] hover:bg-[#0066B2] hover:text-white rounded-lg transition-colors duration-300"
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>No documents uploaded yet</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#00235B]">Booked Appointments</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <ClipboardList className="w-4 h-4" />
                <span>Status updates reflect doctor responses</span>
              </div>
            </div>

            {patientData?.appointments && patientData.appointments.length > 0 ? (
              <div className="space-y-4">
                {patientData.appointments.map((appt) => (
                  <div key={appt.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-300">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                      <div>
                        <p className="text-lg font-semibold text-[#00235B]">{appt.doctorName || 'Doctor'}</p>
                        <p className="text-sm text-gray-600">{appt.department} • {appt.hospitalName}</p>
                      </div>
                      {renderStatusBadge(appt.status)}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
                      <span>Date: {appt.date}</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">Symptoms: {appt.symptoms}</p>
                    {appt.status === 'rejected' && (
                      <p className="text-sm text-red-600 font-medium">
                        {appt.message || 'Your doctor has a busy schedule, book for any other day'}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>No appointments booked yet</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'hospitals' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#00235B]">Available Hospitals</h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search hospitals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066B2] focus:border-transparent"
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {filteredHospitals.map((hospital) => (
                <div
                  key={hospital.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-300"
                >
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-[#00235B] mb-2">{hospital.name}</h3>
                    <div className="flex items-start space-x-2 text-gray-600 mb-2">
                      <MapPin className="w-5 h-5 mt-0.5 text-[#0066B2]" />
                      <div>
                        <p className="font-medium">{hospital.location}</p>
                        <p className="text-sm">{hospital.fullAddress}</p>
                      </div>
                    </div>
                    <a
                      href={hospital.googleMapsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-[#0066B2] hover:text-[#00235B] text-sm font-medium"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      View on Google Maps
                    </a>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Departments:</p>
                    <div className="flex flex-wrap gap-2">
                      {hospital.departments.map((dept) => (
                        <span
                          key={dept}
                          className="px-3 py-1 bg-[#A0E7FF]/30 text-[#00235B] rounded-full text-sm"
                        >
                          {dept}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'search' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-[#00235B] mb-6">Book Appointment or Check Availability</h2>

            {!searchMode ? (
              <div className="grid md:grid-cols-2 gap-6">
                <button
                  onClick={() => setSearchMode('appointment')}
                  className="group p-8 border-2 border-gray-200 rounded-xl hover:border-[#0066B2] hover:shadow-lg transition-all duration-300"
                >
                  <Calendar className="w-12 h-12 text-[#0066B2] mb-4 mx-auto" />
                  <h3 className="text-xl font-bold text-[#00235B] mb-2">Book Appointment</h3>
                  <p className="text-gray-600 mb-4">Select hospital, department and book an appointment with available doctors</p>
                  <div className="flex items-center justify-center text-[#0066B2] font-semibold">
                    Continue
                    <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                <button
                  onClick={() => setSearchMode('availability')}
                  className="group p-8 border-2 border-gray-200 rounded-xl hover:border-[#0066B2] hover:shadow-lg transition-all duration-300"
                >
                  <Clock className="w-12 h-12 text-[#0066B2] mb-4 mx-auto" />
                  <h3 className="text-xl font-bold text-[#00235B] mb-2">Doctor Availability</h3>
                  <p className="text-gray-600 mb-4">Check doctor availability and timings by hospital and department</p>
                  <div className="flex items-center justify-center text-[#0066B2] font-semibold">
                    Continue
                    <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </div>
            ) : (
              <div>
                <button
                  onClick={() => {
                    setSearchMode(null);
                    setSelectedHospital('');
                    setSelectedDepartment('');
                    setShowAppointmentForm(false);
                    setSelectedDoctor(null);
                  }}
                  className="mb-6 text-[#0066B2] hover:text-[#00235B] font-semibold"
                >
                  ← Back
                </button>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Hospital *</label>
                    <select
                      value={selectedHospital}
                      onChange={(e) => {
                        setSelectedHospital(e.target.value);
                        setSelectedDepartment('');
                        setShowAppointmentForm(false);
                        setSelectedDoctor(null);
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066B2] focus:border-transparent"
                    >
                      <option value="">Select hospital</option>
                      {hospitals.map((hospital) => (
                        <option key={hospital.id} value={hospital.id}>
                          {hospital.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Department</label>
                    <select
                      value={selectedDepartment}
                      onChange={(e) => {
                        setSelectedDepartment(e.target.value);
                        setShowAppointmentForm(false);
                        setSelectedDoctor(null);
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066B2] focus:border-transparent"
                    >
                      <option value="">All Departments</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {searchMode === 'appointment' && (
                  <div>
                    {!selectedHospital && (
                      <div className="text-center py-8 text-gray-500">
                        <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p>Please select a hospital first</p>
                      </div>
                    )}

                    {selectedHospital && filteredDoctors.length > 0 && (
                      <div className="space-y-4 mb-6">
                        {filteredDoctors.map((doctor) => {
                          const availability = isDoctorAvailable(doctor);
                          const isFormOpen = showAppointmentForm && selectedDoctor?.id === doctor.id;
                          return (
                            <div key={doctor.id}>
                              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-300">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <h3 className="text-lg font-bold text-[#00235B]">{doctor.name}</h3>
                                      {availability.available ? (
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                      ) : (
                                        <XCircle className="w-5 h-5 text-red-500" />
                                      )}
                                    </div>
                                    <p className="text-gray-600 mb-1">{doctor.department}</p>
                                    <p className="text-sm text-gray-500">{doctor.hospital}</p>
                                    {availability.available && (
                                      <p className="text-sm text-green-600 mt-2 font-medium">
                                        Available today - {availability.slots.join(', ')}
                                      </p>
                                    )}
                                    {!availability.available && (
                                      <p className="text-sm text-red-600 mt-2 font-medium">
                                        {availability.message}
                                      </p>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => {
                                      if (isFormOpen) {
                                        setShowAppointmentForm(false);
                                        setSelectedDoctor(null);
                                      } else {
                                        setSelectedDoctor(doctor);
                                        setShowAppointmentForm(true);
                                        setAppointmentForm({
                                          hospitalId: selectedHospital,
                                          doctorId: doctor.id,
                                          date: '',
                                          symptoms: ''
                                        });
                                      }
                                    }}
                                    className="px-6 py-2 bg-gradient-to-r from-[#0066B2] to-[#00A8E8] text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                                  >
                                    {isFormOpen ? 'Cancel' : 'Book'}
                                  </button>
                                </div>
                              </div>
                              
                              {isFormOpen && (
                                <div className="mt-4 border-2 border-[#0066B2] rounded-lg p-6 bg-blue-50">
                                  <h3 className="text-xl font-bold text-[#00235B] mb-4">Book Appointment with {selectedDoctor.name}</h3>
                                  <div className="space-y-4">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                                      <input
                                        type="date"
                                        value={appointmentForm.date}
                                        onChange={(e) => setAppointmentForm({ ...appointmentForm, date: e.target.value })}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066B2] focus:border-transparent"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">Symptoms / Reason for Visit *</label>
                                      <textarea
                                        value={appointmentForm.symptoms}
                                        onChange={(e) => setAppointmentForm({ ...appointmentForm, symptoms: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066B2] focus:border-transparent"
                                        placeholder="Describe your symptoms or reason for visit"
                                        rows={4}
                                      />
                                    </div>

                                    <div className="flex space-x-4">
                                      <button
                                        onClick={handleBookAppointment}
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-[#0066B2] to-[#00A8E8] text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                                      >
                                        Confirm Appointment
                                      </button>
                                      <button
                                        onClick={() => {
                                          setShowAppointmentForm(false);
                                          setSelectedDoctor(null);
                                        }}
                                        className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-all duration-300"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {selectedHospital && filteredDoctors.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <p>No doctors found for the selected criteria</p>
                      </div>
                    )}
                  </div>
                )}

                {searchMode === 'availability' && (
                  <div>
                    {!selectedHospital && (
                      <div className="text-center py-8 text-gray-500">
                        <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p>Please select a hospital first</p>
                      </div>
                    )}

                    {selectedHospital && filteredDoctors.length > 0 && (
                      <div className="space-y-6">
                        {filteredDoctors.map((doctor) => {
                          const availability = isDoctorAvailable(doctor);
                          return (
                            <div key={doctor.id} className="border border-gray-200 rounded-lg p-6">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="text-lg font-bold text-[#00235B]">{doctor.name}</h3>
                                {availability.available ? (
                                  <CheckCircle className="w-5 h-5 text-green-500" />
                                ) : (
                                  <XCircle className="w-5 h-5 text-red-500" />
                                )}
                                <span className={`text-sm font-medium ${availability.available ? 'text-green-600' : 'text-red-600'}`}>
                                  {availability.available ? 'Available' : 'Not Available'}
                                </span>
                              </div>
                              <p className="text-gray-600 mb-4">{doctor.department} - {doctor.hospital}</p>

                              <div className="space-y-2">
                                <p className="font-semibold text-gray-700">Available Timings:</p>
                                {doctor.availability.map((slot, idx) => (
                                  <div key={idx} className="flex items-center space-x-3 text-sm">
                                    <span className="font-medium text-[#0066B2] w-24">{slot.day}</span>
                                    <div className="flex flex-wrap gap-2">
                                      {slot.slots.map((time, timeIdx) => (
                                        <span
                                          key={timeIdx}
                                          className="px-3 py-1 bg-[#A0E7FF]/30 text-[#00235B] rounded-full"
                                        >
                                          {time}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {selectedHospital && filteredDoctors.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <p>No doctors found for the selected criteria</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && profileForm && (
          <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#00235B]">Profile</h2>
                <p className="text-sm text-gray-600">View and update your information</p>
              </div>
              {!isEditingProfile ? (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="px-6 py-2 bg-gradient-to-r from-[#0066B2] to-[#00A8E8] text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                >
                  Update Profile
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={handleProfileUpdate}
                    className="px-6 py-2 bg-gradient-to-r from-[#0066B2] to-[#00A8E8] text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancelEditProfile}
                    className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-all duration-300"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {!isEditingProfile ? (
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  ['Full Name', patientData?.name],
                  ['Email', patientData?.email || patientData?.username],
                  ['Gender', patientData?.gender],
                  ['Age', patientData?.age],
                  ['Body Mass Index', patientData?.bmi],
                  ['Blood Group', patientData?.bloodGroup],
                  ['Address', patientData?.address],
                  ['Income', patientData?.income],
                  ['Religion', patientData?.religion],
                  ['Occupation', patientData?.occupation],
                  ['Family Background Diseases', patientData?.familyBackgroundDiseases || patientData?.familyDiseases || '—']
                ].map(([label, value]) => (
                  <div key={label} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <p className="text-sm font-semibold text-gray-600 mb-1">{label}</p>
                    <p className="text-gray-900">{value ?? '—'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0066B2] focus:border-transparent transition-all ${
                      profileErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {profileErrors.name && <p className="mt-1 text-sm text-red-600">{profileErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0066B2] focus:border-transparent transition-all ${
                      profileErrors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your email"
                  />
                  {profileErrors.email && <p className="mt-1 text-sm text-red-600">{profileErrors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                  <select
                    value={profileForm.gender}
                    onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0066B2] focus:border-transparent transition-all ${
                      profileErrors.gender ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select gender</option>
                    {['MALE', 'FEMALE', 'OTHER'].map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                  {profileErrors.gender && <p className="mt-1 text-sm text-red-600">{profileErrors.gender}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age *</label>
                  <input
                    type="number"
                    value={profileForm.age}
                    onChange={(e) => setProfileForm({ ...profileForm, age: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0066B2] focus:border-transparent transition-all ${
                      profileErrors.age ? 'border-red-500' : 'border-gray-300'
                    }`}
                    min="1"
                    max="150"
                  />
                  {profileErrors.age && <p className="mt-1 text-sm text-red-600">{profileErrors.age}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Body Mass Index *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={profileForm.bmi}
                    onChange={(e) => setProfileForm({ ...profileForm, bmi: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0066B2] focus:border-transparent transition-all ${
                      profileErrors.bmi ? 'border-red-500' : 'border-gray-300'
                    }`}
                    min="10"
                    max="60"
                  />
                  {profileErrors.bmi && <p className="mt-1 text-sm text-red-600">{profileErrors.bmi}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group *</label>
                  <input
                    type="text"
                    value={profileForm.bloodGroup}
                    onChange={(e) => setProfileForm({ ...profileForm, bloodGroup: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0066B2] focus:border-transparent transition-all ${
                      profileErrors.bloodGroup ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., O_POSITIVE"
                  />
                  {profileErrors.bloodGroup && <p className="mt-1 text-sm text-red-600">{profileErrors.bloodGroup}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                  <textarea
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0066B2] focus:border-transparent transition-all ${
                      profileErrors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                    rows={2}
                  />
                  {profileErrors.address && <p className="mt-1 text-sm text-red-600">{profileErrors.address}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Income *</label>
                  <input
                    type="number"
                    min="0"
                    value={profileForm.income}
                    onChange={(e) => setProfileForm({ ...profileForm, income: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0066B2] focus:border-transparent transition-all ${
                      profileErrors.income ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {profileErrors.income && <p className="mt-1 text-sm text-red-600">{profileErrors.income}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Religion *</label>
                  <input
                    type="text"
                    value={profileForm.religion}
                    onChange={(e) => setProfileForm({ ...profileForm, religion: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0066B2] focus:border-transparent transition-all ${
                      profileErrors.religion ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {profileErrors.religion && <p className="mt-1 text-sm text-red-600">{profileErrors.religion}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Occupation *</label>
                  <input
                    type="text"
                    value={profileForm.occupation}
                    onChange={(e) => setProfileForm({ ...profileForm, occupation: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0066B2] focus:border-transparent transition-all ${
                      profileErrors.occupation ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {profileErrors.occupation && <p className="mt-1 text-sm text-red-600">{profileErrors.occupation}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Family Background Diseases (optional)</label>
                  <input
                    type="text"
                    value={profileForm.familyBackgroundDiseases}
                    onChange={(e) => setProfileForm({ ...profileForm, familyBackgroundDiseases: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066B2] focus:border-transparent transition-all"
                    placeholder="e.g., Diabetes, Hypertension"
                  />
                </div>
              </div>
            )}

            {patientData?.previousDetails && patientData.previousDetails.length > 0 && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-bold text-[#00235B] mb-3">Previous Details</h3>
                <div className="grid gap-3">
                  {patientData.previousDetails.map((prev, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600 mb-2">Captured at: {prev.capturedAt}</p>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-700">
                        <span>Gender: {prev.gender}</span>
                        <span>BMI: {prev.bmi}</span>
                        <span>Address: {prev.address}</span>
                        <span>Income: {prev.income}</span>
                        <span>Occupation: {prev.occupation}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;
