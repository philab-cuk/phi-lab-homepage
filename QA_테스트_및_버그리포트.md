# PHI Lab 홈페이지 — QA 테스트 가이드 & 버그 리포트

**작성일**: 2026-06-25
**대상**: 개발 담당자
**작성**: PI 검수 (Hyo Jung Kim)
**저장소**: `guboc11/phi-lab-homepage` · 검수 환경: 로컬(`pnpm dev`) + 운영 Supabase 연결

---

## 0. 이 문서의 목적

전달해주신 코드를 PC에 받아 직접 실행·검수했습니다. 이 문서는 두 가지를 담습니다.

1. **발견된 버그**와 그 원인 — 일부는 검수 중 직접 수정해 두었습니다(아래 "수정 완료" 표시).
2. **앞으로 이렇게 테스트해 달라**는 **QA 체크리스트** — 배포 전 매번 돌려볼 수 있는 형태입니다.

> 수정한 파일: `app/lib/publicData.js`, `app/pages/Professor.jsx`, `app/pages/Members.jsx`,
> `app/pages/admin/AdminMembers.jsx`, `app/components/Layout.jsx`. 변경 요약은 §4·부록 참고.

---

## 1. 한눈에 보는 결과

| # | 이슈 | 심각도 | 상태 |
|:-:|------|:------:|------|
| 1 | 역할(role) 값 영/한 불일치 → **Professor 페이지 크래시** | 🔴 높음 | ✅ 수정함 |
| 2 | 같은 원인 → **Members 분류 오류**(PI가 학부연구생으로, 모든 멤버가 한 그룹) | 🔴 높음 | ✅ 수정함 |
| 3 | 공개 페이지 **빈 데이터(null) 방어 부족** | 🟠 중간 | ✅ Professor만 수정 / 전수 점검 권장 |
| 4 | 헤더 랩 이름 **한글 하드코딩** | 🟡 낮음 | ✅ 수정함(정식 영문 명칭) |
| 5 | Supabase 미설정 시 **stub 클라이언트가 깨짐** → 백엔드 없이 미리보기 불가 | 🟠 중간 | ⬜ 권장 |
| 6 | **빌드(prerender)가 빈 테이블에서 전체 실패** | 🟠 중간 | ⬜ 권장 |
| 7 | **Lint 35건**(에러 32) | 🟡 낮음 | ⬜ 권장 |

---

## 2. 잘 된 점 (먼저)

- 공개(SSG) / 관리자(CSR) **렌더링 분리**, RLS·역할 가드 라우팅 등 **구조 설계가 합리적**입니다.
- 디자인은 **단일 브랜드 블루 + 절제된 에디토리얼 스타일**로 완성도가 높고, 모바일 드로어 등 반응형도 구현돼 있습니다.
- README의 **운영 세팅 가이드가 상세**해서 따라가기 좋았습니다.

아래 지적은 위 토대 위에서 다듬을 부분입니다.

---

## 3. 발견된 버그 (상세)

### 🔴 버그 1 — 역할 값 영/한 불일치로 Professor 페이지 크래시 *(수정 완료)*

**증상**
`/professor` 접속 시 흰 화면 + 에러:

```
TypeError: Cannot read properties of null (reading 'experience')
    at Professor (app/pages/Professor.jsx)
```

**재현 절차**
1. 멤버 1명을 역할 `Principal Investigator`(시드 기본값)로 등록.
2. 공개 페이지 `/professor` 접속 → 크래시.

**근본 원인**
`member_roles` 테이블은 **영문 라벨**(`Principal Investigator`, `Undergraduate Researcher`)로 시드되어 있는데,
공개 코드는 **한글 문자열 `지도교수`** 로 PI를 찾습니다.

```js
// app/lib/publicData.js (원본)
list.find((m) => m.role === '지도교수')   // 영문 'Principal Investigator' 와 매칭 실패 → null
```

PI를 못 찾아 `fetchProfessor()`가 `null`을 반환 → `Professor.jsx`가 `PI.experience`를 읽다가 크래시.

**수정 내용**
- `fetchProfessor()`를 **`member_roles` 순서 기반**으로 변경: sort_order가 가장 앞선 역할을 PI로 간주(`piRole`).
  과거 한글 값(`지도교수`)과 `id='hkim'`도 폴백으로 유지.
- `Professor.jsx`에 **null 가드** 추가 — PI가 없어도 크래시 대신 안내 문구 표시.

---

### 🔴 버그 2 — Members 분류 오류 *(수정 완료)*

**증상**
- 교수(PI)가 **"학부연구생"** 칸에 표시됨.
- 석사/박사/연구원 등 역할과 무관하게 **모든 현재 멤버가 "학부연구생" 한 그룹**으로 묶임.

**근본 원인** (버그 1과 동일 뿌리)
`Members.jsx`가 분류를 **두 갈래로 하드코딩**:

```js
// 원본
const professor = data.current.find((m) => m.role === '지도교수')  // 한글 → 매칭 실패
const students  = data.current.filter((m) => m.role !== '지도교수') // = 사실상 전원
// ...
<h2>학부연구생</h2>   // 비-PI는 무조건 이 제목
```

→ 영문 역할은 `지도교수`가 아니므로 PI조차 "학부연구생"으로 떨어지고, 역할별 구분이 사라짐.

**요청 동작 (요구사항)**
공개 Members 페이지는 멤버를 **각자 본인 역할별 카테고리로 분류해서** 보여줘야 합니다.
즉 PI(지도교수)뿐 아니라 **박사과정 / 석박통합과정 / 석사과정 / 학부연구생 등 `member_roles`에
정의된 모든 역할이 각각 별도 섹션**으로 나오고, 그 순서는 `Member Roles`에서 정한 sort_order를
따라야 합니다. (현재처럼 비-PI 전원을 "학부연구생" 한 칸에 몰아넣으면 안 됨)

**수정 내용**
`fetchMembers()`가 `roleOrder`(member_roles 순서)와 `piRole`을 함께 반환하도록 하고,
`Members.jsx`는 이를 받아 **역할 목록 순서대로 동적 그룹핑**:
PI는 별도 섹션(역할 라벨이 제목), 나머지는 **각 역할(박사과정/석사과정/학부연구생 등)마다 별도 섹션**,
역할 미지정자는 "Members" 섹션. 각 섹션 제목이 곧 해당 멤버들의 역할이 됩니다.
관리자 `AdminMembers.jsx`의 "PI는 목록에서 숨김" 필터도 `roleOptions[0]`(=PI) 기준으로 정렬.

> **데이터 이관 관련**: 멤버/논문 등은 손입력 대신 `data/*.json`(현재 홈페이지에서 추출됨)을
> `scripts/seed-content.mjs`로 일괄 입력하고, `scripts/seed-roles-and-names.mjs`로 역할을
> 한글 8종(지도교수·박사과정·석박통합과정·석사과정·…·학부연구생)으로 정렬합니다. 이 시드를 돌리면
> 위 역할별 분류가 자동으로 채워집니다.

> **설계 제언**: PI를 "역할 목록 맨 앞"으로 식별하는 방식은 동작하지만 암묵적입니다.
> 더 명시적으로는 `member_roles`에 `is_pi`(boolean) 같은 **플래그 컬럼**을 두거나,
> 역할을 코드(`pi`, `phd`, `ms`, `ug`)와 표시 라벨로 **분리**하면 화면 로직이 표기 언어에
> 의존하지 않게 됩니다. (영문/한글 전환에도 안전)

---

### 🟠 버그 3 — 공개 페이지 빈 데이터(null) 방어 부족

`Professor.jsx`처럼 **단일 레코드를 전제**하는 페이지가 레코드 부재 시 그대로 크래시합니다.
Professor는 가드를 넣었지만, **다른 단일/옵셔널 데이터 지점도 전수 점검**을 권장합니다.
원칙: 로더 결과가 `null`/빈 배열일 수 있다고 가정하고 옵셔널 체이닝·기본값·빈 상태 UI를 둘 것.

---

### 🟠 버그 5 — Supabase 미설정 시 stub 클라이언트가 깨짐

`app/lib/supabase.js`는 env가 없을 때 공개 페이지가 죽지 않도록 stub 클라이언트를 두지만,
**체이닝 쿼리에서 깨집니다.**

```js
// 원본 stub
const chain = new Proxy(function chainFn() {}, {
  get: () => chain,
  apply: () => Promise.resolve({ data: null, error: stubError }),
})
// supabase.from('research').select('id', {...}).eq('status','active')
//   → .select(...) 가 Promise 반환 → 이어지는 .eq 가 undefined → TypeError
```

결과적으로 **env 없이는 Home 등 공개 페이지도 500**이 나서, 백엔드 연결 전 디자인 미리보기가 불가합니다.
**권장**: stub을 "어떤 메서드도 체이닝되고, await 하면 `{data:[], error:null, count:0}`을 돌려주는
완전 thenable"로 만들면 백엔드 없이도 빈 상태로 렌더되어 미리보기/온보딩이 쉬워집니다.

---

### 🟠 버그 6 — 빌드(prerender)가 빈 테이블에서 전체 실패

`pnpm build`는 공개 경로를 prerender하는데, **로더가 던지면 그 경로가 500이 되고 빌드 전체가 중단**됩니다.
빈 DB(또는 PI 미등록) 상태에서 `/professor`가 깨지면 빌드가 실패합니다.
**권장**: 로더/페이지에서 빈 데이터를 정상 처리(버그 3 해결과 연동)하여, 콘텐츠가 없어도 빌드가 통과하도록.

---

### 🟡 버그 7 — Lint 35건(에러 32, 경고 3)

```
pnpm lint
```
주요 항목: `react-hooks/set-state-in-effect`(effect 내 setState),
`react-refresh/only-export-components`(컴포넌트 파일에서 상수/함수 동시 export),
설정 파일의 `no-undef: 'process'`(node 전역).
빌드를 막지는 않지만, 설정 파일은 eslint env(node) 지정으로, 나머지는 규칙대로 정리 권장.

---

## 4. 변경한 파일 요약

| 파일 | 변경 |
|------|------|
| `app/lib/publicData.js` | `fetchRoleOrder()` 추가. `fetchMembers()`가 `roleOrder`·`piRole` 반환. `fetchProfessor()` PI 탐색을 역할 순서 기반으로 |
| `app/pages/Professor.jsx` | `PI === null` 가드(크래시 방지 + 안내 문구) |
| `app/pages/Members.jsx` | 하드코딩 2그룹 → 역할 순서대로 **동적 그룹핑** |
| `app/pages/admin/AdminMembers.jsx` | PI 숨김 필터를 `roleOptions[0]` 기준으로 정렬 |
| `app/components/Layout.jsx` | 헤더 한글 랩 이름 → 정식 영문 명칭 + 대학명(타이포 정리) |

> 변경분은 검토 후 커밋해 주세요. 위 §3-5/6/7은 미적용(권장)입니다.

---

## 5. 전체 테스트 플랜 (QA 체크리스트)

배포 전 매번 아래 순서로 확인합니다. ☐ 에 체크하며 진행하세요.

### 5-1. 사전 준비
- ☐ `.env.local`에 `VITE_SUPABASE_URL`·`VITE_SUPABASE_ANON_KEY` 설정
- ☐ `pnpm install` → `pnpm dev` → http://localhost:5173 정상 부팅
- ☐ 브라우저 콘솔(F12)에 빨간 에러 없음

### 5-2. 공개 페이지 (비로그인 상태)
- ☐ **Home**: 히어로·연구 3축·통계(0 표시 정상)·협력기관 렌더
- ☐ **About / Research / Publications / Lectures**: 정상 표시, 깨진 이미지 없음
- ☐ **Professor**: PI 정보 표시(크래시 없음). *PI 미등록 시* 안내 문구가 뜨는지도 확인
- ☐ **Members**:
  - ☐ PI가 **자기 역할 제목**(예: Principal Investigator) 아래에 표시
  - ☐ 나머지 멤버가 **역할별 그룹**으로, `Member Roles`에서 정한 **순서대로** 표시
  - ☐ 역할 미지정 멤버가 엉뚱한 그룹에 섞이지 않음
  - ☐ Current / Alumni 탭 카운트·전환 정상
- ☐ **반응형**: 창을 좁혀 모바일 햄버거(드로어) 열림/닫힘·메뉴 이동 정상

### 5-3. 관리자 로그인
- ☐ `/admin/login` 이메일/비밀번호 로그인 성공
- ☐ (운영) Google 로그인 — Google Cloud 리디렉션 URI / Supabase Provider 설정 확인
- ☐ `admin_users` 미등록 이메일은 편집 메뉴가 제한되는지(권한 가드) 확인
- ☐ 로그아웃 정상

### 5-4. 관리자 — 콘텐츠 CRUD
- ☐ **Members**: 새 멤버 추가(역할은 `Member Roles` 목록에서 선택) → 공개 Members에 즉시 반영
- ☐ **Member Roles**: 역할 추가/순서 변경 → 공개 Members 그룹 순서에 반영
- ☐ **Professor**: PI 약력·경력 편집 → 공개 Professor에 반영
- ☐ **Publications / Research / Institutions**: 추가·수정·삭제 반영
- ☐ **이미지 업로드**: 프로필 사진(jpg/png/webp, 10MB) 업로드·표시(스토리지 권한 포함)

### 5-5. News 테스트
- ☐ `/admin` → **News** → **+ 새 뉴스** → 제목·본문 입력
- ☐ 상태를 **발행(published)** 으로 저장 → 공개 `/news`에 노출
- ☐ 상태 **초안(draft)** 은 공개 `/news`에 **노출되지 않음** 확인
- ☐ 발행 시 `published_at`(날짜)이 자동 기록되는지
- ☐ 뉴스 본문 이미지 업로드/표시, 수정·삭제 반영

### 5-6. Posts(게시판) 테스트
- ☐ `/admin` → **Posts** → **+ 새 글** → 제목·본문 입력
- ☐ **발행** 저장 → 공개 `/posts` 목록·상세(`/posts/:id`) 노출
- ☐ **공지 고정(pinned)** 켠 글이 목록 상단에 Notice로 고정되는지
- ☐ 초안은 비노출, 조회수 증가 동작 확인

### 5-7. 에러/엣지 케이스
- ☐ 빈 테이블(데이터 0건) 상태에서 어떤 공개 페이지도 크래시하지 않음
- ☐ 잘못된 URL(`/없는경로`) → NotFound 페이지 정상
- ☐ 콘솔 경고/에러 점검

### 5-8. 빌드 / 배포 전
- ☐ `pnpm build` 성공(prerender 실패 경로 없음)
- ☐ `pnpm preview`로 빌드 결과 확인
- ☐ 배포 서비스(Render) 환경변수 2개 등록(서비스 role key는 제외)

---

## 부록 — 핵심 원인 한 줄 요약

> **공개 페이지가 PI/역할을 한글 문자열(`지도교수`)로 식별하는데, 실제 데이터(member_roles)는 영문 라벨이라 매칭이 깨졌다.**
> 이 하나가 Professor 크래시와 Members 오분류를 동시에 유발. 표시 언어에 의존하지 않도록 역할을
> **코드+라벨로 분리**하거나 **PI 플래그**를 두는 것을 권장.
