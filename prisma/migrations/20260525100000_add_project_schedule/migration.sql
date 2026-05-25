CREATE TABLE "project_schedules" (
  "id" UUID NOT NULL,
  "project_id" TEXT NOT NULL,
  "title" TEXT NOT NULL DEFAULT '主进度计划 v1',
  "version" INTEGER NOT NULL DEFAULT 1,
  "start_date" TIMESTAMP(3) NOT NULL,
  "end_date" TIMESTAMP(3) NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'active',
  "tenant_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "project_schedules_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "schedule_tasks" (
  "id" UUID NOT NULL,
  "schedule_id" UUID NOT NULL,
  "parent_id" UUID,
  "name" TEXT NOT NULL,
  "planned_start" TIMESTAMP(3) NOT NULL,
  "planned_end" TIMESTAMP(3) NOT NULL,
  "actual_start" TIMESTAMP(3),
  "actual_end" TIMESTAMP(3),
  "progress_pct" INTEGER NOT NULL DEFAULT 0,
  "is_critical_path" BOOLEAN NOT NULL DEFAULT false,
  "dependencies" TEXT[],
  CONSTRAINT "schedule_tasks_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "project_schedules_project_id_idx" ON "project_schedules"("project_id");
CREATE INDEX "schedule_tasks_schedule_id_idx" ON "schedule_tasks"("schedule_id");
ALTER TABLE "schedule_tasks" ADD CONSTRAINT "schedule_tasks_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "project_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "schedule_tasks" ADD CONSTRAINT "schedule_tasks_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "schedule_tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
