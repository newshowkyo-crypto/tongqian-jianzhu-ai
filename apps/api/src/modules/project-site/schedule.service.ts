import { Injectable } from '@nestjs/common';

interface ScheduleTask {
  actualEnd?: string;
  actualStart?: string;
  dependencies: string[];
  id: string;
  isCriticalPath: boolean;
  name: string;
  plannedEnd: string;
  plannedStart: string;
  progressPct: number;
  scheduleId: string;
}

interface Schedule {
  endDate: string;
  id: string;
  projectId: string;
  startDate: string;
  tasks: ScheduleTask[];
  tenantId: string;
  title: string;
}

@Injectable()
export class ScheduleService {
  private readonly schedules = new Map<string, Schedule>();

  createSchedule(input: { endDate: string; projectId: string; startDate: string; tenantId: string; title?: string }): Schedule {
    const schedule: Schedule = { ...input, id: crypto.randomUUID(), tasks: [], title: input.title ?? '主进度计划 v1' };
    this.schedules.set(schedule.id, schedule);
    return schedule;
  }

  addTask(scheduleId: string, task: Omit<ScheduleTask, 'id' | 'isCriticalPath' | 'progressPct' | 'scheduleId'> & { progressPct?: number }): ScheduleTask {
    const schedule = this.must(scheduleId);
    const row: ScheduleTask = { ...task, id: crypto.randomUUID(), isCriticalPath: false, progressPct: task.progressPct ?? 0, scheduleId };
    schedule.tasks.push(row);
    return row;
  }

  updateProgress(taskId: string, pct: number, actualStart?: string, actualEnd?: string): ScheduleTask {
    const task = [...this.schedules.values()].flatMap((schedule) => schedule.tasks).find((item) => item.id === taskId);
    if (!task) throw new Error('SCHEDULE.TASK.NOT_FOUND');
    task.progressPct = Math.max(0, Math.min(100, pct));
    task.actualStart = actualStart ?? task.actualStart;
    task.actualEnd = actualEnd ?? task.actualEnd;
    return task;
  }

  computeCriticalPath(scheduleId: string): ScheduleTask[] {
    const schedule = this.must(scheduleId);
    const tasks = schedule.tasks;
    const byId = new Map(tasks.map((task) => [task.id, task]));
    const duration = (task: ScheduleTask) => Math.max(1, Math.ceil((Date.parse(task.plannedEnd) - Date.parse(task.plannedStart)) / 86_400_000));
    const earliest = new Map<string, number>();
    for (const task of tasks) {
      const forward = Math.max(0, ...task.dependencies.map((id) => (earliest.get(id) ?? 0) + duration(byId.get(id) ?? task)));
      earliest.set(task.id, forward);
    }
    const projectEnd = Math.max(0, ...tasks.map((task) => (earliest.get(task.id) ?? 0) + duration(task)));
    const latest = new Map<string, number>(tasks.map((task) => [task.id, projectEnd - duration(task)]));
    for (const task of [...tasks].reverse()) {
      for (const dep of task.dependencies) {
        const backward = Math.min(latest.get(dep) ?? projectEnd, (latest.get(task.id) ?? projectEnd) - duration(byId.get(dep) ?? task));
        latest.set(dep, backward);
      }
    }
    for (const task of tasks) task.isCriticalPath = (earliest.get(task.id) ?? 0) === (latest.get(task.id) ?? 0);
    return tasks.filter((task) => task.isCriticalPath);
  }

  getDelayReport(scheduleId: string): { delayed: ScheduleTask[]; warnings: string[] } {
    const critical = new Set(this.computeCriticalPath(scheduleId).map((task) => task.id));
    const delayed = this.must(scheduleId).tasks.filter((task) => task.progressPct < 100 && Date.parse(task.plannedEnd) < Date.now());
    return { delayed, warnings: delayed.filter((task) => critical.has(task.id)).map((task) => `${task.name} 位于关键路径，建议立即协调资源。`) };
  }

  private must(scheduleId: string): Schedule {
    const schedule = this.schedules.get(scheduleId);
    if (!schedule) throw new Error('SCHEDULE.NOT_FOUND');
    return schedule;
  }
}
