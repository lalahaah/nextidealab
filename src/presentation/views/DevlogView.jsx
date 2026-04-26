import React, { useState } from 'react';

export default function DevlogView() {
  const [activeStackFilter, setActiveStackFilter] = useState(null);

  const COLORS = {
    bg: '#050a14',
    bg2: '#080f1c',
    bg3: '#0b1525',
    card: '#0d1a2d',
    border: '#112240',
    border2: '#1a3060',
    cyan: '#00d4ff',
    cyanDim: '#00d4ff22',
    cyanMid: '#00d4ff44',
    text: '#c8d8f0',
    textDim: '#4a6080',
    textMid: '#7a9ab8',
    white: '#e8f4ff',
    green: '#00ff88',
    amber: '#ffb300',
    blue: '#4488ff',
  };

  const FONTS = {
    mono: "'Space Mono', monospace",
    grotesk: "'Space Grotesk', sans-serif",
  };

  const filteredProjects = activeStackFilter
    ? PROJECTS.filter(p => p.stack.includes(activeStackFilter))
    : PROJECTS;

  return (
    <div className="min-h-screen pt-[56px]" style={{ backgroundColor: COLORS.bg, color: COLORS.text, fontFamily: FONTS.grotesk }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
        .project-card-custom::after { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; }
        .s-live::after    { background: #00ff88; }
        .s-building::after{ background: #ffb300; }
        .s-idea::after    { background: #4488ff; }
        .s-paused::after  { background: #4a6080; }
      `}</style>

      <div className="flex min-h-[calc(100vh-56px)]">

        {/* ── LEFT SIDEBAR ── */}
        <aside
          className="hidden lg:block w-[210px] shrink-0 border-r sticky top-[56px] h-[calc(100vh-56px)] overflow-y-auto py-7"
          style={{ backgroundColor: COLORS.bg2, borderColor: COLORS.border }}
        >
          {/* VIEW */}
          <div className="mb-7">
            <div className="text-[9px] uppercase tracking-[1.8px] px-5 pb-2 mb-2 border-b" style={{ color: COLORS.textDim, borderColor: COLORS.border, fontFamily: FONTS.mono }}>View</div>
            <div className="flex items-center justify-between px-5 py-2 cursor-pointer border-l-2 border-l-[#00d4ff] bg-[#00d4ff22] text-[#00d4ff]">
              <div className="flex items-center gap-2 text-xs"><span>⊞</span> All Projects</div>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full border border-[#00d4ff44] bg-[#00d4ff22]" style={{ fontFamily: FONTS.mono }}>10</span>
            </div>
            <div className="flex items-center justify-between px-5 py-2 cursor-pointer border-l-2 border-transparent text-[#4a6080] hover:text-[#7a9ab8] hover:bg-[#0b1525]">
              <div className="flex items-center gap-2 text-xs"><span>◎</span> Timeline</div>
            </div>
            <div className="flex items-center justify-between px-5 py-2 cursor-pointer border-l-2 border-transparent text-[#4a6080] hover:text-[#7a9ab8] hover:bg-[#0b1525]">
              <div className="flex items-center gap-2 text-xs"><span>↗</span> Live Only</div>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full border border-[#112240] bg-[#0b1525]" style={{ fontFamily: FONTS.mono }}>2</span>
            </div>
          </div>

          {/* STATUS */}
          <div className="mb-7">
            <div className="text-[9px] uppercase tracking-[1.8px] px-5 pb-2 mb-2 border-b" style={{ color: COLORS.textDim, borderColor: COLORS.border, fontFamily: FONTS.mono }}>Status</div>
            {[
              { label: 'Live', color: COLORS.green, count: 2 },
              { label: 'Building', color: COLORS.amber, count: 3 },
              { label: 'Idea', color: COLORS.blue, count: 4 },
              { label: 'Paused', color: COLORS.textDim, count: 1 },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between px-5 py-2 cursor-pointer border-l-2 border-transparent text-[#4a6080] hover:text-[#7a9ab8] hover:bg-[#0b1525]">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: s.color }}></div>
                  {s.label}
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full border border-[#112240] bg-[#0b1525]" style={{ fontFamily: FONTS.mono }}>{s.count}</span>
              </div>
            ))}
          </div>

          {/* STACK */}
          <div>
            <div className="text-[9px] uppercase tracking-[1.8px] px-5 pb-2 mb-2 border-b" style={{ color: COLORS.textDim, borderColor: COLORS.border, fontFamily: FONTS.mono }}>Stack</div>
            {['Next.js', 'Supabase', 'Claude API', 'Vercel', 'FastAPI', 'Stripe'].map(tag => (
              <span
                key={tag}
                className="block px-5 py-1.5 text-[10px] cursor-pointer transition-all"
                style={{
                  color: activeStackFilter === tag ? COLORS.cyan : COLORS.textDim,
                  backgroundColor: activeStackFilter === tag ? COLORS.cyanDim : 'transparent',
                  fontFamily: FONTS.mono,
                }}
                onClick={() => setActiveStackFilter(prev => prev === tag ? null : tag)}
              >
                {tag}
              </span>
            ))}
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main className="flex-1 px-10 py-9 overflow-y-auto min-w-0">

          {/* Header */}
          <div className="mb-9">
            <div className="text-[10px] mb-3 tracking-wider" style={{ color: COLORS.textDim, fontFamily: FONTS.mono }}>
              Home › Projects › <span style={{ color: COLORS.cyan }}>DEVLOG</span>
            </div>
            <div className="text-4xl font-bold tracking-tight mb-1" style={{ color: COLORS.white }}>
              Build Log.<span style={{ color: COLORS.cyan }}>_</span>
            </div>
            <div className="text-[10px] uppercase tracking-[1.5px]" style={{ color: COLORS.textDim, fontFamily: FONTS.mono }}>
              실시간 빌드 아카이브 &nbsp;/&nbsp; 개발 대시보드
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-8">
            {[
              { label: 'Total Projects', val: '10', sub: '+2 this month', color: COLORS.cyan, textColor: COLORS.white },
              { label: 'Live', val: '2', sub: '배포 완료', color: COLORS.green, textColor: COLORS.green },
              { label: 'In Progress', val: '3', sub: '빌딩 중', color: COLORS.amber, textColor: COLORS.amber },
              { label: 'Build Streak', val: '12d', sub: '연속 빌드 🔥', color: '#a78bfa', textColor: '#a78bfa' },
            ].map(stat => (
              <div key={stat.label} className="relative p-4 rounded-lg border overflow-hidden transition-all hover:border-[#1a3060]" style={{ backgroundColor: COLORS.card, borderColor: COLORS.border }}>
                <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: stat.color }}></div>
                <div className="text-[9px] uppercase tracking-[1.5px] mb-2.5" style={{ color: COLORS.textDim, fontFamily: FONTS.mono }}>{stat.label}</div>
                <div className="font-bold leading-none mb-1.5" style={{ fontSize: '2.8rem', color: stat.textColor }}>{stat.val}</div>
                <div className="text-[10px]" style={{ color: COLORS.textDim }}>{stat.sub}</div>
              </div>
            ))}
          </div>

          {/* Filter */}
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <div className="text-[9px] uppercase tracking-wider px-3.5 py-1.5 rounded border font-bold cursor-pointer" style={{ backgroundColor: COLORS.cyan, borderColor: COLORS.cyan, color: '#000', fontFamily: FONTS.mono }}>ALL</div>
            {['AI', 'WEB', 'DATA SCIENCE', 'DESIGN'].map(tag => (
              <div key={tag} className="text-[9px] uppercase tracking-wider px-3.5 py-1.5 rounded border cursor-pointer hover:border-[#1a3060] hover:text-[#7a9ab8] transition-all" style={{ color: COLORS.textDim, borderColor: COLORS.border, fontFamily: FONTS.mono }}>{tag}</div>
            ))}
            <div className="flex-1 max-w-[300px] relative ml-auto">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: COLORS.textDim }}>⌕</span>
              <input
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border outline-none transition-all"
                placeholder="Search..."
                style={{ backgroundColor: COLORS.card, borderColor: COLORS.border, color: COLORS.textMid, fontFamily: FONTS.grotesk }}
              />
            </div>
          </div>

          {/* Projects Label */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] uppercase tracking-[2px]" style={{ color: COLORS.textDim, fontFamily: FONTS.mono }}>Projects</span>
            <span className="text-[9px]" style={{ color: COLORS.cyan, fontFamily: FONTS.mono }}>{filteredProjects.length} total</span>
          </div>

          {/* Project Cards */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-3.5 mb-10">
            {filteredProjects.map(p => (
              <div
                key={p.name}
                className={`relative group rounded-xl border overflow-hidden transition-all hover:-translate-y-0.5 hover:border-[#1a3060] project-card-custom ${p.statusClass}`}
                style={{ backgroundColor: COLORS.card, borderColor: COLORS.border }}
              >
                {/* 카드 내부 패딩 — pt-6으로 상단 컬러 라인과 간격 확보 */}
                <div style={{ padding: '20px 24px 20px 24px', paddingTop: '24px' }}>
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className="text-[8px] font-bold tracking-wider px-2 py-0.5 rounded uppercase"
                        style={{ fontFamily: FONTS.mono, ...(p.badgeStyle) }}
                      >{p.status}</span>
                      <span className="text-[8px] tracking-wider uppercase" style={{ color: COLORS.textDim, fontFamily: FONTS.mono }}>{p.type}</span>
                    </div>
                    <span className="text-sm transition-all" style={{ color: COLORS.textDim }}>↗</span>
                  </div>
                  <div className="font-bold mt-3 mb-2 tracking-tight" style={{ fontSize: '15px', color: COLORS.white }}>{p.name}</div>
                  <div className="text-[11px] leading-relaxed mb-4" style={{ color: COLORS.textDim }}>{p.desc}</div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {p.stack.map(s => (
                      <span key={s} className="text-[9px] px-2 py-0.5 border rounded-sm tracking-tight" style={{ color: COLORS.textMid, borderColor: COLORS.border2, fontFamily: FONTS.mono }}>{s}</span>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t" style={{ borderColor: COLORS.border }}>
                    <span className="text-[9px]" style={{ color: COLORS.textDim, fontFamily: FONTS.mono }}>{p.date}</span>
                    <span className="text-[9px] font-bold" style={{ color: COLORS.cyan, fontFamily: FONTS.mono }}>{p.action}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] uppercase tracking-[2px]" style={{ color: COLORS.textDim, fontFamily: FONTS.mono }}>Recent Build Log</span>
              <span className="text-[9px] cursor-pointer hover:underline" style={{ color: COLORS.cyan, fontFamily: FONTS.mono }}>View all →</span>
            </div>
            <div className="relative pl-6 space-y-2.5 before:content-[''] before:absolute before:left-[7px] before:top-2 before:bottom-0 before:w-[1px] before:bg-gradient-to-b before:from-[#00d4ff44] before:to-transparent">
              {LOGS.map((log, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-[19px] top-3.5 w-2 h-2 rounded-full border-2" style={{ backgroundColor: log.color, borderColor: COLORS.bg }}></div>
                  <div className="flex items-center justify-between p-3 rounded-lg border transition-all hover:border-[#1a3060]" style={{ backgroundColor: COLORS.card, borderColor: COLORS.border }}>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <div className="text-xs font-semibold" style={{ color: COLORS.cyan, fontFamily: FONTS.mono }}>{log.project}</div>
                      <div className="text-[11px] truncate" style={{ color: COLORS.textMid }}>{log.msg}</div>
                    </div>
                    <span className="text-[9px] uppercase ml-4 shrink-0" style={{ color: COLORS.textDim, fontFamily: FONTS.mono }}>{log.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-5 pt-6 border-t flex justify-between items-center" style={{ borderColor: COLORS.border }}>
            <div>
              <div className="text-[9px] uppercase tracking-[2px]" style={{ color: COLORS.textDim, fontFamily: FONTS.mono }}>▶ &nbsp; Next Idea Lab</div>
              <div className="text-[9px] uppercase tracking-[1px] mt-1" style={{ color: COLORS.textDim, fontFamily: FONTS.mono }}>NEXT IDEA TO REALITY. INDEPENDENT BUILDER STUDIO.</div>
            </div>
            <div className="text-[9px]" style={{ color: COLORS.textDim, fontFamily: FONTS.mono }}>© 2025 NEXT IDEA LAB BY LUCIFER CO., LTD.</div>
          </footer>
        </main>

        {/* ── RIGHT PANEL ── */}
        <aside
          className="hidden xl:flex flex-col w-[230px] shrink-0 border-l sticky top-[56px] h-[calc(100vh-56px)]"
          style={{ backgroundColor: COLORS.bg2, borderColor: COLORS.border }}
        >
          {/* 스크롤 영역 — px를 inline style로 정확히 지정 */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden" style={{ padding: '28px 18px' }}>

            {/* Build Activity */}
            <div className="mb-7">
              <div className="text-[9px] uppercase tracking-[1.8px] pb-2 mb-3 border-b" style={{ color: COLORS.textDim, borderColor: COLORS.border, fontFamily: FONTS.mono }}>Build Activity</div>
              <div className="grid grid-cols-7 gap-1 mb-1.5" style={{ width: '100%' }}>
                {[0, 1, 2, 0, 3, 1, 4, 2, 4, 1, 3, 4, 2, 0, 1, 3, 4, 2, 4, 1, 2, 3, 4, 4, 3, 2, 4, 1].map((level, i) => {
                  const bg = ['#112240', '#00d4ff18', '#00d4ff40', '#00d4ff70', '#00d4ff'][level];
                  return <div key={i} style={{ height: '14px', borderRadius: '2px', backgroundColor: bg }}></div>;
                })}
              </div>
              <div className="text-[9px]" style={{ color: COLORS.textDim, fontFamily: FONTS.mono }}>이번 달 24일 활동</div>
            </div>

            {/* Stack Usage */}
            <div className="mb-7">
              <div className="text-[9px] uppercase tracking-[1.8px] pb-2 mb-3 border-b" style={{ color: COLORS.textDim, borderColor: COLORS.border, fontFamily: FONTS.mono }}>Stack Usage</div>
              <div className="space-y-3">
                {[
                  { name: 'Next.js', pct: 90, color: COLORS.cyan },
                  { name: 'Claude API', pct: 75, color: COLORS.green },
                  { name: 'Supabase', pct: 60, color: COLORS.blue },
                  { name: 'Vercel', pct: 80, color: COLORS.amber },
                ].map(s => (
                  <div key={s.name}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] truncate" style={{ color: COLORS.textMid, maxWidth: '120px' }}>{s.name}</span>
                      <span className="text-[9px] ml-1 shrink-0" style={{ color: COLORS.textDim, fontFamily: FONTS.mono }}>{s.pct}%</span>
                    </div>
                    <div style={{ height: '3px', borderRadius: '2px', backgroundColor: '#112240', width: '100%', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: '2px', backgroundColor: s.color, width: `${s.pct}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Revenue Tracker */}
            <div className="mb-7">
              <div className="text-[9px] uppercase tracking-[1.8px] pb-2 mb-3 border-b" style={{ color: COLORS.textDim, borderColor: COLORS.border, fontFamily: FONTS.mono }}>Revenue Tracker</div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] truncate" style={{ color: COLORS.textDim, maxWidth: '130px' }}>랜딩페이지 빌더</span>
                <span className="text-[10px] font-bold shrink-0" style={{ color: COLORS.green, fontFamily: FONTS.mono }}>₩320K</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] truncate" style={{ color: COLORS.textDim }}>nextidealab</span>
                <span className="text-[10px] font-bold shrink-0" style={{ color: COLORS.textDim, fontFamily: FONTS.mono }}>₩0</span>
              </div>
              <div className="mt-2 pt-2 border-t flex justify-between items-center" style={{ borderColor: COLORS.border }}>
                <span className="text-[10px]" style={{ color: COLORS.textDim }}>이번 달 합계</span>
                <span className="text-[11px] font-bold shrink-0" style={{ color: COLORS.green, fontFamily: FONTS.mono }}>₩320K</span>
              </div>
            </div>

            {/* Next Actions */}
            <div>
              <div className="text-[9px] uppercase tracking-[1.8px] pb-2 mb-3 border-b" style={{ color: COLORS.textDim, borderColor: COLORS.border, fontFamily: FONTS.mono }}>Next Actions</div>
              {[
                { color: COLORS.amber, text: '카피 생성기 베타 출시' },
                { color: COLORS.amber, text: '키워드 SaaS MVP 완성' },
                { color: COLORS.blue, text: '인플루언서 매칭 기획서 작성' },
                { color: COLORS.textDim, text: '뉴스레터 자동화 재개 여부 결정' },
              ].map((a, i) => (
                <div key={i} className="flex gap-2.5 items-start mb-2.5">
                  <div className="w-1 h-1 rounded-full mt-[5px] shrink-0" style={{ backgroundColor: a.color }}></div>
                  <div className="text-[10px] leading-relaxed" style={{ color: COLORS.textDim }}>{a.text}</div>
                </div>
              ))}
            </div>

          </div>
        </aside>

      </div>
    </div>
  );
}

/* ── DATA ── */
const PROJECTS = [
  {
    name: 'nextidealab.app',
    desc: '프로젝트 허브 & 블로그. 바이브코딩으로 직접 구축한 메인 플랫폼.',
    status: 'LIVE', type: 'WEB / AI',
    stack: ['Next.js', 'Vercel', 'MDX'],
    date: '2025.03.10', action: 'VIEW LOG →',
    statusClass: 's-live',
    badgeStyle: { backgroundColor: '#00d4ff', color: '#000' },
  },
  {
    name: 'AI 광고 카피 생성기',
    desc: 'Claude API로 광고 소재 자동 생성. 내부 툴 → SaaS 전환 예정.',
    status: 'BUILDING', type: 'AI / WEB',
    stack: ['Claude API', 'Next.js', 'Supabase'],
    date: '2025.04.02', action: 'VIEW LOG →',
    statusClass: 's-building',
    badgeStyle: { border: '1px solid #ffb300', color: '#ffb300', backgroundColor: 'transparent' },
  },
  {
    name: '랜딩페이지 빌더',
    desc: '광고대행사 클라이언트용 랜딩 자동 생성. 유료 플랜 운영 중.',
    status: 'LIVE', type: 'WEB / DESIGN',
    stack: ['Next.js', 'Stripe', 'Supabase'],
    date: '2025.02.15', action: 'VIEW LOG →',
    statusClass: 's-live',
    badgeStyle: { backgroundColor: '#00d4ff', color: '#000' },
  },
  {
    name: '키워드 리서치 SaaS',
    desc: 'SEO 키워드 자동 분석 + 경쟁도 체크. MVP 개발 60% 완료.',
    status: 'BUILDING', type: 'AI / DATA SCIENCE',
    stack: ['Python', 'FastAPI', 'Claude API'],
    date: '2025.04.10', action: 'VIEW LOG →',
    statusClass: 's-building',
    badgeStyle: { border: '1px solid #ffb300', color: '#ffb300', backgroundColor: 'transparent' },
  },
  {
    name: 'AI 인플루언서 매칭',
    desc: '광고주 ↔ 인플루언서 AI 매칭. 라운드미디어 레버리지 가능.',
    status: 'IDEA', type: 'AI / WEB',
    stack: ['아이디어', 'Claude API'],
    date: '2025.04.18', action: 'VIEW PLAN →',
    statusClass: 's-idea',
    badgeStyle: { border: '1px solid #4488ff', color: '#4488ff', backgroundColor: 'transparent' },
  },
  {
    name: '뉴스레터 자동화',
    desc: 'AI 뉴스레터 큐레이션 자동화. 우선순위 밀림으로 일시 중단.',
    status: 'PAUSED', type: 'WEB',
    stack: ['Next.js', 'Resend'],
    date: '2025.03.20', action: 'VIEW LOG →',
    statusClass: 's-paused',
    badgeStyle: { border: '1px solid #4a6080', color: '#4a6080', backgroundColor: 'transparent' },
  },
];

const LOGS = [
  { project: 'nextidealab.app', msg: '✦ /devlog 페이지 추가 완료 — 대시보드 MVP 배포', date: 'TODAY', color: '#00ff88' },
  { project: 'AI 광고 카피 생성기', msg: 'Supabase Auth 연동, 토큰 카운팅 로직 추가', date: '1D AGO', color: '#ffb300' },
  { project: '키워드 리서치 SaaS', msg: 'Claude API 프롬프트 최적화, 응답속도 40% 개선', date: '2D AGO', color: '#ffb300' },
  { project: '랜딩페이지 빌더', msg: 'Stripe 결제 웹훅 버그 수정 — 유료 전환율 +12%', date: '3D AGO', color: '#00ff88' },
];