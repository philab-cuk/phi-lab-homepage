# PHI Lab 프로토타입 디자인 기준서

> 작성: 2026-05-07  
> 목적: 15개 프로토타입 각각의 디자인 방향을 사전에 명확히 정의해 작업 일관성 확보

---

## 공통 원칙 — "실제 연구실 느낌"을 위한 기준

아래 원칙은 모든 라운드에 적용됩니다.

| 원칙 | 구체적 지침 |
|------|-----------|
| 콘텐츠 밀도 | 텍스트가 충분히 있어야 함. 빈 공간만 가득한 스타트업 스타일 지양 |
| Publications 비중 | Publications(논문 목록)는 반드시 독립 섹션으로, 최소 5편 이상 표시 |
| PI 프로필 | 교수 이름·직책·약력·연구관심사가 명확히 드러나야 함 |
| 연구 프로젝트 | 단순 아이콘 카드만 아닌, 제목과 설명이 보이는 실제 프로젝트 정보 |
| 연구실 정체성 | PHI Lab @ CUK, 가톨릭대학교, 이메일 노출 필수 |
| 한/영 혼용 | 프로젝트명은 영문, 한국어 설명 병기 허용 |
| 반응형 불필요 | 데스크탑 뷰만 구현 (1200–1440px 기준) |

---

## 라운드별 디자인 명세

---

### R01 — SNU SPINS 스타일 ✅ 완료
**참고:** spins.snu.ac.kr

| 항목 | 명세 |
|------|------|
| 색상 | Primary: #1e40af (파랑), Secondary: #1e3a8a, Background: #f8fafc |
| 폰트 | 제목: Playfair Display, 본문: Inter |
| 히어로 | 3슬라이드 캐러셀 (5초 자동전환), 연구실 3대 축 각 슬라이드 |
| 레이아웃 | 최상단 고정 네비, 전체 너비 콘텐츠 |
| 특징 | 6개 연구 아이콘 카드, 연도별 논문 목록, 협력기관 섹션 |

---

### R02 — SNU product.snu.ac.kr 스타일 ✅ 완료
**참고:** product.snu.ac.kr (SNU AI소프트웨어 연구실)

| 항목 | 명세 |
|------|------|
| 색상 | Primary: #0f172a (다크 네이비), Accent: #3b82f6, Background: #ffffff |
| 폰트 | Inter 단일 폰트 (굵기 변화로 위계 설정) |
| 히어로 | 전체 너비 다크 히어로, 통계 숫자 3개 표시 |
| 레이아웃 | 넓은 단일 컬럼, 기관별 필터링 |
| 특징 | 3대 연구축 카드, 기관별 접기/펼치기 프로젝트, 연도별 논문 |

---

### R03 — 학술지 / 텍스트 중심 스타일
**참고:** 전통적 학술 연구실 사이트 (예: SNU 의생명정보학 연구실 계열)  
**특징:** 논문처럼 보이는, 텍스트 밀도 높은 학술 스타일

| 항목 | 명세 |
|------|------|
| 색상 | Background: #ffffff, Text: #111111, Accent: #991b1b (어두운 빨강), Border: #d1d5db |
| 폰트 | 제목+본문 모두 Georgia (serif), 통계/코드: Courier New |
| 히어로 | 히어로 이미지 없음. 연구실명 + 한 줄 소개 + 수평선이 전부 |
| 레이아웃 | 최대 너비 760px 중앙 정렬 단일 컬럼, 학술 논문 같은 읽기 흐름 |
| 특징 | 논문은 번호 매긴 참고문헌 스타일, 연구는 텍스트 단락으로 서술, 카드 없음 |
| 섹션 순서 | About → Research Areas → Publications → Members → Contact |

---

### R04 — 좌측 사이드바 분할 스타일
**참고:** Yonsei 연구실 계열의 좌측 고정 네비 레이아웃

| 항목 | 명세 |
|------|------|
| 색상 | 사이드바: #1e2030, 본문: #ffffff, Accent: #10b981 (에메랄드) |
| 폰트 | 제목: Space Grotesk, 본문: Inter |
| 히어로 | 사이드바에 PI 사진 + 이름 + 직책 고정. 히어로 섹션 없음 |
| 레이아웃 | 고정 사이드바 260px + 스크롤 가능한 우측 메인 콘텐츠 |
| 특징 | 사이드바: 로고/PI정보/네비/연락처, 메인: 연구→프로젝트→논문→멤버 |
| 섹션 순서 | (사이드바 고정) 우측: Research → Projects → Publications → Members |

---

### R05 — 다크모드 코드/데이터 스타일
**참고:** GitHub Dark + 데이터사이언스 연구실 aesthetic

| 항목 | 명세 |
|------|------|
| 색상 | Background: #0d1117, Primary: #58a6ff, Text: #c9d1d9, Card: #161b22 |
| 폰트 | 제목: JetBrains Mono (monospace), 본문: Inter |
| 히어로 | 어두운 배경에 `> PHI Lab @ CUK` 터미널 스타일 텍스트, 연구 키워드 태그 |
| 레이아웃 | 전체 다크, 카드들은 border #30363d |
| 특징 | 논문은 GitHub issue 스타일 리스트, 연구는 README 섹션처럼 표시, 코드블록 활용 |
| 섹션 순서 | Hero → Research Pillars → Active Projects → Publications → Team |

---

### R06 — 메디컬/임상 기관 스타일
**참고:** 병원 연구소 홈페이지 스타일 (국내 대학병원 연구센터 계열)

| 항목 | 명세 |
|------|------|
| 색상 | Primary: #0f766e (청록), Secondary: #134e4a, Background: #f8fafc, White |
| 폰트 | 제목: Source Sans Pro 또는 Noto Sans KR, 본문: 동일 |
| 히어로 | 청록 배너 + 흰 텍스트 + 연구 영역 아이콘 3개, 의료 데이터 시각화 SVG |
| 레이아웃 | 3컬럼 그리드 메인, 병원/기관 파트너 로고 배너 섹션 |
| 특징 | 논문은 데이터 테이블 형식, 연구는 임상 스터디 카드, 기관 로고 나열 |
| 섹션 순서 | Hero → Research Areas → Clinical Studies → Publications (table) → Partners → Team |

---

### R07 — 한국 정부/공공기관 스타일
**참고:** 국내 정부산하 연구소 홈페이지 스타일 (NHIS, HIRA 계열)

| 항목 | 명세 |
|------|------|
| 색상 | Primary: #1d4ed8 (코발트 블루), Background: #eff6ff, White, Gray |
| 폰트 | Pretendard 전체 (국내 공공기관 표준체에 가까움) |
| 히어로 | 상단 기관 로고바 + 넓은 파랑 히어로 배너, 공지사항 티커 |
| 레이아웃 | 전통적인 한국 공공기관 포털 레이아웃: 상단 헤더 + 2컬럼 본문 |
| 특징 | 최신 논문 박스, 연구 과제 리스트, 공식적인 테이블 스타일, 배지형 태그 |
| 섹션 순서 | 상단배너 → 연구소 소개(한/영) → 주요연구과제 → 최신논문 → 구성원 → 연락처 |

---

### R08 — 따뜻한 에디토리얼 / 인문학 스타일
**참고:** 출판/잡지 감성 학술 사이트, 인문사회계열 연구소 스타일

| 항목 | 명세 |
|------|------|
| 색상 | Background: #faf7f2 (크림), Text: #2d1b00 (다크브라운), Accent: #c2540a (테라코타) |
| 폰트 | 제목: Playfair Display 이탤릭, 본문: Lora (serif) |
| 히어로 | 큰 인용구("Research is...") 에디토리얼 스타일 헤더, 날짜/권호 표시 |
| 레이아웃 | 잡지 컬럼 레이아웃, 2–3 컬럼 그리드, 삽화 대신 텍스트 풀쿼트 사용 |
| 특징 | PI 소개는 에세이/인터뷰 형식, 논문은 독서 목록 스타일, 따뜻한 타이포그래피 |
| 섹션 순서 | Hero quote → About (essay) → Research Interests → Selected Works → Team → Contact |

---

### R09 — 고대(KU) 크림슨 전통 학술 스타일
**참고:** Korea University 계열 연구실 (형식적 대학 포털 스타일)

| 항목 | 명세 |
|------|------|
| 색상 | Primary: #9b0b00 (KU 크림슨), Background: #f5f0e8 (크림), Text: #1a1a1a |
| 폰트 | 제목: EB Garamond (클래식 세리프), 본문: Pretendard |
| 히어로 | 크림슨 배너 + 흰 텍스트 로고, 아래에 연구실 설명 박스 |
| 레이아웃 | 클래식 대학 포털: 헤더 → 2컬럼(메인+사이드바) → 풀위드 섹션들 |
| 특징 | 우측 사이드바에 Quick Links + 최신 논문 3편, 메인에 연구 소개 |
| 섹션 순서 | Header → Intro+Sidebar(QuickLinks) → Research → Publications → Members → Contact |

---

### R10 — 극도로 미니멀 / 일본 디자인 감성
**참고:** 일본 대학 연구실 미니멀 스타일 (여백, 선, 타이포그래피 중심)

| 항목 | 명세 |
|------|------|
| 색상 | Background: #f5f5f0 (오프화이트), Text: #1a1a1a (잉크블랙), Accent line: #7e9a7e (세이지그린) |
| 폰트 | Noto Serif KR + Noto Sans KR (한/영 모두 Noto 계열) |
| 히어로 | 한 줄 연구실 이름 + 한 줄 설명만. 이미지 없음. 수평선이 구분자 |
| 레이아웃 | 최대 너비 900px, 넉넉한 줄간격(2.0), 섹션 간 여백이 곧 디자인 |
| 특징 | 연구 소개는 한 줄 요약만, 논문은 줄간격 넓은 리스트, 멤버는 이름+역할만 |
| 섹션 순서 | Title → Research → Publications → Members → Contact |

---

### R11 — 브루탈리스트 / 타이포그래피 중심
**참고:** 서구 디자인 학교 연구실 스타일 (타이포그래피가 곧 디자인)

| 항목 | 명세 |
|------|------|
| 색상 | Background: #ffffff, Text: #000000, Accent: #ff3333 (순수 빨강) — 3색만 사용 |
| 폰트 | Space Mono (monospace) 제목+본문 모두, 크기 대비로 위계 설정 |
| 히어로 | "PHI LAB" 대문자 100px+ 텍스트가 전체 뷰포트. 이미지 없음 |
| 레이아웃 | 비대칭 그리드, 굵은 경계선이 구조 형성, 정렬이 의도적으로 불규칙 |
| 특징 | 논문은 줄번호 있는 코드처럼 표시, 카드 없음, 모든 것이 텍스트+선 |
| 섹션 순서 | Hero → Research (numbered) → Publications (numbered list) → Members → Contact |

---

### R12 — 연세대 블루 / 정통 의대 연구실 스타일
**참고:** Yonsei 의대/의공학 연구실 계열 (formal academic blue)

| 항목 | 명세 |
|------|------|
| 색상 | Primary: #003865 (연세 블루), Secondary: #00509e, Accent: #c8a96e (골드), Background: #ffffff |
| 폰트 | 제목: Merriweather (세리프), 본문: Inter |
| 히어로 | 짙은 파랑 히어로 + 흰 텍스트 + 연구실 슬로건 + PI 이름 |
| 레이아웃 | 클래식 의학 학술지 스타일: 상단 로고/네비 → 히어로 → 3열 섹션 |
| 특징 | 논문은 PubMed 스타일 인용 포맷, 배지형 IF(임팩트팩터) 아이콘, 멤버 테이블 |
| 섹션 순서 | Header → Hero → Research → Publications (PubMed style) → Members (table) → Contact |

---

### R13 — 데이터 대시보드 스타일
**참고:** 데이터사이언스/AI 연구실, 대시보드 UI 감성

| 항목 | 명세 |
|------|------|
| 색상 | Background: #0a192f (딥 네이비), Card: #112240, Accent: #64ffda (시안), Text: #ccd6f6 |
| 폰트 | 제목: IBM Plex Sans, 본문: Inter, 숫자: IBM Plex Mono |
| 히어로 | 어두운 배경 + 연구 키워드 노드 그래프 SVG (정적) + 핵심 통계 3개 |
| 레이아웃 | 대시보드 카드 그리드, 좌측 슬림 네비바 |
| 특징 | 논문 수/프로젝트 수/협력기관 수를 대형 숫자로 강조, 태그 필터 UI |
| 섹션 순서 | Hero(stats) → Research Nodes → Active Projects → Publications → Team |

---

### R14 — 현대 랜딩페이지 스타일
**참고:** 스타트업/테크 랜딩페이지 + 연구실 콘텐츠 결합

| 항목 | 명세 |
|------|------|
| 색상 | Gradient: #6366f1→#3b82f6, White sections, Dark sections #1e1b4b |
| 폰트 | 제목: Outfit (rounded modern), 본문: Inter |
| 히어로 | 그라디언트 배경 + 큰 tagline + CTA 버튼 2개 (연구 보기 / 논문 보기) |
| 레이아웃 | 풀위드 교차 섹션 (흰배경↔어두운배경 교차) |
| 특징 | 호버 효과 카드, 스크롤 시 섹션 등장 (CSS transform만 사용), 현대적 UI |
| 섹션 순서 | Hero → Research Pillars → Featured Projects → Publications → Team → Contact |

---

### R15 — 전통 한국/동아시아 학술 감성
**참고:** 국내 인문/사회 연구소 스타일, 전통 + 현대 결합

| 항목 | 명세 |
|------|------|
| 색상 | Background: #fefefe, Primary: #1b2838 (먹색), Accent: #c41e3a (단청 빨강), Border: #e2d5c3 (황토) |
| 폰트 | Noto Serif KR (제목), Noto Sans KR (본문) — 한국어 최적화 폰트 |
| 히어로 | 연구실 이름 한자(精密·典據) + 영문명 병기, 수묵 분위기 미니멀 배너 |
| 레이아웃 | 전통 한국 연구소 레이아웃: 상단 메뉴 → 인사말 → 연구소 소개 → 연구 → 논문 |
| 특징 | PI 인사말(연구실장 인사), 연구 분야를 한/영 병기로 설명, 논문은 한국 학회지 인용 형식 |
| 섹션 순서 | Header → 연구실장 인사 → 연구 소개 → 연구 프로젝트 → 논문 목록 → 구성원 → 오시는 길 |

---

## 라운드별 핵심 차별화 요약

| 라운드 | 색상 키워드 | 폰트 키워드 | 레이아웃 키워드 |
|--------|-----------|-----------|--------------|
| R01 | 파랑 (중간) | Playfair + Inter | 캐러셀 히어로 |
| R02 | 다크 네이비 | Inter 단일 | 정적 다크 히어로 |
| R03 | 흰+빨강 선 | Georgia 세리프 전체 | 단일 좁은 컬럼 |
| R04 | 다크사이드바+에메랄드 | Space Grotesk | 사이드바 분할 |
| R05 | 풀 다크 #0d1117 | JetBrains Mono | 터미널/코드 스타일 |
| R06 | 청록 메디컬 | Noto Sans KR | 3컬럼 임상 |
| R07 | 코발트 공공기관 | Pretendard | 한국 포털 2컬럼 |
| R08 | 크림+테라코타 | Playfair 이탤릭+Lora | 에디토리얼 잡지 |
| R09 | KU 크림슨+크림 | EB Garamond | 사이드바 포털 |
| R10 | 오프화이트+세이지 | Noto Serif KR | 극도 미니멀 여백 |
| R11 | 흰+검+빨강 3색만 | Space Mono 전체 | 브루탈리스트 |
| R12 | 연세 블루+골드 | Merriweather | 의대 학술지 |
| R13 | 딥 네이비+시안 | IBM Plex Mono | 데이터 대시보드 |
| R14 | 퍼플→블루 그라디언트 | Outfit | 랜딩페이지 |
| R15 | 먹색+단청빨강 | Noto Serif/Sans KR | 전통 한국 연구소 |

---

## 콘텐츠 포함 체크리스트 (모든 라운드 공통)

각 프로토타입에 반드시 포함되어야 할 내용:

- [ ] 연구실명: "PHI Lab @ CUK" + "Precision & Provenance Health Informatics Lab"
- [ ] PI: Hyo Jung Kim, Assistant Professor, Dept. of Biomedical Software Engineering, Catholic University of Korea
- [ ] 연구 3대 축: Knowledge Representation / Real-World Data / Real-World Evidence
- [ ] 주요 연구 프로젝트: 최소 6개 이상 (MOMENTUM, AI Cancer Trajectory, LLM NER, FAERS, 소아항생제, SDH+유방암)
- [ ] Publications: 최소 8편 이상 (연도 역순)
- [ ] Members: PI + 학부연구원 7명 이름
- [ ] 연락처: hyojung.kim@catholic.ac.kr, Bucheon, Gyeonggi-do
- [ ] 협력기관: Samsung Medical Center, Kakao Healthcare, NRF 등 주요 기관 언급

---

*이 문서는 모든 프로토타입 작업의 기준이 됩니다. 작업 전 반드시 해당 라운드 명세를 확인하고 차별화 포인트를 의식하며 구현하세요.*
