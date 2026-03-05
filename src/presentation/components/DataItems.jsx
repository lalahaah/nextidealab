import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Calendar, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { cn } from './CommonUI';

export const ProjectCard = ({ project, idx }) => {
    const { setSelectedProject } = useApp();

    return (
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05, duration: 0.5 }} onClick={() => setSelectedProject(project)} className="group relative flex flex-col justify-between min-h-[160px] p-5 rounded-xl border border-white/5 bg-slate-900/30 hover:bg-[#242424] transition-all duration-500 cursor-pointer overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-cyan-500/0 group-hover:from-cyan-500/5 group-hover:to-transparent transition-all duration-500" />
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-2">
                        <span className="font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full border border-cyan-500/30 text-cyan-400 bg-cyan-500/10 font-bold">{project.status || 'Live'}</span>
                        <span className="font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full border border-slate-500/30 text-slate-400 bg-slate-500/10 font-bold">{Array.isArray(project.category) ? project.category.join(' / ') : project.category}</span>
                    </div>
                    <ArrowUpRight size={16} className="text-slate-500 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-bold mb-1.5 group-hover:text-cyan-400 transition-colors truncate">{project.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors line-clamp-2">{project.summary || project.description}</p>
            </div>
            <div className="flex flex-wrap gap-1.5 relative z-10 mt-3">
                {(typeof project.tags === 'string' ? project.tags.split(',') : project.tags || []).map((tag, i) => (
                    <span key={i} className="font-mono text-[8px] uppercase tracking-wider text-slate-500 group-hover:text-slate-400 font-bold">#{tag.trim()}</span>
                ))}
            </div>
        </motion.div>
    );
};

export const InsightItem = ({ post, idx, onNavigate }) => (
    <motion.article initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1, duration: 0.5 }} onClick={() => onNavigate('insight-detail', post)} className="group flex flex-col md:flex-row md:items-center justify-between p-5 md:p-6 rounded-lg border border-transparent hover:border-white/10 hover:bg-[#242424]/50 transition-all duration-300 cursor-pointer">
        <div className="flex flex-col gap-2 md:w-2/3">
            <span className="font-mono text-[9px] uppercase tracking-widest text-cyan-400 font-bold">{Array.isArray(post.category) ? post.category.join(' / ') : post.category}</span>
            <h3 className="text-lg md:text-xl font-medium text-slate-200 group-hover:text-white transition-colors">{post.title}</h3>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0 text-slate-500 font-mono text-[10px] font-bold">
            <div className="flex items-center gap-1.5"><Calendar size={12} /><span>{post.date}</span></div>
            <div className="flex items-center gap-1.5"><Clock size={12} /><span>{post.readTime || '5 min'}</span></div>
        </div>
    </motion.article>
);
