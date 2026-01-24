# 📊 Sakulkim Dashboard

ระบบแดชบอร์ดสำหรับจัดการข้อมูลทางการเงินของบริษัทสกุลกิม

🌐 **Live Demo**: [sakulkim-dashboard.vercel.app](https://sakulkim-dashboard.vercel.app)

---

## ✨ ฟีเจอร์หลัก

| ฟีเจอร์ | คำอธิบาย |
|---------|----------|
| 📈 **Dashboard** | แสดงภาพรวมรายได้ ต้นทุน กำไร เปรียบเทียบรายปี |
| 💰 **ค่าใช้จ่าย** | บันทึกและจัดการค่าใช้จ่ายแยกหมวดหมู่ |
| 🚗 **เที่ยวรถ** | บันทึกข้อมูลการขนส่งและรายได้ |
| 📝 **เพิ่มข้อมูล** | กรอกข้อมูลรายรับ-รายจ่ายรายวัน |
| 📥 **นำเข้าข้อมูล** | Import ข้อมูลจากไฟล์ CSV |
| ✅ **อนุมัติ** | ระบบอนุมัติข้อมูลก่อนแสดงผล |
| 👥 **จัดการผู้ใช้** | กำหนดสิทธิ์ Admin/Manager/Staff |

---

## 🔄 Flowchart การทำงาน

```mermaid
flowchart TB
    subgraph INPUT["📥 นำเข้าข้อมูล"]
        A1[กรอกข้อมูลรายวัน]
        A2[Import CSV]
        A3[บันทึกเที่ยวรถ]
        A4[บันทึกค่าใช้จ่าย]
    end

    subgraph PROCESS["⚙️ ประมวลผล"]
        B1[(Firebase Firestore)]
        B2{ต้องอนุมัติ?}
        B3[รออนุมัติ]
        B4[อนุมัติแล้ว]
    end

    subgraph OUTPUT["📊 แสดงผล"]
        C1[Dashboard ภาพรวม]
        C2[กราฟแนวโน้ม]
        C3[เปรียบเทียบรายปี]
    end

    A1 & A2 & A3 & A4 --> B1
    B1 --> B2
    B2 -->|ใช่| B3
    B2 -->|ไม่| B4
    B3 -->|Admin อนุมัติ| B4
    B4 --> C1 & C2 & C3
```

---

## 🛠️ เทคโนโลยีที่ใช้

- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Backend**: Firebase (Firestore, Authentication)
- **Hosting**: Vercel
- **Charts**: Chart.js

---

## 📱 หน้าจอในระบบ

| หน้า | ไฟล์ | คำอธิบาย |
|------|------|----------|
| Login | `index.html` | เข้าสู่ระบบ |
| Dashboard | `dashboard.html` | ภาพรวมข้อมูล |
| ค่าใช้จ่าย | `expenses.html` | จัดการค่าใช้จ่าย |
| เที่ยวรถ | `vehicle-trips.html` | บันทึกเที่ยวรถ |
| เพิ่มข้อมูล | `data-entry.html` | กรอกข้อมูลรายวัน |
| นำเข้า CSV | `import-data.html` | Import ข้อมูล |
| อนุมัติ | `approvals.html` | อนุมัติรายการ |
| จัดการผู้ใช้ | `users.html` | เพิ่ม/แก้ไขผู้ใช้ |

---

## 🔐 สิทธิ์ผู้ใช้งาน

| หน้า | Admin | Manager | Staff |
|------|:-----:|:-------:|:-----:|
| Dashboard | ✅ | ✅ | ❌ |
| ค่าใช้จ่าย | ✅ | ✅ | ❌ |
| เที่ยวรถ | ✅ | ✅ | ✅ |
| เพิ่มข้อมูล | ✅ | ✅ | ✅ |
| นำเข้า CSV | ✅ | ❌ | ❌ |
| อนุมัติ | ✅ | ✅ | ❌ |
| จัดการผู้ใช้ | ✅ | ❌ | ❌ |

---

## 🚀 วิธีใช้งาน

### 1. เข้าสู่ระบบ
```
URL: https://sakulkim-dashboard.vercel.app
```

### 2. ดู Dashboard
- เลือก **ประเภทข้อมูล** (ทั้งหมด/รายได้/ต้นทุน/กำไร)
- เลือก **ปี** (2568/2569)
- ดู **VS Cards** เปรียบเทียบ 2 ปี

### 3. นำเข้าข้อมูล CSV
- ไปหน้า **นำเข้าข้อมูล**
- เลือกไฟล์ CSV → Preview → นำเข้า




## 📁 โครงสร้างโปรเจค

```
dashboard-kim/
├── css/
│   ├── variables.css    # ตัวแปร CSS
│   ├── base.css         # สไตล์พื้นฐาน
│   ├── components.css   # Components
│   ├── layout.css       # Layout
│   └── responsive.css   # Mobile responsive
├── js/
│   ├── config.js        # Firebase config
│   ├── auth.js          # Authentication
│   ├── app.js           # Main app logic
│   └── charts.js        # Chart functions
├── locales/
│   ├── th.json          # ภาษาไทย
│   └── en.json          # English
└── *.html               # หน้าเว็บต่างๆ
```

---

## 👨‍💻 พัฒนาโดย

ระบบนี้พัฒนาด้วย นาย ภูวรัตถ์นันต์ วงศ์ภูงา

---

*อัพเดทล่าสุด: 24 มกราคม 2569*
