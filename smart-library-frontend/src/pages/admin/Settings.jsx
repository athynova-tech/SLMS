import { useState } from 'react';

const Settings = () => {
  const [activeSection, setActiveSection] = useState('general');

  // ─── General Settings ───
  const [general, setGeneral] = useState({
    libraryName: 'Smart Library System',
    address: '123 Knowledge Street, Learning City, ED 54321',
    contactEmail: 'admin@smartlibrary.com',
    phone: '(555) 123-4567',
  });

  // ─── Library Info ───
  const [libraryInfo, setLibraryInfo] = useState({
    monFriOpen: '08:00',
    monFriClose: '20:00',
    satOpen: '09:00',
    satClose: '17:00',
    sunOpen: '10:00',
    sunClose: '16:00',
    maxBooksPerMember: '5',
    loanPeriodDays: '14',
  });

  // ─── Notification Toggles ───
  const [notifications, setNotifications] = useState({
    overdueAlerts: true,
    newMemberRegistration: true,
    bookReturnReminders: true,
    systemUpdates: false,
    weeklyReports: true,
    fineNotifications: true,
  });

  // ─── Security ───
  const [password, setPassword] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [saveMessage, setSaveMessage] = useState('');

  const sections = [
    { id: 'general', label: 'General', icon: 'settings' },
    { id: 'library', label: 'Library Info', icon: 'library_building' },
    { id: 'notifications', label: 'Notifications', icon: 'notifications' },
    { id: 'security', label: 'Security', icon: 'security' },
  ];

  const handleGeneralChange = (e) => {
    setGeneral((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLibraryInfoChange = (e) => {
    setLibraryInfo((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleNotificationToggle = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePasswordChange = (e) => {
    setPassword((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaveMessage('Settings saved successfully!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  return (
    <div className="space-y-lg">
      {/* ── Page Header ── */}
      <h1 className="text-headline-lg text-on-surface font-bold">Settings</h1>

      {/* ── Success Message ── */}
      {saveMessage && (
        <div className="px-md py-sm rounded-lg bg-tertiary-container/20 text-tertiary text-body-sm flex items-center gap-sm">
          <span className="material-symbols-outlined text-lg">check_circle</span>
          {saveMessage}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-lg">
        {/* ── Sidebar Tabs ── */}
        <div className="lg:w-56 flex-shrink-0">
          <nav className="flex lg:flex-col gap-sm overflow-x-auto lg:overflow-x-visible pb-sm lg:pb-0">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-sm px-md py-sm rounded-lg text-body-sm font-medium transition-all whitespace-nowrap
                  ${activeSection === section.id
                    ? 'bg-primary-container/20 text-primary'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'}`}
              >
                <span className="material-symbols-outlined text-lg">{section.icon}</span>
                {section.label}
              </button>
            ))}
          </nav>
        </div>

        {/* ── Content ── */}
        <div className="flex-1 bg-surface border border-outline-variant rounded-xl p-lg">
          <form onSubmit={handleSave}>
            {/* ────── GENERAL ────── */}
            {activeSection === 'general' && (
              <div className="space-y-md">
                <h2 className="text-title-md text-on-surface font-semibold mb-md">General Settings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  <div>
                    <label className="block text-body-sm text-on-surface font-medium mb-xs">Library Name</label>
                    <input type="text" name="libraryName" value={general.libraryName} onChange={handleGeneralChange}
                      className="w-full px-md py-sm rounded-lg border border-outline-variant bg-surface text-on-surface text-body-sm
                        focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-body-sm text-on-surface font-medium mb-xs">Contact Email</label>
                    <input type="email" name="contactEmail" value={general.contactEmail} onChange={handleGeneralChange}
                      className="w-full px-md py-sm rounded-lg border border-outline-variant bg-surface text-on-surface text-body-sm
                        focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-body-sm text-on-surface font-medium mb-xs">Address</label>
                    <textarea name="address" value={general.address} onChange={handleGeneralChange} rows={2}
                      className="w-full px-md py-sm rounded-lg border border-outline-variant bg-surface text-on-surface text-body-sm
                        focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none" />
                  </div>
                  <div>
                    <label className="block text-body-sm text-on-surface font-medium mb-xs">Phone</label>
                    <input type="text" name="phone" value={general.phone} onChange={handleGeneralChange}
                      className="w-full px-md py-sm rounded-lg border border-outline-variant bg-surface text-on-surface text-body-sm
                        focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
                  </div>
                </div>
              </div>
            )}

            {/* ────── LIBRARY INFO ────── */}
            {activeSection === 'library' && (
              <div className="space-y-md">
                <h2 className="text-title-md text-on-surface font-semibold mb-md">Library Information</h2>
                <h3 className="text-body-md text-on-surface font-medium mb-sm">Operating Hours</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                  <div>
                    <label className="block text-body-sm text-on-surface font-medium mb-xs">Mon–Fri Open</label>
                    <input type="time" name="monFriOpen" value={libraryInfo.monFriOpen} onChange={handleLibraryInfoChange}
                      className="w-full px-md py-sm rounded-lg border border-outline-variant bg-surface text-on-surface text-body-sm
                        focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-body-sm text-on-surface font-medium mb-xs">Mon–Fri Close</label>
                    <input type="time" name="monFriClose" value={libraryInfo.monFriClose} onChange={handleLibraryInfoChange}
                      className="w-full px-md py-sm rounded-lg border border-outline-variant bg-surface text-on-surface text-body-sm
                        focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
                  </div>
                  <div />
                  <div>
                    <label className="block text-body-sm text-on-surface font-medium mb-xs">Saturday Open</label>
                    <input type="time" name="satOpen" value={libraryInfo.satOpen} onChange={handleLibraryInfoChange}
                      className="w-full px-md py-sm rounded-lg border border-outline-variant bg-surface text-on-surface text-body-sm
                        focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-body-sm text-on-surface font-medium mb-xs">Saturday Close</label>
                    <input type="time" name="satClose" value={libraryInfo.satClose} onChange={handleLibraryInfoChange}
                      className="w-full px-md py-sm rounded-lg border border-outline-variant bg-surface text-on-surface text-body-sm
                        focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
                  </div>
                  <div />
                  <div>
                    <label className="block text-body-sm text-on-surface font-medium mb-xs">Sunday Open</label>
                    <input type="time" name="sunOpen" value={libraryInfo.sunOpen} onChange={handleLibraryInfoChange}
                      className="w-full px-md py-sm rounded-lg border border-outline-variant bg-surface text-on-surface text-body-sm
                        focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-body-sm text-on-surface font-medium mb-xs">Sunday Close</label>
                    <input type="time" name="sunClose" value={libraryInfo.sunClose} onChange={handleLibraryInfoChange}
                      className="w-full px-md py-sm rounded-lg border border-outline-variant bg-surface text-on-surface text-body-sm
                        focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
                  </div>
                  <div />
                </div>

                <h3 className="text-body-md text-on-surface font-medium mb-sm mt-md">Borrowing Rules</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  <div>
                    <label className="block text-body-sm text-on-surface font-medium mb-xs">Max Books Per Member</label>
                    <input type="number" name="maxBooksPerMember" value={libraryInfo.maxBooksPerMember} onChange={handleLibraryInfoChange}
                      className="w-full px-md py-sm rounded-lg border border-outline-variant bg-surface text-on-surface text-body-sm
                        focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-body-sm text-on-surface font-medium mb-xs">Loan Period (days)</label>
                    <input type="number" name="loanPeriodDays" value={libraryInfo.loanPeriodDays} onChange={handleLibraryInfoChange}
                      className="w-full px-md py-sm rounded-lg border border-outline-variant bg-surface text-on-surface text-body-sm
                        focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
                  </div>
                </div>
              </div>
            )}

            {/* ────── NOTIFICATIONS ────── */}
            {activeSection === 'notifications' && (
              <div className="space-y-md">
                <h2 className="text-title-md text-on-surface font-semibold mb-md">Notification Preferences</h2>
                <p className="text-body-sm text-on-surface-variant mb-md">Manage email notification settings for your library.</p>
                <div className="space-y-sm">
                  {[
                    { key: 'overdueAlerts', label: 'Overdue Alerts', desc: 'Send notifications when books are overdue' },
                    { key: 'newMemberRegistration', label: 'New Member Registration', desc: 'Alert when a new member registers' },
                    { key: 'bookReturnReminders', label: 'Book Return Reminders', desc: 'Remind members about upcoming due dates' },
                    { key: 'systemUpdates', label: 'System Updates', desc: 'Receive updates about library system changes' },
                    { key: 'weeklyReports', label: 'Weekly Reports', desc: 'Receive weekly library activity summary' },
                    { key: 'fineNotifications', label: 'Fine Notifications', desc: 'Alert members about outstanding fines' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between py-sm px-md rounded-lg hover:bg-surface-container/50 transition-colors">
                      <div>
                        <p className="text-body-sm text-on-surface font-medium">{item.label}</p>
                        <p className="text-label-lg text-on-surface-variant">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications[item.key]}
                          onChange={() => handleNotificationToggle(item.key)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-outline-variant rounded-full peer peer-checked:bg-primary peer-focus:ring-2 peer-focus:ring-primary/30 transition-colors" />
                        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${notifications[item.key] ? 'translate-x-5' : ''}`} />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ────── SECURITY ────── */}
            {activeSection === 'security' && (
              <div className="space-y-md max-w-md">
                <h2 className="text-title-md text-on-surface font-semibold mb-md">Security</h2>
                <p className="text-body-sm text-on-surface-variant mb-md">Update your password below.</p>
                <div className="space-y-md">
                  <div>
                    <label className="block text-body-sm text-on-surface font-medium mb-xs">Current Password</label>
                    <input type="password" name="currentPassword" value={password.currentPassword} onChange={handlePasswordChange}
                      className="w-full px-md py-sm rounded-lg border border-outline-variant bg-surface text-on-surface text-body-sm
                        focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-body-sm text-on-surface font-medium mb-xs">New Password</label>
                    <input type="password" name="newPassword" value={password.newPassword} onChange={handlePasswordChange}
                      className="w-full px-md py-sm rounded-lg border border-outline-variant bg-surface text-on-surface text-body-sm
                        focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-body-sm text-on-surface font-medium mb-xs">Confirm New Password</label>
                    <input type="password" name="confirmPassword" value={password.confirmPassword} onChange={handlePasswordChange}
                      className="w-full px-md py-sm rounded-lg border border-outline-variant bg-surface text-on-surface text-body-sm
                        focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
                  </div>
                </div>
              </div>
            )}

            {/* ── Save Button ── */}
            <div className="border-t border-outline-variant mt-lg pt-lg">
              <button
                type="submit"
                className="px-xl py-sm rounded-lg bg-primary text-on-primary font-semibold text-body-md
                  hover:bg-primary/90 transition-colors shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
