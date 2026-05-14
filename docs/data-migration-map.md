# PHI Lab — 데이터 이전 매핑표

작성: 2026-05-14
목적: `docs/phi-lab-content/` (1차 소스) + `prototypes/round-03/index.html` (2차 참고) 의 실제 데이터를 `src/data/*.json` 으로 옮기기 위한 인벤토리·매핑표.

규칙 (project_data_decisions 메모리 참조):
- Source of truth: `docs/` 1차, round-03/ 2차
- 사진: DiceBear initials placeholder
- 한영 병기: 항상 둘 다
- 저자 표기: 객체 배열 `{name, isPi?, coFirst?}`

---

## 1. PI (Hyo Jung Kim) — `members.json#current[0]`

| 필드 | 값 | 출처 |
|---|---|---|
| id | `hkim` | 기존 |
| name | Hyo Jung Kim | 02_professor.md L8, 07_members.md |
| nameKo | 김효정 | 06_about.md (가톨릭대학교 PHI 김효정) |
| role | Principal Investigator | 07_members.md L25 |
| title | Assistant Professor | 07_members.md (page header) |
| degree | Ph.D. in Biomedical Informatics | 02_professor.md L15 |
| department | Department of Biomedical Software Engineering | 02_professor.md |
| institution | The Catholic University of Korea | 02_professor.md |
| email | hyojung.kim@catholic.ac.kr | 02_professor.md L19 |
| personalSite | https://sites.google.com/view/hyojungkim/ | 02_professor.md L20 |
| photo | DiceBear initials (`Hyojung Kim`) | 결정사항 |
| bioShort | (round-03 압축본, 3~4줄) | round-03 L342-345 + 보강 |
| bioFull | (verbatim 단락 2개) | 02_professor.md L44-46 |
| researchInterests | 9개 | 02_professor.md L51-60 |
| status | current | — |

**bioShort 작성안 (3~4줄):**
> Clinical informaticist with over 20 years of professional experience across clinical practice, EHR architecture, and academic research. PhD in Biomedical Informatics, Seoul National University. Former ML/LLM Senior Data Engineer at Kakao Healthcare; postdoctoral researcher at Samsung Medical Center and Sungkyunkwan University SAIHST. Member, 2nd Data Disclosure and Utilization Committee, CODA, Korea NIH.

**bioFull**: 02_professor.md L44-46 두 단락 그대로.

**Education (About 페이지용)**:
- BSc Nursing, Yonsei University
- MSc Nursing, Yonsei University
- MSc Management & Education, Yonsei University
- PhD Biomedical Informatics, Seoul National University (2015.3 – 2020.8)

**Work Experience (About 페이지용)** — 6 항목 02_professor.md L70-79.

**Service**: Member, 2nd Data Disclosure and Utilization Committee, CODA, Korea NIH.

---

## 2. 학부 연구원 7명 — `members.json#current[1..7]`

모든 학생: degree=`Undergraduate Researcher`, status=`current`, 사진=DiceBear initials, 이메일/링크 없음.

| id | name | researchInterests | 출처 |
|---|---|---|---|
| jsher | Jun Seok Her | Biomedical Data Science · Pharmacovigilance · Healthcare Data Engineering (Deduplication) | 07_members.md L94-99 |
| jwyoo | Jin Woo Yoo | Health Data Analytics · Claims and Public Health Data | 07_members.md L103-109 |
| ejjeong | Eun Jin Jeong | Biomedical Data Science · Clinical Informatics · Data Pipelining | 07_members.md L113-119 |
| yslee | Yeseo Lee | Data Harmonization and Reuse in Public Health · Linked Health Data Utility | 07_members.md L123-129 |
| ejkim | Eun Ji Kim | Biomedical Data Science · Pharmacovigilance & Drug Safety | 07_members.md L133-139 |
| smlim | Sang Min Lim | Clinical Informatics · Health Services Research | 07_members.md L143-149 |
| jhhan | Jae Hyeok Han | Biomedical Data Science · Clinical Data Management System | 07_members.md L153-159 |

`alumni` 배열은 빈 배열로 둠 (원사이트에 alumni 섹션 없음).

---

## 3. 논문 — `publications.json` (peer-reviewed 16편)

03_publications.md 의 1~16번 항목을 모두 포함.

스키마:
```js
{
  id, title, authors: [{name, isPi?, coFirst?}], venue, year, type,
  doi?, url?, tags?: []
}
```

| id (제안) | year | type | venue | doi/url | 출처 |
|---|---|---|---|---|---|
| choo2026-covid-screening | 2026 | journal | JMIR AI 5(1) e54956 | https://ai.jmir.org/2026/1/e54956/ | #1 |
| kim2025-capecitabine-tnbc | 2025 | journal | Clinical Breast Cancer | pubmed:39909791 | #2 |
| jeon2024-neuroendocrine | 2024 | journal | Cancer Treatment and Research Communications | sciencedirect | #3 |
| kim2024-fasttrack-faers | 2024 | journal | Pharmacoepidemiology and Drug Safety 33(11) e70043 | pubmed:39533148 | #4 |
| kim2024-trastuzumab-hepatobiliary | 2024 | journal | Scientific Reports 14(1) 19587 | nature | #5 |
| kang2024-charm-cohort | 2024 | journal | Breast Cancer 31(3) 467-475 | springer 10.1007/s12282-024-01559-5 | #6 |
| kim2024-traffic-medinfo | 2024 | conference | MEDINFO 2023 (IOS Press) 1566-1567 | pubmed:38269748 | #7 |
| kang2024-social-support-charm | 2024 | journal | Cancer Research and Treatment 56(1) 125 | pubmed:37669709 | #8 |
| kang2023-endocrine-symptoms | 2023 | journal | Therapeutic Advances in Medical Oncology 15 | doi:10.1177/17588359231189421 | #9 |
| choe2023-active-pv-framework | 2023 | journal | Drug Safety 46(7) 647-660 | pubmed:37243963 | #10 |
| kim2023-rwd-brain-mets | 2023 | journal | Journal of Medical Internet Research | doi:10.2196/43359 | #11 |
| lee2022-hla-adr | 2022 | journal | Clinical and Translational Allergy 12(1) e12098 | doi:10.1002/clt2.12098 | #12 |
| kim2021-tnbc-cdw | 2021 | journal | Cancers 13(22) 5835 | mdpi | #13 |
| kim2020-cgdm | 2020 | journal | Scientific Reports 10(1) 1-13 | nature | #14 |
| lee2020-hla-rule-based | 2020 | journal | Journal of Korean Medical Science 35(12) | yonsei.ac.kr | #15 |
| cho2013-chemotherapy-cap | 2013 | journal | International Journal of Medical Informatics 82(6) 504-513 | sciencedirect | #16 |

**저자 표기 변환 규칙**:
- "Kim, H. J." → `{name: 'Kim HJ', isPi: true}`
- "†" 표시된 저자 → `coFirst: true`
- "…" (et al.) → 생략 표현은 maintain. 데이터는 명시 저자만 모두 기록, 마지막 저자가 "..." 다음에 와도 그대로 추가 (UI에서 "..." 표시 별도 처리 가능). 단순화 위해 `…` 자리에 명시된 저자만 array에 포함.

**예시 (논문 #4):**
```json
{
  "id": "kim2024-fasttrack-faers",
  "title": "Investigating the Safety Profile of Fast-Track COVID-19 Drugs Using the FDA Adverse Event Reporting System Database: A Comparative Observational Study",
  "authors": [
    {"name": "Kim HJ", "isPi": true, "coFirst": true},
    {"name": "Yoon JH", "coFirst": true},
    {"name": "Lee KH"}
  ],
  "venue": "Pharmacoepidemiology and Drug Safety",
  "year": 2024,
  "type": "journal",
  "url": "https://pubmed.ncbi.nlm.nih.gov/39533148/",
  "tags": ["pharmacovigilance", "FAERS", "COVID-19"]
}
```

**Tags 추론 규칙** (각 논문 제목·venue로부터):
- breast cancer / TNBC / brain metastasis → `breast cancer`
- FAERS → `FAERS`, `pharmacovigilance`
- HIRA → `HIRA`
- CDW → `CDW`, `RWD`
- LLM/NER/NLP → 해당 키워드
- CDSS / cGDM → `CDSS` 또는 `knowledge representation`
- HLA → `pharmacogenomics`
- registry / cohort → `registry` 또는 `cohort`

---

## 4. 발표 (Presentations) — 별도 처리 필요

03_publications.md 17~40번 = 24건 (international 11 + national 13). 현재 publications.json 스키마에 type=presentation 없음. 옵션:
- (A) `presentations.json` 신설 + Publications 페이지에 별도 탭
- (B) `publications.json` 에 type='presentation' 추가
- (C) 이번 작업 범위 외, peer-reviewed 16편만 처리

**권장 (C) 이번 범위 외**. 발표는 추후 별도 처리. 매핑표에는 데이터 보존 차원에서 위치 표시만:

| id 패턴 | year | venue | 출처 라인 |
|---|---|---|---|
| (24건) | 2008-2025 | ISPOR/AMIA/ESMO/MedInfo/SABCS/KSMI 등 | 03_publications.md L107-209 |

---

## 5. 연구 프로젝트 — `research.json`

05_research.md 에서 추출. **17개 활성 프로젝트** (Featured 2 + Cards 15).

| id | title (EN) | titleKo | affiliation | tags | status | 출처 |
|---|---|---|---|---|---|---|
| momentum-study | MOMENTUM Study | 유방암 대사 취약성 × 내분비치료 AI 분석 | Samsung Seoul Hospital · Kakao Healthcare | RWD, ML, Multi-inst., Breast Cancer | active | L21-31 + L124-129 |
| cancer-trajectory | AI-Based Cancer Trajectory Recontextualization | 개인 중심 표현형 방법론 (유방·대장암 RWD) | NRF Funded | RWD, DL, Methodology, NRF | active | L35-43 |
| dqm-review | Data Quality Management Review | DQM 리뷰 논문 | PHI Lab Internal | RWD, Data Quality | active | L53-55 |
| faers-dedup | FAERS Dynamic Deduplication | FAERS 데이터 중복 제거 방법론 | PHI Lab Internal | FAERS, RWD, Pharmacovigilance | active | L57-60 |
| gaming-childhood-depression | Gaming Behaviors & Childhood Depression | Youth Cohort 기반 혼합효과·머신러닝 연구 | PHI Lab Internal | ML, Mixed-Effects, Cohort | active | L62-64 |
| antibiotic-neurodev | Early-Life Antibiotics & Neurodevelopmental Disorders | 영아기 항생제 → ADHD·ASD 위험도 | Catholic Univ. · Biomedical Sciences | ML, Pediatrics, ADHD | active | L69-72 |
| llm-eval | LLM Performance Evaluation in Healthcare | 의료 LLM 성능 평가 연구 | Kakao Healthcare | LLM, NLP, Eval | active | L78-80 |
| llm-clinical-ner | LLM-based Clinical NER | 임상 텍스트 개체명 인식 통합모델 | Kakao Healthcare | LLM, NER, Patent | active | L82-84 |
| rectal-prolapse-hira | Rectal Prolapse — HIRA Descriptive Study | 대장탈출증 HIRA 청구 데이터 기술통계 | Eunpyeong St. Mary's · Colorectal & Vascular Surgery | HIRA, RWD, Colorectal | active | L90-92 |
| colorectal-cancer-eval | Colorectal Cancer Appropriateness Evaluation | 대장암 적정성평가 (HIRA) | Eunpyeong St. Mary's · Colorectal & Vascular Surgery | HIRA, RWD, Colorectal Cancer | active | L94-96 |
| incisional-hernia | Incisional Hernia Surgical Trends in Korea | 한국 절개 탈장 현황 분석 | Eunpyeong St. Mary's · Gastrointestinal Surgery | HIRA, RWD, Surgery Trend | active | L102-104 |
| masld-pcos | PCOS Impact on MASLD Long-Term Prognosis | MASLD 환자 장기예후 PCOS 영향 | Eunpyeong St. Mary's · Gastroenterology | RWD, Hepatology, PCOS | active | L110-112 |
| napro-cohort | Napro Cohort DB → Predictive Modeling | 나프로 코호트 DB 예측 모델링 (SDG 연계) | Bucheon St. Mary's · OB/GYN | RWD, ML, Cohort, SDGs | active | L118-120 |
| sdoh-breast-mortality | Social Determinants & Breast Cancer Mortality | 거주 지역별 임상·공공데이터 통합 사망률 연구 | Samsung Seoul · Hematology-Oncology · U. Cincinnati · Harvard · Tufts · SKKU | RWD, Multi-inst., GIS/GWR, Public Data | active | L131-134 |
| breast-subtype | Breast Cancer Clinical Subtype Classification | 유방암 임상 서브타입 분류 알고리즘 (다기관) | Samsung Seoul · Hematology-Oncology | ML, RWD, Multi-inst., Breast Cancer | active | L136-138 |
| ais-endocrine | AIs Endocrine Therapy Real-World Analysis | 아로마타제 억제제 실사용 데이터 내분비치료 분석 | Samsung Seoul · Hematology-Oncology | RWD, Endocrine Therapy, Breast Cancer, AIs | active | L140-142 |
| breast-registry | Breast Cancer Registry | 유방암 레지스트리 지속 구축·활용 연구 | Samsung Seoul · Hematology-Oncology | RWD, Registry, Breast Cancer | active | L144-146 |
| ovulation-faers | Ovulation Induction Agents Pharmacovigilance | 배란유도제 FAERS 약물감시 연구 | Sookmyung Women's Univ. · Pharmacy | FAERS, RWD, Pharmacovigilance | active | L152-154 |
| sjs-ten-faers-hira | SJS-TEN Pharmacovigilance | 스티븐스-존슨 증후군·독성표피괴사용해 이상반응 | Chonnam National Univ. · Nursing | FAERS, HIRA, RWD, SJS-TEN | active | L160-162 |

**총 19개**. (round-03은 8개 발췌, 본 사이트는 17개라 명시 → 실제 카운트 19로 보고. 통계 표시 시 "18+ Active Projects" 사용 권장.)

`description` 필드는 영문으로, KO는 `titleKo` 부제에만 둠. 데이터에 한국어 description 필요 시 `descriptionKo` 추가 가능 (이번 범위는 영문 중심).

`fundingAgency` 별도: cancer-trajectory → "NRF (National Research Foundation of Korea)".

---

## 6. 강의 — `lectures.json` (9개)

| id | code | titleEn | titleKo | semester | level | tags | 출처 |
|---|---|---|---|---|---|---|---|
| sp26-aiprog | — | Artificial Intelligence Programming Design | 인공지능프로그래밍설계 | Spring 2026 | undergraduate | Python, TensorFlow, Keras, NN | L10-13 |
| sp26-medbigdata | — | Biomedical Big Data Analysis | 의료빅데이터분석 | Spring 2026 | undergraduate | R, EHR, Statistics | L15-18 |
| sp26-capstone1 | — | BMSW Capstone Design 1 | BMSW캡스톤디자인1 | Spring 2026 | undergraduate | Capstone | L20-23 |
| sp26-dhealth-ai | — | Digital Health AI System Design | 디지털헬스인공지능시스템설계 | Spring 2026 | graduate | AI, Digital Health | L25-27 |
| fa25-medbigdata | — | Biomedical Big Data Analysis | 의료빅데이터분석 | Fall 2025 | undergraduate | R, EHR, Claims, ICD | L33-45 |
| fa25-ml | — | Machine Learning | 머신러닝 | Fall 2025 | undergraduate | R, Statistics, Supervised, Unsupervised | L47-53 |
| fa25-prog-ai | — | Programming for AI | AI를 위한 프로그래밍 | Fall 2025 | graduate | Python, ML, Clinical | L55-63 |
| sp25-aiprog | — | Artificial Intelligence Programming Design | 인공지능프로그래밍설계 | Spring 2025 | undergraduate | Python, TensorFlow, Keras | L69-74 |
| sp25-prog1 | — | Computers & Programming 1 | 컴퓨터와프로그래밍1 | Spring 2025 | undergraduate | Python, Basics | L76-83 |

`code`는 사이트에 없음 → null/생략.

`description` 영문 (사이트 한글이지만 OK — 이번 작업의 영문 중심 정책).

---

## 7. About 페이지 콘텐츠 — `src/pages/About.jsx`

JSON으로 안 들어감. About.jsx 직접 교체 (Task 7 범위).

**소스:**
- Lab Description (KO): 06_about.md L19
- Lab Description (EN): 06_about.md L25
- Mission: 06_about.md L31
- Research Focus Areas (8개): 06_about.md L37-44
- Address: `43, Jibong-ro, Bucheon, 14662, Gyeonggi-do, South Korea`
- Email: `hyojung.kim@catholic.ac.kr`

---

## 8. Home 페이지 추가 콘텐츠 (round-03 인용)

- Research 3 pillars (KR/RWD/RWE) 본문: `docs/prototype-design-criteria.md` L51-62 또는 round-03 L82-101
- Featured quote: "Data is the new soil, not oil." — David Maccandless (01_home.md L45-50)
- Stats inline: `19 Active Projects · 16 Publications · 12+ Collaborating Institutions` (round-03 L70-74 변형)
- Collaborating institutions (12+ 리스트): 05_research.md L168-184

---

## 9. 누락·결정 보류

| 항목 | 결정 |
|---|---|
| 발표 24건 | 본 작업 범위 외 (별도 추후) |
| 학생 이메일·사진 | 데이터 없음 → 빈 필드 + DiceBear |
| PI 사진 (실제 URL 있음) | 02_professor.md L25에 https://i0.wp.com/... 있음. 다만 외부 hotlink는 안정성 ↓. 옵션 (a) URL 그대로 사용 (b) public/ 으로 다운로드 (c) DiceBear 유지 → **권장 (b)**: 다운로드 후 `public/photos/hkim.jpg` |
| PI 직위 inconsistency | "Assistant Professor" (page header 우선) — 02_professor.md L12 |
| 강의 description (Spring 2026 일부) | 데이터 없음 (❓) → 다른 학기 동일 강의 description 차용 또는 빈 문자열 |

---

## 10. 작업 체크리스트 (Task 3~6 진행 시)

- [ ] members.json: PI bio 압축본 + 학부생 7명
- [ ] publications.json: 16편, 저자 객체 배열, 태그
- [ ] research.json: 19개 active, EN/KO title, affiliation
- [ ] lectures.json: 9개, EN/KO title 병기
- [ ] PI 사진 다운로드 → public/photos/hkim.jpg
- [ ] About.jsx 교체 (Task 7)
- [ ] strings.js footer 업데이트 (Task 7)

---

## 11. 신뢰도 노트

- 모든 출처 인용 가능 (행 번호 표시).
- 결정 ❓로 표시된 항목 (학생 이메일, 발표 detail, PI 직위) — 실제 데이터 없음 / 본 작업에서는 보류.
- 향후 콘텐츠 변경 시 본 매핑표를 업데이트하여 진실의 소스 유지.
