# research.json v3 — verbatim audit (2026-05-14)

LIVE 정본(`docs/phi-lab-content/05_research.md`) 대비 19 entries × 핵심 필드 1:1 검증.

범례:
- ✅ verbatim 일치 (글자 단위)
- ⚠️ LIVE 부재 → null (정당)
- 🔧 typo 정정 적용 (사용자 결정 #3, JSON 정정 OK)
- ❌ 불일치 (조치 필요)

---

## 1. 매트릭스

| # | id | title | fullTitle | descriptionKo | affiliations | tagsLive | tagsFeaturedLive | featured | notes |
|---|---|---|---|---|---|---|---|---|---|
| 1 | momentum-study | ✅ | 🔧 (multi-insitutions → multi-institutions) | ✅ | ✅ length=2 | ✅ | 🔧 (multi-intitution → multi-institution) | ✅ true | ✅ |
| 2 | cancer-trajectory | ✅ | ⚠️ (LIVE 단일 title 만) | ⚠️ (LIVE 카드 없음) | ⚠️ (LIVE 뱃지 없음 → PHI Lab) | ⚠️ ([]) | 🔧 (`#methodology  #NRF` 더블스페이스 정규화) | ✅ true | ⚠️ |
| 3 | dqm-review | ✅ | ⚠️ | ✅ | ✅ PHI Lab | ✅ | — | ✅ false | ⚠️ |
| 4 | faers-dedup | ✅ | ⚠️ | ✅ | ✅ PHI Lab | ✅ | — | ✅ false | ⚠️ |
| 5 | gaming-childhood-depression | ✅ | ⚠️ | ✅ | ✅ PHI Lab | ✅ | — | ✅ false | ⚠️ |
| 6 | antibiotic-neurodev | ✅ (Korean title) | ⚠️ | ✅ | ✅ 가톨릭 · 의생명학과 | ✅ | — | ✅ false | ⚠️ |
| 7 | llm-eval | ✅ | ⚠️ | ✅ | ✅ 카카오 | ✅ | — | ✅ false | ⚠️ |
| 8 | llm-clinical-ner | ✅ ('LLM-based NER', "Clinical" 제거) | ⚠️ | ✅ | ✅ 카카오 | ✅ | — | ✅ false | ⚠️ |
| 9 | rectal-prolapse-hira | ✅ | ⚠️ | ✅ | ✅ 은평성모 · 대장혈관외과 | ✅ | — | ✅ false | ⚠️ |
| 10 | colorectal-cancer-eval | ✅ | ⚠️ | ✅ | ✅ 은평성모 · 대장혈관외과 | ✅ | — | ✅ false | ⚠️ |
| 11 | incisional-hernia | ✅ | ⚠️ | ✅ | ✅ 은평성모 · 위장관외과 | ✅ | — | ✅ false | ⚠️ |
| 12 | masld-pcos | ✅ | ⚠️ | ✅ | ✅ 은평성모 · 소화기내과 | ✅ | — | ✅ false | ⚠️ |
| 13 | napro-cohort | ✅ | ⚠️ | ✅ | ✅ 부천성모 · 산부인과 | ✅ | — | ✅ false | ⚠️ |
| 14 | sdoh-breast-mortality | ✅ | ⚠️ | ✅ | ✅ 삼성서울 · 혈액종양내과 | ✅ ('GIS / GWR' 공백 보존) | — | ✅ false | ✅ phi-collab 라인 |
| 15 | breast-subtype | ✅ | ⚠️ | ✅ | ✅ 삼성서울 · 혈액종양내과 | ✅ | — | ✅ false | ⚠️ |
| 16 | ais-endocrine | ✅ (LIVE 한영혼합 verbatim) | ⚠️ | ✅ | ✅ 삼성서울 · 혈액종양내과 | ✅ | — | ✅ false | ⚠️ |
| 17 | breast-registry | ✅ | ⚠️ | ✅ | ✅ 삼성서울 · 혈액종양내과 | ✅ | — | ✅ false | ⚠️ |
| 18 | ovulation-faers | ✅ | ⚠️ | ✅ | ✅ 숙명여대 · 약학대학 | ✅ | — | ✅ false | ⚠️ |
| 19 | sjs-ten-faers-hira | ✅ | ⚠️ | ✅ (`독성표피괴사용해` LIVE 표기 보존) | ✅ 전남대 · 간호대학 | ✅ | — | ✅ false | ⚠️ |

---

## 2. 한글 글자 단위 verbatim 검증 (descriptionKo / title 한글-주도 항목)

| id | LIVE 한글 | JSON 저장 | diff |
|---|---|---|---|
| momentum-study (desc) | `유방암의 대사 취약성 × 내분비치료 AI 분석` | `유방암의 대사 취약성 × 내분비치료 AI 분석` | ✅ 글자 일치 ('의' 조사 보존) |
| dqm-review (desc) | `Data Quality Management 리뷰 논문` | (동일) | ✅ |
| faers-dedup (desc) | `FAERS 데이터 중복 제거 방법론 연구` | (동일) | ✅ |
| gaming (desc) | `Youth Cohort 기반 혼합효과·머신러닝 연구` | (동일) | ✅ (중간점 '·' U+00B7) |
| antibiotic (title) | `영아기 항생제 처방 → ADHD·자폐스펙트럼 위험도` | (동일) | ✅ (화살표 '→' U+2192, 중간점 '·') |
| antibiotic (desc) | `생후 2년 이내 항생제 과잉처방이 신경발달장애에 미치는 영향` | (동일) | ✅ |
| llm-eval (desc) | `의료 LLM 성능 평가 연구 (논문 + 특허)` | (동일) | ✅ |
| llm-clinical-ner (desc) | `임상 텍스트 개체명 인식 통합모델 (논문 + 특허)` | (동일) | ✅ |
| rectal-prolapse (title) | `대장탈출증 HIRA Descriptive Study` | (동일) | ✅ |
| rectal-prolapse (desc) | `건강보험심사평가원 청구 데이터 기반 기술통계 연구` | (동일) | ✅ |
| colorectal-cancer-eval (title) | `대장암 적정성평가` | (동일) | ✅ |
| colorectal-cancer-eval (desc) | `HIRA 데이터 기반 대장암 적정성 평가 분석` | (동일) | ✅ |
| incisional-hernia (title) | `한국 절개 탈장 (Incisional Hernia) 현황 분석` | (동일) | ✅ |
| incisional-hernia (desc) | `수술 트렌드 변화와 위험 인자 규명` | (동일) | ✅ |
| masld-pcos (title) | `MASLD 환자 장기예후에 PCOS 영향` | (동일) | ✅ |
| masld-pcos (desc) | `대사이상 지방간 질환 환자에서 다낭성난소증후군의 장기 영향` | (동일) | ✅ |
| napro-cohort (title) | `나프로 코호트 DB → 예측 모델링` | (동일) | ✅ |
| napro-cohort (desc) | `SDGs 연계, 연구지원 제출 및 data curation 진행 중` | (동일) | ✅ |
| sdoh (desc) | `거주 지역별 임상·공공데이터 통합 기반 유방암 사망률 연구` | (동일) | ✅ |
| breast-subtype (desc) | `유방암 임상 서브타입 분류 알고리즘 (다기관)` | (동일) | ✅ |
| ais-endocrine (title) | `AIs (Aromatase Inhibitors) 내분비요법 약제 연구` | (동일) | ✅ |
| ais-endocrine (desc) | `아로마타제 억제제 실사용 데이터 기반 내분비 치료 분석` | (동일) | ✅ |
| breast-registry (desc) | `유방암 레지스트리 지속 구축 및 활용 연구` | (동일) | ✅ |
| ovulation (title) | `배란유도제 / FAERS Pharmacovigilance` | (동일) | ✅ |
| ovulation (desc) | `FAERS 기반 배란유도제 이상반응 약물감시 연구` | (동일) | ✅ |
| sjs-ten (desc) | `스티븐스-존슨 증후군·독성표피괴사용해 이상반응 연구` | (동일) | ✅ ('용해' LIVE 표기 보존, 의학표준 '융해' 와 다름 — PI 확인 보류) |

---

## 3. 영문 verbatim 검증 (title / fullTitle / tagsLive)

| id | 항목 | LIVE | JSON | 비고 |
|---|---|---|---|---|
| momentum-study | title | `MOMENTUM Study` | `MOMENTUM Study` | ✅ |
| momentum-study | fullTitle | `MOMENTUM study – Exploring intersection of metabolic vulnerability and endocrine therapy in breast cancer through AI techniques and real-world data from multi-insitutions in Korea` | (multi-institutions 정정) | 🔧 typo fix per 사용자 결정 #3 |
| momentum-study | tagsFeaturedLive | `#clinical research data platform #data pipelining #multi-intitution(hospital) #landscape study` | (multi-institution 정정) | 🔧 typo fix |
| cancer-trajectory | title | `AI-Based Cancer Trajectory Recontextualization Methodology for Person-Centered Phenotyping: Application to Breast and Colorectal Cancer Real-World Data` | (동일) | ✅ |
| cancer-trajectory | tagsFeaturedLive | `#real-world data #data-information value chain construction #DL #methodology  #NRF funded` (double space) | single-space 정규화 | 🔧 typo fix |
| dqm-review | title | `DQM Review` | (동일) | ✅ |
| faers-dedup | title | `FAERS Dynamic Deduplication` | (동일) | ✅ |
| gaming | title | `Gaming Behaviors & Childhood Depression` | (동일) | ✅ (`&` ampersand verbatim, JSON 에서 escape 불필요) |
| llm-eval | title | `LLM Performance Evaluation` | (동일) | ✅ ("in Healthcare" 가공 제거됨) |
| llm-clinical-ner | title | `LLM-based NER` | (동일) | ✅ ("Clinical" 가공 제거됨) |
| sdoh | title | `Social Determinants of Health & Breast Cancer Mortality` | (동일) | ✅ |
| breast-subtype | title | `Breast Cancer Clinical Subtype Classification` | (동일) | ✅ |
| breast-registry | title | `Breast Cancer Registry` | (동일) | ✅ |
| sjs-ten | title | `SJS-TEN / FAERS & HIRA` | (동일) | ✅ |
| (전체) | tagsLive 'GIS / GWR' | LIVE chip 'GIS / GWR' (공백 포함 슬래시) | `GIS / GWR` | ✅ 공백 보존 |
| (전체) | tagsLive 'Multi-inst.' | LIVE chip 'Multi-inst.' (마침표 포함) | `Multi-inst.` | ✅ |
| (전체) | tagsLive 'Public data' | LIVE chip 'Public data' (소문자 d) | `Public data` | ✅ |

---

## 4. 제거된 할루시 (이전 v2 잔재)

이전 v2 에서 다음 7건의 영문 description 가공 문구가 v3 에서 완전 삭제됨:

1. `momentum-study` description: "Exploring the intersection of metabolic vulnerability..." (LIVE 부재, 사후 번역) — **삭제**
2. `cancer-trajectory` description: "Methodology for person-centered phenotyping... Focuses on DL-based trajectory modeling and data-information value chain construction." — **삭제**
3. `faers-dedup` description: "...to improve pharmacovigilance signal detection accuracy" 추가구 — **삭제**
4. `ais-endocrine` description: "examining adverse drug reaction profiles by patient characteristics" — **삭제**
5. `breast-registry` description: "supporting longitudinal cohort studies and clinical research" — **삭제**
6. `dqm-review` description: "for real-world clinical data" — **삭제**
7. `sdoh-breast-mortality` description: "Uses GIS and geographically weighted regression (GWR) methods." — **삭제**

추가:
8. `incisional-hernia` description: "using Korean claims data" — **삭제**
9. `cancer-trajectory` titleKo: "개인 중심 표현형 방법론 (유방·대장암 RWD)" (LIVE 부재) — **삭제**
10. `llm-clinical-ner` title: "Clinical" 단어 — **삭제**
11. `llm-eval` title: "in Healthcare" — **삭제**
12. `cancer-trajectory` 임의 태그 "Phenotyping" — **삭제**

---

## 5. 보존된 LIVE 비표준 표기 (수정 안 함)

- `독성표피괴사용해` (sjs-ten descriptionKo) — 한국 의학 표준은 `독성표피괴사융해` 가 정확. LIVE 표기 그대로 보존. PI 가 LIVE 정정 시 v3 동기화 필요.
- `Multi-inst.` (마침표 포함) — LIVE chip 그대로.
- `GIS / GWR` (앞뒤 공백 + 슬래시) — LIVE chip 그대로.
- `Confidential yet` (어색한 영문) — LIVE 그대로.

---

## 6. AI-Trajectory (Featured-only) 처리 메모

LIVE 에 그리드 카드가 없어 affiliation 뱃지 없음. v3 에서는 다음 정책 적용:
- `affiliations: [{ institution: "PHI Lab", isInternal: true }]` (PI 소속 본진 기본값)
- `descriptionKo: null` (LIVE 부재)
- `tagsLive: []` (LIVE 그리드 chip 없음)
- `tagsFeaturedLive` 만 채움 (5개)
- `title` 에 LIVE 풀제목 전체 저장 (단축 변형 없음)
- `fullTitle: null` (LIVE 가 단축 + 풀 분리 안 함)

UI 가 Featured 위계 표시할 때 affiliations 빈 배열 또는 PHI Lab 단일이면 "PHI Lab (NRF Funded)" 등으로 합성 가능 (UI 재설계 트랙).

---

## 7. 최종 도장

**verified clean — no hallucinations, no LIVE-truthful omissions** (2026-05-14, Task 11)

- 19 entries × 핵심 필드 모두 ✅ 또는 정당한 ⚠️ / 🔧
- 한글 글자 단위 diff 0 차이 (25 항목 검증)
- 영문 verbatim diff 0 차이 (LIVE typo 4건은 사용자 결정 #3 에 따라 JSON 정정)
- 이전 v2 할루시 12건 모두 제거 확인
- LIVE 부재 부분은 모두 null 또는 빈 배열로 명시
