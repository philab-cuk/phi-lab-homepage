# PHI Lab Homepage — Update Note (2026. 07. 12)

philabcuk.org 리뉴얼·기능 확장·검색/분석 인프라 구축 작업 요약.
배포 리포 `philab-cuk/phi-lab-homepage`(Render 자동배포) 기준, 커밋 `67ea530…06d042f`.

---

## 1. 디자인 리뉴얼 (브랜딩·타이포)

- **가톨릭대 시그니처 컬러** 토큰화: 가대 Blue(661C `#0C2E86`), Gold(875C), Beige(7499C), Warm Gray(11C) — `app/index.css @theme`
- **히어로 도입**: Home(은하수 사진), About(의료·AI 이미지 위쪽 절반) — 어두운 오버레이 + 밝은 글씨
- **웹폰트**: 기본 Pretendard(한/영 산세리프) + 에디토리얼 세리프 Lora(인용구·본문)
- 헤더 랩 이름 확대(남색 그라데이션) + 심볼 전용 로고, 푸터 정리, 연구 카드·인용구 색 액센트
- nav 순서를 Lab 중심으로 재배열

## 2. 정보 구조 · 신규 기능

- **Publications 3탭**: Papers / Books / Patents (저서·특허는 `app/data/scholarly-works.js` 정적 관리, 특허 상태 배지)
- **Teaching**(구 Lectures) 리브랜드: 강의 이미지 폭 균형, 학습목표 불릿, **주제별 색상 칩 요약**(AI/Python/Data Science/Database/Capstone)
- **Events 신설**: nav 호버 드롭다운(GHMW 2026 / LLM Workshop) + `/events` 페이지
- **GHMW 2026 microsite 통합**: 원본 정적 사이트를 `public/ghmw-2026/`로 이식(등록·관리자 페이지 제외)
- **Professor**: 사진 규격 통일, 직함 강조, 단과대 추가, Professional Service 섹션

## 3. 콘텐츠 업데이트 (Supabase CMS)

- 협업 기관 **12곳**으로 확장(3×4): 봄젠(Bhomegen)·신시내티대·성균관대 추가, 로고 업로드
- Members 학위·연구 관심분야 영문 통일
- 교수 학회·위원회 활동(Professional Service), 특허출원 1건 반영

## 4. 검색 가시성 향상 (SEO)

- **기본 메타태그**: `<title>`·description·canonical (그동안 부재)
- **Open Graph / Twitter Card** + 전용 OG 이미지(1200×630)
- **JSON-LD** 구조화 데이터(ResearchOrganization)
- **sitemap.xml + robots.txt** 신설
- **Google Search Console**(GA 인증) · **네이버 서치어드바이저**(HTML 태그 인증) 등록, 사이트맵 제출
- 모든 SEO 태그는 `app/root.jsx` `<head>`에 직접 → 정적 index.html에 포함(소셜 스크래퍼 대응)

## 5. 방문 분석 (Analytics)

- **Google Analytics 4** 연동(측정 ID `G-0J2Z78QWDF`) — SPA 경로 이동은 Enhanced Measurement로 추적

## 6. 성능·코드 정리

- **GHMW microsite 이미지 최적화: 8.46MB → 1.33MB** (미참조 슬라이드 JPG 압축, 로고 리사이즈, hero 재압축)
- 세션 중 발생한 죽은 코드 제거(Events 단일 image 경로, 미사용 `fetchHomeStats`)

---

## 기술 스택 / 운영

| 영역 | 내용 |
|------|------|
| 프론트엔드 | React 19 + React Router v7(SPA) + Vite + Tailwind v4 |
| 데이터 | Supabase(PostgreSQL/Auth/Storage) — admin CMS로 재배포 없이 콘텐츠 수정 |
| 배포 | Render 정적 사이트, `philab-cuk/phi-lab-homepage` main push 시 자동배포 |
| 분석/검색 | GA4 · Google Search Console · Naver Search Advisor |

## 남은 과제 (권장)

1. 콘텐츠 채우기(News/Posts 등) — 담당 학생 진행 예정
2. University of Cincinnati 로고 밝은 배경 버전 교체
3. 저서·특허·Events 등 정적 데이터의 admin 편집화(선택)
