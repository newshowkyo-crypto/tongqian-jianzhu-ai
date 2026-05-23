'use client';

import { apiClient } from '@tongqian/api-client';
import {
  AiAssistantBubble,
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
  type AiAssistantWidgetMessage,
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

  async function sendAssistantMessage(messages: AiAssistantWidgetMessage[]) {
    const reply = await apiClient.ai.chat(messages, 'contract.review.basic');
    return {
      buttons: reply.buttons,
      confidence: reply.confidence,
      content: reply.message.content,
      tier: reply.tier,
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
      assistant={<AiAssistantBubble onSend={sendAssistantMessage} role="owner" />}
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
