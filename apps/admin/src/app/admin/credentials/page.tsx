'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, type CredentialMode } from '@tongqian/api-client';
import { Alert, Button, DataTable, ErrorState, Input, LoadingState, SectionCard, StatusBadge, Toast } from '@tongqian/ui';
import { useState } from 'react';

import { zhCN } from '../../../i18n/zh-CN';

const providerOptions = [
  ['deepseek', 'DEEPSEEK_API_KEY'],
  ['dashscope', 'ALIYUN_DASHSCOPE_API_KEY'],
  ['openrouter', 'OPENROUTER_API_KEY'],
  ['wechat_pay', 'WECHAT_PAY_*'],
  ['wechat_mp', 'WECHAT_MP_*'],
  ['alipay', 'ALIPAY_*'],
  ['aliyun_oss', 'ALIYUN_OSS_*'],
  ['dashvector', 'DASHVECTOR_API_KEY'],
] as const;

export default function CredentialsPage() {
  const queryClient = useQueryClient();
  const [provider, setProvider] = useState('deepseek');
  const [keyName, setKeyName] = useState('DEEPSEEK_API_KEY');
  const [mode, setMode] = useState<CredentialMode>('real');
  const [secret, setSecret] = useState('');
  const [operatorPassword, setOperatorPassword] = useState('');
  const [toast, setToast] = useState<string>();
  const credentials = useQuery({ queryFn: () => apiClient.credentials.list(), queryKey: ['credentials'] });
  const save = useMutation({
    mutationFn: () => apiClient.credentials.save({ key: keyName, mode, provider, value: secret }),
    onSuccess: async (row) => {
      setToast(`${row.provider} 已提交审批并写入审计`);
      await queryClient.invalidateQueries({ queryKey: ['credentials'] });
    },
  });
  const ping = useMutation({
    mutationFn: () => apiClient.credentials.ping(provider),
    onSuccess: (result) => setToast(result.ok ? `${result.provider} ping 成功：${result.latencyMs}ms` : `${result.provider} 仍为 mock / NEEDS_API_KEY`),
  });
  const activate = useMutation({
    mutationFn: () => apiClient.credentials.switchActive({ operatorPassword, provider }),
    onSuccess: async (row) => {
      setToast(`${row.provider} 已切换为 active，路由热更新已触发`);
      await queryClient.invalidateQueries({ queryKey: ['credentials'] });
    },
  });

  return (
    <section className="text-neutral-950">
      <div className="mb-6 border-b border-neutral-300 pb-4">
        <h1 className="text-2xl font-semibold tracking-normal">{zhCN.credentialsPage.title}</h1>
        <p className="mt-2 text-sm text-neutral-600">{zhCN.credentialsPage.warning}</p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard description="DeepSeek 当前 active；其他 provider 保留代码框架，未充值前自动 mock。" title="凭证保存与热切换">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium">
              {zhCN.credentialsPage.form.provider}
              <select
                className="mt-2 min-h-11 w-full rounded-md border border-neutral-300 px-3 py-2"
                onChange={(event) => {
                  const selected = providerOptions.find(([item]) => item === event.target.value);
                  setProvider(event.target.value);
                  setKeyName(selected?.[1] ?? '');
                  setMode(event.target.value === 'deepseek' ? 'real' : 'mock');
                }}
                value={provider}
              >
                {providerOptions.map(([value, key]) => <option key={value} value={value}>{value} · {key}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium">
              {zhCN.credentialsPage.form.key}
              <Input className="mt-2" onChange={(event) => setKeyName(event.target.value)} value={keyName} />
            </label>
            <fieldset className="rounded-md border border-neutral-300 p-3">
              <legend className="px-1 text-sm font-medium">{zhCN.credentialsPage.form.mode}</legend>
              <label className="mr-4 text-sm">
                <input checked={mode === 'mock'} className="mr-2" name="mode" onChange={() => setMode('mock')} type="radio" />
                {zhCN.credentialsPage.form.mock}
              </label>
              <label className="text-sm">
                <input checked={mode === 'real'} className="mr-2" name="mode" onChange={() => setMode('real')} type="radio" />
                {zhCN.credentialsPage.form.real}
              </label>
            </fieldset>
            <label className="text-sm font-medium">
              {zhCN.credentialsPage.form.value}
              <Input className="mt-2" onChange={(event) => setSecret(event.target.value)} placeholder="[PLACEHOLDER_REAL_SECRET_INPUT]" type="password" value={secret} />
            </label>
            <label className="text-sm font-medium">
              platform-owner 二次密码
              <Input className="mt-2" onChange={(event) => setOperatorPassword(event.target.value)} placeholder="用于 active provider 切换" type="password" value={operatorPassword} />
            </label>
            <div className="flex flex-wrap items-end gap-2">
              <Button disabled={save.isPending} onClick={() => save.mutate()}>{save.isPending ? '保存中' : '保存并审批'}</Button>
              <Button disabled={ping.isPending} onClick={() => ping.mutate()} variant="outline">Ping 验证</Button>
              <Button disabled={activate.isPending || !operatorPassword} onClick={() => activate.mutate()} variant="outline">切换 active</Button>
            </div>
          </div>
        </SectionCard>

        <div className="space-y-4">
          <Alert tone="success">DeepSeek 已作为 M3.8 主路由，合同、标书、资质、政策和早报入口均可兜底。</Alert>
          <Alert tone="warning">微信、支付宝、阿里云、企微等 P1 凭证保持 mock provider，按钮可点、接口可回假数据。</Alert>
          <SectionCard title={zhCN.credentialsPage.audit.title}>
            <ul className="space-y-2 text-sm text-neutral-700">
              {zhCN.credentialsPage.audit.rows.map((row) => <li key={row} className="rounded-sm bg-neutral-100 px-2 py-1">{row}</li>)}
              <li className="rounded-sm bg-neutral-100 px-2 py-1">保存、Ping、切换 active 均记录 traceId</li>
            </ul>
          </SectionCard>
        </div>
      </div>

      <section className="mt-5 rounded-md border border-neutral-300 bg-white p-5 shadow-card">
        <h2 className="mb-3 text-base font-semibold">Provider 列表</h2>
        {credentials.isLoading ? <LoadingState label="正在读取凭证列表" /> : null}
        {credentials.isError ? <ErrorState description="读取失败，已使用 mock provider 兜底。" title="凭证接口异常" /> : null}
        <DataTable
          columns={[
            { header: zhCN.credentialsPage.table.provider, key: 'provider' },
            { header: zhCN.credentialsPage.table.key, key: 'key' },
            { header: zhCN.credentialsPage.table.mode, key: 'mode' },
            { cell: (row) => <StatusBadge status={row.approval === 'disabled' ? 'failed' : row.approval === 'active' ? 'active' : 'pending'} />, header: zhCN.credentialsPage.table.approval, key: 'approval' },
            { header: zhCN.credentialsPage.table.updatedAt, key: 'updatedAt' },
          ]}
          data={(credentials.data ?? []).map((row) => ({ ...row, mode: row.mode, updatedAt: row.updatedAt }))}
          empty="暂无凭证"
          getRowKey={(row) => String(row.key)}
        />
      </section>

      {toast ? <Toast className="fixed bottom-6 right-6 z-50" onClick={() => setToast(undefined)} tone="success">{toast}</Toast> : null}
    </section>
  );
}
