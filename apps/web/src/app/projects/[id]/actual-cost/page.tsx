import { AiDisclaimer } from '@tongqian/ui';

const categories = ['laborCost', 'materialCost', 'machineCost', 'mgmtCost', 'profit'];

export default function ActualCostPage(): JSX.Element {
  return (
    <main className="space-y-6 p-6">
      <section className="space-y-2"><p className="text-sm text-neutral-500">Monthly actual cost</p><h1 className="text-2xl font-semibold">Actual cost entry</h1><p className="max-w-3xl text-sm text-neutral-600">Enter five categories monthly and compare them with the M30 budget line.</p></section>
      <section className="grid gap-4 md:grid-cols-5">{categories.map((category) => <label className="rounded-md border border-outline-variant p-4 text-sm" key={category}>{category}<input className="mt-3 w-full rounded-md border px-3 py-2" defaultValue="0" type="number" /></label>)}</section>
      <AiDisclaimer variant="banner" customText="AI variance analysis depends on accurate monthly cost entries and approved budget baselines." />
    </main>
  );
}
