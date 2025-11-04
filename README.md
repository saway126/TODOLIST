# Tauri Todo App V1

A cross-platform desktop TODO application built with Tauri and Vanilla TypeScript.

## Features

- **CRUD Operations:** Add, complete, edit, and delete todos.
- **Filtering & Search:** View all tasks or just today's tasks. A simple text search is also available.
- **Local Persistence:** Your tasks are saved to `todos.json` in your system's application data directory, ensuring your data persists between sessions.
- **Keyboard Shortcuts:** Designed for efficiency and speed.

## Tech Stack

- **Desktop Framework:** [Tauri](https://tauri.app/)
- **Frontend:** Vanilla TypeScript (no frameworks)
- **Bundler:** [Vite](https://vitejs.dev/)
- **Package Manager:** npm

## Project Structure

```
.
├── src/
│   ├── main.ts           # App entry point
│   ├── styles.css        # All application styles
│   ├── types.ts          # TypeScript type definitions
│   ├── services/
│   │   ├── fs.ts         # Tauri filesystem service wrapper
│   │   └── todoStore.ts  # State management for todos
│   └── ui/
│       ├── dom.ts        # DOM manipulation and rendering logic
│       └── events.ts     # Event listener setup
├── src-tauri/
│   ├── tauri.conf.json   # Tauri configuration (permissions, etc.)
│   └── ...               # Other Tauri backend files
├── index.html            # Main HTML file
└── package.json          # Project dependencies and scripts
```

## Getting Started

### Prerequisites

- [Node.js and npm](https://nodejs.org/en/)
- [Rust and Cargo](https://www.rust-lang.org/tools/install)
- [Tauri development prerequisites](https://tauri.app/v1/guides/getting-started/prerequisites)

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd tauri-todo-app
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

### Development

To run the app in development mode with hot-reloading:

```bash
npm run tauri dev
```

### Building for Production

To build and package the application for your current platform:

```bash
npm run tauri build
```
The executable will be located in `src-tauri/target/release/`.

## Keyboard Shortcuts

-   **Global:**
    -   `ArrowUp` / `ArrowDown`: Navigate between todos.
    -   `Space`: Toggle the completion status of the focused todo.
    -   `e`: Edit the focused todo.
    -   `Delete` / `Backspace`: Delete the focused todo.
-   **Add Todo Input:**
    -   `Enter`: Add a new todo.
-   **Edit Todo Input:**
    -   `Enter`: Save changes.
    -   `Escape`: Cancel editing.
