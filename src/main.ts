import "./styles.css";
import { todoStore } from "./services/todoStore";
import { listStore } from "./services/listStore";
import { initEventListeners } from "./ui/events";
import { render, initVisuals } from "./ui/dom";
import { appWindow } from '@tauri-apps/api/window';

export const THEME_STORAGE_KEY = 'todo-app-theme';

// Set theme based on saved preference or system preference
const setInitialTheme = async () => {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  const themeToggle = document.getElementById('theme-toggle') as HTMLInputElement;

  if (savedTheme) {
    document.body.dataset.theme = savedTheme;
    if (themeToggle) themeToggle.checked = savedTheme === 'dark';
  } else {
    // Default to dark for the space theme
    document.body.dataset.theme = 'dark';
    if (themeToggle) themeToggle.checked = true;

    try {
      const systemTheme = await appWindow.theme();
      // Optional: Handle system theme if needed
    } catch (e) {
      console.warn("Failed to get system theme", e);
    }
  }
};

// Listen for system theme changes
try {
  appWindow.onThemeChanged(({ payload: theme }) => {
    if (!localStorage.getItem(THEME_STORAGE_KEY)) {
      // Optional: Handle system theme changes
    }
  });
} catch (e) {
  console.warn("Failed to listen for theme changes", e);
}

// Main application entry point
const main = async () => {
  await setInitialTheme();

  // Initialize visuals (Stars & Turtle)
  initVisuals();

  // Subscribe to store changes
  todoStore.onChange(render);
  listStore.subscribe(render);

  // Initialize stores
  await listStore.init();
  await todoStore.init();

  // Initial render
  render();

  initEventListeners();
};

// Run the app
main();