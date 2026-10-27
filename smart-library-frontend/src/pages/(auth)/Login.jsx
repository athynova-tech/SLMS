import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login, loading, error } = useAuth();

  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [localError, setLocalError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Intentionally no auto-redirect on mount.
  // The user should be able to visit /login and sign in as a different role,
  // even if a token already exists in localStorage.

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!identity.trim()) {
      setLocalError('Please enter your Member ID or Email.');
      return;
    }
    if (!password) {
      setLocalError('Please enter your password.');
      return;
    }

    try {
      const loggedInUser = await login(identity.trim(), password);
      if (loggedInUser) {
        navigate(`/${loggedInUser.role}/dashboard`, { replace: true });
      }
    } catch {
      // Error is set in AuthContext
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface via-surface-container-low to-surface flex items-center justify-center p-md relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/8 rounded-full blur-[100px] animate-pulse" style={{animationDuration: '8s'}} />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-secondary/8 rounded-full blur-[100px] animate-pulse" style={{animationDuration: '10s'}} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/[0.03] rounded-full blur-[120px]" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-tertiary/6 rounded-full blur-[80px] animate-pulse" style={{animationDuration: '12s'}} />
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-secondary/6 rounded-full blur-[80px] animate-pulse" style={{animationDuration: '7s'}} />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#005bbf 1px, transparent 1px), linear-gradient(90deg, #005bbf 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-[420px] z-10">
        {/* Decorative top accent bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-secondary to-tertiary rounded-t-xl" />

        <div className="bg-surface/95 backdrop-blur-sm border-x border-b border-outline-variant rounded-b-xl shadow-xl p-xl">
          {/* Brand */}
          <div className="flex flex-col items-center mb-lg">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-container rounded-2xl flex items-center justify-center mb-md shadow-md shadow-primary/20">
              <span className="material-symbols-outlined text-3xl text-on-primary">auto_stories</span>
            </div>
            <h1 className="text-headline-lg font-bold text-on-surface text-center tracking-tight">Welcome Back</h1>
            <p className="text-body-sm text-on-surface-variant text-center mt-xs">
              Sign in to your library account
            </p>
          </div>

        {/* Error Message */}
        {displayError && (
          <div className="flex items-center gap-sm p-md mb-md bg-error-container border border-error/20 rounded-lg animate-slideDown">
            <span className="material-symbols-outlined text-error text-[20px]">error</span>
            <p className="text-body-sm text-on-error-container">{displayError}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-md">
          {/* Identity Field */}
          <div>
            <label htmlFor="identity" className="block text-body-sm font-medium text-on-surface mb-xs">
              Member ID or Email
            </label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] pointer-events-none group-focus-within:text-primary transition-colors">person</span>
              <input
                id="identity"
                type="text"
                value={identity}
                onChange={(e) => setIdentity(e.target.value)}
                placeholder="Enter your Member ID or Email"
                className="w-full pl-10 pr-4 py-[10px] bg-surface-container-low border border-outline-variant rounded-lg text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                disabled={loading}
                autoFocus
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-body-sm font-medium text-on-surface mb-xs">
              Password
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] pointer-events-none">lock</span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-10 pr-10 py-[10px] bg-surface-container-low border border-outline-variant rounded-lg text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                disabled={loading}
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

          {/* Remember Me + Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-sm cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="peer w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer"
                  disabled={loading}
                />
              </div>
              <span className="text-body-sm text-on-surface-variant group-hover:text-on-surface transition-colors">Remember Me</span>
            </label>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-sm px-lg py-[12px] bg-gradient-to-r from-primary to-primary-container text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 transition-all duration-200"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Login</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-md my-lg">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-outline-variant to-transparent" />
          <span className="text-body-sm text-on-surface-variant">or continue with</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-outline-variant to-transparent" />
        </div>

        {/* Social buttons */}
        <div className="grid grid-cols-3 gap-sm mb-lg">
          <button className="flex items-center justify-center gap-sm px-md py-[10px] border border-outline-variant rounded-lg hover:bg-surface-container-high transition-colors text-body-sm text-on-surface-variant">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Google
          </button>
          <button className="flex items-center justify-center px-md py-[10px] border border-outline-variant rounded-lg hover:bg-surface-container-high transition-colors text-body-sm text-on-surface-variant">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
          </button>
          <button className="flex items-center justify-center px-md py-[10px] border border-outline-variant rounded-lg hover:bg-surface-container-high transition-colors text-body-sm text-on-surface-variant">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </button>
        </div>

        {/* Register Link */}
        <p className="text-center mt-lg text-body-sm text-on-surface-variant">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-primary font-semibold hover:text-primary/80 transition-colors">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  </div>
  );
};

export default Login;
