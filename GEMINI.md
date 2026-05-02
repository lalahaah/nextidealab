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

| 항목 | 공개 여부 | 비고 |
|---|---|---|
| 프로젝트 카드 + 진행률 | ✅ 공개 | |
| 카드의 Next Action (`→ NEXT ...`) | ✅ 공개 | 빌더 브랜딩 역할 |
| 빌드 로그 타임라인 + 태그 | ✅ 공개 | |
| GitHub / 배포 URL 링크 | ✅ 공개 | |
| BUILD ACTIVITY 캘린더 | ✅ 공개 | |
| STACK USAGE 바 | ✅ 공개 | |
| REVENUE TRACKER | 🔒 Admin | 수익 노출 위험 |
| REVENUE HISTORY 차트 | 🔒 Admin | 수익 노출 위험 |
| 우측 패널 NEXT ACTIONS | 🔒 Admin | 전체 할 일 목록 노출 위험 |
| IDEA VAULT | 🔒 Admin | 미공개 아이디어 보호 |
| MRR 달성률 | 🔒 Admin | 수익 노출 위험 |
| ADD/EDIT/DELETE 기능 | 🔒 Admin | |

---

## 1. 기술 스택

| 항목 | 기술 |
|---|---|
| Framework | React (Vite) |
| Language | JavaScript (JSX) |
| Styling | Tailwind CSS + Inline Styles |
| Backend | Firebase Firestore + Firebase Auth |
| 배포 | Vercel (GitHub 푸시 시 자동 배포) |
| 폰트 | Space Mono, Space Grotesk |

---

## 2. 디자인 시스템 (절대 변경하지 말 것)

```css
--bg:        #050a14
--bg2:       #080f1c
--bg3:       #0b1525
--card:      #0d1a2d
--border:    #112240
--border2:   #1a3060
--cyan:      #00d4ff
--text:      #c8d8f0
--text-dim:  #4a6080
--text-mid:  #7a9ab8
--white:     #e8f4ff
--green:     #00ff88
--amber:     #ffb300
--blue:      #4488ff
--red:       #ff4466

font-heading: 'Space Grotesk', sans-serif
font-mono:    'Space Mono', monospace

/* 뱃지 패턴 */
LIVE     → bg: #00d4ff, color: #000
BUILDING → border: #ffb300, color: #ffb300
IDEA     → border: #4488ff, color: #4488ff
PAUSED   → border: #4a6080, color: #4a6080

/* 로그 태그 색상 */
기능추가 → color: #00d4ff, border: #00d4ff44
버그수정 → color: #ff4466, border: #ff446644
배포     → color: #00ff88, border: #00ff8844
기획     → color: #ffb300, border: #ffb30044
기타     → color: #4a6080, border: #4a608044
```

---

## 3. Firebase Firestore 스키마

### Collection: `devlog_projects`

```js
{
  id: string,
  name: string,
  description: string,
  status: "live" | "building" | "idea" | "paused",
  tags: string[],
  stack: string[],
  deployUrl: string | null,
  githubUrl: string | null,
  nextAction: string | null,     // 카드에 공개 표시
  progress: number,              // 0~100, 수동 입력
  revenue: number,               // 월 수익 (원)
  revenueHistory: [{ month: string, amount: number }],
  targetMRR: number | null,
  startedAt: Timestamp,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Collection: `devlog_logs`

```js
{
  id: string,
  projectId: string,             // Firestore document ID
  projectName: string,           // 비정규화 (조회 편의)
  message: string,
  tag: "기능추가" | "버그수정" | "배포" | "기획" | "기타",
  status: "live" | "building" | "idea" | "paused",
  loggedAt: Timestamp,
  createdAt: Timestamp
}
```

### Collection: `devlog_ideas` (Admin 전용)

```js
{
  id: string,
  title: string,
  description: string,
  potential: "high" | "mid" | "low",
  tags: string[],
  createdAt: Timestamp
}
```

---

## 4. Firebase 보안 규칙

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // 기존 사이트 데이터 — 읽기 공개
    match /artifacts/{appId}/public/data/{collection}/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // devlog 프로젝트 — 읽기 공개
    match /devlog_projects/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // devlog 로그 — 읽기 공개
    match /devlog_logs/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // devlog 아이디어 — Admin 전용
    match /devlog_ideas/{docId} {
      allow read, write: if request.auth != null;
    }

    // 나머지 전체 차단
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 5. 기능 로드맵

### ✅ 완료 (2026-04-28)

| 기능 | 공개 여부 |
|---|---|
| Firestore 실시간 연동 (onSnapshot) | - |
| 프로젝트 카드 그리드 | ✅ 공개 |
| 카드 상태별 컬러 라인 | ✅ 공개 |
| 진행률 progress bar | ✅ 공개 |
| 카드 Next Action 1줄 | ✅ 공개 |
| GitHub / 배포 URL 링크 | ✅ 공개 |
| 빌드 로그 타임라인 | ✅ 공개 |
| 로그 태그 뱃지 (기능추가/버그수정/배포/기획/기타) | ✅ 공개 |
| 스택 필터 / 상태 필터 | ✅ 공개 |
| BUILD ACTIVITY 캘린더 | ✅ 공개 |
| STACK USAGE 바 | ✅ 공개 |
| VIEW LOG 모달 (프로젝트별 로그) | ✅ 공개 |
| Admin Firebase Auth 로그인 (숨겨진 ADMIN 버튼) | - |
| ADD PROJECT 모달 | 🔒 Admin |
| EDIT PROJECT 모달 | 🔒 Admin |
| ADD LOG 모달 | 🔒 Admin |
| 타임라인 로그 수정 / 삭제 | 🔒 Admin |
| VIEW LOG 내 로그 수정 / 삭제 | 🔒 Admin |
| REVENUE TRACKER (실시간 합산) | 🔒 Admin |
| REVENUE HISTORY SVG 라인 차트 | 🔒 Admin |
| 목표 MRR / 달성률 | 🔒 Admin |
| 우측 패널 NEXT ACTIONS | 🔒 Admin |
| IDEA VAULT (추가/삭제) | 🔒 Admin |
| 랜딩페이지 Firebase DB 연동 수정 | - |
| 전체 사이트 텍스트 사이즈 개선 | - |
| Vercel 자동 배포 (GitHub 푸시 연동) | - |

---

## 6. 파일 구조

```
src/
├── presentation/
│   ├── views/
│   │   └── DevlogView.jsx          ← Devlog 메인 (모든 로직 통합)
│   └── components/
│       └── DataItems.jsx           ← 랜딩페이지 카드 컴포넌트
└── infrastructure/
    └── FirebaseConfig.js           ← db, auth export
```

> ⚠️ DevlogView.jsx에 모든 로직 통합되어 있음.

---

## 7. 하지 말아야 할 것

- ❌ 기존 컴포넌트/파일 무단 수정
- ❌ 새 npm 패키지 추가
- ❌ TypeScript 변환
- ❌ 디자인 시스템 임의 변경
- ❌ Firestore 기존 컬렉션 건드리기
- ❌ Admin 전용 데이터를 비로그인 상태에서 노출
- ❌ .env, .env.local 파일 Git 커밋에 포함
- ❌ vercel --prod 직접 실행 (GitHub 푸시로 자동 배포)

---

## 8. 구현 로그

### 2026-05-02: Devlog 타임라인 정렬 수정
- DevlogView.jsx 내 RECENT BUILD LOG 타임라인이 최신순(내림차순)으로 정렬되도록 수정 완료
- loggedAt 필드의 초/밀리초 단위를 모두 고려한 정렬 로직 적용
- 프로젝트 및 인사이트 정렬 로직 점검

오늘 작업 완료. devlog에 로그 남겨줘.
프로젝트: nextidealab.app
메시지: Devlog 빌드 로그 타임라인 최신순 정렬 수정
상태: building
태그: 버그수정

---

## 9. 세션 시작 / 종료 규칙

### 세션 시작 시
1. 이 GEMINI.md 파일을 반드시 먼저 읽는다
2. 섹션 5 로드맵에서 현재 진행할 작업을 파악한다
3. DevlogView.jsx 현재 상태를 확인한다
4. 작업 시작 전 "어떤 작업을 할 것인지" 한 줄 요약한다

### 세션 종료 시
1. 완료한 기능을 섹션 5 로드맵에서 ✅로 업데이트한다
2. 섹션 8 구현 로그에 날짜와 작업 내용을 추가한다
3. 아래 형식으로 devlog에 로그를 기록한다:

```
오늘 작업 완료. devlog에 로그 남겨줘.
프로젝트: nextidealab.app
메시지: [오늘 한 작업 한 줄 요약]
상태: building
태그: 기능추가
```

4. 보안 규칙을 준수하여 GitHub에 커밋 및 푸시한다
   (.env, .env.local 등 환경변수 파일은 절대 포함하지 말 것)

---

## 10. 막히면 Claude에게 가져올 것

- 컴포넌트 구조 변경이 필요할 때
- Firebase 보안 규칙 설정
- 새 기능 기획 및 우선순위 결정
- 디자인 방향 결정
- 에러가 2번 이상 반복될 때

---

*Last updated: 2026-04-28 | Architect: Claude (claude.ai) | Builder: Gemini CLI*