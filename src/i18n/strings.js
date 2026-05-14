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

    // ── Hero (Home page) — copy & hierarchy preserved from prof's WP site ──
    hero: {
      kicker: 'PHI Lab @ CUK — Precision & Provenance Health Informatics',
      headline:
        'Contribute to digital healthcare innovation with data-intensive approaches based on real-world demands',
      tagline: 'from precision medicine to social determinants of health',
      cta: 'Learn more',
    },

    // ── Home page body sections (round-03 layout) ────────────────────────
    home: {
      stats: { projects: 'Active Projects', publications: 'Publications', collaborators: 'Collaborating Institutions' },
      sections: {
        researchAreas: 'Research Areas',
        activeProjects: 'Active Projects',
        recentPublications: 'Recent Publications',
        labMembers: 'Lab Members',
        lectures: 'Recent Lectures',
        about: 'About the Lab',
      },
      viewAll: {
        projects: 'View all projects',
        publications: 'View all publications',
        members: 'View all members',
        lectures: 'View all lectures',
        about: 'Read more',
      },
      pillars: {
        kr: {
          title: 'Knowledge Representation',
          body: 'Data modeling, biomedical ontology, clinical data engineering, pipeline construction, and governance for precision medicine. Includes clinical genome data modeling (cGDM) and interoperability frameworks.',
        },
        rwd: {
          title: 'Real-World Data (RWD)',
          body: 'Secondary use of electronic health records (EHR), clinical data warehouses (CDW), FAERS, and Korean claims data (HIRA). Registry construction, cohort definition, and data quality management for multi-institutional studies.',
        },
        rwe: {
          title: 'Real-World Evidence (RWE)',
          body: 'Scientific data processing for evidence generation and causal inference. Pharmacovigilance signal detection, treatment effectiveness evaluation, and integration of social determinants of health with clinical outcomes.',
        },
      },
      members: { faculty: 'Faculty', students: 'Undergraduate Researchers' },
      about: {
        body:
          'PHI (Precision & Provenance Health Informatics) Lab at The Catholic University of Korea advances precision medicine and digital healthcare through data-driven interdisciplinary research — spanning EHR engineering, real-world evidence generation, and information structure design.',
        contact: 'Contact',
        collaborators: 'Collaborating Institutions',
      },
    },

    // ── Footer ────────────────────────────────────────────────────────────
    footer: {
      tagline:
        'Precision & Provenance Health Informatics Lab — advancing data-driven methods for trustworthy clinical decision support.',
      quickLinks: 'Quick Links',
      contact: 'Contact',
      profName: 'Prof. Hyo Jung Kim',
      department: 'Department of Biomedical Software Engineering, The Catholic University of Korea',
      email: 'hyojung.kim@catholic.ac.kr',
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

    // ── Hero (Home page) — copy & hierarchy preserved from prof's WP site ──
    hero: {
      kicker: 'PHI Lab @ CUK — 정밀·출처 기반 보건의료정보학 연구실',
      headline:
        '실세계 수요에 기반한 데이터 집약적 접근으로 디지털 헬스케어 혁신에 기여합니다',
      tagline: '정밀의료에서 건강의 사회적 결정요인까지',
      cta: '더 알아보기',
    },

    // ── Home page body sections (round-03 layout) ────────────────────────
    home: {
      stats: { projects: '진행 중 프로젝트', publications: '논문', collaborators: '협력 기관' },
      sections: {
        researchAreas: '연구 영역',
        activeProjects: '진행 중인 프로젝트',
        recentPublications: '최근 논문',
        labMembers: '연구실 구성원',
        lectures: '강의',
        about: '연구실 소개',
      },
      viewAll: {
        projects: '모든 프로젝트 보기',
        publications: '모든 논문 보기',
        members: '구성원 전체 보기',
        lectures: '강의 전체 보기',
        about: '자세히 보기',
      },
      pillars: {
        kr: {
          title: 'Knowledge Representation',
          body: '임상·유전체 데이터 모델링, 생의학 온톨로지, 임상 데이터 엔지니어링, 파이프라인 구축, 거버넌스. cGDM(임상 게놈 데이터 모델)과 상호운용성 프레임워크 포함.',
        },
        rwd: {
          title: 'Real-World Data (RWD)',
          body: 'EHR, 임상 데이터 웨어하우스(CDW), FAERS, 건강보험 청구 데이터(HIRA)의 2차 활용. 다기관 연구를 위한 레지스트리 구축, 코호트 정의, 데이터 품질 관리.',
        },
        rwe: {
          title: 'Real-World Evidence (RWE)',
          body: '근거 생성·인과 추론을 위한 과학적 데이터 처리. 약물감시 신호 탐지, 치료효과 평가, 임상 결과와 건강의 사회적 결정요인 통합.',
        },
      },
      members: { faculty: '교수', students: '학부 연구원' },
      about: {
        body:
          '가톨릭대학교 PHI(φ, Precision & Provenance Health Informatics) 연구실은 데이터 기반 다학제 연구를 통해 정밀의료와 디지털 헬스케어를 발전시킵니다 — EHR 엔지니어링, 실사용 근거(RWE) 창출, 정보구조 설계 전반.',
        contact: '연락처',
        collaborators: '협력 기관',
      },
    },

    // ── Footer ────────────────────────────────────────────────────────────
    footer: {
      tagline:
        '정밀·출처 기반 보건의료정보학 연구실 — 신뢰할 수 있는 임상 의사결정 지원을 위한 데이터 기반 방법론을 연구합니다.',
      quickLinks: '바로가기',
      contact: '연락처',
      profName: '김효정 교수',
      department: '의료정보학과 (Department of Biomedical Software Engineering), 가톨릭대학교',
      email: 'hyojung.kim@catholic.ac.kr',
      copyright: 'PHI 연구실. 모든 권리 보유.',
    },

    // ── Language toggle ───────────────────────────────────────────────────
    langToggle: { ko: 'KO', en: 'EN' },
  },
}

export default strings
