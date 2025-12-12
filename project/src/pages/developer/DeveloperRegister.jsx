import { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Code } from 'lucide-react';
import { validatePassword, validateRequired, validateEmail, validatePhone } from '../../utils/validation';
import { departments } from '../../utils/dummyData'; // Importing your UPPERCASE list
import api from '../../services/api';

const DeveloperRegister = ({ onBack }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    hospitalName: '',
    hospitalLocation: '',
    hospitalPhone: '',
    hospitalEmail: '',
    adminName: '', // Required by Backend
    adminEmail: '',
    adminPassword: '',
    confirmPassword: '',
    departments: [],
    hospitalLogo: ''
  });

  const validateForm = () => {
    const newErrors = {};

    if (!validateRequired(formData.hospitalName)) newErrors.hospitalName = 'Hospital name is required';
    // Backend likely requires min 3 chars, so "a" will fail
    else if (formData.hospitalName.length < 3) newErrors.hospitalName = 'Name must be at least 3 characters';

    if (!validateRequired(formData.hospitalLocation)) newErrors.hospitalLocation = 'Location is required';
    
    if (!validateRequired(formData.hospitalPhone)) {
      newErrors.hospitalPhone = 'Phone number is required';
    } else if (!validatePhone(formData.hospitalPhone)) {
      newErrors.hospitalPhone = 'Phone number must be 10 digits';
    }

    if (!validateRequired(formData.hospitalEmail)) {
        newErrors.hospitalEmail = 'Hospital email is required';
    } else if (!validateEmail(formData.hospitalEmail)) {
        newErrors.hospitalEmail = 'Invalid email';
    }

    if (!validateRequired(formData.adminName)) newErrors.adminName = 'Admin Name is required';

    if (!validateRequired(formData.adminEmail)) {
        newErrors.adminEmail = 'Admin email is required';
    } else if (!validateEmail(formData.adminEmail)) {
        newErrors.adminEmail = 'Invalid email';
    }

    const passwordValidation = validatePassword(formData.adminPassword);
    if (!passwordValidation.valid) {
      newErrors.adminPassword = passwordValidation.message;
    }

    if (formData.adminPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.departments || formData.departments.length === 0) {
      newErrors.departments = 'At least one department is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      // MAPPING: Frontend State Names -> Backend DTO Names
      const payload = {
        hospitalName: formData.hospitalName,
        location: formData.hospitalLocation,      // Map to 'location'
        phoneNumber: formData.hospitalPhone,      // Map to 'phoneNumber'
        email: formData.hospitalEmail,            // Map to 'email'
        adminName: formData.adminName,
        adminEmail: formData.adminEmail,
        adminPassword: formData.adminPassword,
        departments: formData.departments         // Sends ["CARDIOLOGY", "GENERAL_MEDICINE", etc.]
      };

      const response = await api.post('/developer/hospital/register', payload);

      setSuccessMessage(`Success! ${response.data.message || 'Hospital registered successfully'}`);
      
      // Clear form
      setFormData({
        hospitalName: '',
        hospitalLocation: '',
        hospitalPhone: '',
        hospitalEmail: '',
        adminName: '',
        adminEmail: '',
        adminPassword: '',
        confirmPassword: '',
        departments: [],
        hospitalLogo: ''
      });
      setErrors({});
      setTimeout(() => setSuccessMessage(''), 5000);

    } catch (error) {
      console.error("Registration Error:", error);
      // Try to extract the specific error message from the backend response
      const serverMsg = error.response?.data?.message || error.response?.data?.error || "Registration failed.";
      
      // Display it in the error area (using adminEmail field as a generic place if needed, or a general alert)
      setErrors({ 
          adminEmail: serverMsg 
      });
      // Also show as global alert just in case
      alert(`Registration Failed: ${serverMsg}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00235B] via-[#0066B2] to-[#00A8E8] py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <button onClick={onBack} className="flex items-center text-white hover:text-[#A0E7FF] mb-6">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back
        </button>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#00A8E8] to-[#40C9FF] p-8 text-center">
            <div className="inline-flex p-4 bg-white/20 rounded-full mb-4">
              <Code className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">Developer Portal</h1>
            <p className="text-white/80 mt-2">Register Hospital Administrators</p>
          </div>

          <div className="p-8">
            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-6">
              
              {/* HOSPITAL SECTION */}
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-xl font-bold text-[#00235B] mb-4">Hospital Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hospital Name *</label>
                    <input
                      type="text"
                      value={formData.hospitalName}
                      onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00A8E8]"
                      placeholder="Enter hospital name"
                    />
                    {errors.hospitalName && <p className="text-sm text-red-600 mt-1">{errors.hospitalName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hospital Location *</label>
                    <input
                      type="text"
                      value={formData.hospitalLocation}
                      onChange={(e) => setFormData({ ...formData, hospitalLocation: e.target.value })}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00A8E8]"
                      placeholder="Enter hospital location"
                    />
                    {errors.hospitalLocation && <p className="text-sm text-red-600 mt-1">{errors.hospitalLocation}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hospital Phone Number *</label>
                    <input
                      type="text"
                      value={formData.hospitalPhone}
                      onChange={(e) => setFormData({ ...formData, hospitalPhone: e.target.value })}
                      maxLength="10"
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00A8E8]"
                      placeholder="10-digit phone number"
                    />
                    {errors.hospitalPhone && <p className="text-sm text-red-600 mt-1">{errors.hospitalPhone}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hospital Email *</label>
                    <input
                      type="email"
                      value={formData.hospitalEmail}
                      onChange={(e) => setFormData({ ...formData, hospitalEmail: e.target.value })}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00A8E8]"
                      placeholder="hospital@example.com"
                    />
                    {errors.hospitalEmail && <p className="text-sm text-red-600 mt-1">{errors.hospitalEmail}</p>}
                  </div>
                </div>
              </div>

              {/* DEPARTMENTS SECTION - Now Dynamic! */}
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-xl font-bold text-[#00235B] mb-4">Departments</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Departments * (Select one or more)
                  </label>
                  <div className="grid md:grid-cols-2 gap-3">
                    {/* Iterating over the imported variable 'departments' */}
                    {departments.map((dept) => (
                      <label
                        key={dept}
                        className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-all ${
                          formData.departments?.includes(dept)
                            ? 'border-[#00A8E8] bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.departments?.includes(dept)}
                          onChange={(e) => {
                            const depts = formData.departments || [];
                            if (e.target.checked) {
                              setFormData({ ...formData, departments: [...depts, dept] });
                            } else {
                              setFormData({ ...formData, departments: depts.filter(d => d !== dept) });
                            }
                          }}
                          className="w-4 h-4 text-[#00A8E8] focus:ring-[#00A8E8] border-gray-300 rounded"
                        />
                        {/* Display Logic: Replace underscores with spaces for readability */}
                        <span className="text-sm font-medium text-gray-700">
                            {dept.replace(/_/g, ' ')}
                        </span>
                      </label>
                    ))}
                  </div>
                  {errors.departments && <p className="mt-2 text-sm text-red-600">{errors.departments}</p>}
                </div>
              </div>

              {/* ADMIN SECTION */}
              <div>
                <h2 className="text-xl font-bold text-[#00235B] mb-4">Admin Credentials</h2>
                <div className="space-y-4">
                  
                  {/* NEW FIELD: Admin Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Admin Name *</label>
                    <input
                      type="text"
                      value={formData.adminName}
                      onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00A8E8]"
                      placeholder="Admin Full Name"
                    />
                    {errors.adminName && <p className="text-sm text-red-600 mt-1">{errors.adminName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Admin Email *</label>
                    <input
                      type="email"
                      value={formData.adminEmail}
                      onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00A8E8]"
                      placeholder="admin@hospital.com"
                    />
                    {errors.adminEmail && <p className="text-sm text-red-600 mt-1">{errors.adminEmail}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Admin Password *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.adminPassword}
                        onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00A8E8]"
                        placeholder="Create admin password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.adminPassword && <p className="text-sm text-red-600 mt-1">{errors.adminPassword}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00A8E8]"
                        placeholder="Confirm admin password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#00A8E8] to-[#40C9FF] text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
              >
                Register Admin
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeveloperRegister;