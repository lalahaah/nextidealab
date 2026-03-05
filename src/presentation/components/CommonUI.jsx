import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...classes) => twMerge(clsx(classes));

export const Logo = ({ className = "", onClick }) => (
    <div className={cn("flex items-center gap-3 select-none cursor-pointer", className)} onClick={onClick}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="text-cyan-400">
            <path d="M0 0H10V24H0L10 12Z" />
            <path d="M12 0L24 12L12 24Z" />
        </svg>
        <span className="font-mono font-bold text-[11px] md:text-[13px] tracking-[0.25em] uppercase text-white opacity-90">
            Next Idea Lab
        </span>
    </div>
);

export const LampContainer = ({ children, className }) => (
    <div className={cn("relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden bg-slate-950 w-full rounded-md z-0", className)}>
        <div className="relative flex w-full flex-1 scale-y-125 items-center justify-center isolate z-0 mt-24">

            {/* Left conic beam */}
            <motion.div
                initial={{ opacity: 0.5, width: "8rem" }}
                whileInView={{ opacity: 1, width: "16rem" }}
                transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
                style={{ backgroundImage: `conic-gradient(from 70deg at center top, var(--tw-gradient-stops))` }}
                className="absolute inset-auto right-1/2 h-56 overflow-visible w-[16rem] md:w-[30rem] from-cyan-500 via-transparent to-transparent text-white"
            >
                <div className="absolute w-[100%] left-0 bg-slate-950 h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
                <div className="absolute w-40 h-[100%] left-0 bg-slate-950 bottom-0 z-20 [mask-image:linear-gradient(to_right,white,transparent)]" />
            </motion.div>

            {/* Right conic beam */}
            <motion.div
                initial={{ opacity: 0.5, width: "8rem" }}
                whileInView={{ opacity: 1, width: "16rem" }}
                transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
                style={{ backgroundImage: `conic-gradient(from 290deg at center top, var(--tw-gradient-stops))` }}
                className="absolute inset-auto left-1/2 h-56 w-[16rem] md:w-[30rem] from-transparent via-transparent to-cyan-500 text-white"
            >
                <div className="absolute w-40 h-[100%] right-0 bg-slate-950 bottom-0 z-20 [mask-image:linear-gradient(to_left,white,transparent)]" />
                <div className="absolute w-[100%] right-0 bg-slate-950 h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
            </motion.div>

            {/* Cover layer */}
            <div className="absolute top-1/2 h-48 w-full translate-y-12 scale-x-150 bg-slate-950 blur-2xl" />

            {/* Center glow — smaller on mobile */}
            <div className="absolute inset-auto z-50 h-28 w-[12rem] md:h-36 md:w-[28rem] -translate-y-1/2 rounded-full bg-cyan-500 opacity-30 md:opacity-50 blur-3xl" />

            {/* Bright core glow */}
            <motion.div
                initial={{ width: "4rem" }}
                whileInView={{ width: "8rem" }}
                transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
                className="absolute inset-auto z-30 h-28 md:h-36 -translate-y-[6rem] rounded-full bg-cyan-400 blur-2xl"
            />

            {/* Horizontal light line */}
            <motion.div
                initial={{ width: "8rem" }}
                whileInView={{ width: "16rem" }}
                transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
                className="absolute inset-auto z-50 h-0.5 w-[16rem] md:w-[30rem] -translate-y-[7rem] bg-cyan-400"
            />

            {/* Dark cover above line */}
            <div className="absolute inset-auto z-40 h-44 w-full -translate-y-[12.5rem] bg-slate-950" />
        </div>
        <div className="relative z-50 flex -translate-y-60 flex-col items-center px-5">{children}</div>
    </div>
);
