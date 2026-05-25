import assert from 'node:assert/strict';
import test from 'node:test';

import { ScheduleService } from './schedule.service.js';

test('ScheduleService computes CPM critical path for chained tasks', () => {
  const service = new ScheduleService();
  const schedule = service.createSchedule({ endDate: '2026-06-20', projectId: 'p1', startDate: '2026-06-01', tenantId: 't1' });
  const a = service.addTask(schedule.id, { dependencies: [], name: 'A', plannedEnd: '2026-06-03', plannedStart: '2026-06-01' });
  const b = service.addTask(schedule.id, { dependencies: [a.id], name: 'B', plannedEnd: '2026-06-08', plannedStart: '2026-06-04' });
  const c = service.addTask(schedule.id, { dependencies: [b.id], name: 'C', plannedEnd: '2026-06-12', plannedStart: '2026-06-09' });
  service.addTask(schedule.id, { dependencies: [a.id], name: 'D', plannedEnd: '2026-06-05', plannedStart: '2026-06-04' });
  service.addTask(schedule.id, { dependencies: [c.id], name: 'E', plannedEnd: '2026-06-16', plannedStart: '2026-06-13' });
  const names = service.computeCriticalPath(schedule.id).map((task) => task.name);
  assert.deepEqual(names, ['A', 'B', 'C', 'E']);
});
