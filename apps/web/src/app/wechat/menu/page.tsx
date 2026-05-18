import { DataTable, SectionCard } from '@tongqian/ui';

import { wechatMenuConfig } from '../../../h5-pages';

export default function Page() {
  return (
    <main className="min-h-screen bg-neutral-50 p-4">
      <section className="mx-auto max-w-3xl">
        <SectionCard description="公众号菜单 3 个入口配置，发布前由运营在微信后台复核。" title="微信公众号菜单">
          <DataTable
            columns={[
              { header: '入口', key: 'name' },
              { header: '类型', key: 'type' },
              { header: '路径', key: 'path' },
            ]}
            data={wechatMenuConfig.buttons.map((button) => ({ ...button }))}
            getRowKey={(row) => row.name}
          />
        </SectionCard>
      </section>
    </main>
  );
}
