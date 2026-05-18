import { AgentModulePage } from '../../../components/agent-module-page';
import { agentModulePages } from '../../../m3-pages';

export default function WithdrawalsPage() {
  return <AgentModulePage copy={agentModulePages.withdrawals} />;
}
