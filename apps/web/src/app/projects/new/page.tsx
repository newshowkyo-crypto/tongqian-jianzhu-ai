'use client';

import { apiClient } from '@tongqian/api-client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState('武汉地铁站点配套工程');
  async function submit() {
    const reply = await apiClient.projectSite.create({ name });
    router.push(`/projects/${reply.projectId}`);
  }
  return <main className="space-y-4 p-6"><h1 className="text-2xl font-semibold">新建项目</h1><input className="min-h-11 rounded-md border p-2" onChange={(event) => setName(event.target.value)} value={name} /><button className="rounded-md bg-navy-deepest px-4 py-2 text-white" onClick={() => void submit()} type="button">保存</button></main>;
}
