// ============================================
// SAKULKIM DASHBOARD - GOOGLE SHEETS API
// Read/Write data from Google Sheets
// ============================================

class SheetsAPI {
    constructor() {
        this.apiKey = sheetsConfig.apiKey;
        this.spreadsheetId = sheetsConfig.spreadsheetId;
        this.baseUrl = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}`;
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    // Fetch data from a specific sheet
    async fetchSheet(sheetName, range = '') {
        const cacheKey = `${sheetName}_${range}`;

        // Check cache
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        const fullRange = range ? `${sheetName}!${range}` : sheetName;
        const url = `${this.baseUrl}/values/${encodeURIComponent(fullRange)}?key=${this.apiKey}`;

        try {
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Cache the result
            this.cache.set(cacheKey, {
                data: data.values || [],
                timestamp: Date.now()
            });

            return data.values || [];
        } catch (error) {
            console.error('Error fetching sheet data:', error);
            return [];
        }
    }

    // Clear cache
    clearCache() {
        this.cache.clear();
    }

    // Parse sheet data into objects using first row as headers
    parseSheetData(data) {
        if (!data || data.length < 2) return [];

        const headers = data[0];
        const rows = data.slice(1);

        return rows.map(row => {
            const obj = {};
            headers.forEach((header, index) => {
                obj[header] = row[index] || '';
            });
            return obj;
        });
    }

    // Get revenue data for a specific year
    async getRevenueData(year) {
        const sheetName = year === 2568 ? sheetsConfig.sheets.revenue2568 : sheetsConfig.sheets.revenue2569;
        const data = await this.fetchSheet(sheetName);
        return this.parseSheetData(data);
    }

    // Get expense data
    async getExpenseData() {
        const data = await this.fetchSheet(sheetsConfig.sheets.expenses);
        return this.parseSheetData(data);
    }

    // Get vehicle trips data
    async getVehicleTripsData() {
        const data = await this.fetchSheet(sheetsConfig.sheets.vehicleTrips);
        return this.parseSheetData(data);
    }

    // Get pending entries
    async getPendingEntries() {
        const data = await this.fetchSheet(sheetsConfig.sheets.pending);
        return this.parseSheetData(data);
    }

    // Write data using Google Apps Script
    async submitEntry(entryData) {
        try {
            const response = await fetch(appsScriptConfig.webAppUrl, {
                method: 'POST',
                mode: 'no-cors', // Apps Script requires this
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'addEntry',
                    data: entryData
                })
            });

            return { success: true };
        } catch (error) {
            console.error('Error submitting entry:', error);
            return { success: false, error: error.message };
        }
    }

    // Approve entry using Google Apps Script
    async approveEntry(entryId, reviewerEmail) {
        try {
            const response = await fetch(appsScriptConfig.webAppUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'approveEntry',
                    entryId: entryId,
                    reviewerEmail: reviewerEmail
                })
            });

            return { success: true };
        } catch (error) {
            console.error('Error approving entry:', error);
            return { success: false, error: error.message };
        }
    }

    // Reject entry using Google Apps Script
    async rejectEntry(entryId, reviewerEmail, reason = '') {
        try {
            const response = await fetch(appsScriptConfig.webAppUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'rejectEntry',
                    entryId: entryId,
                    reviewerEmail: reviewerEmail,
                    reason: reason
                })
            });

            return { success: true };
        } catch (error) {
            console.error('Error rejecting entry:', error);
            return { success: false, error: error.message };
        }
    }
}

// Create global instance
const sheetsAPI = new SheetsAPI();

// ============================================
// SAMPLE DATA (Used when API is not configured)
// ============================================

const sampleData = {
    revenue2568: {
        months: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'],
        revenue: [21794675.58, 17617778.85, 20214446.75, 16299065.89, 16772172.02, 15200310.77, 15404744.61, 15799225.57, 14590.9511, 17499439.87, 17023575.00, 18998003.00],
        otherIncome: [671709.13, 877600.08, 577981.26, 466692.00, 628002.73, 547636.65, 638185.60, 495547.31, 616203.34, 686027.80, 558191.37, 812961.00],
        totalRevenue: [22466374.71, 18495378.93, 20792428.01, 16765758.79, 17400399.85, 15752047.42, 16032860.41, 16299773.38, 15213545.25, 18068007.76, 18081766.37, 19814164.00],
        cogs: [19217235.03, 15586645.00, 17888890.03, 14415645.04, 14842509.31, 13450027.23, 13685014.88, 13978900.00, 11917655.85, 15486229.97, 15507586.50, 16862923.00],
        grossProfit: [3179359.68, 2903733.93, 2903537.08, 2340063.75, 2557649.48, 2296920.19, 2347245.53, 2318823.82, 2295498.40, 2681831.79, 2574177.87, 2999241.00]
    },
    revenue2569: {
        months: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'],
        revenue: [21794675.58, 17617778.85, 20214446.75, 16299065.89, 16772172.02, 15200310.77, 15404744.61, 15799225.57, 14590.9511, 17499439.87, 17023575.00, 18998003.00],
        otherIncome: [671709.13, 877600.08, 577981.26, 466692.00, 628002.73, 547636.65, 638185.60, 495547.31, 616203.34, 686027.80, 558191.37, 812961.00],
        totalRevenue: [22466374.71, 18495378.93, 20792428.01, 16765758.79, 17400399.85, 15752047.42, 16032860.41, 16299773.38, 15213545.25, 18068007.76, 18081766.37, 19814164.00],
        cogs: [19217235.03, 15586645.00, 17888890.03, 14415645.04, 14842509.31, 13450027.23, 13685014.88, 13978900.00, 11917655.85, 15486229.97, 15507586.50, 16862923.00],
        grossProfit: [3179359.68, 2903733.93, 2903537.08, 2340063.75, 2557649.48, 2296920.19, 2347245.53, 2318823.82, 2295498.40, 2681831.79, 2574177.87, 2999241.00]
    },
    expenses: {
        categories: [
            { name: 'เครื่องเย็น เครื่องใช้ไฟฟ้า', total: 37917763.00, percentage: 18.85 },
            { name: 'เครื่องใช้ไฟฟ้า อีเล็ก', total: 44929458.00, percentage: 27.65 },
            { name: 'บุ๊คกิ้ง ซัมซุง ไปรษณีย์', total: 61893573.00, percentage: 38.12 },
            { name: 'ลึ้ง ฮุ่ยเกียง ซัมซุงแอ็ค', total: 10835565.00, percentage: 7.29 },
            { name: 'ลี้แป๊ะจั๊ว', total: 7725695.00, percentage: 5.06 },
            { name: 'พ่อ บุ๋นเงี๊ย PVC', total: 2902360.00, percentage: 1.79 },
            { name: 'น้าโจ้ ไต้โวดหลาง ไม้ชิ้น', total: 3522746.00, percentage: 2.17 },
            { name: 'บริษัท ราชพฤกษ์', total: 869796.00, percentage: 0.54 }
        ],
        total: 162338657.66
    },
    expensesByMonth: [
        { category: 'พนักงาน', values: [2741968.00, 315422.21, 194475.23, 261818.59, 100174.78, 112076.06, 28885.82] },
        { category: 'บริจาคและรอมาฎอน', values: [881159.00, 312114.62, 197892.36, 197357.79, 31528.22, 106080.85, 29579.42] },
        { category: 'ค่าโฆษณาและส่งเสริม', values: [707318.00, 394137.33, 199989.08, 176547.68, 64429.78, 163419.23, 68611.91] },
        { category: 'ค่าเสื่อมราคา', values: [792836.00, 177739.35, 203302.70, 124006.40, 45546.88, 89756.48, 29323.14] },
        { category: 'ภาษีและอากร', values: [743570.00, 218338.02, 201101.59, 220631.09, 47670.01, 68962.77, 129684.45] },
        { category: 'บริการทั่วไป', values: [822604.00, 168313.95, 196268.08, 174228.13, 111158.65, 170112.00, 102356.01] },
        { category: 'กำไรเบ็ดเสร็จอื่น', values: [807878.25, 265080.56, 198665.35, 218315.56, 38783.75, 71335.91, 43930.29] }
    ]
};

// Function to get sample data when API is not configured
function getSampleData() {
    return sampleData;
}

// Check if API is configured
function isAPIConfigured() {
    return sheetsConfig.apiKey !== 'YOUR_GOOGLE_SHEETS_API_KEY' &&
        sheetsConfig.spreadsheetId !== 'YOUR_SPREADSHEET_ID';
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SheetsAPI, sheetsAPI, sampleData, getSampleData, isAPIConfigured };
}
