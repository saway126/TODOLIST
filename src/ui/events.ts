import { todoStore } from "../services/todoStore";
import { FilterType } from "../types";
import { showToast, clearAddTodoInput, getElements, toggleImportModal, render, updateTranslations } from "./dom";
import { THEME_STORAGE_KEY } from "../main";
import { AIParser } from "../services/aiParser";
import { t, getLanguage, setLanguage, tDynamic } from "../services/i18n";
import { analyzeImage, analyzePdf, getApiKey, setApiKey } from "../services/aiService";

const addTodoForm = document.getElementById("add-todo-form") as HTMLFormElement;
const addTodoInput = document.getElementById("add-todo-input") as HTMLInputElement;
const todoList = document.getElementById("todo-list") as HTMLUListElement;
const filterControls = document.getElementById("filter-controls") as HTMLDivElement;
const searchInput = document.getElementById("search-input") as HTMLInputElement;
const themeToggle = document.getElementById('theme-toggle') as HTMLInputElement;

const handleAddTodo = (e: SubmitEvent) => {
    e.preventDefault();
    const text = addTodoInput.value;
    if (text.trim()) {
        todoStore.addTodo(text);
        showToast(t('toastAdded'));
        clearAddTodoInput();
    }
};

const handleTodoListClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const li = target.closest("li");
    if (!li) return;
    const id = li.dataset.id!;

    if (target.classList.contains("todo-checkbox")) {
        todoStore.toggleTodoCompletion(id);
    } else if (target.closest(".delete-btn")) {
        todoStore.deleteTodo(id);
        showToast(t('toastDeleted'));
    } else if (target.closest(".edit-btn")) {
        enterEditMode(li, id);
    }
};

const handleTodoListDoubleClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const li = target.closest("li");
    if (!li || target.classList.contains("todo-checkbox") || target.closest(".todo-actions")) return;
    const id = li.dataset.id!;
    enterEditMode(li, id);
};

const handleFilterClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON') {
        const filter = target.dataset.filter as FilterType;
        if (filter) {
            todoStore.setFilter(filter);
        }
    }
};

const handleSearchInput = (e: Event) => {
    const target = e.target as HTMLInputElement;
    todoStore.setSearchTerm(target.value);
};

const handleThemeToggle = () => {
    const isDark = themeToggle.checked;
    const newTheme = isDark ? 'dark' : 'light';
    document.body.dataset.theme = newTheme;
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
};

const enterEditMode = (li: HTMLLIElement, id: string) => {
    const textSpan = li.querySelector(".todo-text") as HTMLSpanElement;
    const editInput = li.querySelector(".edit-input") as HTMLInputElement;
    textSpan.style.display = "none";
    editInput.style.display = "block";
    editInput.focus();
    editInput.select();

    const saveChanges = () => {
        const newText = editInput.value;
        if (newText.trim() && newText !== todoStore.getTodos().find(t => t.id === id)?.text) {
            todoStore.updateTodoText(id, newText);
            showToast(t('toastUpdated'));
        }
        textSpan.style.display = "block";
        editInput.style.display = "none";
    }

    editInput.onkeydown = (e) => {
        if (e.key === "Enter") {
            saveChanges();
        } else if (e.key === "Escape") {
            editInput.value = textSpan.innerText;
            textSpan.style.display = "block";
            editInput.style.display = "none";
        }
    };
    editInput.onblur = saveChanges;
};

const handleGlobalKeyDown = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' && target.id !== 'search-input') {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault();
        } else {
            return;
        }
    }

    const displayedTodos = todoStore.getFilteredTodos();
    if (displayedTodos.length === 0) return;

    let focusedId = todoStore.getFocusedTodoId();
    if (!focusedId) {
        todoStore.setFocusedTodoId(displayedTodos[0].id);
        return;
    }

    const currentIndex = displayedTodos.findIndex(t => t.id === focusedId);
    if (currentIndex === -1) return;

    switch (e.key) {
        case "ArrowUp":
            e.preventDefault();
            if (currentIndex > 0) {
                todoStore.setFocusedTodoId(displayedTodos[currentIndex - 1].id);
            }
            break;
        case "ArrowDown":
            e.preventDefault();
            if (currentIndex < displayedTodos.length - 1) {
                todoStore.setFocusedTodoId(displayedTodos[currentIndex + 1].id);
            }
            break;
        case " ": // Spacebar
            e.preventDefault();
            todoStore.toggleTodoCompletion(focusedId);
            break;
        case "e":
            const li = todoList.querySelector(`li[data-id="${focusedId}"]`);
            if (li) enterEditMode(li as HTMLLIElement, focusedId);
            break;
        case "Delete":
        case "Backspace":
            todoStore.deleteTodo(focusedId);
            showToast(t('toastDeleted'));
            break;
    }
};

export const initEventListeners = () => {
    addTodoForm.addEventListener("submit", handleAddTodo);
    todoList.addEventListener("click", handleTodoListClick);
    todoList.addEventListener("dblclick", handleTodoListDoubleClick);
    filterControls.addEventListener('click', handleFilterClick);
    searchInput.addEventListener('input', handleSearchInput);
    themeToggle.addEventListener('change', handleThemeToggle);
    window.addEventListener("keydown", handleGlobalKeyDown);

    // Import Feature Events
    const {
        openImportBtn, closeModalBtn, processImportBtn, importTextarea, importModal,
        langToggleBtn, pasteImportBtn,
        openSettingsBtn, closeSettingsBtn, saveSettingsBtn, settingsModal, apiKeyInput,
        fileDropZone, fileInput, browseBtn,
        detailModal, closeDetailBtn, detailTitle, detailDescription, detailSourceBadge, detailDate
    } = getElements();

    // Settings Modal
    if (openSettingsBtn) {
        openSettingsBtn.addEventListener("click", () => {
            const currentKey = getApiKey();
            if (currentKey) apiKeyInput.value = currentKey;
            settingsModal.classList.remove('hidden');
        });
    }

    if (closeSettingsBtn) {
        closeSettingsBtn.addEventListener("click", () => settingsModal.classList.add('hidden'));
    }

    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener("click", () => {
            const key = apiKeyInput.value.trim();
            if (key) {
                setApiKey(key);
                showToast("API Key saved!");
                settingsModal.classList.add('hidden');
            } else {
                showToast("Please enter an API Key.");
            }
        });
    }

    // File Upload Handling
    if (browseBtn && fileInput) {
        browseBtn.addEventListener("click", () => fileInput.click());
    }

    if (fileInput) {
        fileInput.addEventListener("change", async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) await handleFileUpload(file);
        });
    }

    if (fileDropZone) {
        fileDropZone.addEventListener("dragover", (e: DragEvent) => {
            e.preventDefault();
            fileDropZone.classList.add('drag-over');
        });
        fileDropZone.addEventListener("dragleave", () => fileDropZone.classList.remove('drag-over'));
        fileDropZone.addEventListener("drop", async (e: DragEvent) => {
            e.preventDefault();
            fileDropZone.classList.remove('drag-over');
            const file = e.dataTransfer?.files[0];
            if (file) await handleFileUpload(file);
        });
    }

    const handleFileUpload = async (file: File) => {
        if (!getApiKey()) {
            showToast("Please set API Key in Settings first.");
            return;
        }

        showToast("Analyzing file... please wait.");

        try {
            let result;
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = async (e: ProgressEvent<FileReader>) => {
                    const base64 = e.target?.result as string;
                    if (!base64) return;
                    // Remove data URL prefix
                    const base64Data = base64.split(',')[1];
                    try {
                        result = await analyzeImage(base64Data);
                        processAnalysisResult(result, 'image');
                    } catch (err) {
                        console.error(err);
                        showToast("Failed to analyze image.");
                    }
                };
                reader.readAsDataURL(file);
            } else if (file.type === 'application/pdf') {
                // For PDF, we might need to extract text or send as file
                // For this mock, we'll just send a dummy text
                result = await analyzePdf("dummy pdf content");
                processAnalysisResult(result, 'pdf');
            } else {
                showToast("Unsupported file type.");
            }
        } catch (err) {
            console.error(err);
            showToast("Error processing file.");
        }
    };

    const processAnalysisResult = (result: any, sourceType: 'image' | 'pdf') => {
        if (result && result.tasks && result.tasks.length > 0) {
            todoStore.addTodos(result.tasks, sourceType);
            showToast(tDynamic('toastImported', result.tasks.length));
            toggleImportModal(false);
        } else {
            showToast(t('toastNoTasks'));
        }
    };

    // Detail Modal
    if (todoList) {
        todoList.addEventListener("click", (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // Check if clicked on detail button or its SVG child
            const detailBtn = target.closest('.detail-view-btn');
            if (detailBtn) {
                const li = detailBtn.closest('li');
                const id = li?.dataset.id;
                if (id) {
                    const todo = todoStore.getTodoById(id);

                    if (todo && detailModal) {
                        detailTitle.textContent = todo.text;
                        detailDescription.textContent = todo.description || t('detailDescription');

                        // Show source badge
                        const sourceText = todo.sourceType ?
                            (todo.sourceType === 'image' ? '🖼️ Image' :
                                todo.sourceType === 'pdf' ? '📄 PDF' : 'Text') : 'Text';
                        detailSourceBadge.textContent = sourceText;
                        detailSourceBadge.className = `badge source-${todo.sourceType || 'text'}`;

                        detailDate.textContent = new Date(todo.createdAt).toLocaleString();

                        detailModal.classList.remove('hidden');
                    }
                }
                e.stopPropagation();
                e.preventDefault();
            }
        });
    }

    if (closeDetailBtn) {
        closeDetailBtn.addEventListener("click", () => detailModal.classList.add('hidden'));
    }

    if (pasteImportBtn) {
        pasteImportBtn.addEventListener("click", async () => {
            try {
                const text = await navigator.clipboard.readText();
                if (text) {
                    importTextarea.value = text;
                    importTextarea.focus();
                    showToast("Pasted from clipboard!");
                } else {
                    showToast("Clipboard is empty.");
                }
            } catch (err) {
                console.error('Failed to read clipboard contents: ', err);
                showToast("Failed to read clipboard.");
            }
        });
    }

    if (openImportBtn) {
        openImportBtn.addEventListener("click", () => {
            toggleImportModal(true);
            updateTranslations();
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener("click", () => toggleImportModal(false));
    }

    if (importModal) {
        // Close on click outside
        importModal.addEventListener("click", (e) => {
            if (e.target === importModal) toggleImportModal(false);
        });
    }

    if (processImportBtn) {
        processImportBtn.addEventListener("click", () => {
            const text = importTextarea.value;
            if (!text.trim()) {
                showToast(t('toastPasteFirst'));
                return;
            }

            const tasks = AIParser.parseTasks(text);
            if (tasks.length > 0) {
                // Map strings to objects for the new signature
                todoStore.addTodos(tasks.map(t => ({ text: t })), 'text');
                showToast(tDynamic('toastImported', tasks.length));
                toggleImportModal(false);
            } else {
                showToast(t('toastNoTasks'));
            }
        });
    }

    // Language Toggle
    if (langToggleBtn) {
        langToggleBtn.addEventListener("click", () => {
            const current = getLanguage();
            const next = current === 'en' ? 'ko' : 'en';
            setLanguage(next);
            render(); // Re-render to update texts
        });
    }
};