import { TodoList } from "../types";
import { writeFile, readFile } from "./fs";

const LISTS_FILE = "lists.json";

// Default lists
const DEFAULT_LISTS: TodoList[] = [
    {
        id: "default",
        name: "Tasks",
        color: "#3b82f6",
        icon: "📋",
        shared: false,
        sortOrder: 0,
        createdAt: new Date().toISOString()
    },
    {
        id: "personal",
        name: "Personal",
        color: "#8b5cf6",
        icon: "👤",
        shared: false,
        sortOrder: 1,
        createdAt: new Date().toISOString()
    },
    {
        id: "work",
        name: "Work",
        color: "#10b981",
        icon: "💼",
        shared: false,
        sortOrder: 2,
        createdAt: new Date().toISOString()
    },
    {
        id: "shopping",
        name: "Shopping",
        color: "#f59e0b",
        icon: "🛒",
        shared: false,
        sortOrder: 3,
        createdAt: new Date().toISOString()
    }
];

class ListStore {
    private lists: TodoList[] = [];
    private selectedListId: string = "default";
    private listeners: Array<() => void> = [];

    async init() {
        try {
            const data = await readFile(LISTS_FILE);
            this.lists = JSON.parse(data);
        } catch {
            // File doesn't exist, use defaults
            this.lists = [...DEFAULT_LISTS];
            await this.save();
        }
    }

    private async save() {
        await writeFile(LISTS_FILE, JSON.stringify(this.lists, null, 2));
        this.notifyListeners();
    }

    private notifyListeners() {
        this.listeners.forEach(listener => listener());
    }

    subscribe(listener: () => void) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    getLists(): TodoList[] {
        return [...this.lists].sort((a, b) => a.sortOrder - b.sortOrder);
    }

    getListById(id: string): TodoList | undefined {
        return this.lists.find(list => list.id === id);
    }

    getSelectedListId(): string {
        return this.selectedListId;
    }

    setSelectedListId(id: string) {
        if (this.lists.find(list => list.id === id)) {
            this.selectedListId = id;
            this.notifyListeners();
        }
    }

    async addList(name: string, color: string, icon?: string): Promise<TodoList> {
        const newList: TodoList = {
            id: crypto.randomUUID(),
            name,
            color,
            icon,
            shared: false,
            sortOrder: this.lists.length,
            createdAt: new Date().toISOString()
        };
        this.lists.push(newList);
        await this.save();
        return newList;
    }

    async updateList(id: string, updates: Partial<Omit<TodoList, 'id' | 'createdAt'>>) {
        const index = this.lists.findIndex(list => list.id === id);
        if (index !== -1) {
            this.lists[index] = { ...this.lists[index], ...updates };
            await this.save();
        }
    }

    async deleteList(id: string) {
        // Don't allow deleting the default list
        if (id === "default") return;

        this.lists = this.lists.filter(list => list.id !== id);
        if (this.selectedListId === id) {
            this.selectedListId = "default";
        }
        await this.save();
    }

    async reorderLists(listIds: string[]) {
        const reordered = listIds.map((id, index) => {
            const list = this.lists.find(l => l.id === id);
            if (list) {
                return { ...list, sortOrder: index };
            }
            return null;
        }).filter(Boolean) as TodoList[];

        this.lists = reordered;
        await this.save();
    }
}

export const listStore = new ListStore();
