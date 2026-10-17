// Chart.js integration for expense tracking
import { convertToBase } from './utils.js';

let categoryChart = null;
let trendChart = null;

export function renderCharts(expenses, settings) {
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js not loaded; skipping charts.');
        return;
    }
    renderCategoryChart(expenses, settings);
    renderTrendChart(expenses, settings);
}

function cssVar(name, fallback) {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name);
    return v && v.trim() ? v.trim() : fallback;
}

function renderCategoryChart(expenses, settings) {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;
    const baseCurrency = settings.currency;
    
    // Group expenses by category (converted to base currency)
    const categoryTotals = {};
    for (const exp of expenses) {
        const cat = exp.category || 'Uncategorized';
        if (!categoryTotals[cat]) categoryTotals[cat] = 0;
        categoryTotals[cat] += convertToBase(parseFloat(exp.amount) || 0, exp.currency, settings);
    }
    
    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);
    
    if (categoryChart) {
        categoryChart.destroy();
    }
    
    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#2563eb',
                    '#10b981',
                    '#f59e0b',
                    '#ef4444',
                    '#8b5cf6',
                    '#ec4899',
                    '#06b6d4',
                    '#6366f1',
                    '#f97316',
                    '#84cc16'
                ],
                borderWidth: 2,
                borderColor: cssVar('--bg', '#ffffff')
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: cssVar('--text', '#111111'),
                        font: {
                            size: 11
                        }
                    }
                },
                tooltip: {
                    backgroundColor: cssVar('--surface', '#ffffff'),
                    titleColor: cssVar('--text', '#111111'),
                    bodyColor: cssVar('--text', '#111111'),
                    borderColor: cssVar('--border', '#e5e7eb'),
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            // Show with currency symbol - use base currency label
                            return `${label}: ${baseCurrency} ${value.toFixed(2)}`;
                        }
                    }
                }
            }
        }
    });
}

function renderTrendChart(expenses, settings) {
    const ctx = document.getElementById('trendChart');
    if (!ctx) return;
    const baseCurrency = settings.currency;
    
    // Group by month (YYYY-MM), converted to base currency
    const monthlyTotals = {};
    for (const exp of expenses) {
        if (!exp.date) continue;
        const monthKey = exp.date.substring(0, 7); // YYYY-MM
        if (!monthlyTotals[monthKey]) monthlyTotals[monthKey] = 0;
        monthlyTotals[monthKey] += convertToBase(parseFloat(exp.amount) || 0, exp.currency, settings);
    }
    
    // Sort months
    const sortedMonths = Object.keys(monthlyTotals).sort();
    const labels = sortedMonths.map(m => {
        const [year, month] = m.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    });
    const data = sortedMonths.map(m => monthlyTotals[m]);
    
    if (trendChart) {
        trendChart.destroy();
    }
    
    trendChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: `Total (${baseCurrency})`,
                data: data,
                backgroundColor: '#2563eb',
                borderColor: '#2563eb',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    ticks: {
                        color: cssVar('--text-muted', '#6b7280')
                    },
                    grid: {
                        color: cssVar('--border', '#e5e7eb')
                    }
                },
                x: {
                    ticks: {
                        color: cssVar('--text-muted', '#6b7280')
                    },
                    grid: {
                        color: cssVar('--border', '#e5e7eb')
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: cssVar('--surface', '#ffffff'),
                    titleColor: cssVar('--text', '#111111'),
                    bodyColor: cssVar('--text', '#111111'),
                    borderColor: cssVar('--border', '#e5e7eb'),
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed.y || 0;
                            return `${baseCurrency} ${value.toFixed(2)}`;
                        }
                    }
                }
            }
        }
    });
}