import { Injectable } from '@nestjs/common';

type TaskStatus = 'blocked' | 'cancelled' | 'doing' | 'done' | 'todo';

interface ProjectTaskRecord {
  category?: string;
  createdBy: string;
  description?: string;
  dueDate?: string;
  id: string;
  priority: 'high' | 'low' | 'normal' | 'urgent';
  projectId: string;
  relatedChangeId?: string;
  relatedClaimId?: string;
  relatedScheduleTaskId?: string;
  status: TaskStatus;
  tags: string[];
  title: string;
}

@Injectable()
export class TaskBoardService {
  private readonly tasks: ProjectTaskRecord[] = [];

  create(input: Omit<ProjectTaskRecord, 'id' | 'priority' | 'status' | 'tags'> & { priority?: ProjectTaskRecord['priority']; status?: TaskStatus; tags?: string[] }): ProjectTaskRecord {
    const task = { ...input, id: crypto.randomUUID(), priority: input.priority ?? 'normal', status: input.status ?? 'todo', tags: input.tags ?? [] };
    this.tasks.push(task);
    return task;
  }

  move(taskId: string, status: TaskStatus): ProjectTaskRecord {
    const task = this.tasks.find((item) => item.id === taskId);
    if (!task) throw new Error('TASK.NOT_FOUND');
    task.status = status;
    return task;
  }

  board(projectId: string): Record<'blocked' | 'doing' | 'done' | 'todo', ProjectTaskRecord[]> {
    const tasks = this.tasks.filter((task) => task.projectId === projectId);
    return {
      blocked: tasks.filter((task) => task.status === 'blocked'),
      doing: tasks.filter((task) => task.status === 'doing'),
      done: tasks.filter((task) => task.status === 'done'),
      todo: tasks.filter((task) => task.status === 'todo'),
    };
  }
}
