# MindX Technology School - Thuận An Campus Ops Management System

<p align="center">
  <strong>High-performance, sheet-like operations dashboard designed specifically for MindX Thuận An Campus staff, teachers, customer support (CS), and academic management.</strong>
</p>

---

## 📌 Overview

**MindX Thuận An Ops** is a specialized web-based operations workspace that replicates the fluid, intuitive experience of spreadsheet tools (Google Sheets & Microsoft Excel) while enforcing strict relational integrity, real-time metrics calculation, automatic attendance-to-makeup synchronization, and one-click multi-sheet Excel exporting.

The user interface follows the official **MindX Technology School** brand guidelines with signature Crimson Red accents, ultra-crisp high-contrast typography, sharp borders, and visual status badges tailored for daily administrative workflows.

---

## 🌟 Key Modules & Data Schema

The system consists of 4 interconnected worksheets:

### 1. Tab 1: Students Management (`Students Sheet`)
* **Live Summary Metrics Cards**: Real-time counter automatically segmented by student statuses:
  $$\text{Total Students} \mid \text{Active} \mid \text{Expiring Soon (Sắp hết phí)} \mid \text{Handle} \mid \text{Reserved (Bảo lưu)} \mid \text{Branch Transfer} \mid \text{Course Transfer} \mid \text{Dropped Out (Nghỉ ngang)}$$
* **Schema Fields**:
  - Full Name, Student Phone Number
  - Parent Name, Email
  - Course Track (e.g., Code For Kids - C4K, Fullstack Intensive, Robotics Discovery)
  - Current Module (e.g., GA01, GA02, GB01, GB02, SB01, Python 01)
  - Track Category (`Coding` / `Robotics`)
  - Class Code (Dynamic dropdown bound to the Classes Sheet)
  - Study Format (`Offline`, `Hybrid`, `Online`)
  - Student Status (`Active`, `Sắp hết phí`, `Handle`, `Bảo lưu`, `Chuyển cơ sở`, `Chuyển nhượng`, `Nghỉ ngang`)
* **Interactive Features**: Inline name editing, immediate status dropdown updates with metric auto-recalculation, and multi-field search/filtering.

### 2. Tab 2: Classes Management (`Classes Sheet`)
* **Live Summary Metrics Cards**:
  $$\text{Total Classes} \mid \text{Running} \mid \text{Pending (Chờ lớp)} \mid \text{Finished} \mid \text{Sufficient Capacity (≥ 6)} \mid \text{Low Capacity (< 6)}$$
* **Schema Fields**:
  - Track Category (`Coding`, `Robotics`)
  - Unique Class Code (e.g., `TA-C4K-GB02-HB`, `TA-ROB-DISC01`)
  - Study Format (`Offline`, `Hybrid`, `Online`)
  - Class Schedule (Day & Time, e.g., `Sat 17:30 - 19:30`)
  - Start Date
  - Milestones: Checkpoint 1 (`CP1 Date`), Checkpoint 2 (`CP2 Date`), Demo Day Date
  - Enrollment / Capacity: Automatically counted from active students assigned to this class code.
  - Personnel: Lead Teacher, Teaching Assistant (TA), Customer Support (CS) Lead.
  - Class Status (`Running`, `Chờ lớp`, `Finished`).

### 3. Tab 3: Attendance Grid (`Attendance Sheet`)
* **Class Selector Filter**: Instant switching between active classes.
* **14 Sessions Grid**:
  - Fixed sticky columns: Student Name and Class Code.
  - 14 distinct session columns (Sessions 1 to 14, dynamically adjusted by Track: Coding (CP1 at Session 5, CP2 at Session 9, Demo Day at Session 14) and Robotics (CP1 at Session 4, CP2 at Session 8, Demo Day at Session 14)).
* **Color-Coded Status Cycles**:
  - 🟢 **Green (P - Present)**: Present and on time.
  - 🟡 **Yellow (L - Late)**: Arrived late.
  - 🔴 **Red (A - Absent Unexcused)**: Absent without leave.
  - 🔵 **Blue (E - Absent Excused)**: Absent with notice.
* **Smart Automation**: Marking a student as **Absent (Red or Blue)** instantly dispatches a record to the Make-up Classes worksheet.

### 4. Tab 4: Make-up Classes & Study Materials (`Make-up Sheet`)
* **Auto-generated Absence Tracking**:
  - Student Name, Class Code.
  - **Round 1 Absence**: Absence Date, "Materials Sent" Checkbox, Scheduled Make-up Date/Class, Completion Status (`Chưa bù`, `Đã bù`, `Hủy bù`).
  - **Round 2 Absence**: Absence Date, "Materials Sent" Checkbox, Scheduled Make-up Date/Class, Completion Status.
  - Notes for Teacher and CS.

---

## ⚡ Data Portability & Storage

* **Multi-Sheet Excel Export (`.xlsx`)**: One click downloads a formatted Microsoft Excel workbook containing 3 individual sheets:
  1. `Danh sách học viên` (Students)
  2. `Danh sách lớp học` (Classes)
  3. `Quản lý học bù` (Make-up Classes)
* **Import Support**: Supports importing data backups via `.xlsx` and `.json`.
* **Zero Data Loss**: All modifications persist locally via browser `localStorage`.
* **Demo Data Reset**: Instant reset button preloaded with Thuận An campus demo data.

---

## 🚀 Getting Started & Deployment

### 1. Local Development
Because the application is built using modern vanilla Web standards (HTML5, CSS3, ES6+), no heavy build tools or Node.js environment is mandatory to run the application locally.

Using Python:
```bash
python -m http.server 3000
```
Then navigate to: `http://localhost:3000` in your web browser.

### 2. Deployment to Vercel (1-Click Static Deployment)

1. **Commit and push to GitHub**:
   ```bash
   git add .
   git commit -m "feat: complete mindx thuan an ops management web app"
   git branch -M main
   git remote add origin https://github.com/<your-username>/mindx-thuanan-ops.git
   git push -u origin main
   ```

2. **Connect to Vercel**:
   - Log into [vercel.com](https://vercel.com).
   - Click **Add New** $\rightarrow$ **Project**.
   - Select your GitHub repository `mindx-thuanan-ops`.
   - The pre-configured [`vercel.json`](vercel.json) will automatically deploy the static application instantly.

---

## 🎨 Design Principles
* **Non-AI Aesthetic**: Built with clean, human-designed functional aesthetics modeled after enterprise operations suites.
* **100% Text Legibility**: High-contrast slate typography (`#0f172a` text on `#ffffff` backgrounds) optimized for extended office viewing.
* **MindX Brand Compliance**: MindX Crimson Red primary accents (`#d91b24`), branded badges, and high-resolution Thuận An campus assets.

---

## 📄 License
Internal Operations Software for **MindX Technology School - Thuận An Campus**. All rights reserved.
