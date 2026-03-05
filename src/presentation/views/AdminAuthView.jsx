import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Key } from 'lucide-react';
import { cn } from '../components/CommonUI';

export const AdminAuthView = ({ onAuthorize }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password === '253004') {
            onAuthorize();
        } else {
            setError(true);
            setPassword('');
            setTimeout(() => setError(false), 2000);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center bg-slate-950 px-6 relative overflow-hidden"
        >
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px]" />

            <div className="w-full max-w-md relative z-10 text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-8"
                >
                    <Lock size={24} className="text-cyan-400" />
                </motion.div>

                <h2 className="text-2xl md:text-3xl font-sans font-bold tracking-[0.2em] uppercase text-white mb-3">
                    Restricted Access
                </h2>
                <p className="text-[10px] uppercase font-mono tracking-[0.3em] text-slate-500 mb-12">
                    This area is for Next Idea Lab administrators only.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className={cn(
                        "relative group transition-all duration-300",
                        error ? "animate-shake" : ""
                    )}>
                        <Key size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400" />
                        <input
                            type="password"
                            placeholder="E n t e r   M a s t e r   K e y"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={cn(
                                "w-full bg-[#0a0f1d] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-center text-sm font-mono tracking-[0.5em] focus:border-cyan-500/50 outline-none transition-all",
                                error ? "border-red-500/50 text-red-400" : "text-white"
                            )}
                            autoFocus
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold uppercase text-[11px] tracking-[0.2em] rounded-xl transition-all shadow-lg shadow-cyan-500/20 active:scale-[0.98]"
                    >
                        Authorize Session
                    </button>
                </form>
            </div>
        </motion.div>
    );
};
