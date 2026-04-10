import React, { useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { motion } from 'framer-motion';
import {
    BarChart3, LayoutDashboard, LogOut, Save, MessageSquare, Plus, Edit2, Trash2, Eye, Info, Mail, CheckCircle2, Github, Globe, Instagram, Share2, AtSign, BookOpen, Users, Upload, Link2, FileText, Code2
} from 'lucide-react';
import { cn } from '../components/CommonUI';
import { FirestoreRepository } from '../../infrastructure/FirestoreRepository';
import { StorageRepository } from '../../infrastructure/StorageRepository';

const QUILL_MODULES = {
    toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['link', 'image', 'code-block'],
        ['clean']
    ],
};

const QUILL_FORMATS = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'link', 'image', 'code-block'
];

const CATEGORIES = ['AI', 'Web', 'Android', 'iOS', 'Blockchain', 'Robotics', 'Engineering', 'Design', 'Data Science', 'etc'];
const TECH_STACKS = ['JavaScript', 'TypeScript', 'React', 'Next.js', 'Python', 'Flutter', 'Firebase', 'OpenAI', 'Real-time API', 'Data Scraping', 'Tailwind CSS', 'Geo-Location API', 'OpenWeather Engine', 'Framer Motion'];
const PROJECT_STATUSES = ['Live', 'Beta', 'Archive'];

const AdminStats = ({ projects, insights, inquiries }) => {
    const stats = [
        { label: 'Active Projects', value: projects.length, icon: BarChart3, color: 'text-cyan-400' },
        { label: 'Published Posts', value: insights.length, icon: BookOpen, color: 'text-purple-400' },
        { label: 'New Inquiries', value: inquiries.filter(i => i.status === 'new').length, icon: MessageSquare, color: 'text-emerald-400' },
        { label: 'Total Inquiries', value: inquiries.length, icon: Users, color: 'text-amber-400' },
    ];

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s, i) => (
                    <div key={i} className="p-6 bg-slate-900/40 border border-white/5 rounded-2xl relative overflow-hidden group shadow-xl">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><s.icon size={64} /></div>
                        <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 font-mono font-bold">{s.label}</p>
                        <h3 className={cn("text-4xl font-bold font-sans", s.color)}>{s.value}</h3>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const AdminDashboard = ({ projects, insights, inquiries, onNavigate }) => {
    const [activeMenu, setActiveMenu] = useState('stats');
    const [activeTab, setActiveTab] = useState('projects');
    const [editingItem, setEditingItem] = useState(null);

    // Stable Editor Configuration
    const modules = React.useMemo(() => QUILL_MODULES, []);
    const formats = React.useMemo(() => QUILL_FORMATS, []);

    const createNewItem = React.useCallback((tab) => {
        const base = { title: '', content: '', category: [], status: 'Live' };
        if (tab === 'projects') return {
            ...base,
            techStack: [],
            summary: '',
            liveUrl: '',
            socialLinks: { github: '', instagram: '', tiktok: '', threads: '' }
        };
        return { ...base, readTime: '5 min', contentFormat: 'richtext' };
    }, []);

    const handleDelete = async (collectionName, id) => {
        if (!window.confirm("정말로 삭제하시겠습니까?")) return;
        try {
            const repo = new FirestoreRepository(collectionName);
            await repo.delete(id);
        } catch (e) { console.error(e); }
    };

    const handleSave = async () => {
        if (!editingItem.title) return alert("Title is required");
        const repo = new FirestoreRepository(activeTab);
        const cleanItem = { ...editingItem };
        const id = cleanItem.id;
        delete cleanItem.id;

        try {
            if (id) {
                await repo.update(id, cleanItem);
            } else {
                await repo.add({ ...cleanItem, date: new Date().toLocaleDateString() });
            }
            setEditingItem(null);
        } catch (e) { console.error(e); }
    };

    return (
        <div className="pt-28 md:pt-32 pb-40 px-4 md:px-6 max-w-7xl mx-auto font-mono min-h-screen">
            <header className="mb-10 border-b border-white/5 pb-6 flex justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-5xl font-sans font-medium tracking-tight bg-gradient-to-br from-slate-200 to-slate-500 bg-clip-text text-transparent mb-1">Command Center.</h1>
                    <p className="text-[10px] uppercase tracking-[0.3em] font-mono text-slate-500 font-bold hidden md:block">Lab Infrastructure Management</p>
                </div>
                <button onClick={() => onNavigate('home')} className="text-[10px] border border-white/20 px-4 md:px-6 py-2 hover:bg-white/10 transition-all uppercase tracking-widest flex items-center gap-2 rounded-full font-bold flex-shrink-0"><LogOut size={14} /> <span className="hidden sm:inline">Exit Admin</span></button>
            </header>

            <div className="flex gap-2 mb-10 border-b border-white/5 pb-5 overflow-x-auto scrollbar-none">
                {['stats', 'inventory', 'inquiries'].map(menu => (
                    <button key={menu} onClick={() => setActiveMenu(menu)} className={cn("px-5 py-2 text-xs uppercase tracking-widest transition-all rounded-lg flex items-center gap-2 font-bold whitespace-nowrap flex-shrink-0", activeMenu === menu ? "bg-cyan-500 text-slate-950" : "hover:bg-white/5 text-slate-500 hover:text-white")}>
                        {menu === 'stats' && <BarChart3 size={14} />}
                        {menu === 'inventory' && <Save size={14} />}
                        {menu === 'inquiries' && <MessageSquare size={14} />}
                        {menu}
                    </button>
                ))}
            </div>

            {activeMenu === 'stats' && <AdminStats projects={projects} insights={insights} inquiries={inquiries} />}

            {activeMenu === 'inventory' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    {/* Left: List Area */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="flex gap-2 p-1 bg-slate-900/80 rounded-xl w-fit">
                            {['projects', 'insights'].map(tab => (
                                <button key={tab} onClick={() => setActiveTab(tab)} className={cn("px-4 py-2 text-[10px] uppercase rounded-lg transition-all font-bold", activeTab === tab ? "bg-[#242424] text-white" : "text-slate-500")}>{tab}</button>
                            ))}
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm uppercase font-bold text-cyan-400">{activeTab} Repo</h3>
                                <button onClick={() => setEditingItem(createNewItem(activeTab))} className="p-2 bg-cyan-500 text-slate-950 rounded-full">
                                    <Plus size={16} />
                                </button>
                            </div>
                            {(activeTab === 'projects' ? projects : insights).map(item => (
                                <div key={item.id} className="p-4 bg-slate-900/50 border border-white/5 rounded-xl flex items-center justify-between group">
                                    <div><h4 className="font-bold text-sm">{item.title}</h4><p className="text-[10px] text-slate-500 font-bold uppercase">{Array.isArray(item.category) ? item.category.join(' / ') : item.category}</p></div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => setEditingItem({ ...item, contentFormat: item.contentFormat || 'richtext' })}><Edit2 size={14} /></button>
                                        <button onClick={() => handleDelete(activeTab, item.id)}><Trash2 size={14} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Form Area (Simplified non-sticky approach to avoid scroll jumping) */}
                    <div className="lg:col-span-7 bg-[#0a0f1d] p-8 rounded-2xl border border-white/5 shadow-2xl min-h-[600px]">
                        {editingItem ? (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                <div>
                                    <label className="text-[10px] uppercase text-slate-500 mb-1 block font-bold">Title</label>
                                    <input placeholder="Artifact Title" value={editingItem.title || ''} onChange={e => setEditingItem({ ...editingItem, title: e.target.value })} />
                                </div>

                                <div className="space-y-6">
                                    {activeTab === 'projects' && (
                                        <div>
                                            <label className="text-[10px] uppercase text-slate-500 mb-3 block font-bold">Project Status</label>
                                            <div className="flex flex-wrap gap-2">
                                                {PROJECT_STATUSES.map(stat => (
                                                    <button
                                                        key={stat}
                                                        onClick={() => setEditingItem({ ...editingItem, status: stat })}
                                                        className={cn(
                                                            "px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border",
                                                            editingItem.status === stat ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400" : "bg-slate-900 border-white/5 text-slate-500 hover:border-white/10 hover:text-slate-300"
                                                        )}
                                                    >
                                                        {stat}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div>
                                        <label className="text-[10px] uppercase text-slate-500 mb-3 block font-bold">Categories</label>
                                        <div className="flex flex-wrap gap-2">
                                            {CATEGORIES.map(cat => {
                                                const selected = Array.isArray(editingItem.category) ? editingItem.category.includes(cat) : editingItem.category === cat;
                                                return (
                                                    <button
                                                        key={cat}
                                                        onClick={() => {
                                                            const current = Array.isArray(editingItem.category) ? editingItem.category : (editingItem.category ? [editingItem.category] : []);
                                                            const next = current.includes(cat) ? current.filter(c => c !== cat) : [...current, cat];
                                                            setEditingItem({ ...editingItem, category: next });
                                                        }}
                                                        className={cn(
                                                            "px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border",
                                                            selected ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400" : "bg-slate-900 border-white/5 text-slate-500 hover:border-white/10 hover:text-slate-300"
                                                        )}
                                                    >
                                                        {cat}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    {activeTab === 'projects' ? (
                                        <div>
                                            <label className="text-[10px] uppercase text-slate-500 mb-3 block font-bold">Tech Stack</label>
                                            <div className="flex flex-wrap gap-2">
                                                {TECH_STACKS.map(tech => {
                                                    const selected = Array.isArray(editingItem.techStack) ? editingItem.techStack.includes(tech) : editingItem.techStack === tech;
                                                    return (
                                                        <button
                                                            key={tech}
                                                            onClick={() => {
                                                                const current = Array.isArray(editingItem.techStack) ? editingItem.techStack : (editingItem.techStack ? [editingItem.techStack] : []);
                                                                const next = current.includes(tech) ? current.filter(t => t !== tech) : [...current, tech];
                                                                setEditingItem({ ...editingItem, techStack: next });
                                                            }}
                                                            className={cn(
                                                                "px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border",
                                                                selected ? "bg-purple-500/20 border-purple-500/50 text-purple-400" : "bg-slate-900 border-white/5 text-slate-500 hover:border-white/10 hover:text-slate-300"
                                                            )}
                                                        >
                                                            {tech}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="text-[10px] uppercase text-slate-500 mb-1 block font-bold">Read Time</label>
                                            <input placeholder="e.g. 5 min" value={editingItem.readTime || ''} onChange={e => setEditingItem({ ...editingItem, readTime: e.target.value })} />
                                        </div>
                                    )}
                                </div>

                                {activeTab === 'projects' && (
                                    <div>
                                        <label className="text-[10px] uppercase text-slate-500 mb-1 block font-bold">Summary (Card Preview)</label>
                                        <textarea rows={2} placeholder="Brief summary for card preview..." value={editingItem.summary || ''} onChange={e => setEditingItem({ ...editingItem, summary: e.target.value })} />
                                    </div>
                                )}

                                <div className="quill-container">
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="text-[10px] uppercase text-slate-500 font-bold">{activeTab === 'projects' ? 'Detailed Case Study' : 'Rich Text Content'}</label>
                                        {activeTab === 'insights' && (
                                            <div className="flex gap-2 p-1 bg-slate-900/50 rounded-lg">
                                                <button
                                                    onClick={() => setEditingItem({ ...editingItem, contentFormat: 'richtext' })}
                                                    className={cn("px-3 py-1 text-[9px] uppercase font-bold rounded transition-all flex items-center gap-1",
                                                        (editingItem.contentFormat !== 'markdown') ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50" : "text-slate-500 hover:text-slate-400"
                                                    )}
                                                >
                                                    <FileText size={12} /> Rich Text
                                                </button>
                                                <button
                                                    onClick={() => setEditingItem({ ...editingItem, contentFormat: 'markdown' })}
                                                    className={cn("px-3 py-1 text-[9px] uppercase font-bold rounded transition-all flex items-center gap-1",
                                                        editingItem.contentFormat === 'markdown' ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50" : "text-slate-500 hover:text-slate-400"
                                                    )}
                                                >
                                                    <Code2 size={12} /> Markdown
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-slate-950 border border-white/5 rounded-xl overflow-hidden">
                                        {activeTab === 'insights' && editingItem.contentFormat === 'markdown' ? (
                                            <textarea
                                                value={editingItem.content || ''}
                                                onChange={e => setEditingItem(prev => ({ ...prev, content: e.target.value }))}
                                                placeholder="# Heading&#10;## Subheading&#10;&#10;**Bold** and *italic* text&#10;&#10;- Bullet point&#10;1. Numbered list&#10;&#10;[Link](url)&#10;`code`&#10;&#10;Write your content in Markdown..."
                                                className="w-full h-64 p-4 bg-slate-950 text-slate-100 font-mono text-sm border-0 resize-none focus:outline-none"
                                            />
                                        ) : (
                                            <ReactQuill
                                                key={editingItem.id || 'new-item'}
                                                theme="snow"
                                                value={editingItem.content || editingItem.description || ''}
                                                onChange={val => setEditingItem(prev => ({ ...prev, content: val }))}
                                                modules={modules}
                                                formats={formats}
                                                placeholder="Write your creative journey here..."
                                            />
                                        )}
                                    </div>
                                </div>

                                {activeTab === 'projects' && (
                                    <div className="space-y-6 pt-6 border-t border-white/5">
                                        <h4 className="text-[10px] uppercase text-cyan-500 font-bold tracking-widest">Links & Social</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div><label className="text-[10px] uppercase text-slate-500 mb-1 block font-bold">Live URL</label><input placeholder="https://..." value={editingItem.liveUrl || ''} onChange={e => setEditingItem({ ...editingItem, liveUrl: e.target.value })} /></div>
                                            <div><label className="text-[10px] uppercase text-slate-500 mb-1 block font-bold">GitHub</label><input placeholder="https://github.com/..." value={editingItem.socialLinks?.github || editingItem.githubUrl || ''} onChange={e => setEditingItem({ ...editingItem, socialLinks: { ...(editingItem.socialLinks || {}), github: e.target.value } })} /></div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div><label className="text-[10px] uppercase text-slate-500 mb-1 block font-bold">Instagram</label><input placeholder="@username" value={editingItem.socialLinks?.instagram || ''} onChange={e => setEditingItem({ ...editingItem, socialLinks: { ...(editingItem.socialLinks || {}), instagram: e.target.value } })} /></div>
                                            <div><label className="text-[10px] uppercase text-slate-500 mb-1 block font-bold">TikTok</label><input placeholder="@username" value={editingItem.socialLinks?.tiktok || ''} onChange={e => setEditingItem({ ...editingItem, socialLinks: { ...(editingItem.socialLinks || {}), tiktok: e.target.value } })} /></div>
                                            <div><label className="text-[10px] uppercase text-slate-500 mb-1 block font-bold">Threads</label><input placeholder="@username" value={editingItem.socialLinks?.threads || ''} onChange={e => setEditingItem({ ...editingItem, socialLinks: { ...(editingItem.socialLinks || {}), threads: e.target.value } })} /></div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-4 mt-8 pt-8 border-t border-white/5">
                                    <button onClick={handleSave} className="flex-1 py-4 bg-cyan-500 text-slate-950 font-bold uppercase text-xs rounded-xl shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 hover:bg-cyan-400">
                                        <Save size={16} /> Save Changes
                                    </button>
                                    <button onClick={() => setEditingItem(null)} className="px-6 border border-white/10 text-white/50 uppercase text-[10px] tracking-widest rounded-xl hover:text-white transition-colors">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="py-20 text-center opacity-30 font-bold text-xs uppercase tracking-widest">
                                <Info size={32} className="mx-auto mb-4" />
                                Select item to edit
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeMenu === 'inquiries' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-4">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-sm uppercase font-bold text-amber-400 flex items-center gap-2">
                            <MessageSquare size={16} /> Incoming Enquiries
                        </h3>
                        <span className="text-[10px] text-slate-500 font-mono font-bold tracking-widest">{inquiries.length} TOTAL RECORDS</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {inquiries.length > 0 ? (
                            inquiries.sort((a, b) => new Date(b.date) - new Date(a.date)).map((inq) => (
                                <div key={inq.id} className="p-6 bg-slate-900/40 border border-white/5 rounded-2xl relative group hover:border-white/10 transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={cn(
                                            "text-[8px] uppercase px-2 py-0.5 rounded-full font-bold tracking-widest",
                                            inq.status === 'new' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-slate-800 text-slate-500"
                                        )}>
                                            {inq.status}
                                        </div>
                                        <button
                                            onClick={() => handleDelete('inquiries', inq.id)}
                                            className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-red-400"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">From</p>
                                            <h4 className="text-sm font-bold text-white mb-1">{inq.name}</h4>
                                            <p className="text-[10px] text-cyan-400 font-mono">{inq.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Message</p>
                                            <p className="text-xs text-slate-300 leading-relaxed font-sans line-clamp-4">{inq.message}</p>
                                        </div>
                                        <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[8px] uppercase text-slate-600 font-bold">
                                            <span>Received</span>
                                            <span>{inq.date}</span>
                                        </div>
                                    </div>
                                    {inq.status === 'new' && (
                                        <button
                                            onClick={async () => {
                                                const repo = new FirestoreRepository('inquiries');
                                                await repo.update(inq.id, { status: 'read' });
                                            }}
                                            className="mt-6 w-full py-3 bg-slate-800 hover:bg-slate-700 text-[9px] uppercase tracking-widest text-white font-bold rounded-xl transition-all"
                                        >
                                            Mark as Read
                                        </button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center opacity-30 font-bold text-xs uppercase tracking-widest">
                                <Info size={32} className="mx-auto mb-4" />
                                No inquiries received yet
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
