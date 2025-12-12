import { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Stethoscope } from 'lucide-react';
import { validateRequired, validateEmail } from '../../utils/validation';
import { dummyCredentials } from '../../utils/dummyData';

const DoctorLogin = ({ onBack, onLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const validateForm = () => {
    const newErrors = {};

    if (!validateRequired(loginData.email)) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(loginData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!validateRequired(loginData.password)) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const storedDoctors = JSON.parse(localStorage.getItem('doctors') || '[]');
      let doctor = storedDoctors.find(
        (d) => d.email?.toLowerCase() === loginData.email.toLowerCase() && d.password === loginData.password
      );

      // If not found in localStorage, check dummy credentials
      if (!doctor) {
        const demoDoctor = dummyCredentials.doctors.find(
          (d) => d.email?.toLowerCase() === loginData.email.toLowerCase() && d.password === loginData.password
        );
        
        if (demoDoctor) {
          // Create doctor object from demo credentials
          doctor = {
            email: demoDoctor.email,
            name: demoDoctor.username === 'dr.smith' ? 'Dr. John Smith' : 'Dr. Sarah Wilson',
            specialization: 'Cardiology',
            qualification: 'MBBS, MD',
            experience: 10,
            phoneNumber: '1234567890',
            departmentId: 'Cardiology',
            department: 'Cardiology',
            hospital: 'City General Hospital',
            password: demoDoctor.password,
            appointments: [],
            treatmentHistory: [
              { date: '2024-12-10', patientsCount: 12 },
              { date: '2024-12-09', patientsCount: 15 },
              { date: '2024-12-08', patientsCount: 10 }
            ]
          };
          
          // Save to localStorage for future use
          storedDoctors.push(doctor);
          localStorage.setItem('doctors', JSON.stringify(storedDoctors));
        }
      }

      if (doctor) {
        localStorage.setItem('currentDoctor', doctor.email);
        onLogin(doctor.email);
      } else {
        setErrors({ general: 'Invalid email or password' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00235B] via-[#0066B2] to-[#00A8E8] py-8 px-4">
      <div className="container mx-auto max-w-md">
        <button
          onClick={onBack}
          className="flex items-center text-white hover:text-[#A0E7FF] transition-colors duration-300 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#0066B2] to-[#00A8E8] p-8 text-center">
            <div className="inline-flex p-4 bg-white/20 rounded-full mb-4">
              <Stethoscope className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">Doctor Login</h1>
            <p className="text-[#A0E7FF] mt-2">Access your dashboard</p>
          </div>

          <div className="p-8">
            {errors.general && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0066B2] focus:border-transparent transition-all ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0066B2] focus:border-transparent transition-all ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#0066B2] to-[#00A8E8] text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
              >
                Login
              </button>

              <p className="text-center text-sm text-gray-600">
                Demo credentials: dr.smith@hospital.com / Doctor@123
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorLogin;

