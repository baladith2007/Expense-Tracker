import { generateId } from './utils.js';

export function createExpense(data) {
    return {
        id: data.id || generateId(),
        date: data.date,
        amount: parseFloat(data.amount) || 0,
        currency: data.currency || 'USD',
        category: data.category || 'Misc',
        merchant: data.merchant || '',
        note: data.note || '',
        recurringId: data.recurringId || null,
        createdAt: data.createdAt || Date.now()
    };
}

export function createRecurring(data) {
    return {
        id: data.id || generateId(),
        frequency: data.frequency || 'monthly',
        interval: parseInt(data.interval) || 1,
        nextDue: data.nextDue,
        template: {
            amount: parseFloat(data.amount) || 0,
            currency: data.currency || 'USD',
            category: data.category || 'Misc',
            merchant: data.merchant || '',
            note: data.note || ''
        },
        lastCreatedAt: data.lastCreatedAt || 0,
        active: data.active !== undefined ? data.active : true
    };
}

export function createBudget(category, amount, period = 'monthly') {
    return {
        amount: parseFloat(amount) || 0,
        period: period
    };
}