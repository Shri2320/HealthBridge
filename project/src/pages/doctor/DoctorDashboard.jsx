import { useState, useEffect } from 'react';
import { LogOut, User, Calendar, TrendingUp, FileText, Users, UserCircle2, Mail, Phone, Briefcase, Award, Clock, CheckCircle, XCircle } from 'lucide-react';
import api from '../../services/api';

const DoctorDashboard = ({ userEmail, onLogout }) => {
  const [doctorData, setDoctorData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch doctor profile from backend
  useEffect(() => {
    const fetchDoctorProfile = async () => {
      try {
        const doctor = JSON.parse(localStorage.getItem('currentDoctor'));
        if (doctor) setDoctorData(doctor);

        // Optionally fetch updated profile from backend
        const response = await api.get('/doctor/profile');
        setDoctorData(response.data);
      } catch (error) {
        console.error('Failed to fetch doctor profile:', error);
      }
    };

    fetchDoctorProfile();
  }, []);

  const statusFromOrdinal = (val) => {
    if (typeof val === 'number') {
      const map = ['SCHEDULED', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED'];
      return map[val] || 'SCHEDULED';
    }
    return val;
  };

  const normalizeAppointments = (list = []) =>
    list.map((a, idx) => {
      const realId = a.id
        ?? a.appointmentId
        ?? a.appointmentID
        ?? a.appointment_id
        ?? a.appointmentid
        ?? a.ref
        ?? a.referenceId
        ?? a.reference;
      return {
        ...a,
        status: statusFromOrdinal(a.status),
        _realId: realId,
        _key: realId ?? `appt-${idx}`
      };
    });

  // Fetch appointments from backend
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await api.get('/doctor/appointments');
        setAppointments(normalizeAppointments(response.data));
      } catch (error) {
        console.error('Failed to fetch appointments:', error);
      }
    };

    fetchAppointments();
  }, []);

  // Accept appointment via backend
  const handleAcceptAppointment = async (appointmentId) => {
    if (!appointmentId) {
      alert('Appointment id is missing.');
      return;
    }
    try {
      console.log('Accepting appointment', appointmentId);
      await api.put(`/doctor/appointments/${appointmentId}/status`, null, {
        params: { status: 'ACCEPTED' }
      });
      // Refresh to keep in sync with backend (counts + status)
      const response = await api.get('/doctor/appointments');
      setAppointments(normalizeAppointments(response.data));
      alert('Appointment accepted successfully!');
    } catch (error) {
      console.error('Failed to accept appointment:', error.response || error);
      alert(error.response?.data?.message || 'Failed to accept appointment');
    }
  };

  // Reject appointment via backend
  const handleRejectAppointment = async (appointmentId) => {
    if (!appointmentId) {
      alert('Appointment id is missing.');
      return;
    }
    try {
      console.log('Rejecting appointment', appointmentId);
      await api.put(`/doctor/appointments/${appointmentId}/status`, null, {
        params: { status: 'REJECTED' }
      });
      const response = await api.get('/doctor/appointments');
      setAppointments(normalizeAppointments(response.data));
      alert('Appointment rejected');
    } catch (error) {
      console.error('Failed to reject appointment:', error.response || error);
      alert(error.response?.data?.message || 'Failed to reject appointment');
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todaysAppointments = appointments.filter(a => (a.date || '').toString().startsWith(todayStr));
  const todaysAccepted = todaysAppointments.filter(a => (a.status || '').toString().toUpperCase() === 'ACCEPTED');
  const totalAccepted = appointments.filter(a => (a.status || '').toString().toUpperCase() === 'ACCEPTED').length;
  const totalPatientsToday = todaysAccepted.length; // accepted today
  const totalPatients = totalAccepted; // accepted overall
  const totalPatientsThisWeek = doctorData?.treatmentHistory?.slice(0, 7).reduce((sum, record) => sum + record.patientsCount, 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#00235B] to-[#0066B2] text-white shadow-lg">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
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

      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${activeTab === 'overview' ? 'bg-gradient-to-r from-[#0066B2] to-[#00A8E8] text-white shadow-lg' : 'bg-white text-gray-700 hover:shadow-md'}`}
          >
            <TrendingUp className="w-5 h-5" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${activeTab === 'profile' ? 'bg-gradient-to-r from-[#0066B2] to-[#00A8E8] text-white shadow-lg' : 'bg-white text-gray-700 hover:shadow-md'}`}
          >
            <UserCircle2 className="w-5 h-5" />
            <span>Profile</span>
          </button>
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6 flex items-center justify-between">
                <div>
                  <p className="text-gray-600 mb-1">Today's Appointments</p>
                  <p className="text-3xl font-bold text-[#0066B2]">{totalPatientsToday}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-[#0066B2] to-[#00A8E8] rounded-xl">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 flex items-center justify-between">
                <div>
                  <p className="text-gray-600 mb-1">Appointments (All)</p>
                  <p className="text-3xl font-bold text-[#00A8E8]">{totalPatients}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-[#00A8E8] to-[#40C9FF] rounded-xl">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 flex items-center justify-between">
                <div>
                  <p className="text-gray-600 mb-1">Total Patients</p>
                  <p className="text-3xl font-bold text-[#40C9FF]">{doctorData?.treatmentHistory?.reduce((sum, r) => sum + r.patientsCount, 0) || 0}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-[#40C9FF] to-[#A0E7FF] rounded-xl">
                  <Users className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            {/* Appointments */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-[#00235B] mb-6">Appointments</h2>
              {appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments.map((appointment, idx) => {
                    const apptId = appointment._realId;
                    const apptKey = appointment._key || apptId || idx;
                    const statusUpper = (appointment.status || '').toString().toUpperCase();
                    const isPending = !statusUpper || statusUpper === 'SCHEDULED' || statusUpper === 'PENDING';
                    return (
                    <div key={apptKey} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-300">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-[#00235B]">{appointment.patientName || appointment.patientData?.name}</h3>
                          <p className="text-[11px] text-gray-400">Ref: {apptId ?? 'n/a'}</p>
                          <p className="text-sm text-gray-600">Date: {appointment.date}</p>
                          <p className="text-sm text-gray-600">Time: {appointment.time}</p>
                          {appointment.symptoms && <p className="text-sm text-gray-600 mt-1">Symptoms: {appointment.symptoms}</p>}
                          {appointment.documents && appointment.documents.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm font-semibold text-gray-700 mb-1">Documents:</p>
                              <div className="flex flex-wrap gap-2">
                                {appointment.documents.map((doc) => (
                                  <button
                                    key={doc.id || doc.filePath}
                                    onClick={() => {
                                      const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
                                      const url = base.replace(/\/api$/, '') + `/uploads/${doc.filePath}`;
                                      window.open(url, '_blank');
                                    }}
                                    className="px-3 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200 text-[#0066B2]"
                                  >
                                    {doc.fileName || doc.filePath || 'Document'}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Status Buttons */}
                        {isPending && (
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              disabled={!apptId}
                              onClick={() => apptId && handleAcceptAppointment(apptId)}
                              className={`px-4 py-2 text-sm rounded-lg flex items-center space-x-1 ${apptId ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
                              title={apptId ? '' : 'Missing appointment id'}
                            >
                              <CheckCircle className="w-4 h-4" />
                              <span>Accept</span>
                            </button>
                            <button
                              type="button"
                              disabled={!apptId}
                              onClick={() => apptId && handleRejectAppointment(apptId)}
                              className={`px-4 py-2 text-sm rounded-lg flex items-center space-x-1 ${apptId ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
                              title={apptId ? '' : 'Missing appointment id'}
                            >
                              <XCircle className="w-4 h-4" />
                              <span>Reject</span>
                            </button>
                          </div>
                        )}
                        {statusUpper === 'ACCEPTED' && (
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Accepted</span>
                        )}
                        {statusUpper === 'REJECTED' && (
                          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">Rejected</span>
                        )}
                      </div>
                    </div>
                  );})}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>No appointments scheduled for today</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && doctorData && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-[#00235B] mb-6">Doctor Profile</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Name</label><div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg"><User className="w-5 h-5 text-[#0066B2]" /><span className="text-gray-900">{doctorData.name}</span></div></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Email</label><div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg"><Mail className="w-5 h-5 text-[#0066B2]" /><span className="text-gray-900">{doctorData.email}</span></div></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label><div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg"><Briefcase className="w-5 h-5 text-[#0066B2]" /><span className="text-gray-900">{doctorData.specialization}</span></div></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Qualification</label><div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg"><Award className="w-5 h-5 text-[#0066B2]" /><span className="text-gray-900">{doctorData.qualification}</span></div></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Experience</label><div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg"><Clock className="w-5 h-5 text-[#0066B2]" /><span className="text-gray-900">{doctorData.experience} years</span></div></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Phone</label><div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg"><Phone className="w-5 h-5 text-[#0066B2]" /><span className="text-gray-900">{doctorData.phoneNumber}</span></div></div>
              <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-2">Department</label><div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg"><Briefcase className="w-5 h-5 text-[#0066B2]" /><span className="text-gray-900">{doctorData.department || doctorData.departmentId}</span></div></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
