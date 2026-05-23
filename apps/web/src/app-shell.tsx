'use client';

import { apiClient } from '@tongqian/api-client';
import {
  CyberAiOrb,
  Award,
  Bell,
  Building2,
  Calculator,
  CyberShell,
  FileImage,
  FileSearch,
  HardHat,
  Megaphone,
  MessageSquare,
  Radar,
  Settings,
  Shield,
  Sparkles,
  UserCheck,
  Wallet,
  Wrench,
  type CyberChatPanelProps,
  type CyberShellNavigationItem,
} from '@tongqian/ui';
import type { CyberHeroProps } from '@tongqian/ui/cyber';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { zhCN } from './i18n/zh-CN';

const iconMap = {
  approvals: Bell,
  billing: Wallet,
  cashflow: Calculator,
  contracts: Shield,
  dashboard: Radar,
  dispatch: UserCheck,
  documents: FileImage,
  finance: Wallet,
  opportunities: Megaphone,
  projects: Building2,
  qualifications: Award,
  reports: FileSearch,
  services: Sparkles,
  settings: Settings,
  tenders: HardHat,
  tools: Wrench,
  workspace: MessageSquare,
};

const navigationItems: CyberShellNavigationItem[] = zhCN.navigation.items.map((item) => ({
  group: item.group,
  groupLabel: 'groupLabel' in item ? item.groupLabel : undefined,
  href: item.href,
  icon: item.icon,
  label: item.label,
}));
const cyberImportCheck: CyberHeroProps['className'] = 'web-cyber-shell';
void cyberImportCheck;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPublic = pathname === '/login' || pathname === '/forbidden';

  if (isPublic) {
    return <>{children}</>;
  }

  const current = navigationItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
  const tenant = zhCN.navigation.tenants[0] ?? zhCN.brand.name;

  const currentContext: CyberChatPanelProps['currentContext'] = {
    module: pathname.includes('/contracts') ? 'contract' : pathname.includes('/tenders') ? 'tender' : pathname.includes('/qualifications') ? 'qualification' : pathname.includes('/opportunities') ? 'opportunity' : pathname.includes('/reports') ? 'report' : 'dashboard',
    pathname,
    resourceId: pathname.split('/').filter(Boolean).at(1),
  };

  async function sendAssistantMessage(input: Parameters<NonNullable<CyberChatPanelProps['onSend']>>[0]) {
    const reply = await apiClient.aiGateway.invoke({
      taskType: 'chat.long',
      context: { ...input.context, personaId: input.personaId, recentMessages: input.messages.slice(-3) },
      userInput: input.userInput,
    });
    return {
      confidence: 'medium' as const,
      content: reply.text ?? reply.summary ?? '已读取上下文并生成建议。',
      tier: 2 as const,
    };
  }

  return (
    <CyberShell
      actionLabels={{
        avatar: zhCN.brand.agent.slice(0, 1),
        avatarTitle: zhCN.brand.agent,
        notifications: zhCN.navigation.notifications,
        tenant,
        tenantTitle: zhCN.brand.name,
        theme: zhCN.navigation.theme,
      }}
      assistant={<CyberAiOrb currentContext={currentContext} onConvert={async (targetTask) => { const reply = await apiClient.chatHub.convert('latest', targetTask); if (typeof window !== 'undefined') window.location.href = `/${targetTask === 'risk-review' ? 'contracts' : targetTask}s/${reply.taskId}`; }} onSend={sendAssistantMessage} />}
      brand={{ eyebrow: zhCN.brand.name, href: '/dashboard', title: zhCN.brand.subBrand }}
      currentLabel={current?.label}
      currentPath={pathname}
      homeLabel={zhCN.navigation.home}
      iconMap={iconMap}
      navigation={navigationItems}
      searchPlaceholder={zhCN.navigation.search}
    >
      {children}
    </CyberShell>
  );
}
