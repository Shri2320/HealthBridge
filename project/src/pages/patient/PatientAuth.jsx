import { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { validatePassword, validateRequired, validateAge, validateBMI, validateEmail } from '../../utils/validation';
import { bloodGroups, genderOptions, religionOptions, dummyCredentials } from '../../utils/dummyData';
import api from '../../services/api';

const PatientAuth = ({ onBack, onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [backendMessage, setBackendMessage] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    gender: '',
    age: '',
    bmi: '',
    address: '',
    bloodGroup: '',
    income: '',
    religion: '',
    occupation: '',
    familyBackgroundDiseases: '',
    password: '',
    confirmPassword: ''
  });

  const [forgotData, setForgotData] = useState({
    email: '',
    newPassword: '',
    confirmPassword: '',
    otp: ''
  });

  const resetErrors = () => {
    setErrors({});
    setBackendMessage('');
  };

  const validateLoginForm = () => {
    const newErrors = {};

    if (!validateRequired(loginData.email) || !validateEmail(loginData.email)) {
      newErrors.email = 'Valid email is required';
    }

    if (!validateRequired(loginData.password)) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegisterForm = () => {
    const newErrors = {};

    if (!validateRequired(registerData.name) || registerData.name.trim().length < 2 || registerData.name.trim().length > 100) {
      newErrors.name = 'Name must be between 2 and 100 characters';
    }

    if (!validateEmail(registerData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!registerData.gender) {
      newErrors.gender = 'Gender is required';
    }

    const age = parseInt(registerData.age, 10);
    if (!registerData.age || !validateAge(age)) {
      newErrors.age = 'Please enter a valid age (1-150)';
    }

    const bmi = parseFloat(registerData.bmi);
    if (!registerData.bmi || !validateBMI(bmi)) {
      newErrors.bmi = 'BMI must be between 10.0 and 60.0';
    }

    if (!validateRequired(registerData.address)) {
      newErrors.address = 'Address is required';
    }

    if (!registerData.bloodGroup) {
      newErrors.bloodGroup = 'Blood group is required';
    }

    if (registerData.income === '' || Number(registerData.income) < 0) {
      newErrors.income = 'Income must be 0 or greater';
    }

    if (!validateRequired(registerData.religion)) {
      newErrors.religion = 'Religion is required';
    }

    if (!validateRequired(registerData.occupation)) {
      newErrors.occupation = 'Occupation is required';
    }

    const passwordValidation = validatePassword(registerData.password);
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.message;
    }

    if (registerData.password !== registerData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForgotPassword = () => {
    const newErrors = {};

    if (!validateEmail(forgotData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    const passwordValidation = validatePassword(forgotData.newPassword);
    if (!passwordValidation.valid) {
      newErrors.newPassword = passwordValidation.message;
    }

    if (forgotData.newPassword !== forgotData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!otpSent) {
      newErrors.otp = 'Please request OTP first';
    } else if (!forgotData.otp) {
      newErrors.otp = 'Enter the OTP sent to your email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateLoginForm()) return;

    try {
      setErrors({});
      const response = await api.post('/patient/login', {
        email: loginData.email,
        password: loginData.password,
      });

      const { token, patientId, name, message } = response.data || {};
      if (token) localStorage.setItem('token', token);
      if (loginData.email) localStorage.setItem('currentPatient', loginData.email);
      onLogin(loginData.email);
    } catch (error) {
      setErrors({ general: error.response?.data?.message || 'Invalid email or password' });
    }
  };

 const handleRegister = async (e) => {
  e.preventDefault();
  if (!validateRegisterForm()) return;

  try {
    setRegisterLoading(true);
    const payload = {
      name: registerData.name,
      email: registerData.email,
      gender: registerData.gender,
      age: Number(registerData.age),
      bodyMassIndex: Number(registerData.bmi),
      address: registerData.address,
      bloodGroup: registerData.bloodGroup,
      income: Number(registerData.income),
      religion: registerData.religion,
      occupation: registerData.occupation,
      familyBackgroundDiseases: registerData.familyBackgroundDiseases,
      password: registerData.password,
      confirmPassword: registerData.confirmPassword,
    };

    const response = await api.post('/patient/register', payload);

    const { token, patientId, message } = response.data || {};
    // Do NOT auto-login; just inform and switch to login tab
    setBackendMessage(message || 'Registered successfully. Please log in to continue.');
    setIsLogin(true);
    setShowForgotPassword(false);
    setLoginData({ email: registerData.email || '', password: '' });
    // Optionally clear registration form
    setRegisterData({
      name: '',
      email: '',
      gender: '',
      age: '',
      bmi: '',
      address: '',
      bloodGroup: '',
      income: '',
      religion: '',
      occupation: '',
      familyBackgroundDiseases: '',
      password: '',
      confirmPassword: ''
    });
  } catch (error) {
    setErrors({ general: error.response?.data?.message || 'Registration failed' });
  } finally {
    setRegisterLoading(false);
  }
};


  const handleSendOtp = () => {
    const storedPatients = JSON.parse(localStorage.getItem('patients') || '[]');
    const patientExists = storedPatients.some(
      (p) => p.email?.toLowerCase() === forgotData.email.toLowerCase() || p.username?.toLowerCase() === forgotData.email.toLowerCase()
    );

    if (!patientExists) {
      setErrors({ email: 'No account found for this email' });
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    setOtpSent(true);
    setBackendMessage('OTP sent to your email (simulated backend response).');
  };

  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    setBackendMessage('');
    if (!validateForgotPassword()) return;

    if (forgotData.otp !== generatedOtp) {
      setErrors({ otp: 'Invalid OTP. Please check your email.' });
      return;
    }

    const storedPatients = JSON.parse(localStorage.getItem('patients') || '[]');
    const updatedPatients = storedPatients.map((p) => {
      if (p.email?.toLowerCase() === forgotData.email.toLowerCase() || p.username?.toLowerCase() === forgotData.email.toLowerCase()) {
        return { ...p, password: forgotData.newPassword };
      }
      return p;
    });

    localStorage.setItem('patients', JSON.stringify(updatedPatients));
    setBackendMessage('Your password has been updated successfully (backend confirmation).');
    setErrors({});
    setForgotData({
      email: '',
      newPassword: '',
      confirmPassword: '',
      otp: ''
    });
    setOtpSent(false);
    setGeneratedOtp('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00235B] via-[#0066B2] to-[#00A8E8] py-8 px-4">
      <div className={`container mx-auto ${isLogin ? 'max-w-xl' : 'max-w-4xl'}`}>
        <button
          onClick={onBack}
          className="flex items-center text-white hover:text-[#A0E7FF] transition-colors duration-300 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#00235B] to-[#0066B2] p-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">
              {isLogin ? (showForgotPassword ? 'Reset Password' : 'Patient Login') : 'Patient Registration'}
            </h1>
            <p className="text-[#A0E7FF]">
              {isLogin
                ? showForgotPassword
                  ? 'Securely update your password using email + OTP'
                  : 'Welcome back! Please login to continue'
                : 'Create your account to get started'}
            </p>
          </div>

          <div className="p-8">
            {errors.general && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {errors.general}
              </div>
            )}

            {backendMessage && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-start space-x-2">
                <ShieldCheck className="w-5 h-5 mt-0.5" />
                <span>{backendMessage}</span>
              </div>
            )}

            {isLogin ? (
              showForgotPassword ? (
                <form onSubmit={handleForgotPasswordSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                      <input
                        type="email"
                        value={forgotData.email}
                        onChange={(e) => {
                          resetErrors();
                          setForgotData({ ...forgotData, email: e.target.value });
                        }}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0066B2] focus:border-transparent transition-all ${
                          errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter your registered email"
                      />
                      {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">New Password *</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={forgotData.newPassword}
                          onChange={(e) => {
                            resetErrors();
                            setForgotData({ ...forgotData, newPassword: e.target.value });
                          }}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0066B2] focus:border-transparent transition-all ${
                            errors.newPassword ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={forgotData.confirmPassword}
                          onChange={(e) => {
                            resetErrors();
                            setForgotData({ ...forgotData, confirmPassword: e.target.value });
                          }}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0066B2] focus:border-transparent transition-all ${
                            errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                    </div>

                    <div className="md:col-span-2 flex flex-col md:flex-row md:items-center md:space-x-3 space-y-3 md:space-y-0">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">OTP *</label>
                        <input
                          type="text"
                          value={forgotData.otp}
                          onChange={(e) => {
                            resetErrors();
                            setForgotData({ ...forgotData, otp: e.target.value });
                          }}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0066B2] focus:border-transparent transition-all ${
                            errors.otp ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter OTP received via email"
                        />
                        {errors.otp && <p className="mt-1 text-sm text-red-600">{errors.otp}</p>}
                      </div>

                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-[#0066B2] to-[#00A8E8] text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                      >
                        {otpSent ? 'Resend OTP' : 'Send OTP'}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(false);
                        resetErrors();
                        setForgotData({ email: '', newPassword: '', confirmPassword: '', otp: '' });
                        setOtpSent(false);
                      }}
                      className="text-sm text-[#0066B2] hover:text-[#00235B] font-medium"
                    >
                      ← Back to login
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#0066B2] to-[#00A8E8] text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
                  >
                    Update Password
                  </button>
                </form>
              ) : (
                <form onSubmit={handleLogin} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
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

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(true);
                        resetErrors();
                      }}
                      className="text-sm text-[#0066B2] hover:text-[#00235B] font-medium"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#0066B2] to-[#00A8E8] text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
                  >
                    Login
                  </button>

                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setIsLogin(false);
                          setShowForgotPassword(false);
                          resetErrors();
                        }}
                        className="text-[#0066B2] hover:text-[#00235B] font-semibold"
                      >
                        Register
                      </button>
                    </p>
                  </div>

                  <p className="text-center text-xs text-gray-500">Demo credentials: patient1@example.com / Patient@123</p>
                </form>
              )
            ) : (
              <form onSubmit={handleRegister} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      value={registerData.name}
                      onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0066B2] focus:border-transparent transition-all ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your full name"
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0066B2] focus:border-transparent transition-all ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your email"
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                    <select
                      value={registerData.gender}
                      onChange={(e) => setRegisterData({ ...registerData, gender: e.target.value })}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0066B2] focus:border-transparent transition-all ${
                        errors.gender ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select gender</option>
                      {genderOptions.map((gender) => (
                        <option key={gender} value={gender}>
                          {gender}
                        </option>
                      ))}
                    </select>
                    {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Age *</label>
                    <input
                      type="number"
                      value={registerData.age}
                      onChange={(e) => setRegisterData({ ...registerData, age: e.target.value })}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0066B2] focus:border-transparent transition-all ${
                        errors.age ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your age"
                      min="1"
                      max="150"
                    />
                    {errors.age && <p className="mt-1 text-sm text-red-600">{errors.age}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Body Mass Index *</label>
                    <input
                      type="number"
                      step="0.1"
                      value={registerData.bmi}
                      onChange={(e) => setRegisterData({ ...registerData, bmi: e.target.value })}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0066B2] focus:border-transparent transition-all ${
                        errors.bmi ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your BMI"
                      min="10"
                      max="60"
                    />
                    {errors.bmi && <p className="mt-1 text-sm text-red-600">{errors.bmi}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group *</label>
                    <select
                      value={registerData.bloodGroup}
                      onChange={(e) => setRegisterData({ ...registerData, bloodGroup: e.target.value })}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0066B2] focus:border-transparent transition-all ${
                        errors.bloodGroup ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select blood group</option>
                      {bloodGroups.map((group) => (
                        <option key={group} value={group}>
                          {group}
                        </option>
                      ))}
                    </select>
                    {errors.bloodGroup && <p className="mt-1 text-sm text-red-600">{errors.bloodGroup}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                    <textarea
                      value={registerData.address}
                      onChange={(e) => setRegisterData({ ...registerData, address: e.target.value })}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0066B2] focus:border-transparent transition-all ${
                        errors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your address"
                      rows={2}
                    />
                    {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Income *</label>
                    <input
                      type="number"
                      min="0"
                      value={registerData.income}
                      onChange={(e) => setRegisterData({ ...registerData, income: e.target.value })}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0066B2] focus:border-transparent transition-all ${
                        errors.income ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your income"
                    />
                    {errors.income && <p className="mt-1 text-sm text-red-600">{errors.income}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Religion *</label>
                    <select
                      value={registerData.religion}
                      onChange={(e) => setRegisterData({ ...registerData, religion: e.target.value })}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0066B2] focus:border-transparent transition-all ${
                        errors.religion ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select religion</option>
                      {religionOptions.map((religion) => (
                        <option key={religion} value={religion}>
                          {religion}
                        </option>
                      ))}
                    </select>
                    {errors.religion && <p className="mt-1 text-sm text-red-600">{errors.religion}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Occupation *</label>
                    <input
                      type="text"
                      value={registerData.occupation}
                      onChange={(e) => setRegisterData({ ...registerData, occupation: e.target.value })}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0066B2] focus:border-transparent transition-all ${
                        errors.occupation ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your occupation"
                    />
                    {errors.occupation && <p className="mt-1 text-sm text-red-600">{errors.occupation}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Family Background Diseases (optional)</label>
                    <input
                      type="text"
                      value={registerData.familyBackgroundDiseases}
                      onChange={(e) => setRegisterData({ ...registerData, familyBackgroundDiseases: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066B2] focus:border-transparent transition-all"
                      placeholder="e.g., Diabetes, Hypertension"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0066B2] focus:border-transparent transition-all ${
                          errors.password ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Create a password"
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0066B2] focus:border-transparent transition-all ${
                          errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={registerLoading}
                  className={`w-full bg-gradient-to-r from-[#0066B2] to-[#00A8E8] text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 ${registerLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {registerLoading ? 'Registering...' : 'Register'}
                </button>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setIsLogin(true);
                        setShowForgotPassword(false);
                        resetErrors();
                      }}
                      className="text-[#0066B2] hover:text-[#00235B] font-semibold"
                    >
                      Login
                    </button>
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientAuth;