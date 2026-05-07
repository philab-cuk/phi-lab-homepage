# PHI Lab 프로토타입 디자인 기준서 v2

> 작성: 2026-05-07  
> 목적: 연구실 홈페이지 골격을 먼저 정의하고, 그 안에서 15가지 변주를 명세

---

## 1. 연구실 홈페이지 골격 (모든 라운드 공통)

### 1-1. 철학

> "이 연구실은 어떤 연구를 하는가" — 연구자와 학생이 30초 안에 파악할 수 있어야 한다.

- 텍스트 밀도 높음: 아이콘만 있는 빈 카드 금지. 제목 + 설명이 함께.
- 가벼운 느낌 금지: 스타트업 랜딩페이지, 풀스크린 히어로 이미지, 마케팅 문구 없음
- 학술적 정보 위계: PI → 연구 축 → 프로젝트 → 논문 → 구성원
- 영문 기본: 전체 영문. 일부 프로젝트 제목은 `한국어 / English` 병기 허용 (원 사이트 방식 그대로)
- 다크모드 없음. 밝은 배경(#fff 또는 #f8fafc)이 기본.

### 1-2. 섹션 구조 (순서 고정)

```
[01] NAV BAR          — 상단 고정, 로고 + 메뉴
[02] HERO             — 라운드별 변주 (아래 Hero Variants 참고)
[03] RESEARCH PILLARS — 연구 3대 축
[04] ACTIVE PROJECTS  — 주요 연구 프로젝트 (최소 6개)
[05] PUBLICATIONS     — 최근 논문 목록 (최소 8편)
[06] LAB MEMBERS      — PI 소개 + 학생 목록
[07] FOOTER           — 연락처 + 소속
```

### 1-3. 각 섹션 공통 콘텐츠 명세

#### [01] NAV BAR
```
왼쪽: PHI Lab (로고/텍스트)
오른쪽 메뉴: Research | Publications | Members | Lectures | About
배경: 흰색 또는 accent 색상 (라운드별 다름)
```

#### [02] HERO
- 라운드별 5가지 유형 중 하나 적용 (섹션 2 참조)
- 공통 포함 내용:
  - Lab name: "PHI Lab @ CUK"
  - Full name: "Precision & Provenance Health Informatics Lab"
  - One-line mission: "Bridging data science and implementation science for real-world evidence."
  - Stats: 18 Projects / 16 Publications / 12+ Collaborating Institutions

#### [03] RESEARCH PILLARS
3개 컬럼 또는 블록, 각각:
```
Knowledge Representation
Data modeling, engineering, pipeline construction, management & governance

Real-World Data (RWD)
Secondary use of EHR, clinical data warehouses, FAERS

Real-World Evidence (RWE)
Scientific data processing for evidence generation and causal inference
```

#### [04] ACTIVE PROJECTS
최소 6개 프로젝트, 각 항목에 반드시:
- 프로젝트 제목 (영문 필수, 한글 병기 허용)
- 관련 기관 (예: Samsung Medical Center, NRF, Kakao Healthcare)
- 태그 (예: RWD · ML · Multi-inst.)

필수 포함 프로젝트:
1. MOMENTUM Study — AI + RWD, breast cancer, Samsung Medical Center · Kakao Healthcare
2. AI-Based Cancer Trajectory Recontextualization — NRF funded, colorectal & breast cancer phenotyping
3. LLM-based Clinical NER — Named entity recognition for clinical text, patent filed, Kakao Healthcare
4. FAERS Dynamic Deduplication — Pharmacovigilance methodology, deduplication of FDA AERS data
5. SJS-TEN Pharmacovigilance — Stevens-Johnson Syndrome adverse drug reaction study (FAERS + HIRA)
6. Social Determinants & Breast Cancer Mortality — GIS/GWR, U. Cincinnati · Harvard · Tufts · SKKU

#### [05] PUBLICATIONS
최근 8편 이상, 각 항목:
```
[번호]. Author(s). "Title." Journal, Vol(Issue), Year. [PubMed 링크]
```
PI(Kim HJ) 이름 굵게 강조.  
연도 역순 정렬.  
섹션 하단: "View all publications →" 링크.

반드시 포함 (최신 5편):
1. Choo H, Lee D, …, Kim HJ. "Enhancing COVID-19 Screening Models…" JMIR AI, 2026.
2. Kim MJ, Kim HJ, …, Park YH. "Effectiveness of Adjuvant Capecitabine…" Clinical Breast Cancer, 2025.
3. Kim HJ†, Yoon JH†, Lee KH. "Safety Profile of Fast-Track COVID-19 Drugs…" Pharmacoepidemiology Drug Safety, 2024.
4. Kim HJ†, Yoon JH†, Park YH. "Trastuzumab Emtansine Hepatobiliary…" Scientific Reports, 2024.
5. Kang D, Park S, Kim HJ, …, Park YH. "CHARM cohort profile…" Breast Cancer, 2024.

#### [06] LAB MEMBERS
PI 블록:
```
Hyo Jung Kim, PhD
Assistant Professor
Department of Biomedical Software Engineering
The Catholic University of Korea
hyojung.kim@catholic.ac.kr
```

학부 연구원 목록 (이름 + 관심 분야):
- Jun Seok Her
- Jin Woo Yoo
- Eun Jin Jeong
- Yeseo Lee
- Eun Ji Kim
- Sang Min Lim
- Jae Hyeok Han

#### [07] FOOTER
```
PHI Lab @ CUK — Precision & Provenance Health Informatics Lab
43, Jibong-ro, Bucheon, 14662, Gyeonggi-do, South Korea
hyojung.kim@catholic.ac.kr
© 2026 PHI Lab. All rights reserved.
```

---

## 2. 변주 파라미터 정의

### 2-1. Hero 유형 (5가지)

#### Hero-A: 텍스트 전용 헤더
```
- 배경: 흰색 또는 매우 연한 배경
- 왼쪽 정렬 또는 중앙 정렬 텍스트 블록
- Lab name (H1, 대형) → Full name (H2, 소형) → Mission (p) → Stats bar (3개 숫자)
- 이미지 없음, 그래픽 없음
- 높이: 280–340px
```

#### Hero-B: Split 레이아웃 (60/40)
```
- 왼쪽 60%: Lab name + mission + stats
- 오른쪽 40%: accent 색상 배경 블록 (숫자/키워드 강조)
- 높이: 300–360px
- 이미지 없음
```

#### Hero-C: Accent 배너
```
- 배경: accent 색상 (진한 버전)
- 텍스트: 흰색
- 내용: Lab name (H1) + Mission (p) + Stats 3개
- 높이: 320–400px
- 하단 흰 콘텐츠로 자연스럽게 전환
```

#### Hero-D: 즉시 콘텐츠 (히어로 없음)
```
- 히어로 섹션 생략
- NAV 아래 바로 "About" 텍스트 단락 + Research Pillars 시작
- 학술 논문 스타일 — 상단에 연구실 소개 단락 하나만
```

#### Hero-E: 중앙 정렬 + 수평선 강조
```
- 배경: 흰색
- 중앙 정렬: 위에 수평선 → Lab name (대형 H1) → Mission → 아래 수평선
- Stats bar 좌측/우측/가운데 중 하나
- 높이: 260–320px
```

---

### 2-2. 레이아웃 유형 (3가지)

#### Layout-1: 단일 중앙 컬럼
```
- 최대 너비 1100px, 중앙 정렬
- 각 섹션: 전체 너비 사용
- Projects: 2–3열 카드 그리드
- Publications: 1열 리스트
```

#### Layout-2: 좌측 사이드바 고정
```
- 좌측 사이드바 240px (고정): 로고 + 메뉴 + PI 약력 + 연락처
- 우측 메인 콘텐츠: 나머지 너비
- NAV BAR 없음 (사이드바가 대신함)
- Projects: 2열 그리드
- Publications: 1열 리스트
```

#### Layout-3: 2컬럼 분할 콘텐츠
```
- 최대 너비 1200px
- 일부 섹션에서 좌/우 컬럼 분할 사용:
  - HERO: 전체 너비
  - PILLARS: 3열
  - PROJECTS: 좌 2/3 메인 카드 + 우 1/3 협력기관 사이드
  - PUBLICATIONS: 좌 2/3 논문 리스트 + 우 1/3 필터/통계
  - MEMBERS: 전체 너비
```

---

### 2-3. 색상 팔레트 (15가지 — 전문적·학술적 범위)

각 라운드는 accent 색 1개를 지정. 나머지 색상 규칙:
- 본문 배경: `#ffffff` 또는 `#f8fafc`
- 텍스트: `#111827` (제목) / `#374151` (본문) / `#6b7280` (보조)
- 카드 배경: `#f9fafb`
- 카드 보더: `#e5e7eb`
- 링크: accent 색상

| # | 이름 | Accent Hex | 사용 위치 |
|---|------|-----------|---------|
| 1 | Academic Blue | `#1e40af` | NAV, section 제목 하이라이트, 링크 |
| 2 | Royal Navy | `#1e3a5f` | NAV 배경(흰텍스트), 섹션 헤더 |
| 3 | Forest Green | `#14532d` | NAV, 강조 요소 |
| 4 | Burgundy | `#7f1d1d` | NAV, 섹션 레이블 |
| 5 | Deep Teal | `#134e4a` | NAV, 카드 border-top |
| 6 | Indigo | `#3730a3` | NAV, 태그 배경 |
| 7 | Charcoal | `#1f2937` | NAV 배경(흰텍스트), 섹션 헤더 |
| 8 | Rust Brown | `#7c2d12` | NAV, 강조 선 |
| 9 | Deep Violet | `#4c1d95` | NAV, 히어로 accent |
| 10 | Sage Green | `#3f6212` | NAV, 섹션 제목 |
| 11 | Steel Blue | `#0369a1` | NAV, 링크, 태그 |
| 12 | Dark Slate | `#1e293b` | NAV 배경, 헤더 |
| 13 | Olive | `#365314` | NAV, 강조 요소 |
| 14 | Deep Plum | `#581c87` | NAV, 카드 accent |
| 15 | Stone | `#44403c` | NAV, 섹션 구분선 |

---

### 2-4. 폰트 조합 (5가지, 3라운드씩 재사용)

#### Font-A: Pretendard (현대 한국 sans-serif)
```html
<link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" rel="stylesheet">
font-family: 'Pretendard', -apple-system, sans-serif;
제목: font-weight 700–800 / 본문: font-weight 400–500
```

#### Font-B: Inter (국제 표준 sans-serif)
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
font-family: 'Inter', sans-serif;
제목: font-weight 700 / 본문: font-weight 400
```

#### Font-C: Noto Sans KR + Noto Serif KR (한/영 최적화)
```html
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;600;700&family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet">
제목: 'Noto Serif KR' (serif) / 본문: 'Noto Sans KR' (sans)
```

#### Font-D: Source Sans Pro + Merriweather (학술 클래식)
```html
<link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;600;700&family=Merriweather:wght@400;700&display=swap" rel="stylesheet">
제목: 'Merriweather' (serif) / 본문: 'Source Sans 3' (sans)
```

#### Font-E: IBM Plex Sans (기술적/데이터 중심)
```html
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
font-family: 'IBM Plex Sans', sans-serif;
제목: font-weight 600–700 / 본문: font-weight 400
```

---

## 3. 15라운드 파라미터 테이블

| Round | Accent | Font | Layout | Hero | Nav 배경 |
|-------|--------|------|--------|------|---------|
| R01 | Academic Blue `#1e40af` | Font-B (Inter) | Layout-1 | Hero-A | 흰색 + 파랑 텍스트 |
| R02 | Royal Navy `#1e3a5f` | Font-B (Inter) | Layout-1 | Hero-C | Navy 배경 + 흰 텍스트 |
| R03 | Forest Green `#14532d` | Font-D (Merriweather) | Layout-1 | Hero-D | 흰색 + 초록 텍스트 |
| R04 | Burgundy `#7f1d1d` | Font-C (Noto Serif KR) | Layout-1 | Hero-E | 흰색 + 버건디 텍스트 |
| R05 | Deep Teal `#134e4a` | Font-A (Pretendard) | Layout-2 | — | Teal 사이드바 |
| R06 | Indigo `#3730a3` | Font-E (IBM Plex) | Layout-1 | Hero-B | 흰색 + 인디고 텍스트 |
| R07 | Charcoal `#1f2937` | Font-A (Pretendard) | Layout-1 | Hero-C | Charcoal 배경 + 흰 텍스트 |
| R08 | Rust Brown `#7c2d12` | Font-D (Merriweather) | Layout-3 | Hero-A | 흰색 + Rust 텍스트 |
| R09 | Deep Violet `#4c1d95` | Font-B (Inter) | Layout-2 | — | Violet 사이드바 |
| R10 | Sage Green `#3f6212` | Font-C (Noto Serif KR) | Layout-1 | Hero-E | 흰색 + Sage 텍스트 |
| R11 | Steel Blue `#0369a1` | Font-E (IBM Plex) | Layout-3 | Hero-B | Steel Blue 배경 + 흰 텍스트 |
| R12 | Dark Slate `#1e293b` | Font-A (Pretendard) | Layout-1 | Hero-C | Slate 배경 + 흰 텍스트 |
| R13 | Olive `#365314` | Font-D (Merriweather) | Layout-3 | Hero-A | 흰색 + Olive 텍스트 |
| R14 | Deep Plum `#581c87` | Font-B (Inter) | Layout-1 | Hero-E | 흰색 + Plum 텍스트 |
| R15 | Stone `#44403c` | Font-C (Noto Serif KR) | Layout-2 | — | Stone 사이드바 |

> Layout-2(사이드바)는 Hero 없음 — 사이드바가 PI 정보를 담당.

---

## 4. 카드 스타일 규칙

Projects 카드, Publications 아이템에 적용:

### Card-A (보더형): Layout-1 기본
```css
background: #f9fafb;
border: 1px solid #e5e7eb;
border-top: 3px solid [accent];
border-radius: 4px;
padding: 20px 24px;
```

### Card-B (섀도형): Layout-3 기본
```css
background: #ffffff;
box-shadow: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06);
border-radius: 6px;
padding: 20px 24px;
```

### Card-C (플랫형): Layout-2 사이드바 레이아웃 기본
```css
background: transparent;
border-bottom: 1px solid #e5e7eb;
border-radius: 0;
padding: 16px 0;
```

---

## 5. 공통 타이포그래피 스케일

| 요소 | 크기 | 굵기 | 색상 |
|------|------|------|------|
| H1 (Lab name in hero) | 2.5rem–3rem | 800 | #111827 또는 흰색 |
| H2 (Section title) | 1.5rem–1.875rem | 700 | #111827 |
| H3 (Card title) | 1.125rem–1.25rem | 600 | #111827 |
| Body | 0.9375rem–1rem | 400 | #374151 |
| Small/Meta | 0.8125rem–0.875rem | 400 | #6b7280 |
| Tag/Badge | 0.75rem | 500 | accent 색상 배경 또는 보더 |

섹션 제목(H2) 아래: accent 색상 밑줄 또는 왼쪽 accent 라인 (`border-left: 3px solid [accent]`) 사용.

---

## 6. 기술 스택 (공통)

```html
<!-- Tailwind CSS CDN -->
<script src="https://cdn.tailwindcss.com"></script>

<!-- 각 라운드별 폰트 CDN (섹션 2-4 참조) -->

<!-- 아이콘: Heroicons SVG inline (외부 라이브러리 없음) -->
<!-- 이미지: placeholder 사용 (실제 사진 없음) -->
```

- 순수 HTML + Tailwind CDN + CSS custom properties
- JavaScript: 네비게이션 모바일 토글, 탭 전환 등 최소한으로
- 외부 JS 라이브러리 없음
- 반응형 불필요 (데스크탑 1280–1440px 기준)

---

## 7. 체크리스트 (빌드 전/후 확인)

**빌드 전:**
- [ ] 해당 라운드 파라미터 테이블 확인 (색상 / 폰트 / 레이아웃 / 히어로)
- [ ] 골격 섹션 7개 모두 구현 계획 수립

**빌드 후:**
- [ ] 섹션 7개 전부 있음
- [ ] Projects 6개 이상 실제 PHI Lab 프로젝트
- [ ] Publications 8편 이상 실제 논문 (저자·제목·저널·연도)
- [ ] PI 정보 완전 (이름·직책·소속·이메일)
- [ ] Members 7명 이름 모두 포함
- [ ] 한국어 설명 없음 (제목 한/영 병기는 허용)
- [ ] 다크 배경 없음 (Nav accent 배경 제외)
- [ ] Tailwind CDN + 지정 폰트 CDN 로드 확인
