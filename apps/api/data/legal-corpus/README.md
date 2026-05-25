# Legal Corpus Seed

M27 stores six authoritative construction texts as structured corpus metadata first, then parses uploaded PDF/Word/HTML files into clauses.

The placeholder files in `seed/` are intentionally empty. If an official PDF cannot be downloaded automatically, an admin or lawyer uploads the file through `/admin/legal-corpus`; the backend stores it in private OSS, records the source URL, and triggers parsing. The parser keeps the original text, splits clauses by Chinese article markers and numeric standard clauses, then writes `LegalCorpus` and `LegalClause` rows for review.

Required source files:

1. `GF-2017-0201.placeholder` - 建设工程施工合同（示范文本）
2. `BID-LAW-REG-2019.placeholder` - 招标投标法 + 实施条例
3. `QUAL-STD-2022.placeholder` - 建筑业企业资质标准
4. `GB50500-2024.placeholder` - 建设工程工程量清单计价规范
5. `GB50300-2013.placeholder` - 建筑工程施工质量验收统一标准 + 系列
6. `SPC-CONTRACT-2020-25.placeholder` - 最高法建工合同司法解释
