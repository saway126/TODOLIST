import "./styles.css";
import { todoStore } from "./services/todoStore";
import { initEventListeners } from "./ui/events";
import { render } from "./ui/dom";
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
    const systemTheme = await appWindow.theme();
    const theme = systemTheme === 'light' ? 'light' : 'dark';
    document.body.dataset.theme = theme;
    if (themeToggle) themeToggle.checked = theme === 'dark';
  }
};

// Listen for system theme changes ONLY if no manual override is set
appWindow.onThemeChanged(({ payload: theme }) => {
  if (!localStorage.getItem(THEME_STORAGE_KEY)) {
    const newTheme = theme === 'light' ? 'light' : 'dark';
    document.body.dataset.theme = newTheme;
    const themeToggle = document.getElementById('theme-toggle') as HTMLInputElement;
    if (themeToggle) themeToggle.checked = newTheme === 'dark';
  }
});

// Main application entry point
const main = async () => {
  await setInitialTheme();
  
  todoStore.onChange(render);

  await todoStore.init();
  
  initEventListeners();
};

// Run the app
main();