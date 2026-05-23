import { BusinessFuelPage } from '../../../../../components/business-fuel-page';

export default function NewGoldenTestPage({ params }: { params: { taskType: string } }) {
  return <BusinessFuelPage path={`/admin/golden-tests/${params.taskType}/new`} taskType={params.taskType} />;
}
