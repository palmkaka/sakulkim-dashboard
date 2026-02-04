// ============================================
// SAKULKIM DASHBOARD - VIEW RENDERER
// UI Logic & Chart Rendering
// ============================================

const ViewRenderer = {
    charts: {},

    // Main Render Function
    render(viewName) {
        console.log('Rendering View:', viewName);

        // Update Title
        const titles = {
            'executive': 'ภาพรวมกำไรและการเงิน (Executive P&L)',
            'sales': 'วิเคราะห์ยอดขาย (Sales Performance)',
            'hr': 'ประสิทธิภาพพนักงาน (HR Analytics)',
            'marketing': 'การตลาดและ KPI (Marketing Ops)',
            'input': 'บันทึกข้อมูล (Data Entry)'
        };
        document.getElementById('page-title').innerText = titles[viewName] || 'Dashboard';

        // Render Specific Content
        const year = parseInt(document.getElementById('year-filter').value);

        if (viewName === 'executive') this.renderExecutive(year);
        if (viewName === 'sales') this.renderSales(year);
        if (viewName === 'hr') this.renderHR(year);
        if (viewName === 'marketing') this.renderMarketing(year);
        if (viewName === 'input') this.renderInput();
    },

    // 1. Executive Render
    renderExecutive(year) {
        const pnl = DataStore.getPnL(year);

        // Update Cards
        document.getElementById('exec-revenue').innerText = this.fmt(pnl.revenue);
        document.getElementById('exec-cogs').innerText = this.fmt(pnl.cogs);
        document.getElementById('exec-expenses').innerText = this.fmt(pnl.operatingExpenses);
        document.getElementById('exec-profit').innerText = this.fmt(pnl.netProfit);
        document.getElementById('exec-margin').innerText = pnl.margin.toFixed(1) + '% Margin';

        // Draw Charts
        this.drawChart('chart-profit-trend', 'line', {
            labels: ['Total Revenue', 'Total Cost', 'Net Profit'], // Simplified for Demo, real app needs monthly array
            datasets: [{
                label: 'Financials',
                data: [pnl.revenue, pnl.cogs + pnl.operatingExpenses, pnl.netProfit],
                backgroundColor: ['#10b981', '#ef4444', '#f59e0b']
            }]
        });

        // Cost Structure Chart
        const expenseData = DataStore.entries
            .filter(e => e.type === 'expense' && parseInt(e.date.split('-')[0]) === year)
            .reduce((acc, curr) => {
                const cat = curr.category || 'other';
                acc[cat] = (acc[cat] || 0) + parseFloat(curr.amount);
                return acc;
            }, {});

        this.drawChart('chart-cost-structure', 'doughnut', {
            labels: Object.keys(expenseData),
            datasets: [{
                data: Object.values(expenseData),
                backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
            }]
        });
    },

    // 2. Sales Render
    renderSales(year) {
        const byChannel = DataStore.getSalesByChannel(year);
        const channels = Object.keys(byChannel);
        const values = Object.values(byChannel);

        // Update Channels Grid
        const container = document.getElementById('sales-channels-container');
        container.innerHTML = channels.map((ch, i) => `
            <div class="card stat-card">
                <span class="stat-label uppercase">${ch}</span>
                <span class="stat-value text-blue">${this.fmt(values[i])}</span>
            </div>
        `).join('');

        // Target Chart
        const target = typeof SALES_TARGET !== 'undefined' ? SALES_TARGET * 12 : 12000000; // From config or default
        const totalSales = values.reduce((a, b) => a + b, 0);

        this.drawChart('chart-sales-target', 'bar', {
            labels: ['Actual Sales', 'Annual Target'],
            datasets: [{
                label: 'Amount (THB)',
                data: [totalSales, target],
                backgroundColor: ['#10b981', '#cbd5e1']
            }]
        });
    },

    // 3. HR Render
    renderHR(year) {
        // Simplified Logic: Show latest headcounts from hrStats
        const periods = Object.keys(DataStore.hrStats).sort().slice(-6); // Last 6 months
        const headcounts = periods.map(p => DataStore.hrStats[p].headcount || 0);

        this.drawChart('chart-headcount', 'line', {
            labels: periods,
            datasets: [{
                label: 'Employee Count',
                data: headcounts,
                borderColor: '#8b5cf6',
                tension: 0.1
            }]
        });

        // Productivity (Revenue / Payroll)
        const productivity = periods.map(p => {
            const rangeData = DataStore.getPnL(parseInt(p.split('-')[0]), parseInt(p.split('-')[1]));
            const payroll = DataStore.hrStats[p].payroll || 1;
            return ((payroll / rangeData.revenue) * 100).toFixed(1);
        });

        this.drawChart('chart-productivity', 'bar', {
            labels: periods,
            datasets: [{
                label: 'Cost % of Sales',
                data: productivity,
                backgroundColor: '#f59e0b'
            }]
        });
    },

    // 4. Marketing Render
    renderMarketing(year) {
        const metrics = DataStore.getMarketingMetrics(year);
        document.getElementById('mkt-spend').innerText = this.fmt(metrics.adSpend);
        document.getElementById('mkt-roas').innerText = metrics.roas.toFixed(1) + 'x';

        // KPI Gauges (Mockup logic for display)
        const container = document.getElementById('kpi-container');
        const depts = ['Sales', 'Marketing', 'Logistics', 'Admin'];

        container.innerHTML = depts.map(d => {
            // Calculate avg score from kpiLogs
            const logs = DataStore.kpiLogs.filter(k => k.department && k.department.toLowerCase() === d.toLowerCase());
            const score = logs.length > 0 ? (logs.reduce((s, k) => s + parseInt(k.score), 0) / logs.length).toFixed(0) : 0;
            const color = score > 80 ? 'text-green' : (score > 60 ? 'text-orange' : 'text-red');

            return `
            <div class="card stat-card" style="align-items: center;">
                <span class="stat-label">${d}</span>
                <div style="font-size: 2.5rem; font-weight: 800;" class="${color}">${score}</div>
                <span class="stat-sub">/ 100</span>
            </div>
            `;
        }).join('');
    },

    // 5. Input Render
    renderInput() {
        const container = document.getElementById('input-forms-container');

        // Define Forms HTML
        const salesForm = `
            <form onsubmit="ViewRenderer.submitEntry(event, 'revenue')">
                <div class="form-group"><label>Date</label><input type="date" name="date" class="form-input" required></div>
                <div class="form-group"><label>Channel</label>
                    <select name="channel" class="form-select">
                        <option value="retail">Retail</option>
                        <option value="wholesale">Wholesale</option>
                        <option value="online">Online</option>
                        <option value="project">Project</option>
                    </select>
                </div>
                <div class="form-group"><label>Amount</label><input type="number" name="amount" class="form-input" required></div>
                <button class="btn btn-primary">Save Sales</button>
            </form>`;

        const expenseForm = `
            <form onsubmit="ViewRenderer.submitEntry(event, 'expense')">
                <div class="form-group"><label>Date</label><input type="date" name="date" class="form-input" required></div>
                <div class="form-group"><label>Category</label>
                    <select name="category" class="form-select">
                        <option value="cogs">Cost of Goods (COGS)</option>
                        <option value="marketing">Marketing</option>
                        <option value="logistics">Logistics</option>
                        <option value="operation">Operation</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                 <div class="form-group"><label>Amount</label><input type="number" name="amount" class="form-input" required></div>
                <button class="btn btn-primary">Save Expense</button>
            </form>`;

        const hrForm = `
            <form onsubmit="ViewRenderer.submitHR(event)">
                <div class="form-group"><label>Month</label><input type="month" name="period" class="form-input" required></div>
                <div class="form-group"><label>Headcount</label><input type="number" name="headcount" class="form-input" required></div>
                <div class="form-group"><label>Total Payroll (Automated Expense)</label><input type="number" name="payroll" class="form-input" required></div>
                <button class="btn btn-primary">Update HR Stats</button>
            </form>`;

        const html = `
            <div id="tab-sales" class="input-section active">${salesForm}</div>
            <div id="tab-expenses" class="input-section" style="display:none">${expenseForm}</div>
            <div id="tab-hr" class="input-section" style="display:none">${hrForm}</div>
            <div id="tab-kpi" class="input-section" style="display:none"><p>KPI Form Coming Soon...</p></div>
        `;

        container.innerHTML = html;

        // Tab Logic
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.input-section').forEach(s => s.style.display = 'none');

                e.target.classList.add('active');
                document.getElementById('tab-' + e.target.dataset.tab).style.display = 'block';
            });
        });
    },

    // Form Submissions
    async submitEntry(e, type) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            type: type,
            date: formData.get('date'),
            amount: parseFloat(formData.get('amount')),
            channel: formData.get('channel') || null,
            category: formData.get('category') || null,
            submittedAt: new Date().toISOString()
        };

        if (await DataStore.addEntry('entries', data)) {
            alert('Saved successfully!');
            e.target.reset();
        }
    },

    async submitHR(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const period = formData.get('period');
        const payroll = parseFloat(formData.get('payroll'));

        const hrData = {
            period: period,
            headcount: parseInt(formData.get('headcount')),
            payroll: payroll
        };

        // 1. Save HR Stats
        await DataStore.addEntry('hr_stats', hrData);

        // 2. Auto-create Expense
        const expenseData = {
            type: 'expense',
            category: 'payroll',
            date: period + '-28',
            amount: payroll,
            description: 'Auto-linked HR Payroll',
            submittedAt: new Date().toISOString()
        };
        await DataStore.addEntry('entries', expenseData);

        alert('HR Updated & Payroll Expense Created!');
        e.target.reset();
    },

    // Utils
    fmt(num) {
        return '฿' + (num || 0).toLocaleString();
    },

    drawChart(id, type, data) {
        const ctx = document.getElementById(id);
        if (!ctx) return;

        if (this.charts[id]) this.charts[id].destroy();

        this.charts[id] = new Chart(ctx, {
            type: type,
            data: data,
            options: { responsive: true, maintainAspectRatio: false }
        });
    }
};
