// ============================================
// SAKULKIM DASHBOARD - CHARTS
// Chart.js configurations and utilities
// ============================================

class DashboardCharts {
    constructor() {
        this.charts = {};
        this.isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';

        // Listen for theme changes
        window.addEventListener('themeChanged', () => {
            this.isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
            this.updateChartsTheme();
        });
    }

    // Get chart colors based on theme
    getColors() {
        return {
            primary: '#10b981',
            secondary: '#3b82f6',
            accent: '#f59e0b',
            danger: '#ef4444',
            purple: '#8b5cf6',
            pink: '#ec4899',
            cyan: '#06b6d4',
            gray: this.isDarkMode ? '#64748b' : '#94a3b8',
            text: this.isDarkMode ? '#f8fafc' : '#0f172a',
            textMuted: this.isDarkMode ? '#94a3b8' : '#64748b',
            gridColor: this.isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(15, 23, 42, 0.1)',
            background: this.isDarkMode ? '#1e293b' : '#ffffff'
        };
    }

    // Common chart options
    getCommonOptions() {
        const colors = this.getColors();

        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: colors.background,
                    titleColor: colors.text,
                    bodyColor: colors.textMuted,
                    borderColor: colors.gridColor,
                    borderWidth: 1,
                    padding: 12,
                    displayColors: true,
                    callbacks: {
                        label: function (context) {
                            let value = context.raw;
                            if (typeof value === 'number') {
                                value = new Intl.NumberFormat('th-TH', {
                                    style: 'currency',
                                    currency: 'THB',
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0
                                }).format(value);
                            }
                            return `${context.dataset.label}: ${value}`;
                        }
                    }
                }
            }
        };
    }

    // Create trend line chart
    createTrendChart(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        const colors = this.getColors();
        const options = this.getCommonOptions();

        // Destroy existing chart
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        this.charts[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'รายได้',
                        data: data.revenue,
                        borderColor: colors.primary,
                        backgroundColor: `${colors.primary}20`,
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        pointBackgroundColor: colors.primary,
                        pointBorderColor: colors.background,
                        pointBorderWidth: 2
                    },
                    {
                        label: 'ต้นทุน',
                        data: data.cogs,
                        borderColor: colors.secondary,
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        pointBackgroundColor: colors.secondary,
                        pointBorderColor: colors.background,
                        pointBorderWidth: 2
                    },
                    {
                        label: 'กำไร',
                        data: data.profit,
                        borderColor: colors.accent,
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        pointBackgroundColor: colors.accent,
                        pointBorderColor: colors.background,
                        pointBorderWidth: 2
                    }
                ]
            },
            options: {
                ...options,
                scales: {
                    x: {
                        grid: {
                            color: colors.gridColor,
                            drawBorder: false
                        },
                        ticks: {
                            color: colors.textMuted,
                            font: {
                                family: "'Inter', sans-serif",
                                size: 11
                            }
                        }
                    },
                    y: {
                        grid: {
                            color: colors.gridColor,
                            drawBorder: false
                        },
                        ticks: {
                            color: colors.textMuted,
                            font: {
                                family: "'Inter', sans-serif",
                                size: 11
                            },
                            callback: function (value) {
                                if (value >= 1000000) {
                                    return (value / 1000000).toFixed(1) + 'M';
                                } else if (value >= 1000) {
                                    return (value / 1000).toFixed(0) + 'K';
                                }
                                return value;
                            }
                        },
                        beginAtZero: true
                    }
                },
                interaction: {
                    mode: 'index',
                    intersect: false
                }
            }
        });

        return this.charts[canvasId];
    }

    // Create expense breakdown pie/doughnut chart
    createExpenseChart(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        const colors = this.getColors();
        const options = this.getCommonOptions();

        // Destroy existing chart
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        const chartColors = [
            colors.primary,
            colors.secondary,
            colors.accent,
            colors.purple,
            colors.pink,
            colors.cyan,
            colors.danger,
            colors.gray
        ];

        this.charts[canvasId] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.values,
                    backgroundColor: chartColors.slice(0, data.values.length),
                    borderColor: colors.background,
                    borderWidth: 2,
                    hoverOffset: 10
                }]
            },
            options: {
                ...options,
                cutout: '60%',
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            color: colors.textMuted,
                            font: {
                                family: "'Inter', sans-serif",
                                size: 11
                            },
                            padding: 15,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        ...options.plugins.tooltip,
                        callbacks: {
                            label: function (context) {
                                const value = context.raw;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                const formatted = new Intl.NumberFormat('th-TH', {
                                    style: 'currency',
                                    currency: 'THB',
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0
                                }).format(value);
                                return `${context.label}: ${formatted} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });

        return this.charts[canvasId];
    }

    // Create bar chart
    createBarChart(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        const colors = this.getColors();
        const options = this.getCommonOptions();

        // Destroy existing chart
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: data.label || 'Value',
                    data: data.values,
                    backgroundColor: colors.primary,
                    borderColor: colors.primary,
                    borderWidth: 0,
                    borderRadius: 6,
                    borderSkipped: false
                }]
            },
            options: {
                ...options,
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: colors.textMuted,
                            font: {
                                family: "'Inter', sans-serif",
                                size: 11
                            }
                        }
                    },
                    y: {
                        grid: {
                            color: colors.gridColor,
                            drawBorder: false
                        },
                        ticks: {
                            color: colors.textMuted,
                            font: {
                                family: "'Inter', sans-serif",
                                size: 11
                            },
                            callback: function (value) {
                                if (value >= 1000000) {
                                    return (value / 1000000).toFixed(1) + 'M';
                                } else if (value >= 1000) {
                                    return (value / 1000).toFixed(0) + 'K';
                                }
                                return value;
                            }
                        },
                        beginAtZero: true
                    }
                }
            }
        });

        return this.charts[canvasId];
    }

    // Update all charts theme
    updateChartsTheme() {
        const colors = this.getColors();

        Object.values(this.charts).forEach(chart => {
            if (!chart) return;

            // Update scales
            if (chart.options.scales) {
                if (chart.options.scales.x) {
                    chart.options.scales.x.grid.color = colors.gridColor;
                    chart.options.scales.x.ticks.color = colors.textMuted;
                }
                if (chart.options.scales.y) {
                    chart.options.scales.y.grid.color = colors.gridColor;
                    chart.options.scales.y.ticks.color = colors.textMuted;
                }
            }

            // Update tooltip
            if (chart.options.plugins.tooltip) {
                chart.options.plugins.tooltip.backgroundColor = colors.background;
                chart.options.plugins.tooltip.titleColor = colors.text;
                chart.options.plugins.tooltip.bodyColor = colors.textMuted;
                chart.options.plugins.tooltip.borderColor = colors.gridColor;
            }

            // Update legend
            if (chart.options.plugins.legend && chart.options.plugins.legend.labels) {
                chart.options.plugins.legend.labels.color = colors.textMuted;
            }

            chart.update('none');
        });
    }

    // Destroy a specific chart
    destroyChart(canvasId) {
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
            delete this.charts[canvasId];
        }
    }

    // Destroy all charts
    destroyAllCharts() {
        Object.keys(this.charts).forEach(canvasId => {
            this.destroyChart(canvasId);
        });
    }
}

// Create global instance
const dashboardCharts = new DashboardCharts();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DashboardCharts, dashboardCharts };
}
