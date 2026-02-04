// JS/sales.js
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', async () => {
    await loadSalesData();
});

async function loadSalesData() {
    const today = new Date();
    const currentMonth = today.toISOString().slice(0, 7); // YYYY-MM

    // Fetch Entries
    const snapshot = await db.collection('entries')
        .where('type', '==', 'revenue')
        .get();

    let channelStats = { retail: 0, wholesale: 0, online: 0, project: 0 };
    let monthlyTotal = 0;

    // Process Data
    snapshot.forEach(doc => {
        const data = doc.data();
        const amount = parseFloat(data.amount) || 0;
        const channel = data.channel || 'retail'; // fallback

        // Accumulate Total Channel Sales (All time for now, or filter by month)
        // Let's do Current Month for the Cards, All Year for Trend
        if (data.date && data.date.startsWith(currentMonth)) {
            monthlyTotal += amount;
            if (channelStats[channel] !== undefined) {
                channelStats[channel] += amount;
            }
        }
    });

    // Update UI Cards
    const monthSalesEl = document.getElementById('monthSales');
    if (monthSalesEl) monthSalesEl.textContent = `฿${monthlyTotal.toLocaleString()}`;

    const bestCh = Object.keys(channelStats).reduce((a, b) => channelStats[a] > channelStats[b] ? a : b);
    const bestChannelEl = document.getElementById('bestChannel');
    if (bestChannelEl) bestChannelEl.textContent = channelStats[bestCh] > 0 ? getChannelName(bestCh) : '-';

    // Update Charts
    updateChannelChart(channelStats);
    updateTargetChart(monthlyTotal);
}

function getChannelName(key) {
    const map = { retail: 'หน้าร้าน', wholesale: 'ขายส่ง', online: 'ออนไลน์', project: 'โครงการ' };
    return map[key] || key;
}

function updateChannelChart(stats) {
    const ctx = document.getElementById('channelChart');
    if (!ctx) return;

    new Chart(ctx.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['หน้าร้าน', 'ขายส่ง', 'ออนไลน์', 'โครงการ'],
            datasets: [{
                data: [stats.retail, stats.wholesale, stats.online, stats.project],
                backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6']
            }]
        }
    });
}

function updateTargetChart(actual) {
    const target = (typeof SALES_TARGET !== 'undefined') ? SALES_TARGET : 1000000;
    const ctx = document.getElementById('targetChart');
    if (!ctx) return;

    new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['เป้าหมาย', 'ทำได้จริง'],
            datasets: [{
                label: 'ยอดขาย (บาท)',
                data: [target, actual],
                backgroundColor: ['#e5e7eb', actual >= target ? '#10b981' : '#f59e0b']
            }]
        },
        options: {
            scales: { y: { beginAtZero: true } }
        }
    });
}
