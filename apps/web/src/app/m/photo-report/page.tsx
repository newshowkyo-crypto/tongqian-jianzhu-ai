const items = ['上传现场照片', '识别施工部位', '生成日报草稿', '提交项目经理复核'];

export default function MobilePhotoReportPage(): JSX.Element {
  return (
    <main className="min-h-screen bg-stitch-surface px-4 py-6 text-stitch-on-surface">
      <h1 className="text-2xl font-semibold">拍照日报</h1>
      <ol className="mt-6 space-y-4">
        {items.map((item, index) => <li className="rounded-lg border border-stitch-outline-variant p-4" key={item}>{index + 1}. {item}</li>)}
      </ol>
    </main>
  );
}
