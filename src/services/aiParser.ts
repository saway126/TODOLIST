export class AIParser {
    /**
     * Parses a raw string and extracts potential todo items.
     * Supports:
     * - Markdown checklists: - [ ] Task
     * - Bullet points: * Task, - Task
     * - Numbered lists: 1. Task
     * - "Todo:" prefix
     */
    static parseTasks(text: string): string[] {
        const lines = text.split('\n');
        const tasks: string[] = [];

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            // 1. Markdown Checklists: - [ ] Task, - [x] Task
            const checkboxMatch = trimmed.match(/^-\s*\[[ xX]?\]\s+(.+)$/);
            if (checkboxMatch) {
                tasks.push(checkboxMatch[1].trim());
                continue;
            }

            // 2. Explicit "Todo:" prefix (English & Korean)
            // Supports: Todo:, To-do:, 할일:, 목표:, 구현:, 수정:
            const prefixMatch = trimmed.match(/^(?:todo|to-do|할일|목표|구현|수정|task):\s*(.+)$/i);
            if (prefixMatch) {
                tasks.push(prefixMatch[1].trim());
                continue;
            }

            // 3. Markdown Headers as Tasks (e.g., ### Component Name)
            // Often used in plans to denote sections of work
            const headerMatch = trimmed.match(/^#{1,6}\s+(.+)$/);
            if (headerMatch) {
                tasks.push(headerMatch[1].trim());
                continue;
            }

            // 4. Bolded Items in Lists (e.g., - **API entrypoint** description)
            // Extracts the bolded part as the main task
            const boldItemMatch = trimmed.match(/^[-*]\s+\*\*(.+?)\*\*(.*)$/);
            if (boldItemMatch) {
                const title = boldItemMatch[1].trim();
                // const desc = boldItemMatch[2].trim(); // Option: include description?
                // For now, let's just use the title as it's usually the actionable item
                tasks.push(title);
                continue;
            }

            // 5. Bullet points with "strong" action verbs or context (heuristic)
            // Matches: - Task, * Task
            const bulletMatch = trimmed.match(/^[-*]\s+(.+)$/);
            if (bulletMatch) {
                tasks.push(bulletMatch[1].trim());
                continue;
            }

            // 6. Numbered lists
            // Matches: 1. Task
            const numberMatch = trimmed.match(/^\d+\.\s+(.+)$/);
            if (numberMatch) {
                tasks.push(numberMatch[1].trim());
                continue;
            }
        }

        return tasks;
    }
}
