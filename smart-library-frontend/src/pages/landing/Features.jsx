import { Link } from 'react-router-dom';
import Footer from '../../components/common/Footer';
import PublicHeader from '../../components/common/PublicHeader';

const FEATURES = [
  {
    icon: 'smart_toy',
    title: 'AI Research Assistant',
    description: 'Neural semantic search across millions of academic papers with auto-citation generation. Our AI understands context, not just keywords.',
    details: [
      'Natural language query processing',
      'Auto-citation generation in APA, MLA, Chicago styles',
      'Semantic similarity matching across disciplines',
      'Real-time paper recommendations',
    ],
    gradient: 'from-primary/5 to-primary-container/10',
  },
  {
    icon: 'auto_stories',
    title: 'Digital Archive',
    description: 'Access over 1.2 million volumes including rare manuscripts, journals, and theses with 24/7 availability.',
    details: [
      '1.2M+ digitized volumes and counting',
      'Rare manuscript preservation with OCR',
      'Multi-format support (PDF, EPUB, MOBI)',
      'Offline reading capability',
    ],
    gradient: 'from-secondary/5 to-secondary-container/10',
  },
  {
    icon: 'monitoring',
    title: 'Real-time Analytics',
    description: 'Live usage analytics showing 84% active engagement across departments with predictive insights.',
    details: [
      '84% live engagement tracking',
      'Predictive acquisition recommendations',
      'Usage heatmaps and peak hour analysis',
      'Collection performance dashboards',
    ],
    gradient: 'from-tertiary/5 to-tertiary-container/10',
  },
  {
    icon: 'groups',
    title: 'Collaborative Workspace',
    description: 'Real-time collaboration tools for researchers across continents with version control.',
    details: [
      'Multi-user document editing',
      'Built-in version control & history',
      'Annotation and commenting system',
      'Research group workspaces',
    ],
    gradient: 'from-primary/5 to-primary-container/10',
  },
  {
    icon: 'headphones',
    title: 'Audiobooks & Multimedia',
    description: 'Listen to academic content on the go with our growing audiobook library and multimedia resources.',
    details: [
      'Professional narration of key texts',
      'Sync across devices with bookmarking',
      'Variable speed playback',
      'Text-to-speech for any document',
    ],
    gradient: 'from-secondary/5 to-secondary-container/10',
  },
  {
    icon: 'qr_code_scanner',
    title: 'Smart RFID & QR Tracking',
    description: 'Real-time inventory tracking with smart shelf management and QR code checkout.',
    details: [
      'RFID-enabled smart shelves',
      'QR code quick-checkout system',
      'Automated inventory audits',
      'Real-time location tracking',
    ],
    gradient: 'from-tertiary/5 to-tertiary-container/10',
  },
  {
    icon: 'event_seat',
    title: 'Study Space Management',
    description: 'Reserve study rooms and seats with real-time availability, attendance tracking, and capacity management.',
    details: [
      'Real-time seat availability maps',
      'Study room booking with duration limits',
      'Attendance check-in/check-out',
      'Capacity analytics & optimization',
    ],
    gradient: 'from-primary/5 to-primary-container/10',
  },
  {
    icon: 'security',
    title: 'Enterprise Security',
    description: 'Role-based access control, encrypted data, and comprehensive audit trails for institutional compliance.',
    details: [
      'Role-based access (Admin, Librarian, Member)',
      'End-to-end encrypted communications',
      'Audit logging & compliance reporting',
      'Two-factor authentication support',
    ],
    gradient: 'from-secondary/5 to-secondary-container/10',
  },
];

export default function Features() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <PublicHeader />

      {/* Hero */}
      <section className="bg-gradient-to-br from-surface via-surface to-surface-container-low py-xl">
        <div className="max-w-7xl mx-auto px-margin-desktop text-center">
          <h1 className="text-display-lg font-bold text-on-surface mb-md">
            Everything You Need to <span className="text-primary">Accelerate Research</span>
          </h1>
          <p className="text-body-md text-on-surface-variant max-w-3xl mx-auto mb-xl">
            From AI-powered research assistance to comprehensive digital archives, 
            Smart Library System provides all the tools modern institutions need.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-margin-desktop py-xl">
        <div className="grid md:grid-cols-2 gap-lg">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className={`bg-gradient-to-br ${f.gradient} border border-outline-variant rounded-xl p-lg hover:shadow-lg hover:border-primary/30 transition-all duration-300`}
            >
              <div className="flex items-start gap-md mb-md">
                <div className="w-12 h-12 bg-primary-container/20 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">{f.icon}</span>
                </div>
                <div>
                  <h3 className="text-title-md font-bold text-on-surface mb-xs">{f.title}</h3>
                  <p className="text-body-sm text-on-surface-variant">{f.description}</p>
                </div>
              </div>
              <ul className="space-y-xs">
                {f.details.map((d, j) => (
                  <li key={j} className="flex items-center gap-sm text-body-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-xl">
        <div className="max-w-4xl mx-auto px-margin-desktop text-center">
          <h2 className="text-headline-lg font-bold text-white mb-md">Ready to get started?</h2>
          <p className="text-body-md text-white/80 mb-lg">Join thousands of institutions already using Smart Library System.</p>
          <div className="flex flex-wrap justify-center gap-md">
            <Link to="/register" className="inline-flex items-center gap-sm px-lg py-md bg-white text-primary font-semibold rounded-xl hover:bg-surface-container-low transition-all shadow-lg">
              Start Free Trial <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
            <Link to="/" className="inline-flex items-center gap-sm px-lg py-md border border-white/30 text-white font-medium rounded-xl hover:bg-white/10 transition-all">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
