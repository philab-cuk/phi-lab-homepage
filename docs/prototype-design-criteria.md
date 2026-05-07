# PHI Lab 프로토타입 디자인 기준서

> 작성: 2026-05-07  
> 상태: 골격 확정 단계 — 변주 미정

---

## 연구실 홈페이지 골격

### 철학

> "이 연구실은 어떤 연구를 하는가" — 연구자와 학생이 30초 안에 파악할 수 있어야 한다.

- 텍스트 밀도 높음: 아이콘만 있는 빈 카드 금지. 제목 + 설명이 함께.
- 가벼운 느낌 금지: 스타트업 랜딩페이지, 풀스크린 히어로 이미지, 마케팅 문구 없음
- 학술적 정보 위계: PI → 연구 축 → 프로젝트 → 논문 → 구성원
- 영문 기본: 전체 영문. 일부 프로젝트 제목은 `한국어 / English` 병기 허용 (원 사이트 방식 그대로)
- 다크모드 없음. 밝은 배경(#fff 또는 #f8fafc)이 기본.

---

### 섹션 구조 (순서 고정)

```
[01] NAV BAR          — 상단 고정, 로고 + 메뉴
[02] HERO             — 연구실 소개 / 미션 / 핵심 통계
[03] RESEARCH PILLARS — 연구 3대 축
[04] ACTIVE PROJECTS  — 주요 연구 프로젝트 (최소 6개)
[05] PUBLICATIONS     — 최근 논문 목록 (최소 8편)
[06] LAB MEMBERS      — PI 소개 + 학생 목록
[07] FOOTER           — 연락처 + 소속
```

---

### 각 섹션 콘텐츠 명세

#### [01] NAV BAR
```
왼쪽: PHI Lab (로고/텍스트)
오른쪽 메뉴: Research | Publications | Members | Lectures | About
```

#### [02] HERO
포함 내용:
- Lab name: "PHI Lab @ CUK"
- Full name: "Precision & Provenance Health Informatics Lab"
- One-line mission: "Bridging data science and implementation science for real-world evidence."
- Stats: 18 Projects / 16 Publications / 12+ Collaborating Institutions

#### [03] RESEARCH PILLARS
3개 영역, 각각 제목 + 2–3줄 설명:
```
Knowledge Representation
Data modeling, engineering, pipeline construction, management & governance

Real-World Data (RWD)
Secondary use of EHR, clinical data warehouses, FAERS

Real-World Evidence (RWE)
Scientific data processing for evidence generation and causal inference
```

#### [04] ACTIVE PROJECTS
최소 6개, 각 항목에 반드시:
- 프로젝트 제목 (영문 필수, 한글 제목 병기 허용)
- 관련 기관
- 태그 (예: RWD · ML · Multi-inst.)

필수 포함 프로젝트:
1. MOMENTUM Study — AI + RWD, breast cancer, Samsung Medical Center · Kakao Healthcare
2. AI-Based Cancer Trajectory Recontextualization — NRF funded, colorectal & breast cancer phenotyping
3. LLM-based Clinical NER — Named entity recognition for clinical text, patent filed, Kakao Healthcare
4. FAERS Dynamic Deduplication — Pharmacovigilance methodology, FDA AERS deduplication
5. SJS-TEN Pharmacovigilance — Stevens-Johnson Syndrome adverse drug reaction study (FAERS + HIRA)
6. Social Determinants & Breast Cancer Mortality — GIS/GWR, U. Cincinnati · Harvard · Tufts · SKKU

#### [05] PUBLICATIONS
최근 8편 이상, 연도 역순 정렬.  
각 항목: `Authors (PI 이름 굵게). "Title." Journal, Year. [링크]`  
섹션 하단: "View all publications →" 링크.

필수 포함 (최신 5편):
1. Choo H, …, **Kim HJ**. "Enhancing COVID-19 Screening Models…" *JMIR AI*, 2026.
2. Kim MJ, **Kim HJ**, …, Park YH. "Effectiveness of Adjuvant Capecitabine…" *Clinical Breast Cancer*, 2025.
3. **Kim HJ**†, Yoon JH†, Lee KH. "Safety Profile of Fast-Track COVID-19 Drugs…" *Pharmacoepidemiology Drug Safety*, 2024.
4. **Kim HJ**†, Yoon JH†, Park YH. "Trastuzumab Emtansine Hepatobiliary…" *Scientific Reports*, 2024.
5. Kang D, Park S, **Kim HJ**, …, Park YH. "CHARM cohort profile…" *Breast Cancer*, 2024.

#### [06] LAB MEMBERS
PI 블록:
```
Hyo Jung Kim, PhD
Assistant Professor
Department of Biomedical Software Engineering
The Catholic University of Korea
hyojung.kim@catholic.ac.kr
```

학부 연구원:
Jun Seok Her / Jin Woo Yoo / Eun Jin Jeong / Yeseo Lee / Eun Ji Kim / Sang Min Lim / Jae Hyeok Han

#### [07] FOOTER
```
PHI Lab @ CUK — Precision & Provenance Health Informatics Lab
43, Jibong-ro, Bucheon, 14662, Gyeonggi-do, South Korea
hyojung.kim@catholic.ac.kr
© 2026 PHI Lab. All rights reserved.
```

---

### 기술 스택 (공통)

- 순수 HTML + Tailwind CSS CDN
- 외부 JS 라이브러리 없음
- 데스크탑 기준 (1280–1440px), 반응형 불필요

---

### 콘텐츠 체크리스트 (빌드 후 확인)

- [ ] 섹션 7개 전부 있음
- [ ] Projects 6개 이상 실제 PHI Lab 프로젝트
- [ ] Publications 8편 이상 실제 논문 (저자·제목·저널·연도)
- [ ] PI 정보 완전 (이름·직책·소속·이메일)
- [ ] Members 7명 이름 모두 포함
- [ ] 한국어 설명 없음 (제목 한/영 병기는 허용)
- [ ] 다크 배경 없음
- [ ] Tailwind CDN 로드 확인

---

*변주(15라운드 파라미터) 미정 — 실제 연구실 사이트 분석 후 추가 예정*
