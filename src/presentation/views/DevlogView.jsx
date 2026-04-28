import React, { useState, useEffect, useMemo } from 'react';
import { db, auth } from '../../infrastructure/FirebaseConfig';
import { collection, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { Github, ExternalLink, Edit2 } from 'lucide-react';

export default function DevlogView() {
  const [projects, setProjects] = useState([]);
  const [logs, setLogs] = useState([]);
  const [ideas, setIdeas] = useState([]); // 아이디어 보관함
  const [projectLogs, setProjectLogs] = useState([]); // 특정 프로젝트용 로그
  const [loading, setLoading] = useState(true);
  const [activeStackFilter, setActiveStackFilter] = useState(null);

  // Auth & Admin State
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });

  // Modal State
  const [modalType, setModalType] = useState(null); // 'project' | 'edit_project' | 'log' | 'edit_log' | 'login' | 'view_logs' | 'idea' | null
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedIdea, setExpandedIdea] = useState(null);
  const [editingLogId, setEditingLogId] = useState(null);
  const [inlineEditForm, setInlineEditForm] = useState({ message: '', tag: '기타' });

  // Form State
  const [projectForm, setProjectForm] = useState({
    name: '', description: '', status: 'building', tags: '', stack: '', deployUrl: '', githubUrl: '', nextAction: '', progress: 0, revenue: 0, targetMRR: 0, revenueHistory: []
  });
  const [historyMonth, setHistoryMonth] = useState('2026-01');
  const [historyAmount, setHistoryAmount] = useState('');
  const [logForm, setLogForm] = useState({
    projectId: '', projectName: '', message: '', status: 'building', tag: '기타'
  });
  const [ideaForm, setIdeaForm] = useState({
    title: '', description: '', potential: 'mid', tags: ''
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

        let statusColor = COLORS.textDim;
        if (status === 'LIVE') statusColor = COLORS.green;
        else if (status === 'BUILDING') statusColor = COLORS.amber;
        else if (status === 'IDEA') statusColor = COLORS.blue;

        let badgeStyle = { border: '1px solid #4a6080', color: '#4a6080', backgroundColor: 'transparent' };
        if (status === 'LIVE') badgeStyle = { backgroundColor: COLORS.cyan, color: '#000' };
        else if (status === 'BUILDING') badgeStyle = { border: `1px solid ${COLORS.amber}`, color: COLORS.amber, backgroundColor: 'transparent' };
        else if (status === 'IDEA') badgeStyle = { border: `1px solid ${COLORS.blue}`, color: COLORS.blue, backgroundColor: 'transparent' };

        return {
          id: doc.id,
          name: data.name || 'Untitled',
          desc: data.description || data.desc || '',
          status: status,
          statusColor: statusColor,
          type: (data.tags || []).join(' / ') || data.type || '',
          tags: data.tags || [],
          stack: data.stack || [],
          revenue: data.revenue || 0,
          targetMRR: data.targetMRR || 0,
          revenueHistory: data.revenueHistory || [],
          deployUrl: data.deployUrl || null,
          githubUrl: data.githubUrl || null,
          nextAction: data.nextAction || null,
          progress: data.progress || 0,
          date: data.startedAt?.toDate ? data.startedAt.toDate().toLocaleDateString() : (data.date || ''),
          action: status === 'IDEA' ? 'VIEW PLAN →' : 'VIEW LOG →',
          statusClass: `s-${status.toLowerCase()}`,
          badgeStyle: badgeStyle
        };
      });
      setProjects(projectsData);
      setLoading(false);
    });

    // Logs Real-time Sync (Global)
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
          id: doc.id,
          projectId: data.projectId || '',
          project: data.projectName || data.project || 'Unknown',
          msg: data.message || data.msg || '',
          tag: data.tag || null,
          status: status,
          date: data.loggedAt?.toDate ? formatTimeAgo(data.loggedAt.toDate()) : 'RECENT',
          loggedAt: data.loggedAt,
          color: color
        };
      });
      setLogs(logsData.slice(0, 10)); // 최대 10개만 표시
    });

    // Ideas Real-time Sync (Admin Only)
    let unsubIdeas = () => {};
    if (isAdmin) {
      const colIdeas = collection(db, 'devlog_ideas');
      unsubIdeas = onSnapshot(colIdeas, (snapshot) => {
        const ideasData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setIdeas(ideasData);
      });
    }

    return () => {
      unsubAuth();
      unsubProjects();
      unsubLogs();
      unsubIdeas();
    };
  }, [isAdmin]);

  // 수익 히스토리 데이터 합산 및 차트용 가공
  const revenueChartData = useMemo(() => {
    if (!isAdmin) return [];
    const monthlyMap = {};
    projects.forEach(p => {
      (p.revenueHistory || []).forEach(entry => {
        const month = entry.month; // "2026-01" 형식 기대
        monthlyMap[month] = (monthlyMap[month] || 0) + entry.amount;
      });
    });
    
    // 월별 정렬
    return Object.entries(monthlyMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, amount]) => ({ month: month.split('-')[1], fullMonth: month, amount }));
  }, [projects, isAdmin]);

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
        progress: Number(projectForm.progress),
        revenue: Number(projectForm.revenue),
        targetMRR: projectForm.targetMRR ? Number(projectForm.targetMRR) : null,
        revenueHistory: projectForm.revenueHistory || [],
        startedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setModalType(null);
      setProjectForm({ name: '', description: '', status: 'building', tags: '', stack: '', deployUrl: '', githubUrl: '', nextAction: '', progress: 0, revenue: 0, targetMRR: 0, revenueHistory: [] });
    } catch (err) {
      console.error(err);
      alert('저장 실패: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditClick = (p) => {
    setSelectedProject(p);
    setProjectForm({
      name: p.name,
      description: p.desc,
      status: p.status.toLowerCase(),
      tags: p.tags.join(', '),
      stack: p.stack.join(', '),
      deployUrl: p.deployUrl || '',
      githubUrl: p.githubUrl || '',
      nextAction: p.nextAction || '',
      progress: p.progress,
      revenue: p.revenue,
      targetMRR: p.targetMRR || 0,
      revenueHistory: p.revenueHistory || []
    });
    setModalType('edit_project');
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    if (!isAdmin || !selectedProject) return;
    setIsSaving(true);
    try {
      const projectRef = doc(db, 'devlog_projects', selectedProject.id);
      await updateDoc(projectRef, {
        ...projectForm,
        tags: projectForm.tags.split(',').map(t => t.trim()).filter(t => t),
        stack: projectForm.stack.split(',').map(s => s.trim()).filter(s => s),
        progress: Number(projectForm.progress),
        revenue: Number(projectForm.revenue),
        targetMRR: projectForm.targetMRR ? Number(projectForm.targetMRR) : null,
        revenueHistory: projectForm.revenueHistory || [],
        updatedAt: serverTimestamp()
      });
      setModalType(null);
      setSelectedProject(null);
    } catch (err) {
      console.error(err);
      alert('업데이트 실패: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProject = async (p) => {
    if (!isAdmin) return;
    if (window.confirm(`'${p.name}' 프로젝트를 삭제하시겠습니까?`)) {
      try {
        await deleteDoc(doc(db, 'devlog_projects', p.id));
      } catch (err) {
        console.error('프로젝트 삭제 실패:', err);
        alert('삭제에 실패했습니다: ' + err.message);
      }
    }
  };

  const addHistoryItem = () => {
    if (!historyAmount) return;
    const newItem = { month: historyMonth, amount: Number(historyAmount) };
    const updatedHistory = [...(projectForm.revenueHistory || []), newItem].sort((a, b) => a.month.localeCompare(b.month));
    setProjectForm({ ...projectForm, revenueHistory: updatedHistory });
    setHistoryAmount('');
  };

  const removeHistoryItem = (index) => {
    const updatedHistory = projectForm.revenueHistory.filter((_, i) => i !== index);
    setProjectForm({ ...projectForm, revenueHistory: updatedHistory });
  };

  const handleAddLog = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    setIsSaving(true);
    try {
      const targetProject = projects.find(p => p.name === logForm.projectName);
      await addDoc(collection(db, 'devlog_logs'), {
        ...logForm,
        projectId: targetProject?.id || '',
        loggedAt: serverTimestamp(),
        createdAt: serverTimestamp()
      });
      setModalType(null);
      setLogForm({ projectId: '', projectName: '', message: '', status: 'building', tag: '기타' });
    } catch (err) {
      console.error(err);
      alert('로그 저장 실패: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditLogClick = (log) => {
    setSelectedLog(log);
    setLogForm({
      projectId: log.projectId || '',
      projectName: log.project || '',
      message: log.msg || '',
      tag: log.tag || '기타',
      status: log.status?.toLowerCase() || 'building'
    });
    setModalType('edit_log');
  };

  const handleUpdateLog = async (e) => {
    e.preventDefault();
    if (!isAdmin || !selectedLog) return;
    setIsSaving(true);
    try {
      const logRef = doc(db, 'devlog_logs', selectedLog.id);
      await updateDoc(logRef, {
        message: logForm.message,
        tag: logForm.tag,
        status: logForm.status,
        updatedAt: serverTimestamp()
      });
      setModalType(null);
      setSelectedLog(null);
    } catch (err) {
      console.error(err);
      alert('로그 업데이트 실패: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteLog = async (id) => {
    if (!isAdmin) return;
    if (window.confirm('이 로그를 삭제하시겠습니까?')) {
      try {
        await deleteDoc(doc(db, 'devlog_logs', id));
        // 모달 안의 목록에서도 즉시 제거
        setProjectLogs(prev => prev.filter(l => l.id !== id));
      } catch (err) {
        console.error('로그 삭제 실패:', err);
      }
    }
  };

  const startInlineEdit = (log) => {
    setEditingLogId(log.id);
    setInlineEditForm({ message: log.message || log.msg || '', tag: log.tag || '기타' });
  };

  const handleInlineUpdate = async (id) => {
    setIsSaving(true);
    try {
      const logRef = doc(db, 'devlog_logs', id);
      await updateDoc(logRef, {
        message: inlineEditForm.message,
        tag: inlineEditForm.tag,
        updatedAt: serverTimestamp()
      });
      // 로컬 상태 업데이트
      setProjectLogs(prev => prev.map(l => l.id === id ? { ...l, message: inlineEditForm.message, tag: inlineEditForm.tag } : l));
      setEditingLogId(null);
    } catch (err) {
      console.error('인라인 업데이트 실패:', err);
      alert('업데이트에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewLogs = async (p) => {
    setSelectedProject(p);
    setModalType('view_logs');
    setProjectLogs([]); // 초기화
    
    try {
      // 인덱스 에러 방지를 위해 orderBy 제거 후 JS에서 정렬
      const qName = query(
        collection(db, 'devlog_logs'),
        where('projectName', '==', p.name)
      );
      
      const qId = query(
        collection(db, 'devlog_logs'),
        where('projectId', '==', p.id)
      );

      const [snapName, snapId] = await Promise.all([getDocs(qName), getDocs(qId)]);
      
      const combinedLogs = [...snapName.docs, ...snapId.docs].reduce((acc, doc) => {
        if (!acc.find(l => l.id === doc.id)) {
          const data = doc.data();
          acc.push({
            id: doc.id,
            ...data,
            date: data.loggedAt?.toDate ? data.loggedAt.toDate().toLocaleDateString() : 'RECENT'
          });
        }
        return acc;
      }, []);

      // JavaScript에서 정렬 처리 (loggedAt 내림차순)
      setProjectLogs(combinedLogs.sort((a, b) => {
        const timeA = a.loggedAt?.seconds || 0;
        const timeB = b.loggedAt?.seconds || 0;
        return timeB - timeA;
      }));
    } catch (err) {
      console.error('로그 조회 실패:', err);
    }
  };

  const handleAddIdea = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'devlog_ideas'), {
        ...ideaForm,
        tags: ideaForm.tags.split(',').map(t => t.trim()).filter(t => t),
        createdAt: serverTimestamp()
      });
      setModalType(null);
      setIdeaForm({ title: '', description: '', potential: 'mid', tags: '' });
    } catch (err) {
      console.error(err);
      alert('아이디어 저장 실패: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteIdea = async (id) => {
    if (!isAdmin) return;
    if (window.confirm('아이디어를 삭제하시겠습니까?')) {
      try {
        await deleteDoc(doc(db, 'devlog_ideas', id));
      } catch (err) {
        console.error('삭제 실패:', err);
      }
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

  function formatRevenue(amount) {
    if (!amount || amount === 0) return '₩0';
    if (amount >= 1000) return `₩${(amount / 1000).toFixed(0)}K`;
    return `₩${amount}`;
  }

  const filteredProjects = activeStackFilter
    ? projects.filter(p => p.stack.includes(activeStackFilter))
    : projects;

  return (
    <div className="min-h-screen pt-[56px]" style={{ backgroundColor: COLORS.bg, color: COLORS.text, fontFamily: FONTS.grotesk }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
        .project-card-custom::after { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; z-index: 10; opacity: 0.3; background: #112240; }
        .s-live::after    { display: none; }
        .s-building::after{ display: none; }
        .s-idea::after    { display: none; }
        .s-paused::after  { display: none; }
        input, textarea, select { background: #0d1a2d !important; border: 1px solid #112240 !important; color: #e8f4ff !important; outline: none; }
        input:focus, textarea:focus, select:focus { border-color: #00d4ff !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #112240; border-radius: 10px; }
      `}</style>

      <div className="flex min-h-[calc(100vh-56px)]">

        {/* ── LEFT SIDEBAR ── */}
        <aside
          className="hidden lg:block w-[210px] shrink-0 border-r sticky top-[56px] h-[calc(100vh-56px)] overflow-y-auto py-7"
          style={{ backgroundColor: COLORS.bg2, borderColor: COLORS.border }}
        >
          {/* VIEW */}
          <div className="mb-7">
            <div className="text-[11px] uppercase tracking-[1.8px] px-5 pb-2 mb-2 border-b" style={{ color: COLORS.textDim, borderColor: COLORS.border, fontFamily: FONTS.mono }}>View</div>
            <div className="flex items-center justify-between px-5 py-2 cursor-pointer border-l-2 border-l-[#00d4ff] bg-[#00d4ff22] text-[#00d4ff]">
              <div className="flex items-center gap-2 text-[13px]"><span>⊞</span> All Projects</div>
              <span className="text-[11px] px-1.5 py-0.5 rounded-full border border-[#00d4ff44] bg-[#00d4ff22]" style={{ fontFamily: FONTS.mono }}>{projects.length}</span>
            </div>
          </div>

          {/* STATUS */}
          <div className="mb-7">
            <div className="text-[11px] uppercase tracking-[1.8px] px-5 pb-2 mb-2 border-b" style={{ color: COLORS.textDim, borderColor: COLORS.border, fontFamily: FONTS.mono }}>Status</div>
            {[
              { label: 'Live', color: COLORS.green, count: projects.filter(p => p.status === 'LIVE').length },
              { label: 'Building', color: COLORS.amber, count: projects.filter(p => p.status === 'BUILDING').length },
              { label: 'Idea', color: COLORS.blue, count: projects.filter(p => p.status === 'IDEA').length },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between px-5 py-2 cursor-pointer border-l-2 border-transparent text-[#4a6080] hover:text-[#7a9ab8] hover:bg-[#0b1525]">
                <div className="flex items-center gap-2 text-[13px]">
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: s.color }}></div>
                  {s.label}
                </div>
                <span className="text-[11px] px-1.5 py-0.5 rounded-full border border-[#112240] bg-[#0b1525]" style={{ fontFamily: FONTS.mono }}>{s.count}</span>
              </div>
            ))}
          </div>

          {/* STACK */}
          <div>
            <div className="text-[11px] uppercase tracking-[1.8px] px-5 pb-2 mb-2 border-b" style={{ color: COLORS.textDim, borderColor: COLORS.border, fontFamily: FONTS.mono }}>Stack</div>
            {Array.from(new Set(projects.flatMap(p => p.stack))).slice(0, 15).map(tag => (
              <span
                key={tag}
                className="block px-5 py-1.5 text-[11px] cursor-pointer transition-all"
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
              <div className="text-[12px] mb-3 tracking-wider" style={{ color: COLORS.textDim, fontFamily: FONTS.mono }}>
                Home › Projects › <span style={{ color: COLORS.cyan }}>DEVLOG</span>
              </div>
              <div className="text-4xl font-bold tracking-tight mb-1" style={{ color: COLORS.white }}>
                Build Log.<span style={{ color: COLORS.cyan }}>_</span>
              </div>
              <div className="text-[12px] uppercase tracking-[1.5px]" style={{ color: COLORS.textDim, fontFamily: FONTS.mono }}>
                실시간 빌드 아카이브 &nbsp;/&nbsp; 개발 대시보드
              </div>
            </div>
            <div className="flex flex-col items-end gap-3">
              <button 
                onClick={isAdmin ? handleLogout : () => setModalType('login')}
                className="text-[11px] font-bold uppercase tracking-widest transition-all hover:opacity-80"
                style={{ color: isAdmin ? COLORS.cyan : COLORS.border2, fontFamily: FONTS.mono }}
              >
                {isAdmin ? 'LOGOUT' : 'ADMIN'}
              </button>
              {isAdmin && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => setModalType('log')}
                    className="text-[11px] uppercase tracking-wider px-4 py-2 rounded font-bold transition-all border border-[#112240] hover:border-[#1a3060]"
                    style={{ color: COLORS.cyan, fontFamily: FONTS.mono }}
                  >
                    + ADD LOG
                  </button>
                  <button 
                    onClick={() => setModalType('project')}
                    className="text-[11px] uppercase tracking-wider px-4 py-2 rounded font-bold transition-all"
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
                <div className="text-[11px] uppercase tracking-[1.5px] mb-2.5" style={{ color: COLORS.textDim, fontFamily: FONTS.mono }}>{stat.label}</div>
                <div className="font-bold leading-none mb-1.5" style={{ fontSize: '2.8rem', color: stat.textColor }}>{stat.val}</div>
                <div className="text-[12px]" style={{ color: COLORS.textDim }}>{stat.sub}</div>
              </div>
            ))}
          </div>

          {/* Project Cards */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-3.5 mb-10">
            {loading ? (
              <div className="col-span-full py-20 text-center text-sm" style={{ color: COLORS.textDim, fontFamily: FONTS.mono }}>Loading...</div>
            ) : filteredProjects.length === 0 ? (
              <div className="col-span-full py-20 text-center text-sm" style={{ color: COLORS.textDim, fontFamily: FONTS.mono }}>아직 프로젝트가 없습니다</div>
            ) : filteredProjects.map(p => {
              const mrrRate = p.targetMRR > 0 ? Math.round((p.revenue / p.targetMRR) * 100) : null;
              let mrrColor = COLORS.textDim;
              if (mrrRate >= 100) mrrColor = COLORS.green;
              else if (mrrRate >= 50) mrrColor = COLORS.amber;

              return (
              <div
                key={p.id}
                className={`relative group rounded-xl border overflow-hidden transition-all hover:-translate-y-0.5 hover:border-[#1a3060] project-card-custom ${p.statusClass}`}
                style={{ backgroundColor: COLORS.card, borderColor: COLORS.border }}
              >
                {/* Progress Bar Header */}
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#112240] z-10">
                  <div 
                    className="h-full transition-all duration-1000" 
                    style={{ width: `${p.progress}%`, backgroundColor: p.statusColor }}
                  ></div>
                </div>

                <div style={{ padding: '20px 24px 20px 24px', paddingTop: '24px' }}>
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded uppercase"
                        style={{ fontFamily: FONTS.mono, ...(p.badgeStyle) }}
                      >{p.status}</span>
                      {p.type && (
                        <span className="text-[10px] tracking-wider uppercase" style={{ color: COLORS.textDim, fontFamily: FONTS.mono }}>{p.type}</span>
                      )}
                    </div>
                    {isAdmin && (
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEditClick(p)} className="text-[#4a6080] hover:text-[#00d4ff] transition-all">
                          <Edit2 size={13} />
                        </button>
                        <button 
                          onClick={() => handleDeleteProject(p)} 
                          className="text-[#4a6080] hover:text-[#ff4466] transition-all"
                          style={{ fontSize: '14px' }}
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="font-bold mt-3 mb-2 tracking-tight" style={{ fontSize: '17px', color: COLORS.white }}>{p.name}</div>
                  <div className="text-[13px] leading-relaxed mb-4" style={{ color: COLORS.textDim }}>{p.desc}</div>

                  <div className="flex flex-wrap gap-2 mb-5">
                    {p.stack.map(s => (
                      <span key={s} className="text-[11px] px-2 py-0.5 border rounded-sm tracking-tight" style={{ color: COLORS.textMid, borderColor: COLORS.border2, fontFamily: FONTS.mono }}>{s}</span>
                    ))}
                  </div>

                  {/* Next Action */}
                  {p.nextAction && (
                    <div className="mb-4 p-2 rounded bg-[#080f1c] border border-[#112240] flex items-center gap-2">
                      <span className="text-[11px] font-bold text-[#00d4ff]" style={{ fontFamily: FONTS.mono }}>→ NEXT</span>
                      <span className="text-[12px] text-[#7a9ab8] truncate">{p.nextAction}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-3 border-t" style={{ borderColor: COLORS.border }}>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px]" style={{ color: COLORS.textDim, fontFamily: FONTS.mono }}>{p.date}</span>
                        <div className="flex gap-1.5 items-center">
                          {p.githubUrl && (
                            <a href={p.githubUrl} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-[#00d4ff] transition-all">
                              <Github size={11} />
                            </a>
                          )}
                          {p.deployUrl && (
                            <a href={p.deployUrl} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-[#00d4ff] transition-all">
                              <ExternalLink size={11} />
                            </a>
                          )}
                        </div>
                      </div>
                      <span className="text-[8px] uppercase tracking-wider" style={{ color: p.statusColor, fontFamily: FONTS.mono }}>{p.progress}% COMPLETED</span>
                      {isAdmin && mrrRate !== null && mrrRate > 0 && (
                        <span className="text-[11px] uppercase mt-0.5" style={{ color: mrrColor, fontFamily: FONTS.mono }}>MRR 목표 {mrrRate}%</span>
                      )}
                    </div>
                    <button 
                      onClick={() => handleViewLogs(p)}
                      className="text-[11px] font-bold hover:opacity-80 transition-all" 
                      style={{ color: COLORS.cyan, fontFamily: FONTS.mono }}
                    >
                      {p.action}
                    </button>
                  </div>
                </div>
              </div>
            )})}
          </div>

          {/* Timeline */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[12px] uppercase tracking-[2px]" style={{ color: COLORS.textDim, fontFamily: FONTS.mono }}>Recent Build Log</span>
            </div>
            <div className="relative pl-6 space-y-2.5 before:content-[''] before:absolute before:left-[7px] before:top-2 before:bottom-0 before:w-[1px] before:bg-gradient-to-b before:from-[#00d4ff44] before:to-transparent">
              {logs.length === 0 ? (
                <div className="text-xs py-5" style={{ color: COLORS.textDim, fontFamily: FONTS.mono }}>No logs found.</div>
              ) : logs.map((log, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-[19px] top-3.5 w-2 h-2 rounded-full border-2" style={{ backgroundColor: log.color, borderColor: COLORS.bg }}></div>
                  <div className="flex items-center justify-between p-3 rounded-lg border transition-all hover:border-[#1a3060]" style={{ backgroundColor: COLORS.card, borderColor: COLORS.border }}>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="text-[14px] font-semibold" style={{ color: COLORS.cyan, fontFamily: FONTS.mono }}>{log.project}</div>
                        {log.tag && (
                          <span 
                            className="text-[10px] px-1.5 py-0.5 rounded border" 
                            style={{ 
                              fontFamily: FONTS.mono,
                              color: log.tag === '기능추가' ? '#00d4ff' : 
                                     log.tag === '버그수정' ? '#ff4466' : 
                                     log.tag === '배포' ? '#00ff88' : 
                                     log.tag === '기획' ? '#ffb300' : '#4a6080',
                              borderColor: log.tag === '기능추가' ? '#00d4ff44' : 
                                          log.tag === '버그수정' ? '#ff446644' : 
                                          log.tag === '배포' ? '#00ff8844' : 
                                          log.tag === '기획' ? '#ffb30044' : '#4a608044'
                            }}
                          >
                            {log.tag}
                          </span>
                        )}
                      </div>
                      <div className="text-[13px] truncate" style={{ color: COLORS.textMid }}>{log.msg}</div>
                    </div>
                    <div className="flex items-center gap-4 ml-4 shrink-0">
                      {isAdmin && (
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleEditLogClick(log)}
                            className="text-[#4a6080] hover:text-[#00d4ff] transition-all"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button 
                            onClick={() => handleDeleteLog(log.id)}
                            className="text-[#4a6080] hover:text-[#ff4466] transition-all"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                      <span className="text-[11px] uppercase" style={{ color: COLORS.textDim, fontFamily: FONTS.mono }}>{log.date}</span>
                    </div>
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
          <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar" style={{ padding: '28px 18px' }}>
            
            {/* Build Activity (Public) */}
            <div className="mb-8">
              <div className="text-[11px] uppercase tracking-[1.8px] pb-2 mb-3 border-b" style={{ color: COLORS.textDim, borderColor: COLORS.border, fontFamily: FONTS.mono }}>Build Activity</div>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {Array.from({ length: 28 }).map((_, i) => {
                  const levels = ['', 'bg-[#00d4ff22]', 'bg-[#00d4ff44]', 'bg-[#00d4ff88]', 'bg-[#00d4ff]'];
                  const level = i % 5 === 0 ? 0 : (i % 4) + 1; // dummy pattern
                  return (
                    <div key={i} className={`w-full aspect-square rounded-sm border border-[#112240] ${levels[level]}`}></div>
                  );
                })}
              </div>
              <div className="text-[10px] text-right" style={{ color: COLORS.textDim, fontFamily: FONTS.mono }}>LATEST 28 DAYS</div>
            </div>

            {/* Stack Usage (Public) */}
            <div className="mb-8">
              <div className="text-[11px] uppercase tracking-[1.8px] pb-2 mb-3 border-b" style={{ color: COLORS.textDim, borderColor: COLORS.border, fontFamily: FONTS.mono }}>Stack Usage</div>
              {[
                { name: 'React', pct: 92, color: COLORS.cyan },
                { name: 'Firebase', pct: 85, color: COLORS.green },
                { name: 'Tailwind', pct: 78, color: COLORS.blue },
                { name: 'Node.js', pct: 65, color: COLORS.amber },
              ].map(s => (
                <div key={s.name} className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[11px]" style={{ color: COLORS.textMid, fontFamily: FONTS.mono }}>{s.name}</span>
                    <span className="text-[10px]" style={{ color: COLORS.textDim, fontFamily: FONTS.mono }}>{s.pct}%</span>
                  </div>
                  <div className="h-1 w-full bg-[#112240] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${s.pct}%`, backgroundColor: s.color }}></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Revenue Tracker (Admin Only) */}
            {isAdmin && (
              <div className="mb-7">
                <div className="text-[11px] uppercase tracking-[1.8px] pb-2 mb-3 border-b" style={{ color: COLORS.textDim, borderColor: COLORS.border, fontFamily: FONTS.mono }}>Revenue Tracker</div>
                {projects.filter(p => (p.revenue || 0) > 0).length === 0 ? (
                  <div className="text-[12px]" style={{ color: COLORS.textDim }}>수익 발생 프로젝트 없음</div>
                ) : projects.filter(p => (p.revenue || 0) > 0).map(p => (
                  <div key={p.id} className="flex justify-between items-center mb-2">
                    <span className="text-[12px] truncate" style={{ color: COLORS.textMid, maxWidth: '120px' }}>{p.name}</span>
                    <span className="text-[12px] font-bold shrink-0" style={{ color: COLORS.green, fontFamily: FONTS.mono }}>{formatRevenue(p.revenue)}</span>
                  </div>
                ))}
                <div className="mt-2 pt-2 border-t flex justify-between items-center" style={{ borderColor: COLORS.border }}>
                  <span className="text-[12px]" style={{ color: COLORS.textDim }}>누적 합계</span>
                  <span className="text-[13px] font-bold shrink-0" style={{ color: COLORS.green, fontFamily: FONTS.mono }}>{formatRevenue(projects.reduce((acc, p) => acc + (p.revenue || 0), 0))}</span>
                </div>
              </div>
            )}

            {/* Revenue History Chart (Admin Only) */}
            {isAdmin && (
              <div className="mb-7">
                <div className="text-[11px] uppercase tracking-[1.8px] pb-2 mb-3 border-b" style={{ color: COLORS.textDim, borderColor: COLORS.border, fontFamily: FONTS.mono }}>Revenue History</div>
                {revenueChartData.length < 2 ? (
                  <div className="text-[10px] py-4 text-center leading-relaxed" style={{ color: COLORS.textDim }}>수익 데이터를 입력해주세요</div>
                ) : (
                  <div className="relative w-full h-[80px]">
                    <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                      {/* Lines */}
                      <path
                        d={`M ${revenueChartData.map((d, i) => {
                          const x = (i / (revenueChartData.length - 1)) * 100;
                          const maxAmount = Math.max(...revenueChartData.map(v => v.amount));
                          const y = 40 - (d.amount / maxAmount) * 35;
                          return `${x},${y}`;
                        }).join(' L ')}`}
                        fill="none"
                        stroke={COLORS.cyan}
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                      {/* Dots */}
                      {revenueChartData.map((d, i) => {
                        const x = (i / (revenueChartData.length - 1)) * 100;
                        const maxAmount = Math.max(...revenueChartData.map(v => v.amount));
                        const y = 40 - (d.amount / maxAmount) * 35;
                        return (
                          <g key={i} className="group/dot cursor-pointer">
                            <circle cx={x} cy={y} r="1.5" fill={COLORS.cyan} />
                            <title>{`${d.fullMonth}: ${formatRevenue(d.amount)}`}</title>
                          </g>
                        );
                      })}
                    </svg>
                    {/* X-axis labels */}
                    <div className="flex justify-between mt-1 px-0.5">
                      {revenueChartData.map((d, i) => (
                        <span key={i} className="text-[9px]" style={{ color: COLORS.textDim, fontFamily: FONTS.mono }}>{d.month}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Next Actions (Admin Only) */}
            {isAdmin && (
              <div className="mb-7">
                <div className="text-[11px] uppercase tracking-[1.8px] pb-2 mb-3 border-b" style={{ color: COLORS.textDim, borderColor: COLORS.border, fontFamily: FONTS.mono }}>Next Actions</div>
                {projects.filter(p => p.nextAction).slice(0, 5).map((p, i) => (
                  <div key={i} className="flex gap-2.5 items-start mb-2.5">
                    <div className="w-1 h-1 rounded-full mt-[5px] shrink-0" style={{ backgroundColor: p.statusColor }}></div>
                    <div className="text-[12px] leading-relaxed" style={{ color: COLORS.textDim }}>
                      <span className="font-bold text-[#7a9ab8]">{p.name}:</span> {p.nextAction}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Idea Vault (Admin Only) */}
            {isAdmin && (
              <div>
                <div className="flex justify-between items-center pb-2 mb-3 border-b" style={{ borderColor: COLORS.border }}>
                  <div className="text-[11px] uppercase tracking-[1.8px]" style={{ color: COLORS.textDim, fontFamily: FONTS.mono }}>Idea Vault</div>
                  <button 
                    onClick={() => setModalType('idea')}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-[#112240] hover:bg-[#1a3060] transition-colors"
                    style={{ color: COLORS.cyan, fontFamily: FONTS.mono }}
                  >
                    + ADD
                  </button>
                </div>
                <div className="space-y-2">
                  {ideas.length === 0 ? (
                    <div className="text-[11px] text-center py-4" style={{ color: COLORS.textDim }}>아이디어가 비어있습니다</div>
                  ) : ideas.map(idea => (
                    <div key={idea.id} className="p-2.5 rounded border transition-all hover:border-[#1a3060]" style={{ backgroundColor: COLORS.card, borderColor: COLORS.border }}>
                      <div className="flex justify-between items-start mb-1 gap-2">
                        <div 
                          className="text-[13px] font-bold cursor-pointer hover:text-[#00d4ff] transition-colors"
                          style={{ color: COLORS.white }}
                          onClick={() => setExpandedIdea(expandedIdea === idea.id ? null : idea.id)}
                        >
                          {idea.title}
                        </div>
                        <button onClick={() => handleDeleteIdea(idea.id)} className="text-[#4a6080] hover:text-red-400 shrink-0">✕</button>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <span 
                          className="text-[9px] px-1 rounded font-bold"
                          style={{ 
                            fontFamily: FONTS.mono,
                            backgroundColor: idea.potential === 'high' ? '#ff446622' : idea.potential === 'mid' ? '#ffb30022' : '#00d4ff22',
                            color: idea.potential === 'high' ? '#ff4466' : idea.potential === 'mid' ? '#ffb300' : '#00d4ff',
                          }}
                        >
                          {idea.potential.toUpperCase()}
                        </span>
                        {idea.tags && idea.tags.map(t => (
                          <span key={t} className="text-[9px]" style={{ color: COLORS.textDim, fontFamily: FONTS.mono }}>#{t}</span>
                        ))}
                      </div>
                      {expandedIdea === idea.id && (
                        <div className="mt-2 pt-2 border-t text-[11px] leading-relaxed whitespace-pre-wrap" style={{ borderColor: COLORS.border, color: COLORS.textMid }}>
                          {idea.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                {modalType === 'project' ? '＋ NEW PROJECT' : 
                 modalType === 'edit_project' ? '✎ EDIT PROJECT' :
                 modalType === 'log' ? '＋ NEW LOG' : 
                 modalType === 'view_logs' ? `${selectedProject?.name.toUpperCase()} / BUILD LOG` :
                 'ADMIN LOGIN'}
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

            {(modalType === 'project' || modalType === 'edit_project') && isAdmin && (
              <form onSubmit={modalType === 'project' ? handleAddProject : handleUpdateProject} className="space-y-4">
                <div className="space-y-1">
                  <div className="text-[10px] uppercase tracking-widest pl-1" style={{ color: COLORS.textDim, fontFamily: FONTS.mono }}>Project Name</div>
                  <input required placeholder="프로젝트명" className="w-full p-2.5 rounded text-xs" value={projectForm.name} onChange={e => setProjectForm({...projectForm, name: e.target.value})} />
                </div>
                
                <div className="space-y-1">
                  <div className="text-[10px] uppercase tracking-widest pl-1" style={{ color: COLORS.textDim, fontFamily: FONTS.mono }}>Description</div>
                  <textarea required placeholder="한 줄 설명" className="w-full p-2.5 rounded text-xs h-20" value={projectForm.description} onChange={e => setProjectForm({...projectForm, description: e.target.value})} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase tracking-widest pl-1" style={{ color: COLORS.textDim, fontFamily: FONTS.mono }}>Status</div>
                    <select className="w-full p-2.5 rounded text-xs" value={projectForm.status} onChange={e => setProjectForm({...projectForm, status: e.target.value})}>
                      <option value="live">LIVE</option>
                      <option value="building">BUILDING</option>
                      <option value="idea">IDEA</option>
                      <option value="paused">PAUSED</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase tracking-widest pl-1" style={{ color: COLORS.textDim, fontFamily: FONTS.mono }}>Revenue</div>
                    <input type="number" placeholder="월 수익 (₩)" className="w-full p-2.5 rounded text-xs" value={projectForm.revenue} onChange={e => setProjectForm({...projectForm, revenue: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase tracking-widest pl-1" style={{ color: COLORS.textDim, fontFamily: FONTS.mono }}>Progress (%)</div>
                    <input type="number" min="0" max="100" placeholder="진행률 (0~100%)" className="w-full p-2.5 rounded text-xs" value={projectForm.progress} onChange={e => setProjectForm({...projectForm, progress: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase tracking-widest pl-1" style={{ color: COLORS.textDim, fontFamily: FONTS.mono }}>목표 MRR (₩)</div>
                    <input type="number" placeholder="목표 월 수익 (예: 1000000)" className="w-full p-2.5 rounded text-xs" value={projectForm.targetMRR} onChange={e => setProjectForm({...projectForm, targetMRR: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] uppercase tracking-widest pl-1" style={{ color: COLORS.textDim, fontFamily: FONTS.mono }}>Next Action</div>
                  <input placeholder="다음 할 일 (예: Stripe 결제 연동)" className="w-full p-2.5 rounded text-xs" value={projectForm.nextAction} onChange={e => setProjectForm({...projectForm, nextAction: e.target.value})} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase tracking-widest pl-1" style={{ color: COLORS.textDim, fontFamily: FONTS.mono }}>Tags</div>
                    <input placeholder="AI, SaaS, WEB..." className="w-full p-2.5 rounded text-xs" value={projectForm.tags} onChange={e => setProjectForm({...projectForm, tags: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase tracking-widest pl-1" style={{ color: COLORS.textDim, fontFamily: FONTS.mono }}>Stack</div>
                    <input placeholder="React, Firebase..." className="w-full p-2.5 rounded text-xs" value={projectForm.stack} onChange={e => setProjectForm({...projectForm, stack: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] uppercase tracking-widest pl-1" style={{ color: COLORS.textDim, fontFamily: FONTS.mono }}>Deploy URL</div>
                  <input placeholder="배포 URL (https://...)" className="w-full p-2.5 rounded text-xs" value={projectForm.deployUrl} onChange={e => setProjectForm({...projectForm, deployUrl: e.target.value})} />
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] uppercase tracking-widest pl-1" style={{ color: COLORS.textDim, fontFamily: FONTS.mono }}>GitHub URL</div>
                  <input placeholder="GitHub URL (https://github.com/...)" className="w-full p-2.5 rounded text-xs" value={projectForm.githubUrl} onChange={e => setProjectForm({...projectForm, githubUrl: e.target.value})} />
                </div>

                {/* Revenue History Section */}
                <div className="pt-4 border-t" style={{ borderColor: COLORS.border }}>
                  <div className="text-[10px] uppercase tracking-widest pl-1 mb-2" style={{ color: COLORS.textDim, fontFamily: FONTS.mono }}>REVENUE HISTORY</div>
                  
                  <div className="flex gap-2 mb-3">
                    <select className="flex-1 p-2 rounded text-xs" value={historyMonth} onChange={e => setHistoryMonth(e.target.value)}>
                      {Array.from({ length: 12 }, (_, i) => {
                        const m = (i + 1).toString().padStart(2, '0');
                        return <option key={m} value={`2026-${m}`}>2026-{m}</option>;
                      })}
                    </select>
                    <input type="number" placeholder="금액 (₩)" className="flex-1 p-2 rounded text-xs" value={historyAmount} onChange={e => setHistoryAmount(e.target.value)} />
                    <button type="button" onClick={addHistoryItem} className="px-4 rounded font-bold" style={{ backgroundColor: COLORS.cyan, color: '#000' }}>+</button>
                  </div>

                  <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar p-2 rounded" style={{ backgroundColor: '#0b1525', border: `1px solid ${COLORS.border}` }}>
                    {projectForm.revenueHistory.length === 0 ? (
                      <div className="text-[10px] text-center py-2" style={{ color: COLORS.textDim }}>데이터 없음</div>
                    ) : projectForm.revenueHistory.map((item, i) => (
                      <div key={i} className="flex justify-between items-center text-[11px]" style={{ color: COLORS.textMid, fontFamily: FONTS.mono }}>
                        <span>{item.month} | ₩{item.amount.toLocaleString()}</span>
                        <button type="button" onClick={() => removeHistoryItem(i)} className="text-red-400 hover:text-red-300 ml-2">✕</button>
                      </div>
                    ))}
                  </div>
                </div>

                <button disabled={isSaving} className="w-full py-3.5 rounded font-bold transition-all text-sm mt-2" style={{ backgroundColor: COLORS.cyan, color: '#000', fontFamily: FONTS.mono }}>
                  {isSaving ? 'SAVING...' : modalType === 'project' ? 'SAVE PROJECT' : 'UPDATE PROJECT'}
                </button>
              </form>
            )}

            {modalType === 'log' && isAdmin && (
              <form onSubmit={handleAddLog} className="space-y-4">
                <div className="space-y-1">
                  <div className="text-[10px] uppercase tracking-widest pl-1" style={{ color: COLORS.textDim, fontFamily: FONTS.mono }}>프로젝트</div>
                  <select required className="w-full p-2.5 rounded text-xs" value={logForm.projectName} onChange={e => setLogForm({...logForm, projectName: e.target.value})}>
                    <option value="">프로젝트 선택</option>
                    {projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase tracking-widest pl-1" style={{ color: COLORS.textDim, fontFamily: FONTS.mono }}>로그 태그</div>
                    <select required className="w-full p-2.5 rounded text-xs" value={logForm.tag} onChange={e => setLogForm({...logForm, tag: e.target.value})}>
                      <option value="기능추가">기능추가</option>
                      <option value="버그수정">버그수정</option>
                      <option value="배포">배포</option>
                      <option value="기획">기획</option>
                      <option value="기타">기타</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase tracking-widest pl-1" style={{ color: COLORS.textDim, fontFamily: FONTS.mono }}>상태</div>
                    <select className="w-full p-2.5 rounded text-xs" value={logForm.status} onChange={e => setLogForm({...logForm, status: e.target.value})}>
                      <option value="building">BUILDING</option>
                      <option value="live">LIVE</option>
                      <option value="idea">IDEA</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] uppercase tracking-widest pl-1" style={{ color: COLORS.textDim, fontFamily: FONTS.mono }}>로그 메시지</div>
                  <textarea required placeholder="로그 메시지" className="w-full p-2.5 rounded text-xs h-24" value={logForm.message} onChange={e => setLogForm({...logForm, message: e.target.value})} />
                </div>

                <button disabled={isSaving} className="w-full py-3 rounded font-bold transition-all text-sm mt-2" style={{ backgroundColor: COLORS.cyan, color: '#000', fontFamily: FONTS.mono }}>
                  {isSaving ? 'SAVING...' : 'SAVE LOG'}
                </button>
              </form>
            )}

            {modalType === 'edit_log' && isAdmin && (
              <form onSubmit={handleUpdateLog} className="space-y-4">
                <div className="space-y-1">
                  <div className="text-[10px] uppercase tracking-widest pl-1" style={{ color: COLORS.textDim, fontFamily: FONTS.mono }}>프로젝트</div>
                  <div className="w-full p-2.5 rounded text-xs opacity-50 border border-[#112240] bg-[#0d1a2d]" style={{ color: COLORS.textMid }}>
                    {logForm.projectName}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase tracking-widest pl-1" style={{ color: COLORS.textDim, fontFamily: FONTS.mono }}>로그 태그</div>
                    <select required className="w-full p-2.5 rounded text-xs" value={logForm.tag} onChange={e => setLogForm({...logForm, tag: e.target.value})}>
                      <option value="기능추가">기능추가</option>
                      <option value="버그수정">버그수정</option>
                      <option value="배포">배포</option>
                      <option value="기획">기획</option>
                      <option value="기타">기타</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase tracking-widest pl-1" style={{ color: COLORS.textDim, fontFamily: FONTS.mono }}>상태</div>
                    <select className="w-full p-2.5 rounded text-xs" value={logForm.status} onChange={e => setLogForm({...logForm, status: e.target.value})}>
                      <option value="building">BUILDING</option>
                      <option value="live">LIVE</option>
                      <option value="idea">IDEA</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] uppercase tracking-widest pl-1" style={{ color: COLORS.textDim, fontFamily: FONTS.mono }}>로그 메시지</div>
                  <textarea required placeholder="로그 메시지" className="w-full p-2.5 rounded text-xs h-24" value={logForm.message} onChange={e => setLogForm({...logForm, message: e.target.value})} />
                </div>

                <button disabled={isSaving} className="w-full py-3 rounded font-bold transition-all text-sm mt-2" style={{ backgroundColor: COLORS.cyan, color: '#000', fontFamily: FONTS.mono }}>
                  {isSaving ? 'UPDATING...' : 'UPDATE LOG'}
                </button>
              </form>
            )}

            {modalType === 'idea' && isAdmin && (
              /* Firebase Security Rules Recommendation:
                 match /devlog_ideas/{ideaId} {
                   allow read, write: if request.auth != null;
                 }
              */
              <form onSubmit={handleAddIdea} className="space-y-4">
                <div className="space-y-1">
                  <div className="text-[10px] uppercase tracking-widest pl-1" style={{ color: COLORS.textDim, fontFamily: FONTS.mono }}>Idea Title</div>
                  <input required placeholder="아이디어 제목" className="w-full p-2.5 rounded text-xs" value={ideaForm.title} onChange={e => setIdeaForm({...ideaForm, title: e.target.value})} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase tracking-widest pl-1" style={{ color: COLORS.textDim, fontFamily: FONTS.mono }}>Potential</div>
                    <select required className="w-full p-2.5 rounded text-xs" value={ideaForm.potential} onChange={e => setIdeaForm({...ideaForm, potential: e.target.value})}>
                      <option value="high">🔥 HIGH</option>
                      <option value="mid">👍 MID</option>
                      <option value="low">💡 LOW</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase tracking-widest pl-1" style={{ color: COLORS.textDim, fontFamily: FONTS.mono }}>Tags</div>
                    <input placeholder="comma, separated" className="w-full p-2.5 rounded text-xs" value={ideaForm.tags} onChange={e => setIdeaForm({...ideaForm, tags: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] uppercase tracking-widest pl-1" style={{ color: COLORS.textDim, fontFamily: FONTS.mono }}>Description</div>
                  <textarea required placeholder="상세 내용" className="w-full p-2.5 rounded text-xs h-32" value={ideaForm.description} onChange={e => setIdeaForm({...ideaForm, description: e.target.value})} />
                </div>

                <button disabled={isSaving} className="w-full py-3.5 rounded font-bold transition-all text-sm mt-2" style={{ backgroundColor: COLORS.cyan, color: '#000', fontFamily: FONTS.mono }}>
                  {isSaving ? 'SAVING...' : 'SAVE IDEA'}
                </button>
              </form>
            )}

            {modalType === 'view_logs' && (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {projectLogs.length === 0 ? (
                  <div className="py-10 text-center text-xs" style={{ color: COLORS.textDim, fontFamily: FONTS.mono }}>아직 로그가 없습니다</div>
                ) : projectLogs.map(log => (
                  <div key={log.id} className="p-4 rounded-lg border group/item" style={{ backgroundColor: COLORS.bg2, borderColor: COLORS.border }}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-[11px] uppercase tracking-wider" style={{ color: COLORS.textDim, fontFamily: FONTS.mono }}>{log.date}</div>
                      {isAdmin && editingLogId !== log.id && (
                        <div className="flex items-center gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <button 
                            onClick={() => startInlineEdit(log)}
                            className="text-[#4a6080] hover:text-[#00d4ff] transition-colors"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button 
                            onClick={() => handleDeleteLog(log.id)}
                            className="text-[#4a6080] hover:text-[#ff4466] transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {editingLogId === log.id ? (
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <div className="text-[9px] uppercase tracking-widest" style={{ color: COLORS.textDim, fontFamily: FONTS.mono }}>Tag</div>
                          <select 
                            className="w-full p-2 rounded text-xs" 
                            style={{ backgroundColor: '#0b1525', borderColor: '#1a3060', color: COLORS.text }}
                            value={inlineEditForm.tag} 
                            onChange={e => setInlineEditForm({...inlineEditForm, tag: e.target.value})}
                          >
                            <option value="기능추가">기능추가</option>
                            <option value="버그수정">버그수정</option>
                            <option value="배포">배포</option>
                            <option value="기획">기획</option>
                            <option value="기타">기타</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <div className="text-[9px] uppercase tracking-widest" style={{ color: COLORS.textDim, fontFamily: FONTS.mono }}>Message</div>
                          <textarea 
                            className="w-full p-2 rounded text-xs h-20" 
                            style={{ backgroundColor: '#0b1525', borderColor: '#1a3060', color: COLORS.text }}
                            value={inlineEditForm.message} 
                            onChange={e => setInlineEditForm({...inlineEditForm, message: e.target.value})}
                          />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button 
                            onClick={() => setEditingLogId(null)}
                            className="px-3 py-1.5 rounded text-[10px] font-bold border border-[#1a3060]"
                            style={{ color: COLORS.textDim, fontFamily: FONTS.mono }}
                          >
                            CANCEL
                          </button>
                          <button 
                            disabled={isSaving}
                            onClick={() => handleInlineUpdate(log.id)}
                            className="px-4 py-1.5 rounded text-[10px] font-bold"
                            style={{ backgroundColor: COLORS.cyan, color: '#000', fontFamily: FONTS.mono }}
                          >
                            {isSaving ? 'SAVING...' : 'SAVE'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        {log.tag && (
                          <div className="flex">
                            <span 
                              className="text-[9px] px-1.5 py-0.5 rounded border" 
                              style={{ 
                                fontFamily: FONTS.mono,
                                color: log.tag === '기능추가' ? '#00d4ff' : 
                                       log.tag === '버그수정' ? '#ff4466' : 
                                       log.tag === '배포' ? '#00ff88' : 
                                       log.tag === '기획' ? '#ffb300' : '#4a6080',
                                borderColor: log.tag === '기능추가' ? '#00d4ff44' : 
                                            log.tag === '버그수정' ? '#ff446644' : 
                                            log.tag === '배포' ? '#00ff8844' : 
                                            log.tag === '기획' ? '#ffb30044' : '#4a608044'
                              }}
                            >
                              {log.tag}
                            </span>
                          </div>
                        )}
                        <div className="text-[13px] leading-relaxed" style={{ color: COLORS.textMid }}>{log.message || log.msg}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
