// LIVE /about/ verbatim — see docs/phi-lab-content/06_about.md for the
// authoritative snapshot. Three paragraphs only; no Values, no Contact.

export default function About() {
  return (
    <div className="mx-auto max-w-[720px] px-6 py-12">
      <h1>About Lab</h1>

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
  )
}
