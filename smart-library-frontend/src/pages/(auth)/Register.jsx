import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register, loading, error } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    memberId: '',
    password: '',
    confirmPassword: '',
  });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [localError, setLocalError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (localError) setLocalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!formData.fullName || !formData.email || !formData.memberId || !formData.password) {
      setLocalError('Please fill in all required fields.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }
    if (!agreeTerms) {
      setLocalError('You must agree to the Terms of Service and Privacy Policy.');
      return;
    }

    try {
      const result = await register({
        name: formData.fullName,
        email: formData.email,
        memberId: formData.memberId,
        password: formData.password,
      });
      if (result) {
        navigate('/login', { state: { registered: true } });
      }
    } catch (err) {
      setLocalError(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface via-surface-container-low to-surface flex items-center justify-center p-md relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/8 rounded-full blur-[100px] animate-pulse" style={{animationDuration: '9s'}} />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-secondary/8 rounded-full blur-[100px] animate-pulse" style={{animationDuration: '11s'}} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/[0.03] rounded-full blur-[120px]" />
        <div className="absolute top-1/4 right-1/3 w-56 h-56 bg-tertiary/6 rounded-full blur-[80px] animate-pulse" style={{animationDuration: '13s'}} />
        <div className="absolute bottom-1/3 left-1/3 w-52 h-52 bg-secondary/6 rounded-full blur-[80px] animate-pulse" style={{animationDuration: '6s'}} />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#005bbf 1px, transparent 1px), linear-gradient(90deg, #005bbf 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Register Card */}
      <div className="relative w-full max-w-[420px] z-10">
        {/* Decorative top accent bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-tertiary via-secondary to-primary rounded-t-xl" />

        <div className="bg-surface/95 backdrop-blur-sm border-x border-b border-outline-variant rounded-b-xl shadow-xl p-xl">
          {/* Brand */}
          <div className="flex flex-col items-center mb-lg">
            <div className="w-16 h-16 bg-gradient-to-br from-secondary to-secondary-container rounded-2xl flex items-center justify-center mb-md shadow-md shadow-secondary/20">
              <span className="material-symbols-outlined text-3xl text-on-secondary">menu_book</span>
            </div>
            <h1 className="text-headline-lg font-bold text-on-surface text-center tracking-tight">Create Account</h1>
            <p className="text-body-sm text-on-surface-variant text-center mt-xs">
              Join the Smart Library System
            </p>
          </div>

          {/* Error message */}
          {(localError || error) && (
            <div className="flex items-center gap-sm p-md mb-md bg-error-container border border-error/20 rounded-lg animate-slideDown">
              <span className="material-symbols-outlined text-error text-[20px]">error</span>
              <p className="text-body-sm text-on-error-container">{localError || error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-md">
            {/* Full Name */}
            <div>
              <label className="block text-body-sm font-medium text-on-surface mb-xs">
                Full Name <span className="text-error">*</span>
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] pointer-events-none group-focus-within:text-primary transition-colors">person</span>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-[10px] bg-surface-container-low border border-outline-variant rounded-lg text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-body-sm font-medium text-on-surface mb-xs">
                Email <span className="text-error">*</span>
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] pointer-events-none group-focus-within:text-primary transition-colors">mail</span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="w-full pl-10 pr-4 py-[10px] bg-surface-container-low border border-outline-variant rounded-lg text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Member ID */}
            <div>
              <label className="block text-body-sm font-medium text-on-surface mb-xs">
                Member ID <span className="text-error">*</span>
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] pointer-events-none group-focus-within:text-primary transition-colors">badge</span>
                <input
                  type="text"
                  name="memberId"
                  value={formData.memberId}
                  onChange={handleChange}
                  placeholder="LIB-2024-001"
                  className="w-full pl-10 pr-4 py-[10px] bg-surface-container-low border border-outline-variant rounded-lg text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-body-sm font-medium text-on-surface mb-xs">
                Password <span className="text-error">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] pointer-events-none">lock</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  className="w-full pl-10 pr-10 py-[10px] bg-surface-container-low border border-outline-variant rounded-lg text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                  tabIndex={-1}
                >
                  <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-body-sm font-medium text-on-surface mb-xs">
                Confirm Password <span className="text-error">*</span>
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] pointer-events-none group-focus-within:text-primary transition-colors">lock</span>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  className="w-full pl-10 pr-10 py-[10px] bg-surface-container-low border border-outline-variant rounded-lg text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                  tabIndex={-1}
                >
                  <span className="material-symbols-outlined text-[20px]">{showConfirm ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-sm">
              <input
                type="checkbox"
                id="agreeTerms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer shrink-0"
              />
              <label htmlFor="agreeTerms" className="text-body-sm text-on-surface-variant cursor-pointer select-none">
                I agree to{' '}
                <span className="text-primary hover:text-primary/80 transition-colors cursor-pointer font-medium">Terms of Service</span>
                {' '}and{' '}
                <span className="text-primary hover:text-primary/80 transition-colors cursor-pointer font-medium">Privacy Policy</span>
              </label>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-sm px-lg py-[12px] bg-gradient-to-r from-secondary to-secondary-container text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-secondary/25 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 transition-all duration-200"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <span className="material-symbols-outlined text-[20px]">person_add</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-md my-lg">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-outline-variant to-transparent" />
            <span className="text-body-sm text-on-surface-variant">or</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-outline-variant to-transparent" />
          </div>

          {/* Login Link */}
          <p className="text-center text-body-sm text-on-surface-variant">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:text-primary/80 transition-colors">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
