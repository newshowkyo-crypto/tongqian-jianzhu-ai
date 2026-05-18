import { AgentModulePage } from '../../components/agent-module-page';
import { agentModulePages } from '../../m3-pages';

export default function TrainingPage() {
  return <AgentModulePage copy={agentModulePages.training} />;
}
