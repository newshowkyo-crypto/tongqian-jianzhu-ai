const prompts = ['这处梁高是否变更', '门窗表和图纸是否一致', '截图里影响工程量的点'];

export default function MobileDrawingQueryPage(): JSX.Element {
  return (
    <main className="min-h-screen bg-stitch-surface px-4 py-6 text-stitch-on-surface">
      <h1 className="text-2xl font-semibold">图纸快问</h1>
      <div className="mt-6 space-y-4">
        {prompts.map((prompt) => <button className="w-full rounded-lg border border-stitch-outline-variant p-4 text-left" key={prompt}>{prompt}</button>)}
      </div>
    </main>
  );
}
