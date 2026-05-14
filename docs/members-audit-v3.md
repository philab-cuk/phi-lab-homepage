# members.json + Members.jsx — LIVE verbatim audit (2026-05-14)

LIVE 정본: `https://philabcuk.org/members/` (WebFetch 2026-05-14)

범례:
- ✅ verbatim 일치
- ⚠️ LIVE 부재 / 우리만 가짐 (정당하면 유지)
- ❌ 불일치 (조치 필요)

---

## 1. 페이지 구조

| 항목 | LIVE | 현재 | 상태 | 조치 |
|---|---|---|---|---|
| `<h1>` | `Members` | `Lab Members` | ❌ | `Members.jsx` L264 |
| Section 1 라벨 | `Principal Investigator` | `Faculty` | ❌ | `Members.jsx` L299 |
| Section 2 라벨 | `Undergraduate Researchers` | `Students` | ❌ | `Members.jsx` L312 |
| Hero subcopy | 부재 | "Meet the researchers and students..." | ❌ | 제거 (사용자 결정) |
| Join CTA | 부재 | "We welcome motivated students..." | ❌ | 제거 (사용자 결정) |
| Tabs (Current / Alumni) | 부재 (단일 페이지) | 탭 2개 | ⚠️ | 유지 (사용자 결정) |
| Hero "Our Team" chip | 부재 | 우리만 | ⚠️ | 유지 |

## 2. PI 카드 — LIVE 표시 내용

LIVE `/members/` PI 카드는 다음만 노출:

- 사진
- 이름: `Hyo Jung Kim`
- 직위: `Assistant Professor`
- 소속: `Department of Biomedical Software Engineering, The Catholic University of Korea`

| 필드 | LIVE | 현재 JSON | 조치 |
|---|---|---|---|
| name | Hyo Jung Kim | ✅ | — |
| title | Assistant Professor | ✅ | — |
| department | Department of Biomedical Software Engineering | ✅ | — |
| institution | The Catholic University of Korea | ✅ | — |
| photo | (canonical 실사진) | `/photos/hkim.jpg` | ✅ /professor 가 참조하므로 그대로 유지 |
| photoLive (신규) | `https://i0.wp.com/.../generated-image-september-09-2025-1_03pm.png` | (신규 필드) | ✅ /members 의 PI 카드 전용. `Members.jsx#ProfessorCard` 에서 `photoLive ?? photo` 로 fallback. /professor 는 이 필드 무시 |
| bioFull / education / experience | (LIVE /members/ 부재 — /people/ 전용) | 노출 중 | ⚠️ 사용자 결정 = 유지 |

## 3. 학부생 카드 — LIVE 1:1

순서는 LIVE = 현재 JSON.

| # | 이름 | LIVE research interests (verbatim) | 현재 JSON | 상태 |
|---|---|---|---|---|
| 1 | Jun Seok Her | `Biomedical Data Science`, `Pharmacovigilance`, `Healthcare Data Engineering (Deduplication)` | `Biomedical Data Science`, `Pharmacovigilance`, `Healthcare Data Engineering` | ❌ `(Deduplication)` 누락 |
| 2 | Jin Woo Yoo | `Health Data Analytics`, `Claims and Public Health Data Experience` | `Health Data Analytics`, `Claims Data`, `Public Health Data` | ❌ 한 항목 두 개로 분리 + `Experience` 누락 |
| 3 | Eun Jin Jeong | `Biomedical Data Science`, `Clinical Informatics`, `Data Pipelining` | (동일) | ✅ |
| 4 | Yeseo Lee | `Data Harmonization and Reuse in Public Health`, `Enhancing Utility of Linked Health Data` | `Data Harmonization`, `Public Health Data`, `Linked Health Data` | ❌ 단축 |
| 5 | Eun Ji Kim | `Biomedical Data Science`, `Pharmacovigilance & Drug Safety` | `Biomedical Data Science`, `Pharmacovigilance`, `Drug Safety` | ❌ `&` 결합 항목 분리됨 |
| 6 | Sang Min Lim | `Clinical Informatics`, `Health Services Research` | (동일) | ✅ |
| 7 | Jae Hyeok Han | `Biomedical Data Science`, `Clinical data management system` | `Biomedical Data Science`, `Clinical Data Management Systems` | ❌ 대문자/복수 → 소문자/단수 |

## 4. 학부생 사진 URL (LIVE 핫링크, verbatim)

| # | id | LIVE URL |
|---|---|---|
| PI | hkim | `https://i0.wp.com/philabcuk.org/wp-content/uploads/2025/09/generated-image-september-09-2025-1_03pm.png?resize=750%2C964&ssl=1` |
| 1 | jsher | `https://i0.wp.com/philabcuk.org/wp-content/uploads/2025/09/jsh.jpg?resize=413%2C516&ssl=1` |
| 2 | jwyoo | `https://i0.wp.com/philabcuk.org/wp-content/uploads/2025/09/eca69debaa85ec82aceca784.jpg?resize=689%2C886&ssl=1` |
| 3 | ejjeong | `https://i0.wp.com/philabcuk.org/wp-content/uploads/2025/09/ejj.jpg?resize=551%2C709&ssl=1` |
| 4 | yslee | `https://i0.wp.com/philabcuk.org/wp-content/uploads/2025/09/ysl.jpg?resize=750%2C961&ssl=1` |
| 5 | ejkim | `https://i0.wp.com/philabcuk.org/wp-content/uploads/2025/09/ejk.jpeg?resize=750%2C964&ssl=1` |
| 6 | smlim | `https://i0.wp.com/philabcuk.org/wp-content/uploads/2025/12/ec9e84ec8381ebafbc_eca69debaa85ec82aceca784.jpg?resize=750%2C964&ssl=1` |
| 7 | jhhan | `https://i0.wp.com/philabcuk.org/wp-content/uploads/2025/12/ed959cec9eaced9881_eca69debaa85ec82aceca784.jpg?resize=354%2C472&ssl=1` |

## 5. 사용자 결정 요약 (2026-05-14)

| # | 질문 | 결정 |
|---|---|---|
| 1 | 사진 호스팅 | LIVE 핫링크 (i0.wp.com) |
| 2 | PI 카드 범위 | 현재 그대로 유지 (full bio) |
| 3 | Hero 서브카피 + Join CTA | 둘 다 제거 |
| 4 | Alumni 탭 | 유지 (빈 상태도 노출) |

## 6. 보존된 LIVE 표기 (수정 안 함)

- `Clinical data management system` — 영문 비문법적이지만 LIVE 표기 그대로
- `eca69debaa85ec82aceca784.jpg` 등 URL slug — 한글 파일명 percent-encoded
- `Pharmacovigilance & Drug Safety` — `&` 그대로
- `Claims and Public Health Data Experience` — 다소 어색한 표현이지만 LIVE 그대로
