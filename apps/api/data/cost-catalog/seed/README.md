# Cost Catalog Seed

M28 only adds the schema and importer. Do not import the 5GB CWICR dataset in this milestone.

Source candidates:

- DDC CWICR: `datadrivenconstruction/OpenConstructionEstimate-DDC-CWICR`
- License: CC BY 4.0. Keep attribution when importing.
- Target catalog examples: `ddc_cn_shanghai`, `ddc_cn_beijing`, `GB50500-2024-bj`.

Field mapping from CWICR 85-field style into the V1 12 fields:

| CWICR field group | V1 field |
|---|---|
| classification / trade / section | `classCode` |
| item_code / work_item_id | `workCode` |
| work description zh | `description` |
| work description en | `descriptionEn` |
| uom / unit | `unit` |
| labor unit cost | `laborCost` |
| material unit cost | `materialCost` |
| equipment / machinery cost | `machineryCost` |
| overhead / markup | `overheadCost` |
| total unit price | `totalUnitPrice` |
| productivity / labor hours | `laborHours` |
| keywords / tags / synonyms | `keywords` |
