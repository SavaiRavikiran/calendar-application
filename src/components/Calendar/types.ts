export type ViewType = 'month' | 'week' | 'day';

export interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'meeting' | 'task' | 'reminder';
  location?: string;
  participants?: string[];
}