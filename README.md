# TMS (Test Management System)

Vibe Coding 스타일로 구축된, **Next.js 14** 기반의 자체 테스트 관리 시스템입니다.
TestRail 없이도 테스트 케이스를 체계적으로 관리하고, 실행 결과를 추적할 수 있습니다.

## 🚀 주요 기능

- **프로젝트 관리**: 여러 프로젝트를 생성하고 독립적으로 관리할 수 있습니다.
- **테스트 케이스 관리 (CMS)**:
  - Suite(폴더) 구조로 케이스 정리
  - 테스트 단계(Steps), 기대 결과, 중요도 설정
- **Excel/CSV Import & Export**:
  - 기존 테스트 케이스를 엑셀로 일괄 업로드 (Import)
  - 작성된 케이스를 엑셀 파일로 백업/공유 (Export)
- **테스트 실행 (Test Runner)**:
  - Test Run을 생성하여 회차별 테스트 수행
  - Pass/Fail/Skip 결과 기록 및 진행률(Progress) 시각화
- **반응형 UI**: Tailwind CSS & Shadcn UI 기반의 깔끔한 다크/라이트 모드 지원

## 🛠 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Database**: SQLite (Prisma ORM)
- **Styling**: Tailwind CSS v3, Shadcn UI
- **Language**: TypeScript

## 🏁 시작하기

### 1. 설치

```bash
git clone https://github.com/julimqa/TMS.git
cd TMS/tms
npm install
```

### 2. 데이터베이스 설정

로컬 SQLite 데이터베이스를 초기화합니다.

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 3. 실행

개발 서버를 실행합니다.

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 으로 접속하세요.

## 📂 엑셀 Import 가이드

`Import` 기능을 사용할 때, 엑셀(.xlsx) 파일의 첫 번째 줄(헤더)은 아래 형식을 권장합니다.

| Title | Description | Priority | Steps |
|-------|-------------|----------|-------|
| 로그인 테스트 | 로그인 기능 검증 | High | [{"step":"ID 입력","expected":"입력됨"}] |
| ... | ... | ... | ... |

- **Title**: 필수 입력
- **Priority**: High, Medium, Low 중 하나
- **Steps**: JSON 문자열 또는 일반 텍스트

## 📝 라이선스

MIT License
