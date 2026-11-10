import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLibrary } from '../../context/LibraryContext';
import { useToast } from '../../context/ToastContext';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import {
  Settings,
  User,
  Shield,
  Save,
  RotateCcw,
  Clock,
  Sparkles,
  Mail,
  Building,
  CheckCircle2,
  Sliders
} from 'lucide-react';

export const AdminSettings = () => {
  const { user, updateLibraryProfile } = useAuth();
  const { settings, updateSettings, resetToDefaults } = useLibrary();
  const { showToast } = useToast();

  const [resetModalOpen, setResetModalOpen] = useState(false);

  // Form states
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    title: user?.title || 'Library / Admin',
    email: user?.email || '',
    department: user?.department || 'AuraLib National Smart Library',
    phone: user?.phone || ''
  });

  const [systemSettings, setSystemSettings] = useState({
    libraryName: settings.libraryName || 'AuraLib National Smart Library - Colombo',
    loanDurationDays: settings.loanDurationDays || 14,
    maxBorrowLimit: settings.maxBorrowLimit || 5,
    finePerDay: settings.finePerDay || 20.00,
    operatingHours: settings.operatingHours || 'Mon-Sat: 08:00 - 20:00 | Sun & Poya: 09:00 - 15:00',
    contactEmail: settings.contactEmail || 'support@auralib.lk',
    emailNotifications: settings.emailNotifications ?? true
  });

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      await updateLibraryProfile(profileData);
      showToast('Administrator profile updated successfully!', 'success');
    } catch (error) { showToast(error.message || 'Unable to update the profile.', 'error'); }
  };

  const handleSettingsSave = (e) => {
    e.preventDefault();
    updateSettings(systemSettings);
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-navy-950 tracking-tight">
          System Configuration & Administrator Profile
        </h2>
        <p className="text-xs text-slate-500">
          Adjust library borrowing policies, loan rules, operational metadata, and admin profile
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Administrator Profile Card */}
        <div className="md:col-span-5 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-2 text-xs font-bold text-brand-600 uppercase tracking-wider">
            <User className="w-4 h-4" />
            <span>Administrator Identity</span>
          </div>

          <div className="flex flex-col items-center text-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'}
              alt={profileData.name}
              className="w-20 h-20 rounded-2xl object-cover ring-4 ring-brand-500/20 shadow-sm mb-3"
            />
            <h3 className="font-extrabold text-navy-950 text-base">{profileData.name}</h3>
            <p className="text-xs font-semibold text-brand-600">{profileData.title}</p>
            <span className="text-[11px] text-slate-400 mt-1">{profileData.department}</span>
          </div>

          <form onSubmit={handleProfileSave} className="space-y-3.5 text-xs">
            <div>
              <label className="font-bold text-navy-900 block mb-1">Director Full Name</label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="font-bold text-navy-900 block mb-1">Official Position Title</label>
              <input
                type="text"
                value={profileData.title}
                onChange={(e) => setProfileData({ ...profileData, title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="font-bold text-navy-900 block mb-1">Administrative Email</label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="font-bold text-navy-900 block mb-1">Desk Contact Phone</label>
              <input
                type="text"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-navy-900 hover:bg-navy-950 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-2"
            >
              <Save className="w-3.5 h-3.5" />
              Update Profile Info
            </button>
          </form>
        </div>

        {/* Library Operational & Circulation Policy Settings */}
        <div className="md:col-span-7 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2 text-xs font-bold text-brand-600 uppercase tracking-wider">
            <Sliders className="w-4 h-4" />
            <span>Circulation & Loan Policies</span>
          </div>

          <form onSubmit={handleSettingsSave} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-navy-900 block mb-1">Official Library Name</label>
              <input
                type="text"
                value={systemSettings.libraryName}
                onChange={(e) =>
                  setSystemSettings({ ...systemSettings, libraryName: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-navy-900 block mb-1">
                  Default Loan Period (Days)
                </label>
                <input
                  type="number"
                  min="3"
                  max="60"
                  value={systemSettings.loanDurationDays}
                  onChange={(e) =>
                    setSystemSettings({
                      ...systemSettings,
                      loanDurationDays: parseInt(e.target.value, 10) || 14
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-navy-900 block mb-1">
                  Max Active Loans Per Member
                </label>
                <input
                  type="number"
                  min="1"
                  max="15"
                  value={systemSettings.maxBorrowLimit}
                  onChange={(e) =>
                    setSystemSettings({
                      ...systemSettings,
                      maxBorrowLimit: parseInt(e.target.value, 10) || 5
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-navy-900 block mb-1">
                  Overdue Fine (LKR Rs. per day)
                </label>
                <input
                  type="number"
                  step="0.10"
                  min="0"
                  value={systemSettings.finePerDay}
                  onChange={(e) =>
                    setSystemSettings({
                      ...systemSettings,
                      finePerDay: parseFloat(e.target.value) || 0.5
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-navy-900 block mb-1">Contact Support Email</label>
                <input
                  type="email"
                  value={systemSettings.contactEmail}
                  onChange={(e) =>
                    setSystemSettings({ ...systemSettings, contactEmail: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-navy-900 block mb-1">Operating Hours Notice</label>
              <input
                type="text"
                value={systemSettings.operatingHours}
                onChange={(e) =>
                  setSystemSettings({ ...systemSettings, operatingHours: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div>
                <span className="font-bold text-navy-900 block">Automated Email Notifications</span>
                <span className="text-[11px] text-slate-500">
                  Simulate reminder dispatches 48 hours prior to loan due dates.
                </span>
              </div>
              <input
                type="checkbox"
                checked={systemSettings.emailNotifications}
                onChange={(e) =>
                  setSystemSettings({
                    ...systemSettings,
                    emailNotifications: e.target.checked
                  })
                }
                className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500 cursor-pointer"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Save Circulation Policies
            </button>
          </form>

          {/* Factory Reset Section */}
          <div className="pt-6 border-t border-slate-100 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-600 uppercase tracking-wider">
              <Shield className="w-4 h-4" />
              <span>Danger Zone: Environment Reset</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Reset the local state and restore original mock data for all 24 catalog books, borrow records, and demo patrons.
            </p>
            <button
              type="button"
              onClick={() => setResetModalOpen(true)}
              className="px-4 py-2 text-xs font-bold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Factory Reset Demo Data
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        onConfirm={resetToDefaults}
        title="Reset All Mock Data to Defaults?"
        message="This action restores the server-side library configuration defaults. It does not change books, members, or borrowing records."
        confirmText="Confirm Factory Reset"
        type="danger"
      />
    </div>
  );
};
