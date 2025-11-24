export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string; // ISO string format
  description?: string; // AI generated summary or detailed description
  sourceType?: 'text' | 'image' | 'pdf'; // Origin of the task
}

export enum FilterType {
  ALL = 'All',
  TODAY = 'Today',
}
