import { Todo } from "../types";

export class AIParser {
    /**
     * Parses text to find potential tasks.
     * Supports:
     * - Standard bullet points (- [ ] task)
     * - Numbered lists (1. task)
     * - Chat logs (User: ... Assistant: ...) -> Extracts actionable items from Assistant's response or User's request
     */
    static parseTasks(text: string): string[] {
        const tasks: string[] = [];
        const lines = text.split('\n');

        // Regex for chat logs
        // Matches "User:", "Human:", "Assistant:", "AI:", "Claude:", "GPT:"
        const chatRoleRegex = /^(User|Human|Assistant|AI|Claude|GPT|Model)\s?:/i;

        // Regex for standard tasks
        const todoRegex = /^(\s*[-*]\s+\[\s*\]\s+|[-*]\s+|\d+\.\s+)(.+)/;

        let isInCodeBlock = false;

        for (const line of lines) {
            const trimmed = line.trim();

            if (trimmed.startsWith('```')) {
                isInCodeBlock = !isInCodeBlock;
                continue;
            }

            if (isInCodeBlock) continue;

            // Skip chat role headers themselves, but we might want to process the content
            if (chatRoleRegex.test(trimmed)) {
                continue;
            }

            // Check for standard todo list items
            const match = trimmed.match(todoRegex);
            if (match) {
                tasks.push(match[2].trim());
            }
            // Heuristic: If it looks like an imperative sentence in a chat context, maybe it's a task?
            // For now, let's stick to explicit lists to avoid noise.
            // But we can support "TODO:" prefix
            else if (trimmed.toUpperCase().startsWith('TODO:')) {
                tasks.push(trimmed.substring(5).trim());
            }
        }

        return tasks;
    }
}
