const rows = [
  ['Non-gov provider', 'midlayer'],
  ['Emergency switch', 'deepseek-direct'],
  ['Gov provider', 'aliyun-bailian'],
  ['Midlayer baseURL', 'MIDLAYER_BASE_URL'],
];

export default function AiRoutingPage(): JSX.Element {
  return <main className="space-y-6 p-6"><section className="space-y-2"><p className="text-sm text-neutral-500">Platform owner</p><h1 className="text-2xl font-semibold">AI routing switch</h1></section><section className="overflow-hidden rounded-md border border-neutral-300">{rows.map(([name, value]) => <div className="grid gap-4 border-b border-neutral-300 p-4 text-sm md:grid-cols-2" key={name}><span>{name}</span><span>{value}</span></div>)}</section></main>;
}
