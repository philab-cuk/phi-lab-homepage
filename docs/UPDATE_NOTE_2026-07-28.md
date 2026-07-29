# PHI Lab Homepage — Update Note (2026. 07. 28)

워드프레스 잔존 의존성 제거와 그로 인한 이미지 유실 대응, 그리고 검색 색인 문제 수정.

---

## 1. 발단 — "이예서 학생 사진만 휴대폰에서 안 보인다"

기기 문제가 아니었다. 그 사진은 **모든 기기에서 이미 404** 였고, PC 크롬에서만 보인 것은
브라우저에 남은 옛 캐시 때문이었다.

원인은 사진 주소가 아직 옛 워드프레스를 가리키고 있었다는 것이다.

```
https://i0.wp.com/philabcuk.org/wp-content/uploads/2025/09/ysl.jpg?resize=750%2C961&ssl=1
```

워드프레스에서 지금 사이트로 이전하며 `wp-content/uploads/` 원본이 사라졌고(원본 서버 404),
그동안은 Jetpack CDN(`i0.wp.com`) 캐시가 대신 응답하고 있었다. 즉 **캐시가 만료되는 순서대로
이미지가 하나씩 죽는** 상태였고, 이예서 학생 사진이 첫 번째였을 뿐이다.

## 2. 조치 — 살아 있는 것을 회수해 Supabase 로 이전

캐시가 더 만료되기 전에 남아 있던 이미지를 내려받아 Supabase Storage 로 옮겼다.
(Photon 은 `Accept` 헤더별로 캐시가 갈려, WebP 변환본만 살아 있었다.)

| 대상 | 회수·이전 | 이미 유실 |
|---|---|---|
| 구성원 사진 | 6장 → `profile-photos/{id}/profile.webp` | 1장(이예서, 본인 재업로드로 해결) |
| 강의 이미지 | 5장 → `lecture-images/{id}/{n}.webp` | 4장 |

- `members.photo_url`, `lectures.images` 를 Supabase 주소로 갱신, 유실분은 목록에서 제거
- 유실된 강의 이미지 4장: Biomedical Big Data Analysis(Fall 2025) 1, Computers & Programming 1(Spring 2025) 2,
  Biomedical Big Data Analysis(Spring 2026) 1 — 원본이 있으면 admin 에서 재업로드 필요

## 3. 재발 방지 — 시드 데이터까지 정리

DB 만 고치면 **시드 스크립트를 다시 돌릴 때 죽은 주소가 되살아난다.** 이번 작업에서 가장
놓치기 쉬운 지점이었다.

- `data/{members,lectures,professor}.json`, `app/data/{members,lectures}.json` 을 현재 DB 주소로 갱신
- 일회성 마이그레이션 스크립트 `scripts/migrate-photos.mjs`, `scripts/migrate-lecture-images.mjs` 삭제
  (원본이 사라져 더는 동작할 수 없음, git 이력에 보존)
- `docs/` 의 과거 스냅샷 문서는 기록이므로 본문을 두고 죽은 링크임을 명시하는 문구만 추가

검증: DB 8개 테이블(`members·lectures·institutions·research·publications·news·posts·gallery`)과
`app/`·`public/`·`data/` 코드에서 워드프레스 흔적 **0건**.

## 4. 검색 색인 문제 수정 (같은 날)

구글 서치콘솔이 하위 페이지 색인 실패를 알려왔다. 원인은 **모든 페이지가 홈을 정규 URL로 지목**
하고 있었던 것.

```html
<link rel="canonical" href="https://philabcuk.org/">   <!-- /events, /members … 전부 동일 -->
```

SPA 라 모든 경로가 같은 정적 HTML 을 받으면서 `root.jsx` 에 구워진 홈 주소를 그대로 물려받았고,
검색엔진은 이를 "홈의 중복본"으로 판단해 색인에서 제외했다.

- `Layout` 에 `Canonical` 추가 — 라우트 변경 시 실제 주소로 갱신
- 페이지별 제목·설명 부여(About·Professor·Research·Publications·Teaching·Members) — 그전까지 전 페이지가 동일했음
- `SITE_ORIGIN` 을 `app/lib/site.js` 로 분리

## 5. 그 밖에

- **Members**: 개인 홈페이지가 입력만 되고 표시되지 않던 문제 수정. 이메일·홈페이지·Google Scholar·
  LinkedIn 을 색상 아이콘 버튼 + 말풍선으로 노출, 사진 클릭 시 홈페이지 이동.
  이메일은 `mailto:` 를 DOM 에 남기지 않고 클릭 시 조립해 수집 크롤러를 피한다.
  프로토콜 없는 주소(`www.example.com`)가 상대경로로 잘못 해석되던 문제도 `normalizeUrl` 로 보정.
- **Publications**: 2025 대한의료정보학회 추계학술대회 발표 2건 추가(허준석·이예서, 교신 김효정).

---

## 남은 일

- 유실된 강의 이미지 4장 재업로드(원본 보유 시)
- 서치콘솔에서 주요 페이지 색인 재요청 — canonical 수정이 반영되려면 재크롤링이 필요하다
