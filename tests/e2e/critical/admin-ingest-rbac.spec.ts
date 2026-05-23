import { expect, test } from '@playwright/test';

const apiBase = process.env.API_BASE_URL ?? 'http://127.0.0.1:4000';
const endpoint = `${apiBase}/api/v1/admin/ingest/legal-regulation-scraper/run`;

test.describe('admin ingest RBAC', () => {
  test('PLATFORM_OWNER can run admin ingest while tenant OWNER cannot', async ({ request }) => {
    const platformOwner = await request.post(endpoint, {
      headers: {
        authorization: 'Bearer dev-admin',
        'x-platform-role': 'PLATFORM_OWNER',
        'x-position-tags': '',
        'x-roles': 'PLATFORM',
        'x-user-id': 'platform-owner',
      },
    });
    expect(platformOwner.status()).toBe(200);

    const tenantOwner = await request.post(endpoint, {
      headers: {
        authorization: 'Bearer dev-owner',
        'x-platform-role': '',
        'x-position-tags': 'OWNER',
        'x-roles': 'BUILDING_COMPANY_USER',
        'x-user-id': 'tenant-owner',
      },
    });
    expect(tenantOwner.status()).toBe(403);
  });
});
