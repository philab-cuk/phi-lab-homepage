// 저서(Books)·특허(Patents) — CV(이력서) 기반 정적 데이터.
// 논문/발표와 달리 스키마가 다르고 자주 바뀌지 않아 DB가 아닌 코드로 관리.
// 항목 추가 시 이 파일에 객체를 추가하면 Publications 페이지 탭에 바로 반영된다.
// PI(연구책임자) 이름은 렌더 시 굵게 — PI_NAMES 로 식별.

export const PI_NAMES = ['김효정', 'Hyo Jung Kim', 'Kim, H. J.']

// 영어 우선 + 한글 병기(사이트 표기 규칙). *En 이 주 표기, *Ko 를 괄호로 병기.
export const BOOKS = [
  {
    id: 'book-ai-precision-medicine-2025',
    authors: ['Hyo Jung Kim'],
    titleEn: 'AI and Precision Medicine',
    titleKo: 'AI와 정밀의료',
    publisherEn: 'Communication Books',
    publisherKo: '커뮤니케이션북스',
    seriesEn: 'Artificial Intelligence Series',
    seriesKo: '인공지능총서',
    year: 2025,
    date: '2025.10.24',
    pages: 197,
    isbn: '9791143011060',
  },
]

// status: 'registered'(등록) | 'filed'(출원)
export const PATENTS = [
  {
    id: 'patent-napro-reproductive-dataset',
    inventors: ['김민정', '박인양', '김효정', '김명신'],
    titleKo: '나프로 차트의 구조화 및 상대시간 정렬을 이용한 생식건강 데이터셋 생성 방법 및 시스템',
    titleEn:
      'Method and System for Generating a Reproductive Health Dataset Using Structuring and Relative-Time Alignment of NaPro Charts',
    assignee: '가톨릭대학교 산학협력단',
    status: 'filed',
    number: '10-2026-0126128',
    date: '2026.07.09',
    year: 2026,
  },
  {
    id: 'patent-genome-data-model',
    inventors: ['김효정', '김주한'],
    titleKo: '정밀의료 게놈 데이터 모델 관리 장치 및 이의 관리 방법',
    titleEn: 'Genome data model managing apparatus for precision medicine and managing method thereof',
    assignee: '서울대학교 산학협력단 / 서울대학교병원',
    status: 'registered',
    number: '10-2304544',
    date: '2021.09.15',
    year: 2021,
  },
  {
    id: 'patent-chemo-prescription',
    inventors: ['김효정', '신상준', '정혜경', '유철주'],
    titleKo: '화학요법 처방 장치 및 방법',
    titleEn: 'Apparatus and Method for Prescription of Chemotherapy',
    assignee: '연세대학교 산학협력단',
    status: 'registered',
    number: '10-1306983',
    date: '2013.09.02',
    year: 2013,
  },
  {
    id: 'patent-ner-evaluation',
    inventors: ['김현정', '박지연', '안민영', '조유리', '김효정', '김혜영'],
    titleKo: '의료 데이터 군집화 방법 및 장치',
    titleEn: 'Method and System for Evaluating Named Entity Recognition (NER) Performance Using Generative AI',
    assignee: '카카오헬스케어',
    status: 'filed',
    number: '10-2025-0034940',
    date: '2025.03.18',
    year: 2025,
  },
  {
    id: 'patent-note-clustering-llm',
    inventors: ['민지영', '김효정', '김현정', '이근형'],
    titleKo: '구조화된 문서를 생성하는 인공지능 모델의 성능을 평가하는 방법 및 장치',
    titleEn: 'Optimizing Note Clustering for Structuring Unstructured Electronic Medical Record Data Using Large Language Models (LLMs)',
    assignee: '카카오헬스케어',
    status: 'filed',
    number: '10-2024-0085325',
    date: '2024.06.28',
    year: 2024,
  },
]
