# PHI Lab — JSON 데이터 스키마 v2

작성: 2026-05-14
배경: 가짜 placeholder를 실제 PHI Lab 데이터로 교체하면서, round-03 본문 표시(영/한 병기, 저자 강조, 기관 kicker 등)를 지원하기 위해 스키마를 확장.

---

## 변경 원칙

1. **하위호환 가능한 추가**: 기존 필드는 유지(또는 deprecated). 새 필드는 모두 옵션.
2. **소스 파일 분리는 유지**: `members.json`, `publications.json`, `research.json`, `lectures.json`, `news.json`.
3. **i18n 토글과 무관한 병기 정책**: 영문 제목 + 한글 부제는 `title` + `titleKo` 두 필드로 항상 함께 노출.
4. **저자 객체 배열**: 마크다운 마커/인덱스 분리 대신 `{name, isPi?, coFirst?}` 명시 객체.

---

## 1. `members.json`

### v1 (현재)
```json
{
  "current": [
    {
      "id": "hkim",
      "name": "Hyojung Kim",
      "role": "Principal Investigator",
      "degree": "Ph.D.",
      "year": null,
      "photo": "https://api.dicebear.com/...",
      "email": "...@university.edu",
      "researchInterests": [...],
      "linkedin": "...",
      "googleScholar": "...",
      "status": "current",
      "bio": "..."
    }
  ],
  "alumni": []
}
```

### v2 (확장)
```json
{
  "current": [
    {
      "id": "hkim",
      "name": "Hyo Jung Kim",
      "nameKo": "김효정",                      // [신규] 한글 이름
      "role": "Principal Investigator",
      "title": "Assistant Professor",          // [신규] 직위 (Members 표시용)
      "degree": "Ph.D. in Biomedical Informatics",
      "year": null,
      "department": "Department of Biomedical Software Engineering",  // [신규]
      "institution": "The Catholic University of Korea",              // [신규]
      "photo": "/photos/hkim.jpg",             // public/photos/ 로컬 자산
      "email": "hyojung.kim@catholic.ac.kr",
      "personalSite": "https://sites.google.com/view/hyojungkim/",   // [신규]
      "linkedin": null,
      "googleScholar": null,
      "researchInterests": [...],
      "status": "current",
      "bioShort": "...",                       // [신규] Home·Members 카드용 3~4줄
      "bioFull": "...",                        // [신규/리네임 from 'bio'] About 페이지용 풀버전
      "education": [                           // [신규] About 페이지용
        { "degree": "BSc", "field": "Nursing", "institution": "Yonsei University" }
      ],
      "experience": [                          // [신규] About 페이지용
        { "period": "03/2024 – 02/2025", "role": "ML/LLM Senior Data Engineer",
          "organization": "Kakaohealthcare, Technological Lab", "location": "Pankyo, South Korea" }
      ],
      "service": [                             // [신규] About 페이지용
        "Member, 2nd Data Disclosure and Utilization Committee, CODA, Korea NIH"
      ]
    },
    {
      "id": "jsher",
      "name": "Jun Seok Her",
      "role": "Undergraduate Researcher",
      "degree": "Undergraduate",
      "photo": "https://api.dicebear.com/...",
      "email": null,
      "researchInterests": [...],
      "status": "current"
    }
  ],
  "alumni": []
}
```

### Notes
- `bio` 필드는 deprecated. 신규 데이터에서는 `bioShort` / `bioFull` 분리.
- `email` `linkedin` `googleScholar`는 null 허용 (학생들 데이터 없음).
- `education` `experience` `service`는 PI에게만 채워짐. 학생은 생략.

---

## 2. `publications.json`

### v1 (현재)
```json
{
  "id": "...",
  "title": "...",
  "authors": ["string", "string"],
  "venue": "...",
  "year": 2025,
  "type": "journal",
  "doi": "10.1234/abc",
  "abstract": "...",
  "tags": [...]
}
```

### v2 (확장)
```json
{
  "id": "kim2024-fasttrack-faers",
  "title": "Investigating the Safety Profile of Fast-Track COVID-19 Drugs ...",
  "titleKo": null,                                  // [신규] 한글 부제 (선택)
  "authors": [                                      // [변경] 객체 배열로 변경
    { "name": "Kim HJ", "isPi": true, "coFirst": true },
    { "name": "Yoon JH", "coFirst": true },
    { "name": "Lee KH" }
  ],
  "venue": "Pharmacoepidemiology and Drug Safety",
  "venueDetails": "33(11), e70043",                // [신규] vol/issue/pages
  "year": 2024,
  "type": "journal",                               // 'journal' | 'conference' | 'workshop'
  "doi": null,
  "url": "https://pubmed.ncbi.nlm.nih.gov/39533148/",  // [신규] DOI 없을 때 대체 링크
  "abstract": null,                                // [완화] 옵션. 가짜 abstract 제거
  "tags": ["FAERS", "pharmacovigilance", "COVID-19"]
}
```

### 저자 객체 필드
- `name` (필수): "Kim HJ" 형식 (성 + 이니셜, 공백 1개)
- `isPi` (옵션, default false): PHI Lab PI(현재 Kim HJ) 여부 — UI에서 굵게 표시
- `coFirst` (옵션, default false): † 공동 1저자 표시
- 향후 `corresponding` 추가 가능 (현재 데이터에 없음)

### 변경 영향
- 기존 Publications.jsx의 `pub.authors.join(', ')` 와 BibTeX 함수 (`pub.authors[0].split(' ').pop()`) 는 객체 처리로 수정 필요. **Task 4 진행 시 함께 수정.**
- 검색 필터 `p.authors.some((a) => a.toLowerCase().includes(q))` → `a.name.toLowerCase()` 로 변경.

### URL/DOI 우선순위
- 둘 다 있을 시: DOI 링크 우선 (`https://doi.org/${doi}`)
- DOI 없으면 url 사용
- 둘 다 없으면 링크 미표시

---

## 3. `research.json`

### v1 (현재)
```json
{
  "id": "...",
  "title": "...",
  "description": "...",
  "icon": "brain",
  "status": "active",
  "startYear": 2023,
  "endYear": null,
  "fundingAgency": "...",
  "tags": [...]
}
```

### v2 (확장)
```json
{
  "id": "momentum-study",
  "title": "MOMENTUM Study",                          // [유지] EN 필수
  "titleKo": "유방암 대사 취약성 × 내분비치료 AI 분석",  // [신규] 한글 부제
  "description": "Exploring the intersection of metabolic vulnerability and endocrine therapy in breast cancer through AI techniques and real-world data from multi-institutions in Korea.",
  "affiliation": "Samsung Seoul Hospital · Kakao Healthcare",  // [신규] kicker (uppercase)
  "fundingAgency": null,
  "icon": null,                                       // [완화] round-03 톤은 아이콘 없음
  "status": "active",                                 // 'active' | 'completed'
  "startYear": null,
  "endYear": null,
  "tags": ["RWD", "ML", "Multi-inst.", "Breast Cancer"]
}
```

### Notes
- `affiliation`은 round-03 의 kicker text (`text-xs uppercase tracking-wide`).
- `icon` 필드는 옵션화. round-03 카드 디자인엔 아이콘 없음. /research 페이지 카드에서만 사용.
- 기존 Research.jsx 의 ICON_MAP 호출은 `icon` null 처리하면 FlaskConical 폴백으로 자동 동작.

---

## 4. `lectures.json`

### v1 (현재)
```json
{
  "id": "...",
  "code": "BME-501",
  "title": "...",
  "level": "graduate",
  "semester": "Fall 2024",
  "description": "...",
  "tags": [...]
}
```

### v2 (확장)
```json
{
  "id": "sp26-aiprog",
  "code": null,                            // [완화] 사이트에 학수번호 없음 → null 허용
  "titleEn": "Artificial Intelligence Programming Design",  // [변경] title → titleEn
  "titleKo": "인공지능프로그래밍설계",                       // [신규] 한글 제목
  "level": "undergraduate",
  "semester": "Spring 2026",
  "description": "Introductory course covering neural networks (CNN, RNN, Auto-encoder), Reinforcement Learning, and Transformers...",
  "tags": ["Python", "TensorFlow", "Keras", "Neural Networks"]
}
```

### 변경 영향
- 기존 Lectures.jsx의 `<CourseCard>` 가 `title` 필드를 사용 → `titleEn` 으로 변경 + `titleKo` 부제 추가 표시.
- semester 표기 표준: `'Spring 2026'`, `'Fall 2025'`, `'Spring 2025'` (영문, 띄어쓰기 1).

---

## 5. `news.json` — 변경 없음

이번 작업 범위 외. 기존 스키마 유지. (현재 fake data 그대로, 추후 별도 작업.)

---

## 6. UI 호환성 영향 정리

| 파일 | 영향 | 조치 |
|---|---|---|
| `src/pages/Members.jsx` | 사용 필드: `name, role, degree, year, photo, email, researchInterests, googleScholar, linkedin, bio` → `bio` 가 `bioShort` 로 이름 변경됨 | 한 줄 수정 |
| `src/pages/Publications.jsx` | `authors` 가 string[] → object[] 로 변경 | `pub.authors.map(a => a.name)` 형태로 변환 / 굵게 처리 / † 처리 / BibTeX 작성자 함수 수정 |
| `src/pages/Research.jsx` | 새 필드 `titleKo`, `affiliation` 표시 추가 (옵션). 기존 코드는 동작 유지 | 점진 개선 |
| `src/pages/Lectures.jsx` | `title` → `titleEn`/`titleKo`. 표시 한 줄 수정 | 카드에서 `titleEn` 위/`titleKo` 아래 |
| `src/pages/About.jsx` | members.json[hkim] 의 `bioFull`, `education`, `experience`, `service` 사용 | Task 7에서 통합 |

---

## 7. 결정 요약 (project_data_decisions 메모리와 일치)

- ✅ Source of truth: `docs/` 1차
- ✅ 사진: PI는 실제 사진 다운로드(`/photos/hkim.jpg`), 학생은 DiceBear initials
- ✅ 한영 병기: `title` + `titleKo` 항상 같이
- ✅ 저자 표기: 객체 배열
- ✅ Home PI 약력: `bioShort` (3~4줄)
- ✅ Body 색: 본 작업의 sub-component 에서 blue-700 사용 (Task 8)

---

## 8. 변경 적용 순서

1. **Task 3** (members.json) → `Members.jsx` `bio`→`bioShort` 한 줄 수정 동시
2. **Task 4** (publications.json) → `Publications.jsx` 저자 처리 함수 동시 수정 (가장 영향 큼)
3. **Task 5** (research.json) → `Research.jsx` 신규 필드 표시 (옵션, 점진)
4. **Task 6** (lectures.json) → `Lectures.jsx` `title`→`titleEn` 한 줄 수정
5. **Task 7** (PI 정체성 + About 통합)

---

## 9. v2.1 (2026-05-14 추가) — `experience` 객체 확장

배경: Professor 페이지를 라이브 사이트(philabcuk.org/people/) 와 1:1 매칭시키기 위해 work experience 항목에 카테고리 그룹핑·focus·details·외부 링크 정보가 필요. 기존 평면 6 항목 + period/role/organization/location 만으로는 누락이 큼.

### 변경 (members.json#current[0].experience 객체)

```js
{
  // 기존 필드 (유지)
  period: "03/2024 – 02/2025",
  role: "ML/LLM Senior Data Engineer",
  organization: "Kakao Healthcare, Technological Lab",
  location: "Pankyo, South Korea",

  // 신규 필드 (모두 옵션)
  category: "academic" | "technical" | "clinical",   // [신규] UI 그룹 헤더
  focus: "EMR Development and Maintenance",          // [신규] 한 줄 핵심 (라이브의 'Focus:' 라벨)
  details: [                                         // [신규] 다중 bullet (라이브의 'Details:' 라벨)
    "Person in charge of CPOE and CDW",
    "Database and application design",
    "Workflow analysis for digital transformation"
  ],
  externalLinks: [                                   // [신규] 외부 참조 URL
    { label: "Google Cloud customer story", url: "https://cloud.google.com/customers/kakao-healthcare-federated-learning" }
  ]
}
```

### 카테고리 매핑 (라이브 페이지 그룹 헤더와 일치)

| category 값 | UI 헤더 |
|---|---|
| `academic` | "Academic Experience" |
| `technical` | "Technical Leadership & Hands-On Experience" |
| `clinical` | "Clinical Experience" |

### 필드 채우기 정책 (라이브 1:1)

- **focus**: 라이브에 'Focus:' 라벨이 붙은 경우 그 텍스트를 verbatim 입력
- **details**: 라이브에 'Details:' 라벨로 bullet 목록이 있는 경우 각 bullet 을 array 원소로
- **externalLinks**: 라이브 본문 어디든 외부 URL 이 명시된 경우 (예: 'Notable External Reference: Google blog' 식)
- **category**: 모든 항목 필수 부여 (academic/technical/clinical 중 하나)

### Professor.jsx UI 매핑

- experience 배열을 `category` 별로 group → 3 sub-section 헤더 렌더
- 각 항목 카드 안에서 `focus` (Focus 라벨 + 한 줄), `details` (불릿 ul), `externalLinks` (a 태그) 순으로 표시
- 데이터에 category 가 없는 항목은 폴백 그룹 'Experience' 로

### 적용 범위

- 본 v2.1 변경은 PI(`hkim`) experience 만 영향. 학생 멤버 객체에는 experience 필드 자체가 없음 → 영향 없음
- v2.0 의 다른 모든 필드(`title`, `bioShort`, `bioFull`, `education[]`, `service[]`, `researchInterests[]`, `nameKo` 등) 그대로 유지
