import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { verifyEmail, resendVerification, setVerificationRequired } from '@/store/slices/authSlice.js';
import { FaEnvelope, FaCheckCircle, FaClock, FaPaperPlane, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { userInfo, loading: authLoading, verificationRequired } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null); // 'pending', 'success', 'error'
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(true);
  
  // Get unverified user from localStorage
  const unverifiedUser = localStorage.getItem('unverifiedUser');
  const userToVerify = unverifiedUser ? JSON.parse(unverifiedUser) : userInfo;

  useEffect(() => {
    // If user is already verified and authenticated, redirect
    if (userInfo?.isVerified && localStorage.getItem('token')) {
      navigate('/');
      return;
    }

    // If token is present in URL, verify it
    if (token) {
      handleVerify();
    }
  }, [token, userInfo, navigate]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleVerify = async () => {
    try {
      setLoading(true);
      setVerificationStatus('pending');
      
      // Dispatch verifyEmail action
      const result = await dispatch(verifyEmail(token)).unwrap();
      
      if (result && result.token) {
        // Verification successful
        setVerificationStatus('success');
        
        toast.success('Email verified successfully! You are now logged in.');
        
        // Redirect after 3 seconds
        setTimeout(() => {
          if (result.user?.isAdmin) {
            navigate('/admin/dashboard');
          } else {
            navigate('/');
          }
        }, 3000);
      }
    } catch (error) {
      console.error('Verification failed:', error);
      setVerificationStatus('error');
      
      // Show specific error messages
      if (error.includes('Invalid or expired')) {
        toast.error('The verification link is invalid or has expired.');
      } else if (error.includes('already verified')) {
        toast.error('This email is already verified.');
        
        // Try to log the user in if they're already verified
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        toast.error('Email verification failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setCanResend(false);
      
      // Get email from unverified user or current user
      const email = userToVerify?.email;
      
      if (!email) {
        toast.error('No email found for verification');
        return;
      }
      
      const result = await dispatch(resendVerification(email)).unwrap();
      
      if (result) {
        toast.success('Verification email sent successfully!');
        setCountdown(60); // 60 seconds cooldown
      }
    } catch (error) {
      console.error('Resend failed:', error);
      
      if (error.includes('already verified')) {
        toast.error('Your email is already verified.');
        navigate('/login');
      } else if (error.includes('not found')) {
        toast.error('User not found. Please register again.');
        navigate('/register');
      } else {
        toast.error('Failed to resend verification email. Please try again.');
      }
    }
  };

  const handleGoToLogin = () => {
    // Clear verification requirement
    dispatch(setVerificationRequired(false));
    localStorage.removeItem('unverifiedUser');
    navigate('/login');
  };

  // If user is already verified and has token, show success
  if (userInfo?.isVerified && localStorage.getItem('token')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaCheckCircle className="text-green-500 text-4xl" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Email Already Verified
            </h1>
            <p className="text-gray-600 mb-6">
              Your email has already been verified. You are logged in and can access all features.
            </p>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show verification in progress
  if (token && verificationStatus === 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-6"></div>
            <h1 className="text-xl font-bold text-gray-900 mb-4">
              Verifying your email...
            </h1>
            <p className="text-gray-600">Please wait while we verify your email address.</p>
          </div>
        </div>
      </div>
    );
  }

  // Show verification success
  if (token && verificationStatus === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaCheckCircle className="text-green-500 text-4xl" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Email Verified Successfully!
            </h1>
            <p className="text-gray-600 mb-6">
              Your email has been verified. You are now logged in and will be redirected shortly.
            </p>
            <div className="animate-pulse">
              <p className="text-sm text-green-600">Redirecting in 3 seconds...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show verification error
  if (token && verificationStatus === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaClock className="text-red-500 text-4xl" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Verification Failed
            </h1>
            <p className="text-gray-600 mb-6">
              The verification link is invalid or has expired. Please request a new verification email.
            </p>
            {userToVerify?.email ? (
              <button
                onClick={handleResend}
                className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white py-3 px-4 rounded-lg font-semibold hover:opacity-90 transition-opacity mb-4"
              >
                Resend Verification Email
              </button>
            ) : (
              <button
                onClick={handleGoToLogin}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white py-3 px-4 rounded-lg font-semibold hover:opacity-90 transition-opacity mb-4"
              >
                Go to Login
              </button>
            )}
            <button
              onClick={() => navigate('/register')}
              className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Register Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default view - show resend verification options
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <FaEnvelope className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Verify Your Email</h1>
          <p className="text-gray-600 mt-2">
            Please verify your email to access all features
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-start space-x-4 mb-6">
            <div className="flex-shrink-0">
              <FaClock className="text-yellow-500 text-2xl mt-1" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">Check your inbox</h3>
              <p className="text-gray-600 text-sm">
                We've sent a verification email to{' '}
                <span className="font-semibold">{userToVerify?.email || 'your email'}</span>
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> The verification link will expire in 24 hours.
              If you don't verify your email, some features will be restricted.
            </p>
          </div>

          <div className="space-y-4">
            {userToVerify?.email ? (
              <button
                onClick={handleResend}
                disabled={!canResend || loading}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                  canResend && !loading
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:opacity-90'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaPaperPlane />
                )}
                <span>
                  {loading
                    ? 'Sending...'
                    : canResend
                    ? 'Resend Verification Email'
                    : `Resend available in ${countdown}s`}
                </span>
              </button>
            ) : (
              <button
                onClick={handleGoToLogin}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white py-3 px-4 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Log In to Resend Verification
              </button>
            )}

            <button
              onClick={handleGoToLogin}
              className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Go to Login
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3">Didn't receive the email?</h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Check your spam or junk folder</li>
              <li>• Make sure you entered the correct email address</li>
              <li>• Wait a few minutes and try again</li>
              <li>• Contact support if the issue persists</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;