export function exportToJSON(data) {
    return JSON.stringify(data, null, 2);
}

export function importFromJSON(jsonString) {
    try {
        const data = JSON.parse(jsonString);
        // Basic validation
        if (!data || typeof data !== 'object') throw new Error('Invalid JSON format');
        if (!Array.isArray(data.expenses)) throw new Error('Invalid expenses data');
        if (!Array.isArray(data.categories)) throw new Error('Invalid categories data');
        if (!Array.isArray(data.recurring)) data.recurring = [];
        if (!data.budgets) data.budgets = {};
        if (!data.settings) data.settings = {};
        return data;
    } catch (e) {
        throw new Error('Failed to parse JSON: ' + e.message);
    }
}

export function exportExpensesToCSV(expenses) {
    if (!expenses || expenses.length === 0) {
        // Return header-only CSV
        return 'id,date,amount,currency,category,merchant,note,recurringId,createdAt\n';
    }
    
    const headers = ['id', 'date', 'amount', 'currency', 'category', 'merchant', 'note', 'recurringId', 'createdAt'];
    const rows = [headers.join(',')];
    
    for (const exp of expenses) {
        const row = [
            escapeCSV(exp.id || ''),
            escapeCSV(exp.date || ''),
            escapeCSV(exp.amount || 0),
            escapeCSV(exp.currency || ''),
            escapeCSV(exp.category || ''),
            escapeCSV(exp.merchant || ''),
            escapeCSV(exp.note || ''),
            escapeCSV(exp.recurringId || ''),
            escapeCSV(exp.createdAt || '')
        ];
        rows.push(row.join(','));
    }
    
    return rows.join('\n');
}

function escapeCSV(field) {
    const str = String(field);
    // If field contains comma, quote, or newline, wrap in quotes and escape quotes
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
}