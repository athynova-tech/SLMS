import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../../components/common/Footer';
import PublicHeader from '../../components/common/PublicHeader';

const BENTO_CARDS = [
  {
    title: 'AI Research Assistant',
    description: 'Neural semantic search across millions of academic papers with auto-citation generation.',
    icon: 'smart_toy',
    features: ['Neural Search', 'Auto-Citation Tags'],
    className: 'md:col-span-7 md:row-span-2',
    gradient: 'from-primary/5 to-primary-container/10',
  },
  {
    title: 'Digital Archive',
    description: 'Access over 1.2 million volumes including rare manuscripts, journals, and theses.',
    icon: 'auto_stories',
    features: ['1.2M+ Volumes', '24/7 Access'],
    className: 'md:col-span-5',
    gradient: 'from-secondary/5 to-secondary-container/10',
  },
  {
    title: 'Real-time Analytics',
    description: 'Live usage analytics showing 84% active engagement across all departments.',
    icon: 'monitoring',
    features: ['84% Live Usage', 'Predictive Insights'],
    className: 'md:col-span-5',
    gradient: 'from-tertiary/5 to-tertiary-container/10',
  },
  {
    title: 'Collaborative Workspace',
    description: 'Real-time collaboration tools for researchers across continents.',
    icon: 'groups',
    features: ['Multi-user Editing', 'Version Control'],
    className: 'md:col-span-7',
    gradient: 'from-primary/5 to-primary-container/10',
  },
];

const WEEKLY_DATA = [
  { day: 'Mon', value: 65 },
  { day: 'Tue', value: 72 },
  { day: 'Wed', value: 85 },
  { day: 'Thu', value: 58 },
  { day: 'Fri', value: 91 },
  { day: 'Sat', value: 45 },
  { day: 'Sun', value: 38 },
];

const FadeInSection = ({ children, className = '' }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${className}`}
    >
      {children}
    </div>
  );
};

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* ─── Top Navigation (shared across public pages) ─── */}
      <PublicHeader />

      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-surface via-surface to-surface-container-low">
        {/* Abstract background elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-20 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-40 w-48 h-48 bg-tertiary/5 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-margin-desktop py-xl md:py-[120px] relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-display-lg md:text-display-lg text-4xl md:text-5xl font-bold text-on-surface leading-tight mb-md">
              Empowering Scholars through{' '}
              <span className="text-primary">Artificial Intelligence</span>
            </h1>
            <p className="text-body-md text-on-surface-variant max-w-2xl mb-lg leading-relaxed">
              Experience the next generation of academic libraries. Our AI-powered platform
              combines advanced neural search, real-time analytics, and collaborative tools
              to transform how researchers discover, analyze, and share knowledge.
            </p>
            <div className="flex flex-wrap gap-md">
              <Link
                to="/register"
                className="inline-flex items-center gap-sm px-lg py-md bg-primary text-white font-semibold rounded-xl hover:bg-primary-container transition-all shadow-lg shadow-primary/20"
              >
                Get Started
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
              <Link
                to="/features"
                className="inline-flex items-center gap-sm px-lg py-md border border-outline-variant text-on-surface font-medium rounded-xl hover:bg-surface-container-high transition-all"
              >
                <span className="material-symbols-outlined">play_circle</span>
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Bento Grid Features ─── */}
      <section className="max-w-7xl mx-auto px-margin-desktop py-xl">
        <FadeInSection>
          <div className="text-center mb-xl">
            <h2 className="text-headline-lg font-bold text-on-surface mb-sm">
              Everything you need to accelerate research
            </h2>
            <p className="text-body-md text-on-surface-variant max-w-2xl mx-auto">
              Intelligent tools designed for the modern scholar
            </p>
          </div>
        </FadeInSection>

        <div className="bento-grid grid-cols-1 md:grid-cols-12 gap-lg">
          {BENTO_CARDS.map((card, index) => (
            <FadeInSection key={index} className={card.className}>
              <div
                className={`h-full bg-gradient-to-br ${card.gradient} bg-surface border border-outline-variant rounded-xl p-lg hover:shadow-lg hover:border-primary/30 transition-all duration-300 group cursor-pointer`}
              >
                <div className="flex items-start gap-md mb-md">
                  <div className="w-12 h-12 bg-primary-container/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-primary">{card.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-title-md font-bold text-on-surface mb-xs">{card.title}</h3>
                    <p className="text-body-sm text-on-surface-variant">{card.description}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-sm mt-auto">
                  {card.features.map((feat, i) => (
                    <span
                      key={i}
                      className="px-sm py-xs bg-primary-container/20 text-on-primary-container text-label-lg font-medium rounded-full"
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              </div>
            </FadeInSection>
          ))}
        </div>
      </section>

      {/* ─── Data-Driven Curation ─── */}
      <section className="bg-surface-container-low py-xl">
        <div className="max-w-7xl mx-auto px-margin-desktop">
          <div className="grid md:grid-cols-2 gap-xl items-center">
            <FadeInSection>
              <div>
                <h2 className="text-headline-lg font-bold text-on-surface mb-md">
                  Data-Driven Collection Curation
                </h2>
                <p className="text-body-md text-on-surface-variant mb-lg">
                  Our intelligent system analyzes usage patterns, citation networks, and
                  emerging research trends to optimize your library's collection.
                </p>
                <ul className="space-y-md">
                  {[
                    { icon: 'trending_up', title: 'Predictive Acquisition', desc: 'AI forecasts which resources will be in demand next semester.' },
                    { icon: 'grid_on', title: 'Usage Heatmaps', desc: 'Visualize peak usage times and popular sections across your library.' },
                    { icon: 'rss_feed', title: 'RFID Tracking', desc: 'Real-time inventory tracking with smart shelf management.' },
                  ].map((item, i) => (
                    <li key={i} className="flex gap-md p-md bg-surface rounded-lg border border-outline-variant">
                      <div className="w-10 h-10 bg-primary-container/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-primary text-[20px]">{item.icon}</span>
                      </div>
                      <div>
                        <h4 className="text-body-md font-semibold text-on-surface">{item.title}</h4>
                        <p className="text-body-sm text-on-surface-variant">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeInSection>

            <FadeInSection>
              {/* Mock Bar Chart */}
              <div className="bg-surface rounded-xl border border-outline-variant p-lg shadow-sm">
                <div className="flex items-center justify-between mb-md">
                  <h3 className="text-title-md font-bold text-on-surface">Weekly Activity</h3>
                  <span className="text-label-lg text-primary font-medium">+12.5% vs last week</span>
                </div>
                <div className="flex items-end justify-between gap-sm h-48 pt-md">
                  {WEEKLY_DATA.map((item, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-xs group">
                      <span className="text-label-lg text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.value}
                      </span>
                      <div
                        className="w-full bg-gradient-to-t from-primary to-primary-container rounded-t-md transition-all duration-500 hover:from-secondary hover:to-secondary-container cursor-pointer relative"
                        style={{
                          height: `${item.value}%`,
                          animation: `barRise 0.6s ease-out ${i * 0.1}s both`,
                        }}
                      >
                        <div className="absolute inset-0 bg-white/10 rounded-t-md opacity-0 hover:opacity-100 transition-opacity"></div>
                      </div>
                      <span className="text-label-lg text-on-surface-variant">{item.day}</span>
                    </div>
                  ))}
                </div>
                <style>{`
                  @keyframes barRise {
                    from { height: 0%; }
                  }
                `}</style>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="bg-primary py-xl">
        <div className="max-w-4xl mx-auto px-margin-desktop text-center">
          <h2 className="text-headline-lg font-bold text-white mb-md">
            Ready to modernize your institution?
          </h2>
          <p className="text-body-md text-white/80 mb-lg max-w-2xl mx-auto">
            Join thousands of institutions already using Smart Library System to transform
            their research capabilities.
          </p>
          <div className="flex flex-wrap justify-center gap-md">
            <Link
              to="/register"
              className="inline-flex items-center gap-sm px-lg py-md bg-white text-primary font-semibold rounded-xl hover:bg-surface-container-low transition-all shadow-lg"
            >
              Start Free Trial
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-sm px-lg py-md border border-white/30 text-white font-medium rounded-xl hover:bg-white/10 transition-all"
            >
              <span className="material-symbols-outlined">call</span>
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <Footer />
    </div>
  );
};

export default Home;
