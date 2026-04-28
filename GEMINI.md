# GEMINI.md — nextidealab.app Devlog Dashboard

> 이 파일은 Gemini CLI의 컨텍스트 문서다.
> 모든 코딩 작업은 이 문서의 결정사항을 기준으로 실행한다.
> 기획/아키텍처 변경은 Claude(claude.ai)와 협의 후 이 파일을 업데이트한다.

---

## 0. 프로젝트 개요

**목표:** 기존 nextidealab.app에 `/devlog` 페이지를 추가한다.
개발 중인 SaaS 프로젝트들의 상태, 빌드 로그, 스택, 수익을 한눈에 보여주는 개인 개발 아카이브 대시보드다.

**핵심 원칙:**
- 기존 코드 구조(Clean Architecture)를 그대로 따른다
- 새 라이브러리 추가는 최소화한다
- 디자인은 기존 nextidealab.app의 디자인 시스템을 그대로 적용한다

**공개/비공개 원칙:**
- 누구나 볼 수 있음 (공개): 프로젝트 카드, 진행률, Next Action, 빌드 로그, 스택 현황
- Admin 로그인 후에만 보임 (비공개): 수익 트래커, 목표 MRR, 아이디어 보관함, ADD/EDIT 기능

---

## 1. 기술 스택

| 항목 | 기술 |
|---|---|
| Framework | React (Vite) |
| Language | JavaScript (JSX) |
| Styling | Tailwind CSS + Inline Styles |
| Backend | Firebase Firestore + Firebase Auth |
| 배포 | Vercel |
| 폰트 | Space Mono, Space Grotesk |

---

## 2. 디자인 시스템 (절대 변경하지 말 것)

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

/* 뱃지 패턴 */
LIVE     → bg: #00d4ff, color: #000
BUILDING → border: #ffb300, color: #ffb300
IDEA     → border: #4488ff, color: #4488ff
PAUSED   → border: #4a6080, color: #4a6080
```

---

## 3. Firebase Firestore 스키마

### Collection: `devlog_projects`

```js
{
  id: string,                    // auto-generated
  name: string,                  // "AI 광고 카피 생성기"
  description: string,           // 한 줄 설명
  status: "live" | "building" | "idea" | "paused",
  tags: string[],                // ["AI", "WEB"]
  stack: string[],               // ["Claude API", "Next.js"]
  deployUrl: string | null,      // 배포 URL
  githubUrl: string | null,      // GitHub URL (신규)
  nextAction: string | null,     // "다음 할 것 한 줄" (신규)
  progress: number,              // 진행률 0~100 (신규)
  revenue: number,               // 월 수익 (원)
  revenueHistory: [              // 월별 수익 히스토리 (신규, Admin 전용)
    { month: string, amount: number }
  ],
  targetMRR: number | null,      // 목표 MRR (신규, Admin 전용)
  startedAt: Timestamp,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Collection: `devlog_logs`

```js
{
  id: string,
  projectId: string,
  projectName: string,
  message: string,
  tag: "기능추가" | "버그수정" | "배포" | "기획" | "기타",  // 신규
  status: "live" | "building" | "idea" | "paused",
  loggedAt: Timestamp,
  createdAt: Timestamp
}
```

### Collection: `devlog_ideas`  ← 신규 (Admin 전용)

```js
{
  id: string,
  title: string,               // 아이디어 제목
  description: string,         // 상세 내용
  potential: "high" | "mid" | "low",  // 가능성
  tags: string[],
  createdAt: Timestamp
}
```

---

## 4. 기능 로드맵

### ✅ 완료

| 기능 | 공개 여부 |
|---|---|
| Firestore 실시간 연동 | - |
| 프로젝트 카드 그리드 | ✅ 공개 |
| 빌드 로그 타임라인 | ✅ 공개 |
| 스택 필터 / 상태 필터 | ✅ 공개 |
| Admin Firebase Auth 로그인 | - |
| ADD PROJECT 모달 | 🔒 Admin |
| ADD LOG 모달 | 🔒 Admin |
| Vercel 배포 | - |
| 프로젝트별 Next Action 1줄 | ✅ 공개 |
| GitHub / 문서 링크 | ✅ 공개 |
| 진행률 표시 (progress %) | ✅ 공개 |
| 월별 수익 히스토리 차트 | 🔒 Admin |
| 목표 MRR / 달성률 | 🔒 Admin |

---

### 🔲 우선순위 3 — 로그 & 아이디어 관리

| 기능 | 공개 여부 | 설명 |
|---|---|---|
| 빌드 로그 태그 분류 | ✅ 공개 | 기능추가 / 버그수정 / 배포 / 기획 |
| 아이디어 보관함 | 🔒 Admin | 프로젝트 전 단계 메모 관리 |

---

## 5. 파일 구조

```
src/
├── presentation/
│   └── views/
│       └── DevlogView.jsx      ← 메인 (모든 로직 통합)
└── infrastructure/
    └── FirebaseConfig.js       ← db, auth export
```

> ⚠️ 현재 모든 로직이 DevlogView.jsx에 통합되어 있음.
> 추후 컴포넌트 분리는 기능 구현 완료 후 진행.

---

## 6. 하지 말아야 할 것

- ❌ 기존 컴포넌트/파일 무단 수정 (라우터, Header 제외)
- ❌ 새 npm 패키지 추가 (기존 것으로 해결)
- ❌ TypeScript 변환
- ❌ 디자인 시스템 임의 변경 (컬러, 폰트 등)
- ❌ Firestore 기존 컬렉션 건드리기
- ❌ Admin 전용 데이터(수익, 아이디어)를 비로그인 상태에서 노출

---

## 7. 구현 로그

### 2026-04-28: Firestore 연동 + Admin Auth + ADD 모달 구현
- Firestore 실시간 연동 (onSnapshot)
- Firebase Auth 로그인 (isAdmin 상태 관리)
- ADD PROJECT / ADD LOG 모달 (Admin 전용)
- 우측 상단 숨겨진 ADMIN 버튼 → 로그인 모달
- Vercel 배포 완료

### 2026-04-28: 우선순위 1 작업 완료 및 기능 고도화
- 프로젝트 카드 UI 개선 (Next Action, 링크 이동, Progress Bar 적용)
- ADD PROJECT 모달 필드 추가 및 레이블 가독성 개선
- EDIT PROJECT (수정) 및 VIEW LOG (프로젝트별 로그 팝업) 기능 구현
- 전반적인 UI 텍스트 크기 상향 조정으로 가독성 최적화
- 수익 표시 로직 개선 (₩0 처리 및 K 단위 조건부 적용)
- 하드코딩된 더미 데이터 제거 및 Firestore 실제 데이터 연동 강화
- Firestore 컬렉션 경로 동적 설정 (`artifacts/{VITE_FIREBASE_PROJECT_ID}/...`) 및 환경 변수 참조 수정

### 2026-04-28: 우선순위 2 (수익화 추적) 구현 완료
- 월별 수익 히스토리 SVG 차트 구현 (Admin 전용, 우측 패널)
- 프로젝트별 목표 MRR 설정 및 달성률 표시 기능 추가
- 달성률에 따른 조건부 컬러링 (Green/Amber/Dim) 적용
- 모달 내 수익 관련 필드 한글 레이블 최적화

### 2026-04-28: 랜딩페이지 및 서브 뷰 UI 개선
- HomeView 및 SubViews 전체 텍스트 크기 상향 조정 (DevlogView 기준)
- 프로젝트 카드 및 인사이트 아이템의 가독성 향상 (제목, 본문, 태그 등)
- 인사이트 상세 페이지 본문 폰트 크기 최적화 (17px) 및 줄간격 조정

---

## 8. 세션 시작 / 종료 규칙

### 세션 시작 시
1. 이 GEMINI.md 파일을 반드시 먼저 읽는다
2. 섹션 4 로드맵에서 현재 진행할 작업 위치를 파악한다
3. 작업 시작 전 "어떤 작업을 할 것인지" 한 줄 요약한다
4. DevlogView.jsx 현재 상태를 확인한다

### 세션 종료 시
1. 완료한 기능을 섹션 4 로드맵에서 ✅로 업데이트한다
2. 아래 형식으로 devlog에 로그를 기록한다:

```
오늘 작업 완료. devlog에 로그 남겨줘.
프로젝트: nextidealab.app
메시지: [오늘 한 작업 한 줄 요약]
상태: building
태그: 기능추가
```

3. GEMINI.md 섹션 7 구현 로그에 날짜와 작업 내용을 추가한다

---

## 9. 막히면 Claude에게 가져올 것

- 컴포넌트 구조 변경이 필요할 때
- Firebase 보안 규칙(Security Rules) 설정
- 새 기능 기획 및 우선순위 결정
- 디자인 방향 결정
- 에러가 2번 이상 반복될 때

---

*Last updated: 2026-04-28 | Architect: Claude (claude.ai) | Builder: Gemini CLI*