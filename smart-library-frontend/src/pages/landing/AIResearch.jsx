import { Link } from 'react-router-dom';
import Footer from '../../components/common/Footer';
import PublicHeader from '../../components/common/PublicHeader';

const CAPABILITIES = [
  {
    icon: 'search_insights',
    title: 'Neural Semantic Search',
    description: 'Go beyond keywords. Our AI understands the meaning behind your queries, finding relevant papers even when they use different terminology.',
    features: ['Cross-lingual search support', 'Concept-based matching', 'Context-aware results ranking', 'Similar paper discovery'],
  },
  {
    icon: 'auto_awesome',
    title: 'Auto-Citation Generator',
    description: 'Generate perfectly formatted citations in any major style with one click. Supports APA 7th, MLA 9th, Chicago, Harvard, and 50+ more.',
    features: ['One-click citation generation', '50+ citation styles', 'Bibliography export (BibTeX, RIS, EndNote)', 'DOI & ISBN auto-lookup'],
  },
  {
    icon: 'analytics',
    title: 'Research Impact Analytics',
    description: 'Track citation metrics, h-index trends, journal impact factors, and research output analytics for your entire institution.',
    features: ['Citation network visualization', 'Author impact profiles', 'Journal ranking insights', 'Research trend forecasting'],
  },
  {
    icon: 'summarize',
    title: 'AI Paper Summarizer',
    description: 'Get concise, accurate summaries of academic papers. Our AI extracts key findings, methodology, and conclusions in seconds.',
    features: ['Abstract-level summaries', 'Methodology extraction', 'Key findings highlight', 'Multi-paper comparison'],
  },
  {
    icon: 'translate',
    title: 'Multi-Language Support',
    description: 'Break language barriers with real-time translation of academic content across 95+ languages while preserving technical terminology.',
    features: ['95+ language support', 'Technical term preservation', 'Real-time page translation', 'Bilingual side-by-side view'],
  },
  {
    icon: 'database',
    title: 'Integrated Data Repositories',
    description: 'Connect to major research databases, preprint servers, and institutional repositories from a single unified search interface.',
    features: ['PubMed, arXiv, IEEE integration', 'Institutional repository sync', 'Open access filtering', 'API for custom integrations'],
  },
];

export default function AIResearch() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-surface via-surface to-surface-container-low py-xl">
        <div className="absolute top-10 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-20 w-64 h-64 bg-secondary/5 rounded-full blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-margin-desktop relative z-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-sm mb-md">
              <span className="material-symbols-outlined text-primary text-3xl">smart_toy</span>
              <span className="text-primary font-semibold text-label-lg">AI-POWERED RESEARCH</span>
            </div>
            <h1 className="text-display-lg font-bold text-on-surface mb-md">
              AI Research <span className="text-primary">Assistant</span>
            </h1>
            <p className="text-body-md text-on-surface-variant max-w-2xl mb-lg leading-relaxed">
              Supercharge your academic research with our intelligent AI assistant. 
              From neural semantic search to automatic citation generation, discover 
              how machine learning transforms the research workflow.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-sm px-lg py-md bg-primary text-white font-semibold rounded-xl hover:bg-primary-container transition-all shadow-lg shadow-primary/20"
            >
              Try AI Research <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Capabilities Grid */}
      <section className="max-w-7xl mx-auto px-margin-desktop py-xl">
        <div className="text-center mb-xl">
          <h2 className="text-headline-lg font-bold text-on-surface mb-sm">Key Capabilities</h2>
          <p className="text-body-md text-on-surface-variant max-w-2xl mx-auto">
            Advanced AI tools designed specifically for academic research workflows
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-lg">
          {CAPABILITIES.map((c, i) => (
            <div
              key={i}
              className="bg-surface border border-outline-variant rounded-xl p-lg hover:shadow-lg hover:border-primary/30 transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-primary-container/20 rounded-xl flex items-center justify-center mb-md group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-primary">{c.icon}</span>
              </div>
              <h3 className="text-title-md font-bold text-on-surface mb-xs">{c.title}</h3>
              <p className="text-body-sm text-on-surface-variant mb-md">{c.description}</p>
              <ul className="space-y-1">
                {c.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-sm text-body-sm text-on-surface-variant">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-surface-container-low py-xl">
        <div className="max-w-7xl mx-auto px-margin-desktop">
          <h2 className="text-headline-lg font-bold text-on-surface text-center mb-xl">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-lg">
            {[
              { step: '01', title: 'Ask Your Question', desc: 'Type a natural language query or paste a research question.' },
              { step: '02', title: 'AI Analyzes', desc: 'Our neural engine searches millions of papers for relevant content.' },
              { step: '03', title: 'Review Results', desc: 'Browse ranked results with AI-generated summaries and citations.' },
              { step: '04', title: 'Export & Cite', desc: 'Export your findings with auto-generated citations in any format.' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-md">
                  <span className="text-primary font-bold text-headline-sm">{s.step}</span>
                </div>
                <h3 className="text-title-md font-bold text-on-surface mb-xs">{s.title}</h3>
                <p className="text-body-sm text-on-surface-variant">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
