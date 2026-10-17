// Utility Functions

export function generateId() {
    // Simple UUID v4-like generator
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
            v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export function formatCurrency(amount, currency = 'USD') {
    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    } catch (e) {
        return `$${amount.toFixed(2)}`;
    }
}

export function formatDate(dateString) {
    try {
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    } catch (e) {
        return dateString;
    }
}

export function getCurrentDateISO() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function isSameMonth(dateString1, dateString2) {
    const d1 = new Date(dateString1 + 'T00:00:00');
    const d2 = new Date(dateString2 + 'T00:00:00');
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth();
}

export function addMonths(dateString, months) {
    const date = new Date(dateString + 'T00:00:00');
    date.setMonth(date.getMonth() + months);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function addDays(dateString, days) {
    const date = new Date(dateString + 'T00:00:00');
    date.setDate(date.getDate() + days);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function addWeeks(dateString, weeks) {
    return addDays(dateString, weeks * 7);
}

export function addYears(dateString, years) {
    const date = new Date(dateString + 'T00:00:00');
    date.setFullYear(date.getFullYear() + years);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.setAttribute('aria-hidden', 'false');
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
        toast.setAttribute('aria-hidden', 'true');
    }, 3000);
}

export function convertToBase(amount, fromCurrency, settings) {
    if (!settings || !settings.fx) return amount;
    if (!fromCurrency || fromCurrency === settings.currency) return amount;
    const rate = settings.fx[fromCurrency];
    if (rate && rate > 0) {
        // Rate = how many base units per 1 unit of fromCurrency
        return amount * rate;
    }
    return amount;
}