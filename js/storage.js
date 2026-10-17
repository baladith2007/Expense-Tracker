import { generateId } from './utils.js';

const STORAGE_KEY = 'expensetracker:v1';

export const DEFAULT_CATEGORIES = [
    'Rent',
    'Utilities',
    'Food',
    'Software/Tools',
    'Marketing',
    'Hardware',
    'Travel',
    'Misc'
];

export const DEFAULT_CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD'];

export function getDefaultData() {
    return {
        version: 1,
        expenses: [],
        recurring: [],
        categories: [...DEFAULT_CATEGORIES],
        budgets: {},
        settings: {
            theme: 'light',
            currency: 'USD',
            fx: {
                'EUR': 1.1,
                'GBP': 1.3,
                'INR': 0.012,
                'JPY': 0.0067,
                'CAD': 0.74,
                'AUD': 0.66
            },
            dateFormat: 'YYYY-MM-DD'
        }
    };
}

export function loadData() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            const data = getDefaultData();
            saveData(data);
            return data;
        }
        const parsed = JSON.parse(raw);
        // Merge with defaults to ensure all fields exist
        const defaults = getDefaultData();
        return {
            version: parsed.version || defaults.version,
            expenses: Array.isArray(parsed.expenses) ? parsed.expenses : [],
            recurring: Array.isArray(parsed.recurring) ? parsed.recurring : [],
            categories: Array.isArray(parsed.categories) && parsed.categories.length > 0 ? parsed.categories : defaults.categories,
            budgets: parsed.budgets || defaults.budgets,
            settings: { ...defaults.settings, ...(parsed.settings || {}) }
        };
    } catch (e) {
        console.error('Failed to load data:', e);
        return getDefaultData();
    }
}

export function saveData(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.error('Failed to save data:', e);
        throw e;
    }
}