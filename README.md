# MindX Technology School - Thuận An Campus Operations Management System

> **High-performance, spreadsheet-inspired operations management platform designed specifically for MindX Thuận An Campus academic coordinators, teachers, and Customer Support (CS) officers.**

[![Live Web Application](https://img.shields.io/badge/Live%20Demo-mindx--thuanan--ops.vercel.app-red?style=for-the-badge&logo=vercel)](https://mindx-thuanan-ops.vercel.app)
[![Tech Stack](https://img.shields.io/badge/Stack-HTML5%20%7C%20CSS3%20%7C%20ES6%2B%20%7C%20SheetJS-blue?style=for-the-badge)](#technical-architecture)
[![License](https://img.shields.io/badge/License-MindX%20Internal%20Proprietary-darkred?style=for-the-badge)](#license)

---

## 📌 Executive Overview

**MindX Thuận An Ops** is an enterprise-grade operational management web application tailored for **MindX Technology School - Thuận An Campus**. It combines the fluid, rapid data-entry convenience of spreadsheet applications (Google Sheets & Microsoft Excel) with the robustness of a relational database system: enforcing relational consistency across classes and students, performing real-time metric computations, automating absence-to-makeup workflows, preventing accidental data loss through multi-tiered persistence, and exporting cleanly formatted multi-sheet Excel workbooks in a single click.

The interface adheres strictly to **MindX Technology School** brand guidelines, featuring signature Crimson Red (`#d91b24`), deep slate typography, crisp sheet borders, and high-contrast color-coded indicators for optimal administrative efficiency.

---

## 🌟 Core Functional Modules

The platform is organized into **6 integrated operational worksheets**:

```
├── 1. Students Management (Quản lý học viên)
├── 2. Classes Management (Danh sách lớp)
├── 3. 14-Session Attendance Grid (Điểm danh 14 buổi)
├── 4. Make-up Classes & Study Materials (Học bù & Gửi tài liệu)
├── 5. Waiting Queue (Chờ lớp New / Level Up)
└── 6. Student Reservations (Bảo lưu học viên)
```

---

### 1. Tab 1: Students Management (`Students Sheet`)

Provides a comprehensive master roster of all students enrolled across Thuận An campus.

* **Live Operational Metrics**:
  $$\text{Total Students} \mid \text{Active} \mid \text{Expiring Soon (Sắp hết phí)} \mid \text{Handling (Tuyển sinh/Xử lý)} \mid \text{Reserved} \mid \text{Branch Transfer} \mid \text{Student Transfer} \mid \text{Dropped Out}$$
* **Data Schema**:
  - `STT`: Row index with sticky pin.
  - `Full Name`: Student name with inline quick-edit capability.
  - `Phone Number`: Direct contact phone.
  - `Parent Name` & `Email`: Family contact details.
  - `Course Track`: Enrolled program (e.g., *Code For Kids, Fullstack Web, Robotics Discovery*).
  - `Current Module`: Specific active module code (e.g., *GA01, GB02, SB01, Python 01*).
  - `Track Category`: Badge-coded category (`Coding` / `Robotics`).
  - `Class Code`: Dynamic foreign-key binding populated directly from the Classes worksheet.
  - `Study Format`: `Offline`, `Hybrid`, or `Online`.
  - `Student Status`: Interactive select dropdown (`Active`, `Sắp hết phí`, `Handle`, `Bảo lưu`, `Chuyển cơ sở`, `Chuyển nhượng`, `Nghỉ ngang`).
* **Key Features**: Instant status switching with real-time recalculation of metric cards, multi-condition filtering, and search by student name, phone, parent name, or class code.

---

### 2. Tab 2: Classes Management (`Classes Sheet`)

Serves as the academic core regulating class schedules, milestones, teacher assignments, and capacity quotas.

* **Live Operational Metrics**:
  $$\text{Total Classes} \mid \text{Running} \mid \text{Waiting (Chờ lớp)} \mid \text{Finished} \mid \text{Sufficient Capacity (≥ 6)} \mid \text{Low Capacity (< 6)}$$
* **Data Schema**:
  - `Track Category`: Distinct visual badges (`Coding` / `Robotics`).
  - `Class Code`: Unique identifier (e.g., `TA-C4K-GB02-HB`).
  - `Study Format`: `Offline`, `Hybrid`, or `Online`.
  - `Schedule`: Weekly slot and time (e.g., *Sat 17:30 - 19:30*).
  - `Start Date`: Formatted cleanly in Vietnamese localized date order (`DD/MM/YYYY`).
  - `Checkpoint 1 (CP1)`: Formatted localized date (`DD/MM/YYYY`).
  - `Checkpoint 2 (CP2)`: Formatted localized date (`DD/MM/YYYY`).
  - `Demo Day`: Graduation presentation date (`DD/MM/YYYY`).
  - `Class Capacity`: Dynamically calculated in real time against active enrolled students:
    - 🟢 `Đủ sĩ số (X/Target)`: Sufficient capacity reached.
    - 🔴 `Thiếu sĩ số (X/Target)`: Needs CS enrollment boost.
  - `Personnel Assignment`: Lead Teacher, Teaching Assistant (TA), and CS Officer in charge.
  - `Class Status`: Color-coded dropdown selector:
    - 🟢 **Running**: Soft green background (`#dcfce7`) with deep green bold text (`#15803d`).
    - 🔴 **Finished**: Soft red background (`#fee2e2`) with crimson text (`#b91c1c`).
    - ⚪ **Chờ lớp (Waiting)**: Clean neutral white with a subtle border.
* **Direct Shortcuts**: One-click jump to quick attendance for any selected class.

---

### 3. Tab 3: 14-Session Attendance Grid (`Attendance Sheet`)

A grid modeled after physical sheet attendance logs covering the standard 14 sessions of a MindX curriculum.

* **Dynamic Class Filter**: Instantly isolate and inspect the student roster of any active class.
* **Milestone Highlighting**:
  - **Coding Track**: Checkpoint 1 at Session 5, Checkpoint 2 at Session 9, Demo Day at Session 14.
  - **Robotics Track**: Checkpoint 1 at Session 4, Checkpoint 2 at Session 8, Demo Day at Session 14.
* **Color-Coded Status Cycles**:
  - 🟢 **P (Present)**: Present and on time.
  - 🟡 **L (Late)**: Arrived late.
  - 🔴 **A (Absent Unexcused)**: Absent without prior notice.
  - 🔵 **E (Absent Excused)**: Absent with approved notice.
* **Autonomous Pipeline Hook**: Selecting an absence (**A** or **E**) immediately routes and synchronizes an unfulfilled make-up record to the Make-up Classes worksheet.

---

### 4. Tab 4: Make-up Classes & Study Materials (`Make-up Sheet`)

Dedicated Customer Support (CS) pipeline to guarantee student progression and retention after missed classes.

* **Automated Absence Registration**:
  - Automatically captures student name, class code, session index, and absence justification.
  - **Absence 1**: Date of missed session, `Study Materials Sent` checkbox, scheduled make-up slot, and resolution status (`Chưa bù`, `Đã bù`, `Hủy bù`).
  - **Absence 2**: Second round tracking for recurring absences.
  - **CS / Teacher Notes**: Freeform communication log between teacher and customer support.

---

### 5. Tab 5: Waiting Queue (`Waiting Sheet`)

Pipeline tracking prospective and advancing students waiting for suitable class schedules to open.

* **Live Status Breakdown**:
  $$\text{Total Waiting} \mid \text{Waiting 1 - 2 Weeks} \mid \text{Waiting 3 - 4 Weeks} \mid \text{Waiting > 1 Month (High Risk)} \mid \text{Successfully Placed}$$
* **Data Schema**:
  - `STT`, `Waiting Type` (`Chờ lớp New` vs `Chờ lớp Level Up`).
  - `Student Full Name`, `Phone`, `Parent Name`, `Email`.
  - `Course Track` & `Subject` (`pre, arm, semi, SB, SA, SI, GB, GA, GI, PTB, PTA, PTI, ...`).
  - `Expected Start Date` & `Expected Demo/End Date` (Formatted as `DD/MM/YYYY`).
  - `Waiting Status`: `Đang đợi lớp`, `Đã vào lớp`, `Đã xếp lớp`, `Ngừng học`.
  - `Duration Classification`: `Học viên đã Chờ 1 - 2 tuần`, `Học viên đã Chờ 3 - 4 tuần`, `Học viên đã Chờ hơn 1 tháng`.
  - `Notes`: Operational remarks and parent preferences.

---

### 6. Tab 6: Student Reservations (`Reserve Sheet`)

Monitors students with paused tuition contracts to minimize dropout rates and handle reactivation deadlines.

* **Live Status Breakdown**:
  $$\text{Total Reserved} \mid \text{Active Within Term} \mid \text{Expiring Soon (≤ 15 Days)} \mid \text{Overdue (Quá hạn)} \mid \text{Rejoined (Đã đi học lại)}$$
* **Data Schema**:
  - `STT`, `Student Full Name`, `Class Code`, `Phone`, `Parent Name`, `Email`, `Course Track`.
  - `Reservation Type`: `Bảo lưu thường` (Standard) vs `Bảo lưu vượt hạn` (Extended).
  - `Reservation Status`: `Đang bảo lưu`, `Nghỉ ngang`, `Đã đi học lại`.
  - `Start Date` & `End Date` (Formatted as `DD/MM/YYYY`).
  - `Urgency Status (Tình trạng thời hạn)`: Automatically calculated from current date vs expiration date:
    - 🟢 **Còn hạn**: Active within permitted period.
    - 🟡 **Sắp tới hạn**: Expiration within 15 calendar days — CS proactive follow-up required.
    - 🔴 **Quá hạn**: Overdue reservation — parent outreach required.
  - `Notes`: Internal follow-up logs.

---

## 🛡️ Enterprise Data Reliability & Zero-Loss System

To eliminate operational risk during long shifts, the application incorporates a multi-tiered data protection suite:

1. **Keystroke-by-Keystroke Draft Autosave**:
   - As CS officers or academic staff type into modal input fields (Class creation, Student enrollment), every keystroke is saved to a persistent draft cache (`mx_ta_draft_*`).
   - If the user accidentally closes the browser tab or presses Escape, reopening the modal **automatically restores the draft** in full.
2. **Accidental Tab Closure Guard (`beforeunload`)**:
   - If any modal is open with unsaved changes or active drafts, the browser triggers a native modal alert warning the user before allowing the tab to terminate.
3. **Redundant Dual-Key Local Storage**:
   - All state modifications are simultaneously written to primary keys (`mx_ta_*`) and secondary backup mirrors (`mx_ta_*_backup`).
   - If a browser session or cache clears primary keys, the loader transparently falls back to the mirror image.
4. **Permanent Session Persistence**:
   - Staff credentials and authentication sessions are preserved across browser restarts.
5. **Real-time Autosave Indicator**:
   - The top header provides an active status badge: `🟢 Tự động lưu an toàn` with the timestamp of the latest persistent commit.

---

## 📊 Data Portability & Excel Integration

The platform provides end-to-end support for Microsoft Excel (`.xlsx`) via [SheetJS](https://sheetjs.com/):

* **One-Click Multi-Sheet Workbook Export**:
  Generates a unified Excel file named `MindX_ThuanAn_Ops_YYYY-MM-DD.xlsx` containing 5 dedicated worksheets:
  1. `Danh sách học viên` (Students Roster)
  2. `Danh sách lớp học` (Classes Catalog with capacity status and personnel)
  3. `Quản lý học bù` (Make-up Classes & Study Materials log)
  4. `Chờ lớp` (Waiting list with duration tiers)
  5. `Bảo lưu` (Reservations with urgency indicators)
* **Date Localization in Exports**:
  All date fields are formatted in standard Vietnamese chronological order (`DD/MM/YYYY`) both in the UI and in exported Excel workbooks.
* **JSON / Excel Import Support**:
  Enables full state restoration from previously exported files.

---

## 🔐 Authentication & Roles

* **Role: Customer Support (CS)**
  - Access: Daily operations, class creation, student onboarding, attendance, make-up scheduling, waiting queue, reservations.
* **Role: Administrator (Admin)**
  - Access: Full master control with elevated administrative tags.

---

## 💻 Technical Architecture

* **Frontend Engine**: Pure Vanilla ES6+ Object-Oriented Architecture (`App`, `Store`, `AuthManager`).
* **Styling Framework**: Custom responsive CSS3 design system with CSS custom properties (variables), native CSS Grid, Flexbox, and sticky headers/columns.
* **Icons**: [Lucide Icons](https://lucide.dev/) (lightweight SVG vector icons).
* **Excel Engine**: [SheetJS (xlsx.full.min.js)](https://github.com/SheetJS/sheetjs).
* **Hosting**: Static edge hosting on [Vercel](https://vercel.com) (`vercel.json` pre-configured).

---

## 🚀 Local Development & Deployment

### Run Locally
Since this application relies strictly on standardized modern Web APIs, no heavy Node.js toolchain or package compilation is required:

```bash
# Using Python 3 built-in HTTP server
python -m http.server 3000

# Or using Node.js npx serve
npx serve .
```

Open `http://localhost:3000` in your web browser.

### Deploy to Vercel

```bash
# Push updates to GitHub
git add .
git commit -m "feat: complete operations suite"
git push origin main
```

Vercel automatically detects commits to the `main` branch and triggers instantaneous global edge deployment.

---

## 📄 License & Proprietary Notice

This software is an internal proprietary operations suite developed exclusively for **MindX Technology School - Thuận An Campus**.  
*All rights reserved. Copyright © MindX Technology School.*
