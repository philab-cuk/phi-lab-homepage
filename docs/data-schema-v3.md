# research.json — Schema v3 (2026-05-14)

LIVE 정본 정렬을 위한 entity 스키마 확장. v2 (현행) 에서 누락·창작·구조 손실 문제 해결.

배경: `docs/phi-lab-content/05_research.md` 의 LIVE 정본화 (Task 8) 결과,
- LIVE 는 그리드 18 카드 + Featured 2 단락 구조 (총 표시 표면 20, 고유 프로젝트 19)
- 그리드 카드는 영문 제목 + **한글 본문 1줄** + chip 태그 — 영문 description 없음
- MOMENTUM 만 두 기관 뱃지 (삼성서울 + 카카오) 동시 보유
- Featured 단락은 단축 영문 제목 또는 풀제목 + hashtag 태그 + meta 라인
- LIVE 에 자체 typo 존재 (`multi-insitutions`, `multi-intitution(hospital)`) — 본 v3 에서는 정정 표기로 저장

---

## 1. v2 → v3 변경 매트릭스

| v2 필드 | v3 처리 | 이유 |
|---|---|---|
| `title` | **유지** (LIVE phi-card-title verbatim) | LIVE 정본 — 단축 제목이 LIVE 에 있는 그대로 |
| `titleKo` | **제거** | LIVE 는 title 슬롯에 한글 또는 영문 중 하나만 둠. 별도 KO 필드 불필요 — 카드가 한글-주도이면 `title` 자체가 한글 |
| `description` (string) | **제거** | LIVE 영문 본문 없음. 기존 영문 description 은 모두 사후 번역/창작 |
| (신규) `descriptionKo` | **추가** | LIVE phi-card-sub verbatim (한글 1줄) |
| (신규) `fullTitle` | **추가** (옵션) | MOMENTUM 처럼 Featured 풀제목 + 그리드 단축제목 둘 다 있는 경우 풀제목 저장 |
| `affiliation` (string) | **제거** | 단일 문자열로 듀얼 기관 표현 불가 (MOMENTUM) |
| (신규) `affiliations` (object[]) | **추가** | 객체 배열. length=1 도 배열. MOMENTUM 만 length=2 |
| `tags` (string[]) | **제거** | 축약 약어 (`RWD`/`ML`) 가 LIVE chip 라벨과 미세 차이 (`Multi-inst.`, `GIS / GWR`, `Public data`). LIVE verbatim 우선 |
| (신규) `tagsLive` (string[]) | **추가** | LIVE phi-tag chip 라벨 verbatim (공백/슬래시/점 보존) |
| (신규) `tagsFeaturedLive` (string[]) | **추가** (옵션) | Featured 단락의 hashtag 셋 (LIVE typo 는 v3 에서 정정). MOMENTUM + AI-Trajectory 만 사용 |
| `icon` | **제거** | LIVE 무관, UI 토큰. UI 재설계 트랙에서 별도 결정 |
| `startYear`, `endYear` | **제거** | LIVE 가 연도 제공 안 함 |
| `fundingAgency` | **유지** | LIVE 의 `#NRF funded` 같은 자금원 메타 표기 보존. null 허용 |
| `status` | **유지** | 'active' / 'completed' (현재 모두 active). LIVE 가 "Confidential yet" 등 상태 표현이 있지만 별도 `notes` 로 |
| (신규) `featured` (boolean) | **추가** | LIVE Featured 단락 위치 여부. MOMENTUM + AI-Trajectory 만 true |
| (신규) `collaborators` (object) | **추가** (옵션) | SDoH 등 `phi-collab` 라인이 국제 협력자 명단을 가진 경우 |
| (신규) `notes` (string) | **추가** (옵션) | `phi-collab` 의 비협력자 메타 (예: MOMENTUM 의 "Participating Institutions: Confidential yet") |

---

## 2. v3 entry 표준 형태

```js
{
  // 식별자
  id: 'momentum-study',                   // 기존 v2 id 보존 (안정 참조)

  // 제목
  title: 'MOMENTUM Study',                // LIVE 단축 제목 (또는 LIVE 풀제목 — 카드가 1개뿐이면 풀제목)
  fullTitle: 'MOMENTUM study – Exploring intersection of metabolic vulnerability and endocrine therapy in breast cancer through AI techniques and real-world data from multi-institutions in Korea',
                                          // 옵션 — LIVE Featured 풀제목이 별도로 있을 때만 (MOMENTUM 만 해당, typo 정정됨)

  // 본문
  descriptionKo: '유방암의 대사 취약성 × 내분비치료 AI 분석',  // LIVE phi-card-sub verbatim (한글)

  // 소속 (항상 배열)
  affiliations: [
    {
      institution: 'Samsung Seoul Hospital',       // 영문 풀네임
      institutionKo: '삼성서울',                    // LIVE 뱃지 표기 (축약)
      department: 'Hematology-Oncology',           // 옵션
      departmentKo: '혈액종양내과',                  // 옵션
      isInternal: false                            // PHI Lab 본진이면 true
    },
    {
      institution: 'Kakao Healthcare',
      institutionKo: '카카오헬스케어',
      department: null,
      departmentKo: null,
      isInternal: false
    }
  ],

  // 태그
  tagsLive: ['RWD', 'ML', 'Multi-inst.', 'Breast Cancer'],
                                          // LIVE phi-tag chip verbatim (공백/슬래시/점 보존)
  tagsFeaturedLive: [                     // 옵션, Featured 단락 hashtag (typo 정정)
    'clinical research data platform',
    'data pipelining',
    'multi-institution(hospital)',        // LIVE 'multi-intitution' → v3 corrected
    'landscape study'
  ],

  // 협력 / 메타
  collaborators: null,                    // 옵션, 국제 협력자 리스트 있는 경우만
  notes: 'Participating Institutions: Confidential yet',  // 옵션
  fundingAgency: null,                    // 'NRF (National Research Foundation of Korea)' 등

  // 위계 / 상태
  featured: true,                         // LIVE Featured 단락 항목만
  status: 'active'                        // 'active' | 'completed'
}
```

---

## 3. 필드별 정의 / 필수성

### 식별
- **`id`** (string, 필수) — kebab-case 슬러그. 기존 v2 id 보존.

### 제목
- **`title`** (string, 필수) — LIVE 의 1차 제목 슬롯 verbatim. 카드가 1개뿐이면 LIVE 의 단일 제목. 단축 + 풀 둘 다 있으면 LIVE 단축. **언어 혼합 허용** — LIVE 가 한글이면 한글, 영문이면 영문 그대로.
- **`fullTitle`** (string, 옵션) — LIVE 가 단축 + 풀 둘 다 가진 경우의 풀제목. **MOMENTUM 만 해당** (LIVE Featured 단락 vs 그리드 카드 분리).

### 본문
- **`descriptionKo`** (string, 옵션) — LIVE phi-card-sub verbatim. AI-Trajectory(Featured-only)는 LIVE 카드 없으므로 null.

### 소속
- **`affiliations`** (object[], 필수, length≥0)
  - 각 객체: `institution` (영문 풀, 필수), `institutionKo` (LIVE 뱃지 축약, 옵션), `department` / `departmentKo` (옵션), `isInternal` (boolean, 기본 false)
  - AI-Trajectory 처럼 LIVE 뱃지가 없는 항목은 `[]` 빈 배열 또는 `[{ institution: 'PHI Lab', isInternal: true }]` — Task 10 에서 결정. 일관성 위해 PHI Lab 으로 채움.
  - MOMENTUM 만 length=2 (삼성서울 + 카카오).

### 태그
- **`tagsLive`** (string[], 필수, length≥0) — LIVE phi-tag chip 라벨 그대로. AI-Trajectory 는 그리드 없으므로 `[]`.
- **`tagsFeaturedLive`** (string[], 옵션) — Featured hashtag 셋. MOMENTUM + AI-Trajectory 만. LIVE typo 는 정정 표기 (`multi-institution(hospital)`).

### 협력 / 메타
- **`collaborators`** (object | null, 옵션)
  - `{ international: string[] }` 형태. 현재 SDoH 만 해당.
- **`notes`** (string | null, 옵션) — LIVE `phi-collab` 의 협력자 외 메타. MOMENTUM 의 "Confidential yet".
- **`fundingAgency`** (string | null, 옵션).

### 위계 / 상태
- **`featured`** (boolean, 필수) — LIVE Featured 단락 위치 여부.
- **`status`** ('active' | 'completed', 필수).

---

## 4. UI 영향 매트릭스 (Task 12 대상)

| 컴포넌트 | 기존 참조 | v3 변환 |
|---|---|---|
| `Research.jsx` `ProjectCard` | `project.description` | `project.descriptionKo` |
| | `project.tags` | `project.tagsLive` |
| | `project.icon` | 제거 — ProjectIcon 항상 FlaskConical fallback |
| | `project.startYear / endYear` (yearRange) | 제거 — yearRange 표시 자체 삭제 |
| | `project.fundingAgency` | 유지 |
| `Home.jsx` `HomeProjectCard` | `project.affiliation` (string) | 헬퍼 `affiliationKicker(p)` — `affiliations.map(a => a.institutionKo).join(' · ')` |
| | `project.titleKo` | `project.descriptionKo` 로 이전 (subtitle 슬롯 재해석) |
| | `project.description` | 제거 — subtitle = descriptionKo 한 곳에 통합 |
| | `project.tags` | `project.tagsLive` |
| `Home.jsx` `featuredProjects` 정렬 | `.slice(0, 4)` | `.sort((a,b) => Number(b.featured)-Number(a.featured)).slice(0, 4)` — Featured 우선 (옵션) |

---

## 5. LIVE typo 정정 정책 (사용자 결정 #3, 2026-05-14)

| LIVE 표기 | v3 JSON 저장 | 정정 사유 |
|---|---|---|
| `multi-insitutions` (Featured MOMENTUM body) | `multi-institutions` | 영문 표준 철자 |
| `multi-intitution(hospital)` (Featured MOMENTUM tag) | `multi-institution(hospital)` | 영문 표준 철자 |
| `독성표피괴사용해` (SJS-TEN body) | `독성표피괴사용해` | **정정 안 함** — 한국 의학 표준은 `독성표피괴사융해` 가 정확하나 PI 의도 불명, 한글 영역은 LIVE 보존 |
| Double space `#methodology  #NRF funded` | single space | 표기 정규화 |

`docs/phi-lab-content/05_research.md` 는 LIVE typo verbatim 보존 (감사 추적용).

---

## 6. 확장성 / 향후 마이그레이션

- v4 에서 다국어 풀 description 추가 시: `descriptionEn` 필드 부활 가능 (LIVE 외 PI 가 직접 영문 작성한 경우).
- `featured` 외 더 미세한 위계가 필요하면 `priority: number` 추가 가능.
- 진행 상태가 'active' / 'completed' 보다 세밀해야 하면 `status` 를 `'active' | 'in-progress' | 'submitted' | 'completed'` 로 확장.

---

## 7. 사용자 결정 요약 (2026-05-14, Task 9)

| # | 질문 | 결정 |
|---|---|---|
| 1 | affiliation 구조 | 배열 `[{...}, {...}]` |
| 2 | legacy 필드 (description string, tags 약어, icon, startYear, endYear) | 완전 제거 |
| 3 | LIVE typo (`multi-insitutions` 등) JSON 저장 | 정정 표기, 05_research.md 만 typo 기록 |
| 4 | LIVE 부재 descriptionEn | 필드 자체 제거, descriptionKo 단일화 |
