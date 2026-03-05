import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { SEO } from '../components/SEO';

const LegalContent = ({ title, subtitle, sections }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-32 pb-40 px-6 max-w-6xl mx-auto font-mono"
    >
        <nav className="flex items-center gap-2 mb-8 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-white transition-colors">Home</button>
            <ChevronRight size={10} />
            <span className="text-cyan-400">Legal</span>
        </nav>

        <div className="mb-16">
            <h2 className="text-4xl md:text-6xl font-sans font-bold tracking-tight text-white mb-2 uppercase">
                {title}
            </h2>
            <p className="text-[10px] text-slate-500 font-mono tracking-[0.3em] uppercase mb-8">
                {subtitle}
            </p>
            <div className="w-full h-px bg-white/5" />
        </div>

        <div className="space-y-12 max-w-3xl">
            {sections.map((section, idx) => (
                <div key={idx} className="space-y-4">
                    <h3 className="text-lg font-sans font-bold text-white flex gap-4">
                        <span className="text-cyan-500">{idx + 1}.</span>
                        {section.title}
                    </h3>
                    <p className="text-sm text-slate-400 font-sans leading-relaxed pl-8">
                        {section.content}
                    </p>
                </div>
            ))}
        </div>
    </motion.div>
);

export const TermsView = ({ onNavigate }) => {
    const sections = [
        {
            title: "서비스의 목적",
            content: "본 사이트는 Lucifer Co.,Ltd.의 프로젝트 포트폴리오 전시 및 비즈니스 협업을 위한 목적으로 운영됩니다."
        },
        {
            title: "지식재산권",
            content: "본 사이트에 게시된 모든 프로젝트, 디자인, 코드 및 콘텐츠의 소유권은 Lucifer Co.,Ltd.에 있습니다."
        },
        {
            title: "면책조항",
            content: "실험적인 프로젝트의 경우 예고 없이 기능이 변경되거나 서비스가 중단될 수 있습니다."
        }
    ];

    return (
        <>
            <SEO title="Terms of Service" />
            <LegalContent
                title="Terms of Service"
                subtitle="General Terms and Conditions"
                sections={sections}
            />
        </>
    );
};

export const PrivacyView = ({ onNavigate }) => {
    const sections = [
        {
            title: "수집하는 개인정보 항목",
            content: "Lucifer Co.,Ltd.은 문의하기(Contact) 섹션을 통해 이름, 이메일 주소, 메시지 내용을 수집합니다."
        },
        {
            title: "개인정보의 수집 및 이용 목적",
            content: "수집된 개인정보는 프로젝트 협업 제안에 대한 답변 및 비즈니스 소통(hello@nextidealab.app) 목적으로만 사용됩니다."
        },
        {
            title: "개인정보의 보유 및 이용 기간",
            content: "원칙적으로 개인정보 수집 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다."
        }
    ];

    return (
        <>
            <SEO title="Privacy Policy" />
            <LegalContent
                title="Privacy Policy"
                subtitle="Personal Information Handling Guidelines"
                sections={sections}
            />
        </>
    );
};
