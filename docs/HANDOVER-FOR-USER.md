# Handover For User

M6 leaves only three manual items.

## 1. Fill P1/P2 Credentials

Path: `/admin/credentials`

Screenshot refs:
- `tests/e2e/screenshots/m6/m6-admin-credentials-overview.png`
- `tests/e2e/screenshots/m6/m6-admin-credentials-edit-drawer.png`

What to do: fill real values for payment, notification, storage, AI model, and data collection providers. Switch each row from `mock` to `real`, then click test connection.

Estimated time: 60-120 minutes, depending on how many provider consoles are already open.

## 2. Upload Desensitized Real Samples

Path: admin data/ingest areas, especially `/ingest/court-judgments`, `/ingest/ocr`, and data-center sample import pages.

Screenshot refs:
- `tests/e2e/screenshots/m6/m6-admin-jobs.png`
- `tests/e2e/screenshots/m6/m6-admin-health.png`

What to do: upload 5-10 desensitized real contracts, tender files, and qualification samples to OSS-backed storage so demo fixtures can be gradually replaced with customer-shaped samples.

Estimated time: 45-90 minutes.

## 3. Complete ICP Filing

Path: `/admin/credentials`, key `ICP_RECORD_NO`

Screenshot refs:
- `tests/e2e/screenshots/m6/m6-admin-credentials-overview.png`
- `tests/e2e/screenshots/m6/m6-admin-observability.png`

What to do: after ICP approval, fill `ICP_RECORD_NO`, switch it to `real`, and keep the approval record in the credential audit drawer.

Estimated time: 10 minutes after ICP approval is issued.
