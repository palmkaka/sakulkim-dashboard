// ============================================
// SAKULKIM DASHBOARD - CSV IMPORT
// Parse CSV and save to Firestore
// ============================================

// ===== GLOBAL VARIABLES =====
let selectedDataType = 'revenue';
let parsedData = [];
let currentFile = null;

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
    });

    // Setup event listeners
    setupEventListeners();

    // Load theme
    loadTheme();
});

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Data type buttons
    const dataTypeBtns = document.querySelectorAll('.data-type-btn');
    dataTypeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            dataTypeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedDataType = btn.dataset.type;
        });
    });

    // Upload zone
    const uploadZone = document.getElementById('uploadZone');
    const csvInput = document.getElementById('csvInput');

    uploadZone.addEventListener('click', () => csvInput.click());

    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragover');
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.name.endsWith('.csv')) {
            handleFile(file);
        } else {
            alert('กรุณาเลือกไฟล์ CSV เท่านั้น');
        }
    });

    csvInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFile(file);
        }
    });

    // Remove file button
    document.getElementById('removeFile').addEventListener('click', clearFile);

    // Clear button
    document.getElementById('clearBtn').addEventListener('click', clearFile);

    // Import button
    document.getElementById('importBtn').addEventListener('click', importData);

    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const html = document.documentElement;
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }
}

// ===== HANDLE FILE =====
function handleFile(file) {
    currentFile = file;

    // Show file info
    document.getElementById('fileInfo').style.display = 'flex';
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileSize').textContent = formatFileSize(file.size);
    document.getElementById('uploadZone').style.display = 'none';

    // Parse CSV
    const reader = new FileReader();
    reader.onload = (e) => {
        const text = e.target.result;
        parsedData = parseCSV(text);
        showPreview(parsedData);
        document.getElementById('importBtn').disabled = false;
    };
    reader.readAsText(file, 'UTF-8');
}

// ===== PARSE CSV =====
function parseCSV(text) {
    const lines = text.split('\n');
    const result = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Parse CSV line handling quoted values
        const values = [];
        let current = '';
        let inQuotes = false;

        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current.trim());

        result.push(values);
    }

    return result;
}

// ===== SHOW PREVIEW =====
function showPreview(data) {
    const container = document.getElementById('previewContainer');
    const table = document.getElementById('previewTable');

    if (data.length === 0) {
        table.innerHTML = '<p>ไม่พบข้อมูลในไฟล์</p>';
        return;
    }

    // Show first 10 rows
    const previewData = data.slice(0, 10);

    let html = '<table class="table"><thead><tr>';
    // Header row
    if (previewData[0]) {
        previewData[0].forEach((cell, i) => {
            html += `<th>คอลัมน์ ${i + 1}</th>`;
        });
    }
    html += '</tr></thead><tbody>';

    // Data rows
    previewData.forEach(row => {
        html += '<tr>';
        row.forEach(cell => {
            html += `<td>${cell || '-'}</td>`;
        });
        html += '</tr>';
    });

    html += '</tbody></table>';
    table.innerHTML = html;
    container.classList.add('active');
}

// ===== IMPORT DATA =====
async function importData() {
    if (!parsedData.length) {
        alert('ไม่มีข้อมูลให้นำเข้า');
        return;
    }

    const year = parseInt(document.getElementById('importYear').value);
    const importBtn = document.getElementById('importBtn');
    const progressDiv = document.getElementById('importProgress');
    const progressFill = document.getElementById('progressFill');
    const resultDiv = document.getElementById('importResult');

    importBtn.disabled = true;
    progressDiv.classList.add('active');
    resultDiv.style.display = 'none';

    try {
        const db = firebase.firestore();
        let imported = 0;
        let errors = 0;

        // Process based on data type
        if (selectedDataType === 'revenue') {
            const result = await importRevenueData(db, year, parsedData, (progress) => {
                progressFill.style.width = `${progress}%`;
            });
            imported = result.imported;
            errors = result.errors;
        } else if (selectedDataType === 'expense') {
            const result = await importExpenseData(db, year, parsedData, (progress) => {
                progressFill.style.width = `${progress}%`;
            });
            imported = result.imported;
            errors = result.errors;
        } else if (selectedDataType === 'sales') {
            const result = await importSalesData(db, year, parsedData, (progress) => {
                progressFill.style.width = `${progress}%`;
            });
            imported = result.imported;
            errors = result.errors;
        }

        progressFill.style.width = '100%';

        // Show result
        resultDiv.style.display = 'block';
        if (errors === 0) {
            resultDiv.className = 'import-result success';
            resultDiv.innerHTML = `✅ นำเข้าข้อมูลสำเร็จ ${imported} รายการ`;
        } else {
            resultDiv.className = 'import-result error';
            resultDiv.innerHTML = `⚠️ นำเข้า ${imported} รายการ, ผิดพลาด ${errors} รายการ`;
        }

    } catch (error) {
        console.error('Import error:', error);
        resultDiv.style.display = 'block';
        resultDiv.className = 'import-result error';
        resultDiv.innerHTML = `❌ เกิดข้อผิดพลาด: ${error.message}`;
    }

    progressDiv.classList.remove('active');
    importBtn.disabled = false;
}

// ===== IMPORT REVENUE DATA =====
async function importRevenueData(db, year, data, onProgress) {
    let imported = 0;
    let errors = 0;

    // Find revenue data rows
    const revenueCategories = [
        'รายได้จากการขายสินค้า',
        'รายได้เป้า ส่วนลด อื่นๆ',
        'รวม รายได้ทั้งสิ้น',
        'ต้นทุนสินค้าเพื่อขาย',
        'กำไร(ขาดทุน) ขั้นต้น'
    ];

    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length < 2) continue;

        // Check if this row contains revenue category
        const category = revenueCategories.find(cat =>
            row.some(cell => cell && cell.includes(cat))
        );

        if (category) {
            try {
                // Parse monthly values (columns after category name)
                const monthlyData = [];
                let startCol = row.findIndex(cell => cell && cell.includes(category)) + 1;

                for (let m = 0; m < 12; m++) {
                    const val = row[startCol + m];
                    const numVal = parseNumber(val);
                    monthlyData.push(numVal);
                }

                // Calculate total
                const total = monthlyData.reduce((sum, v) => sum + v, 0);

                // Save to Firestore
                await db.collection('statistics').add({
                    year: year,
                    type: 'revenue',
                    category: category,
                    monthlyData: monthlyData,
                    total: total,
                    importedAt: new Date().toISOString()
                });

                imported++;
            } catch (e) {
                console.error('Error importing row:', e);
                errors++;
            }
        }

        onProgress((i / data.length) * 100);
    }

    return { imported, errors };
}

// ===== IMPORT EXPENSE DATA =====
async function importExpenseData(db, year, data, onProgress) {
    let imported = 0;
    let errors = 0;

    const expenseCategories = [
        '1. พนักงาน',
        '2. น้ำมัน/คชจ.ขาย',
        '3. สำนักงาน/อาคาร',
        '4. ค่าเสื่อมราคา',
        '5. การตลาด',
        '6. บริหารทั่วไป',
        '7. ภาษี/ประกัน/อื่นๆ'
    ];

    // Find expense section (look for row with expense categories header)
    let expenseStartRow = -1;
    for (let i = 0; i < data.length; i++) {
        if (data[i].some(cell => cell && cell.includes('พนักงาน'))) {
            expenseStartRow = i;
            break;
        }
    }

    if (expenseStartRow === -1) {
        return { imported: 0, errors: 1 };
    }

    // Process expense rows (by month)
    const months = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];

    for (let i = expenseStartRow; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length < 2) continue;

        // Check if this is a month row
        const monthIndex = months.findIndex(m => row.some(cell => cell && cell.includes(m)));
        if (monthIndex === -1) continue;

        try {
            // Parse expense values for each category
            const expenseData = {};
            for (let c = 0; c < expenseCategories.length; c++) {
                expenseData[expenseCategories[c]] = parseNumber(row[c + 2]); // Adjust column index
            }

            await db.collection('statistics').add({
                year: year,
                type: 'expense',
                month: monthIndex + 1,
                monthName: months[monthIndex],
                categories: expenseData,
                total: Object.values(expenseData).reduce((sum, v) => sum + v, 0),
                importedAt: new Date().toISOString()
            });

            imported++;
        } catch (e) {
            console.error('Error importing expense row:', e);
            errors++;
        }

        onProgress((i / data.length) * 100);
    }

    return { imported, errors };
}

// ===== IMPORT SALES DATA =====
async function importSalesData(db, year, data, onProgress) {
    let imported = 0;
    let errors = 0;

    // Find sales by category section
    const salesCategories = [
        'ปูนทุกชนิด ซีเมนต์ ยิปซั่ม',
        'เหล็กเส้น เหล็กแผ่น',
        'เหล็กรูปพรรณ เหล็กดำ',
        'อิฐ อิฐบล็อก อิฐมวลเบา',
        'สี เคมีภัณฑ์',
        'ไม้ฝา ไม้เชิงชาย ไม้อัด',
        'ท่อ อุปกรณ์ PVC',
        'ประตู +วงกบ'
    ];

    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length < 2) continue;

        // Check if this row contains sales category
        const category = salesCategories.find(cat =>
            row.some(cell => cell && cell.includes(cat))
        );

        if (category) {
            try {
                // Find start column
                const startCol = row.findIndex(cell => cell && cell.includes(category)) + 1;

                // Parse monthly values
                const monthlyData = [];
                for (let m = 0; m < 12; m++) {
                    const val = row[startCol + m];
                    monthlyData.push(parseNumber(val));
                }

                const total = monthlyData.reduce((sum, v) => sum + v, 0);

                await db.collection('statistics').add({
                    year: year,
                    type: 'sales',
                    category: category,
                    monthlyData: monthlyData,
                    total: total,
                    importedAt: new Date().toISOString()
                });

                imported++;
            } catch (e) {
                console.error('Error importing sales row:', e);
                errors++;
            }
        }

        onProgress((i / data.length) * 100);
    }

    return { imported, errors };
}

// ===== UTILITY FUNCTIONS =====
function parseNumber(str) {
    if (!str) return 0;
    // Remove commas and parse
    const cleaned = str.replace(/,/g, '').replace(/[^\d.-]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function clearFile() {
    currentFile = null;
    parsedData = [];

    document.getElementById('uploadZone').style.display = 'block';
    document.getElementById('fileInfo').style.display = 'none';
    document.getElementById('previewContainer').classList.remove('active');
    document.getElementById('csvInput').value = '';
    document.getElementById('importBtn').disabled = true;
    document.getElementById('importResult').style.display = 'none';
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}
