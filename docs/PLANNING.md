# PHI Lab 홈페이지 개선 기획서

## 개요

PHI Lab(Precision & Provenance Health Informatics Lab, 김효정 교수 연구실) 홈페이지를 현재 WordPress 기반에서 React 기반으로 재구축하는 프로젝트입니다.

- 현재 사이트: https://philabcuk.org/
- 신규 레포지토리: https://github.com/guboc11/phi-lab-homepage

---

## 현황 분석

기존 사이트는 WordPress로 운영 중이며 전반적인 기능은 동작하나, 아래와 같은 구조적 문제가 확인됩니다.

---

## 문제점

### 1. URL 구조 혼란
메뉴 이름과 실제 URL이 일치하지 않음 (예: "Current Research" → `/contact/`). 직관성이 없어 SEO와 링크 공유에 불리함.

### 2. Publications 페이지 — 단순 텍스트 나열
2008년부터 2026년까지 논문이 필터나 검색 없이 단순 텍스트로 나열됨. 논문 수가 많아질수록 탐색이 어려워짐.

### 3. Members 페이지 — 프로필 빈약
사진 없음, 이름 + 관심사 한 줄이 전부. 외부에서 연구실 구성원을 파악하기 어려운 구조.

### 4. WordPress 플랫폼 한계
콘텐츠 업데이트가 관리자만 가능하며, 디자인 및 기능 커스터마이징에 제약이 있음. 대학원생이 직접 업데이트하기 어려운 구조.

### 5. 한국어 단일 언어
국제 협력 및 해외 학회 활동이 많은 연구실임에도 영문 버전이 없어 외부 노출 기회가 제한됨.

### 6. 연구실 소식 공간 없음
수상, 학회 발표, 신규 멤버 합류 등을 게시할 별도 공간이 없음.

---

## 개선 방향

### 1. URL 구조 정리
메뉴명과 URL을 일치시킴 (`/research`, `/members`, `/publications`, `/about` 등).

### 2. Publications — 인터랙티브 필터
- 연도 / 논문 타입(저널·학회) 필터
- 키워드 검색
- DOI 링크 및 BibTeX 복사 기능

### 3. Members — 카드형 프로필
- 사진 + 이름 + 학년/직책 + 관심 분야 + 이메일 카드
- 현재 멤버 / 졸업생 탭 분리

### 4. JSON 기반 콘텐츠 관리
`src/data/` 디렉토리에 JSON 파일로 데이터 분리 → 대학원생도 GitHub PR로 직접 업데이트 가능.

### 5. 한/영 이중언어 지원
처음부터 `react-i18next` 기반으로 설계해 한국어/영어 전환 지원.

### 6. News/Notice 섹션 추가
학회 발표, 수상, 모집 공지 등을 타임라인 형태로 게시.

---

## 기술 스택

| 항목 | 선택 |
|------|------|
| 프레임워크 | React + TypeScript |
| 빌드 도구 | Vite |
| 스타일링 | Tailwind CSS |
| UI 컴포넌트 | shadcn/ui |
| 다국어 | react-i18next |
| 데이터 관리 | JSON 파일 (src/data/) |
| 배포 | Vercel (GitHub 자동 배포) |

---

## 4주 개발 로드맵

| 주차 | 작업 내용 |
|------|-----------|
| 1주차 | 기반 레이아웃 + 라우팅 구성, Home 페이지, Members 페이지 |
| 2주차 | Publications 페이지 (필터 로직 포함), Research 페이지 |
| 3주차 | About 페이지, Lectures 페이지, News 섹션 |
| 4주차 | 반응형 대응, SEO 최적화, 커스텀 도메인 연결 |

---

## 페이지 구조 (안)

| 메뉴 | 경로 | 내용 |
|------|------|------|
| Home | `/` | 연구실 소개 + 최근 논문/뉴스 |
| About | `/about` | 교수 소개 + 연구실 소개 통합 |
| Research | `/research` | 현재 진행 중인 연구 프로젝트 |
| Members | `/members` | 카드형 구성원 프로필 |
| Publications | `/publications` | 필터+검색 가능한 논문 목록 |
| Lectures | `/lectures` | 학기별 강의 목록 |
| News | `/news` | 수상·학회·공지 타임라인 |
