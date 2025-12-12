import { useState, useEffect, useCallback } from 'react';
import {
  LogOut,
  User,
  Building2,
  TrendingUp,
  UserPlus,
  Clock,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Mail,
  Phone,
  MapPin,
  Search,
  Users,
  Activity
} from 'lucide-react';
import { validatePassword, validateRequired, validateEmail } from '../../utils/validation';
import api from '../../services/api'; // Import your API helper

const AdminDashboard = ({ userEmail, onLogout }) => {
  const [adminData, setAdminData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview');
  const [expandedDept, setExpandedDept] = useState(null);
  
  // Doctor Registration States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Filtering States (UI only for now)
  const [dateFilter, setDateFilter] = useState('');
  const [deptDateFilter, setDeptDateFilter] = useState('');
  
  // Availability States
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isAvailable, setIsAvailable] = useState(null);
  const [doctorSearchQuery, setDoctorSearchQuery] = useState('');
  
  const [doctorForm, setDoctorForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    specialization: '',
    qualification: '',
    experience: '',
    phoneNumber: '',
    departmentId: ''
  });

  const [availabilityForm, setAvailabilityForm] = useState({
    day: '',
    startTime: '',
    endTime: ''
  });

  // 1. Fetch Hospital Profile from Backend
  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/admin/hospital/profile');
      console.log("Hospital Profile Fetched:", response.data);
      setAdminData(response.data);
    } catch (error) {
      console.error("Failed to fetch profile", error);
      alert("Failed to load hospital data. Please log in again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Helper: Extract all doctors from the nested department structure (for Overview stats only)
  const getAllDoctors = () => {
    if (!adminData || !adminData.departments) return [];
    return adminData.departments.flatMap(dept => dept.doctors || []);
  };

  const getActiveDoctorsToday = () => {
    const doctors = getAllDoctors();
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
    
    return doctors.filter(doctor => {
      if (!doctor.availabilities) return false;
      const todaySlot = doctor.availabilities.find(slot => slot.dayOfWeek === today);
      return todaySlot && todaySlot.isAvailable;
    });
  };

  const getTotalPatients = () => {
    if (!adminData || !adminData.departments) return 0;
    return adminData.departments.reduce((sum, dept) => sum + (dept.totalPatients || 0), 0);
  };

  const getPatientsByDateRange = (startDate) => {
    if (!startDate) return getTotalPatients();
    return Math.floor(getTotalPatients() * 0.7); 
  };

  const validateDoctorForm = () => {
    const newErrors = {};
    if (!validateRequired(doctorForm.name)) newErrors.name = 'Name is required';
    if (!validateEmail(doctorForm.email)) newErrors.email = 'Valid email is required';
    
    const passwordValidation = validatePassword(doctorForm.password);
    if (!passwordValidation.valid) newErrors.password = passwordValidation.message;
    if (doctorForm.password !== doctorForm.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    if (!validateRequired(doctorForm.specialization)) newErrors.specialization = 'Specialization is required';
    if (!validateRequired(doctorForm.qualification)) newErrors.qualification = 'Qualification is required';
    if (!doctorForm.experience || Number(doctorForm.experience) < 0) newErrors.experience = 'Experience is required';
    if (!doctorForm.phoneNumber || !/^[0-9]{10}$/.test(doctorForm.phoneNumber)) newErrors.phoneNumber = 'Valid 10-digit phone number is required';
    if (!doctorForm.departmentId) newErrors.departmentId = 'Department is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 2. Register Doctor (Connected to Backend)
  const handleRegisterDoctor = async (e) => {
    e.preventDefault();
    if (validateDoctorForm()) {
      try {
        const payload = {
          name: doctorForm.name,
          email: doctorForm.email,
          password: doctorForm.password,
          specialization: doctorForm.specialization,
          qualification: doctorForm.qualification,
          experience: Number(doctorForm.experience),
          phoneNumber: doctorForm.phoneNumber,
          departmentId: Number(doctorForm.departmentId)
        };

        await api.post('/admin/doctor/register', payload);
        
        alert('Doctor registered successfully!');
        
        setDoctorForm({
          name: '', email: '', password: '', confirmPassword: '',
          specialization: '', qualification: '', experience: '',
          phoneNumber: '', departmentId: ''
        });
        setErrors({});
        fetchProfile();

      } catch (error) {
        console.error("Registration failed", error);
        const msg = error.response?.data?.message || "Failed to register doctor";
        setErrors({ email: msg });
      }
    }
  };

  // 3. Search Doctor (UPDATED to use Backend API)
  const handleSearchDoctor = async () => {
    if (!doctorSearchQuery) {
      alert("Please enter an email address");
      return;
    }

    try {
      // API Call: GET /api/admin/doctor/search?email=...
      const response = await api.get(`/admin/doctor/search?email=${doctorSearchQuery}`);
      
      if (response.data) {
        console.log("Doctor Found:", response.data);
        setSelectedDoctor(response.data);
        
        // Reset availability form
        setIsAvailable(null);
        setAvailabilityForm({ day: '', startTime: '', endTime: '' });
      }

    } catch (error) {
      console.error("Search failed", error);
      setSelectedDoctor(null);
      
      if (error.response && error.response.status === 404) {
        alert("No doctor found with this email address within your hospital.");
      } else {
        alert("An error occurred while searching. Please try again.");
      }
    }
  };

  // 4. Set Availability (Connected to Backend)
  const handleSetAvailability = async (e) => {
    e.preventDefault();

    if (!selectedDoctor) return alert('Please search and select a doctor first');
    if (isAvailable === null) return alert('Please select availability status');
    if (isAvailable && (!availabilityForm.day || !availabilityForm.startTime || !availabilityForm.endTime)) {
      return alert('Please fill all availability fields');
    }

    try {
      const payload = {
        doctorId: selectedDoctor.id,
        dayOfWeek: availabilityForm.day.toUpperCase(),
        isAvailable: isAvailable,
        startTime: isAvailable ? availabilityForm.startTime : null,
        endTime: isAvailable ? availabilityForm.endTime : null
      };

      await api.put('/admin/doctor/availability', payload);
      
      alert(`Availability updated successfully!`);
      
      setAvailabilityForm({ day: '', startTime: '', endTime: '' });
      setIsAvailable(null);
      fetchProfile(); // Refresh stats

    } catch (error) {
      console.error("Update failed", error);
      alert("Failed to update availability. Check console for details.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-[#00A8E8] font-bold text-xl flex flex-col items-center">
          <Activity className="w-10 h-10 animate-spin mb-4" />
          Loading Dashboard...
        </div>
      </div>
    );
  }

  const totalPatients = getTotalPatients();
  const totalDoctors = getAllDoctors().length;
  const activeDoctorsToday = getActiveDoctorsToday().length;
  const totalDepartments = adminData?.departments?.length || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-[#00A8E8] to-[#40C9FF] text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{adminData?.hospitalName || 'Hospital Dashboard'}</h1>
                <p className="text-white/80">{adminData?.location || adminData?.hospitalLocation}</p>
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
        {/* NAVIGATION TABS */}
        <div className="flex flex-wrap gap-4 mb-8">
          {[
            { id: 'profile', icon: User, label: 'Profile' },
            { id: 'overview', icon: TrendingUp, label: 'Overview' },
            { id: 'register', icon: UserPlus, label: 'Register Doctor' },
            { id: 'availability', icon: Clock, label: 'Set Availability' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                activeView === tab.id
                  ? 'bg-gradient-to-r from-[#00A8E8] to-[#40C9FF] text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:shadow-md'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* VIEW: PROFILE */}
        {activeView === 'profile' && adminData && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-[#00235B] mb-6">Hospital Profile</h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {adminData.logo && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hospital Logo</label>
                  <img src={adminData.logo} alt="Logo" className="w-32 h-32 object-contain border border-gray-300 rounded-lg" />
                </div>
              )}
              
              <ProfileItem icon={Building2} label="Hospital Name" value={adminData.hospitalName} />
              <ProfileItem icon={MapPin} label="Location" value={adminData.location || adminData.hospitalLocation} />
              <ProfileItem icon={Phone} label="Phone Number" value={adminData.phoneNumber || adminData.hospitalPhone} />
              <ProfileItem icon={Mail} label="Hospital Email" value={adminData.email || adminData.hospitalEmail} />
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Departments</label>
                <div className="grid md:grid-cols-3 gap-3">
                  {adminData.departments?.map((dept) => (
                    <div key={dept.id} className="p-3 bg-gradient-to-br from-[#00A8E8] to-[#40C9FF] text-white rounded-lg">
                      <Building2 className="w-5 h-5 mb-1" />
                      <span className="font-semibold">{dept.name?.replace(/_/g, ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: OVERVIEW */}
        {activeView === 'overview' && (
          <div>
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <StatCard label="Total Patients" value={totalPatients} icon={Users} color="#00A8E8" />
              <StatCard label="Total Doctors" value={totalDoctors} icon={UserPlus} color="#40C9FF" />
              <StatCard label="Active Doctors Today" value={activeDoctorsToday} icon={Activity} color="#0066B2" />
              <StatCard label="Departments" value={totalDepartments} icon={Building2} color="#00A8E8" />
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-[#00235B] mb-6">Department Statistics</h2>
              <div className="space-y-4">
                {adminData?.departments?.map((dept) => (
                  <div key={dept.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedDept(expandedDept === dept.name ? null : dept.name)}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors duration-300"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#00A8E8] to-[#40C9FF] rounded-lg flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-bold text-[#00235B]">{dept.name?.replace(/_/g, ' ')}</h3>
                          <p className="text-sm text-gray-600">Total Patients: {dept.totalPatients || 0}</p>
                        </div>
                      </div>
                      {expandedDept === dept.name ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                    </button>

                    {expandedDept === dept.name && (
                      <div className="p-6 bg-gray-50 border-t border-gray-200">
                        <h4 className="font-semibold text-gray-700 mb-4">Doctors in this Department</h4>
                        <div className="space-y-2 mb-4">
                          {dept.doctors && dept.doctors.length > 0 ? dept.doctors.map((doctor) => (
                            <div key={doctor.id} className="flex items-center justify-between p-3 bg-white rounded">
                              <span className="text-sm text-gray-700">{doctor.name}</span>
                              <span className="font-semibold text-[#00A8E8]">{doctor.specialization}</span>
                            </div>
                          )) : <p className="text-sm text-gray-500">No doctors registered yet.</p>}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW: REGISTER DOCTOR */}
        {activeView === 'register' && (
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-[#00235B] mb-6">Register New Doctor</h2>
            <form onSubmit={handleRegisterDoctor} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <InputGroup label="Name *" value={doctorForm.name} onChange={v => setDoctorForm({...doctorForm, name: v})} error={errors.name} placeholder="Doctor Name" />
                <InputGroup label="Email *" value={doctorForm.email} onChange={v => setDoctorForm({...doctorForm, email: v})} error={errors.email} placeholder="Doctor Email" type="email" />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} value={doctorForm.password} onChange={(e) => setDoctorForm({ ...doctorForm, password: e.target.value })} className="w-full px-4 py-3 border rounded-lg" placeholder="Password" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-500"><Eye className="w-5 h-5" /></button>
                  </div>
                  {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
                  <input type="password" value={doctorForm.confirmPassword} onChange={(e) => setDoctorForm({ ...doctorForm, confirmPassword: e.target.value })} className="w-full px-4 py-3 border rounded-lg" placeholder="Confirm Password" />
                  {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                </div>

                <InputGroup label="Specialization *" value={doctorForm.specialization} onChange={v => setDoctorForm({...doctorForm, specialization: v})} error={errors.specialization} placeholder="e.g. Cardiology" />
                <InputGroup label="Qualification *" value={doctorForm.qualification} onChange={v => setDoctorForm({...doctorForm, qualification: v})} error={errors.qualification} placeholder="e.g. MBBS, MD" />
                <InputGroup label="Experience (Years) *" value={doctorForm.experience} onChange={v => setDoctorForm({...doctorForm, experience: v})} error={errors.experience} placeholder="e.g. 5" type="number" />
                <InputGroup label="Phone Number *" value={doctorForm.phoneNumber} onChange={v => setDoctorForm({...doctorForm, phoneNumber: v})} error={errors.phoneNumber} placeholder="10-digit number" maxLength={10} />

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
                  <select
                    value={doctorForm.departmentId}
                    onChange={(e) => setDoctorForm({ ...doctorForm, departmentId: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00A8E8]"
                  >
                    <option value="">Select department</option>
                    {adminData?.departments?.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name?.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                  {errors.departmentId && <p className="mt-1 text-sm text-red-600">{errors.departmentId}</p>}
                </div>
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-[#00A8E8] to-[#40C9FF] text-white py-3 rounded-lg font-semibold hover:shadow-lg">Register Doctor</button>
            </form>
          </div>
        )}

        {/* VIEW: SET AVAILABILITY */}
        {activeView === 'availability' && (
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-[#00235B] mb-6">Set Doctor Availability</h2>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Doctor by Email *</label>
              <div className="flex space-x-2">
                <input
                  type="email"
                  value={doctorSearchQuery}
                  onChange={(e) => setDoctorSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-3 border rounded-lg"
                  placeholder="Enter doctor's email address"
                />
                <button type="button" onClick={handleSearchDoctor} className="px-6 py-3 bg-[#00A8E8] text-white rounded-lg"><Search className="w-5 h-5" /></button>
              </div>
            </div>

            {selectedDoctor && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="font-semibold text-[#00235B]">Selected: {selectedDoctor.name}</p>
                <p className="text-sm text-gray-600">Email: {selectedDoctor.email}</p>
              </div>
            )}

            {selectedDoctor && (
              <form onSubmit={handleSetAvailability} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Availability Status *</label>
                  <div className="flex space-x-4">
                    <button type="button" onClick={() => setIsAvailable(true)} className={`flex-1 px-4 py-3 rounded-lg font-semibold ${isAvailable === true ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}>Available</button>
                    <button type="button" onClick={() => setIsAvailable(false)} className={`flex-1 px-4 py-3 rounded-lg font-semibold ${isAvailable === false ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}>Not Available</button>
                  </div>
                </div>

                {isAvailable !== null && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Day *</label>
                      <select value={availabilityForm.day} onChange={(e) => setAvailabilityForm({ ...availabilityForm, day: e.target.value })} className="w-full px-4 py-3 border rounded-lg">
                        <option value="">Select day</option>
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    {isAvailable && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Start Time *</label>
                          <input type="time" value={availabilityForm.startTime} onChange={(e) => setAvailabilityForm({ ...availabilityForm, startTime: e.target.value })} className="w-full px-4 py-3 border rounded-lg" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">End Time *</label>
                          <input type="time" value={availabilityForm.endTime} onChange={(e) => setAvailabilityForm({ ...availabilityForm, endTime: e.target.value })} className="w-full px-4 py-3 border rounded-lg" />
                        </div>
                      </>
                    )}
                  </>
                )}
                <button type="submit" className="w-full bg-[#00A8E8] text-white py-3 rounded-lg font-semibold">Update Availability</button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const ProfileItem = ({ icon: Icon, label, value }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
      <Icon className="w-5 h-5 text-[#00A8E8]" />
      <span className="text-gray-900">{value || 'N/A'}</span>
    </div>
  </div>
);

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white rounded-xl shadow-lg p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 mb-1">{label}</p>
        <p className="text-3xl font-bold" style={{ color }}>{value}</p>
      </div>
      <div className="p-4 rounded-xl" style={{ backgroundColor: color, opacity: 0.9 }}>
        <Icon className="w-8 h-8 text-white" />
      </div>
    </div>
  </div>
);

const InputGroup = ({ label, value, onChange, error, type = "text", placeholder, maxLength }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00A8E8] ${error ? 'border-red-500' : 'border-gray-300'}`}
      placeholder={placeholder}
      maxLength={maxLength}
    />
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

export default AdminDashboard;