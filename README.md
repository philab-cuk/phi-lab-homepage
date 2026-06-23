<p align="center">
  <img src="public/logo.jpg" alt="PHI Lab — Precision & Provenance Health Informatics Lab, Catholic University of Korea" width="240" />
</p>

# PHI Lab Homepage

**Precision & Provenance Health Informatics Lab (PHI Lab, φ)**
The Catholic University of Korea — Department of Biomedical Software Engineering
PI: Prof. Hyo Jung Kim · hyojung.kim@catholic.ac.kr

React 기반 연구실 홈페이지. 기존 WordPress 사이트(https://philabcuk.org)를 대체하는 정적 사이트 + 관리자 대시보드.

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프론트엔드 | React 19 + Vite 8 + Tailwind CSS v4 |
| 라우팅 | React Router v7 (framework 모드, SSG prerender) |
| 데이터베이스 | Supabase (PostgreSQL + Auth + Storage) |
| 인증 | Supabase Auth (Google OAuth + 이메일/비밀번호) |
| 배포 | Render (정적 사이트) |

---

## 로컬 개발 (빠른 시작)

```bash
corepack enable          # pnpm 활성화 (최초 1회)
pnpm install
pnpm dev                 # http://localhost:5173
```

> 로컬 개발 시 `.env.local` 파일이 필요합니다. 아래 "환경변수 설정" 항목을 참고하세요.

---

## 운영 환경 세팅 가이드

처음부터 배포 환경을 구축하는 전체 과정입니다. 순서대로 진행하세요.

### 1단계. Supabase 프로젝트 생성

1. https://supabase.com 에 접속해서 회원가입/로그인합니다.
2. **New Project** 를 클릭합니다.
3. 아래 항목을 입력합니다:
   - **Organization**: 기존 조직을 선택하거나 새로 만듭니다.
   - **Project name**: `phi-lab-homepage` (원하는 이름)
   - **Database Password**: 안전한 비밀번호를 입력하고 **반드시 따로 저장**해 둡니다.
   - **Region**: `Northeast Asia (Seoul)` 선택
4. **Create new project** 를 클릭하고 프로젝트 생성이 완료될 때까지 기다립니다 (1~2분).

프로젝트가 만들어지면 **Settings → API** 페이지에서 다음 두 값을 복사해 둡니다:
- **Project URL** (예: `https://xyzxyz.supabase.co`)
- **anon / public** 키 (`eyJ...`로 시작하는 긴 문자열)

---

### 2단계. 데이터베이스 스키마 설정 (마이그레이션)

Supabase 대시보드의 **SQL Editor** 에서 마이그레이션 파일을 **순서대로** 실행합니다.

> 각 파일을 열어서 내용을 전체 복사 → SQL Editor에 붙여넣기 → **Run** 클릭

| 순서 | 파일 | 설명 |
|:----:|------|------|
| 1 | `supabase/migrations/20260521072910_initial_schema.sql` | 전체 테이블, RLS 정책, Storage 버킷 생성 |
| 2 | `supabase/migrations/20260521080000_advisor_followups.sql` | 교수 정보 보완 |
| 3 | `supabase/migrations/20260528025050_public_read_for_anon.sql` | 비로그인 사용자 읽기 허용 |
| 4 | `supabase/migrations/20260528153750_members_self_edit.sql` | 멤버 자기 정보 수정 허용 |
| 5 | `supabase/migrations/20260528160000_members_joined_at.sql` | 멤버 가입일 칼럼 |
| 6 | `supabase/migrations/20260528170000_member_roles.sql` | 멤버 역할 테이블 |
| 7 | `supabase/migrations/20260528180000_lecture_images_bucket.sql` | 강의 이미지 저장소 |
| 8 | `supabase/migrations/20260528190000_institutions_logo.sql` | 기관 로고 칼럼 |
| 9 | `supabase/migrations/20260528191000_page_images_allow_svg.sql` | SVG 이미지 허용 |
| 10 | `supabase/migrations/20260611100000_news_public_read_published.sql` | 뉴스 공개 읽기 |
| 11 | `supabase/migrations/20260618100000_news_body_json.sql` | 뉴스 본문 JSON 형식 |
| 12 | `supabase/migrations/20260618130000_posts_board.sql` | 게시판 기능 (조회수, 공지 고정 등) |
| 13 | `supabase/migrations/20260618140000_members_college.sql` | 멤버 대학 칼럼 |

모든 파일을 실행한 뒤 **Table Editor** 에서 테이블들이 생성되었는지 확인합니다:
`admin_users`, `members`, `publications`, `research`, `lectures`, `news`, `posts` 등이 보이면 성공입니다.

---

### 3단계. Google OAuth 설정

관리자 로그인에 Google 계정을 사용합니다. 두 곳에서 설정이 필요합니다.

#### 3-1. Google Cloud Console 설정

1. https://console.cloud.google.com 에 접속합니다.
2. 프로젝트가 없으면 새 프로젝트를 만듭니다 (예: `phi-lab-homepage`).
3. 좌측 메뉴 → **API 및 서비스** → **OAuth 동의 화면**
   - **User Type**: `외부` 선택 → 만들기
   - **앱 이름**: `PHI Lab Homepage`
   - **사용자 지원 이메일**: 본인 이메일
   - **개발자 연락처 정보**: 본인 이메일
   - 나머지는 기본값으로 두고 저장
4. 좌측 메뉴 → **API 및 서비스** → **사용자 인증 정보**
   - **+ 사용자 인증 정보 만들기** → **OAuth 클라이언트 ID**
   - **애플리케이션 유형**: `웹 애플리케이션`
   - **이름**: `PHI Lab Supabase Auth`
   - **승인된 리디렉션 URI 추가**:
     ```
     https://<프로젝트ID>.supabase.co/auth/v1/callback
     ```
     (`<프로젝트ID>` 부분은 Supabase 대시보드 Settings → API 의 Project URL에서 확인)
   - **만들기** 클릭
5. 생성 완료 화면에서 **클라이언트 ID** 와 **클라이언트 보안 비밀번호** 를 복사합니다.

#### 3-2. Supabase Auth에 Google 연결

1. Supabase 대시보드 → **Authentication** → **Providers**
2. **Google** 항목을 찾아 토글을 켭니다.
3. 아래 값을 입력합니다:
   - **Client ID**: Google에서 복사한 클라이언트 ID
   - **Client Secret**: Google에서 복사한 클라이언트 보안 비밀번호
4. **Save** 클릭

---

### 4단계. 최초 관리자 계정 등록

Google 로그인이 되더라도 `admin_users` 테이블에 등록되지 않은 이메일은 관리자 기능을 사용할 수 없습니다.

Supabase 대시보드 → **Table Editor** → `admin_users` 테이블에서 **Insert row** 로 첫 관리자를 추가합니다:

| 칼럼 | 값 | 설명 |
|------|-----|------|
| `email` | `hyojung.kim@catholic.ac.kr` | Google 로그인에 사용할 이메일 |
| `role` | `professor` | `admin`, `professor`, `researcher`, `alumni` 중 선택 |
| `display_name` | `김효정` | 화면에 표시될 이름 |

- `admin`과 `professor` 역할만 콘텐츠 편집(멤버, 논문, 연구, 뉴스 등) 권한이 있습니다.
- 이후 관리자 추가는 대시보드 관리 화면의 **초대 기능**으로도 가능합니다.

---

### 5단계. 환경변수 설정

#### 로컬 개발용 (`.env.local`)

프로젝트 루트에 `.env.local` 파일을 만들고 아래 내용을 입력합니다:

```env
VITE_SUPABASE_URL=https://<프로젝트ID>.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...    # Settings → API 에서 복사한 anon key

# 아래는 시드 스크립트 실행 시에만 필요 (운영 배포에는 불필요)
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Settings → API 에서 복사한 service_role key (외부 노출 금지)
```

> `.env.local` 은 `.gitignore`에 포함되어 있어 git에 올라가지 않습니다.

#### 배포 서비스 환경변수

배포 서비스(Render 등)의 환경변수 설정에 아래 두 개를 등록합니다:

| 변수명 | 값 |
|--------|-----|
| `VITE_SUPABASE_URL` | `https://<프로젝트ID>.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key |

> `SUPABASE_SERVICE_ROLE_KEY`는 배포 서비스에 등록하지 않습니다. 이 키는 DB 전체 접근 권한이 있어서 외부에 노출되면 안 됩니다.

---

### 6단계. 배포 (Render)

1. https://render.com 에 접속해서 회원가입/로그인합니다.
2. **New** → **Static Site** 를 선택합니다.
3. GitHub 저장소를 연결합니다 (`phi-lab-homepage` 저장소 선택).
4. 아래 항목을 설정합니다:

| 항목 | 값 |
|------|-----|
| **Build Command** | `pnpm install && pnpm build` |
| **Publish Directory** | `build/client` |

5. **Environment** 탭에서 5단계의 환경변수 두 개를 등록합니다.
6. **Create Static Site** 클릭 → 빌드가 완료되면 배포 URL이 생성됩니다.

배포 후에는 main 브랜치에 push할 때마다 자동으로 재배포됩니다.

#### 커스텀 도메인 연결 (선택)

Render 대시보드 → 해당 사이트 → **Settings** → **Custom Domains** 에서 도메인을 추가할 수 있습니다.
커스텀 도메인을 사용하면 `VITE_BASE` 환경변수를 생략하거나 `/`로 설정합니다.

도메인을 변경한 경우 Google Cloud Console의 **승인된 리디렉션 URI**도 함께 확인하세요.

---

### 7단계. 초기 데이터 입력

스키마(테이블 구조)만 만들어진 상태이므로, 실제 콘텐츠를 넣어야 합니다.

#### 방법 A: 관리자 대시보드에서 직접 입력

배포된 사이트의 `/admin` 경로로 접속 → Google 로그인 → 각 메뉴에서 데이터를 입력합니다.
멤버, 논문, 연구, 강의 등을 하나씩 추가할 수 있습니다.

#### 방법 B: 시드 스크립트로 일괄 입력 (개발 환경 필요)

`data/` 폴더에 초기 데이터가 JSON 파일로 준비되어 있습니다:
- `professor.json` — 교수님 프로필, 약력, 학력, 경력
- `members.json` — 연구실 멤버 (학생, 연구원)
- `lectures.json` — 강의 목록
- `publications.json` — 논문 목록
- `research.json` — 연구 프로젝트

개발 환경(Node.js + pnpm)이 갖춰져 있다면:

```bash
pnpm install                           # 의존성 설치 (최초 1회)

# .env.local에 운영 Supabase URL과 SERVICE_ROLE_KEY가 설정된 상태에서
node scripts/seed-content.mjs          # 교수·멤버·강의·논문·연구 일괄 입력
node scripts/seed-roles-and-names.mjs  # 역할 한글화 + 멤버 이름 정리
```

> `seed-content.mjs`는 `data/` 폴더의 JSON을 읽어서 DB에 넣는 스크립트입니다. 여러 번 실행해도 안전합니다 (upsert).
> `seed-bulk.mjs`, `seed-test-*.mjs` 는 테스트용이므로 운영에 실행하지 마세요.

---

### 8단계. 배포 후 확인

배포가 완료되면 아래를 확인합니다:

- [ ] 공개 페이지 (Home, About, Members, Professor, Research, Publications, Lectures) 정상 표시
- [ ] `/admin` 접속 → Google 로그인 성공
- [ ] 로그인 후 관리자 대시보드 메뉴 정상 표시
- [ ] 뉴스/게시판 글 작성, 수정, 삭제 동작
- [ ] 멤버 정보 수정 동작
- [ ] 이미지 업로드 동작 (프로필 사진, 뉴스 이미지 등)
- [ ] 브라우저 개발자 도구(F12) 콘솔에 에러 없음

---

## 프로젝트 구조

```
app/
  contexts/          # AuthContext (인증 상태 관리)
  lib/               # Supabase 클라이언트, 데이터 조회 함수
  pages/             # 공개 페이지 (Home, Members, Professor 등)
  admin/             # 관리자 대시보드 페이지
  components/        # 공통 컴포넌트 (Layout, Header 등)
  routes.js          # 라우트 정의

supabase/
  migrations/        # DB 스키마 마이그레이션 SQL 파일 (순서대로 실행)

scripts/
  seed-content.mjs   # 초기 데이터 일괄 입력 스크립트
  seed-roles-and-names.mjs  # 역할·이름 시드

data/                # 초기 데이터 (JSON)
  professor.json     # 교수님 프로필·약력
  members.json       # 연구실 멤버 (학생, 연구원)
  lectures.json      # 강의 목록
  publications.json  # 논문 목록
  research.json      # 연구 프로젝트

docs/                # 기획·설계 문서
```

## 환경변수 요약

| 변수 | 용도 | 필요한 곳 |
|------|------|-----------|
| `VITE_SUPABASE_URL` | Supabase 프로젝트 URL | `.env.local` + 배포 서비스 |
| `VITE_SUPABASE_ANON_KEY` | Supabase 공개 키 | `.env.local` + 배포 서비스 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 관리자 키 (시드 스크립트용) | `.env.local`만 (배포 서비스에 등록 금지) |
| `VITE_BASE` | 사이트 기본 경로 | 커스텀 도메인이면 생략 가능 |

## 주요 명령어

```bash
pnpm dev          # 개발 서버 실행
pnpm build        # 빌드 (build/client 에 출력)
pnpm preview      # 빌드 결과 미리보기
```
