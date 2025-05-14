// src/components/TechnicianSignUp.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { EyeIcon, EyeSlashIcon, EnvelopeIcon, UserIcon, WrenchScrewdriverIcon, CakeIcon } from '@heroicons/react/24/outline';

function TechnicianSignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [age, setAge] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) setEmailError('Email is required');
    else if (!emailRegex.test(value)) setEmailError('Invalid email format');
    else setEmailError('');
  };

  const validatePasswords = () => {
    if (!password || !confirmPassword) {
      setPasswordError('Both password fields are required');
      return false;
    } else if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return false;
    }else
    setPasswordError('');
    return true;
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    validateEmail(value);
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    validatePasswords();
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    validatePasswords();
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const isPasswordValid = validatePasswords();
    if (
      emailError ||
      !isPasswordValid ||
      !email ||
      !password ||
      !confirmPassword ||
      !name ||
      !specialization ||
      !age
    ) {
      setError('Please fill all fields correctly and ensure passwords match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        userId: user.uid,
        email: email,
        category: 'technician',
        name: name,
        specialization: specialization,
        age: Number(age),
        createdAt: new Date().toISOString(),
      });

      alert('Registered successfully!');
      navigate('/technician-home');    } catch (err) {
      console.error('Error during registration:', err);
      
      // Provide more specific error messages
      let errorMessage = 'Registration failed: ';
      
      if (err.code) {
        switch (err.code) {
          case 'auth/email-already-in-use':
            errorMessage += 'This email is already registered. Please use a different email or try logging in.';
            break;
          case 'auth/invalid-email':
            errorMessage += 'The email address is not valid.';
            break;
          case 'auth/weak-password':
            errorMessage += 'The password is too weak. Please use a stronger password.';
            break;
          case 'permission-denied':
            errorMessage += 'Permission denied. You may not have the required access rights.';
            break;
          default:
            errorMessage += err.message;
        }
      } else {
        errorMessage += err.message || 'Unknown error occurred.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full animate-fade-in py-6">
      <h2 className="text-4xl font-bold text-gray-800 mb-6 font-[Poppins] tracking-wide text-center animate-slide-up bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-orange-800">
        Sign Up as Technician
      </h2>
      {error && (
        <p className="text-red-600 text-sm mb-4 p-3 bg-red-50 rounded-md border border-red-200 text-center font-[Open Sans] animate-slide-up animate-delay-100 w-full max-w-md">
          {error}
        </p>
      )}
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md animate-slide-up animate-delay-200 border border-gray-100">
        <form onSubmit={handleRegister} className="flex flex-col gap-4 w-full">
          {/* Full Name Input with Icon */}
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              className="pl-10 p-3 border border-gray-300 rounded-md text-base font-[Open Sans] focus:outline-none focus:ring-2 focus:ring-orange-600 transition-all duration-300 w-full hover:border-orange-400"
            />
          </div>
          {/* Email Input with Icon */}
          <div className="relative">
            <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={handleEmailChange}
              required
              disabled={loading}
              className={`pl-10 p-3 border ${
                emailError ? 'border-red-500' : 'border-gray-300'
              } rounded-md text-base font-[Open Sans] focus:outline-none focus:ring-2 focus:ring-orange-600 transition-all duration-300 w-full hover:border-orange-400`}
            />
            {emailError && <p className="text-red-500 text-xs mt-1 font-[Open Sans]">{emailError}</p>}
          </div>
          {/* Password Input with Icon */}
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={handlePasswordChange}
              required
              disabled={loading}
              className={`p-3 border ${
                passwordError ? 'border-red-500' : 'border-gray-300'
              } rounded-md text-base font-[Open Sans] focus:outline-none focus:ring-2 focus:ring-orange-600 transition-all duration-300 w-full hover:border-orange-400 pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              disabled={loading}
            >
              {showPassword ? <EyeSlashIcon className="h-5 w-5 text-gray-500" /> : <EyeIcon className="h-5 w-5 text-gray-500" />}
            </button>
          </div>
          {/* Confirm Password Input with Icon */}
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Re-enter Password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              required
              disabled={loading}
              className={`p-3 border ${
                passwordError ? 'border-red-500' : 'border-gray-300'
              } rounded-md text-base font-[Open Sans] focus:outline-none focus:ring-2 focus:ring-orange-600 transition-all duration-300 w-full hover:border-orange-400 pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              disabled={loading}
            >
              {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5 text-gray-500" /> : <EyeIcon className="h-5 w-5 text-gray-500" />}
            </button>
            {passwordError && <p className="text-red-500 text-xs mt-1 font-[Open Sans]">{passwordError}</p>}
          </div>
          {/* Specialization and Age in Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <WrenchScrewdriverIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Specialization"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                required
                disabled={loading}
                className="pl-10 p-3 border border-gray-300 rounded-md text-base font-[Open Sans] focus:outline-none focus:ring-2 focus:ring-orange-600 transition-all duration-300 w-full hover:border-orange-400"
              />
            </div>
            <div className="relative">
              <CakeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="number"
                placeholder="Age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
                min="18"
                disabled={loading}
                className="pl-10 p-3 border border-gray-300 rounded-md text-base font-[Open Sans] focus:outline-none focus:ring-2 focus:ring-orange-600 transition-all duration-300 w-full hover:border-orange-400"
              />
            </div>
          </div>
          {/* Sign Up Button */}
          <button
            type="submit"
            className={`p-3 bg-gradient-to-r from-orange-600 to-orange-800 text-white rounded-full font-medium text-lg font-[Raleway] transition-all duration-300 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:shadow-xl hover:from-orange-700 hover:to-orange-900 animate-pulse-slow'}`}
            disabled={loading}
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 mx-auto text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>
        {/* Back to Category Selection Link */}
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => navigate('/signup')}
            className="text-orange-600 hover:text-orange-800 text-sm font-medium font-[Open Sans] underline underline-offset-4 transition-colors duration-300 animate-slide-up animate-delay-600"
            disabled={loading}
          >
            Back to Category Selection
          </button>
        </div>
      </div>
    </div>
  );
}

export default TechnicianSignUp;