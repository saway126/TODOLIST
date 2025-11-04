export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string; // ISO string format
}

export enum FilterType {
  ALL = 'All',
  TODAY = 'Today',
}
