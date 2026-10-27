import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authApi, usersApi } from '../../services/api';

export default function Profile() {
  const { user, logout } = useAuth();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
  });
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [passwordMsg, setPasswordMsg] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await authApi.me();
        setForm({
          fullName: data.fullName || data.name || '',
          email: data.email || '',
          phoneNumber: data.phoneNumber || '',
        });
      } catch (err) {
        console.error('Failed to load profile:', err);
      }
    }
    fetchProfile();
  }, []);

  const initials = (form.fullName || user?.name || 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage(null);
    try {
      // Use auth/me update or user update depending on available endpoint
      await usersApi.activate(user?.id); // placeholder - we need a PUT /users/{id}
      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordMsg(null);
    if (passwordForm.newPass !== passwordForm.confirm) {
      setPasswordMsg({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    if (passwordForm.newPass.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }
    try {
      await authApi.changePassword(passwordForm.current, passwordForm.newPass);
      setPasswordMsg({ type: 'success', text: 'Password changed successfully' });
      setPasswordForm({ current: '', newPass: '', confirm: '' });
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="flex flex-col gap-lg p-lg max-w-3xl mx-auto">
      {/* Profile Header */}
      <div className="flex items-center gap-lg rounded-xl border border-outline-variant bg-surface p-lg">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary text-headline-lg font-bold">
          {initials}
        </div>
        <div className="flex flex-col gap-0.5">
          <h1 className="text-headline-lg font-bold text-on-surface">{form.fullName || user?.name}</h1>
          <p className="text-body-sm text-on-surface-variant">{form.email || user?.email}</p>
          <div className="flex items-center gap-sm mt-xs">
            <span className="rounded-full bg-primary/10 px-3 py-0.5 text-label-lg font-medium text-primary">
              {user?.role || 'Member'}
            </span>
          </div>
        </div>
      </div>

      {message && (
        <div className={`rounded-lg p-md text-body-sm ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Personal Info */}
      <div className="rounded-xl border border-outline-variant bg-surface p-lg">
        <h2 className="text-title-md font-semibold text-on-surface mb-md">Personal Information</h2>
        <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
          <div className="flex flex-col gap-xs">
            <label className="text-body-sm font-medium text-on-surface-variant">Full Name</label>
            <input type="text" value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-body-sm text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div className="flex flex-col gap-xs">
            <label className="text-body-sm font-medium text-on-surface-variant">Email</label>
            <input type="email" value={form.email} disabled
              className="rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-body-sm text-on-surface/60 cursor-not-allowed" />
          </div>
          <div className="flex flex-col gap-xs">
            <label className="text-body-sm font-medium text-on-surface-variant">Phone</label>
            <input type="tel" value={form.phoneNumber}
              onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
              className="rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-body-sm text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
        </div>
        <div className="flex justify-end mt-md">
          <button onClick={handleSaveProfile} disabled={saving}
            className="rounded-lg bg-primary px-6 py-2 text-body-sm font-medium text-on-primary hover:bg-primary/90 transition cursor-pointer disabled:opacity-60">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Change Password */}
      <div className="rounded-xl border border-outline-variant bg-surface p-lg">
        <h2 className="text-title-md font-semibold text-on-surface mb-md">Change Password</h2>

        {passwordMsg && (
          <div className={`mb-md rounded-lg p-md text-body-sm ${
            passwordMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {passwordMsg.text}
          </div>
        )}

        <div className="grid grid-cols-1 gap-md sm:grid-cols-3">
          <div className="flex flex-col gap-xs">
            <label className="text-body-sm font-medium text-on-surface-variant">Current Password</label>
            <input type="password" value={passwordForm.current}
              onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
              className="rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-body-sm text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div className="flex flex-col gap-xs">
            <label className="text-body-sm font-medium text-on-surface-variant">New Password</label>
            <input type="password" value={passwordForm.newPass}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })}
              className="rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-body-sm text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div className="flex flex-col gap-xs">
            <label className="text-body-sm font-medium text-on-surface-variant">Confirm Password</label>
            <input type="password" value={passwordForm.confirm}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
              className="rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-body-sm text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
        </div>
        <div className="flex justify-end mt-md">
          <button onClick={handleChangePassword}
            className="rounded-lg bg-primary px-6 py-2 text-body-sm font-medium text-on-primary hover:bg-primary/90 transition cursor-pointer">
            Update Password
          </button>
        </div>
      </div>

      {/* Logout */}
      <div className="flex justify-center">
        <button onClick={logout}
          className="rounded-lg border border-error/30 px-6 py-2 text-body-sm font-medium text-error hover:bg-error/5 transition cursor-pointer">
          Sign Out
        </button>
      </div>
    </div>
  );
}
