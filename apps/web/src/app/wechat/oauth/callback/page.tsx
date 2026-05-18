import { Button, SectionCard } from '@tongqian/ui';

export default function Page() {
  return (
    <main className="min-h-screen bg-neutral-50 p-4">
      <section className="mx-auto max-w-[375px]">
        <SectionCard title="微信公众号静默授权">
          <p className="text-sm leading-6 text-neutral-600">当前为 snsapi_base 静默授权占位页，生产环境接入公众号 appId 后写入登录态并跳回业务入口。</p>
          <Button className="mt-4 min-h-11 w-full">返回首页</Button>
        </SectionCard>
      </section>
    </main>
  );
}
