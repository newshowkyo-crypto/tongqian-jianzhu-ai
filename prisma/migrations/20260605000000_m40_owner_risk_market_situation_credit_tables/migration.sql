CREATE TABLE "bid_proposals" (
    "id" UUID NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "tender_id" TEXT NOT NULL,
    "scoring_criteria" JSONB NOT NULL,
    "tier_badge" INTEGER NOT NULL DEFAULT 3,
    "confidence" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bid_proposals_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "bid_sections" (
    "id" UUID NOT NULL,
    "proposal_id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "quality_issues" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bid_sections_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "agent_followup_reminders" (
    "id" UUID NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "scenario" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "script" TEXT,
    "due_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_followup_reminders_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "predictive_alerts" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "time_window" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "prediction" TEXT NOT NULL,
    "action_suggestion" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "triggered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dismissed_at" TIMESTAMP(3),

    CONSTRAINT "predictive_alerts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "workflows" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'running',
    "intent" TEXT NOT NULL,
    "plan" JSONB NOT NULL,
    "result" JSONB,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "workflows_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "workflow_steps" (
    "id" TEXT NOT NULL,
    "workflow_id" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL,
    "tool_name" TEXT NOT NULL,
    "params" JSONB NOT NULL,
    "output" JSONB,
    "status" TEXT NOT NULL,
    "error_message" TEXT,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "workflow_steps_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "share_links" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "resource_type" TEXT NOT NULL,
    "resource_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "max_reads" INTEGER,
    "read_count" INTEGER NOT NULL DEFAULT 0,
    "audit_log" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "share_links_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "materials" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "spec" TEXT,
    "unit" TEXT NOT NULL,
    "planned_qty" DECIMAL(18,3) NOT NULL,
    "actual_qty" DECIMAL(18,3) NOT NULL DEFAULT 0,
    "loss_rate" DECIMAL(8,4) NOT NULL DEFAULT 0,
    "avg_unit_cost" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "materials_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "stocks" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "material_id" UUID NOT NULL,
    "on_hand_qty" DECIMAL(18,3) NOT NULL DEFAULT 0,
    "last_check_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stocks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "stock_movements" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "material_id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "qty" DECIMAL(18,3) NOT NULL,
    "unitPrice" DECIMAL(18,4),
    "note" TEXT,
    "operator_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "subcontracts" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "subcontractor_name" TEXT NOT NULL,
    "subcontractor_phone" TEXT,
    "work_scope" TEXT NOT NULL,
    "contract_amount" DECIMAL(18,2) NOT NULL,
    "paid_amount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "contract_file_id" TEXT,
    "contract_review_id" TEXT,
    "start_date" DATE,
    "end_date" DATE,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "subcontracts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "subcontract_evaluations" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "subcontract_id" UUID NOT NULL,
    "quality" INTEGER NOT NULL,
    "schedule" INTEGER NOT NULL,
    "safety" INTEGER NOT NULL,
    "cooperation" INTEGER NOT NULL,
    "settlement" INTEGER NOT NULL,
    "overall" DECIMAL(4,2) NOT NULL,
    "note" TEXT,
    "evaluator_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subcontract_evaluations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "subcontractor_blacklist" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "subcontractor_name" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "avg_score" DECIMAL(4,2),
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "added_by" UUID,

    CONSTRAINT "subcontractor_blacklist_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "actual_costs" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "period" TEXT NOT NULL,
    "labor_cost" DECIMAL(18,2) NOT NULL,
    "material_cost" DECIMAL(18,2) NOT NULL,
    "machine_cost" DECIMAL(18,2) NOT NULL,
    "mgmt_cost" DECIMAL(18,2) NOT NULL,
    "profit" DECIMAL(18,2) NOT NULL,
    "total_cost" DECIMAL(18,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "actual_costs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "cost_budget_variances" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "actual_cost_id" UUID NOT NULL,
    "category" TEXT NOT NULL,
    "budget_amount" DECIMAL(18,2) NOT NULL,
    "actual_amount" DECIMAL(18,2) NOT NULL,
    "variance_amount" DECIMAL(18,2) NOT NULL,
    "variance_rate" DECIMAL(8,4) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cost_budget_variances_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "quality_checkpoints" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "standard_ref" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "photo_urls" JSONB NOT NULL,
    "checked_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quality_checkpoints_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "rectification_orders" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "checkpoint_id" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "responsible_id" UUID,
    "due_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'open',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rectification_orders_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "hazard_closures" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "verifier_id" UUID,
    "verify_result" TEXT NOT NULL,
    "evidence_urls" JSONB NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hazard_closures_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "drawing_annotations" (
    "id" UUID NOT NULL,
    "drawing_id" UUID NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "page_no" INTEGER NOT NULL DEFAULT 1,
    "x" DECIMAL(8,4) NOT NULL,
    "y" DECIMAL(8,4) NOT NULL,
    "note" TEXT NOT NULL,
    "author_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "drawing_annotations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "reminder_sends" (
    "id" UUID NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "receivable_id" UUID NOT NULL,
    "channel" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reminder_sends_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "agent_opportunity_sources" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "agent_subtype" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "source_url" TEXT,
    "region" TEXT NOT NULL,
    "crawl_interval" INTEGER NOT NULL DEFAULT 86400,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "last_crawled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_opportunity_sources_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "agent_opportunities" (
    "id" UUID NOT NULL,
    "source_id" UUID NOT NULL,
    "agent_subtype" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "target_company" TEXT,
    "target_uscc" TEXT,
    "event_type" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "raw_data" JSONB,
    "discovered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deadline" TIMESTAMP(3),
    "ai_score" DECIMAL(5,2),

    CONSTRAINT "agent_opportunities_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "agent_opportunity_matches" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "agent_id" UUID NOT NULL,
    "opportunity_id" UUID NOT NULL,
    "match_score" DECIMAL(5,2) NOT NULL,
    "ai_pitch" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "contacted_at" TIMESTAMP(3),
    "won_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_opportunity_matches_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "agent_customer_notes" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "agent_id" UUID NOT NULL,
    "customer_tenant_id" UUID NOT NULL,
    "note_type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "next_action_date" TIMESTAMP(3),
    "next_action_desc" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_customer_notes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "agent_deals" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "agent_id" UUID NOT NULL,
    "customer_tenant_id" UUID NOT NULL,
    "source_type" TEXT NOT NULL,
    "source_id" UUID,
    "title" TEXT NOT NULL,
    "service_type" TEXT NOT NULL,
    "estimate_amount" DECIMAL(18,2),
    "stage" TEXT NOT NULL DEFAULT 'lead',
    "probability" INTEGER NOT NULL DEFAULT 20,
    "expect_close_date" TIMESTAMP(3),
    "lost_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_deals_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "agent_scripts" (
    "id" UUID NOT NULL,
    "category" TEXT NOT NULL,
    "service_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "ai_generated" BOOLEAN NOT NULL DEFAULT false,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_scripts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "agent_customer_bindings" (
    "id" UUID NOT NULL,
    "agent_id" UUID NOT NULL,
    "customer_tenant_id" UUID NOT NULL,
    "referral_code" TEXT NOT NULL,
    "bind_source_type" TEXT NOT NULL,
    "bound_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_permanent" BOOLEAN NOT NULL DEFAULT true,
    "transfer_reason" TEXT,
    "transferred_at" TIMESTAMP(3),

    CONSTRAINT "agent_customer_bindings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "agent_commission_ledger" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "agent_id" UUID NOT NULL,
    "customer_tenant_id" UUID NOT NULL,
    "binding_id" UUID NOT NULL,
    "source_type" TEXT NOT NULL,
    "source_order_id" UUID,
    "gross_amount" DECIMAL(18,2) NOT NULL,
    "commission_rate" DECIMAL(5,4) NOT NULL,
    "commission_amount" DECIMAL(18,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'frozen',
    "frozen_until" TIMESTAMP(3),
    "settled_at" TIMESTAMP(3),
    "paid_at" TIMESTAMP(3),
    "clawback_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_commission_ledger_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "agent_customer_health_scores" (
    "id" UUID NOT NULL,
    "binding_id" UUID NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 70,
    "last_interacted_at" TIMESTAMP(3),
    "last_order_at" TIMESTAMP(3),
    "next_renewal_date" TIMESTAMP(3),
    "renewal_type" TEXT,
    "riskLevel" TEXT NOT NULL DEFAULT 'low',
    "risk_reasons" JSONB,
    "ai_suggestion" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_customer_health_scores_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "agent_knowledge_articles" (
    "id" UUID NOT NULL,
    "category" TEXT NOT NULL,
    "agent_subtype" TEXT,
    "region" TEXT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "source_url" TEXT,
    "published_at" TIMESTAMP(3),
    "ai_generated" BOOLEAN NOT NULL DEFAULT false,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_knowledge_articles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "agent_qual_material_checks" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "agent_id" UUID NOT NULL,
    "customer_tenant_id" UUID,
    "target_qual" TEXT NOT NULL,
    "uploaded_files" JSONB NOT NULL,
    "missing_items" JSONB,
    "not_meet_items" JSONB,
    "complete_pct" DECIMAL(5,2),
    "ai_confidence" TEXT NOT NULL DEFAULT 'medium',
    "credits_cost" INTEGER NOT NULL DEFAULT 200,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_qual_material_checks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "agent_qual_performance_archives" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "agent_id" UUID NOT NULL,
    "customer_tenant_id" UUID,
    "raw_file_count" INTEGER NOT NULL,
    "classified_items" JSONB NOT NULL,
    "package_zip_url" TEXT,
    "credits_cost" INTEGER NOT NULL DEFAULT 300,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_qual_performance_archives_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "agent_qual_personnel_gaps" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "agent_id" UUID NOT NULL,
    "customer_tenant_id" UUID,
    "target_qual" TEXT NOT NULL,
    "current_personnel" JSONB NOT NULL,
    "required_personnel" JSONB NOT NULL,
    "gap_list" JSONB NOT NULL,
    "credits_cost" INTEGER NOT NULL DEFAULT 100,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_qual_personnel_gaps_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "agent_tender_qualify_matches" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "agent_id" UUID NOT NULL,
    "customer_tenant_id" UUID,
    "tender_file_url" TEXT NOT NULL,
    "extracted_criteria" JSONB NOT NULL,
    "customer_match_result" JSONB,
    "credits_cost" INTEGER NOT NULL DEFAULT 150,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_tender_qualify_matches_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "agent_tender_proposal_drafts" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "agent_id" UUID NOT NULL,
    "customer_tenant_id" UUID,
    "tender_file_url" TEXT NOT NULL,
    "scoring_points" JSONB NOT NULL,
    "chapter_drafts" JSONB NOT NULL,
    "docx_url" TEXT,
    "progress_pct" INTEGER NOT NULL DEFAULT 0,
    "credits_cost" INTEGER NOT NULL,
    "ai_confidence" TEXT NOT NULL DEFAULT 'medium',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_tender_proposal_drafts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "agent_tender_qa_responses" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "agent_id" UUID NOT NULL,
    "customer_tenant_id" UUID,
    "qa_file_url" TEXT NOT NULL,
    "favorable_changes" JSONB NOT NULL,
    "unfavorable_changes" JSONB NOT NULL,
    "suggested_actions" JSONB NOT NULL,
    "affected_proposal_chapters" JSONB,
    "credits_cost" INTEGER NOT NULL DEFAULT 100,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_tender_qa_responses_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "agent_fin_financing_proposals" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "agent_id" UUID NOT NULL,
    "customer_tenant_id" UUID,
    "customer_profile" JSONB NOT NULL,
    "financing_need" JSONB NOT NULL,
    "proposal_sections" JSONB NOT NULL,
    "financial_model" JSONB,
    "docx_url" TEXT,
    "credits_cost" INTEGER NOT NULL DEFAULT 1000,
    "ai_confidence" TEXT NOT NULL DEFAULT 'medium',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_fin_financing_proposals_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "agent_fin_credit_reports" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "agent_id" UUID NOT NULL,
    "customer_tenant_id" UUID,
    "report_source_files" JSONB NOT NULL,
    "red_line_items" JSONB NOT NULL,
    "yellow_line_items" JSONB NOT NULL,
    "improvement_suggestions" JSONB NOT NULL,
    "overall_risk_level" TEXT NOT NULL,
    "credits_cost" INTEGER NOT NULL DEFAULT 200,
    "ai_confidence" TEXT NOT NULL DEFAULT 'medium',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_fin_credit_reports_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "agent_quick_reply_sessions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "agent_id" UUID NOT NULL,
    "customer_tenant_id" UUID,
    "customer_question" TEXT NOT NULL,
    "aiReply" TEXT NOT NULL,
    "reply_tone" TEXT NOT NULL DEFAULT 'professional',
    "copied_at" TIMESTAMP(3),
    "credits_cost" INTEGER NOT NULL DEFAULT 50,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_quick_reply_sessions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "gov_documents" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "doc_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "attachments" JSONB,
    "doc_number" TEXT,
    "issuer" TEXT,
    "watermark" TEXT NOT NULL,
    "generator_ip" TEXT NOT NULL,
    "generator_user_id" UUID NOT NULL,
    "credits_cost" INTEGER NOT NULL,
    "ai_confidence" TEXT NOT NULL DEFAULT 'medium',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gov_documents_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "meeting_minutes_asr" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "audio_url" TEXT NOT NULL,
    "transcript" TEXT NOT NULL,
    "structured_minute" JSONB NOT NULL,
    "watermark" TEXT NOT NULL,
    "generator_ip" TEXT NOT NULL,
    "credits_cost" INTEGER NOT NULL DEFAULT 300,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meeting_minutes_asr_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "policy_fund_matches" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "fund_id" UUID NOT NULL,
    "project_feature" JSONB NOT NULL,
    "match_score" DECIMAL(5,2) NOT NULL,
    "success_probability" DECIMAL(5,2),
    "apply_path" JSONB,
    "ai_confidence" TEXT NOT NULL DEFAULT 'medium',
    "credits_cost" INTEGER NOT NULL DEFAULT 500,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "policy_fund_matches_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "policy_fund_subscriptions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "fund_id" UUID NOT NULL,
    "notify_channels" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "policy_fund_subscriptions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "policy_fund_applications" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "fund_id" UUID NOT NULL,
    "project_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "submitted_at" TIMESTAMP(3),
    "result_at" TIMESTAMP(3),
    "fail_reason" TEXT,
    "ai_analysis" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "policy_fund_applications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "policy_docs" (
    "id" UUID NOT NULL,
    "level" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "source_url" TEXT,
    "body" TEXT NOT NULL,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "policy_docs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "policy_impact_interpretations" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "policy_doc_id" UUID NOT NULL,
    "impact_summary" TEXT NOT NULL,
    "ai_confidence" TEXT NOT NULL DEFAULT 'medium',
    "credits_cost" INTEGER NOT NULL DEFAULT 100,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "policy_impact_interpretations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sourcing_projects" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "direction" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sanitized_summary" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "estimate_budget" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "sourcing_projects_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sourcing_chats" (
    "id" UUID NOT NULL,
    "sourcing_project_id" UUID NOT NULL,
    "from_tenant_id" UUID NOT NULL,
    "to_tenant_id" UUID NOT NULL,
    "sanitized_content" TEXT NOT NULL,
    "intent_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sourcing_chats_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ai_routing_mode" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "non_gov_provider" TEXT NOT NULL DEFAULT 'midlayer',
    "midlayer_base_url" TEXT,
    "midlayer_enabled" BOOLEAN NOT NULL DEFAULT true,
    "last_switched_at" TIMESTAMP(3),
    "last_switched_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_routing_mode_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "owner_risk_profiles" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "owner_name" TEXT NOT NULL,
    "id_card_masked" TEXT,
    "credit_code" TEXT,
    "overall_risk_level" TEXT NOT NULL DEFAULT 'medium',
    "guarantee_risk_level" TEXT NOT NULL DEFAULT 'medium',
    "mixing_risk_level" TEXT NOT NULL DEFAULT 'medium',
    "counterparty_risk_level" TEXT NOT NULL DEFAULT 'medium',
    "receivable_risk_level" TEXT NOT NULL DEFAULT 'medium',
    "risk_score" INTEGER NOT NULL DEFAULT 50,
    "last_analyzed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "owner_risk_profiles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "owner_risk_cards" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "card_type" TEXT NOT NULL,
    "card_key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "risk_level" TEXT NOT NULL,
    "tier_badge" INTEGER NOT NULL DEFAULT 3,
    "confidence" TEXT NOT NULL DEFAULT 'medium',
    "unlock_credits" INTEGER NOT NULL DEFAULT 50,
    "is_unlocked" BOOLEAN NOT NULL DEFAULT false,
    "is_ai_generated" BOOLEAN NOT NULL DEFAULT true,
    "data_snapshot" JSONB NOT NULL,
    "data_source" TEXT,
    "source_url" TEXT,
    "disclaimer" TEXT NOT NULL DEFAULT 'report.disclaimer.ai_reference',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "owner_risk_cards_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "owner_guarantee_records" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "guaranteed_company" TEXT NOT NULL,
    "guarantee_amount" DECIMAL(18,2) NOT NULL,
    "guarantee_type" TEXT NOT NULL,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "risk_level" TEXT NOT NULL,
    "ai_analysis" TEXT,
    "document_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "owner_guarantee_records_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "owner_company_mixing_records" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "mixing_type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "risk_level" TEXT NOT NULL,
    "evidence" JSONB NOT NULL,
    "ai_suggestion" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "owner_company_mixing_records_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "counterparty_watchlist" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "counterparty_name" TEXT NOT NULL,
    "counterparty_code" TEXT,
    "counterparty_type" TEXT NOT NULL,
    "risk_level" TEXT NOT NULL DEFAULT 'low',
    "risk_events" JSONB NOT NULL DEFAULT '[]',
    "last_event_at" TIMESTAMP(3),
    "ai_analysis" TEXT,
    "is_watched" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "counterparty_watchlist_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "counterparty_risk_events" (
    "id" UUID NOT NULL,
    "counterparty_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "event_type" TEXT NOT NULL,
    "event_date" TIMESTAMP(3) NOT NULL,
    "eventSummary" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'low',
    "source" TEXT NOT NULL,
    "source_url" TEXT,
    "ai_interpretation" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "counterparty_risk_events_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "receivable_risk_records" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "debtor_name" TEXT NOT NULL,
    "debtor_code" TEXT,
    "amount" DECIMAL(18,2) NOT NULL,
    "invoice_no" TEXT,
    "invoice_date" TIMESTAMP(3),
    "due_date" TIMESTAMP(3),
    "age_bucket" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'normal',
    "risk_level" TEXT NOT NULL,
    "ai_analysis" TEXT,
    "collection_suggest" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "receivable_risk_records_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "owner_risk_reports" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "report_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "tier_badge" INTEGER NOT NULL DEFAULT 3,
    "confidence" TEXT NOT NULL DEFAULT 'medium',
    "risk_level" TEXT NOT NULL,
    "executive_summary" TEXT NOT NULL,
    "data_snapshot" JSONB NOT NULL,
    "sections" JSONB NOT NULL DEFAULT '[]',
    "h5_url" TEXT,
    "pdf_url" TEXT,
    "ai_task_id" UUID,
    "report_id" UUID,
    "credits_cost" INTEGER NOT NULL DEFAULT 0,
    "disclaimer" TEXT NOT NULL DEFAULT 'report.disclaimer.ai_reference',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "owner_risk_reports_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "owner_risk_unlock_logs" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "card_id" UUID,
    "card_key" TEXT,
    "credits_charged" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'success',
    "trace_id" TEXT NOT NULL,
    "idempotency_key" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "owner_risk_unlock_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "owner_risk_review_requests" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "report_id" UUID,
    "review_type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "ticket_id" TEXT,
    "assigned_to" TEXT,
    "review_result" TEXT,
    "credits_cost" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "owner_risk_review_requests_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "owner_risk_generation_logs" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "generation_type" TEXT NOT NULL,
    "ai_task_id" UUID,
    "input_snapshot" JSONB NOT NULL,
    "output_snapshot" JSONB,
    "credits_cost" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'success',
    "error_code" TEXT,
    "trace_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "owner_risk_generation_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "owner_risk_rule_configs" (
    "id" UUID NOT NULL,
    "rule_key" TEXT NOT NULL,
    "rule_name" TEXT NOT NULL,
    "rule_type" TEXT NOT NULL,
    "config_json" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "updated_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "owner_risk_rule_configs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "owner_risk_disclaimers" (
    "id" UUID NOT NULL,
    "disclaimer_key" TEXT NOT NULL,
    "disclaimer_type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "owner_risk_disclaimers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "market_signals" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "signal_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "business_line" TEXT,
    "risk_level" TEXT NOT NULL DEFAULT 'low',
    "opportunity_level" TEXT NOT NULL DEFAULT 'medium',
    "confidence" TEXT NOT NULL DEFAULT 'medium',
    "source_id" UUID,
    "source_url" TEXT,
    "raw_data" JSONB,
    "impact_analysis" JSONB,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "tier_badge" INTEGER NOT NULL DEFAULT 3,
    "unlock_credits" INTEGER NOT NULL DEFAULT 50,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "feedback_count" INTEGER NOT NULL DEFAULT 0,
    "tags" JSONB NOT NULL DEFAULT '[]',
    "published_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "market_signals_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "market_signal_sources" (
    "id" UUID NOT NULL,
    "source_name" TEXT NOT NULL,
    "source_type" TEXT NOT NULL,
    "source_url" TEXT,
    "region" TEXT NOT NULL,
    "data_types" JSONB NOT NULL DEFAULT '[]',
    "crawl_interval_min" INTEGER NOT NULL DEFAULT 60,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_crawled_at" TIMESTAMP(3),
    "health_status" TEXT NOT NULL DEFAULT 'unknown',

    CONSTRAINT "market_signal_sources_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "market_signal_tags" (
    "id" UUID NOT NULL,
    "tag_key" TEXT NOT NULL,
    "tag_name" TEXT NOT NULL,
    "tag_category" TEXT NOT NULL,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "market_signal_tags_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "market_signal_unlock_logs" (
    "id" UUID NOT NULL,
    "signal_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "unlock_type" TEXT NOT NULL,
    "credits_charged" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'success',
    "trace_id" TEXT NOT NULL,
    "idempotency_key" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "market_signal_unlock_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "market_signal_simulations" (
    "id" UUID NOT NULL,
    "signal_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "simulation_type" TEXT NOT NULL,
    "input_params" JSONB NOT NULL,
    "simulation_result" JSONB NOT NULL,
    "confidence" TEXT NOT NULL DEFAULT 'medium',
    "tier_badge" INTEGER NOT NULL DEFAULT 3,
    "ai_task_id" UUID,
    "credits_cost" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "market_signal_simulations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "market_signal_reports" (
    "id" UUID NOT NULL,
    "signal_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "report_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "tier_badge" INTEGER NOT NULL DEFAULT 3,
    "confidence" TEXT NOT NULL DEFAULT 'medium',
    "executive_summary" TEXT NOT NULL,
    "data_snapshot" JSONB NOT NULL,
    "h5_url" TEXT,
    "pdf_url" TEXT,
    "ai_task_id" UUID,
    "report_id" UUID,
    "credits_cost" INTEGER NOT NULL DEFAULT 0,
    "disclaimer" TEXT NOT NULL DEFAULT 'report.disclaimer.ai_reference',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "market_signal_reports_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "market_signal_feedbacks" (
    "id" UUID NOT NULL,
    "signal_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "feedback_type" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "market_signal_feedbacks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "market_signal_generation_logs" (
    "id" UUID NOT NULL,
    "signal_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "generation_type" TEXT NOT NULL,
    "ai_task_id" UUID,
    "input_snapshot" JSONB NOT NULL,
    "output_snapshot" JSONB,
    "credits_cost" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'success',
    "error_code" TEXT,
    "trace_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "market_signal_generation_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "market_signal_rule_configs" (
    "id" UUID NOT NULL,
    "rule_key" TEXT NOT NULL,
    "rule_name" TEXT NOT NULL,
    "rule_type" TEXT NOT NULL,
    "config_json" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "updated_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "market_signal_rule_configs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "compliance_sensitive_terms" (
    "id" UUID NOT NULL,
    "term_key" TEXT NOT NULL,
    "term_pattern" TEXT NOT NULL,
    "term_category" TEXT NOT NULL,
    "severity_level" TEXT NOT NULL DEFAULT 'medium',
    "description" TEXT,
    "refusal_template" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_sensitive_terms_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "compliance_refusal_templates" (
    "id" UUID NOT NULL,
    "template_key" TEXT NOT NULL,
    "refusal_type" TEXT NOT NULL,
    "templateContent" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_refusal_templates_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ai_output_audit_samples" (
    "id" UUID NOT NULL,
    "ai_task_id" UUID NOT NULL,
    "task_type" TEXT NOT NULL,
    "input_hash" TEXT NOT NULL,
    "output_snapshot" JSONB NOT NULL,
    "audit_result" TEXT NOT NULL,
    "auditReason" TEXT,
    "audited_by" TEXT,
    "auditor_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_output_audit_samples_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ai_compliance_logs" (
    "id" UUID NOT NULL,
    "ai_task_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "check_type" TEXT NOT NULL,
    "check_result" TEXT NOT NULL,
    "blocked_content" TEXT,
    "rewrite_result" TEXT,
    "triggered_rules" JSONB,
    "credits_cost" INTEGER NOT NULL DEFAULT 0,
    "trace_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_compliance_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "bid_proposals_tenant_id_tender_id_idx" ON "bid_proposals"("tenant_id", "tender_id");

CREATE INDEX "bid_sections_proposal_id_key_idx" ON "bid_sections"("proposal_id", "key");

CREATE INDEX "agent_followup_reminders_tenant_id_agent_id_status_due_at_idx" ON "agent_followup_reminders"("tenant_id", "agent_id", "status", "due_at");

CREATE INDEX "predictive_alerts_tenant_id_user_id_triggered_at_idx" ON "predictive_alerts"("tenant_id", "user_id", "triggered_at");

CREATE INDEX "workflows_tenant_id_user_id_status_idx" ON "workflows"("tenant_id", "user_id", "status");

CREATE INDEX "workflow_steps_workflow_id_order_index_idx" ON "workflow_steps"("workflow_id", "order_index");

CREATE UNIQUE INDEX "share_links_token_key" ON "share_links"("token");

CREATE INDEX "share_links_resource_type_resource_id_idx" ON "share_links"("resource_type", "resource_id");

CREATE INDEX "materials_tenant_id_project_id_idx" ON "materials"("tenant_id", "project_id");

CREATE UNIQUE INDEX "stocks_project_id_material_id_key" ON "stocks"("project_id", "material_id");

CREATE INDEX "stock_movements_project_id_material_id_created_at_idx" ON "stock_movements"("project_id", "material_id", "created_at");

CREATE INDEX "subcontracts_tenant_id_project_id_status_idx" ON "subcontracts"("tenant_id", "project_id", "status");

CREATE INDEX "subcontract_evaluations_subcontract_id_created_at_idx" ON "subcontract_evaluations"("subcontract_id", "created_at");

CREATE UNIQUE INDEX "subcontractor_blacklist_tenant_id_subcontractor_name_key" ON "subcontractor_blacklist"("tenant_id", "subcontractor_name");

CREATE UNIQUE INDEX "actual_costs_project_id_period_key" ON "actual_costs"("project_id", "period");

CREATE INDEX "cost_budget_variances_project_id_category_created_at_idx" ON "cost_budget_variances"("project_id", "category", "created_at");

CREATE INDEX "quality_checkpoints_tenant_id_project_id_created_at_idx" ON "quality_checkpoints"("tenant_id", "project_id", "created_at");

CREATE INDEX "rectification_orders_tenant_id_project_id_status_idx" ON "rectification_orders"("tenant_id", "project_id", "status");

CREATE INDEX "hazard_closures_tenant_id_order_id_idx" ON "hazard_closures"("tenant_id", "order_id");

CREATE INDEX "drawing_annotations_tenant_id_drawing_id_page_no_idx" ON "drawing_annotations"("tenant_id", "drawing_id", "page_no");

CREATE INDEX "reminder_sends_tenant_id_receivable_id_sent_at_idx" ON "reminder_sends"("tenant_id", "receivable_id", "sent_at");

CREATE UNIQUE INDEX "agent_opportunity_sources_code_key" ON "agent_opportunity_sources"("code");

CREATE INDEX "agent_opportunity_sources_agent_subtype_region_enabled_idx" ON "agent_opportunity_sources"("agent_subtype", "region", "enabled");

CREATE INDEX "agent_opportunities_agent_subtype_region_discovered_at_idx" ON "agent_opportunities"("agent_subtype", "region", "discovered_at");

CREATE INDEX "agent_opportunities_target_uscc_idx" ON "agent_opportunities"("target_uscc");

CREATE INDEX "agent_opportunity_matches_tenant_id_agent_id_status_idx" ON "agent_opportunity_matches"("tenant_id", "agent_id", "status");

CREATE UNIQUE INDEX "agent_opportunity_matches_agent_id_opportunity_id_key" ON "agent_opportunity_matches"("agent_id", "opportunity_id");

CREATE INDEX "agent_customer_notes_agent_id_customer_tenant_id_created_at_idx" ON "agent_customer_notes"("agent_id", "customer_tenant_id", "created_at");

CREATE INDEX "agent_deals_agent_id_stage_created_at_idx" ON "agent_deals"("agent_id", "stage", "created_at");

CREATE INDEX "agent_scripts_category_service_type_idx" ON "agent_scripts"("category", "service_type");

CREATE UNIQUE INDEX "agent_customer_bindings_customer_tenant_id_key" ON "agent_customer_bindings"("customer_tenant_id");

CREATE INDEX "agent_customer_bindings_agent_id_bound_at_idx" ON "agent_customer_bindings"("agent_id", "bound_at");

CREATE INDEX "agent_commission_ledger_agent_id_status_created_at_idx" ON "agent_commission_ledger"("agent_id", "status", "created_at");

CREATE INDEX "agent_commission_ledger_customer_tenant_id_source_type_idx" ON "agent_commission_ledger"("customer_tenant_id", "source_type");

CREATE UNIQUE INDEX "agent_customer_health_scores_binding_id_key" ON "agent_customer_health_scores"("binding_id");

CREATE INDEX "agent_customer_health_scores_next_renewal_date_riskLevel_idx" ON "agent_customer_health_scores"("next_renewal_date", "riskLevel");

CREATE INDEX "agent_knowledge_articles_category_agent_subtype_region_publ_idx" ON "agent_knowledge_articles"("category", "agent_subtype", "region", "published_at");

CREATE INDEX "agent_qual_material_checks_agent_id_customer_tenant_id_crea_idx" ON "agent_qual_material_checks"("agent_id", "customer_tenant_id", "created_at");

CREATE INDEX "agent_qual_performance_archives_agent_id_customer_tenant_id_idx" ON "agent_qual_performance_archives"("agent_id", "customer_tenant_id", "created_at");

CREATE INDEX "agent_qual_personnel_gaps_agent_id_customer_tenant_id_idx" ON "agent_qual_personnel_gaps"("agent_id", "customer_tenant_id");

CREATE INDEX "agent_tender_qualify_matches_agent_id_customer_tenant_id_cr_idx" ON "agent_tender_qualify_matches"("agent_id", "customer_tenant_id", "created_at");

CREATE INDEX "agent_tender_proposal_drafts_agent_id_customer_tenant_id_cr_idx" ON "agent_tender_proposal_drafts"("agent_id", "customer_tenant_id", "created_at");

CREATE INDEX "agent_tender_qa_responses_agent_id_customer_tenant_id_creat_idx" ON "agent_tender_qa_responses"("agent_id", "customer_tenant_id", "created_at");

CREATE INDEX "agent_fin_financing_proposals_agent_id_customer_tenant_id_c_idx" ON "agent_fin_financing_proposals"("agent_id", "customer_tenant_id", "created_at");

CREATE INDEX "agent_fin_credit_reports_agent_id_customer_tenant_id_create_idx" ON "agent_fin_credit_reports"("agent_id", "customer_tenant_id", "created_at");

CREATE INDEX "agent_quick_reply_sessions_agent_id_customer_tenant_id_crea_idx" ON "agent_quick_reply_sessions"("agent_id", "customer_tenant_id", "created_at");

CREATE INDEX "gov_documents_tenant_id_user_id_doc_type_created_at_idx" ON "gov_documents"("tenant_id", "user_id", "doc_type", "created_at");

CREATE INDEX "meeting_minutes_asr_tenant_id_user_id_created_at_idx" ON "meeting_minutes_asr"("tenant_id", "user_id", "created_at");

CREATE INDEX "policy_fund_matches_tenant_id_user_id_created_at_idx" ON "policy_fund_matches"("tenant_id", "user_id", "created_at");

CREATE UNIQUE INDEX "policy_fund_subscriptions_user_id_fund_id_key" ON "policy_fund_subscriptions"("user_id", "fund_id");

CREATE INDEX "policy_fund_applications_tenant_id_user_id_status_idx" ON "policy_fund_applications"("tenant_id", "user_id", "status");

CREATE INDEX "policy_docs_level_topic_published_at_idx" ON "policy_docs"("level", "topic", "published_at");

CREATE INDEX "policy_impact_interpretations_tenant_id_policy_doc_id_idx" ON "policy_impact_interpretations"("tenant_id", "policy_doc_id");

CREATE INDEX "sourcing_projects_direction_region_status_idx" ON "sourcing_projects"("direction", "region", "status");

CREATE INDEX "sourcing_chats_sourcing_project_id_created_at_idx" ON "sourcing_chats"("sourcing_project_id", "created_at");

CREATE INDEX "owner_risk_profiles_tenant_id_user_id_idx" ON "owner_risk_profiles"("tenant_id", "user_id");

CREATE INDEX "owner_risk_profiles_credit_code_idx" ON "owner_risk_profiles"("credit_code");

CREATE INDEX "owner_risk_cards_tenant_id_user_id_card_type_idx" ON "owner_risk_cards"("tenant_id", "user_id", "card_type");

CREATE INDEX "owner_risk_cards_card_key_idx" ON "owner_risk_cards"("card_key");

CREATE INDEX "owner_guarantee_records_profile_id_status_idx" ON "owner_guarantee_records"("profile_id", "status");

CREATE INDEX "owner_guarantee_records_tenant_id_idx" ON "owner_guarantee_records"("tenant_id");

CREATE INDEX "owner_company_mixing_records_profile_id_idx" ON "owner_company_mixing_records"("profile_id");

CREATE INDEX "owner_company_mixing_records_tenant_id_mixing_type_idx" ON "owner_company_mixing_records"("tenant_id", "mixing_type");

CREATE INDEX "counterparty_watchlist_profile_id_risk_level_idx" ON "counterparty_watchlist"("profile_id", "risk_level");

CREATE INDEX "counterparty_watchlist_tenant_id_counterparty_type_idx" ON "counterparty_watchlist"("tenant_id", "counterparty_type");

CREATE INDEX "counterparty_risk_events_counterparty_id_event_date_idx" ON "counterparty_risk_events"("counterparty_id", "event_date");

CREATE INDEX "counterparty_risk_events_tenant_id_event_type_severity_idx" ON "counterparty_risk_events"("tenant_id", "event_type", "severity");

CREATE INDEX "receivable_risk_records_profile_id_status_idx" ON "receivable_risk_records"("profile_id", "status");

CREATE INDEX "receivable_risk_records_tenant_id_age_bucket_idx" ON "receivable_risk_records"("tenant_id", "age_bucket");

CREATE INDEX "owner_risk_reports_tenant_id_user_id_created_at_idx" ON "owner_risk_reports"("tenant_id", "user_id", "created_at");

CREATE INDEX "owner_risk_reports_profile_id_report_type_idx" ON "owner_risk_reports"("profile_id", "report_type");

CREATE INDEX "owner_risk_unlock_logs_tenant_id_user_id_created_at_idx" ON "owner_risk_unlock_logs"("tenant_id", "user_id", "created_at");

CREATE INDEX "owner_risk_unlock_logs_profile_id_idx" ON "owner_risk_unlock_logs"("profile_id");

CREATE INDEX "owner_risk_review_requests_tenant_id_status_idx" ON "owner_risk_review_requests"("tenant_id", "status");

CREATE INDEX "owner_risk_review_requests_profile_id_idx" ON "owner_risk_review_requests"("profile_id");

CREATE INDEX "owner_risk_generation_logs_tenant_id_user_id_created_at_idx" ON "owner_risk_generation_logs"("tenant_id", "user_id", "created_at");

CREATE INDEX "owner_risk_generation_logs_profile_id_idx" ON "owner_risk_generation_logs"("profile_id");

CREATE UNIQUE INDEX "owner_risk_rule_configs_rule_key_key" ON "owner_risk_rule_configs"("rule_key");

CREATE INDEX "owner_risk_rule_configs_rule_type_is_active_idx" ON "owner_risk_rule_configs"("rule_type", "is_active");

CREATE UNIQUE INDEX "owner_risk_disclaimers_disclaimer_key_key" ON "owner_risk_disclaimers"("disclaimer_key");

CREATE INDEX "owner_risk_disclaimers_disclaimer_type_is_active_idx" ON "owner_risk_disclaimers"("disclaimer_type", "is_active");

CREATE INDEX "market_signals_tenant_id_user_id_published_at_idx" ON "market_signals"("tenant_id", "user_id", "published_at");

CREATE INDEX "market_signals_region_risk_level_idx" ON "market_signals"("region", "risk_level");

CREATE INDEX "market_signals_signal_type_published_at_idx" ON "market_signals"("signal_type", "published_at");

CREATE INDEX "market_signal_sources_source_type_is_active_idx" ON "market_signal_sources"("source_type", "is_active");

CREATE UNIQUE INDEX "market_signal_tags_tag_key_key" ON "market_signal_tags"("tag_key");

CREATE INDEX "market_signal_tags_tag_category_idx" ON "market_signal_tags"("tag_category");

CREATE INDEX "market_signal_unlock_logs_tenant_id_user_id_created_at_idx" ON "market_signal_unlock_logs"("tenant_id", "user_id", "created_at");

CREATE INDEX "market_signal_unlock_logs_signal_id_idx" ON "market_signal_unlock_logs"("signal_id");

CREATE INDEX "market_signal_simulations_tenant_id_user_id_created_at_idx" ON "market_signal_simulations"("tenant_id", "user_id", "created_at");

CREATE INDEX "market_signal_simulations_signal_id_idx" ON "market_signal_simulations"("signal_id");

CREATE INDEX "market_signal_reports_tenant_id_user_id_created_at_idx" ON "market_signal_reports"("tenant_id", "user_id", "created_at");

CREATE INDEX "market_signal_reports_signal_id_idx" ON "market_signal_reports"("signal_id");

CREATE INDEX "market_signal_feedbacks_signal_id_feedback_type_idx" ON "market_signal_feedbacks"("signal_id", "feedback_type");

CREATE INDEX "market_signal_feedbacks_tenant_id_created_at_idx" ON "market_signal_feedbacks"("tenant_id", "created_at");

CREATE INDEX "market_signal_generation_logs_tenant_id_user_id_created_at_idx" ON "market_signal_generation_logs"("tenant_id", "user_id", "created_at");

CREATE INDEX "market_signal_generation_logs_signal_id_idx" ON "market_signal_generation_logs"("signal_id");

CREATE UNIQUE INDEX "market_signal_rule_configs_rule_key_key" ON "market_signal_rule_configs"("rule_key");

CREATE INDEX "market_signal_rule_configs_rule_type_is_active_idx" ON "market_signal_rule_configs"("rule_type", "is_active");

CREATE UNIQUE INDEX "compliance_sensitive_terms_term_key_key" ON "compliance_sensitive_terms"("term_key");

CREATE INDEX "compliance_sensitive_terms_term_category_is_active_idx" ON "compliance_sensitive_terms"("term_category", "is_active");

CREATE UNIQUE INDEX "compliance_refusal_templates_template_key_key" ON "compliance_refusal_templates"("template_key");

CREATE INDEX "compliance_refusal_templates_refusal_type_is_active_idx" ON "compliance_refusal_templates"("refusal_type", "is_active");

CREATE INDEX "ai_output_audit_samples_task_type_audit_result_idx" ON "ai_output_audit_samples"("task_type", "audit_result");

CREATE INDEX "ai_output_audit_samples_ai_task_id_idx" ON "ai_output_audit_samples"("ai_task_id");

CREATE INDEX "ai_compliance_logs_tenant_id_check_type_created_at_idx" ON "ai_compliance_logs"("tenant_id", "check_type", "created_at");

CREATE INDEX "ai_compliance_logs_ai_task_id_idx" ON "ai_compliance_logs"("ai_task_id");

ALTER TABLE "workflow_steps" ADD CONSTRAINT "workflow_steps_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "stocks" ADD CONSTRAINT "stocks_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "subcontract_evaluations" ADD CONSTRAINT "subcontract_evaluations_subcontract_id_fkey" FOREIGN KEY ("subcontract_id") REFERENCES "subcontracts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "cost_budget_variances" ADD CONSTRAINT "cost_budget_variances_actual_cost_id_fkey" FOREIGN KEY ("actual_cost_id") REFERENCES "actual_costs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "rectification_orders" ADD CONSTRAINT "rectification_orders_checkpoint_id_fkey" FOREIGN KEY ("checkpoint_id") REFERENCES "quality_checkpoints"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "hazard_closures" ADD CONSTRAINT "hazard_closures_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "rectification_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "agent_opportunity_matches" ADD CONSTRAINT "agent_opportunity_matches_opportunity_id_fkey" FOREIGN KEY ("opportunity_id") REFERENCES "agent_opportunities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "agent_commission_ledger" ADD CONSTRAINT "agent_commission_ledger_binding_id_fkey" FOREIGN KEY ("binding_id") REFERENCES "agent_customer_bindings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "agent_customer_health_scores" ADD CONSTRAINT "agent_customer_health_scores_binding_id_fkey" FOREIGN KEY ("binding_id") REFERENCES "agent_customer_bindings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "policy_fund_matches" ADD CONSTRAINT "policy_fund_matches_fund_id_fkey" FOREIGN KEY ("fund_id") REFERENCES "policy_funds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "policy_fund_subscriptions" ADD CONSTRAINT "policy_fund_subscriptions_fund_id_fkey" FOREIGN KEY ("fund_id") REFERENCES "policy_funds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "policy_impact_interpretations" ADD CONSTRAINT "policy_impact_interpretations_policy_doc_id_fkey" FOREIGN KEY ("policy_doc_id") REFERENCES "policy_docs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "sourcing_chats" ADD CONSTRAINT "sourcing_chats_sourcing_project_id_fkey" FOREIGN KEY ("sourcing_project_id") REFERENCES "sourcing_projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "owner_guarantee_records" ADD CONSTRAINT "owner_guarantee_records_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "owner_risk_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "owner_company_mixing_records" ADD CONSTRAINT "owner_company_mixing_records_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "owner_risk_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "counterparty_watchlist" ADD CONSTRAINT "counterparty_watchlist_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "owner_risk_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "counterparty_risk_events" ADD CONSTRAINT "counterparty_risk_events_counterparty_id_fkey" FOREIGN KEY ("counterparty_id") REFERENCES "counterparty_watchlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "receivable_risk_records" ADD CONSTRAINT "receivable_risk_records_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "owner_risk_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "owner_risk_reports" ADD CONSTRAINT "owner_risk_reports_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "owner_risk_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "owner_risk_unlock_logs" ADD CONSTRAINT "owner_risk_unlock_logs_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "owner_risk_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "owner_risk_review_requests" ADD CONSTRAINT "owner_risk_review_requests_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "owner_risk_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "owner_risk_generation_logs" ADD CONSTRAINT "owner_risk_generation_logs_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "owner_risk_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "market_signals" ADD CONSTRAINT "market_signals_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "market_signal_sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "market_signal_unlock_logs" ADD CONSTRAINT "market_signal_unlock_logs_signal_id_fkey" FOREIGN KEY ("signal_id") REFERENCES "market_signals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "market_signal_simulations" ADD CONSTRAINT "market_signal_simulations_signal_id_fkey" FOREIGN KEY ("signal_id") REFERENCES "market_signals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "market_signal_reports" ADD CONSTRAINT "market_signal_reports_signal_id_fkey" FOREIGN KEY ("signal_id") REFERENCES "market_signals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "market_signal_feedbacks" ADD CONSTRAINT "market_signal_feedbacks_signal_id_fkey" FOREIGN KEY ("signal_id") REFERENCES "market_signals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "market_signal_generation_logs" ADD CONSTRAINT "market_signal_generation_logs_signal_id_fkey" FOREIGN KEY ("signal_id") REFERENCES "market_signals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
