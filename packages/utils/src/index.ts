import { createCipheriv, createDecipheriv, randomBytes, randomUUID } from 'node:crypto';

import { addDays, differenceInCalendarDays, format, isValid, parseISO } from 'date-fns';
import { Decimal } from 'decimal.js';

export const utilsPackageName = '@tongqian/utils';

export const formatDate = (value: Date | string, pattern = 'yyyy-MM-dd'): string => {
  const date = typeof value === 'string' ? parseISO(value) : value;
  if (!isValid(date)) {
    throw new Error('Invalid date value.');
  }
  return format(date, pattern);
};

export const daysBetween = (from: Date | string, to: Date | string): number => {
  const start = typeof from === 'string' ? parseISO(from) : from;
  const end = typeof to === 'string' ? parseISO(to) : to;
  if (!isValid(start) || !isValid(end)) {
    throw new Error('Invalid date value.');
  }
  return differenceInCalendarDays(end, start);
};

export const addCalendarDays = (value: Date | string, amount: number): Date => {
  const date = typeof value === 'string' ? parseISO(value) : value;
  if (!isValid(date)) {
    throw new Error('Invalid date value.');
  }
  return addDays(date, amount);
};

export const toDecimal = (value: Decimal.Value): Decimal => new Decimal(value);

export const addMoney = (left: Decimal.Value, right: Decimal.Value): string =>
  toDecimal(left).plus(right).toFixed(2);

export const subtractMoney = (left: Decimal.Value, right: Decimal.Value): string =>
  toDecimal(left).minus(right).toFixed(2);

export const formatCurrency = (value: Decimal.Value, currency = 'CNY', locale = 'zh-CN'): string =>
  new Intl.NumberFormat(locale, {
    currency,
    style: 'currency',
  }).format(toDecimal(value).toNumber());

export const normalizeWhitespace = (value: string): string => value.trim().replace(/\s+/g, ' ');

export const maskMiddle = (value: string, visibleStart = 3, visibleEnd = 4, mask = '*'): string => {
  if (value.length <= visibleStart + visibleEnd) {
    return mask.repeat(value.length);
  }

  return `${value.slice(0, visibleStart)}${mask.repeat(
    value.length - visibleStart - visibleEnd,
  )}${value.slice(-visibleEnd)}`;
};

export const toKebabCase = (value: string): string =>
  normalizeWhitespace(value)
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

export interface EncryptedPayload {
  algorithm: 'aes-256-gcm';
  ciphertext: string;
  iv: string;
  authTag: string;
}

const normalizeAesKey = (key: Buffer | string): Buffer => {
  const normalized = Buffer.isBuffer(key) ? key : Buffer.from(key, 'base64');
  if (normalized.length !== 32) {
    throw new Error('AES-256-GCM key must be 32 bytes.');
  }
  return normalized;
};

export const encryptAes256Gcm = (plaintext: string, key: Buffer | string): EncryptedPayload => {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', normalizeAesKey(key), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);

  return {
    algorithm: 'aes-256-gcm',
    authTag: cipher.getAuthTag().toString('base64'),
    ciphertext: ciphertext.toString('base64'),
    iv: iv.toString('base64'),
  };
};

export const decryptAes256Gcm = (payload: EncryptedPayload, key: Buffer | string): string => {
  const decipher = createDecipheriv(
    'aes-256-gcm',
    normalizeAesKey(key),
    Buffer.from(payload.iv, 'base64'),
  );
  decipher.setAuthTag(Buffer.from(payload.authTag, 'base64'));

  return Buffer.concat([
    decipher.update(Buffer.from(payload.ciphertext, 'base64')),
    decipher.final(),
  ]).toString('utf8');
};

export const generateTraceId = (prefix = 'trace'): string => `${prefix}_${randomUUID()}`;
