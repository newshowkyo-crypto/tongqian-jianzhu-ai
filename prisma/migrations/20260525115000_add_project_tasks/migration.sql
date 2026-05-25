CREATE TABLE "project_tasks" (
  "id" TEXT NOT NULL,
  "project_id" TEXT NOT NULL,
  "parent_task_id" TEXT,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "status" TEXT NOT NULL DEFAULT 'todo',
  "priority" TEXT NOT NULL DEFAULT 'normal',
  "category" TEXT,
  "assigned_to" TEXT,
  "reviewer_id" TEXT,
  "due_date" TIMESTAMP(3),
  "completed_at" TIMESTAMP(3),
  "related_schedule_task_id" TEXT,
  "related_claim_id" TEXT,
  "related_change_id" TEXT,
  "tags" TEXT[],
  "created_by" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "project_tasks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "task_comments" (
  "id" TEXT NOT NULL,
  "task_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "attachments" TEXT[],
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "task_comments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "project_tasks_project_id_status_due_date_idx" ON "project_tasks"("project_id", "status", "due_date");
CREATE INDEX "task_comments_task_id_created_at_idx" ON "task_comments"("task_id", "created_at");
