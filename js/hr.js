// JS/hr.js
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', async () => {
    await loadHRData();
});

async function loadHRData() {
    // Fetch HR Stats
    const snapshot = await db.collection('hr_stats')
        .orderBy('period', 'asc') // Sort by month YYYY-MM
        .limit(12) // Last 12 months
        .get();

    const labels = [];
    const headcountData = [];
    const turnoverData = [];
    const payrollData = [];

    // Process Last Record for Cards
    let lastHeadcount = 0;
    let lastTurnover = 0;
    let lastCostPerHead = 0;

    snapshot.forEach(doc => {
        const data = doc.data();
        labels.push(formatMonth(data.period));
        headcountData.push(data.headcount);

        // Calculate turnover %
        const rate = (data.resigned / (data.headcount || 1)) * 100;
        turnoverData.push(rate);

        lastHeadcount = data.headcount;
        lastTurnover = rate;
        lastCostPerHead = data.payroll / (data.headcount || 1);
    });

    // Update Cards
    const headEl = document.getElementById('currentHeadcount');
    if (headEl) headEl.textContent = lastHeadcount + ' คน';

    const turnEl = document.getElementById('turnoverRate');
    if (turnEl) turnEl.textContent = lastTurnover.toFixed(1) + '%';

    const costEl = document.getElementById('costPerHead');
    if (costEl) costEl.textContent = '฿' + Math.round(lastCostPerHead).toLocaleString();

    // Render Charts
    renderHeadcountChart(labels, headcountData, turnoverData);

    // For Efficiency Chart, we need Revenue data too. 
    // This might be complex to join in NoSQL efficiently without preparation.
    // For now, let's mock the Revenue part or fetch it roughly.
    // Note: In a real app, we might store 'revenue' in hr_stats or fetch 'entries' and aggregate.
    // Let's assume we fetch entries separately or just show "Cost Trend" for now.
    renderEfficiencyChart(labels, headcountData); // Placeholder
}

function formatMonth(ym) {
    // YYYY-MM -> Month Name
    const [y, m] = ym.split('-');
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    return months[parseInt(m) - 1] + ' ' + (parseInt(y) + 543).toString().slice(2);
}

function renderHeadcountChart(labels, headcount, turnover) {
    const ctx = document.getElementById('headcountChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'จำนวนพนักงาน',
                    data: headcount,
                    borderColor: '#4f46e5',
                    yAxisID: 'y'
                },
                {
                    label: 'อัตราไหลออก (%)',
                    data: turnover,
                    borderColor: '#ef4444',
                    borderDash: [5, 5],
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            scales: {
                y: { type: 'linear', display: true, position: 'left' },
                y1: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false } }
            }
        }
    });
}

function renderEfficiencyChart(labels, data) {
    // Placeholder for efficiency
    // Ideally: (TotalPayroll / TotalRevenue) * 100
    const ctx = document.getElementById('efficiencyChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'ต้นทุนพนักงาน (บาท)',
                data: data.map(d => d * 15000), // Dummy calculation: headcount * avg salary
                backgroundColor: '#cbd5e1'
            }]
        }
    });
}
