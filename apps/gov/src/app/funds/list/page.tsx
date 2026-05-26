import { AiDisclaimer } from '@tongqian/ui';

const funds = Array.from({ length: 32 }, (_, index) => ({ category: ['national_comprehensive', 'ministry', 'provincial', 'industry_fund', 'policy_loan'][index % 5], code: `PF-${String(index + 1).padStart(2, '0')}`, name: `Policy fund item ${index + 1}` }));

export default function PolicyFundListPage(): JSX.Element {
  return (
    <main className="space-y-6 p-6">
      <section className="space-y-2"><p className="text-sm text-neutral-500">Watermark · internal use · IP trace</p><h1 className="text-2xl font-semibold">Policy fund battle map</h1><p className="max-w-3xl text-sm text-neutral-600">Thirty plus policy funds with category, issuer, review focus, and application window reminders.</p></section>
      <section className="grid gap-4 md:grid-cols-4">{['national_comprehensive', 'ministry', 'provincial', 'industry_fund', 'policy_loan'].map((item) => <button className="rounded-md border border-neutral-300 p-4 text-left text-sm" key={item} type="button">{item}</button>)}</section>
      <section className="overflow-hidden rounded-md border border-neutral-300">{funds.map((fund) => <div className="grid gap-4 border-b border-neutral-300 p-4 text-sm md:grid-cols-3" key={fund.code}><span>{fund.code}</span><span>{fund.name}</span><span>{fund.category}</span></div>)}</section>
      <AiDisclaimer variant="banner" customText="AI fund matching is a policy interpretation aid. Official approval depends on published documents and competent authority review." />
    </main>
  );
}
