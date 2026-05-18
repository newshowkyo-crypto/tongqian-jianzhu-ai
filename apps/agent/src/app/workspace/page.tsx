import { AgentModulePage } from '../../components/agent-module-page';
import { agentModulePages } from '../../m3-pages';

export default function WorkspacePage() {
  return <AgentModulePage copy={agentModulePages.workspace} />;
}
