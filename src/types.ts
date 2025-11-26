export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string; // ISO string format

  // List organization
  listId: string; // ID of the list this task belongs to
  myDay: boolean; // Whether this task is added to "My Day"

  // Scheduling
  dueDate?: string; // ISO string format
  reminder?: string; // ISO string format for reminder time

  // Priority and categorization
  priority: 'none' | 'low' | 'medium' | 'high';
  tags: string[]; // Custom tags for categorization

  // Subtasks
  steps: Step[];

  // Details
  description?: string; // AI generated summary or detailed description
  notes?: string; // User-added notes

  // AI Import metadata
  sourceType?: 'text' | 'image' | 'pdf'; // Origin of the task
  sourceData?: string; // Base64 image data or file path for preview

  // File attachments
  attachments: Attachment[];

  // Recurrence
  recurrence?: RecurrencePattern;
}

export interface Step {
  id: string;
  text: string;
  completed: boolean;
}

export interface TodoList {
  id: string;
  name: string;
  color: string;
  icon?: string;
  shared: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  data: string; // base64 or path
  size: number;
  uploadedAt: string;
}

export interface RecurrencePattern {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number; // e.g., every 2 days
  daysOfWeek?: number[]; // 0-6 for Sunday-Saturday (for weekly)
  dayOfMonth?: number; // 1-31 (for monthly)
  endDate?: string; // ISO string format
}

export enum FilterType {
  ALL = 'All',
  TODAY = 'Today',
  MYDAY = 'MyDay',
  IMPORTANT = 'Important',
  PLANNED = 'Planned',
  ASSIGNED_TO_ME = 'AssignedToMe',
}

export type SortOption = 'createdAt' | 'dueDate' | 'priority' | 'alphabetical';

