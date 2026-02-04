// JS/marketing.js
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', async () => {
    await loadMarketingData();
});

async function loadMarketingData() {
    // 1. Fetch Revenue & Ad Spend (Current Month)
    const today = new Date();
    const currentMonth = today.toISOString().slice(0, 7);

    const entriesSnap = await db.collection('entries').get(); // Optimize with query in real app

    let totalRevenue = 0;
    let adSpend = 0;

    entriesSnap.forEach(doc => {
        const data = doc.data();
        if (!data.date.startsWith(currentMonth)) return;

        const amt = parseFloat(data.amount) || 0;

        if (data.type === 'revenue') {
            totalRevenue += amt;
        } else if (data.type === 'expense' && (data.category === 'marketing' || data.category === 'advertising')) {
            adSpend += amt;
        }
    });

    // Update Cards
    document.getElementById('adSpend').textContent = `฿${adSpend.toLocaleString()}`;
    document.getElementById('totalRev').textContent = `฿${totalRevenue.toLocaleString()}`;

    const roas = adSpend > 0 ? (totalRevenue / adSpend).toFixed(1) : '0.0';
    document.getElementById('roasVal').textContent = `${roas}x`;

    const mktPercent = totalRevenue > 0 ? ((adSpend / totalRevenue) * 100).toFixed(1) : '0';
    document.getElementById('marketingPercent').textContent = `${mktPercent}% of Sales`;

    // 2. Fetch KPI Scores
    const kpiSnap = await db.collection('kpi_logs')
        .where('period', '==', currentMonth)
        .get();

    let scores = { sales: 0, marketing: 0, logistics: 0 };
    let counts = { sales: 0, marketing: 0, logistics: 0 };

    kpiSnap.forEach(doc => {
        const data = doc.data();
        const dept = data.department; // sales, marketing, logistics
        if (scores[dept] !== undefined) {
            scores[dept] += parseInt(data.score) || 0;
            counts[dept]++;
        }
    });

    // Average Scores
    const avgSales = counts.sales > 0 ? Math.round(scores.sales / counts.sales) : 0;
    const avgMkt = counts.marketing > 0 ? Math.round(scores.marketing / counts.marketing) : 0;
    const avgLog = counts.logistics > 0 ? Math.round(scores.logistics / counts.logistics) : 0;

    drawGauge('gaugeSales', avgSales, 'scoreSales');
    drawGauge('gaugeMkt', avgMkt, 'scoreMkt');
    drawGauge('gaugeLog', avgLog, 'scoreLog');
}

function drawGauge(canvasId, value, textId) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    // Update Text
    document.getElementById(textId).textContent = value + '/100';

    // Donut Chart as Gauge
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Score', 'Left'],
            datasets: [{
                data: [value, 100 - value],
                backgroundColor: [getColor(value), '#e2e8f0'],
                borderWidth: 0,
                circumference: 180,
                rotation: 270
            }]
        },
        options: {
            cutout: '75%',
            plugins: { legend: { display: false }, tooltip: { enabled: false } }
        }
    });
}

function getColor(score) {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 60) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
}
