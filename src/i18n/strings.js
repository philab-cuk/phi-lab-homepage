/**
 * Simple bilingual string table.
 * Access via useLanguage() hook — returns strings[lang].
 */
const strings = {
  en: {
    // ── Navigation ────────────────────────────────────────────────────────
    nav: {
      home: 'Home',
      about: 'About',
      members: 'Members',
      research: 'Research',
      publications: 'Publications',
      news: 'News',
      lectures: 'Lectures',
    },

    // ── Hero (Home page) ──────────────────────────────────────────────────
    hero: {
      badge: 'Research Lab — Health Informatics',
      title: 'PHI Lab',
      subtitle: 'Precision & Provenance Health Informatics Lab',
      lead: 'Led by',
      leadName: 'Prof. Hyojung Kim',
      body:
        'We develop trustworthy, data-driven methods at the intersection of clinical informatics, machine learning, and provenance engineering to improve health outcomes.',
      ctaResearch: 'Explore Research',
      ctaAbout: 'About the Lab',
    },

    // ── Footer ────────────────────────────────────────────────────────────
    footer: {
      tagline:
        'Precision & Provenance Health Informatics Lab — advancing data-driven methods for trustworthy clinical decision support.',
      quickLinks: 'Quick Links',
      contact: 'Contact',
      profName: 'Prof. Hyojung Kim',
      department: 'Department of Health Informatics',
      email: 'hyojung.kim@university.edu',
      copyright: 'PHI Lab. All rights reserved.',
    },

    // ── Language toggle ───────────────────────────────────────────────────
    langToggle: { ko: 'KO', en: 'EN' },
  },

  ko: {
    // ── Navigation ────────────────────────────────────────────────────────
    nav: {
      home: '홈',
      about: '소개',
      members: '구성원',
      research: '연구',
      publications: '논문',
      news: '소식',
      lectures: '강의',
    },

    // ── Hero (Home page) ──────────────────────────────────────────────────
    hero: {
      badge: '연구실 — 보건의료정보학',
      title: 'PHI 연구실',
      subtitle: '정밀·출처 기반 보건의료정보학 연구실',
      lead: '지도교수',
      leadName: '김효정 교수',
      body:
        '임상정보학, 기계학습, 출처 공학의 교차점에서 신뢰할 수 있는 데이터 기반 방법론을 개발하여 의료 결과를 향상시키는 것을 목표로 합니다.',
      ctaResearch: '연구 보기',
      ctaAbout: '연구실 소개',
    },

    // ── Footer ────────────────────────────────────────────────────────────
    footer: {
      tagline:
        '정밀·출처 기반 보건의료정보학 연구실 — 신뢰할 수 있는 임상 의사결정 지원을 위한 데이터 기반 방법론을 연구합니다.',
      quickLinks: '바로가기',
      contact: '연락처',
      profName: '김효정 교수',
      department: '보건의료정보학과',
      email: 'hyojung.kim@university.edu',
      copyright: 'PHI 연구실. 모든 권리 보유.',
    },

    // ── Language toggle ───────────────────────────────────────────────────
    langToggle: { ko: 'KO', en: 'EN' },
  },
}

export default strings
