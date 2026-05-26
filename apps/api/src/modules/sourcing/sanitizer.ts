const phonePattern = /1[3-9]\d{9}/g;
const emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const companyPattern = /(有限责任公司|有限公司|集团|联系人|电话)/g;

export function sanitizeSourcingText(input: string): string {
  return input.replace(phonePattern, '[phone-redacted]').replace(emailPattern, '[email-redacted]').replace(companyPattern, '[identity-redacted]');
}
