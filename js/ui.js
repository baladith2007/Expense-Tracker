import { formatCurrency, formatDate, showToast, convertToBase } from './utils.js';

export function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update tab buttons
            tabBtns.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');
            
            // Update views
            const viewName = btn.getAttribute('data-view');
            document.querySelectorAll('.view').forEach(view => {
                view.classList.remove('active');
                view.setAttribute('aria-hidden', 'true');
            });
            const targetView = document.getElementById(`view-${viewName}`);
            if (targetView) {
                targetView.classList.add('active');
                targetView.setAttribute('aria-hidden', 'false');
            }
        });
    });
}

export function setupThemeToggle(onThemeChange) {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;
    
    themeToggle.addEventListener('click', () => {
        const html = document.documentElement;
        const current = html.getAttribute('data-theme');
        let next;
        if (current === 'light') next = 'dark';
        else if (current === 'dark') next = 'system';
        else next = 'light';
        html.setAttribute('data-theme', next);
        themeToggle.textContent = getThemeIcon(next);
        if (onThemeChange) onThemeChange(next);
    });
}

function getThemeIcon(theme) {
    if (theme === 'light') return '☀️';
    if (theme === 'dark') return '🌙';
    return '💻'; // system
}

export function applyTheme(theme) {
    const html = document.documentElement;
    html.setAttribute('data-theme', theme);
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.textContent = getThemeIcon(theme);
    }
}

/**
 * Rebuilds a <select>'s options while preserving the user's current choice.
 * - If the current value still exists among `values`, it is kept.
 * - Otherwise it falls back to `fallbackValue` (if present in `values`), else the first option.
 * Never clobbers a valid selection (which previously caused the category filter
 * to silently reset to the first category).
 */
export function syncSelectOptions(selectId, values, fallbackValue = null) {
    const select = document.getElementById(selectId);
    if (!select) return;
    const current = select.value;
    select.innerHTML = '';
    values.forEach(v => {
        const opt = document.createElement('option');
        opt.value = v;
        opt.textContent = v === 'all' ? 'All' : v;
        select.appendChild(opt);
    });
    if (values.includes(current)) {
        select.value = current;
    } else if (fallbackValue !== null && values.includes(fallbackValue)) {
        select.value = fallbackValue;
    } else {
        select.value = values[0];
    }
}

export function renderExpensesTable(expenses, settings, onEdit, onDelete) {
    const tbody = document.getElementById('expensesTableBody');
    const noExpenses = document.getElementById('noExpenses');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (!expenses || expenses.length === 0) {
        if (noExpenses) noExpenses.style.display = 'block';
        return;
    }
    if (noExpenses) noExpenses.style.display = 'none';
    
    for (const exp of expenses) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td data-label="Date">${formatDate(exp.date)}</td>
            <td data-label="Merchant">${escapeHtml(exp.merchant || '')}</td>
            <td data-label="Category">${escapeHtml(exp.category || '')}</td>
            <td data-label="Amount">${formatCurrency(exp.amount, exp.currency)}</td>
            <td data-label="Currency">${escapeHtml(exp.currency || settings.currency)}</td>
            <td data-label="Note" class="cell-note">${escapeHtml(exp.note || '')}</td>
            <td class="table-actions" data-label="Actions">
                <button class="btn btn-small btn-secondary" data-action="edit" data-id="${escapeHtml(exp.id)}">Edit</button>
                <button class="btn btn-small btn-secondary" data-action="delete" data-id="${escapeHtml(exp.id)}">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    }
    
    // Add event listeners
    tbody.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const action = btn.getAttribute('data-action');
            if (action === 'edit' && onEdit) onEdit(id);
            if (action === 'delete' && onDelete) onDelete(id);
        });
    });
}

export function renderRecurringTable(recurringList, onEdit, onDelete, onGenerate) {
    const tbody = document.getElementById('recurringTableBody');
    const noRecurring = document.getElementById('noRecurring');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (!recurringList || recurringList.length === 0) {
        if (noRecurring) noRecurring.style.display = 'block';
        return;
    }
    if (noRecurring) noRecurring.style.display = 'none';
    
    for (const rec of recurringList) {
        const freqLabel = rec.frequency.charAt(0).toUpperCase() + rec.frequency.slice(1);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td data-label="Merchant">${escapeHtml(rec.template.merchant || '')}</td>
            <td data-label="Amount">${formatCurrency(rec.template.amount, rec.template.currency)}</td>
            <td data-label="Currency">${escapeHtml(rec.template.currency || '')}</td>
            <td data-label="Category">${escapeHtml(rec.template.category || '')}</td>
            <td data-label="Frequency">${freqLabel} (${rec.interval})</td>
            <td data-label="Next Due">${formatDate(rec.nextDue)}</td>
            <td data-label="Status">${rec.active ? 'Active' : 'Inactive'}</td>
            <td class="table-actions" data-label="Actions">
                <button class="btn btn-small btn-secondary" data-action="generate" data-id="${escapeHtml(rec.id)}">Generate Due</button>
                <button class="btn btn-small btn-secondary" data-action="edit" data-id="${escapeHtml(rec.id)}">Edit</button>
                <button class="btn btn-small btn-secondary" data-action="delete" data-id="${escapeHtml(rec.id)}">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    }
    
    tbody.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const action = btn.getAttribute('data-action');
            if (action === 'edit' && onEdit) onEdit(id);
            if (action === 'delete' && onDelete) onDelete(id);
            if (action === 'generate' && onGenerate) onGenerate(id);
        });
    });
}

export function renderBudgetList(budgets, categories, expenses, settings, onDelete) {
    const list = document.getElementById('budgetList');
    const noBudgets = document.getElementById('noBudgets');
    if (!list) return;
    
    list.innerHTML = '';
    
    const budgetCategories = Object.keys(budgets);
    if (budgetCategories.length === 0) {
        if (noBudgets) noBudgets.style.display = 'block';
        return;
    }
    if (noBudgets) noBudgets.style.display = 'none';
    
    const now = new Date();
    const currentMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
    
    for (const cat of budgetCategories) {
        const budget = budgets[cat];
        const budgetAmount = parseFloat(budget.amount) || 0;
        // Calculate spent this month for this category (in base currency roughly? For simplicity use raw amounts in category - but show in context)
        let spent = 0;
        for (const exp of expenses) {
            if (exp.category !== cat) continue;
            if (exp.date && exp.date.startsWith(currentMonth)) {
                spent += convertToBase(parseFloat(exp.amount) || 0, exp.currency, settings);
            }
        }
        const percent = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;
        const remaining = budgetAmount - spent;
        const isOver = spent > budgetAmount;
        
        const item = document.createElement('div');
        item.className = 'budget-item';
        item.innerHTML = `
            <div class="budget-header">
                <span class="budget-category">${escapeHtml(cat)}</span>
                <span class="budget-amounts">
                    ${formatCurrency(spent, settings.currency)} / ${formatCurrency(budgetAmount, settings.currency)}
                    (${Math.min(percent, 100).toFixed(0)}%)
                </span>
            </div>
            <div class="budget-progress-bar">
                <div class="budget-progress-fill ${isOver ? 'over-budget' : ''}" style="width: ${Math.min(percent, 100)}%"></div>
            </div>
            <div class="budget-progress-text">
                ${isOver ? `Over budget by ${formatCurrency(Math.abs(remaining), settings.currency)}` : `${formatCurrency(remaining, settings.currency)} remaining`}
                <button class="btn btn-small btn-secondary" style="margin-left:0.5rem" data-action="delete" data-cat="${escapeHtml(cat)}">Remove</button>
            </div>
        `;
        list.appendChild(item);
    }
    
    list.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
            const cat = btn.getAttribute('data-cat');
            const action = btn.getAttribute('data-action');
            if (action === 'delete' && onDelete) onDelete(cat);
        });
    });
}

export function renderSettingsForm(settings, currencies) {
    const baseCurrencySelect = document.getElementById('baseCurrency');
    const themeSelect = document.getElementById('themeSelect');
    if (baseCurrencySelect) {
        baseCurrencySelect.innerHTML = '';
        currencies.forEach(cur => {
            const opt = document.createElement('option');
            opt.value = cur;
            opt.textContent = cur;
            if (cur === settings.currency) opt.selected = true;
            baseCurrencySelect.appendChild(opt);
        });
    }
    if (themeSelect) {
        themeSelect.value = settings.theme || 'light';
    }
}

export function renderFxForm(settings, currencies) {
    const fxRows = document.getElementById('fxRows');
    if (!fxRows) return;
    fxRows.innerHTML = '';
    currencies.forEach(cur => {
        if (cur === settings.currency) return; // skip base
        const row = document.createElement('div');
        row.className = 'fx-row';
        row.innerHTML = `
            <label>${escapeHtml(cur)}</label>
            <input type="number" step="0.0001" id="fx-${escapeHtml(cur)}" value="${settings.fx && settings.fx[cur] !== undefined ? settings.fx[cur] : 1.0}" placeholder="e.g. 1.1">
        `;
        fxRows.appendChild(row);
    });
}

export function updateSummary(expenses, settings) {
    let totalBase = 0;
    let thisMonthBase = 0;
    const now = new Date();
    const currentMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
    
    for (const exp of expenses) {
        const amt = parseFloat(exp.amount) || 0;
        const baseAmt = convertToBase(amt, exp.currency, settings);
        totalBase += baseAmt;
        if (exp.date && exp.date.startsWith(currentMonth)) {
            thisMonthBase += baseAmt;
        }
    }
    
    const totalEl = document.getElementById('totalAmount');
    const thisMonthEl = document.getElementById('thisMonthAmount');
    const countEl = document.getElementById('expenseCount');
    const baseLabel = document.getElementById('baseCurrencyLabel');
    
    if (totalEl) totalEl.textContent = formatCurrency(totalBase, settings.currency);
    if (thisMonthEl) thisMonthEl.textContent = formatCurrency(thisMonthBase, settings.currency);
    if (countEl) countEl.textContent = expenses.length;
    if (baseLabel) baseLabel.textContent = settings.currency;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}