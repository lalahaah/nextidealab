import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Terminal, CheckCircle2, Send } from 'lucide-react';
import { cn } from '../components/CommonUI';
import { ProjectCard, InsightItem } from '../components/DataItems';
import { FirestoreRepository } from '../../infrastructure/FirestoreRepository';
import { SEO } from '../components/SEO';
import { SparklesCore } from '@/components/ui/sparkles';

const HeroSection = ({ children }) => (
    <div className="h-[40rem] w-full bg-slate-950 flex flex-col items-center justify-center overflow-hidden rounded-md relative pt-20">
        <div className="relative z-20">
            {children}
        </div>
        <div className="w-[40rem] h-40 relative [mask-image:radial-gradient(350px_200px_at_top,white,transparent)]">
            {/* Gradients */}
            <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[2px] blur-sm" />
            <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-px" />
            <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-[5px] blur-sm" />
            <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px" />

            {/* Core component */}
            <SparklesCore
                background="transparent"
                minSize={0.4}
                maxSize={1}
                particleDensity={1200}
                className="w-full h-full"
                particleColor="#FFFFFF"
            />
        </div>
    </div>
);

const ContactSection = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const repo = new FirestoreRepository('inquiries');
            await repo.add({
                ...formData,
                date: new Date().toISOString(),
                status: 'new'
            });
            setIsSuccess(true);
            setFormData({ name: '', email: '', message: '' });
            setTimeout(() => setIsSuccess(false), 3000);
        } catch (e) {
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section id="contact" className="w-full max-w-4xl mx-auto px-4 md:px-6 py-20 md:py-32 relative z-20 border-t border-white/5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                <div>
                    <h2 className="text-3xl md:text-5xl font-sans font-medium tracking-tight bg-gradient-to-br from-slate-300 to-slate-500 bg-clip-text text-transparent mb-6">Let's build together.</h2>
                    <p className="text-[16px] text-slate-400 font-mono leading-relaxed mb-8 font-bold">
                        Next Idea Lab은 항상 새로운 실험과 파트너십에 열려있습니다. 아이디어를 현실로 만드는 여정에 함께하세요.
                    </p>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 text-slate-300 group"><Mail size={18} className="text-cyan-400" /> <span className="text-[16px] group-hover:text-white transition-colors font-bold">hello@nextidealab.app</span></div>
                        <div className="flex items-center gap-4 text-slate-300 group"><Terminal size={18} className="text-cyan-400" /> <span className="text-[16px] group-hover:text-white transition-colors font-bold">Seoul, Republic of Korea</span></div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[14px] uppercase tracking-widest text-slate-500 font-bold font-mono pl-1">Name</label>
                            <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Your name" className="bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-[16px] w-full focus:outline-none" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[14px] uppercase tracking-widest text-slate-500 font-bold font-mono pl-1">Email</label>
                            <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="email@example.com" className="bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-[16px] w-full focus:outline-none" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[14px] uppercase tracking-widest text-slate-500 font-bold font-mono pl-1">Message</label>
                        <textarea required rows={4} value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} placeholder="Describe your idea or project..." className="bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-[16px] w-full focus:outline-none" />
                    </div>
                    <button
                        disabled={isSubmitting}
                        className={cn(
                            "w-full py-4 rounded-xl font-bold uppercase tracking-widest text-[14px] flex items-center justify-center gap-2 transition-all",
                            isSuccess ? "bg-emerald-500 text-white" : "bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                        )}
                    >
                        {isSuccess ? <><CheckCircle2 size={16} /> Message Sent</> : <><Send size={16} /> Send Request</>}
                    </button>
                </form>
            </div>
        </section>
    );
};

export const HomeView = ({ projects, insights, onNavigate }) => (
    <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <SEO
            title="Home"
            description="Future-focused AI & Web Development Lab. We archive innovation and record the process of creation."
        />
        <HeroSection>
            <h1 className="md:text-7xl text-5xl font-sans font-medium tracking-tight text-center bg-gradient-to-br from-slate-100 to-slate-500 bg-clip-text text-transparent relative z-20 mb-4">
                We Build <br /> What&apos;s NEXT
            </h1>
        </HeroSection>
        <section id="projects" className="w-full max-w-6xl mx-auto px-4 md:px-6 py-20 md:py-32 relative z-20">
            <div className="mb-12 flex flex-col md:flex-row md:justify-between md:items-end gap-6">
                <div>
                    <h2 className="text-3xl md:text-5xl font-sans font-medium tracking-tight bg-gradient-to-br from-slate-300 to-slate-500 bg-clip-text text-transparent mb-2">Projects.</h2>
                    <p className="text-[16px] text-slate-400 uppercase tracking-widest font-bold font-mono">실제 작동하는 비즈니스 프로덕트</p>
                </div>
                <button onClick={() => onNavigate('projects')} className="text-[14px] uppercase tracking-widest text-white/60 hover:text-white pb-1 border-b border-white/20 hover:border-white transition-colors font-bold font-mono">View All Projects</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.slice(0, 3).map((p, i) => <ProjectCard key={p.id || i} project={p} idx={i} />)}
            </div>
        </section>
        <section id="insights" className="w-full max-w-6xl mx-auto px-4 md:px-6 py-20 md:py-32 relative z-20 border-t border-white/5">
            <div className="mb-12 flex flex-col md:flex-row md:justify-between md:items-end gap-6">
                <div>
                    <h2 className="text-3xl md:text-5xl font-sans font-medium tracking-tight bg-gradient-to-br from-slate-300 to-slate-500 bg-clip-text text-transparent mb-2">Latest Insights.</h2>
                    <p className="text-[16px] text-slate-400 uppercase tracking-widest font-bold font-mono">기술 및 비즈니스 회고록</p>
                </div>
                <button onClick={() => onNavigate('insights')} className="text-[14px] uppercase tracking-widest text-white/60 hover:text-white pb-1 border-b border-white/20 hover:border-white transition-colors font-bold font-mono">View All Posts</button>
            </div>
            <div className="flex flex-col gap-3">
                {insights.slice(0, 3).map((p, i) => <InsightItem key={p.id || i} post={p} idx={i} onNavigate={onNavigate} />)}
            </div>
        </section>
        <ContactSection />
    </motion.div>
);
