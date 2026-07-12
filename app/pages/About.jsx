// LIVE /about/ verbatim — see docs/phi-lab-content/06_about.md for the
// authoritative snapshot. Three paragraphs only; no Values, no Contact.

// 히어로 개념 라벨(목업 기준). 은은한 반투명 칩.
const HERO_TAGS = ['의료정보학', '데이터 기반 정밀의료', '디지털 헬스케어', '다학제적 접근']

export default function About() {
  return (
    <>
      {/* ── Hero — Home 과 동일 톤(은하수 배경 + 어두운 오버레이 + 밝은 글씨) ── */}
      <section
        className="relative overflow-hidden bg-brand-900 bg-cover bg-center border-b border-rule"
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}photos/about-hero.jpg)` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/15" aria-hidden="true" />
        <div className="relative mx-auto max-w-[1200px] px-6 py-16">
          <p className="my-0 text-[14px] font-semibold tracking-wide text-gold-100">
            The Catholic University of Korea PHI Lab
          </p>
          <h1 className="mt-2 max-w-[760px] text-[2.2rem] leading-[1.25] text-white">
            Precision &amp; Provenance Health Informatics Lab
          </h1>
          <p className="mt-1 text-white/85 text-[1.2rem]">
            정밀하고 신뢰할 수 있는 데이터-정보-지식 순환으로 만드는 더 건강한 미래
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {HERO_TAGS.map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/35 bg-white/10 px-4 py-1 text-[14px] text-white/90 backdrop-blur-sm"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1200px] px-6 py-12">
        <p>
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

      <p>
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

      {/* LIVE inserts a <br> between "outcomes." and "This" with no intervening
          space; replicated here so DOM textContent matches LIVE byte-for-byte. */}
      <p>
        The lab collaborates with various medical institutions and schools both domestically
        and internationally to engage in vibrant research activities. These include engineering
        real-world data (RWD), constructing data pipelines, generating real-world evidence
        (RWE), and designing information structures to enhance healthcare delivery and
        outcomes.<br />This comprehensive approach not only boosts the field of digital
        healthcare but also ensures that the solutions developed are grounded in reliable data
        and innovative research practices.
      </p>
      </div>
    </>
  )
}
