import { GovModulePage } from '../../components/gov-module-page';
import { govModulePages } from '../../m3-pages';

export default function ApprovalsPage() {
  return <GovModulePage copy={govModulePages.approvals} />;
}
