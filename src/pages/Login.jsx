import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import logoImg from '../assets/logo.jpg';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LogIn, ShieldAlert } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const isAdminRequested = searchParams.get('role') === 'admin' || location.state?.from?.startsWith?.('/admin');

  const [role, setRole] = useState('admin');
  const [email, setEmail] = useState('admin@auralib.lk');
  const [password, setPassword] = useState('Admin@123');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isAdminRequested) {
      setRole('admin');
    }
  }, [isAdminRequested]);

  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Please provide a valid email format.';
    }
    if (!password.trim()) {
      errs.password = 'Password is required.';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const profile = await login({ email, password });
      showToast(`Signed in successfully as ${profile.role === 'admin' ? 'Library / Admin' : 'Member'}!`, 'success');
      navigate(location.state?.from || (profile.role === 'admin' ? '/admin' : '/my-books'));
    } catch (error) {
      showToast(error.message || 'Unable to sign in.', 'error');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <img
            src={logoImg}
            alt="AuraLib LK Logo"
            className="w-14 h-14 rounded-2xl object-contain bg-white mx-auto shadow-md border border-slate-100 p-1"
          />
          <h1 className="text-2xl font-extrabold text-navy-950 tracking-tight">
            {isAdminRequested ? 'Library / Admin Portal Sign In' : 'Sign In to AuraLib LK'}
          </h1>
          <p className="text-xs text-slate-500">
            {isAdminRequested
              ? 'Please authenticate with administrative privileges to manage library operations'
              : 'Access your borrowing history and saved books'}
          </p>
        </div>

        {/* Admin Access Required Banner */}
        {isAdminRequested && (
          <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-3.5 flex items-center gap-3 text-xs text-amber-900 shadow-2xs animate-in fade-in slide-in-from-top-1">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold">Staff Authentication Required</p>
              <p className="text-[11px] text-amber-700">
                You must sign in as an Library / Admin to view the Admin Dashboard.
              </p>
            </div>
          </div>
        )}

        {/* Regular Login Form */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-5">
          {/* Role selector pill */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Portal Type
            </label>
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => {
                  setRole('member');
                  setEmail('');
                  setPassword('');
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  role === 'member'
                    ? 'bg-white text-navy-900 shadow-2xs'
                    : 'text-slate-600 hover:text-navy-900'
                }`}
              >
                Library Member
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole('admin');
                  setEmail('admin@auralib.lk');
                  setPassword('Admin@123');
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  role === 'admin'
                    ? 'bg-navy-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-navy-900'
                }`}
              >
                Library / Admin
              </button>
            </div>
          </div>

          {role === 'admin' && (
            <p className="text-[11px] text-slate-500 bg-blue-50 border border-blue-100 rounded-lg p-2.5">
              Prototype admin account: <strong>admin@auralib.lk</strong> / <strong>Admin@123</strong>
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-navy-900 block mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={`w-full px-3.5 py-2.5 text-xs rounded-xl border ${
                  errors.email ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
                } focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all`}
              />
              {errors.email && <p className="text-[11px] text-rose-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-navy-900">Password</label>
                <span className="text-[10px] text-slate-400">Your Firebase password</span>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full px-3.5 py-2.5 text-xs rounded-xl border ${
                  errors.password ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
                } focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all`}
              />
              {errors.password && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-500/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              {submitting ? 'Signing In…' : 'Sign In to Account'}
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-500">
            Don't have a library membership yet?{' '}
            <Link to="/register" className="font-bold text-brand-600 hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
