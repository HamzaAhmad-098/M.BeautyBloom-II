import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaLock, FaEye, FaEyeSlash, FaCheckCircle, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validatePassword = () => {
    const { password, confirmPassword } = formData;
    
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return false;
    }
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    
    // Check for at least one uppercase, one lowercase, and one number
    const uppercaseRegex = /[A-Z]/;
    const lowercaseRegex = /[a-z]/;
    const numberRegex = /[0-9]/;
    
    if (!uppercaseRegex.test(password)) {
      toast.error('Password must contain at least one uppercase letter');
      return false;
    }
    
    if (!lowercaseRegex.test(password)) {
      toast.error('Password must contain at least one lowercase letter');
      return false;
    }
    
    if (!numberRegex.test(password)) {
      toast.error('Password must contain at least one number');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePassword()) {
      return;
    }
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success('Password reset successfully!');
      setSuccess(true);
      setLoading(false);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }, 1500);
  };

  const passwordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    return score;
  };

  const getStrengthColor = (strength) => {
    if (strength <= 1) return 'bg-red-500';
    if (strength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const strength = passwordStrength(formData.password);

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <FaCheckCircle className="text-4xl text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Password Reset!
            </h1>
            <p className="text-gray-600 mb-8">
              Your password has been successfully reset. You will be redirected to the login page shortly.
            </p>
            <div className="animate-pulse text-green-600 mb-6">
              Redirecting in 3 seconds...
            </div>
            <Link
              to="/login"
              className="inline-block bg-green-600 hover:bg-green-700 text-white py-3 px-8 rounded-lg font-semibold"
            >
              Login Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <Link
          to="/login"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8"
        >
          <FaArrowLeft className="mr-2" />
          Back to Login
        </Link>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
              <FaLock className="text-3xl text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Reset Password
            </h1>
            <p className="text-gray-600">
              Create a new password for your account.
            </p>
            <div className="mt-2 text-sm text-gray-500">
              Token: {token?.slice(0, 8)}...
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* New Password */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <FaEyeSlash className="text-gray-400" />
                  ) : (
                    <FaEye className="text-gray-400" />
                  )}
                </button>
              </div>
              
              {/* Password Strength */}
              {formData.password && (
                <div className="mt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Password strength:</span>
                    <span className={`font-medium ${
                      strength <= 1 ? 'text-red-600' :
                      strength <= 3 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {strength <= 1 ? 'Weak' : strength <= 3 ? 'Medium' : 'Strong'}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getStrengthColor(strength)} transition-all duration-300`}
                      style={{ width: `${(strength / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash className="text-gray-400" />
                  ) : (
                    <FaEye className="text-gray-400" />
                  )}
                </button>
              </div>
              
              {/* Password Match Indicator */}
              {formData.confirmPassword && (
                <div className="mt-2">
                  <div className={`flex items-center text-sm ${
                    formData.password === formData.confirmPassword 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {formData.password === formData.confirmPassword ? (
                      <>
                        <FaCheckCircle className="mr-2" />
                        <span>Passwords match</span>
                      </>
                    ) : (
                      <span>Passwords do not match</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Password Requirements */}
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Password Requirements:</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className={`flex items-center ${
                  formData.password.length >= 8 ? 'text-green-600' : ''
                }`}>
                  <div className={`w-4 h-4 rounded-full mr-2 ${
                    formData.password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  At least 8 characters
                </li>
                <li className={`flex items-center ${
                  /[A-Z]/.test(formData.password) ? 'text-green-600' : ''
                }`}>
                  <div className={`w-4 h-4 rounded-full mr-2 ${
                    /[A-Z]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  At least one uppercase letter
                </li>
                <li className={`flex items-center ${
                  /[a-z]/.test(formData.password) ? 'text-green-600' : ''
                }`}>
                  <div className={`w-4 h-4 rounded-full mr-2 ${
                    /[a-z]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  At least one lowercase letter
                </li>
                <li className={`flex items-center ${
                  /[0-9]/.test(formData.password) ? 'text-green-600' : ''
                }`}>
                  <div className={`w-4 h-4 rounded-full mr-2 ${
                    /[0-9]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  At least one number
                </li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold text-lg disabled:opacity-50"
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>

          {/* Security Note */}
          <div className="mt-8 pt-8 border-t">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">🔒 Secure Connection</div>
              <p className="text-xs text-gray-500">
                Your password is encrypted and securely transmitted. 
                This reset link will expire after use.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;