import { loadData, saveData, DEFAULT_CURRENCIES, DEFAULT_CATEGORIES } from './storage.js';
import { generateId, showToast, getCurrentDateISO } from './utils.js';
import { createExpense, createRecurring } from './models.js';
import { generateDueRecurringExpenses } from './recurring.js';
import { exportToJSON, importFromJSON, exportExpensesToCSV } from './csv.js';
import { registerServiceWorker } from './pwa.js';
import {
    initTabs,
    setupThemeToggle,
    applyTheme,
    syncSelectOptions,
    renderExpensesTable,
    renderRecurringTable,
    renderBudgetList,
    renderSettingsForm,
    renderFxForm,
    updateSummary
} from './ui.js';
import { renderCharts } from './charts.js';

let data = loadData();

function init() {
    // Register service worker for PWA
    registerServiceWorker();
    
    // Initialize tabs
    initTabs();
    
    // Setup theme toggle
    setupThemeToggle((theme) => {
        data.settings.theme = theme;
        saveData(data);
        // Re-render charts so their colors match the new theme
        setTimeout(() => renderCharts(data.expenses, data.settings), 50);
    });
    
    applyTheme(data.settings.theme || 'light');
    
    // Setup export/import
    setupExportImport();
    
    // Initialize all forms and views
    setupExpenseForm();
    setupBudgetForm();
    setupRecurringForm();
    setupSettingsForm();
    setupFilters();
    
    // Initial render
    refreshAll();
}

// Generate due recurring expenses on load
function processRecurringOnLoad() {
    const due = generateDueRecurringExpenses(data.recurring, getCurrentDateISO());
    if (due.length > 0) {
        data.expenses = [...data.expenses, ...due];
        saveData(data);
        showToast(`Generated ${due.length} recurring expense(s)`);
    }
}

function setupExportImport() {
    const exportBtn = document.getElementById('exportBtn');
    const exportJsonBtn = document.getElementById('exportJsonBtn');
    const exportCsvBtn = document.getElementById('exportCsvBtn');
    const importBtn = document.getElementById('importBtn');
    const importInput = document.getElementById('importInput');
    
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const json = exportToJSON(data);
            downloadFile(json, 'expense-tracker-data.json', 'application/json');
            showToast('Data exported as JSON');
        });
    }
    
    if (exportJsonBtn) {
        exportJsonBtn.addEventListener('click', () => {
            const json = exportToJSON(data);
            downloadFile(json, 'expense-tracker-data.json', 'application/json');
            showToast('Data exported as JSON');
        });
    }
    
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener('click', () => {
            const csv = exportExpensesToCSV(data.expenses);
            downloadFile(csv, 'expenses.csv', 'text/csv');
            showToast('Expenses exported as CSV');
        });
    }
    
    if (importBtn) {
        importBtn.addEventListener('click', () => {
            if (importInput) importInput.click();
        });
    }
    
    if (importInput) {
        importInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const imported = importFromJSON(event.target.result);
                    // Merge: add new categories, keep existing data but replace with imported
                    data = imported;
                    // Ensure we have defaults
                    if (!data.categories || data.categories.length === 0) {
                        data.categories = [...DEFAULT_CATEGORIES];
                    }
                    if (!data.recurring) data.recurring = [];
                    if (!data.budgets) data.budgets = {};
                    if (!data.settings) data.settings = { currency: 'USD', theme: 'light', fx: {} };
                    saveData(data);
                    applyTheme(data.settings.theme || 'light');
                    refreshAll();
                    showToast('Data imported successfully');
                } catch (err) {
                    showToast('Import failed: ' + err.message);
                }
            };
            reader.readAsText(file);
            e.target.value = '';
        });
    }
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

function setupExpenseForm() {
    const form = document.getElementById('expenseForm');
    const cancelBtn = document.getElementById('cancelEditBtn');
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('expenseId').value;
            const date = document.getElementById('expenseDate').value;
            const amount = document.getElementById('expenseAmount').value;
            const currency = document.getElementById('expenseCurrency').value;
            const category = document.getElementById('expenseCategory').value;
            const merchant = document.getElementById('expenseMerchant').value;
            const note = document.getElementById('expenseNote').value;
            
            if (!date || !amount) {
                showToast('Date and Amount are required');
                return;
            }
            
            if (id) {
                // Update existing
                const exp = data.expenses.find(e => e.id === id);
                if (exp) {
                    exp.date = date;
                    exp.amount = parseFloat(amount);
                    exp.currency = currency;
                    exp.category = category;
                    exp.merchant = merchant;
                    exp.note = note;
                }
                showToast('Expense updated');
            } else {
                // Create new
                const newExp = createExpense({
                    id: generateId(),
                    date,
                    amount,
                    currency,
                    category,
                    merchant,
                    note
                });
                data.expenses.push(newExp);
                showToast('Expense added');
            }
            
            saveData(data);
            form.reset();
            document.getElementById('expenseId').value = '';
            if (cancelBtn) cancelBtn.style.display = 'none';
            refreshAll();
        });
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            const form = document.getElementById('expenseForm');
            if (form) form.reset();
            document.getElementById('expenseId').value = '';
            cancelBtn.style.display = 'none';
            document.getElementById('saveExpenseBtn').textContent = 'Save Expense';
        });
    }
    
    if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', () => {
            const cat = prompt('Enter new category name:');
            if (cat && cat.trim()) {
                const trimmed = cat.trim();
                if (!data.categories.includes(trimmed)) {
                    data.categories.push(trimmed);
                    data.categories.sort();
                    saveData(data);
                    refreshAll();
                    showToast('Category added');
                } else {
                    showToast('Category already exists');
                }
            }
        });
    }
}

function setupBudgetForm() {
    const form = document.getElementById('budgetForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const category = document.getElementById('budgetCategory').value;
            const amount = document.getElementById('budgetAmount').value;
            const period = document.getElementById('budgetPeriod').value;
            
            if (!category || !amount) {
                showToast('Category and Amount are required');
                return;
            }
            
            if (!data.budgets) data.budgets = {};
            data.budgets[category] = {
                amount: parseFloat(amount),
                period: period
            };
            saveData(data);
            form.reset();
            refreshAll();
            showToast('Budget saved');
        });
    }
}

function setupRecurringForm() {
    const form = document.getElementById('recurringForm');
    const cancelBtn = document.getElementById('cancelRecurringBtn');
    
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('recurringId').value;
            const merchant = document.getElementById('recurringMerchant').value;
            const amount = document.getElementById('recurringAmount').value;
            const currency = document.getElementById('recurringCurrency').value;
            const category = document.getElementById('recurringCategory').value;
            const frequency = document.getElementById('recurringFrequency').value;
            const interval = document.getElementById('recurringInterval').value;
            const nextDue = document.getElementById('recurringNextDue').value;
            const note = document.getElementById('recurringNote').value;
            
            if (!merchant || !amount || !nextDue) {
                showToast('Merchant, Amount, and Next Due Date are required');
                return;
            }
            
            if (id) {
                const rec = data.recurring.find(r => r.id === id);
                if (rec) {
                    rec.frequency = frequency;
                    rec.interval = parseInt(interval);
                    rec.nextDue = nextDue;
                    rec.template = {
                        amount: parseFloat(amount),
                        currency,
                        category,
                        merchant,
                        note
                    };
                    rec.active = true;
                }
                showToast('Recurring updated');
            } else {
                const newRec = createRecurring({
                    frequency,
                    interval,
                    nextDue,
                    amount,
                    currency,
                    category,
                    merchant,
                    note
                });
                data.recurring.push(newRec);
                showToast('Recurring added');
            }
            
            saveData(data);
            form.reset();
            document.getElementById('recurringId').value = '';
            if (cancelBtn) cancelBtn.style.display = 'none';
            refreshAll();
        });
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            const form = document.getElementById('recurringForm');
            if (form) form.reset();
            document.getElementById('recurringId').value = '';
            cancelBtn.style.display = 'none';
        });
    }
}

function setupSettingsForm() {
    const form = document.getElementById('settingsForm');
    const fxForm = document.getElementById('fxForm');
    
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const baseCurrency = document.getElementById('baseCurrency').value;
            const themeSelect = document.getElementById('themeSelect').value;
            
            data.settings.currency = baseCurrency;
            data.settings.theme = themeSelect;
            saveData(data);
            applyTheme(themeSelect);
            refreshAll();
            showToast('Settings saved');
        });
    }
    
    if (fxForm) {
        fxForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!data.settings.fx) data.settings.fx = {};
            DEFAULT_CURRENCIES.forEach(cur => {
                if (cur === data.settings.currency) return;
                const input = document.getElementById(`fx-${cur}`);
                if (input && input.value !== '') {
                    const val = parseFloat(input.value);
                    if (!isNaN(val) && val > 0) {
                        data.settings.fx[cur] = val;
                    }
                }
            });
            saveData(data);
            refreshAll();
            showToast('FX rates saved');
        });
    }
}

function setupFilters() {
    const clearBtn = document.getElementById('clearFiltersBtn');
    const filterInputs = [
        'filterStartDate',
        'filterEndDate',
        'filterCategory',
        'filterSearch',
        'filterSort'
    ];
    
    filterInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', refreshExpensesList);
            el.addEventListener('input', refreshExpensesList);
        }
    });
    
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            document.getElementById('filterStartDate').value = '';
            document.getElementById('filterEndDate').value = '';
            document.getElementById('filterCategory').value = 'all';
            document.getElementById('filterSearch').value = '';
            document.getElementById('filterSort').value = 'date-desc';
            refreshExpensesList();
        });
    }
}

function getFilteredAndSortedExpenses() {
    let expenses = [...data.expenses];
    
    const start = document.getElementById('filterStartDate')?.value;
    const end = document.getElementById('filterEndDate')?.value;
    const category = document.getElementById('filterCategory')?.value;
    const search = document.getElementById('filterSearch')?.value?.toLowerCase();
    const sort = document.getElementById('filterSort')?.value;
    
    if (start) {
        expenses = expenses.filter(e => e.date >= start);
    }
    if (end) {
        expenses = expenses.filter(e => e.date <= end);
    }
    if (category && category !== 'all') {
        expenses = expenses.filter(e => e.category === category);
    }
    if (search) {
        expenses = expenses.filter(e => 
            (e.merchant && e.merchant.toLowerCase().includes(search)) ||
            (e.note && e.note.toLowerCase().includes(search))
        );
    }
    
    expenses.sort((a, b) => {
        if (sort === 'date-asc') {
            return a.date.localeCompare(b.date);
        }
        if (sort === 'date-desc') {
            return b.date.localeCompare(a.date);
        }
        if (sort === 'amount-asc') {
            return (a.amount || 0) - (b.amount || 0);
        }
        if (sort === 'amount-desc') {
            return (b.amount || 0) - (a.amount || 0);
        }
        return b.date.localeCompare(a.date);
    });
    
    return expenses;
}

function refreshExpensesList() {
    const expenses = getFilteredAndSortedExpenses();
    renderExpensesTable(expenses, data.settings, handleEditExpense, handleDeleteExpense);
}

function handleEditExpense(id) {
    const exp = data.expenses.find(e => e.id === id);
    if (!exp) return;
    
    document.getElementById('expenseId').value = exp.id;
    document.getElementById('expenseDate').value = exp.date;
    document.getElementById('expenseAmount').value = exp.amount;
    document.getElementById('expenseCurrency').value = exp.currency;
    document.getElementById('expenseCategory').value = exp.category;
    document.getElementById('expenseMerchant').value = exp.merchant;
    document.getElementById('expenseNote').value = exp.note;
    
    document.getElementById('saveExpenseBtn').textContent = 'Update Expense';
    document.getElementById('cancelEditBtn').style.display = 'inline-flex';
    
    // Switch to expenses tab
    document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-view') === 'expenses');
        b.setAttribute('aria-selected', b.getAttribute('data-view') === 'expenses');
    });
    document.querySelectorAll('.view').forEach(v => {
        v.classList.toggle('active', v.id === 'view-expenses');
        v.setAttribute('aria-hidden', v.id !== 'view-expenses');
    });
}

function handleDeleteExpense(id) {
    if (!confirm('Delete this expense?')) return;
    data.expenses = data.expenses.filter(e => e.id !== id);
    saveData(data);
    refreshAll();
    showToast('Expense deleted');
}

function handleEditRecurring(id) {
    const rec = data.recurring.find(r => r.id === id);
    if (!rec) return;
    
    document.getElementById('recurringId').value = rec.id;
    document.getElementById('recurringMerchant').value = rec.template.merchant;
    document.getElementById('recurringAmount').value = rec.template.amount;
    document.getElementById('recurringCurrency').value = rec.template.currency;
    document.getElementById('recurringCategory').value = rec.template.category;
    document.getElementById('recurringFrequency').value = rec.frequency;
    document.getElementById('recurringInterval').value = rec.interval;
    document.getElementById('recurringNextDue').value = rec.nextDue;
    document.getElementById('recurringNote').value = rec.template.note || '';
    
    document.getElementById('cancelRecurringBtn').style.display = 'inline-flex';
    
    document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-view') === 'recurring');
        b.setAttribute('aria-selected', b.getAttribute('data-view') === 'recurring');
    });
    document.querySelectorAll('.view').forEach(v => {
        v.classList.toggle('active', v.id === 'view-recurring');
        v.setAttribute('aria-hidden', v.id !== 'view-recurring');
    });
}

function handleDeleteRecurring(id) {
    if (!confirm('Delete this recurring expense?')) return;
    data.recurring = data.recurring.filter(r => r.id !== id);
    saveData(data);
    refreshAll();
    showToast('Recurring deleted');
}

function handleGenerateRecurring(id) {
    const single = data.recurring.filter(r => r.id === id);
    if (single.length === 0) return;
    const due = generateDueRecurringExpenses(single, getCurrentDateISO());
    if (due.length > 0) {
        data.expenses = [...data.expenses, ...due];
        saveData(data);
        refreshAll();
        showToast(`Generated ${due.length} expense(s)`);
    } else {
        showToast('No expenses due to generate');
    }
}

function handleDeleteBudget(cat) {
    if (!data.budgets) return;
    if (!confirm(`Remove budget for ${cat}?`)) return;
    delete data.budgets[cat];
    saveData(data);
    refreshAll();
    showToast('Budget removed');
}

function refreshAll() {
    // Rebuild option lists while PRESERVING the user's current selections.
    // (Previously this reset every select to its first option, which silently
    // turned the category filter into "Rent" and hid newly added expenses.)
    syncSelectOptions('expenseCurrency', DEFAULT_CURRENCIES, data.settings.currency);
    syncSelectOptions('recurringCurrency', DEFAULT_CURRENCIES, data.settings.currency);
    syncSelectOptions('expenseCategory', data.categories, data.categories[0]);
    syncSelectOptions('recurringCategory', data.categories, data.categories[0]);
    syncSelectOptions('budgetCategory', data.categories, data.categories[0]);
    syncSelectOptions('filterCategory', ['all', ...data.categories], 'all');

    // Render all views
    refreshExpensesList();
    renderRecurringTable(data.recurring, handleEditRecurring, handleDeleteRecurring, handleGenerateRecurring);
    renderBudgetList(data.budgets || {}, data.categories, data.expenses, data.settings, handleDeleteBudget);
    renderSettingsForm(data.settings, DEFAULT_CURRENCIES);
    renderFxForm(data.settings, DEFAULT_CURRENCIES);
    updateSummary(data.expenses, data.settings);
    renderCharts(data.expenses, data.settings);
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        processRecurringOnLoad();
        init();
    });
} else {
    processRecurringOnLoad();
    init();
}