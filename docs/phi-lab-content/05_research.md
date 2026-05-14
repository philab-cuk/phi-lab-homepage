# PHI Lab — Current Research (LIVE verbatim snapshot)

**Source URL:** https://philabcuk.org/contact/
*(LIVE URL says `/contact/` but the page label is "Current Research".)*

**Re-crawled:** 2026-05-14 (raw HTML inspected; `phi-card` divs extracted verbatim)

> All text on this page is byte-for-byte verbatim from LIVE. LIVE typos
> (e.g. `multi-insitutions`, `multi-intitution`) and Korean particles are
> preserved as written. Do **not** correct or paraphrase.

---

## Page Navigation (LIVE top menu)

- Professor
- Publication
- Lecture
- Current Research
- About Lab
- Members

## Page Heading

```
Current Research
```
*(single `<h1 class="entry-title">`)*

---

## Filter Bar (LIVE buttons + data-inst keys)

The page has a JavaScript filter bar above the grid. Each button has a data-inst key (in Korean shorthand) and a visible label:

| Filter key (`data-inst`) | Visible label |
|---|---|
| `all` | All |
| `연구실` | PHI Lab |
| `카카오` | 카카오헬스케어 |
| `은평성모` | 은평성모병원 |
| `부천성모` | 부천성모병원 |
| `삼성서울` | 삼성서울병원 |
| `숙명여대` | 숙명여자대학교 |
| `전남대` | 전남대학교 |
| `rwd` | RWD / HIRA *(data-source filter, not institution)* |

Note: cards with `data-inst="가톨릭"` exist (영아기 항생제) but **no filter button** for 가톨릭. Those cards are visible only under `All`.

---

## Featured / Major Research Initiatives (above the grid)

Both items rendered as `<p class="wp-block-paragraph"><strong>...</strong></p>` with tags+meta on the following paragraph.

### 1. MOMENTUM study

**LIVE bold paragraph (verbatim — preserve "multi-insitutions" typo):**
> MOMENTUM study – Exploring intersection of metabolic vulnerability and endocrine therapy in breast cancer through AI techniques and real-world data from multi-insitutions in Korea

**LIVE tags + meta paragraph (verbatim — preserve "multi-intitution" typo and "(hospital)" with no preceding space):**
> #clinical research data platform #data pipelining #multi-intitution(hospital) #landscape study *Participating Institutions: Confidential yet*

*(The "Participating Institutions: Confidential yet" portion is wrapped in `<em>` italics on LIVE.)*

### 2. AI-Based Cancer Trajectory Recontextualization Methodology

**LIVE bold paragraph (verbatim — full English title, no Korean subtitle on LIVE):**
> AI-Based Cancer Trajectory Recontextualization Methodology for Person-Centered Phenotyping: Application to Breast and Colorectal Cancer Real-World Data

**LIVE tags paragraph (verbatim — preserve double space between `#methodology` and `#NRF funded`):**
> #real-world data #data-information value chain construction #DL #methodology  #NRF funded

---

## Grid Cards (`phi-card` divs, in DOM order)

18 cards total. Each card shape: institution badge(s) → title (English and/or Korean) → Korean subtitle/description → tag chips → optional `phi-collab` meta line.

### Card 1 — PHI Lab — DQM Review

- `data-inst`: `연구실` · `data-tags`: `rwd`
- **Badge:** `PHI Lab`
- **Title:** `DQM Review`
- **Body (KO):** `Data Quality Management 리뷰 논문`
- **Tags:** `RWD` `Data Quality`

### Card 2 — PHI Lab — FAERS Dynamic Deduplication

- `data-inst`: `연구실` · `data-tags`: `faers rwd`
- **Badge:** `PHI Lab`
- **Title:** `FAERS Dynamic Deduplication`
- **Body (KO):** `FAERS 데이터 중복 제거 방법론 연구`
- **Tags:** `FAERS` `RWD` `Pharmacovigilance`

### Card 3 — PHI Lab — Gaming Behaviors & Childhood Depression

- `data-inst`: `연구실` · `data-tags`: `ml`
- **Badge:** `PHI Lab`
- **Title:** `Gaming Behaviors & Childhood Depression`
- **Body (KO):** `Youth Cohort 기반 혼합효과·머신러닝 연구`
- **Tags:** `ML` `Mixed-Effects` `Cohort`

### Card 4 — 가톨릭 · 의생명학과 — 영아기 항생제

- `data-inst`: `가톨릭` · `data-tags`: `ml`
- **Badge:** `가톨릭 · 의생명학과`
- **Title (KO):** `영아기 항생제 처방 → ADHD·자폐스펙트럼 위험도`
- **Body (KO):** `생후 2년 이내 항생제 과잉처방이 신경발달장애에 미치는 영향`
- **Tags:** `ML` `Pediatrics` `ADHD`

### Card 5 — 카카오헬스케어 — LLM Performance Evaluation

- `data-inst`: `카카오` · `data-tags`: `llm`
- **Badge:** `카카오헬스케어`
- **Title:** `LLM Performance Evaluation`
- **Body (KO):** `의료 LLM 성능 평가 연구 (논문 + 특허)`
- **Tags:** `LLM` `NLP` `Eval`

### Card 6 — 카카오헬스케어 — LLM-based NER

- `data-inst`: `카카오` · `data-tags`: `llm`
- **Badge:** `카카오헬스케어`
- **Title:** `LLM-based NER`
- **Body (KO):** `임상 텍스트 개체명 인식 통합모델 (논문 + 특허)`
- **Tags:** `LLM` `NER` `Patent`

### Card 7 — 은평성모 · 대장혈관외과 — 대장탈출증 HIRA

- `data-inst`: `은평성모` · `data-tags`: `hira rwd`
- **Badge:** `은평성모 · 대장혈관외과`
- **Title:** `대장탈출증 HIRA Descriptive Study`
- **Body (KO):** `건강보험심사평가원 청구 데이터 기반 기술통계 연구`
- **Tags:** `HIRA` `RWD` `Colorectal`

### Card 8 — 은평성모 · 대장혈관외과 — 대장암 적정성평가

- `data-inst`: `은평성모` · `data-tags`: `hira rwd`
- **Badge:** `은평성모 · 대장혈관외과`
- **Title (KO):** `대장암 적정성평가`
- **Body (KO):** `HIRA 데이터 기반 대장암 적정성 평가 분석`
- **Tags:** `HIRA` `RWD` `Colorectal Cancer`

### Card 9 — 은평성모 · 위장관외과 — 한국 절개 탈장

- `data-inst`: `은평성모` · `data-tags`: `hira rwd`
- **Badge:** `은평성모 · 위장관외과`
- **Title (KO/EN):** `한국 절개 탈장 (Incisional Hernia) 현황 분석`
- **Body (KO):** `수술 트렌드 변화와 위험 인자 규명`
- **Tags:** `HIRA` `RWD` `Surgery Trend`

### Card 10 — 은평성모 · 소화기내과 — MASLD × PCOS

- `data-inst`: `은평성모` · `data-tags`: `rwd`
- **Badge:** `은평성모 · 소화기내과`
- **Title (KO):** `MASLD 환자 장기예후에 PCOS 영향`
- **Body (KO):** `대사이상 지방간 질환 환자에서 다낭성난소증후군의 장기 영향`
- **Tags:** `RWD` `Hepatology` `PCOS`

### Card 11 — 부천성모 · 산부인과 — 나프로 코호트 DB

- `data-inst`: `부천성모` · `data-tags`: `rwd ml`
- **Badge:** `부천성모 · 산부인과`
- **Title (KO):** `나프로 코호트 DB → 예측 모델링`
- **Body (KO):** `SDGs 연계, 연구지원 제출 및 data curation 진행 중`
- **Tags:** `RWD` `ML` `Cohort` `SDGs`

### Card 12 — 삼성서울 + 카카오 (DUAL BADGE) — MOMENTUM Study

- `data-inst`: `삼성서울` · `data-tags`: `rwd ml`
- **Badges (TWO, in this order):** `삼성서울 · 혈액종양내과` AND `카카오헬스케어`
- **Title:** `MOMENTUM Study`
- **Body (KO):** `유방암의 대사 취약성 × 내분비치료 AI 분석` *(note: '유방암**의**' with 의 particle)*
- **Tags:** `RWD` `ML` `Multi-inst.` `Breast Cancer`
- **`phi-collab` meta line:** `Participating Institutions: Confidential yet`

*(This card is the in-grid representation of the Featured MOMENTUM item above. LIVE renders MOMENTUM twice on the page — once Featured at top with English title + LIVE-typo tags, once here in the grid with Korean subtitle + cleaner tag chips.)*

### Card 13 — 삼성서울 · 혈액종양내과 — Social Determinants & Breast Cancer Mortality

- `data-inst`: `삼성서울` · `data-tags`: `rwd ml`
- **Badge:** `삼성서울 · 혈액종양내과`
- **Title:** `Social Determinants of Health & Breast Cancer Mortality`
- **Body (KO):** `거주 지역별 임상·공공데이터 통합 기반 유방암 사망률 연구`
- **Tags:** `RWD` `Multi-inst.` `GIS / GWR` `Public data`
- **`phi-collab` meta line (verbatim, abbreviated names):** `U. of Cincinnati · Harvard Univ. · Tufts Univ. · Samsung MC · SKKU`

### Card 14 — 삼성서울 · 혈액종양내과 — Breast Cancer Clinical Subtype Classification

- `data-inst`: `삼성서울` · `data-tags`: `rwd ml`
- **Badge:** `삼성서울 · 혈액종양내과`
- **Title:** `Breast Cancer Clinical Subtype Classification`
- **Body (KO):** `유방암 임상 서브타입 분류 알고리즘 (다기관)`
- **Tags:** `ML` `RWD` `Multi-inst.` `Breast Cancer`

### Card 15 — 삼성서울 · 혈액종양내과 — AIs Endocrine

- `data-inst`: `삼성서울` · `data-tags`: `rwd`
- **Badge:** `삼성서울 · 혈액종양내과`
- **Title (KO/EN):** `AIs (Aromatase Inhibitors) 내분비요법 약제 연구`
- **Body (KO):** `아로마타제 억제제 실사용 데이터 기반 내분비 치료 분석`
- **Tags:** `RWD` `Endocrine Therapy` `Breast Cancer` `AIs`

### Card 16 — 삼성서울 · 혈액종양내과 — Breast Cancer Registry

- `data-inst`: `삼성서울` · `data-tags`: `rwd`
- **Badge:** `삼성서울 · 혈액종양내과`
- **Title:** `Breast Cancer Registry`
- **Body (KO):** `유방암 레지스트리 지속 구축 및 활용 연구`
- **Tags:** `RWD` `Registry` `Breast Cancer`

### Card 17 — 숙명여대 · 약학대학 — 배란유도제 / FAERS

- `data-inst`: `숙명여대` · `data-tags`: `faers rwd`
- **Badge:** `숙명여대 · 약학대학`
- **Title (KO/EN):** `배란유도제 / FAERS Pharmacovigilance`
- **Body (KO):** `FAERS 기반 배란유도제 이상반응 약물감시 연구`
- **Tags:** `FAERS` `RWD` `Pharmacovigilance`

### Card 18 — 전남대 · 간호대학 — SJS-TEN / FAERS & HIRA

- `data-inst`: `전남대` · `data-tags`: `faers hira rwd`
- **Badge:** `전남대 · 간호대학`
- **Title:** `SJS-TEN / FAERS & HIRA`
- **Body (KO — preserve LIVE's "독성표피괴사용해" spelling):** `스티븐스-존슨 증후군·독성표피괴사용해 이상반응 연구`
- **Tags:** `FAERS` `HIRA` `RWD` `SJS-TEN`

---

## Page Footer (verbatim)

```
PHI Lab @ CUK
워드프레스닷컴에서 웹사이트 또는 블로그 만들기
홈
```

---

## LIVE Quirks to Preserve (do NOT correct)

1. **`multi-insitutions`** (missing 't') — in Featured MOMENTUM body line.
2. **`multi-intitution(hospital)`** (missing 'st' + no space before paren) — in Featured MOMENTUM tag list.
3. **Double space** between `#methodology` and `#NRF funded` in AI-Trajectory tags.
4. **`독성표피괴사용해`** — Korean Medical standard term is `독성표피괴사융해` (TEN); LIVE writes `용해`. Preserve LIVE.
5. **MOMENTUM appears twice on LIVE** — Featured paragraph (English-only, with typo tags) + Grid card 12 (Korean body, clean tags, dual institution badge).
6. **No 가톨릭 filter button** despite 가톨릭 data-inst cards existing. Filter coverage is incomplete on LIVE.
7. **Featured items have NO institution badge** (rendered as free-floating bold paragraphs above the grid).
8. **`phi-collab` line on SDoH** uses heavily abbreviated names (`U. of Cincinnati`, `Samsung MC`, `SKKU`) — NOT the full names "University of Cincinnati", "Samsung Medical Center", "Sungkyunkwan University".
9. **AI-Trajectory has no Korean subtitle** on LIVE — only the English full title is shown.

---

## LIVE → research.json entry count

LIVE displays **20 distinct project surfaces** (2 Featured paragraphs + 18 grid cards). MOMENTUM occupies 2 of those surfaces (Featured + Card 12). AI-Trajectory occupies 1 (Featured only — no grid card).

So **unique projects = 19** in JSON terms:
- Featured-only: AI-Trajectory (1)
- Featured + Card: MOMENTUM (1, dual-surfaced)
- Card-only: 17

---

## Tags glossary (observed across LIVE)

| Tag | Source | Notes |
|---|---|---|
| `RWD` | Real-World Data | most common, has CSS class `phi-tag rwd` |
| `HIRA` | Korean claims data | CSS class `phi-tag hira` |
| `FAERS` | FDA Adverse Event Reporting System | CSS class `phi-tag faers` |
| `ML` | Machine Learning | CSS class `phi-tag ml` |
| `DL` | Deep Learning | only in Featured AI-Trajectory tags |
| `LLM` | Large Language Model | CSS class `phi-tag llm` |
| `NER` `NLP` `Eval` `Patent` | LLM-related |  |
| `Cohort` `Mixed-Effects` `Pediatrics` `ADHD` | study design / domain |  |
| `Multi-inst.` | multi-institution | CSS class `phi-tag multi` |
| `GIS / GWR` | Geographic methods | tag chip contains spaces and slash |
| `Public data` `Registry` `Pharmacovigilance` | data type |  |
| `Colorectal` `Colorectal Cancer` `Surgery Trend` `Hepatology` `PCOS` `Endocrine Therapy` `AIs` `Breast Cancer` `SJS-TEN` `SDGs` `Data Quality` | domain |  |
| Featured-only tag set | `clinical research data platform`, `data pipelining`, `multi-intitution(hospital)`, `landscape study`, `real-world data`, `data-information value chain construction`, `methodology`, `NRF funded` | longer phrases with spaces |

---

## Resolved suspicion list (from Task 8 spec)

| Question | LIVE answer |
|---|---|
| MOMENTUM titleKo: '유방암**의** 대사' or '유방암 대사' | `유방암의 대사 취약성 × 내분비치료 AI 분석` (의 particle present) |
| AI-Trajectory full title exact form | `AI-Based Cancer Trajectory Recontextualization Methodology for Person-Centered Phenotyping: Application to Breast and Colorectal Cancer Real-World Data` (single sentence, colon after "Phenotyping", no period at end on LIVE) |
| LLM-NER LIVE title | `LLM-based NER` (no "Clinical") |
| LLM-Eval LIVE title | `LLM Performance Evaluation` (no "in Healthcare") |
| SJS-TEN Korean spelling | `독성표피괴사용해` (LIVE spelling — keep) |
| English description on cards | LIVE has **NO English descriptions** on grid cards (only English titles + Korean subtitles). Current research.json's `description` strings are all post-hoc translations/paraphrases — **all "descriptionEn" should be null** in v3 (Korean is the source of truth). |

---

## Schema implications for research.json v3 (carry-over to Task 9)

- `descriptionEn` should default to `null` for grid cards (LIVE has none).
- `tagsLive` should be array of LIVE tag chip strings exactly (spaces, dots, slashes preserved).
- `featured` true ⇔ item appears in Featured paragraphs (MOMENTUM, AI-Trajectory).
- `affiliation` must support **multiple badges** (MOMENTUM = 삼성서울 + 카카오).
- `notes` field needed for `phi-collab` meta line (MOMENTUM's "Confidential yet", SDoH's abbreviated collaborator list).
- `fullTitle` only present on Featured items (LIVE shows abbreviated grid title separately).
- Featured-tag set (`clinical research data platform` etc.) is a SEPARATE LIVE tag namespace from grid `tagsLive` — for MOMENTUM, capture **both**: `tagsFeaturedLive` for Featured paragraph tags, `tagsLive` for grid card chip tags.
