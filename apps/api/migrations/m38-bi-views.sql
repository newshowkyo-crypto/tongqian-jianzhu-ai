create view v_bi_monthly_profit as select tenant_id, 0::numeric as value;
create view v_bi_cash_trend as select tenant_id, current_date as day, 0::numeric as inflow, 0::numeric as outflow;
create view v_bi_peer_rank as select tenant_id, 'province'::text as province, 0::int as rank;
create view v_bi_receivable_aging as select tenant_id, 0::numeric as overdue_amount, 0::int as overdue_days;
create view v_bi_tender_pipeline as select tenant_id, 'draft'::text as stage, 0::int as count;
create view v_bi_service_revenue as select tenant_id, 'consulting'::text as service, 0::numeric as revenue;
