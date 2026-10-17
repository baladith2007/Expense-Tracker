import { generateId, addDays, addWeeks, addMonths, addYears, getCurrentDateISO } from './utils.js';

export function generateDueRecurringExpenses(recurringList, currentDate = getCurrentDateISO()) {
    const due = [];
    for (const rec of recurringList) {
        if (!rec.active) continue;
        if (!rec.nextDue) continue;
        let dueDate = rec.nextDue;
        let generated = 0;
        // Catch up multiple missed periods (cap at 120 iterations for safety)
        while (dueDate <= currentDate && generated < 120) {
            due.push({
                id: generateId(),
                date: dueDate,
                amount: rec.template.amount,
                currency: rec.template.currency,
                category: rec.template.category,
                merchant: rec.template.merchant,
                note: rec.template.note || '',
                recurringId: rec.id,
                createdAt: Date.now()
            });
            dueDate = calculateNextDue(rec, dueDate);
            generated++;
        }
        if (generated > 0) {
            rec.nextDue = dueDate;
            if (rec.lastCreatedAt === undefined) rec.lastCreatedAt = Date.now();
        }
    }
    return due;
}

export function calculateNextDue(recurring, fromDate) {
    const freq = recurring.frequency;
    const interval = parseInt(recurring.interval) || 1;
    if (freq === 'daily') return addDays(fromDate, interval);
    if (freq === 'weekly') return addWeeks(fromDate, interval);
    if (freq === 'monthly') return addMonths(fromDate, interval);
    if (freq === 'yearly') return addYears(fromDate, interval);
    return addMonths(fromDate, interval);
}