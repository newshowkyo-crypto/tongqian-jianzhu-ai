const rows = [
  ['China-hosted AI routing', 'aliyun-bailian enforced'],
  ['Audit retention', '6 years'],
  ['Overseas export', 'blocked for gov sourcing/policy'],
  ['Gamification', 'disabled for gov/SOE'],
];

export default function GovCompliancePage(): JSX.Element {
  return <main className="space-y-6 p-6"><section className="space-y-2"><p className="text-sm text-neutral-500">Platform owner</p><h1 className="text-2xl font-semibold">Gov compliance guardrail</h1></section><section className="overflow-hidden rounded-md border border-neutral-300">{rows.map(([name, status]) => <div className="grid gap-4 border-b border-neutral-300 p-4 text-sm md:grid-cols-2" key={name}><span>{name}</span><span>{status}</span></div>)}</section></main>;
}
