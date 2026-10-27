import { useState } from 'react';

const Help = () => {
  const [search, setSearch] = useState('');
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [expandedQuestions, setExpandedQuestions] = useState({});

  const faqCategories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: 'rocket_launch',
      color: 'from-blue-500 to-cyan-400',
      questions: [
        { q: 'How do I log in to the system?',
          a: 'Navigate to the login page and enter your credentials (email and password). If you don\'t have an account, click the "Register" link to create one. Admins and librarians can use their provided credentials.' },
        { q: 'What are the different user roles?',
          a: 'The system supports three roles: Admin (full system access), Librarian (book management and member services), and Member (borrow books, view history, update profile).' },
        { q: 'How do I reset my password?',
          a: 'Click "Forgot Password" on the login page. Enter your registered email address, and you\'ll receive instructions to reset your password.' },
        { q: 'What browsers are supported?',
          a: 'The Smart Library System supports all modern browsers including Chrome, Firefox, Safari, and Edge. Please ensure your browser is updated to the latest version.' },
      ],
    },
    {
      id: 'account-management',
      title: 'Account Management',
      icon: 'manage_accounts',
      color: 'from-purple-500 to-pink-400',
      questions: [
        { q: 'How do I update my profile information?',
          a: 'Go to your profile page from the dashboard. You can edit your name, email, phone number, and other personal details.' },
        { q: 'What should I do if my account is suspended?',
          a: 'Contact the library administrator to resolve the issue. Account suspensions can occur due to overdue books, membership expiry, or policy violations.' },
        { q: 'How do I cancel my membership?',
          a: 'Submit a cancellation request through your profile settings or contact the library administration. Please ensure all borrowed books are returned before cancellation.' },
      ],
    },
    {
      id: 'book-management',
      title: 'Book Management',
      icon: 'menu_book',
      color: 'from-amber-500 to-orange-400',
      questions: [
        { q: 'How do I add a new book to the library?',
          a: 'Admins and librarians can add books from the Books Management page. Click "Add New Book", fill in the required details (Title, Author, ISBN, etc.), and save.' },
        { q: 'How do I edit or delete a book record?',
          a: 'In the Books table, click the Edit icon next to a book to modify its details. Use the Delete icon to remove a book record. Books that are currently borrowed cannot be deleted.' },
        { q: 'How does the book status work?',
          a: 'Each book displays as "Available" (ready to borrow) or "Borrowed" (currently checked out). The system automatically updates status when books are borrowed or returned.' },
        { q: 'How do I search for a specific book?',
          a: 'Use the search bar on the Books Management page. You can search by title, author, or ISBN. You can also filter by category and status.' },
      ],
    },
    {
      id: 'reports',
      title: 'Reports & Analytics',
      icon: 'bar_chart',
      color: 'from-emerald-500 to-teal-400',
      questions: [
        { q: 'What reports are available?',
          a: 'The Reports page provides borrowing trends, popular books, member statistics, overdue rates, and collection summaries. Filter by date range to customize your view.' },
        { q: 'How do I generate a report?',
          a: 'Navigate to the Reports page, select your desired date range, and click "Generate Full Report". Reports can be exported as PDF or CSV.' },
        { q: 'Can I schedule automated reports?',
          a: 'Yes, from the Settings page under Notifications, you can enable weekly reports to receive automatic summaries via email.' },
      ],
    },
    {
      id: 'technical',
      title: 'Technical Support',
      icon: 'support_agent',
      color: 'from-rose-500 to-red-400',
      questions: [
        { q: 'I encountered an error. What should I do?',
          a: 'First, try refreshing the page. If the issue persists, clear your browser cache and try again. Contact technical support if the problem continues.' },
        { q: 'How do I enable notifications?',
          a: 'Go to Settings > Notifications to toggle email alerts for overdue books, new members, system updates, and more.' },
        { q: 'The page is loading slowly. What can I do?',
          a: 'Check your internet connection. If the system is still slow, it may be due to high traffic. Try again during off-peak hours.' },
        { q: 'How do I report a bug or suggest a feature?',
          a: 'Contact our support team via email at support@smartlibrary.com or call (555) 987-6543 with details about the issue or suggestion.' },
      ],
    },
  ];

  const toggleCategory = (id) => setExpandedCategory(expandedCategory === id ? null : id);

  const toggleQuestion = (catId, qIdx) => {
    const key = `${catId}-${qIdx}`;
    setExpandedQuestions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredCategories = faqCategories.filter((cat) =>
    cat.title.toLowerCase().includes(search.toLowerCase()) ||
    cat.questions.some((q) => q.q.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-lg">
      {/* ── Hero Header ── */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-xl text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-md">
          <span className="material-symbols-outlined text-4xl text-primary">help</span>
        </div>
        <h1 className="text-headline-lg text-on-surface font-bold">Help Center</h1>
        <p className="text-body-md text-on-surface-variant mt-xs max-w-xl mx-auto">
          Find quick answers to common questions about the Smart Library System
        </p>
        {/* ── Search ── */}
        <div className="max-w-md mx-auto mt-lg relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
          <input
            type="text"
            placeholder="Search FAQs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-md py-sm rounded-xl border border-outline-variant bg-surface text-body-md text-on-surface
              placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm"
          />
        </div>
      </div>

      {/* ── Quick Links ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-md">
        {[
          { icon: 'rocket_launch', label: 'Getting Started', color: 'bg-blue-50 text-blue-600', border: 'border-blue-100' },
          { icon: 'manage_accounts', label: 'Account', color: 'bg-purple-50 text-purple-600', border: 'border-purple-100' },
          { icon: 'menu_book', label: 'Books', color: 'bg-amber-50 text-amber-600', border: 'border-amber-100' },
          { icon: 'bar_chart', label: 'Reports', color: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100' },
        ].map((link, i) => (
          <button key={i} onClick={() => {
            const idx = faqCategories.findIndex(c => c.id === link.label.toLowerCase().replace(' ', '-'));
            setExpandedCategory(faqCategories[idx]?.id || faqCategories[0].id);
          }}
            className={`flex items-center gap-sm p-md rounded-xl border ${link.border} bg-surface hover:shadow-sm transition-all cursor-pointer`}
          >
            <div className={`w-9 h-9 rounded-lg ${link.color} flex items-center justify-center`}>
              <span className="material-symbols-outlined text-lg">{link.icon}</span>
            </div>
            <span className="text-label-sm font-medium text-on-surface">{link.label}</span>
          </button>
        ))}
      </div>

      {/* ── FAQ Sections ── */}
      <div className="space-y-md max-w-4xl mx-auto">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-xl bg-surface border border-outline-variant rounded-xl">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/30">search_off</span>
            <p className="text-body-md text-on-surface-variant mt-md">No FAQs found for "<strong>{search}</strong>"</p>
            <button onClick={() => setSearch('')} className="mt-md text-label-sm font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer">
              Clear search
            </button>
          </div>
        ) : (
          filteredCategories.map((cat) => (
            <div key={cat.id} className="bg-surface border border-outline-variant rounded-xl overflow-hidden hover:shadow-sm transition-shadow">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(cat.id)}
                className="w-full flex items-center justify-between p-md hover:bg-surface-container/50 transition-colors"
              >
                <div className="flex items-center gap-md">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-sm`}>
                    <span className="material-symbols-outlined text-lg text-white">{cat.icon}</span>
                  </div>
                  <div className="text-left">
                    <h3 className="text-body-md text-on-surface font-semibold">{cat.title}</h3>
                    <p className="text-label-lg text-on-surface-variant">{cat.questions.length} question{cat.questions.length > 1 ? 's' : ''}</p>
                  </div>
                </div>
                <span className={`material-symbols-outlined text-on-surface-variant transition-transform duration-200
                  ${expandedCategory === cat.id ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>

              {/* Expanded Questions */}
              {expandedCategory === cat.id && (
                <div className="border-t border-outline-variant">
                  {cat.questions.map((item, idx) => {
                    const key = `${cat.id}-${idx}`;
                    const isOpen = expandedQuestions[key];
                    return (
                      <div key={idx} className="border-b border-outline-variant/50 last:border-b-0">
                        <button
                          onClick={() => toggleQuestion(cat.id, idx)}
                          className="w-full flex items-center justify-between px-md py-sm hover:bg-surface-container/30 transition-colors"
                        >
                          <div className="flex items-start gap-sm pr-md">
                            <span className="material-symbols-outlined text-sm text-primary mt-0.5 flex-shrink-0">help_outline</span>
                            <span className="text-body-sm text-on-surface font-medium text-left">{item.q}</span>
                          </div>
                          <span className={`material-symbols-outlined text-on-surface-variant text-lg transition-transform flex-shrink-0
                            ${isOpen ? 'rotate-180' : ''}`}>
                            expand_more
                          </span>
                        </button>
                        {isOpen && (
                          <div className="px-md pb-sm pl-10">
                            <p className="text-body-sm text-on-surface-variant leading-relaxed">
                              {item.a}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* ── Contact Support ── */}
      <div className="max-w-4xl mx-auto bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-xl text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-md">
          <span className="material-symbols-outlined text-3xl text-primary">headset_mic</span>
        </div>
        <h3 className="text-title-md text-on-surface font-bold mb-sm">Still Need Help?</h3>
        <p className="text-body-sm text-on-surface-variant mb-lg max-w-lg mx-auto">
          Our support team is ready to assist you with any questions or issues
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-md">
          <a href="mailto:support@smartlibrary.com"
            className="flex items-center gap-sm px-lg py-sm rounded-lg bg-primary text-on-primary font-medium text-body-sm
              hover:bg-primary/90 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-lg">mail</span>
            support@smartlibrary.com
          </a>
          <a href="tel:+15551234567"
            className="flex items-center gap-sm px-lg py-sm rounded-lg border border-outline-variant text-on-surface font-medium text-body-sm
              hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-lg">call</span>
            (555) 987-6543
          </a>
        </div>
        <p className="text-label-lg text-on-surface-variant mt-md flex items-center justify-center gap-xs">
          <span className="material-symbols-outlined text-sm">schedule</span>
          Available Mon–Fri, 8:00 AM – 6:00 PM
        </p>
      </div>
    </div>
  );
};

export default Help;
