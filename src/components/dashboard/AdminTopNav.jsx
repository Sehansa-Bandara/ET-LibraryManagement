import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Bell, User, ExternalLink, LogOut, ChevronDown } from 'lucide-react';
import logoImg from '../../assets/logo.jpg';
import { useAuth } from '../../context/AuthContext';
import { useLibrary } from '../../context/LibraryContext';

export const AdminTopNav = ({ onMobileMenuOpen, title = "Admin Dashboard" }) => {
  const { user, logout } = useAuth();
  const { borrowings } = useLibrary();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const pendingCount = borrowings.filter((br) => br.status === 'pending').length;

  return (
    <header className="sticky top-0 z-20 bg-[#dbeefc] border-b border-[#b9ddfb] h-18 px-4 sm:px-6 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuOpen}
          className="lg:hidden p-2 text-slate-600 hover:text-navy-900 hover:bg-slate-100 rounded-xl transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <img
          src={logoImg}
          alt="AuraLib LK Logo"
          className="lg:hidden w-8 h-8 rounded-lg object-contain bg-white border border-sky-200 p-0.5 shadow-xs shrink-0"
        />
        <div>
          <h1 className="text-base sm:text-lg font-extrabold text-navy-900 tracking-tight">
            {title}
          </h1>
          <p className="text-[11px] text-slate-500 hidden sm:block">
            AuraLib LK Integrated Library System • v2.4
          </p>
        </div>
      </div>

      {/* Right side utilities */}
      <div className="flex items-center gap-3">
        {/* Pending Requests quick badge */}
        {pendingCount > 0 && (
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-lg">
            <Bell className="w-3.5 h-3.5 text-amber-600" />
            {pendingCount} Pending Requests
          </span>
        )}

        {/* User profile avatar & dropdown */}
        {user && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1 pr-2 rounded-xl hover:bg-white/80 transition-colors border border-transparent hover:border-[#b9ddfb] cursor-pointer"
              title="Click to view Admin Profile"
              aria-expanded={dropdownOpen}
              aria-label="Admin Profile Menu"
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-500/30"
              />
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-navy-900 leading-tight truncate max-w-[130px]">
                  {user.name}
                </p>
                <p className="text-[10px] text-slate-500 capitalize">
                  {user.title || 'Administrator'}
                </p>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-3 z-50 animate-in fade-in slide-in-from-top-2"
                onMouseLeave={() => setDropdownOpen(false)}
              >
                {/* Profile Header */}
                <div className="px-4 pb-3 border-b border-slate-100 flex items-center gap-3">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-brand-500/20 shrink-0"
                  />
                  <div className="overflow-hidden">
                    <p className="text-sm font-extrabold text-navy-950 truncate">{user.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-100">
                      {user.title || 'Administrator'}
                    </span>
                  </div>
                </div>

                {/* Profile Details Snippet */}
                <div className="px-4 py-2.5 text-xs text-slate-600 space-y-1.5 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Staff ID:</span>
                    <span className="font-semibold text-navy-900">{user.membershipId || 'AL-ADMIN-01'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status:</span>
                    <span className="font-semibold text-emerald-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Active Staff
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 px-1 space-y-0.5">
                  <Link
                    to="/admin/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-navy-900 hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    <User className="w-4 h-4 text-brand-600" />
                    <span>View / Edit Full Profile</span>
                  </Link>

                  <Link
                    to="/"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-navy-900 hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                    <span>Public Library Portal</span>
                  </Link>

                  <div className="border-t border-slate-100 my-1 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                        navigate('/login');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
