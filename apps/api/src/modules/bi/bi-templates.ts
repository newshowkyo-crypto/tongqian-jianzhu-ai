export type BiTemplate = {
  chart: 'bar' | 'line' | 'number' | 'table';
  id: string;
  params: string[];
  sqlView: string;
  title: string;
};

export const BI_TEMPLATES: BiTemplate[] = [
  { chart: 'number', id: 'last_month_profit', params: ['month'], sqlView: 'v_bi_monthly_profit', title: 'Last month profit' },
  { chart: 'line', id: 'cash_inflow_trend', params: ['months'], sqlView: 'v_bi_cash_trend', title: 'Cash inflow trend' },
  { chart: 'line', id: 'cash_outflow_trend', params: ['months'], sqlView: 'v_bi_cash_trend', title: 'Cash outflow trend' },
  { chart: 'bar', id: 'province_peer_rank', params: ['province'], sqlView: 'v_bi_peer_rank', title: 'Province peer rank' },
  { chart: 'bar', id: 'project_margin_rank', params: ['limit'], sqlView: 'v_bi_project_margin', title: 'Project margin rank' },
  { chart: 'table', id: 'overdue_receivables', params: ['days'], sqlView: 'v_bi_receivable_aging', title: 'Overdue receivables' },
  { chart: 'number', id: 'bid_win_rate', params: ['months'], sqlView: 'v_bi_bid_win_rate', title: 'Bid win rate' },
  { chart: 'bar', id: 'bid_cost_by_month', params: ['months'], sqlView: 'v_bi_bid_cost', title: 'Bid cost by month' },
  { chart: 'number', id: 'credit_balance', params: [], sqlView: 'v_bi_credit_balance', title: 'Credit balance' },
  { chart: 'bar', id: 'agent_conversion', params: ['months'], sqlView: 'v_bi_agent_conversion', title: 'Agent conversion' },
  { chart: 'table', id: 'top_customers', params: ['limit'], sqlView: 'v_bi_customer_value', title: 'Top customers' },
  { chart: 'line', id: 'subscription_mrr', params: ['months'], sqlView: 'v_bi_subscription_mrr', title: 'Subscription MRR' },
  { chart: 'number', id: 'gross_margin', params: ['month'], sqlView: 'v_bi_monthly_profit', title: 'Gross margin' },
  { chart: 'bar', id: 'cost_overrun_projects', params: ['limit'], sqlView: 'v_bi_cost_overrun', title: 'Cost overrun projects' },
  { chart: 'table', id: 'policy_opportunities', params: ['province'], sqlView: 'v_bi_policy_opportunities', title: 'Policy opportunities' },
  { chart: 'line', id: 'report_usage_trend', params: ['months'], sqlView: 'v_bi_report_usage', title: 'Report usage trend' },
  { chart: 'bar', id: 'tender_pipeline_stage', params: [], sqlView: 'v_bi_tender_pipeline', title: 'Tender pipeline stage' },
  { chart: 'number', id: 'average_payment_days', params: ['months'], sqlView: 'v_bi_receivable_aging', title: 'Average payment days' },
  { chart: 'table', id: 'risk_red_projects', params: [], sqlView: 'v_bi_project_risk', title: 'Risk red projects' },
  { chart: 'bar', id: 'qualification_gap_count', params: [], sqlView: 'v_bi_qualification_gap', title: 'Qualification gap count' },
  { chart: 'line', id: 'daily_active_owners', params: ['days'], sqlView: 'v_bi_activity', title: 'Daily active owners' },
  { chart: 'line', id: 'daily_active_agents', params: ['days'], sqlView: 'v_bi_activity', title: 'Daily active agents' },
  { chart: 'number', id: 'consulting_leads', params: ['month'], sqlView: 'v_bi_consulting_leads', title: 'Consulting leads' },
  { chart: 'bar', id: 'lead_source_mix', params: ['month'], sqlView: 'v_bi_consulting_leads', title: 'Lead source mix' },
  { chart: 'table', id: 'renewal_risk_accounts', params: ['days'], sqlView: 'v_bi_renewal_risk', title: 'Renewal risk accounts' },
  { chart: 'number', id: 'abs_reits_candidates', params: [], sqlView: 'v_bi_financing_candidates', title: 'ABS REITs candidates' },
  { chart: 'bar', id: 'service_revenue_mix', params: ['month'], sqlView: 'v_bi_service_revenue', title: 'Service revenue mix' },
  { chart: 'table', id: 'high_value_projects', params: ['limit'], sqlView: 'v_bi_high_value_projects', title: 'High value projects' },
  { chart: 'line', id: 'ai_credit_consumption', params: ['days'], sqlView: 'v_bi_credit_consumption', title: 'AI credit consumption' },
  { chart: 'number', id: 'owner_roi_estimate', params: ['month'], sqlView: 'v_bi_owner_roi', title: 'Owner ROI estimate' },
];
