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

### 2026-04-28: 데이터 동적 연동 및 Admin 기능 구현 (Firestore + Auth)
- **Firestore 실시간 연동**: `devlog_projects`, `devlog_logs` 컬렉션을 `onSnapshot`으로 연결하여 데이터 변경 시 즉시 반영되도록 구현.
- **Admin 인증 시스템 도입**:
  - Firebase Auth(`signInWithEmailAndPassword`)를 통한 관리자 로그인 기능 구현.
  - `onAuthStateChanged`를 사용하여 실시간 권한 감지 및 UI 제어 (isAdmin 상태).
  - 우측 상단에 숨겨진 `ADMIN` 트리거 버튼 및 전용 로그인 모달 추가.
- **Admin 입력 폼 구현**: 권한이 있는 경우에만 프로젝트 및 로그를 추가할 수 있는 모달 시스템 구축.
  - 프로젝트: 이름, 설명, 상태, 태그, 스택, URL, 수익 필드 지원.
  - 로그: 프로젝트 선택 및 메시지 입력 지원.
- **데이터 시딩 스크립트 보완**: `seedDevlog.js`에서 `.env.local` 지원 및 환경 변수 파싱 로직 강화.
- **UI 로직 고도화**: 
  - 로딩 및 빈 상태(Empty State) 대응 UI 추가.
  - 수익(Revenue) 트래커 실시간 합산 로직 적용.
  - 스택 필터링 기능 강화 (Firestore 데이터 기반 자동 추출).

---

## 4. 향후 작업 계획 (Step 2-3)

### Step 2 — 컴포넌트 모듈화 (진행 예정)
- `DevlogView.jsx` 내부의 대형 코드를 `src/presentation/components/devlog/` 하위의 독립 컴포넌트로 분리.

### Step 3 — 삭제 및 수정 기능 추가
- Admin 모달에 기존 프로젝트/로그 수정 및 삭제 기능 보완.
- Firestore Security Rules 강화 (Auth 기반 쓰기 권한 제한).

---

*Last updated: 2026-04-26 | Architect: Claude (claude.ai) | Builder: Gemini CLI*
