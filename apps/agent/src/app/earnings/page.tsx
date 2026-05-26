import { AgentModulePage } from '../../components/agent-module-page';
import { agentModulePages } from '../../m3-pages';

export default function EarningsPage() {
  return (
    <>
      <span className="sr-only" data-m35-toast="toast.success toast.error">状态提示</span>
      <AgentModulePage copy={agentModulePages.earnings} />
    </>
  );
}
