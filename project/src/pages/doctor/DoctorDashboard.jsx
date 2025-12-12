import { useState, useEffect } from 'react';
import { LogOut, User, Calendar, TrendingUp, FileText, Users, UserCircle2, Mail, Phone, Briefcase, Award, Clock, CheckCircle, XCircle } from 'lucide-react';

const DoctorDashboard = ({ userEmail, onLogout }) => {
  const [doctorData, setDoctorData] = useState(null);
  const [todaysAppointments, setTodaysAppointments] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const storedDoctors = JSON.parse(localStorage.getItem('doctors') || '[]');
    const doctor = storedDoctors.find((d) => d.email?.toLowerCase() === userEmail?.toLowerCase());

    if (doctor) {
      setDoctorData(doctor);
    } else {
      const defaultDoctor = {
        email: userEmail,
        name: 'Dr. John Smith',
        specialization: 'Cardiology',
        qualification: 'MBBS, MD',
        experience: 10,
        phoneNumber: '1234567890',
        departmentId: 'Cardiology',
        department: 'Cardiology',
        hospital: 'City General Hospital',
        appointments: [],
        treatmentHistory: [
          { date: '2024-12-10', patientsCount: 12 },
          { date: '2024-12-09', patientsCount: 15 },
          { date: '2024-12-08', patientsCount: 10 },
          { date: '2024-12-07', patientsCount: 14 },
          { date: '2024-12-06', patientsCount: 11 }
        ]
      };
      setDoctorData(defaultDoctor);
    }

    const allPatients = JSON.parse(localStorage.getItem('patients') || '[]');
    const today = new Date().toISOString().split('T')[0];
    const appointments = allPatients
      .filter((p) => p.appointments && p.appointments.length > 0)
      .flatMap((p) =>
        (p.appointments || [])
          .filter((apt) => apt.date === today && apt.status === 'pending')
          .map((apt) => ({
            ...apt,
            patientData: p
          }))
      );

    setTodaysAppointments(appointments);
  }, [userEmail]);

  const handleAcceptAppointment = (appointmentId) => {
    const allPatients = JSON.parse(localStorage.getItem('patients') || '[]');
    const updatedPatients = allPatients.map(patient => {
      if (patient.appointments) {
        const updatedAppointments = patient.appointments.map(apt => {
          if (apt.id === appointmentId) {
            return { ...apt, status: 'accepted' };
          }
          return apt;
        });
        return { ...patient, appointments: updatedAppointments };
      }
      return patient;
    });
    localStorage.setItem('patients', JSON.stringify(updatedPatients));
    
    setTodaysAppointments(prev => prev.map(apt => 
      apt.id === appointmentId ? { ...apt, status: 'accepted' } : apt
    ));
    alert('Appointment accepted successfully!');
  };

  const handleRejectAppointment = (appointmentId) => {
    const allPatients = JSON.parse(localStorage.getItem('patients') || '[]');
    const updatedPatients = allPatients.map(patient => {
      if (patient.appointments) {
        const updatedAppointments = patient.appointments.map(apt => {
          if (apt.id === appointmentId) {
            return { ...apt, status: 'rejected', message: 'Your appointment request has been rejected. Please book for another time.' };
          }
          return apt;
        });
        return { ...patient, appointments: updatedAppointments };
      }
      return patient;
    });
    localStorage.setItem('patients', JSON.stringify(updatedPatients));
    
    setTodaysAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
    alert('Appointment rejected');
  };

  const totalPatientsToday = todaysAppointments.length;
  const totalPatientsThisWeek = doctorData?.treatmentHistory.slice(0, 7).reduce((sum, record) => sum + record.patientsCount, 0) || 0;

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
                <h1 className="text-2xl font-bold">{doctorData?.name || 'Doctor'}</h1>
                <p className="text-[#A0E7FF]">{doctorData?.department || doctorData?.specialization} - {doctorData?.hospital}</p>
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
            onClick={() => setActiveTab('overview')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-[#0066B2] to-[#00A8E8] text-white shadow-lg'
                : 'bg-white text-gray-700 hover:shadow-md'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
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

        {activeTab === 'overview' && (
          <>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 mb-1">Today's Appointments</p>
                    <p className="text-3xl font-bold text-[#0066B2]">{totalPatientsToday}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-[#0066B2] to-[#00A8E8] rounded-xl">
                    <Calendar className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 mb-1">This Week</p>
                    <p className="text-3xl font-bold text-[#00A8E8]">{totalPatientsThisWeek}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-[#00A8E8] to-[#40C9FF] rounded-xl">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 mb-1">Total Patients</p>
                    <p className="text-3xl font-bold text-[#40C9FF]">
                      {doctorData?.treatmentHistory.reduce((sum, record) => sum + record.patientsCount, 0) || 0}
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-[#40C9FF] to-[#A0E7FF] rounded-xl">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-[#00235B] mb-6">Treatment History</h2>
                <div className="space-y-3">
                  {doctorData?.treatmentHistory.map((record, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-300"
                    >
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-[#0066B2]" />
                        <span className="font-medium text-gray-700">{record.date}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-[#0066B2]">{record.patientsCount}</span>
                        <span className="text-gray-600">patients</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-[#00235B] mb-6">Today's Appointments</h2>

                {todaysAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {todaysAppointments.map((appointment, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-300">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-bold text-[#00235B]">{appointment.patientData.name}</h3>
                            <p className="text-sm text-gray-600">Date: {appointment.date}</p>
                            {appointment.symptoms && (
                              <p className="text-sm text-gray-600 mt-1">Symptoms: {appointment.symptoms}</p>
                            )}
                          </div>
                          {appointment.status === 'pending' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleAcceptAppointment(appointment.id)}
                                className="px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-all duration-300 flex items-center space-x-1"
                              >
                                <CheckCircle className="w-4 h-4" />
                                <span>Accept</span>
                              </button>
                              <button
                                onClick={() => handleRejectAppointment(appointment.id)}
                                className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-all duration-300 flex items-center space-x-1"
                              >
                                <XCircle className="w-4 h-4" />
                                <span>Reject</span>
                              </button>
                            </div>
                          )}
                          {appointment.status === 'accepted' && (
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                              Accepted
                            </span>
                          )}
                          {appointment.status === 'rejected' && (
                            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                              Rejected
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-600">Gender:</span>
                            <span className="ml-2 font-medium">{appointment.patientData.gender}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Age:</span>
                            <span className="ml-2 font-medium">{appointment.patientData.age}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Blood:</span>
                            <span className="ml-2 font-medium">{appointment.patientData.bloodGroup}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">BMI:</span>
                            <span className="ml-2 font-medium">{appointment.patientData.bmi}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedPatient(appointment.patientData)}
                          className="mt-3 w-full px-4 py-2 bg-gradient-to-r from-[#0066B2] to-[#00A8E8] text-white text-sm rounded-lg hover:shadow-lg transition-all duration-300"
                        >
                          View Full Details
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>No appointments scheduled for today</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'profile' && doctorData && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-[#00235B] mb-6">Doctor Profile</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-[#0066B2]" />
                  <span className="text-gray-900">{doctorData.name || 'N/A'}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-[#0066B2]" />
                  <span className="text-gray-900">{doctorData.email || userEmail || 'N/A'}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <Briefcase className="w-5 h-5 text-[#0066B2]" />
                  <span className="text-gray-900">{doctorData.specialization || 'N/A'}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Qualification</label>
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <Award className="w-5 h-5 text-[#0066B2]" />
                  <span className="text-gray-900">{doctorData.qualification || 'N/A'}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Experience (Years)</label>
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <Clock className="w-5 h-5 text-[#0066B2]" />
                  <span className="text-gray-900">{doctorData.experience || 0} years</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 text-[#0066B2]" />
                  <span className="text-gray-900">{doctorData.phoneNumber || 'N/A'}</span>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <Briefcase className="w-5 h-5 text-[#0066B2]" />
                  <span className="text-gray-900">{doctorData.departmentId || doctorData.department || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedPatient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedPatient(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-[#0066B2] to-[#00A8E8] p-6 text-white">
              <h2 className="text-2xl font-bold">Patient Details</h2>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Full Name</p>
                  <p className="font-semibold text-[#00235B]">{selectedPatient.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Gender</p>
                  <p className="font-semibold text-[#00235B]">{selectedPatient.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Age</p>
                  <p className="font-semibold text-[#00235B]">{selectedPatient.age} years</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">BMI</p>
                  <p className="font-semibold text-[#00235B]">{selectedPatient.bmi}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Blood Group</p>
                  <p className="font-semibold text-[#00235B]">{selectedPatient.bloodGroup}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Occupation</p>
                  <p className="font-semibold text-[#00235B]">{selectedPatient.occupation}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Religion</p>
                  <p className="font-semibold text-[#00235B]">{selectedPatient.religion || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Income</p>
                  <p className="font-semibold text-[#00235B]">{selectedPatient.income || 'Not specified'}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600 mb-1">Address</p>
                  <p className="font-semibold text-[#00235B]">{selectedPatient.address}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600 mb-1">Family Background Diseases</p>
                  <p className="font-semibold text-[#00235B]">{selectedPatient.familyDiseases || selectedPatient.familyBackgroundDiseases || 'None reported'}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#00235B] mb-4">Uploaded Documents</h3>
                {selectedPatient.documents && selectedPatient.documents.length > 0 ? (
                  <div className="space-y-3">
                    {selectedPatient.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-6 h-6 text-[#0066B2]" />
                          <div>
                            <p className="font-medium text-gray-800">{doc.name}</p>
                            <p className="text-sm text-gray-500">Uploaded on {doc.uploadDate}</p>
                          </div>
                        </div>
                        <button className="px-4 py-2 text-[#0066B2] hover:bg-[#0066B2] hover:text-white rounded-lg transition-colors duration-300">
                          View
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No documents uploaded</p>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
