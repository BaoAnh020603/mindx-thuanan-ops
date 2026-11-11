# MindX Technology School - Thuận An Campus Operations Management System

> **Enterprise-grade, spreadsheet-inspired operations management platform designed specifically and exclusively for internal use by Academic Coordinators, Teachers, and Customer Support (CS) Officers at MindX Technology School - Thuận An Campus.**

---

## 📌 Executive Overview

**MindX Thuận An Ops** is a specialized, proprietary internal management web application tailored exclusively for **MindX Technology School - Thuận An Campus**. 

It uniquely marries the fluid, rapid data-entry experience of spreadsheet applications (Google Sheets & Microsoft Excel) with the rigorous integrity of a relational database system:
- Strict relational binding across classes, student records, and attendance logs.
- Real-time automated calculation of administrative metrics across all operational areas.
- Automated absence-to-makeup workflow: Marking an absence (**🔴 A - Unexcused** or **🔵 E - Excused**) immediately updates and synchronizes the student's make-up schedule.
- Seamless status synchronization: Updating a student's status to **Chờ lớp New** or **Chờ lớp Level Up** automatically transfers their profile to the Waiting Queue worksheet.
- Mid-course entry protection: Students joining midway (e.g. from Session 3) automatically have previous sessions locked with "Chưa vào", preventing false absence triggers.
- Multi-tiered, zero-loss data persistence engine (Keystroke draft autosave, dual-key LocalStorage redundancy, and accidental exit guards).
- Single-click export of an all-inclusive, cleanly formatted 5-worksheet Microsoft Excel (`.xlsx`) workbook with localized Vietnamese date formats (`DD/MM/YYYY`).
- Design language built strictly to MindX brand guidelines: signature Crimson Red (`#d91b24`), high-contrast dark slate accents, clean borders, and intuitive color-coded tags.

---

## 🌟 Core Functional Worksheets

```
├── 1. Students Management (Quản lý học viên)
├── 2. Classes Management (Danh sách lớp học)
├── 3. 14-Session Attendance Grid (Điểm danh 14 buổi)
├── 4. Make-up Classes & Study Materials (Học bù & Gửi tài liệu)
├── 5. Waiting Queue: New & Level Up (Chờ lớp New / Level Up)
└── 6. Student Reservations (Bảo lưu học viên)
```

---

### 1. Tab 1: Students Management (`Quản lý học viên`)

Provides a comprehensive master roster of all students enrolled across Thuận An Campus.

* **Standardized 10-Metric KPI Bar**:
  1. **Handle**: Total overall student count managed across the campus.
  2. **Active**: Total actively attending students.
  3. **Sắp hết phí**: Students nearing the end of their paid tuition sessions (proactive CS renewal required).
  4. **Hết phí**: Students who have exhausted their registered sessions.
  5. **Nghỉ ngang**: Students who dropped out before finishing their full learning roadmap.
  6. **Chờ lớp New**: New students enrolled and waiting for a suitable class opening.
  7. **Chờ lớp Level Up**: Current students waiting to advance to their next course module.
  8. **Bảo lưu**: Students on authorized leave of absence.
  9. **Chuyển cơ sở**: Students transferring to another MindX campus.
  10. **Chuyển nhượng**: Students transferring their tuition package to another learner.

* **Key Capabilities & Data Fields**:
  - `STT`: Fixed sticky column index.
  - `Full Name`: Click-to-edit directly in the grid.
  - `Phone Number`, `Parent Name`, `Email Address`.
  - `Course Track` & `Module`: e.g., *Code For Kids, Fullstack Web, Robotics, GA01, SB02, Python 01*.
  - `Track Category`: Badge-coded (`Coding` / `Robotics`).
  - `Assigned Classes`: Multi-selection support (one student can be enrolled in multiple classes).
  - `Starting Session (Bắt đầu học từ buổi mấy)`: Configurable entry session (1 - 14) for mid-course admissions.
  - `Study Format`: `Offline`, `Hybrid`, `Online`.
  - `Student Status`: Distinctive color-coded badges. Selecting **Chờ lớp New** or **Chờ lớp Level Up** automatically syncs their details into Tab 5.

---

### 2. Tab 2: Classes Management (`Danh sách lớp học`)

The academic heartbeat managing class schedules, progress milestones, staff allocations, and capacity.

* **Live Status Breakdown**:
  - Total Classes.
  - Running Classes (Active teaching).
  - Waiting Classes (Recruiting / pairing).
  - Finished Classes (Completed syllabus).
  - Target Capacity Achieved (≥ target capacity).
  - Low Capacity (< target capacity, enrollment push required).

* **Data Fields**:
  - `Track Category`: Visual tags for `Coding` and `Robotics`.
  - `Class Code`: Unique campus code (e.g., `TA-C4K-GA02-HB`, `TA-ROB-PREA01`).
  - `Study Format`: `Offline`, `Hybrid`, `Online`.
  - `Schedule`: Days of the week and time slot.
  - `Milestone Dates`: Start Date, Checkpoint 1 (CP1), Checkpoint 2 (CP2), and Demo Day (`DD/MM/YYYY`).
  - `Active Capacity (Sĩ số Active)`: Dynamically counts active enrolled students against class target.
  - `Staff Assignment`: Lead Teacher, Teaching Assistant (TA), and CS Officer in charge.
  - `Class Status`: Visual states (`Running` - green, `Chờ lớp` - clean white border, `Finished` - slate gray).

---

### 3. Tab 3: 14-Session Attendance Grid (`Điểm danh 14 buổi`)

A spreadsheet-style grid mapping the standard 14 sessions of the MindX curriculum.

* **Instant Class Switcher**: Select any active class code to inspect its student roster.
* **Milestone Highlighting**:
  - **Coding Track**: Session 5 (CP1), Session 9 (CP2), Session 14 (Demo Day).
  - **Robotics Track**: Session 4 (CP1), Session 8 (CP2), Session 14 (Demo Day).
* **One-Click State Cycle**:
  - 🟢 **P (Present)**: Present and on time.
  - 🟡 **L (Late)**: Late arrival.
  - 🔴 **A (Absent Unexcused)**: Absent without notice.
  - 🔵 **E (Absent Excused)**: Absent with approved notice.
  - **-**: Unmarked / upcoming.
  - **Chưa vào**: Locked sessions for mid-course student entrants.
* **Automated Sync**: Ticking **🔴 A** or **🔵 E** immediately creates or updates the student's entry in Tab 4 (Make-up Classes).

---

### 4. Tab 4: Make-up Classes & Study Materials (`Học bù & Gửi tài liệu`)

Ensures student retention and academic continuity after missed sessions.

* **100% Accurate Attendance Mirroring**:
  - Captures exact missed session numbers and status:
    - `Buổi X (Vắng có phép)` highlighted with blue badge (`🔵`).
    - `Buổi X (Vắng không phép)` highlighted with red badge (`🔴`).
  - Separate tracking for **Round 1 (Đợt vắng 1)** and **Round 2 (Đợt vắng 2)**.
  - `Study Materials Sent` checkbox.
  - `Make-up Schedule` input field (date, time, format).
  - Resolution status dropdown: `Chưa bù`, `Đã bù`, `Hủy bù`.
  - `CS & Teacher Notes` for internal coordination.

---

### 5. Tab 5: Waiting Queue (`Chờ lớp New / Level Up`)

Monitors prospective students and completing graduates awaiting class placements.

* **Wait Duration Metrics**:
  - Total Waiting.
  - Waiting 1 - 2 Weeks (Recently added).
  - Waiting 3 - 4 Weeks (Priority placement needed).
  - Waiting > 1 Month (High drop-off/refund risk).
  - Successfully Placed (`Đã vào lớp` / `Đã xếp lớp`).
* **Automated Pipeline Integration**: Students tagged with status `Chờ lớp New` or `Chờ lớp Level Up` in Tab 1 automatically populate this sheet without manual re-entry.

---

### 6. Tab 6: Student Reservations (`Bảo lưu học viên`)

Tracks tuition freeze contracts, policy deadlines, and reactivation outreach.

* **Classification & Deadlines**:
  - `Bảo lưu thường` (Standard policy term) vs `Bảo lưu vượt hạn` (Special approval).
  - `Start Date` and `End Date` formatted as `DD/MM/YYYY`.
  - Automated Urgency Calculation:
    - 🟢 **Còn hạn**: Within permitted term.
    - 🟡 **Sắp tới hạn**: Expiration within 15 calendar days (CS proactive follow-up).
    - 🔴 **Quá hạn**: Overdue reservation (immediate parent outreach).
    - `Đã đi học lại` / `Nghỉ ngang`.

---

### 7. Identity & Authentication System

* **Automated Identity Recognition**:
  - Entering staff code `14049` (password `MindX@2024`) automatically resolves to **Trần Thị Thảo Vy**.
  - Header pill displays: `ROLE: CS | Trần Thị Thảo Vy`.
  - Welcome notification: `Chào Trần Thị Thảo Vy, chúc bạn một ngày làm việc hiệu quả tại MindX!`.
  - Logout notification: `Tạm biệt Trần Thị Thảo Vy, bạn đã đăng xuất thành công khỏi hệ thống!`.
* **Role-Based Access**:
  - `CS (Customer Support / Giáo vụ)`: Daily operations, class schedules, attendance, make-up classes, reservations.
  - `Admin (Quản lý)`: Elevated campus-wide administrative control.

---

## 🛡️ Enterprise Data Safety (Zero-Loss Architecture)

Built specifically to protect administrative work during busy shifts:

1. **Keystroke-by-Keystroke Draft Autosave**: Typing into modal dialogs (Student creation, Class creation) writes directly to persistent draft storage. Accidental dialog closures or page reloads automatically restore all inputs.
2. **Tab Exit Guard (`beforeunload`)**: Prompts an alert if uncommitted form data is detected before a tab can close.
3. **Dual-Layer LocalStorage Redundancy**: All state commits write simultaneously to primary keys (`mx_ta_*`) and mirror backups (`mx_ta_*_backup`).
4. **Live Autosave Indicator**: Header badge displays `🟢 Đã lưu tự động (HH:mm)` showing the exact timestamp of the last persistent save.

---

## 📊 Standardized Excel Export (`.xlsx`)

Powered by [SheetJS](https://sheetjs.com/):
- **Single-Click Multi-Sheet Workbook Generation**: Exports a complete file named `MindX_ThuanAn_Ops_YYYY-MM-DD.xlsx` containing 5 standardized worksheets:
  1. `Danh sách học viên` (Master Student Roster)
  2. `Danh sách lớp học` (Classes Catalog with capacity and personnel)
  3. `Quản lý học bù` (Make-up Classes and Study Materials log)
  4. `Chờ lớp` (Waiting Queue with duration tiers)
  5. `Bảo lưu` (Reservations with urgency indicators)
- Strictly formatted localized date fields (`DD/MM/YYYY`) across all sheets.

---

## 💻 Technical Architecture

- **Frontend Core**: Pure Vanilla ES6+ Object-Oriented Architecture (`App`, `Store`, `AuthManager`), delivering instant page loads with zero external framework overhead.
- **Interface**: Custom CSS3 design system with CSS custom properties (variables), native CSS Grid, Flexbox, and sticky headers/columns.
- **Icon Suite**: Lightweight vector SVG icons via [Lucide Icons](https://lucide.dev/).
- **Excel Engine**: Client-side workbook processing via SheetJS (`xlsx.full.min.js`).

---

## 📄 Internal Proprietary Notice

This software and its data architecture are the **exclusive internal proprietary asset** of:
**MindX Technology School - Thuận An Campus (Bình Dương)**.  
*Strictly for internal campus operations, student management, and academic logistics.*
