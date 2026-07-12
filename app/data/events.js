// 연구실 주최·공동주최 학술 행사 — 정적 데이터(저서·특허와 동일 방식).
// 항목 추가/수정은 이 파일 편집. date(YYYY 또는 YYYY.MM.DD)로 최신순 정렬.
// 값이 비어있는 필드(venue/description/link/image)는 화면에서 자동 생략된다.
// role: 'Host'(주최) | 'Co-host'(공동주최) | 'Organizer'(주관) 등.

export const EVENTS = [
  {
    id: 'ghmw-2026',
    title: 'GHMW 2026',
    fullName: 'Global Healthcare Mobility Week',
    role: 'Host',
    date: '2026.03.18–20',
    venue: 'The Catholic University of Korea',
    description:
      'An international academic event co-hosted by the PHI Lab (CUK BMSW) and the University of Cincinnati DAAP (EPIC-Co Lab), supported by the National Research Foundation of Korea — featuring conferences, healthcare-industry field visits, and student research exchange under the theme "Redefining Borders: AI, Urban Health, and Community."',
    link: '/ghmw-2026/', // 통합된 정적 microsite (public/ghmw-2026)
    image: '',
  },
  {
    id: 'llm-workshop',
    title: 'LLM Workshop',
    fullName: '“Running an LLM on Your Own PC”',
    role: 'Organizer',
    date: '2025.12.05–06 (Fri–Sat)',
    venue: 'Computer Lab, Advanced Studies Cluster, CUK',
    description:
      'A two-day, full-day hands-on workshop (10:00–18:00) designed to build practical, career-ready programming and AI skills — from Python foundations to deploying lightweight large language models on a personal computer.',
    speaker: {
      name: 'Geun Hyeong Lee (이근형)',
      affiliation:
        'AIX Part Lead, Advanced Technology Research Institute, Kakao Healthcare · Ph.D. in Medical AI',
    },
    agenda: [
      { day: 'Day 1', title: 'Python Programming — fundamentals to intermediate, hands-on' },
      {
        day: 'Day 2',
        title:
          'Deep Learning with Lightweight LLMs — special lecture: “Running an LLM on Your Own PC!”',
      },
    ],
    program: '2025 Winter Intensive Career-Readiness PBL Program',
    sponsor: 'Dept. of Biomedical Software Engineering (RISE Initiative)',
    link: '',
    image: 'photos/events/llm-workshop.jpg', // BASE_URL 은 EventItem 에서 prepend
  },
]
