import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronRight, ArrowLeft, Filter } from 'lucide-react';
import { ProjectCard, InsightItem } from '../components/DataItems';
import { cn } from '../components/CommonUI';
import { SEO } from '../components/SEO';

export const AllProjectsView = ({ projects, onNavigate }) => {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('All');
    const [showFilters, setShowFilters] = useState(false);
    const categories = useMemo(() => ['All', ...new Set(projects.flatMap(p => Array.isArray(p.category) ? p.category : [p.category]).filter(Boolean))], [projects]);
    const filtered = useMemo(() => projects.filter(p => (filter === 'All' || (Array.isArray(p.category) ? p.category.includes(filter) : p.category === filter)) && (p.title.toLowerCase().includes(search.toLowerCase()))), [search, filter, projects]);

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pt-28 md:pt-32 pb-40 px-4 md:px-6 max-w-6xl mx-auto font-mono">
            <nav className="flex items-center gap-2 mb-8 text-[10px] uppercase tracking-widest text-slate-500 font-bold"><button onClick={() => onNavigate('home')} className="hover:text-white transition-colors">Home</button><ChevronRight size={10} /><span className="text-cyan-400">Projects</span></nav>
            <div className="flex flex-col gap-6 mb-12">
                <div>
                    <h2 className="text-3xl md:text-6xl font-sans font-medium tracking-tight bg-gradient-to-br from-slate-300 to-slate-500 bg-clip-text text-transparent mb-3">Explore Lab.</h2>
                    <p className="text-sm text-slate-400 max-w-md font-bold uppercase tracking-widest opacity-60">실시간 아카이빙 데이터베이스</p>
                </div>
                <div className="flex flex-col gap-3">
                    {/* Search bar */}
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-slate-900/50 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-xs w-full focus:outline-none" />
                    </div>
                    {/* Filter toggle (mobile only) */}
                    <button
                        onClick={() => setShowFilters(v => !v)}
                        className="md:hidden flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-slate-500 px-4 py-2 bg-white/5 border border-white/10 rounded-lg w-fit"
                    >
                        <Filter size={12} /> Filter: {filter}
                    </button>
                    {/* Filter badges — always visible on md+, toggleable on mobile */}
                    <div className={cn("flex flex-wrap gap-2", showFilters ? "flex" : "hidden md:flex")}>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => { setFilter(cat); setShowFilters(false); }}
                                className={cn("px-3 py-1 rounded-full text-[10px] uppercase tracking-widest border transition-all font-bold", filter === cat ? "bg-cyan-500 border-cyan-500 text-slate-950" : "bg-white/5 border-white/10 text-slate-500 hover:text-white")}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{filtered.map((p, i) => <ProjectCard key={p.id || i} project={p} idx={i} />)}</div>
        </motion.div>
    );
};

export const AllInsightsView = ({ insights, onNavigate }) => {
    const [search, setSearch] = useState('');
    const filtered = useMemo(() => insights.filter(i => i.title.toLowerCase().includes(search.toLowerCase())), [search, insights]);
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pt-28 md:pt-32 pb-40 px-4 md:px-6 max-w-6xl mx-auto font-mono">
            <nav className="flex items-center gap-2 mb-8 text-[10px] uppercase tracking-widest text-slate-500 font-bold"><button onClick={() => onNavigate('home')} className="hover:text-white transition-colors">Home</button><ChevronRight size={10} /><span className="text-cyan-400">Insights</span></nav>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <h2 className="text-3xl md:text-6xl font-sans font-medium tracking-tight bg-gradient-to-br from-slate-300 to-slate-500 bg-clip-text text-transparent mb-3">Insights.</h2>
                    <p className="text-sm text-slate-400 max-w-md font-bold uppercase tracking-widest opacity-60">기록이 자산이 되는 공간입니다.</p>
                </div>
                <div className="relative w-full md:w-auto">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input type="text" placeholder="Search posts..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-slate-900/50 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-xs w-full md:w-[300px] focus:outline-none" />
                </div>
            </div>
            <div className="flex flex-col gap-4">{filtered.map((i, idx) => (<InsightItem key={i.id || idx} post={i} idx={idx} onNavigate={onNavigate} />))}</div>
        </motion.div>
    );
};

export const InsightDetailView = ({ post, onNavigate }) => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="pt-28 md:pt-32 pb-40 px-4 md:px-6 max-w-3xl mx-auto font-mono">
        <SEO
            title={post.title}
            description={post.summary || post.content?.replace(/<[^>]*>?/gm, '').slice(0, 160)}
            image={post.imageUrl}
            type="article"
        />
        <nav className="flex items-center gap-2 mb-10 text-[10px] uppercase tracking-widest text-slate-500 font-bold"><button onClick={() => onNavigate('insights')} className="hover:text-white transition-colors flex items-center gap-2"><ArrowLeft size={10} /> Back to Insights</button></nav>
        <header className="mb-10">
            <div className="flex items-center gap-3 mb-5 font-mono text-[10px] uppercase tracking-widest text-cyan-400 font-bold"><span>{Array.isArray(post.category) ? post.category.join(' / ') : post.category}</span><span className="w-1 h-1 bg-slate-700 rounded-full" /><span>{post.date}</span></div>
            <h1 className="text-2xl md:text-5xl font-sans font-bold leading-tight mb-6 text-white">{post.title}</h1>
        </header>
        {post.imageUrl && (
            <div className="mb-10 rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-slate-900/50">
                <img src={post.imageUrl} alt={post.title} className="w-full h-auto object-cover max-h-[400px] md:max-h-[600px] w-full" />
            </div>
        )}
        <article className="prose prose-invert max-w-none mb-20 font-sans leading-relaxed" dangerouslySetInnerHTML={{ __html: post.content || '<p className="text-slate-500 italic">No content available</p>' }} />
    </motion.div>
);
