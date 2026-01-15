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

// ===== INITIALIZE DASHBOARD =====
async function initDashboard() {
    try {
        // Show loading state
        showLoading();

        // Get data (use sample data if API is not configured)
        let data;
        if (isAPIConfigured()) {
            // Fetch from Google Sheets API
            const [revenue2568, revenue2569, expenses] = await Promise.all([
                sheetsAPI.getRevenueData(2568),
                sheetsAPI.getRevenueData(2569),
                sheetsAPI.getExpenseData()
            ]);
            data = { revenue2568, revenue2569, expenses };
        } else {
            // Use sample data
            data = getSampleData();
        }

        // Update stats cards
        updateStatsCards(data);

        // Create charts
        createCharts(data);

        // Update data table
        updateDataTable(data);

        // Hide loading state
        hideLoading();

    } catch (error) {
        console.error('Error initializing dashboard:', error);
        hideLoading();
        showError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
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
