import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, X, Github, Eye, Instagram, Share2, AtSign, Globe, Menu } from 'lucide-react';
import { Logo, cn } from './presentation/components/CommonUI';
import { useApp, AppProvider } from './presentation/context/AppContext';
import { useProjects, useInsights, useInquiries } from './presentation/hooks/useDataHooks';

// Views
import { HomeView } from './presentation/views/HomeView';
import { AllProjectsView, AllInsightsView, InsightDetailView } from './presentation/views/SubViews';
import { AdminDashboard } from './presentation/views/AdminDashboard';
import { AdminAuthView } from './presentation/views/AdminAuthView';
import { TermsView, PrivacyView } from './presentation/views/LegalViews';
import { SEO } from './presentation/components/SEO';
import DevlogView from './presentation/views/DevlogView.jsx';

const MobileMenu = ({ isOpen, onClose, onNavigate, view }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[70] bg-slate-950/70 backdrop-blur-sm"
        />
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          className="fixed top-0 right-0 bottom-0 w-72 z-[80] bg-slate-950 border-l border-white/5 flex flex-col p-8 pt-24"
        >
          <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white">
            <X size={20} />
          </button>
          <nav className="flex flex-col gap-2">
            {[
              { label: 'Projects', view: 'projects' },
              { label: 'Insights', view: 'insights' },
              { label: 'Devlog', view: 'devlog' },
            ].map(item => (
              <button
                key={item.view}
                onClick={() => { onNavigate(item.view); onClose(); }}
                className={cn(
                  'text-left font-mono text-sm uppercase tracking-[0.2em] px-4 py-3 rounded-lg transition-all font-bold',
                  view === item.view ? 'bg-white text-slate-950' : 'text-white/60 hover:text-white hover:bg-white/5'
                )}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <div className="mt-auto pt-8 border-t border-white/5">
            <p className="text-[9px] text-slate-500 font-mono tracking-[0.2em] uppercase">
              Next Idea to Reality.
            </p>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

const AppContent = () => {
  const [view, setView] = useState('home');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrolled, setScrolled] = useState(false);
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { selectedProject, setSelectedProject } = useApp();
  const { data: projects } = useProjects();
  const { data: insights } = useInsights();
  const { data: inquiries } = useInquiries();

  useEffect(() => {
    const updateMouse = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("mousemove", updateMouse);
    window.addEventListener("scroll", handleScroll);
    return () => { window.removeEventListener("mousemove", updateMouse); window.removeEventListener("scroll", handleScroll); };
  }, []);

  useEffect(() => {
    if (logoClickCount === 5) {
      navigate('admin');
      setLogoClickCount(0);
    }
  }, [logoClickCount]);

  useEffect(() => {
    document.body.style.overflow = (selectedProject || mobileMenuOpen) ? 'hidden' : 'unset';
  }, [selectedProject, mobileMenuOpen]);

  const navigate = (nextView, data = null) => {
    setView(nextView);
    if (data) setSelectedPost(data);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-cyan-500 selection:text-white font-mono relative bg-dot-pattern">
      {/* Mouse Tracker — desktop only */}
      <motion.div className="fixed top-0 left-0 w-4 h-4 bg-[#242424] border border-white/20 pointer-events-none z-[100] hidden md:block rounded-full" animate={{ x: mousePosition.x - 8, y: mousePosition.y - 8 }} transition={{ type: "tween", ease: "backOut", duration: 0.1 }} />

      {/* Header */}
      <header className={cn("fixed top-0 w-full px-5 md:px-12 py-4 flex justify-between items-center z-50 transition-all duration-300", scrolled || view !== 'home' ? "bg-slate-950/80 backdrop-blur-md border-b border-white/5" : "bg-transparent")}>
        <Logo onClick={() => {
          if (view === 'home') {
            setLogoClickCount(prev => prev + 1);
            setTimeout(() => setLogoClickCount(0), 3000);
          } else {
            navigate('home');
          }
        }} />

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-2">
          <button onClick={() => navigate('projects')} className={cn("font-mono text-[10px] uppercase tracking-[0.2em] px-4 py-2 rounded transition-all duration-300 font-bold", view === 'projects' ? "bg-white text-slate-950 shadow-lg shadow-white/10" : "text-white/60 hover:text-white hover:bg-[#242424]")}>Projects</button>
          <button onClick={() => navigate('insights')} className={cn("font-mono text-[10px] uppercase tracking-[0.2em] px-4 py-2 rounded transition-all duration-300 font-bold", view === 'insights' ? "bg-white text-slate-950 shadow-lg shadow-white/10" : "text-white/60 hover:text-white hover:bg-[#242424]")}>Insights</button>
          <button onClick={() => navigate('devlog')} className={cn("font-mono text-[10px] uppercase tracking-[0.2em] px-4 py-2 rounded transition-all duration-300 font-bold", view === 'devlog' ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20" : "text-white/60 hover:text-cyan-400 hover:bg-[#242424]")}>Devlog</button>
        </nav>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden p-2 text-white/60 hover:text-white transition-colors"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
      </header>

      {/* Mobile Drawer */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onNavigate={navigate}
        view={view}
      />

      <AnimatePresence mode="wait">
        {view === 'home' && <HomeView key="home" projects={projects} insights={insights} onNavigate={navigate} />}
        {view === 'projects' && <AllProjectsView key="projects" projects={projects} onNavigate={navigate} />}
        {view === 'insights' && <AllInsightsView key="insights" insights={insights} onNavigate={navigate} />}
        {view === 'devlog' && <DevlogView key="devlog" />}
        {view === 'insight-detail' && <InsightDetailView key="detail" post={selectedPost} onNavigate={navigate} />}
        {view === 'terms' && <TermsView key="terms" onNavigate={navigate} />}
        {view === 'privacy' && <PrivacyView key="privacy" onNavigate={navigate} />}
        {view === 'admin' && (
          isAuthorized ? (
            <AdminDashboard key="admin" projects={projects} insights={insights} inquiries={inquiries} onNavigate={navigate} />
          ) : (
            <AdminAuthView key="auth" onAuthorize={() => setIsAuthorized(true)} />
          )
        )}
      </AnimatePresence>

      {/* Project Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedProject(null)} className="fixed inset-0 z-[100] flex items-end md:items-center justify-center md:p-6 bg-slate-950/80 backdrop-blur-sm">
            <SEO
              title={selectedProject.title}
              description={selectedProject.summary || selectedProject.description}
              image={selectedProject.imageUrl}
            />
            <motion.div
              initial={{ opacity: 0, y: 80 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full md:max-w-2xl bg-[#020617] border-t md:border border-white/10 rounded-t-3xl md:rounded-3xl p-6 md:p-10 shadow-2xl max-h-[92vh] overflow-y-auto"
            >
              {/* Drag handle — mobile only */}
              <div className="md:hidden w-10 h-1 bg-white/20 rounded-full mx-auto mb-6" />

              <div className="flex justify-between items-start mb-6">
                <div className="flex flex-wrap gap-2">
                  <span className="font-mono text-[9px] uppercase tracking-widest px-3 py-1 rounded-full border border-cyan-500/30 text-cyan-400 bg-cyan-500/10 font-bold">{selectedProject.status || 'Live'}</span>
                  <span className="font-mono text-[9px] uppercase tracking-widest px-3 py-1 rounded-full border border-slate-500/30 text-slate-400 bg-slate-500/10 font-bold">{Array.isArray(selectedProject.category) ? selectedProject.category.join(' / ') : selectedProject.category}</span>
                </div>
                <button onClick={() => setSelectedProject(null)} className="p-2 text-slate-400 hover:text-white rounded-full flex-shrink-0"><X size={20} /></button>
              </div>
              <h2 className="text-2xl md:text-5xl font-sans font-bold text-white mb-4">{selectedProject.title}</h2>

              {selectedProject.techStack && (
                <div className="flex flex-wrap items-center gap-2 mb-6 font-mono text-[10px] uppercase tracking-wider text-slate-500">
                  <span className="text-cyan-500/80 font-bold">Tech Stack:</span>
                  {(Array.isArray(selectedProject.techStack) ? selectedProject.techStack : [selectedProject.techStack]).map((t, i) => (
                    <span key={i} className="px-2 py-0.5 bg-slate-800 rounded text-slate-400">{t}</span>
                  ))}
                </div>
              )}

              {selectedProject.summary && (
                <p className="text-sm text-slate-400 font-mono mb-8 border-l-2 border-cyan-500/30 pl-4 py-1 italic">{selectedProject.summary}</p>
              )}

              {selectedProject.imageUrl && (
                <div className="mb-10 rounded-2xl overflow-hidden border border-white/5 shadow-xl bg-slate-900/50">
                  <img src={selectedProject.imageUrl} alt={selectedProject.title} className="w-full h-auto object-cover max-h-[300px] md:max-h-[400px]" />
                </div>
              )}

              <div className="space-y-4 text-slate-300 font-mono text-sm leading-relaxed mb-10 prose prose-invert max-w-none border-t border-white/5 pt-10">
                <div dangerouslySetInnerHTML={{ __html: selectedProject.content || selectedProject.description || '' }} />
              </div>

              <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4 border-t border-white/5 pt-8">
                {selectedProject.liveUrl && (
                  <a href={selectedProject.liveUrl} target="_blank" className="w-full sm:w-auto flex items-center justify-center gap-2 text-[10px] uppercase font-bold bg-cyan-500 text-slate-950 px-8 py-4 rounded-xl shadow-lg shadow-cyan-500/20 hover:scale-[1.02] transition-all">
                    <Globe size={16} /> Visit Live Service
                  </a>
                )}
                <div className="flex items-center gap-2 sm:ml-auto">
                  {selectedProject.socialLinks?.github && (
                    <a href={selectedProject.socialLinks.github} target="_blank" className="p-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-colors" title="GitHub">
                      <Github size={20} />
                    </a>
                  )}
                  {selectedProject.socialLinks?.instagram && (
                    <a href={`https://instagram.com/${selectedProject.socialLinks.instagram.replace('@', '')}`} target="_blank" className="p-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-pink-400 transition-colors" title="Instagram">
                      <Instagram size={20} />
                    </a>
                  )}
                  {selectedProject.socialLinks?.tiktok && (
                    <a href={`https://tiktok.com/@${selectedProject.socialLinks.tiktok.replace('@', '')}`} target="_blank" className="p-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-colors" title="TikTok">
                      <Share2 size={20} />
                    </a>
                  )}
                  {selectedProject.socialLinks?.threads && (
                    <a href={`https://threads.net/@${selectedProject.socialLinks.threads.replace('@', '')}`} target="_blank" className="p-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-colors" title="Threads">
                      <AtSign size={20} />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="w-full py-16 px-6 border-t border-white/5 bg-slate-950 relative z-20">
        <div className="max-w-6xl mx-auto flex flex-col gap-10 md:flex-row md:justify-between md:items-center">
          <div className="flex flex-col items-start gap-4">
            <Logo className="grayscale opacity-40 hover:opacity-100" onClick={() => navigate('home')} />
            <p className="text-[9px] text-slate-500 font-mono tracking-[0.2em] uppercase">
              Next Idea to Reality. Independent Builder Studio.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-white/30 font-mono text-[9px] uppercase tracking-[0.2em] font-bold">
            <button onClick={() => view === 'home' ? document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' }) : navigate('home')} className="hover:text-white transition-colors">Works</button>
            <button onClick={() => view === 'home' ? document.getElementById('insights')?.scrollIntoView({ behavior: 'smooth' }) : navigate('home')} className="hover:text-white transition-colors">Archive</button>
            <button onClick={() => view === 'home' ? document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }) : navigate('home')} className="hover:text-white transition-colors">Collaborate</button>
            <div className="hidden md:block w-px h-3 bg-white/10" />
            <button onClick={() => navigate('terms')} className="hover:text-white transition-colors">Terms</button>
            <button onClick={() => navigate('privacy')} className="hover:text-white transition-colors">Privacy</button>
            <span className="text-slate-600 whitespace-nowrap w-full md:w-auto">© {new Date().getFullYear()} Next Idea Lab by Lucifer Co., Ltd.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
