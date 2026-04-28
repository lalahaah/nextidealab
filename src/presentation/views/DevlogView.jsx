import React, { useState, useEffect } from 'react';
import { db, auth } from '../../infrastructure/FirebaseConfig';
import { collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';

export default function DevlogView() {
  const [projects, setProjects] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStackFilter, setActiveStackFilter] = useState(null);

  // Auth & Admin State
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });

  // Modal State
  const [modalType, setModalType] = useState(null); // 'project' | 'log' | 'login' | null
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [projectForm, setProjectForm] = useState({
    name: '', description: '', status: 'building', tags: '', stack: '', deployUrl: '', revenue: 0
  });
  const [logForm, setLogForm] = useState({
    projectName: '', message: '', status: 'building'
  });

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

  useEffect(() => {
    // Auth Listener
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setIsAdmin(!!user);
    });

    // Projects Real-time Sync
    const colProjects = collection(db, 'devlog_projects');
    const unsubProjects = onSnapshot(colProjects, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => {
        const data = doc.data();
        const status = (data.status || 'idea').toUpperCase();

        let badgeStyle = { border: '1px solid #4a6080', color: '#4a6080', backgroundColor: 'transparent' };
        if (status === 'LIVE') badgeStyle = { backgroundColor: COLORS.cyan, color: '#000' };
        else if (status === 'BUILDING') badgeStyle = { border: `1px solid ${COLORS.amber}`, color: COLORS.amber, backgroundColor: 'transparent' };
        else if (status === 'IDEA') badgeStyle = { border: `1px solid ${COLORS.blue}`, color: COLORS.blue, backgroundColor: 'transparent' };

        return {
          id: doc.id,
          name: data.name || 'Untitled',
          desc: data.description || data.desc || '',
          status: status,
          type: (data.tags || []).join(' / ') || data.type || 'N/A',
          stack: data.stack || [],
          revenue: data.revenue || 0,
          date: data.startedAt?.toDate ? data.startedAt.toDate().toLocaleDateString() : (data.date || ''),
          action: status === 'IDEA' ? 'VIEW PLAN →' : 'VIEW LOG →',
          statusClass: `s-${status.toLowerCase()}`,
          badgeStyle: badgeStyle
        };
      });
      setProjects(projectsData);
      setLoading(false);
    });

    // Logs Real-time Sync
    const colLogs = collection(db, 'devlog_logs');
    const unsubLogs = onSnapshot(colLogs, (snapshot) => {
      const logsData = snapshot.docs.map(doc => {
        const data = doc.data();
        const status = (data.status || 'idea').toUpperCase();
        let color = COLORS.textDim;
        if (status === 'LIVE') color = COLORS.green;
        else if (status === 'BUILDING') color = COLORS.amber;
        else if (status === 'IDEA') color = COLORS.blue;

        return {
          project: data.projectName || data.project || 'Unknown',
          msg: data.message || data.msg || '',
          date: data.loggedAt?.toDate ? formatTimeAgo(data.loggedAt.toDate()) : 'RECENT',
          color: color
        };
      });
      setLogs(logsData.slice(0, 10)); // 최대 10개만 표시
    });

    return () => {
      unsubAuth();
      unsubProjects();
      unsubLogs();
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsSaving(true);
    try {
      await signInWithEmailAndPassword(auth, loginForm.email, loginForm.password);
      setModalType(null);
      setLoginForm({ email: '', password: '' });
    } catch (err) {
      setLoginError('인증 실패: 이메일 또는 비밀번호를 확인하세요.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      await signOut(auth);
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'devlog_projects'), {
        ...projectForm,
        tags: projectForm.tags.split(',').map(t => t.trim()).filter(t => t),
        stack: projectForm.stack.split(',').map(s => s.trim()).filter(s => s),
        revenue: Number(projectForm.revenue),
        startedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setModalType(null);
      setProjectForm({ name: '', description: '', status: 'building', tags: '', stack: '', deployUrl: '', revenue: 0 });
    } catch (err) {
      console.error(err);
      alert('저장 실패: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddLog = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'devlog_logs'), {
        ...logForm,
        loggedAt: serverTimestamp(),
        createdAt: serverTimestamp()
      });
      setModalType(null);
      setLogForm({ projectName: '', message: '', status: 'building' });
    } catch (err) {
      console.error(err);
      alert('로그 저장 실패: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  function formatTimeAgo(date) {
    const now = new Date();
    const diff = now - date;
    const diffMin = Math.floor(diff / 60000);
    const diffHr = Math.floor(diff / 3600000);
    const diffDay = Math.floor(diff / 86400000);

    if (diffMin < 60) return `${diffMin}M AGO`;
    if (diffHr < 24) return `${diffHr}H AGO`;
    if (diffDay < 1) return 'TODAY';
    return `${diffDay}D AGO`;
  }

  const filteredProjects = activeStackFilter
    ? projects.filter(p => p.stack.includes(activeStackFilter))
    : projects;

  return (
    <div className="min-h-screen pt-[56px]" style={{ backgroundColor: COLORS.bg, color: COLORS.text, fontFamily: FONTS.grotesk }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
        .project-card-custom::after { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; }
        .s-live::after    { background: #00ff88; }
        .s-building::after{ background: #ffb300; }
        .s-idea::after    { background: #4488ff; }
        .s-paused::after  { background: #4a6080; }
        input, textarea, select { background: #0d1a2d !important; border: 1px solid #112240 !important; color: #e8f4ff !important; outline: none; }
        input:focus, textarea:focus, select:focus { border-color: #00d4ff !important; }
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
              <span className="text-[9px] px-1.5 py-0.5 rounded-full border border-[#00d4ff44] bg-[#00d4ff22]" style={{ fontFamily: FONTS.mono }}>{projects.length}</span>
            </div>
          </div>

          {/* STATUS */}
          <div className="mb-7">
            <div className="text-[9px] uppercase tracking-[1.8px] px-5 pb-2 mb-2 border-b" style={{ color: COLORS.textDim, borderColor: COLORS.border, fontFamily: FONTS.mono }}>Status</div>
            {[
              { label: 'Live', color: COLORS.green, count: projects.filter(p => p.status === 'LIVE').length },
              { label: 'Building', color: COLORS.amber, count: projects.filter(p => p.status === 'BUILDING').length },
              { label: 'Idea', color: COLORS.blue, count: projects.filter(p => p.status === 'IDEA').length },
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
            {Array.from(new Set(projects.flatMap(p => p.stack))).slice(0, 15).map(tag => (
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
          <div className="mb-9 flex justify-between items-end">
            <div>
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
            <div className="flex flex-col items-end gap-3">
              <button 
                onClick={isAdmin ? handleLogout : () => setModalType('login')}
                className="text-[9px] font-bold uppercase tracking-widest transition-all hover:opacity-80"
                style={{ color: isAdmin ? COLORS.cyan : COLORS.border2, fontFamily: FONTS.mono }}
              >
                {isAdmin ? 'LOGOUT' : 'ADMIN'}
              </button>
              {isAdmin && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => setModalType('log')}
                    className="text-[9px] uppercase tracking-wider px-4 py-2 rounded font-bold transition-all border border-[#112240] hover:border-[#1a3060]"
                    style={{ color: COLORS.cyan, fontFamily: FONTS.mono }}
                  >
                    + ADD LOG
                  </button>
                  <button 
                    onClick={() => setModalType('project')}
                    className="text-[9px] uppercase tracking-wider px-4 py-2 rounded font-bold transition-all"
                    style={{ backgroundColor: COLORS.cyan, color: '#000', fontFamily: FONTS.mono }}
                  >
                    + ADD PROJECT
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-8">
            {[
              { label: 'Total Projects', val: projects.length.toString(), sub: 'In Archive', color: COLORS.cyan, textColor: COLORS.white },
              { label: 'Live', val: projects.filter(p => p.status === 'LIVE').length.toString(), sub: '배포 완료', color: COLORS.green, textColor: COLORS.green },
              { label: 'In Progress', val: projects.filter(p => p.status === 'BUILDING').length.toString(), sub: '빌딩 중', color: COLORS.amber, textColor: COLORS.amber },
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

          {/* Project Cards */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-3.5 mb-10">
            {loading ? (
              <div className="col-span-full py-20 text-center text-sm" style={{ color: COLORS.textDim, fontFamily: FONTS.mono }}>Loading...</div>
            ) : filteredProjects.length === 0 ? (
              <div className="col-span-full py-20 text-center text-sm" style={{ color: COLORS.textDim, fontFamily: FONTS.mono }}>아직 프로젝트가 없습니다</div>
            ) : filteredProjects.map(p => (
              <div
                key={p.id}
                className={`relative group rounded-xl border overflow-hidden transition-all hover:-translate-y-0.5 hover:border-[#1a3060] project-card-custom ${p.statusClass}`}
                style={{ backgroundColor: COLORS.card, borderColor: COLORS.border }}
              >
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
            </div>
            <div className="relative pl-6 space-y-2.5 before:content-[''] before:absolute before:left-[7px] before:top-2 before:bottom-0 before:w-[1px] before:bg-gradient-to-b before:from-[#00d4ff44] before:to-transparent">
              {logs.length === 0 ? (
                <div className="text-xs py-5" style={{ color: COLORS.textDim, fontFamily: FONTS.mono }}>No logs found.</div>
              ) : logs.map((log, i) => (
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
        </main>

        {/* ── RIGHT PANEL ── */}
        <aside
          className="hidden xl:flex flex-col w-[230px] shrink-0 border-l sticky top-[56px] h-[calc(100vh-56px)]"
          style={{ backgroundColor: COLORS.bg2, borderColor: COLORS.border }}
        >
          <div className="flex-1 overflow-y-auto overflow-x-hidden" style={{ padding: '28px 18px' }}>
            {/* Revenue Tracker */}
            <div className="mb-7">
              <div className="text-[9px] uppercase tracking-[1.8px] pb-2 mb-3 border-b" style={{ color: COLORS.textDim, borderColor: COLORS.border, fontFamily: FONTS.mono }}>Revenue Tracker</div>
              {projects.filter(p => (p.revenue || 0) > 0).length === 0 ? (
                <div className="text-[10px]" style={{ color: COLORS.textDim }}>수익 발생 프로젝트 없음</div>
              ) : projects.filter(p => (p.revenue || 0) > 0).map(p => (
                <div key={p.id} className="flex justify-between items-center mb-2">
                  <span className="text-[10px] truncate" style={{ color: COLORS.textMid, maxWidth: '120px' }}>{p.name}</span>
                  <span className="text-[10px] font-bold shrink-0" style={{ color: COLORS.green, fontFamily: FONTS.mono }}>₩{(p.revenue / 1000).toFixed(0)}K</span>
                </div>
              ))}
              <div className="mt-2 pt-2 border-t flex justify-between items-center" style={{ borderColor: COLORS.border }}>
                <span className="text-[10px]" style={{ color: COLORS.textDim }}>누적 합계</span>
                <span className="text-[11px] font-bold shrink-0" style={{ color: COLORS.green, fontFamily: FONTS.mono }}>₩{(projects.reduce((acc, p) => acc + (p.revenue || 0), 0) / 1000).toFixed(0)}K</span>
              </div>
            </div>

            {/* Next Actions */}
            <div>
              <div className="text-[9px] uppercase tracking-[1.8px] pb-2 mb-3 border-b" style={{ color: COLORS.textDim, borderColor: COLORS.border, fontFamily: FONTS.mono }}>Next Actions</div>
              {projects.filter(p => p.status === 'BUILDING').slice(0, 4).map((p, i) => (
                <div key={i} className="flex gap-2.5 items-start mb-2.5">
                  <div className="w-1 h-1 rounded-full mt-[5px] shrink-0" style={{ backgroundColor: COLORS.amber }}></div>
                  <div className="text-[10px] leading-relaxed" style={{ color: COLORS.textDim }}>{p.name} 기능 고도화</div>
                </div>
              ))}
            </div>
          </div>
        </aside>

      </div>

      {/* ── MODALS ── */}
      {modalType && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border p-7 shadow-2xl relative" style={{ backgroundColor: COLORS.card, borderColor: COLORS.border2 }}>
            <button onClick={() => setModalType(null)} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">✕</button>

            <div className="mb-6">
              <h3 className="text-lg font-bold" style={{ color: COLORS.cyan, fontFamily: FONTS.mono }}>
                {modalType === 'project' ? '＋ NEW PROJECT' : modalType === 'log' ? '＋ NEW LOG' : 'ADMIN LOGIN'}
              </h3>
            </div>

            {modalType === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1">
                  <div className="text-[10px] uppercase tracking-widest pl-1" style={{ color: COLORS.textDim, fontFamily: FONTS.mono }}>Email</div>
                  <input required type="email" placeholder="admin@example.com" className="w-full p-3 rounded text-sm" value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] uppercase tracking-widest pl-1" style={{ color: COLORS.textDim, fontFamily: FONTS.mono }}>Password</div>
                  <input required type="password" placeholder="••••••••" className="w-full p-3 rounded text-sm" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} />
                </div>
                {loginError && <div className="text-[10px] text-red-400 font-bold pl-1">{loginError}</div>}
                <button disabled={isSaving} className="w-full py-3.5 rounded font-bold transition-all text-sm mt-4" style={{ backgroundColor: COLORS.cyan, color: '#000', fontFamily: FONTS.mono }}>
                  {isSaving ? 'AUTHENTICATING...' : 'LOGIN'}
                </button>
              </form>
            )}

            {modalType === 'project' && isAdmin && (
              <form onSubmit={handleAddProject} className="space-y-4">
                <input required placeholder="프로젝트명" className="w-full p-2.5 rounded text-xs" value={projectForm.name} onChange={e => setProjectForm({...projectForm, name: e.target.value})} />
                <textarea required placeholder="설명" className="w-full p-2.5 rounded text-xs h-20" value={projectForm.description} onChange={e => setProjectForm({...projectForm, description: e.target.value})} />
                <div className="grid grid-cols-2 gap-3">
                  <select className="p-2.5 rounded text-xs" value={projectForm.status} onChange={e => setProjectForm({...projectForm, status: e.target.value})}>
                    <option value="live">LIVE</option>
                    <option value="building">BUILDING</option>
                    <option value="idea">IDEA</option>
                  </select>
                  <input type="number" placeholder="수익 (₩)" className="p-2.5 rounded text-xs" value={projectForm.revenue} onChange={e => setProjectForm({...projectForm, revenue: e.target.value})} />
                </div>
                <input placeholder="태그 (쉼표로 구분)" className="w-full p-2.5 rounded text-xs" value={projectForm.tags} onChange={e => setProjectForm({...projectForm, tags: e.target.value})} />
                <input placeholder="스택 (쉼표로 구분)" className="w-full p-2.5 rounded text-xs" value={projectForm.stack} onChange={e => setProjectForm({...projectForm, stack: e.target.value})} />
                <input placeholder="배포 URL" className="w-full p-2.5 rounded text-xs" value={projectForm.deployUrl} onChange={e => setProjectForm({...projectForm, deployUrl: e.target.value})} />
                <button disabled={isSaving} className="w-full py-3 rounded font-bold transition-all text-sm mt-2" style={{ backgroundColor: COLORS.cyan, color: '#000', fontFamily: FONTS.mono }}>
                  {isSaving ? 'SAVING...' : 'SAVE PROJECT'}
                </button>
              </form>
            )}

            {modalType === 'log' && isAdmin && (
              <form onSubmit={handleAddLog} className="space-y-4">
                <select required className="w-full p-2.5 rounded text-xs" value={logForm.projectName} onChange={e => setLogForm({...logForm, projectName: e.target.value})}>
                  <option value="">프로젝트 선택</option>
                  {projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
                <textarea required placeholder="로그 메시지" className="w-full p-2.5 rounded text-xs h-24" value={logForm.message} onChange={e => setLogForm({...logForm, message: e.target.value})} />
                <select className="w-full p-2.5 rounded text-xs" value={logForm.status} onChange={e => setLogForm({...logForm, status: e.target.value})}>
                  <option value="building">BUILDING</option>
                  <option value="live">LIVE</option>
                  <option value="idea">IDEA</option>
                </select>
                <button disabled={isSaving} className="w-full py-3 rounded font-bold transition-all text-sm mt-2" style={{ backgroundColor: COLORS.cyan, color: '#000', fontFamily: FONTS.mono }}>
                  {isSaving ? 'SAVING...' : 'SAVE LOG'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const PROJECTS = [];
const LOGS = [];