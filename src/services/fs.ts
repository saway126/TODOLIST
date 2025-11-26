import {
  readTextFile,
  writeTextFile,
  createDir,
  exists,
} from "@tauri-apps/api/fs";
import { appDataDir, join } from "@tauri-apps/api/path";
import { Todo } from "../types";

const TODO_FILE = "todos.json";

let dataDir: string | null = null;

const getAppDataDir = async (): Promise<string> => {
  if (!dataDir) {
    dataDir = await appDataDir();
  }
  return dataDir;
}

/**
 * Generic function to read any JSON file from app data directory
 */
export const readFile = async (filename: string): Promise<string> => {
  const dir = await getAppDataDir();
  const filePath = await join(dir, filename);

  if (!(await exists(filePath))) {
    throw new Error(`File ${filename} does not exist`);
  }

  return await readTextFile(filePath);
};

/**
 * Generic function to write any JSON file to app data directory
 */
export const writeFile = async (filename: string, content: string): Promise<void> => {
  const dir = await getAppDataDir();
  const filePath = await join(dir, filename);

  // Ensure the directory exists before writing
  if (!(await exists(dir))) {
    await createDir(dir, { recursive: true });
  }

  await writeTextFile(filePath, content);
};

/**
 * Reads todos from the JSON file in the app's data directory.
 * @returns A promise that resolves to an array of todos.
 */
export const readTodos = async (): Promise<Todo[]> => {
  const dir = await getAppDataDir();
  const filePath = await join(dir, TODO_FILE);

  try {
    if (!(await exists(filePath))) {
      // If the file doesn't exist, return example data.
      return [
        {
          id: '1',
          text: 'Learn Tauri and TypeScript',
          completed: true,
          createdAt: new Date().toISOString(),
          listId: 'default',
          myDay: false,
          priority: 'none',
          tags: [],
          steps: [],
          attachments: []
        },
        {
          id: '2',
          text: 'Build a beautiful Desktop App',
          completed: false,
          createdAt: new Date().toISOString(),
          listId: 'default',
          myDay: true,
          priority: 'high',
          tags: ['development'],
          steps: [],
          attachments: []
        },
        {
          id: '3',
          text: 'Explore keyboard shortcuts',
          completed: false,
          createdAt: new Date().toISOString(),
          listId: 'default',
          myDay: false,
          priority: 'low',
          tags: [],
          steps: [],
          attachments: []
        },
      ];
    }
    const content = await readTextFile(filePath);
    return JSON.parse(content) as Todo[];
  } catch (error) {
    console.error("Failed to read todos:", error);
    return []; // Return empty array on error
  }
};

/**
 * Writes an array of todos to the JSON file in the app's data directory.
 * @param todos The array of todos to save.
 */
export const writeTodos = async (todos: Todo[]): Promise<void> => {
  const dir = await getAppDataDir();
  const filePath = await join(dir, TODO_FILE);

  try {
    // Ensure the directory exists before writing
    if (!(await exists(dir))) {
      await createDir(dir, { recursive: true });
    }
    const content = JSON.stringify(todos, null, 2); // Pretty print JSON
    await writeTextFile(filePath, content);
  } catch (error) {
    console.error("Failed to write todos:", error);
  }
};