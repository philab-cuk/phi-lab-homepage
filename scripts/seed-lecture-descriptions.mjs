// Spring 2026 강의 개요·학습목표 채우기 (교수 제공 텍스트).
// 붙여넣기 과정의 중복 문단/목록은 1회만 반영. description 은 문단 \n\n 구분.
// 실행: node scripts/seed-lecture-descriptions.mjs
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n').map(l => l.trim())
    .filter(l => l && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1)] }),
)
const admin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

const UPDATES = [
  {
    id: 'sp26-medbigdata',
    description: [
      "This course is designed to bridge the gap between your programming knowledge and the fascinating realm of healthcare analytics. You'll discover how data science transforms modern medicine, from predicting patient outcomes to improving healthcare delivery.",
      "In today's healthcare industry, R programming skills are in exceptionally high demand. Medical institutions, pharmaceutical companies, and research organizations specifically seek professionals who can perform statistical analysis, survival analysis, and data visualization using R. This course will equip you with these highly sought-after skills that are essential both in academic research and industry applications.",
      'By the completion of this course, you will be able to:',
    ].join('\n\n'),
    objectives: [
      'Understand Medical Data Ecosystems: Navigate complex healthcare data structures including EHR, insurance claims, and registry data',
      'Apply Statistical Methods: Perform regression analysis, survival analysis, and hypothesis testing appropriate for medical research',
      'Interpret Medical Standards: Work confidently with medical coding systems (ICD, SNOMED-CT) and understand their role in healthcare analytics',
      'Conduct Ethical Research: Appreciate data privacy, quality considerations, and ethical implications in medical data science',
      'Programming skill for data science: Develop proficiency in R for medical data analysis, from basic syntax to advanced statistical modeling',
    ],
  },
  {
    id: 'sp26-capstone1',
    description: [
      'This capstone design course enables students to apply their biomedical software engineering and AI knowledge to real-world healthcare problems proposed by industry and clinical partners. Working in teams, students plan, design, and implement practical solutions that integrate biosignals, data analytics, and software systems. The course emphasizes creativity, problem-solving, teamwork, and end-to-end system development through project-based learning closely aligned with real biomedical needs.',
    ].join('\n\n'),
    objectives: [
      'Apply biomedical software engineering and AI knowledge to solve real healthcare and biosignal-related problems.',
      'Develop end-to-end system design skills from data acquisition to software implementation.',
      'Strengthen teamwork, communication, and project management capabilities.',
      'Gain practical experience through industry- and clinic-linked project-based learning.',
      'Cultivate creative problem-solving skills for real biomedical engineering challenges.',
    ],
  },
  {
    id: 'sp26-dhealth-ai',
    description: [
      '본 교과목은 의료 인공지능 시스템 설계의 전 주기를 문제중심학습(PBL) 방식으로 체험하는 실습 심화 과목이다. 최신 임상 AI 연구 문헌의 비판적 고찰을 시작으로, MIMIC 공개 임상 데이터셋을 활용한 정형 데이터(Structured Data) 및 의료 영상(CXR) 분석 프로젝트까지 세 개의 모듈로 구성된다.',
      '수강생은 각 모듈에서 (1) 실제 임상 문제를 AI 연구 질문으로 정의하고, (2) 적합한 데이터 전처리 및 모델 아키텍처를 설계·구현하며, (3) 결과를 임상적 맥락에서 비판적으로 해석하는 능력을 배양한다. 본 수업은 PBL 방식으로 운영된다.',
      '교수자가 일방적으로 설명하지 않고, 초반 방향성 가이드에 기반해 학생이 논문·데이터·문제를 스스로 탐구하고 결론을 도출하는 능동적 PBL을 수행한다. 교수자는 산업계의 수요와 검토를 포함하여 수업을 운영하며, 가이드 및 피드백 제공자로서 역할한다.',
    ].join('\n\n'),
    objectives: [
      '최신 임상 AI 연구(Nature, Lancet, NEJM AI 등)를 비판적으로 읽고 요약·비평하는 문헌 고찰 역량을 갖춘다.',
      'MIMIC 정형 데이터(EHR)를 활용하여 예측 모델을 설계·구현하고 임상적으로 해석한다.',
      'MIMIC-CXR 영상 데이터를 활용하여 의료 영상 분석 AI 파이프라인을 직접 구축한다.',
      '연구 결과를 논리적으로 구조화하고 발표·토론 형식으로 공유한다.',
      '의료 AI의 성능·윤리·공정성·임상 적용 가능성에 대한 종합적이고 비판적 관점을 형성한다.',
    ],
  },
]

for (const u of UPDATES) {
  const { error, count } = await admin
    .from('lectures')
    .update({ description: u.description, objectives: u.objectives }, { count: 'exact' })
    .eq('id', u.id)
  if (error) console.log(`✗ ${u.id}: ${error.message}`)
  else console.log(`✓ ${u.id} — ${count} row · 문단 ${u.description.split('\n\n').length} · 목표 ${u.objectives.length}`)
}
console.log('완료.')
