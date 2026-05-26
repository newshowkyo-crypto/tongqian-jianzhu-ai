const fields = ['隐患位置', '风险等级', '整改责任人', '截止时间'];

export default function MobileHazardReportPage(): JSX.Element {
  return (
    <main className="min-h-screen bg-stitch-surface px-4 py-6 text-stitch-on-surface">
      <h1 className="text-2xl font-semibold">隐患上报</h1>
      <div className="mt-6 space-y-4">
        {fields.map((field) => <label className="block rounded-lg border border-stitch-outline-variant p-4 text-sm" key={field}>{field}<input className="mt-2 w-full bg-transparent outline-none" /></label>)}
      </div>
    </main>
  );
}
