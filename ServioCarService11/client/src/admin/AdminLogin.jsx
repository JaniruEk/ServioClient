// src/components/AdminLogin.jsx
import { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const navigate = useNavigate();
  const googleProvider = new GoogleAuthProvider();

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) setEmailError('Email is required');
    else if (!emailRegex.test(value)) setEmailError('Invalid email format');
    else setEmailError('');
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    validateEmail(value);
  };
  const handleLogin = async (e) => {
    e.preventDefault();
    if (emailError || !email || !password) {
      setError('Please enter both email and password');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // Sign in with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Check user category directly from Firestore instead of relying on API
      const { getDoc, doc } = await import('firebase/firestore');
      const { db } = await import('../firebase');
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (!userDoc.exists()) {
        await signOut(auth);
        throw new Error('User profile not found');
      }
      
      const userData = userDoc.data();
      
      // Verify if user has admin category
      if (userData.category !== 'admin') {
        await signOut(auth);
        throw new Error('Access denied: Admins only');
      }
      
      // If we reach here, the user is an admin
      console.log('Admin login successful');
      setEmail('');
      setPassword('');
      navigate('/admin-dashboard');
    } catch (err) {
      setError('Login failed: ' + err.message);
      console.error('Admin login error:', err);
    } finally {
      setLoading(false);
    }
  };
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check user category directly from Firestore
      const { getDoc, doc } = await import('firebase/firestore');
      const { db } = await import('../firebase');
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      // If user doesn't exist in Firestore, they might be a new user
      if (!userDoc.exists()) {
        await signOut(auth);
        throw new Error('User profile not found. Please contact an administrator.');
      }
      
      const userData = userDoc.data();
      
      // Check if user has admin privileges
      if (userData.category !== 'admin') {
        await signOut(auth);
        throw new Error('Access denied: Admins only');
      }
      
      // Admin login successful
      console.log('Admin Google login successful');
      navigate('/admin-dashboard');
    } catch (err) {
      setError('Google login failed: ' + err.message);
      console.error('Google login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email first');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      alert('Password reset email sent! Check your inbox.');
    } catch (err) {
      setError('Failed to send reset email: ' + err.message);
      console.error(err);
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white font-sans bg-cover bg-center relative py-6"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80')`,
      }}
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/40"></div>

      <div className="relative z-10 w-full max-w-md mx-auto">
        <h2 className="text-4xl font-bold text-white mb-8 font-[Poppins] tracking-wide text-center">
          Admin Login 
        </h2>

        {error && (
          <p className="text-red-400 text-sm mb-6 p-3 bg-red-500/10 rounded-md border border-red-500/50 text-center font-[Open Sans]">
            {error}
          </p>
        )}

        <div className="bg-white/10 backdrop-blur-md p-8 rounded-lg shadow-xl w-full border border-gray-700/50">
          <form onSubmit={handleLogin} className="flex flex-col gap-6 w-full">
            {/* Email Input with Icon */}
            <div className="relative">
              <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-300" />
              <input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="Email"
                value={email}
                onChange={handleEmailChange}
                className={`pl-10 p-3 border ${emailError ? 'border-red-500' : 'border-gray-600'} rounded-md text-base font-[Open Sans] bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300 w-full hover:border-red-500`}
                disabled={loading}
                autoFocus
              />
              {emailError && <p className="text-red-400 text-xs mt-1 font-[Open Sans]">{emailError}</p>}
            </div>

            {/* Password Input with Icon */}
            <div className="relative">
              <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-300" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="current-password"
                autoComplete="current-password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 p-3 border border-gray-600 rounded-md text-base font-[Open Sans] bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300 w-full hover:border-red-500 pr-12"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                disabled={loading}
              >
                {showPassword ? <EyeSlashIcon className="h-5 w-5 text-gray-300" /> : <EyeIcon className="h-5 w-5 text-gray-300" />}
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className={`p-3 bg-red-600 text-white rounded-full font-medium text-lg font-[Raleway] transition-all duration-300 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:shadow-xl hover:bg-red-700'}`}
              disabled={loading}
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 mx-auto text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Admin Login'
              )}
            </button>
            <button
              onClick={handleForgotPassword}
              className="text-red-500 hover:text-red-400 text-sm font-medium font-[Open Sans] underline underline-offset-4 transition-colors duration-300"
              disabled={loading}
            >
              Forgot Password?
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-800 text-gray-300 font-[Open Sans]">OR</span>
            </div>
          </div>

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            className={`p-3 bg-gray-800 border border-gray-600 text-white rounded-full font-medium text-lg font-[Raleway] flex items-center justify-center gap-2 transition-all duration-300 w-full ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:shadow-xl hover:bg-gray-700'}`}
            disabled={loading}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1.02.68-2.31 1.08-3.71 1.08-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C4.01 20.36 7.77 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.77 1 4.01 3.64 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Login with Google
          </button>

          {/* Links */}
          <div className="mt-6 flex flex-col items-center gap-3 w-full">
            
            <button
              onClick={() => navigate('/')}
              className="text-red-500 hover:text-red-400 text-sm font-medium font-[Open Sans] underline underline-offset-4 transition-colors duration-300"
              disabled={loading}
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;