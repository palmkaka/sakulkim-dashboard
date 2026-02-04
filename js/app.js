// ============================================
// SAKULKIM DASHBOARD - MAIN APP
// Application initialization and logic
// ============================================

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);

    // Check authentication
    firebase.auth().onAuthStateChanged(async (user) => {
        if (!user) {
            window.location.href = 'index.html';
            return;
        }

        // Load user profile
        await auth.loadUserProfile(user.uid);

        // Update UI with user info
        updateUserUI();

        // Setup navigation based on role
        setupNavigationByRole();

        // Initialize dashboard
        initDashboard();
    });

    // Setup event listeners
    setupEventListeners();

    // Initialize language
    await i18n.init();

    // Load saved theme
    loadTheme();
});

// ===== UPDATE USER UI =====
function updateUserUI() {
    const profile = auth.getUserProfile();
    const role = auth.getCurrentRole();

    // Update sidebar user info
    const userName = document.getElementById('userName');
    const userRole = document.getElementById('userRole');
    const userAvatar = document.getElementById('userAvatar');

    if (userName) userName.textContent = profile?.displayName || profile?.email || 'User';
    if (userRole) userRole.textContent = auth.getRoleDisplayName(i18n.getCurrentLang());
    if (userAvatar) userAvatar.textContent = auth.getInitials();

    // Update header user info
    const headerUserName = document.getElementById('headerUserName');
    const headerUserRole = document.getElementById('headerUserRole');
    const headerAvatar = document.getElementById('headerAvatar');

    if (headerUserName) headerUserName.textContent = profile?.displayName || profile?.email?.split('@')[0] || 'User';
    if (headerUserRole) headerUserRole.textContent = auth.getRoleDisplayName(i18n.getCurrentLang());
    if (headerAvatar) headerAvatar.textContent = auth.getInitials();
}

// ===== SETUP NAVIGATION BY ROLE =====
function setupNavigationByRole() {
    const role = auth.getCurrentRole();

    // Hide admin section for non-admins
    const adminSection = document.getElementById('adminSection');
    if (adminSection) {
        adminSection.style.display = auth.canManageUsers() ? 'block' : 'none';
    }

    // Hide approvals for non-managers
    const navApprovals = document.getElementById('navApprovals');
    if (navApprovals) {
        navApprovals.style.display = auth.canApprove() ? 'flex' : 'none';
    }

    // Show/hide data entry based on permissions
    const navDataEntry = document.getElementById('navDataEntry');
    if (navDataEntry) {
        navDataEntry.style.display = auth.canAddData() ? 'flex' : 'none';
    }

    // Hide dashboard for employees (customer role)
    const navDashboard = document.getElementById('navDashboard');
    if (role === 'customer') {
        if (navDashboard) navDashboard.style.display = 'none';

        // If on dashboard page, redirect to my-entries
        if (window.location.pathname.endsWith('dashboard.html') || window.location.pathname === '/') {
            window.location.href = 'my-entries.html';
        }
    }
}

// ===== GLOBAL VARIABLES =====
let selectedYear = new Date().getFullYear() + 543; // Default: current Buddhist year
let selectedDataType = 'all'; // Default: show all data types
let allEntriesCache = []; // Cache for all entries
let statisticsCache = []; // Cache for statistics data

// ===== INITIALIZE DASHBOARD =====
async function initDashboard() {
    try {
        // Show loading state
        showLoading();

        // Get selected year from dropdown
        const yearSelect = document.getElementById('yearSelect');
        if (yearSelect) {
            selectedYear = parseInt(yearSelect.value);
        }

        // Get selected data type from dropdown
        const dataTypeSelect = document.getElementById('dataTypeSelect');
        if (dataTypeSelect) {
            selectedDataType = dataTypeSelect.value;
        }

        // Fetch data from Firestore
        const db = firebase.firestore();

        // Fetch entries (from data-entry submissions)
        const entriesSnapshot = await db.collection('entries')
            .where('status', '==', 'approved')
            .orderBy('date', 'desc')
            .get();

        // Fetch statistics (from CSV import)
        const statsSnapshot = await db.collection('statistics')
            .orderBy('importedAt', 'desc')
            .get();

        // Convert to array and cache
        allEntriesCache = entriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        statisticsCache = statsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Update dashboard based on data source
        if (statisticsCache.length > 0) {
            // Use imported statistics data
            updateDashboardFromStatistics(selectedYear, selectedDataType);
        } else {
            // Fallback to entries data
            updateStatsCardsByYear(selectedYear);
            createChartsByYear(selectedYear);
            updateDataTableByYear(selectedYear);
        }

        // Update year comparison cards
        updateYearComparison();

        // Load recent entries
        loadRecentEntries();

        // Populate year dropdown with available years
        populateYearDropdown();

        // Hide loading state
        hideLoading();

    } catch (error) {
        console.error('Error initializing dashboard:', error);
        hideLoading();
        // Fallback to sample data
        const data = getSampleData();
        updateStatsCards(data);
        createCharts(data);
        updateDataTable(data);
    }
}

// ===== UPDATE DASHBOARD FROM STATISTICS =====
function updateDashboardFromStatistics(year, dataType) {
    // Filter statistics by year
    const yearStats = statisticsCache.filter(stat => stat.year === year);

    if (yearStats.length === 0) {
        // No imported data, fallback to entries
        updateStatsCardsByYear(year);
        createChartsByYear(year);
        updateDataTableByYear(year);
        return;
    }

    // Get all stats by type
    const revenueStats = yearStats.filter(s => s.type === 'revenue');
    const expenseStats = yearStats.filter(s => s.type === 'expense');

    // Find specific stats
    const salesRevenue = revenueStats.find(s => s.category && s.category.includes('รายได้จากการขายสินค้า'));
    const otherIncome = revenueStats.find(s => s.category && s.category.includes('รายได้เป้า'));
    const totalRevenue = revenueStats.find(s => s.category && s.category.includes('รวม รายได้'));
    const cogsStat = revenueStats.find(s => s.category && s.category.includes('ต้นทุนสินค้า'));
    const profitStat = revenueStats.find(s => s.category && s.category.includes('กำไร'));

    // Calculate expenses total
    let expenseTotal = 0;
    expenseStats.forEach(stat => {
        expenseTotal += stat.total || 0;
    });

    // Get data based on selected type
    let displayValue = 0;
    let displayMonthly = Array(12).fill(0);
    let displayLabel = '';

    switch (dataType) {
        case 'revenue':
            displayValue = salesRevenue ? salesRevenue.total : 0;
            displayMonthly = salesRevenue ? salesRevenue.monthlyData : Array(12).fill(0);
            displayLabel = 'รายได้จากการขายสินค้า';
            break;
        case 'other_income':
            displayValue = otherIncome ? otherIncome.total : 0;
            displayMonthly = otherIncome ? otherIncome.monthlyData : Array(12).fill(0);
            displayLabel = 'รายได้เป้า/ส่วนลด/อื่นๆ';
            break;
        case 'total_revenue':
            displayValue = totalRevenue ? totalRevenue.total : 0;
            displayMonthly = totalRevenue ? totalRevenue.monthlyData : Array(12).fill(0);
            displayLabel = 'รวมรายได้ทั้งสิ้น';
            break;
        case 'cogs':
            displayValue = cogsStat ? cogsStat.total : 0;
            displayMonthly = cogsStat ? cogsStat.monthlyData : Array(12).fill(0);
            displayLabel = 'ต้นทุนสินค้าเพื่อขาย';
            break;
        case 'gross_profit':
            displayValue = profitStat ? profitStat.total : 0;
            displayMonthly = profitStat ? profitStat.monthlyData : Array(12).fill(0);
            displayLabel = 'กำไรขั้นต้น';
            break;
        default: // 'all'
            displayValue = totalRevenue ? totalRevenue.total : (salesRevenue ? salesRevenue.total : 0);
            displayMonthly = totalRevenue ? totalRevenue.monthlyData : (salesRevenue ? salesRevenue.monthlyData : Array(12).fill(0));
            displayLabel = 'รวมรายได้ทั้งสิ้น';
            break;
    }

    // Common values for all cases
    const cogsValue = cogsStat ? cogsStat.total : 0;
    const profitValue = profitStat ? profitStat.total : 0;
    const totalRevenueVal = totalRevenue ? totalRevenue.total : (salesRevenue ? salesRevenue.total : 1);

    // Update year comparison cards (always show 2568 vs 2569)
    const year2568El = document.getElementById('year2568Value');
    const year2569El = document.getElementById('year2569Value');

    // Get 2568 data
    const stats2568 = statisticsCache.filter(stat => stat.year === 2568 && stat.type === 'revenue');
    let value2568 = 0;
    switch (dataType) {
        case 'revenue':
            const rev2568 = stats2568.find(s => s.category && s.category.includes('รายได้จากการขายสินค้า'));
            value2568 = rev2568 ? rev2568.total : 0;
            break;
        case 'cogs':
            const cogs2568 = stats2568.find(s => s.category && s.category.includes('ต้นทุนสินค้า'));
            value2568 = cogs2568 ? cogs2568.total : 0;
            break;
        case 'gross_profit':
            const profit2568 = stats2568.find(s => s.category && s.category.includes('กำไร'));
            value2568 = profit2568 ? profit2568.total : 0;
            break;
        default:
            const total2568 = stats2568.find(s => s.category && s.category.includes('รวม รายได้'));
            value2568 = total2568 ? total2568.total : 0;
    }

    // Get 2569 data
    const stats2569 = statisticsCache.filter(stat => stat.year === 2569 && stat.type === 'revenue');
    let value2569 = 0;
    switch (dataType) {
        case 'revenue':
            const rev2569 = stats2569.find(s => s.category && s.category.includes('รายได้จากการขายสินค้า'));
            value2569 = rev2569 ? rev2569.total : 0;
            break;
        case 'cogs':
            const cogs2569 = stats2569.find(s => s.category && s.category.includes('ต้นทุนสินค้า'));
            value2569 = cogs2569 ? cogs2569.total : 0;
            break;
        case 'gross_profit':
            const profit2569 = stats2569.find(s => s.category && s.category.includes('กำไร'));
            value2569 = profit2569 ? profit2569.total : 0;
            break;
        default:
            const total2569 = stats2569.find(s => s.category && s.category.includes('รวม รายได้'));
            value2569 = total2569 ? total2569.total : 0;
    }

    if (year2568El) year2568El.textContent = formatCurrency(value2568);
    if (year2569El) year2569El.textContent = formatCurrency(value2569);

    // Update stats cards - show appropriate values
    if (dataType === 'all') {
        updateStatValue('totalRevenue', totalRevenueVal);
        updateStatValue('totalCOGS', cogsValue);
        updateStatValue('totalExpenses', expenseTotal);
        updateStatValue('netProfit', profitValue - expenseTotal);
    } else {
        // When specific type selected, show that value prominently
        updateStatValue('totalRevenue', displayValue);
        updateStatValue('totalCOGS', cogsValue);
        updateStatValue('totalExpenses', expenseTotal);
        updateStatValue('netProfit', profitValue - expenseTotal);
    }

    // Update percentages
    const cogsPercentage = totalRevenueVal > 0 ? ((cogsValue / totalRevenueVal) * 100).toFixed(1) : '0';
    const expensesPercentage = totalRevenueVal > 0 ? ((expenseTotal / totalRevenueVal) * 100).toFixed(1) : '0';
    const netProfit = profitValue - expenseTotal;
    const profitMargin = totalRevenueVal > 0 ? ((netProfit / totalRevenueVal) * 100).toFixed(1) : '0';

    const cogsEl = document.getElementById('cogsPercentage');
    const expEl = document.getElementById('expensesPercentage');
    const profitEl = document.getElementById('profitMargin');

    if (cogsEl) cogsEl.textContent = `${cogsPercentage}%`;
    if (expEl) expEl.textContent = `${expensesPercentage}%`;
    if (profitEl) profitEl.textContent = `${profitMargin}%`;

    // Create charts with selected data type
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const cogsMonthly = cogsStat ? cogsStat.monthlyData : Array(12).fill(0);
    const profitMonthly = profitStat ? profitStat.monthlyData : Array(12).fill(0);

    if (typeof dashboardCharts !== 'undefined') {
        // Use selected data for chart
        dashboardCharts.createTrendChart('trendChart', {
            labels: months,
            revenue: displayMonthly,
            cogs: cogsMonthly,
            profit: profitMonthly
        });

        // Expense chart by category
        const expenseLabels = [];
        const expenseValues = [];
        expenseStats.forEach(stat => {
            if (stat.categories) {
                Object.entries(stat.categories).forEach(([key, value]) => {
                    const existingIndex = expenseLabels.indexOf(key);
                    if (existingIndex >= 0) {
                        expenseValues[existingIndex] += value;
                    } else {
                        expenseLabels.push(key);
                        expenseValues.push(value);
                    }
                });
            }
        });

        if (expenseLabels.length > 0) {
            dashboardCharts.createExpenseChart('expenseChart', {
                labels: expenseLabels,
                values: expenseValues
            });
        }
    }

    // Update data table with selected type or all
    updateDataTableFromStatistics(revenueStats, dataType);
}

// ===== UPDATE DATA TABLE FROM STATISTICS =====
function updateDataTableFromStatistics(revenueStats) {
    const tbody = document.getElementById('revenueTableBody');
    if (!tbody) return;

    const rows = [];
    const categories = [
        { key: 'รายได้จากการขายสินค้า', class: '' },
        { key: 'รายได้เป้า', class: '' },
        { key: 'รวม รายได้', class: 'font-semibold' },
        { key: 'ต้นทุนสินค้า', class: '' },
        { key: 'กำไร', class: 'font-semibold text-success' }
    ];

    categories.forEach(cat => {
        const stat = revenueStats.find(s => s.category.includes(cat.key));
        if (stat) {
            rows.push({
                label: stat.category,
                data: stat.monthlyData || Array(12).fill(0),
                class: cat.class
            });
        }
    });

    if (rows.length === 0) return;

    tbody.innerHTML = rows.map(row => {
        const total = row.data.reduce((a, b) => a + b, 0);
        return `
      <tr class="${row.class}">
        <td>${row.label}</td>
        ${row.data.slice(0, 6).map(val => `<td class="text-right">${formatNumber(val)}</td>`).join('')}
        ${row.data.slice(6).map(val => `<td class="text-right hide-mobile">${formatNumber(val)}</td>`).join('')}
        <td class="text-right font-semibold">${formatNumber(total)}</td>
      </tr>
    `;
    }).join('');
}

// ===== POPULATE YEAR DROPDOWN =====
function populateYearDropdown() {
    const yearSelect = document.getElementById('yearSelect');
    if (!yearSelect || allEntriesCache.length === 0) return;

    // Get unique years from entries
    const years = [...new Set(allEntriesCache.map(entry => {
        const date = entry.date || '';
        const year = parseInt(date.substring(0, 4));
        return year > 2500 ? year : year + 543; // Convert to Buddhist year if needed
    }))].filter(y => y > 2500).sort((a, b) => b - a);

    // Add current year if not in list
    const currentBuddhistYear = new Date().getFullYear() + 543;
    if (!years.includes(currentBuddhistYear)) {
        years.unshift(currentBuddhistYear);
    }

    // Rebuild options
    yearSelect.innerHTML = years.map(year =>
        `<option value="${year}" ${year === selectedYear ? 'selected' : ''}>ปี ${year}</option>`
    ).join('');
}

// ===== UPDATE STATS CARDS BY YEAR =====
function updateStatsCardsByYear(year) {
    // Filter entries by year
    const yearEntries = allEntriesCache.filter(entry => {
        const entryDate = entry.date || '';
        const entryYear = parseInt(entryDate.substring(0, 4));
        const buddhistYear = entryYear > 2500 ? entryYear : entryYear + 543;
        return buddhistYear === year;
    });

    // Calculate lists
    const revenueEntries = yearEntries.filter(e => e.type === 'revenue');
    const expenseEntries = yearEntries.filter(e => e.type === 'expense');

    // 1. Total Revenue
    const totalRevenue = revenueEntries.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

    // 2. Cost of Goods Sold (COGS)
    // Identify COGS from expenses where category is 'cogs' (defined in config.js)
    const cogsEntries = expenseEntries.filter(e => e.category === 'cogs');
    const totalCOGS = cogsEntries.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

    // 3. Operating Expenses (All other expenses)
    const otherExpenseEntries = expenseEntries.filter(e => e.category !== 'cogs');
    const totalOperatingExpenses = otherExpenseEntries.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

    // 4. Total Expenses (COGS + Operating)
    const totalExpenses = totalCOGS + totalOperatingExpenses;

    // 5. Net Profit
    const netProfit = totalRevenue - totalExpenses;

    // Update stats UI
    updateStatValue('totalRevenue', totalRevenue);
    updateStatValue('totalCOGS', totalCOGS);
    updateStatValue('totalExpenses', totalExpenses);
    updateStatValue('netProfit', netProfit);

    // Update percentages
    const cogsPercentage = totalRevenue > 0 ? ((totalCOGS / totalRevenue) * 100).toFixed(1) : '0';
    const expensesPercentage = totalRevenue > 0 ? ((totalExpenses / totalRevenue) * 100).toFixed(1) : '0';
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0';

    const cogsEl = document.getElementById('cogsPercentage');
    const expEl = document.getElementById('expensesPercentage');
    const profitEl = document.getElementById('profitMargin');

    if (cogsEl) cogsEl.textContent = `${cogsPercentage}% ของรายได้`;
    if (expEl) expEl.textContent = `${expensesPercentage}% ของรายได้`;
    if (profitEl) profitEl.textContent = `${profitMargin}% margin`;
}

// ===== UPDATE YEAR COMPARISON =====
function updateYearComparison() {
    const year2568El = document.getElementById('year2568Value');
    const year2569El = document.getElementById('year2569Value');

    // If we have statistics data, use it
    if (statisticsCache && statisticsCache.length > 0) {
        const stats2568 = statisticsCache.filter(s => s.year === 2568 && s.type === 'revenue');
        const stats2569 = statisticsCache.filter(s => s.year === 2569 && s.type === 'revenue');

        const total2568 = stats2568.find(s => s.category && s.category.includes('รวม รายได้'));
        const total2569 = stats2569.find(s => s.category && s.category.includes('รวม รายได้'));

        const value2568 = total2568 ? total2568.total : 0;
        const value2569 = total2569 ? total2569.total : 0;

        if (year2568El) year2568El.textContent = formatCurrency(value2568);
        if (year2569El) year2569El.textContent = formatCurrency(value2569);

        // Update change percentage
        const changePercent = value2568 > 0
            ? (((value2569 - value2568) / value2568) * 100).toFixed(1)
            : '0';
        const revenueChangeEl = document.getElementById('revenueChange');
        if (revenueChangeEl) {
            revenueChangeEl.textContent = changePercent >= 0 ? `+${changePercent}%` : `${changePercent}%`;
        }
        return;
    }

    // Fallback to entries data
    const currentYear = selectedYear;
    const previousYear = selectedYear - 1;

    const currentYearRevenue = calculateYearRevenue(currentYear);
    const previousYearRevenue = calculateYearRevenue(previousYear);

    if (year2568El) year2568El.textContent = formatCurrency(previousYearRevenue);
    if (year2569El) year2569El.textContent = formatCurrency(currentYearRevenue);

    const changePercent = previousYearRevenue > 0
        ? (((currentYearRevenue - previousYearRevenue) / previousYearRevenue) * 100).toFixed(1)
        : '0';
    const revenueChangeEl = document.getElementById('revenueChange');
    if (revenueChangeEl) {
        revenueChangeEl.textContent = changePercent >= 0 ? `+${changePercent}%` : `${changePercent}%`;
    }
}

function calculateYearRevenue(year) {
    const yearEntries = allEntriesCache.filter(entry => {
        const entryDate = entry.date || '';
        const entryYear = parseInt(entryDate.substring(0, 4));
        const buddhistYear = entryYear > 2500 ? entryYear : entryYear + 543;
        return buddhistYear === year;
    });

    const revenue = yearEntries.filter(e => e.type === 'revenue').reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    const tripRevenue = yearEntries.filter(e => e.type === 'trip').reduce((sum, e) => sum + (parseFloat(e.revenue) || 0), 0);
    return revenue + tripRevenue;
}

// ===== CREATE CHARTS BY YEAR =====
function createChartsByYear(year) {
    // Get monthly data for selected year
    const monthlyData = getMonthlyData(year);

    // Trend Chart
    if (typeof dashboardCharts !== 'undefined') {
        dashboardCharts.createTrendChart('trendChart', {
            labels: monthlyData.labels,
            revenue: monthlyData.revenue,
            cogs: monthlyData.cogs,
            profit: monthlyData.profit
        });

        // Expense Chart by category
        const expensesByCategory = getExpensesByCategory(year);
        dashboardCharts.createExpenseChart('expenseChart', {
            labels: expensesByCategory.labels,
            values: expensesByCategory.values
        });
    }
}

function getMonthlyData(year) {
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const revenue = Array(12).fill(0);
    const cogs = Array(12).fill(0);
    const operatingExpenses = Array(12).fill(0);

    allEntriesCache.forEach(entry => {
        const entryDate = entry.date || '';
        const entryYear = parseInt(entryDate.substring(0, 4));
        const buddhistYear = entryYear > 2500 ? entryYear : entryYear + 543;

        if (buddhistYear !== year) return;

        const month = parseInt(entryDate.substring(5, 7)) - 1; // 0-indexed
        if (month < 0 || month > 11) return;

        const amount = parseFloat(entry.amount) || 0;

        if (entry.type === 'revenue') {
            revenue[month] += amount;
        } else if (entry.type === 'expense') {
            if (entry.category === 'cogs') {
                cogs[month] += amount;
            } else {
                operatingExpenses[month] += amount;
            }
        }
    });

    // Profit = Revenue - COGS - Operating Expenses
    const profit = revenue.map((r, i) => r - cogs[i] - operatingExpenses[i]);

    return { labels: months, revenue, cogs, profit };
}

function getExpensesByCategory(year) {
    const categoryTotals = {};

    allEntriesCache.forEach(entry => {
        const entryDate = entry.date || '';
        const entryYear = parseInt(entryDate.substring(0, 4));
        const buddhistYear = entryYear > 2500 ? entryYear : entryYear + 543;

        if (buddhistYear !== year) return;
        if (entry.type !== 'expense') return;

        const categoryKey = entry.category || 'other';
        // Get readable name from CONFIG if available
        let label = categoryKey;
        if (typeof CATEGORIES !== 'undefined' && CATEGORIES.expense) {
            const catConfig = CATEGORIES.expense.find(c => c.id === categoryKey);
            if (catConfig) {
                // Use Thai name by default, or English if preferred
                label = catConfig.name.th || catConfig.name.en || categoryKey;
            }
        }

        categoryTotals[label] = (categoryTotals[label] || 0) + (parseFloat(entry.amount) || 0);
    });

    return {
        labels: Object.keys(categoryTotals),
        values: Object.values(categoryTotals)
    };
}

// ===== UPDATE DATA TABLE BY YEAR =====
function updateDataTableByYear(year) {
    const tbody = document.getElementById('revenueTableBody');
    if (!tbody) return;

    const monthlyData = getMonthlyData(year);

    const rows = [
        { label: 'รายได้รวม', data: monthlyData.revenue, class: '' },
        { label: 'ต้นทุนสินค้า (COGS)', data: monthlyData.cogs, class: '' },
        { label: 'กำไรขั้นต้น', data: monthlyData.profit, class: 'font-semibold text-success' }
    ];

    tbody.innerHTML = rows.map(row => {
        const total = row.data.reduce((a, b) => a + b, 0);
        return `
      <tr class="${row.class}">
        <td>${row.label}</td>
        ${row.data.slice(0, 6).map(val => `<td class="text-right">${formatNumber(val)}</td>`).join('')}
        ${row.data.slice(6).map(val => `<td class="text-right hide-mobile">${formatNumber(val)}</td>`).join('')}
        <td class="text-right font-semibold">${formatNumber(total)}</td>
      </tr>
    `;
    }).join('');
}

// ===== LOAD RECENT ENTRIES FROM FIRESTORE =====
async function loadRecentEntries() {
    const container = document.getElementById('recentEntriesContainer');
    if (!container) return;

    try {
        const db = firebase.firestore();
        const snapshot = await db.collection('entries')
            .orderBy('submittedAt', 'desc')
            .limit(10)
            .get();

        if (snapshot.empty) {
            container.innerHTML = `
                <div class="text-center text-muted p-4">
                    <p>ยังไม่มีรายการจากพนักงาน</p>
                </div>
            `;
            return;
        }

        const statusColors = {
            pending: 'var(--warning)',
            approved: 'var(--success)',
            rejected: 'var(--error)'
        };

        const statusLabels = {
            pending: 'รอตรวจสอบ',
            approved: 'อนุมัติแล้ว',
            rejected: 'ปฏิเสธ'
        };

        const typeIcons = {
            revenue: '💰',
            expense: '💸',
            trip: '🚚'
        };

        let html = '<div class="recent-entries-list">';
        snapshot.forEach(doc => {
            const entry = doc.data();
            const date = entry.date || entry.submittedAt?.split('T')[0] || '-';
            const amount = entry.type === 'trip'
                ? (entry.revenue || 0) - (entry.fuelCost || 0)
                : entry.amount || 0;
            const isPositive = entry.type === 'revenue' || (entry.type === 'trip' && amount > 0);

            html += `
                <div class="entry-item" style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid var(--border-color);">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="font-size: 20px;">${typeIcons[entry.type] || '📄'}</span>
                        <div>
                            <div style="font-weight: 500;">${entry.description || entry.category || entry.type}</div>
                            <div style="font-size: 12px; color: var(--text-muted);">${entry.submittedBy} • ${date}</div>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-weight: 600; color: ${isPositive ? 'var(--success)' : 'var(--error)'};">
                            ${isPositive ? '+' : '-'}฿${Math.abs(amount).toLocaleString()}
                        </div>
                        <div style="font-size: 11px; padding: 2px 6px; border-radius: 4px; background: ${statusColors[entry.status]}20; color: ${statusColors[entry.status]};">
                            ${statusLabels[entry.status] || entry.status}
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        container.innerHTML = html;

    } catch (error) {
        console.error('Error loading recent entries:', error);
        container.innerHTML = '<p class="text-center text-muted p-4">ไม่สามารถโหลดรายการได้</p>';
    }
}


// ===== UPDATE STATS CARDS =====
function updateStatsCards(data) {
    const sampleData = getSampleData();

    // Calculate totals from 2569 data
    const totalRevenue = sampleData.revenue2569.totalRevenue.reduce((a, b) => a + b, 0);
    const totalCOGS = sampleData.revenue2569.cogs.reduce((a, b) => a + b, 0);
    const totalGrossProfit = sampleData.revenue2569.grossProfit.reduce((a, b) => a + b, 0);

    // Calculate 2568 totals for comparison
    const total2568Revenue = sampleData.revenue2568.totalRevenue.reduce((a, b) => a + b, 0);

    // Calculate expense total
    const totalExpenses = sampleData.expenses.total || 23488211.80;

    // Net profit
    const netProfit = totalGrossProfit - totalExpenses;

    // Update stats
    updateStatValue('totalRevenue', totalRevenue);
    updateStatValue('totalCOGS', totalCOGS);
    updateStatValue('totalExpenses', totalExpenses);
    updateStatValue('netProfit', netProfit);

    // Update year comparison cards
    document.getElementById('year2568Value').textContent = formatCurrency(total2568Revenue);
    document.getElementById('year2569Value').textContent = formatCurrency(totalRevenue);

    // Update percentages
    const cogsPercentage = ((totalCOGS / totalRevenue) * 100).toFixed(1);
    const expensesPercentage = ((totalExpenses / totalRevenue) * 100).toFixed(1);
    const profitMargin = ((netProfit / totalRevenue) * 100).toFixed(1);
    const revenueChange = (((totalRevenue - total2568Revenue) / total2568Revenue) * 100).toFixed(1);

    document.getElementById('cogsPercentage').textContent = `${cogsPercentage}%`;
    document.getElementById('expensesPercentage').textContent = `${expensesPercentage}%`;
    document.getElementById('profitMargin').textContent = `${profitMargin}%`;
    document.getElementById('revenueChange').textContent = revenueChange >= 0 ? `+${revenueChange}%` : `${revenueChange}%`;
}

function updateStatValue(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = formatCurrency(value);
    }
}

// ===== CREATE CHARTS =====
function createCharts(data) {
    const sampleData = getSampleData();

    // Trend Chart
    dashboardCharts.createTrendChart('trendChart', {
        labels: sampleData.revenue2569.months,
        revenue: sampleData.revenue2569.totalRevenue,
        cogs: sampleData.revenue2569.cogs,
        profit: sampleData.revenue2569.grossProfit
    });

    // Expense Chart
    dashboardCharts.createExpenseChart('expenseChart', {
        labels: sampleData.expenses.categories.map(c => c.name),
        values: sampleData.expenses.categories.map(c => c.total)
    });
}

// ===== UPDATE DATA TABLE =====
function updateDataTable(data) {
    const sampleData = getSampleData();
    const tbody = document.getElementById('revenueTableBody');
    if (!tbody) return;

    const rows = [
        { label: 'รายได้จากการขายสินค้า', data: sampleData.revenue2569.revenue, class: '' },
        { label: 'รายได้ค่าส่ง/อื่นๆ', data: sampleData.revenue2569.otherIncome, class: '' },
        { label: 'รวมรายได้ทั้งหมด', data: sampleData.revenue2569.totalRevenue, class: 'font-semibold' },
        { label: 'ต้นทุนสินค้าขาย', data: sampleData.revenue2569.cogs, class: '' },
        { label: 'กำไรขั้นต้น', data: sampleData.revenue2569.grossProfit, class: 'font-semibold text-success' }
    ];

    tbody.innerHTML = rows.map(row => {
        const total = row.data.reduce((a, b) => a + b, 0);
        return `
      <tr class="${row.class}">
        <td>${row.label}</td>
        ${row.data.slice(0, 6).map(val => `<td class="text-right">${formatNumber(val)}</td>`).join('')}
        ${row.data.slice(6).map(val => `<td class="text-right hide-mobile">${formatNumber(val)}</td>`).join('')}
        <td class="text-right font-semibold">${formatNumber(total)}</td>
      </tr>
    `;
    }).join('');
}

// ===== UTILITY FUNCTIONS =====
function formatCurrency(value) {
    return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}

function formatNumber(value) {
    return new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}

function showLoading() {
    // Add skeleton loading effect
    document.querySelectorAll('.stat-value').forEach(el => {
        el.classList.add('skeleton');
    });
}

function hideLoading() {
    document.querySelectorAll('.stat-value').forEach(el => {
        el.classList.remove('skeleton');
    });
}

function showError(message) {
    // Could implement toast notification here
    console.error(message);
    alert(message);
}

// ===== THEME MANAGEMENT =====
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcons(savedTheme);
}

function updateThemeIcons(theme) {
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');

    if (sunIcon && moonIcon) {
        if (theme === 'dark') {
            sunIcon.classList.remove('hidden');
            moonIcon.classList.add('hidden');
        } else {
            sunIcon.classList.add('hidden');
            moonIcon.classList.remove('hidden');
        }
    }
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Theme Toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const html = document.documentElement;
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcons(newTheme);

            // Dispatch event for charts
            window.dispatchEvent(new CustomEvent('themeChanged'));
        });
    }

    // Sidebar Toggle (Mobile)
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    if (sidebarToggle && sidebar && sidebarOverlay) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            sidebarOverlay.classList.toggle('active');
        });

        sidebarOverlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
        });
    }

    // User Dropdown
    const userDropdown = document.getElementById('userDropdown');
    if (userDropdown) {
        userDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('active');
        });

        document.addEventListener('click', () => {
            userDropdown.classList.remove('active');
        });
    }

    // Logout Button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await firebase.auth().signOut();
            window.location.href = 'index.html';
        });
    }

    // Language Toggle
    const langBtns = document.querySelectorAll('.lang-btn');
    langBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            langBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const lang = btn.getAttribute('data-lang');
            await i18n.setLanguage(lang);
            updateUserUI(); // Update role display
        });
    });

    // Set active language button
    const currentLang = localStorage.getItem('lang') || 'th';
    langBtns.forEach(btn => {
        if (btn.getAttribute('data-lang') === currentLang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Export Button
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            // Open export dropdown or modal
            alert('ฟีเจอร์ Export จะเปิดใช้งานเมื่อเชื่อมต่อ Google Sheets API');
        });
    }

    // Year Select
    const yearSelect = document.getElementById('yearSelect');
    if (yearSelect) {
        yearSelect.addEventListener('change', () => {
            // Reload data for selected year
            initDashboard();
        });
    }

    // Data Type Select
    const dataTypeSelect = document.getElementById('dataTypeSelect');
    if (dataTypeSelect) {
        dataTypeSelect.addEventListener('change', () => {
            // Reload data for selected data type
            initDashboard();
        });
    }

    // Table Export Button
    const tableExportBtn = document.getElementById('tableExportBtn');
    if (tableExportBtn) {
        tableExportBtn.addEventListener('click', () => {
            exportTableToExcel();
        });
    }
}

// ===== EXPORT TO EXCEL =====
function exportTableToExcel() {
    const table = document.getElementById('revenueTable');
    if (!table) return;

    let csv = [];
    const rows = table.querySelectorAll('tr');

    rows.forEach(row => {
        const cols = row.querySelectorAll('td, th');
        const rowData = [];
        cols.forEach(col => {
            let text = col.textContent.replace(/,/g, '');
            rowData.push(text);
        });
        csv.push(rowData.join(','));
    });

    const csvContent = csv.join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `revenue_data_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initDashboard };
}
