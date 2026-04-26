# GEMINI.md — nextidealab.app Devlog Dashboard

> 이 파일은 Gemini CLI의 컨텍스트 문서다.
> 모든 코딩 작업은 이 문서의 결정사항을 기준으로 실행한다.
> 기획/아키텍처 변경은 Claude(claude.ai)와 협의 후 이 파일을 업데이트한다.

---

## 0. 프로젝트 개요

**목표:** 기존 nextidealab.app에 `/devlog` 페이지를 추가한다.
개발 중인 SaaS 프로젝트들의 상태, 빌드 로그, 스택, 수익을 한눈에 보여주는 개인 개발 아카이브 대시보드다.

**원칙:**
- 제공된 HTML 파일(`devlog_nextidealab.html`)의 레이아웃과 디자인을 1:1로 포팅한다.
- 기존 코드 구조(Clean Architecture)를 기반으로 하되, UI는 제공된 명세를 우선한다.
- 디자인 시스템은 기존 nextidealab.app과 제공된 HTML의 조합을 따른다.

---

## 1. 기술 스택

| 항목 | 기술 |
|---|---|
| Framework | React (Vite) |
| Language | JavaScript (JSX) |
| Styling | Tailwind CSS + Inline Styles |
| Backend | Firebase Firestore (연동 예정) |
| 배포 | Vercel |
| 폰트 | Space Mono, Space Grotesk |

---

## 2. 디자인 시스템 (devlog_nextidealab.html 기준)

```css
/* 컬러 팔레트 */
--bg:        #050a14   /* 메인 배경 */
--bg2:       #080f1c   /* 사이드바/패널 배경 */
--bg3:       #0b1525   /* 카드/아이템 hover 배경 */
--card:      #0d1a2d   /* 카드 배경 */
--border:    #112240   /* 기본 border */
--border2:   #1a3060   /* hover border */
--cyan:      #00d4ff   /* 주 액센트 */
--text:      #c8d8f0   /* 본문 텍스트 */
--text-dim:  #4a6080   /* 보조 텍스트 */
--text-mid:  #7a9ab8   /* 중간 텍스트 */
--white:     #e8f4ff   /* 헤딩 */
--green:     #00ff88   /* LIVE 상태 */
--amber:     #ffb300   /* BUILDING 상태 */
--blue:      #4488ff   /* IDEA 상태 */

/* 폰트 */
font-heading: 'Space Grotesk', sans-serif
font-mono:    'Space Mono', monospace   /* 뱃지, 라벨, 날짜, 태그, 스탯 전용 */
```

---

## 3. 구현 로그 및 현재 상태

### 2026-04-26: UI 재구축 및 세부 정교화 (HTML 기반 포팅)
- **UI 포팅 완료**: `devlog_nextidealab.html`의 3단 레이아웃(사이드바 210px, 메인 flex:1, 우측패널 230px)을 React 컴포넌트로 구현.
- **UI 세부 정교화**: 
  - 우측 패널의 레이아웃 고정 및 오버플로우 문제 완벽 해결 (Stack Usage, Revenue Tracker 가독성 개선).
  - 프로젝트 카드 상단 상태 라인 두께를 3px로 강화하여 가시성 확보.
  - 스탯 카드 숫자를 2.8rem으로 확대하여 시각적 강조.
- **기능 구현**: 사이드바 Stack 항목 클릭 시 해당 기술 스택별 프로젝트 필터링 기능 추가 (토글 방식).
- **컴포넌트 단일화**: 현재 `DevlogView.jsx` 파일 내에 모든 서브 UI 로직을 포함하여 시각적 일관성 확보.
- **더미 데이터 적용**: `PROJECTS`, `LOGS` 상수를 통해 하드코딩된 데이터로 우선 렌더링.
- **라우팅 완료**: `App.jsx`에 `/devlog` 경로 및 내비게이션 링크 추가 완료.

---

## 4. 향후 작업 계획 (Step 1-2 재조정)

### Step 1 — 데이터 동적 연동 (Firebase)
- `DevlogRepository.js` 및 `useDevlog.js`를 복구하여 Firestore 데이터를 `DevlogView.jsx`의 하드코딩된 부분과 교체.
- 스키마에 `activity` (활동 내역) 및 `stackUsage` 필드 보완 필요.

### Step 2 — 컴포넌트 모듈화
- `DevlogView.jsx` 내부의 대형 코드를 `src/presentation/components/devlog/` 하위의 독립 컴포넌트로 분리하여 유지보수성 향상.

---

*Last updated: 2026-04-26 | Architect: Claude (claude.ai) | Builder: Gemini CLI*
