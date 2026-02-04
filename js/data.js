// ============================================
// SAKULKIM DASHBOARD - DATA LAYER
// Centralized Data Store & Logic
// ============================================

const DataStore = {
    entries: [],
    hrStats: {},
    kpiLogs: [],
    listeners: [],

    // Cache expiry
    lastFetch: 0,
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes

    // Initialize & Fetch All Data
    async init() {
        if (Date.now() - this.lastFetch < this.CACHE_DURATION && this.entries.length > 0) {
            return; // Use cache
        }
        await this.refresh();
    },

    // Refresh data from Firestore
    async refresh() {
        console.log('Fetching fresh data...');
        const db = firebase.firestore();

        try {
            // 1. Fetch Entries (Revenue, Expenses - All types)
            // In production, limit by date range (e.g., last 12 months)
            const entriesSnap = await db.collection('entries').orderBy('date', 'desc').get();
            this.entries = entriesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // 2. Fetch HR Stats
            const hrSnap = await db.collection('hr_stats').get();
            this.hrStats = {};
            hrSnap.forEach(doc => {
                this.hrStats[doc.id] = doc.data(); // doc.id is 'YYYY-MM'
            });

            // 3. Fetch KPI Logs
            const kpiSnap = await db.collection('kpi_logs').orderBy('submittedAt', 'desc').get();
            this.kpiLogs = kpiSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            this.lastFetch = Date.now();
            this.notifyListeners();
            console.log('Data refreshed:', this.entries.length, 'entries');

        } catch (error) {
            console.error('Data fetch error:', error);
        }
    },

    // Add Entry Helper
    async addEntry(collection, data) {
        const db = firebase.firestore();
        try {
            if (collection === 'hr_stats') {
                // For HR, we set doc ID as Period (YYYY-MM)
                await db.collection(collection).doc(data.period).set(data);
            } else {
                await db.collection(collection).add(data);
            }
            await this.refresh(); // Refresh locally
            return true;
        } catch (error) {
            console.error('Add entry error:', error);
            return false;
        }
    },

    // ============================================
    // ANALYTICS CALCULATIONS (The "Linkage" Logic)
    // ============================================

    // Get P&L for specific month or year
    getPnL(year, month = null) {
        let relevantEntries = this.entries.filter(e => {
            const d = e.date || ''; // YYYY-MM-DD
            const y = parseInt(d.substring(0, 4));
            const m = parseInt(d.substring(5, 7));

            // Handle Buddhist Year input if necessary (assumed Gregorian in stored data usually)
            // But let's assume stored data is ISO (Gregorian). 
            // Display might be Buddhist, but logic should use Year as is.
            const matchesYear = (y === year);
            const matchesMonth = month ? (m === month) : true;
            return matchesYear && matchesMonth;
        });

        const revenue = relevantEntries
            .filter(e => e.type === 'revenue')
            .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

        // Calculate COGS
        const cogs = relevantEntries
            .filter(e => e.type === 'expense' && e.category === 'cogs')
            .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

        // Calculate Operating Expenses (including linked payroll)
        const operating = relevantEntries
            .filter(e => e.type === 'expense' && e.category !== 'cogs')
            .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

        return {
            revenue,
            cogs,
            grossProfit: revenue - cogs,
            operatingExpenses: operating,
            netProfit: revenue - cogs - operating,
            margin: revenue > 0 ? ((revenue - cogs - operating) / revenue) * 100 : 0
        };
    },

    // Get Sales by Channel
    getSalesByChannel(year) {
        const data = { retail: 0, wholesale: 0, online: 0, project: 0 };

        this.entries.forEach(e => {
            if (e.type !== 'revenue') return;
            const y = parseInt(e.date.split('-')[0]);
            if (y !== year) return;

            const ch = e.channel || 'retail'; // Default
            if (data[ch] !== undefined) {
                data[ch] += parseFloat(e.amount) || 0;
            }
        });
        return data;
    },

    // Get Marketing Metrics (ROAS)
    getMarketingMetrics(year) {
        let revenue = 0;
        let adSpend = 0;

        this.entries.forEach(e => {
            const y = parseInt(e.date.split('-')[0]);
            if (y !== year) return;

            if (e.type === 'revenue') {
                revenue += parseFloat(e.amount) || 0;
            }
            if (e.type === 'expense' && e.category === 'marketing') {
                adSpend += parseFloat(e.amount) || 0;
            }
        });

        return {
            revenue,
            adSpend,
            roas: adSpend > 0 ? (revenue / adSpend) : 0,
            percentOfSales: revenue > 0 ? (adSpend / revenue) * 100 : 0
        };
    },

    // Subscribe to changes
    subscribe(callback) {
        this.listeners.push(callback);
    },

    notifyListeners() {
        this.listeners.forEach(cb => cb());
    }
};
