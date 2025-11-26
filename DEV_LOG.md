# Development Log & Project Documentation

이 문서는 **TMS (Test Management System)** 프로젝트의 개발 과정, 아키텍처 설계, 문제 해결 과정을 기록한 문서입니다. 
다른 IDE나 LLM에서 프로젝트 컨텍스트를 빠르게 파악하는 데 사용할 수 있습니다.

---

## 1. 프로젝트 개요 (Overview)

- **목표**: TestRail을 대체할 수 있는 자체 구축형 테스트 케이스 관리 시스템 개발.
- **핵심 컨셉**: Vibe Coding (AI 기반 테스트 생성 -> 추후 제거됨), Excel Import/Export 중심의 대량 관리, RBAC 권한 시스템.
- **GitHub Repository**: `https://github.com/koesnuj/TMS`

### 기술 스택 (Tech Stack)
- **Framework**: Next.js 14.2.16 (App Router) - *안정성을 위해 14 LTS 사용*
- **Database**: SQLite (Local)
- **ORM**: Prisma 5.12.0
- **Auth**: JWT (jose), Bcrypt (hashing), Custom Server Actions
- **UI**: Tailwind CSS v3, Shadcn UI, Lucide React
- **Excel**: xlsx (SheetJS)

---

## 2. 데이터베이스 스키마 (Database Schema)

`prisma/schema.prisma`의 핵심 모델 구조입니다.

```prisma
// 사용자 및 권한 관리
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String?
  role      String   @default("GUEST") // ADMIN, QA, GUEST
  status    String   @default("PENDING") // PENDING, ACTIVE, REJECTED
  // ... timestamps
}

// 프로젝트 구조
model Project {
  id          String      @id @default(cuid())
  name        String
  suites      TestSuite[]
  testRuns    TestRun[]
  // ...
}

model TestSuite { // 폴더/카테고리
  id        String     @id @default(cuid())
  title     String
  projectId String
  testCases TestCase[]
  // ...
}

model TestCase { // 개별 테스트 케이스
  id          String       @id @default(cuid())
  title       String
  steps       String       // JSON string: [{ step, expected }]
  priority    String       // High, Medium, Low
  suiteId     String
  // ...
}

// 실행 및 결과
model TestRun {
  id        String       @id @default(cuid())
  title     String
  status    String       // In Progress, Completed
  results   TestResult[]
  // ...
}

model TestResult {
  id         String   @id @default(cuid())
  status     String   // Pass, Fail, Skipped
  comment    String?
  testRunId  String
  testCaseId String
  // ...
}
```

---

## 3. 구현 상세 (Implementation Details)

### A. 인증 및 권한 (Auth & RBAC)
- **JWT 기반 세션**: `src/lib/auth.ts`에서 `jose` 라이브러리로 토큰 생성(`encrypt`) 및 검증(`decrypt`).
- **미들웨어 보호**: `middleware.ts`에서 모든 경로를 인터셉트하여 로그인 여부 확인.
- **Role 정의**:
  - `ADMIN`: 모든 권한, 사용자 승인/관리 페이지 접근 가능.
  - `QA`: 프로젝트/케이스 CRUD, 테스트 실행, Import/Export.
  - `GUEST`: 조회(Read-only), Export 가능 (Import 불가).
- **회원가입 프로세스**: 가입 시 `PENDING` 상태 -> 관리자가 승인해야 로그인 가능. (단, 첫 가입자는 자동 ADMIN/ACTIVE)

### B. 테스트 관리 (CMS)
- **구조**: Project -> Suite (Folder) -> Case 계층 구조.
- **Server Actions**: `src/app/actions.ts`에 모든 DB 조작 로직 집중.
- **UI**: Shadcn UI의 Dialog, Table, Card 등을 활용한 모던한 인터페이스.

### C. Import / Export
- **라이브러리**: `xlsx` (SheetJS) 사용.
- **Export**: 현재 Suite의 케이스를 JSON -> Sheet 변환하여 다운로드.
- **Import**: 엑셀 파일을 파싱하여 `importTestCases` Server Action을 통해 DB에 일괄 `create`. (권한 체크 필수)

---

## 4. 문제 해결 (Troubleshooting)

### Issue 1: Next.js 16 & Prisma 7 호환성 문제
- **증상**: `Turbopack` 관련 에러 (`Cannot read properties of undefined`), Prisma Client 로드 실패.
- **원인**: 최신 버전 간의 불안정성.
- **해결**:
  - Next.js: `16.0.4` -> **`14.2.16` (LTS)** 로 다운그레이드.
  - Prisma: `7.0.1` -> **`5.12.0`** 로 다운그레이드.
  - Tailwind: v4 -> **v3** 로 롤백.
  - Font: `Geist` -> `Inter` 로 교체.

### Issue 2: Server Component Event Handler
- **증상**: 관리자 페이지의 `<select onChange={...}>`에서 에러 발생.
- **원인**: Server Component에서 직접 이벤트 핸들러 사용 불가.
- **해결**: `RoleSelector` (`src/components/role-selector.tsx`)라는 **Client Component**를 분리하여 이벤트 처리 위임.

### Issue 3: 관리자 승인 전 로그인 불가
- **증상**: 계정 생성 후 `Invalid credentials` 에러.
- **원인**: 기본 상태가 `PENDING`이라 로그인이 막힘.
- **해결**: 초기 설정을 위해 `reset-password.js` 스크립트를 실행하여 강제로 상태를 `ACTIVE`로 변경하고 비밀번호 초기화.

---

## 5. 주요 디렉토리 구조

```
/
├── prisma/
│   ├── schema.prisma    # DB 스키마
│   └── dev.db           # SQLite 데이터베이스
├── src/
│   ├── app/
│   │   ├── admin/       # 관리자 페이지 (User Management)
│   │   ├── login/       # 로그인
│   │   ├── register/    # 회원가입
│   │   ├── projects/    # 프로젝트 상세 (Cases, Runs)
│   │   ├── actions.ts   # Server Actions (Backend Logic)
│   │   └── page.tsx     # 메인 대시보드
│   ├── components/
│   │   ├── ui/          # Shadcn UI 컴포넌트
│   │   ├── import-export-buttons.tsx # 엑셀 기능
│   │   └── role-selector.tsx         # 권한 변경 UI
│   └── lib/
│       ├── auth.ts      # JWT 및 권한 체크 유틸
│       └── prisma.ts    # Prisma Client 인스턴스
├── middleware.ts        # 인증 미들웨어
└── package.json         # 의존성 관리
```

