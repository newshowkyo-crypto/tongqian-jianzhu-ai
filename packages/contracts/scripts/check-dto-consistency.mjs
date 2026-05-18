import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const openapiPath = resolve(repoRoot, 'packages/contracts/openapi.yaml');
const apiResponsePath = resolve(repoRoot, 'packages/types/src/common/api-response.ts');

const [openapi, apiResponse] = await Promise.all([
  readFile(openapiPath, 'utf8'),
  readFile(apiResponsePath, 'utf8'),
]);

const requiredResponseFields = ['code', 'data', 'message', 'traceId'];
const missingTypeFields = requiredResponseFields.filter((field) => !apiResponse.includes(`${field}:`));
const missingOpenapiFields = requiredResponseFields.filter((field) => !openapi.includes(`        - ${field}`));

if (missingTypeFields.length > 0 || missingOpenapiFields.length > 0) {
  console.error('OpenAPI response envelope is out of sync with packages/types.');
  console.error(`Missing in ApiResponse: ${missingTypeFields.join(', ') || 'none'}`);
  console.error(`Missing in OpenAPI schemas: ${missingOpenapiFields.join(', ') || 'none'}`);
  process.exit(1);
}

if (!apiResponse.includes('data: T | null') || !openapi.includes("type: 'null'")) {
  console.error('ApiErrorResponse data must stay nullable/null in both types and OpenAPI.');
  process.exit(1);
}

console.log('OpenAPI response envelope matches packages/types common ApiResponse.');
