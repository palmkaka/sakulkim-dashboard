// ============================================
// SAKULKIM DASHBOARD - CONFIGURATION
// Firebase & Google Sheets API Config
// ============================================

// Firebase Configuration
// TODO: Replace with your Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyC3YMUI75idr7Rtz1Oy-TUGDXoStblkigU",
  authDomain: "sakulkim-dashboard.firebaseapp.com",
  projectId: "sakulkim-dashboard",
  storageBucket: "sakulkim-dashboard.firebasestorage.app",
  messagingSenderId: "599960097010",
  appId: "1:599960097010:web:b608ee93bff90c6130806b"
};

// Google Sheets Configuration
const sheetsConfig = {
  // TODO: Replace with your Google Sheets API Key
  apiKey: "YOUR_GOOGLE_SHEETS_API_KEY",

  // TODO: Replace with your Google Sheet ID (from the URL)
  // Example: https://docs.google.com/spreadsheets/d/1oR4Plu0lCJ8hMcC5qiRHNDk8JEyvKRGpBiupbRrofOw/edit
  spreadsheetId: "1oR4Plu0lCJ8hMcC5qiRHNDk8JEyvKRGpBiupbRrofOw",

  // Sheet names
  sheets: {
    revenue2568: "รายได้2568",
    revenue2569: "รายได้2569",
    expenses: "ค่าใช้จ่าย",
    vehicleTrips: "เที่ยวรถ",
    pending: "รายการรออนุมัติ",
    users: "ผู้ใช้"
  }
};

// Google Apps Script Web App URL (for write operations)
// TODO: Replace with your deployed Apps Script URL
const appsScriptConfig = {
  webAppUrl: "YOUR_APPS_SCRIPT_WEB_APP_URL"
};

// User Roles
const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  VIEWER: 'viewer',
  CUSTOMER: 'customer'
};

// Role Permissions
const PERMISSIONS = {
  [ROLES.ADMIN]: {
    canViewDashboard: true,
    canViewDetails: true,
    canAddData: true,
    canApprove: true,
    canEdit: true,
    canDelete: true,
    canManageUsers: true,
    canExport: true
  },
  [ROLES.MANAGER]: {
    canViewDashboard: true,
    canViewDetails: true,
    canAddData: true,
    canApprove: true,
    canEdit: true,
    canDelete: false,
    canManageUsers: false,
    canExport: true
  },
  [ROLES.VIEWER]: {
    canViewDashboard: true,
    canViewDetails: true,
    canAddData: false,
    canApprove: false,
    canEdit: false,
    canDelete: false,
    canManageUsers: false,
    canExport: true
  },
  [ROLES.CUSTOMER]: {
    canViewDashboard: true,
    canViewDetails: true,
    canAddData: true,
    canApprove: true,
    canEdit: true,
    canDelete: true,
    canManageUsers: true,
    canExport: true
  }
};

// Entry Categories
const CATEGORIES = {
  revenue: [
    { id: 'sales', name: { th: 'ยอดขาย', en: 'Sales' } },
    { id: 'other_income', name: { th: 'รายได้อื่นๆ', en: 'Other Income' } }
  ],
  expense: [
    { id: 'cogs', name: { th: 'ต้นทุนสินค้า (COGS)', en: 'Cost of Goods Sold' } },
    { id: 'logistics', name: { th: 'ขนส่ง (Logistics)', en: 'Logistics' } },
    { id: 'marketing', name: { th: 'การตลาด (Marketing)', en: 'Marketing' } },
    { id: 'payroll', name: { th: 'เงินเดือนพนักงาน (Payroll)', en: 'Payroll' } },
    { id: 'commission', name: { th: 'ค่าคอมมิชชั่น (Commission)', en: 'Commission' } },
    { id: 'operation', name: { th: 'ดำเนินงานทั่วไป (Operation)', en: 'Operation' } },
    { id: 'utility', name: { th: 'สาธารณูปโภค (Utility)', en: 'Utility' } },
    { id: 'tax', name: { th: 'ภาษี (Tax)', en: 'Tax' } },
    { id: 'other', name: { th: 'อื่นๆ', en: 'Other' } }
  ]
};

// Sales Channels (4 Core Channels)
const SALES_CHANNELS = [
  { id: 'retail', name: { th: 'หน้าร้าน', en: 'Retail' }, icon: '🏪' },
  { id: 'wholesale', name: { th: 'ขายส่ง', en: 'Wholesale' }, icon: '🏭' },
  { id: 'online', name: { th: 'ออนไลน์', en: 'Online' }, icon: '🌐' },
  { id: 'project', name: { th: 'โครงการ', en: 'Project' }, icon: '🏗️' }
];

// HR Departments
const DEPARTMENTS = [
  { id: 'admin', name: { th: 'บริหาร/ธุรการ', en: 'Admin' } },
  { id: 'sales', name: { th: 'ฝ่ายขาย', en: 'Sales' } },
  { id: 'marketing', name: { th: 'การตลาด', en: 'Marketing' } },
  { id: 'wh_logistics', name: { th: 'คลังสินค้า/จัดส่ง', en: 'Warehouse & Logistics' } }
];


// Sales Target (Monthly)
const SALES_TARGET = 1000000; // 1 Million Baht

// Default Language
const DEFAULT_LANG = 'th';

// Date Format Options
const DATE_FORMAT = {
  short: { day: '2-digit', month: '2-digit', year: 'numeric' },
  long: { day: 'numeric', month: 'long', year: 'numeric' },
  withTime: { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }
};

// Number Format Options
const NUMBER_FORMAT = {
  currency: { style: 'currency', currency: 'THB', minimumFractionDigits: 2 },
  decimal: { minimumFractionDigits: 2, maximumFractionDigits: 2 },
  percent: { style: 'percent', minimumFractionDigits: 1 }
};

// Chart Colors
const CHART_COLORS = {
  primary: '#10b981',
  secondary: '#3b82f6',
  accent: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  pink: '#ec4899',
  cyan: '#06b6d4',
  gray: '#64748b'
};

// Export config for other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    firebaseConfig,
    sheetsConfig,
    appsScriptConfig,
    ROLES,
    PERMISSIONS,
    CATEGORIES,
    SALES_CHANNELS,
    DEPARTMENTS,
    SALES_TARGET,
    DEFAULT_LANG,
    DATE_FORMAT,
    NUMBER_FORMAT,
    CHART_COLORS
  };
}
