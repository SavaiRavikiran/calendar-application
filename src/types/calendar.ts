export interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'meeting' | 'task' | 'reminder';
  location?: string;
  description?: string;
  participants?: string[];
}

export type ViewType = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay';