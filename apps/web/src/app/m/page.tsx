import Link from 'next/link';

const entries = [
  { href: '/m/photo-report', label: '拍照日报', text: '现场照片转日报草稿' },
  { href: '/m/drawing-query', label: '图纸快问', text: '页图、轴网和批注快查' },
  { href: '/m/regulation', label: '法规快查', text: 'GB 条文候选和复核动作' },
  { href: '/m/hazard-report', label: '隐患上报', text: '安全质量问题留痕' },
];

export default function MobilePmHomePage(): JSX.Element {
  return (
    <main className="min-h-screen bg-stitch-surface px-4 py-6 text-stitch-on-surface">
      <h1 className="text-2xl font-semibold">PM 现场工作台</h1>
      <div className="mt-6 grid gap-4">
        {entries.map((entry) => (
          <Link className="rounded-lg border border-stitch-outline-variant bg-stitch-surface-container-low p-4" href={entry.href} key={entry.href}>
            <strong>{entry.label}</strong>
            <p className="mt-2 text-sm text-stitch-on-surface-variant">{entry.text}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
