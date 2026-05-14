// LIVE /about/ verbatim — see docs/phi-lab-content/06_about.md for the
// authoritative snapshot. Three paragraphs only; no Values, no Contact.

export default function About() {
  return (
    <>
      {/* ── Page Header (matches Research/Members band) ── */}
      <section className="bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 text-white relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div
          aria-hidden="true"
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-brand-600 opacity-20 blur-3xl"
        />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 relative">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">About Lab</h1>
        </div>
      </section>

      {/* ── Body — three LIVE paragraphs verbatim ── */}
      <section className="bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          {/* Paragraph 1 (Korean) */}
          <p className="text-gray-700 text-base leading-relaxed mb-8">
            <strong>
              가톨릭대학교 PHI(φ, Precision &amp; Provenance Health Informatics Lab) 연구실
            </strong>
            에서는 정밀의료와 디지털 헬스케어 구현을 위한 데이터 기반 다학제연구를 수행합니다.
            공공데이터부터 EHR 데이터까지 포괄적으로 연구하며, 신뢰할 수 있는 데이터의 활용,
            데이터 과학을 통한 지식 창출, 의사결정을 지원하는 데이터 기반 디지털 헬스케어 시스템
            전반을 연구합니다. 국내외 의료기관 및 학교들과 교류하며 실세계데이터(RWD) 엔지니어링,
            데이터 파이프라인 구축, 실사용 근거(RWE) 창출, 정보구조 설계 연구를 활발히 수행하고
            있습니다.
          </p>

          {/* Paragraph 2 (English part 1) — curly U+2019 in lab’s */}
          <p className="text-gray-700 text-base leading-relaxed mb-8 border-t border-gray-100 pt-8">
            <strong>
              PHI (Precision &amp; Provenance Health Informatics Lab) at the Catholic University of
              Korea
            </strong>{' '}
            is dedicated to advancing precision medicine and digital healthcare through data-driven
            interdisciplinary research. The lab’s work spans from public data to EHR (Electronic
            Health Records) data, emphasizing the utilization of trustworthy data, knowledge
            generation via data science, and supporting decision-making through data-based digital
            healthcare systems.
          </p>

          {/* Paragraph 3 (English part 2) — LIVE inserts a <br> between
              "outcomes." and "This" with no intervening space; replicated here
              so DOM textContent matches LIVE byte-for-byte. */}
          <p className="text-gray-700 text-base leading-relaxed">
            The lab collaborates with various medical institutions and schools both domestically
            and internationally to engage in vibrant research activities. These include engineering
            real-world data (RWD), constructing data pipelines, generating real-world evidence
            (RWE), and designing information structures to enhance healthcare delivery and
            outcomes.<br />This comprehensive approach not only boosts the field of digital
            healthcare but also ensures that the solutions developed are grounded in reliable data
            and innovative research practices.
          </p>
        </div>
      </section>
    </>
  )
}
