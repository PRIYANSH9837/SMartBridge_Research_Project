import React, { useState } from 'react';
import { 
  Atom, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight,
  X,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
  onLoginSuccess?: (userData: User) => void; 
}

interface User {
  id: string;
  full_name: string;
  email: string;
  username?: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  name?: string;
  username?: string;
  general?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL;

const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  initialMode = 'login',
  onLoginSuccess 
}) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    username: ''
  });

  React.useEffect(() => {
    setFormData({ 
      email: '', 
      password: '', 
      confirmPassword: '', 
      full_name: '',
      username: '' 
    });
    setErrors({});
    setIsLoading(false);
  }, [isOpen, mode]);

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (mode === 'signup') {
      if (!formData.full_name) {
        newErrors.name = 'Full name is required';
      }
      
      if (!formData.username) {
        newErrors.username = 'Username is required';
      } else if (formData.username.length < 3) {
        newErrors.username = 'Username must be at least 3 characters';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      // Show validation error toast
      const firstError = Object.values(errors)[0];
      if (firstError) {
        toast.error(firstError, {
          id: 'validation-error',
          duration: 3000,
        });
      }
      return;
    }

    setIsLoading(true);
    setErrors({});

   
    try {
      if (mode === 'signup') {
        // Signup request
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            username: formData.username,
            full_name: formData.full_name,
            password: formData.password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || 'Registration failed');
        }

        // Dismiss loading and show success
        toast.dismiss('auth-loading');
        toast.success('✨ Account created successfully! Please login.', {
          id: 'signup-success',
          duration: 4000,
          icon: '🎉',
        });

        // Switch to login mode after 1.5 seconds
        setTimeout(() => {
          setMode('login');
          setFormData({ 
            email: formData.email, // Keep email for convenience
            password: '', 
            confirmPassword: '', 
            full_name: '',
            username: '' 
          });
        }, 1500);

      } else {
        // Login request - using OAuth2 password flow
        const formBody = new URLSearchParams({
          username: formData.email, // OAuth2 expects 'username' field
          password: formData.password,
        });

        const response = await fetch(`${API_BASE_URL}/api/auth/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formBody,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || 'Login failed');
        }

        // Store token
        localStorage.setItem('token', data.access_token);

        // Fetch user data
        const userResponse = await fetch(`${API_BASE_URL}/api/me`, {
          headers: {
            Authorization: `Bearer ${data.access_token}`,
          },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          localStorage.setItem('user', JSON.stringify(userData));

          if (onLoginSuccess) {
            onLoginSuccess(userData);
          }
        }

        // Dismiss loading and show success
        toast.dismiss('auth-loading');
        toast.success('✅ Logged in successfully! Redirecting...', {
          id: 'login-success',
          duration: 2000,
          icon: '👋',
        });

        // Close modal and redirect after a short delay
        setTimeout(() => {
          onClose();
          navigate('/dashboard');
        }, 1000);
      }

    } catch (error: any) {
      // Dismiss loading and show error
      toast.dismiss('auth-loading');
      
      const errorMessage = error.message || 'An error occurred';
      setErrors({ general: errorMessage });
      
      toast.error(`❌ ${errorMessage}`, {
        id: 'auth-error',
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    toast(`Switched to ${mode === 'login' ? 'signup' : 'login'} mode`, {
      id: 'mode-switch',
      icon: '🔄',
      duration: 1500,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-gray-900 rounded-2xl shadow-2xl border border-gray-800">
        {/* Close button */}
        <button
          onClick={() => {
            onClose();
            toast('Modal closed', { 
              id: 'modal-close',
              icon: '👋',
              duration: 1500 
            });
          }}
          className="absolute right-4 top-4 p-1 rounded-lg text-gray-400 hover:text-gray-300 hover:bg-gray-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center space-x-2 mb-2">
            <Atom className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">ResearchHub AI</h2>
          </div>
          <h3 className="text-2xl font-semibold text-white">
            {mode === 'login' ? 'Welcome back' : 'Create an account'}
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            {mode === 'login' 
              ? 'Sign in to continue your research journey' 
              : 'Get started with your free account'}
          </p>
        </div>

        {/* Error Message - Keep this for inline errors */}
        {errors.general && (
          <div className="mx-6 mt-4 p-3 bg-red-900/50 border border-red-700 rounded-lg flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-200">{errors.general}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className={`w-full pl-10 pr-4 py-2.5 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 transition-colors ${
                      errors.name 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-700 focus:border-purple-500 focus:ring-purple-500'
                    }`}
                    required={mode === 'signup'}
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-xs text-red-400">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="johndoe"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className={`w-full pl-10 pr-4 py-2.5 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 transition-colors ${
                      errors.username 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-700 focus:border-purple-500 focus:ring-purple-500'
                    }`}
                    required={mode === 'signup'}
                  />
                </div>
                {errors.username && (
                  <p className="mt-1 text-xs text-red-400">{errors.username}</p>
                )}
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full pl-10 pr-4 py-2.5 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 transition-colors ${
                  errors.email 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-700 focus:border-purple-500 focus:ring-purple-500'
                }`}
                required
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-red-400">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`w-full pl-10 pr-12 py-2.5 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 transition-colors ${
                  errors.password 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-700 focus:border-purple-500 focus:ring-purple-500'
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-400"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-400">{errors.password}</p>
            )}
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={`w-full pl-10 pr-12 py-2.5 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 transition-colors ${
                    errors.confirmPassword 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-700 focus:border-purple-500 focus:ring-purple-500'
                  }`}
                  required={mode === 'signup'}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-400"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-400">{errors.confirmPassword}</p>
              )}
            </div>
          )}

          {mode === 'login' && (
            <div className="flex justify-end">
              <button 
                type="button" 
                onClick={() => toast('Password reset feature coming soon!', {
                  id: 'forgot-password',
                  icon: '🔒',
                  duration: 2000,
                })}
                className="text-sm text-purple-400 hover:text-purple-300 hover:underline"
              >
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{mode === 'login' ? 'Signing in...' : 'Creating account...'}</span>
              </>
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800 text-center">
          <p className="text-gray-400 text-sm">
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={toggleMode}
              className="text-purple-400 hover:text-purple-300 font-medium hover:underline"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;