import { Injectable } from '@nestjs/common';

interface MeetingRow {
  id: string;
  ownerId?: string;
  projectId?: string;
  tenantId: string;
  title: string;
  transcript: string;
}

interface TodoRow {
  assigneeId?: string;
  id: string;
  meetingId?: string;
  status: 'closed' | 'open';
  tenantId: string;
  title: string;
}

const meetings = new Map<string, MeetingRow>();
const todos: TodoRow[] = [];

@Injectable()
export class MeetingService {
  submitTranscript(input: { ownerId?: string; projectId?: string; tenantId: string; title: string; transcript: string }): MeetingRow {
    const row = { ...input, id: crypto.randomUUID() };
    meetings.set(row.id, row);
    return row;
  }

  generateMinute(meetingId: string): { actionItems: TodoRow[]; decisions: string[]; meetingId: string; summary: string } {
    const meeting = meetings.get(meetingId);
    if (!meeting) throw new Error('MEETING_NOT_FOUND');
    const decisions = meeting.transcript.includes('approve') ? ['Approved action from transcript'] : ['Needs owner confirmation'];
    const actionItems = this.actionItems(meeting);
    todos.push(...actionItems);
    return { actionItems, decisions, meetingId, summary: meeting.transcript.slice(0, 160) };
  }

  actionItems(meeting: MeetingRow): TodoRow[] {
    return ['Confirm owner decision', 'Send project follow-up'].map((title) => ({ assigneeId: meeting.ownerId, id: crypto.randomUUID(), meetingId: meeting.id, status: 'open', tenantId: meeting.tenantId, title }));
  }

  listMyTodos(tenantId: string, ownerId: string): TodoRow[] {
    return todos.filter((todo) => todo.tenantId === tenantId && (todo.assigneeId === ownerId || !todo.assigneeId));
  }
}
