/**
 * MindX Thuận An - Sheet-Like Ops Management System Core Logic
 * 4 Interactive Linked Worksheets:
 * 1. Students Sheet (Metrics Cards + Dynamic Status/Class filter)
 * 2. Classes Sheet (Auto capacity calculation >= 6, status)
 * 3. Attendance Sheet (14 sessions, 4 status colors, auto-makeup dispatch)
 * 4. Makeup & Materials Sheet (Make-up rounds 1 & 2, sync from attendance)
 */

// Initial Seed Data for MindX Thuận An
const INITIAL_CLASSES = [
  {
    id: "cls-01",
    trackCategory: "Coding",
    classCode: "TA-C4K-GB02-HB",
    studyFormat: "Offline",
    schedule: "T7 (17:30 - 19:30)",
    startDate: "2026-03-07",
    cp1Date: "2026-04-18",
    cp2Date: "2026-05-30",
    demoDate: "2026-06-06",
    teacher: "Thầy Hoàng Minh",
    ta: "Cô Kim Ngân",
    cs: "Chị Thảo CS",
    status: "Running"
  },
  {
    id: "cls-02",
    trackCategory: "Coding",
    classCode: "TA-C4K-GA02-HB",
    studyFormat: "Offline",
    schedule: "CN (08:30 - 10:30)",
    startDate: "2026-03-08",
    cp1Date: "2026-04-19",
    cp2Date: "2026-05-31",
    demoDate: "2026-06-07",
    teacher: "Thầy Đức Nam",
    ta: "Thầy Hữu Phước",
    cs: "Chị Thảo CS",
    status: "Running"
  },
  {
    id: "cls-03",
    trackCategory: "Coding",
    classCode: "TA-C4K-SA03-HB",
    studyFormat: "Hybrid",
    schedule: "T7 (14:30 - 16:30)",
    startDate: "2026-02-21",
    cp1Date: "2026-04-04",
    cp2Date: "2026-05-16",
    demoDate: "2026-05-23",
    teacher: "Thầy Quang Khải",
    ta: "Cô Lan Vy",
    cs: "Chị Hà Vy",
    status: "Running"
  },
  {
    id: "cls-04",
    trackCategory: "Robotics",
    classCode: "TA-ROB-DISC01",
    studyFormat: "Offline",
    schedule: "CN (15:00 - 17:00)",
    startDate: "2026-03-15",
    cp1Date: "2026-04-26",
    cp2Date: "2026-06-07",
    demoDate: "2026-06-14",
    teacher: "Thầy Tấn Đạt",
    ta: "Thầy Minh Triết",
    cs: "Chị Mai Linh",
    status: "Running"
  },
  {
    id: "cls-05",
    trackCategory: "Coding",
    classCode: "TA-INT-WEB01",
    studyFormat: "Online",
    schedule: "T3 & T5 (19:00 - 21:00)",
    startDate: "2026-04-01",
    cp1Date: "2026-05-10",
    cp2Date: "2026-06-20",
    demoDate: "2026-06-30",
    teacher: "Thầy Thanh Tùng",
    ta: "Cô Mỹ Duyên",
    cs: "Chị Hà Vy",
    status: "Chờ lớp"
  }
];

const INITIAL_STUDENTS = [
  {
    id: "std-01",
    fullName: "Nguyễn Gia Bảo",
    phone: "0908123456",
    parentName: "Nguyễn Văn Hùng",
    email: "hung.nguyen@gmail.com",
    courseTrack: "Code For Kids (C4K)",
    currentModule: "GB02",
    trackCategory: "Coding",
    classCode: "TA-C4K-GB02-HB",
    studyFormat: "Offline",
    status: "Active"
  },
  {
    id: "std-02",
    fullName: "Trần Minh Khang",
    phone: "0912345678",
    parentName: "Trần Quốc Toản",
    email: "toan.tran@gmail.com",
    courseTrack: "Code For Kids (C4K)",
    currentModule: "GB02",
    trackCategory: "Coding",
    classCode: "TA-C4K-GB02-HB",
    studyFormat: "Offline",
    status: "Active"
  },
  {
    id: "std-03",
    fullName: "Lê Ngọc Anh",
    phone: "0933998877",
    parentName: "Phạm Thúy Hằng",
    email: "thuyhang.le@gmail.com",
    courseTrack: "Code For Kids (C4K)",
    currentModule: "GB02",
    trackCategory: "Coding",
    classCode: "TA-C4K-GB02-HB",
    studyFormat: "Offline",
    status: "Sắp hết phí"
  },
  {
    id: "std-04",
    fullName: "Võ Hoàng Nam",
    phone: "0977881122",
    parentName: "Võ Văn Kiệt",
    email: "kiet.vo@gmail.com",
    courseTrack: "Code For Kids (C4K)",
    currentModule: "GB02",
    trackCategory: "Coding",
    classCode: "TA-C4K-GB02-HB",
    studyFormat: "Offline",
    status: "Active"
  },
  {
    id: "std-05",
    fullName: "Phạm Đăng Khoa",
    phone: "0988665544",
    parentName: "Đỗ Bích Thủy",
    email: "bichthuy.pham@gmail.com",
    courseTrack: "Code For Kids (C4K)",
    currentModule: "GB02",
    trackCategory: "Coding",
    classCode: "TA-C4K-GB02-HB",
    studyFormat: "Offline",
    status: "Active"
  },
  {
    id: "std-06",
    fullName: "Bùi Thị Mai Hương",
    phone: "0918776655",
    parentName: "Bùi Văn Thành",
    email: "thanh.bui@gmail.com",
    courseTrack: "Code For Kids (C4K)",
    currentModule: "GB02",
    trackCategory: "Coding",
    classCode: "TA-C4K-GB02-HB",
    studyFormat: "Offline",
    status: "Active"
  },
  {
    id: "std-07",
    fullName: "Đỗ Minh Quân",
    phone: "0944556677",
    parentName: "Nguyễn Thảo Nguyên",
    email: "thaonguyen.do@gmail.com",
    courseTrack: "Code For Kids (C4K)",
    currentModule: "GA02",
    trackCategory: "Coding",
    classCode: "TA-C4K-GA02-HB",
    studyFormat: "Offline",
    status: "Active"
  },
  {
    id: "std-08",
    fullName: "Huỳnh Quốc Bảo",
    phone: "0934112233",
    parentName: "Huỳnh Tấn Phát",
    email: "phat.huynh@gmail.com",
    courseTrack: "Code For Kids (C4K)",
    currentModule: "GA02",
    trackCategory: "Coding",
    classCode: "TA-C4K-GA02-HB",
    studyFormat: "Offline",
    status: "Handle"
  },
  {
    id: "std-09",
    fullName: "Vũ Hải Đăng",
    phone: "0909887766",
    parentName: "Vũ Thành Công",
    email: "cong.vu@gmail.com",
    courseTrack: "Robotics Discovery",
    currentModule: "M1-Makers",
    trackCategory: "Robotics",
    classCode: "TA-ROB-DISC01",
    studyFormat: "Offline",
    status: "Active"
  },
  {
    id: "std-10",
    fullName: "Lý Gia Hân",
    phone: "0919223344",
    parentName: "Trần Kim Loan",
    email: "loan.tran@gmail.com",
    courseTrack: "Code For Kids (C4K)",
    currentModule: "SA03",
    trackCategory: "Coding",
    classCode: "TA-C4K-SA03-HB",
    studyFormat: "Hybrid",
    status: "Bảo lưu"
  },
  {
    id: "std-11",
    fullName: "Nguyễn Tuấn Kiệt",
    phone: "0903332211",
    parentName: "Lê Phương Thảo",
    email: "thao.le@gmail.com",
    courseTrack: "Fullstack Web",
    currentModule: "ReactJS",
    trackCategory: "Coding",
    classCode: "TA-INT-WEB01",
    studyFormat: "Online",
    status: "Sắp hết phí"
  },
  {
    id: "std-12",
    fullName: "Dương Thế Vinh",
    phone: "0982233445",
    parentName: "Dương Minh Trí",
    email: "tri.duong@gmail.com",
    courseTrack: "Code For Kids (C4K)",
    currentModule: "GA02",
    trackCategory: "Coding",
    classCode: "TA-C4K-GA02-HB",
    studyFormat: "Offline",
    status: "Nghỉ ngang"
  }
];

// Initial Attendance Records: key `${classCode}__${studentId}__${sessionNum}`
const INITIAL_ATTENDANCE = {
  // TA-C4K-GB02-HB
  "TA-C4K-GB02-HB__std-01__1": "P",
  "TA-C4K-GB02-HB__std-01__2": "P",
  "TA-C4K-GB02-HB__std-01__3": "L",
  "TA-C4K-GB02-HB__std-02__1": "P",
  "TA-C4K-GB02-HB__std-02__2": "A", // Vắng không phép -> Tạo học bù
  "TA-C4K-GB02-HB__std-02__3": "P",
  "TA-C4K-GB02-HB__std-03__1": "P",
  "TA-C4K-GB02-HB__std-03__2": "E", // Vắng có phép -> Tạo học bù
  "TA-C4K-GB02-HB__std-03__3": "P",
  "TA-C4K-GB02-HB__std-04__1": "P",
  "TA-C4K-GB02-HB__std-04__2": "P",
  "TA-C4K-GB02-HB__std-05__1": "P",
  "TA-C4K-GB02-HB__std-06__1": "P"
};

// State Store
class Store {
  constructor() {
    this.classes = this.load("mx_ta_classes", INITIAL_CLASSES);
    this.students = this.load("mx_ta_students", INITIAL_STUDENTS);
    this.attendance = this.load("mx_ta_attendance", INITIAL_ATTENDANCE);
    this.makeup = this.load("mx_ta_makeup", []);

    // Sync makeup table with attendance absences on initial load
    this.syncMakeupFromAttendance();
  }

  load(key, fallback) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      console.error(`Error loading ${key}`, e);
      return fallback;
    }
  }

  save() {
    localStorage.setItem("mx_ta_classes", JSON.stringify(this.classes));
    localStorage.setItem("mx_ta_students", JSON.stringify(this.students));
    localStorage.setItem("mx_ta_attendance", JSON.stringify(this.attendance));
    localStorage.setItem("mx_ta_makeup", JSON.stringify(this.makeup));
  }

  resetDemo() {
    this.classes = JSON.parse(JSON.stringify(INITIAL_CLASSES));
    this.students = JSON.parse(JSON.stringify(INITIAL_STUDENTS));
    this.attendance = JSON.parse(JSON.stringify(INITIAL_ATTENDANCE));
    this.makeup = [];
    this.syncMakeupFromAttendance();
    this.save();
  }

  // Calculate dynamic capacity for a class based on active students
  getClassActiveCount(classCode) {
    return this.students.filter(
      s => s.classCode === classCode && (s.status === "Active" || s.status === "Sắp hết phí")
    ).length;
  }

  // Attendance Attendance key generator
  getAttKey(classCode, studentId, session) {
    return `${classCode}__${studentId}__${session}`;
  }

  // Synchronize attendance absences (A or E) to makeup records
  syncMakeupFromAttendance() {
    // Collect all absences per student and class
    const absencesMap = {}; // key: `${classCode}__${studentId}` -> Array of { session, status }

    for (const [key, val] of Object.entries(this.attendance)) {
      if (val === "A" || val === "E") {
        const parts = key.split("__");
        if (parts.length === 3) {
          const [classCode, studentId, session] = parts;
          const pairKey = `${classCode}__${studentId}`;
          if (!absencesMap[pairKey]) {
            absencesMap[pairKey] = [];
          }
          absencesMap[pairKey].push({
            session: parseInt(session),
            type: val === "A" ? "Vắng không phép" : "Vắng có phép"
          });
        }
      }
    }

    // Merge or create makeup entries
    for (const [pairKey, absList] of Object.entries(absencesMap)) {
      const [classCode, studentId] = pairKey.split("__");
      const student = this.students.find(s => s.id === studentId);
      if (!student) continue;

      // Sort by session
      absList.sort((a, b) => a.session - b.session);

      let record = this.makeup.find(m => m.studentId === studentId && m.classCode === classCode);
      if (!record) {
        record = {
          id: "mk-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
          studentId: studentId,
          studentName: student.fullName,
          classCode: classCode,
          absent1Date: `Buổi ${absList[0].session} (${absList[0].type})`,
          absent1SentDoc: false,
          absent1Schedule: "",
          absent1Status: "Chưa bù",
          absent2Date: absList[1] ? `Buổi ${absList[1].session} (${absList[1].type})` : "",
          absent2SentDoc: false,
          absent2Schedule: "",
          absent2Status: absList[1] ? "Chưa bù" : "",
          csNotes: ""
        };
        this.makeup.push(record);
      } else {
        // Update absent dates if needed
        record.studentName = student.fullName;
        if (!record.absent1Date) {
          record.absent1Date = `Buổi ${absList[0].session} (${absList[0].type})`;
        }
        if (absList[1] && !record.absent2Date) {
          record.absent2Date = `Buổi ${absList[1].session} (${absList[1].type})`;
          if (!record.absent2Status) record.absent2Status = "Chưa bù";
        }
      }
    }
  }
}

// Global App Controller
class App {
  constructor() {
    this.store = new Store();
    this.currentTab = "students";
    this.selectedAttendanceClass = this.store.classes[0]?.classCode || "";

    this.initElements();
    this.bindEvents();
    this.render();
  }

  initElements() {
    // Tabs
    this.tabButtons = document.querySelectorAll(".sheet-tab-btn");
    this.tabPanels = {
      students: document.getElementById("tab-students"),
      classes: document.getElementById("tab-classes"),
      attendance: document.getElementById("tab-attendance"),
      makeup: document.getElementById("tab-makeup")
    };

    // Header buttons
    this.btnAddRow = document.getElementById("btn-add-row");
    this.addBtnText = document.getElementById("add-btn-text");
    this.btnExportExcel = document.getElementById("btn-export-excel");
    this.btnImportExcel = document.getElementById("btn-import-excel");
    this.fileImport = document.getElementById("file-import");
    this.btnResetDemo = document.getElementById("btn-reset-demo");

    // Students filter
    this.searchStudent = document.getElementById("search-student");
    this.filterStudentStatus = document.getElementById("filter-student-status");
    this.filterStudentTrack = document.getElementById("filter-student-track");
    this.filterStudentClass = document.getElementById("filter-student-class");
    this.tbodyStudents = document.getElementById("tbody-students");
    this.studentsTableCount = document.getElementById("students-table-count");

    // Classes filter
    this.searchClass = document.getElementById("search-class");
    this.filterClassStatus = document.getElementById("filter-class-status");
    this.filterClassTrack = document.getElementById("filter-class-track");
    this.filterClassCapacity = document.getElementById("filter-class-capacity");
    this.tbodyClasses = document.getElementById("tbody-classes");
    this.classesTableCount = document.getElementById("classes-table-count");

    // Attendance
    this.selectAttendanceClass = document.getElementById("select-attendance-class");
    this.attendanceClassInfo = document.getElementById("attendance-class-info");
    this.tbodyAttendance = document.getElementById("tbody-attendance");

    // Makeup
    this.searchMakeup = document.getElementById("search-makeup");
    this.filterMakeupClass = document.getElementById("filter-makeup-class");
    this.filterMakeupStatus = document.getElementById("filter-makeup-status");
    this.tbodyMakeup = document.getElementById("tbody-makeup");

    // Modals
    this.modalStudent = document.getElementById("modal-student");
    this.formStudent = document.getElementById("form-student");
    this.modalClass = document.getElementById("modal-class");
    this.formClass = document.getElementById("form-class");
    this.toast = document.getElementById("toast");
  }

  bindEvents() {
    // Tab switching
    this.tabButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const tab = btn.dataset.tab;
        this.switchTab(tab);
      });
    });

    // Add Row action button
    this.btnAddRow.addEventListener("click", () => {
      if (this.currentTab === "students") {
        this.openStudentModal();
      } else if (this.currentTab === "classes") {
        this.openClassModal();
      } else if (this.currentTab === "makeup") {
        this.openAddMakeupRecord();
      }
    });

    // Reset demo data
    this.btnResetDemo.addEventListener("click", () => {
      if (confirm("Bạn có chắc chắn muốn nạp lại dữ liệu mẫu Thuận An không? Dữ liệu hiện tại sẽ được thay bằng bộ mẫu ban đầu.")) {
        this.store.resetDemo();
        this.render();
        this.showToast("Đã nạp lại dữ liệu mẫu cơ sở Thuận An thành công!");
      }
    });

    // Export Excel
    this.btnExportExcel.addEventListener("click", () => this.exportToExcel());

    // Import Excel/JSON
    this.btnImportExcel.addEventListener("click", () => this.fileImport.click());
    this.fileImport.addEventListener("change", (e) => this.handleFileImport(e));

    // Students filter triggers
    [this.searchStudent, this.filterStudentStatus, this.filterStudentTrack, this.filterStudentClass].forEach(el => {
      el.addEventListener("input", () => this.renderStudents());
    });

    // Classes filter triggers
    [this.searchClass, this.filterClassStatus, this.filterClassTrack, this.filterClassCapacity].forEach(el => {
      el.addEventListener("input", () => this.renderClasses());
    });

    // Attendance class selector
    this.selectAttendanceClass.addEventListener("change", (e) => {
      this.selectedAttendanceClass = e.target.value;
      this.renderAttendance();
    });

    // Makeup filters
    [this.searchMakeup, this.filterMakeupClass, this.filterMakeupStatus].forEach(el => {
      el.addEventListener("input", () => this.renderMakeup());
    });

    // Modal close triggers
    document.querySelectorAll("[data-close]").forEach(el => {
      el.addEventListener("click", () => {
        const modalId = el.getAttribute("data-close");
        document.getElementById(modalId).classList.remove("open");
      });
    });

    // Modal forms submit
    this.formStudent.addEventListener("submit", (e) => this.handleStudentSubmit(e));
    this.formClass.addEventListener("submit", (e) => this.handleClassSubmit(e));
  }

  showToast(message) {
    this.toast.textContent = message;
    this.toast.classList.remove("hidden");
    setTimeout(() => {
      this.toast.classList.add("hidden");
    }, 2800);
  }

  switchTab(tab) {
    this.currentTab = tab;
    this.tabButtons.forEach(btn => {
      btn.classList.toggle("active", btn.dataset.tab === tab);
    });

    Object.entries(this.tabPanels).forEach(([name, panel]) => {
      panel.classList.toggle("active", name === tab);
    });

    // Update Add button label
    if (tab === "students") {
      this.btnAddRow.style.display = "inline-flex";
      this.addBtnText.textContent = "Thêm Học Viên";
    } else if (tab === "classes") {
      this.btnAddRow.style.display = "inline-flex";
      this.addBtnText.textContent = "Thêm Lớp Học";
    } else if (tab === "makeup") {
      this.btnAddRow.style.display = "inline-flex";
      this.addBtnText.textContent = "Thêm Bản Ghi Bù";
    } else {
      this.btnAddRow.style.display = "none";
    }

    // Refresh icons
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  render() {
    this.populateDropdowns();
    this.renderStudents();
    this.renderClasses();
    this.renderAttendance();
    this.renderMakeup();

    // Update tab badges
    document.getElementById("badge-students-count").textContent = this.store.students.length;
    document.getElementById("badge-classes-count").textContent = this.store.classes.length;
    document.getElementById("badge-makeup-count").textContent = this.store.makeup.length;

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  populateDropdowns() {
    const classCodes = this.store.classes.map(c => c.classCode);

    // Filter student class dropdown
    const curStdFilter = this.filterStudentClass.value;
    this.filterStudentClass.innerHTML = `<option value="">-- Tất cả lớp --</option>` +
      classCodes.map(code => `<option value="${code}" ${code === curStdFilter ? 'selected' : ''}>${code}</option>`).join("");

    // Student modal class select
    const modalStdClass = document.getElementById("student-classCode");
    modalStdClass.innerHTML = classCodes.map(code => `<option value="${code}">${code}</option>`).join("");

    // Attendance class selector
    if (!classCodes.includes(this.selectedAttendanceClass) && classCodes.length > 0) {
      this.selectedAttendanceClass = classCodes[0];
    }
    this.selectAttendanceClass.innerHTML = classCodes.map(code =>
      `<option value="${code}" ${code === this.selectedAttendanceClass ? 'selected' : ''}>${code}</option>`
    ).join("");

    // Makeup class filter
    const curMkFilter = this.filterMakeupClass.value;
    this.filterMakeupClass.innerHTML = `<option value="">-- Tất cả lớp --</option>` +
      classCodes.map(code => `<option value="${code}" ${code === curMkFilter ? 'selected' : ''}>${code}</option>`).join("");
  }

  // ================= 1. TAB STUDENTS =================
  renderStudents() {
    const query = this.searchStudent.value.toLowerCase().trim();
    const statusFilter = this.filterStudentStatus.value;
    const trackFilter = this.filterStudentTrack.value;
    const classFilter = this.filterStudentClass.value;

    // Filter students
    const filtered = this.store.students.filter(s => {
      const matchQuery = !query ||
        s.fullName.toLowerCase().includes(query) ||
        (s.phone && s.phone.includes(query)) ||
        (s.parentName && s.parentName.toLowerCase().includes(query)) ||
        (s.email && s.email.toLowerCase().includes(query)) ||
        s.classCode.toLowerCase().includes(query);

      const matchStatus = !statusFilter || s.status === statusFilter;
      const matchTrack = !trackFilter || s.trackCategory === trackFilter;
      const matchClass = !classFilter || s.classCode === classFilter;

      return matchQuery && matchStatus && matchTrack && matchClass;
    });

    // Update Summary Metrics
    const total = this.store.students.length;
    const active = this.store.students.filter(s => s.status === "Active").length;
    const expiring = this.store.students.filter(s => s.status === "Sắp hết phí").length;
    const handle = this.store.students.filter(s => s.status === "Handle").length;
    const reserve = this.store.students.filter(s => s.status === "Bảo lưu").length;
    const transferB = this.store.students.filter(s => s.status === "Chuyển cơ sở").length;
    const transferS = this.store.students.filter(s => s.status === "Chuyển nhượng").length;
    const drop = this.store.students.filter(s => s.status === "Nghỉ ngang").length;

    document.getElementById("metric-total-students").textContent = total;
    document.getElementById("metric-active-students").textContent = active;
    document.getElementById("metric-expiring-students").textContent = expiring;
    document.getElementById("metric-handle-students").textContent = handle;
    document.getElementById("metric-reserve-students").textContent = reserve;
    document.getElementById("metric-transfer-branch-students").textContent = transferB;
    document.getElementById("metric-transfer-student-students").textContent = transferS;
    document.getElementById("metric-drop-students").textContent = drop;

    this.studentsTableCount.textContent = `Hiển thị ${filtered.length} / ${total} học viên`;

    // Render Table rows
    if (filtered.length === 0) {
      this.tbodyStudents.innerHTML = `<tr><td colspan="12" style="text-align: center; padding: 30px; color: #94a3b8;">Không tìm thấy học viên nào phù hợp với bộ lọc.</td></tr>`;
      return;
    }

    this.tbodyStudents.innerHTML = filtered.map((s, idx) => {
      const statusBadge = this.getStatusBadge(s.status);
      const trackBadge = s.trackCategory === "Coding" ? "badge-coding" : "badge-robotics";
      return `
        <tr data-student-id="${s.id}">
          <td class="col-num sticky-col">${idx + 1}</td>
          <td class="col-name sticky-col">
            <span class="cell-editable" title="Bấm để chỉnh sửa nhanh" onclick="app.editStudentName('${s.id}')">${s.fullName}</span>
          </td>
          <td>${s.phone || '-'}</td>
          <td>${s.parentName || '-'}</td>
          <td>${s.email || '-'}</td>
          <td>${s.courseTrack || '-'}</td>
          <td><strong>${s.currentModule || '-'}</strong></td>
          <td><span class="badge ${trackBadge}">${s.trackCategory}</span></td>
          <td><code>${s.classCode}</code></td>
          <td>${s.studyFormat}</td>
          <td>
            <select class="filter-select" style="padding: 2px 6px; font-weight:600;" onchange="app.changeStudentStatus('${s.id}', this.value)">
              <option value="Active" ${s.status === 'Active' ? 'selected' : ''}>Active</option>
              <option value="Sắp hết phí" ${s.status === 'Sắp hết phí' ? 'selected' : ''}>Sắp hết phí</option>
              <option value="Handle" ${s.status === 'Handle' ? 'selected' : ''}>Handle</option>
              <option value="Bảo lưu" ${s.status === 'Bảo lưu' ? 'selected' : ''}>Bảo lưu</option>
              <option value="Chuyển cơ sở" ${s.status === 'Chuyển cơ sở' ? 'selected' : ''}>Chuyển cơ sở</option>
              <option value="Chuyển nhượng" ${s.status === 'Chuyển nhượng' ? 'selected' : ''}>Chuyển nhượng</option>
              <option value="Nghỉ ngang" ${s.status === 'Nghỉ ngang' ? 'selected' : ''}>Nghỉ ngang</option>
            </select>
          </td>
          <td class="col-actions">
            <div class="row-actions">
              <button class="btn-icon" title="Sửa chi tiết" onclick="app.openStudentModal('${s.id}')"><i data-lucide="edit-3"></i></button>
              <button class="btn-icon btn-delete" title="Xóa học viên" onclick="app.deleteStudent('${s.id}')"><i data-lucide="trash-2"></i></button>
            </div>
          </td>
        </tr>
      `;
    }).join("");

    if (window.lucide) window.lucide.createIcons();
  }

  getStatusBadge(status) {
    switch (status) {
      case "Active": return `<span class="badge badge-active">Active</span>`;
      case "Sắp hết phí": return `<span class="badge badge-expiring">Sắp hết phí</span>`;
      case "Handle": return `<span class="badge badge-handle">Handle</span>`;
      case "Bảo lưu": return `<span class="badge badge-reserve">Bảo lưu</span>`;
      case "Chuyển cơ sở": return `<span class="badge badge-transfer">Chuyển cơ sở</span>`;
      case "Chuyển nhượng": return `<span class="badge badge-transfer">Chuyển nhượng</span>`;
      case "Nghỉ ngang": return `<span class="badge badge-drop">Nghỉ ngang</span>`;
      default: return `<span class="badge">${status}</span>`;
    }
  }

  changeStudentStatus(studentId, newStatus) {
    const student = this.store.students.find(s => s.id === studentId);
    if (student) {
      student.status = newStatus;
      this.store.save();
      this.renderStudents();
      this.renderClasses(); // Refresh class capacity
      this.showToast(`Đã cập nhật trạng thái học viên: ${student.fullName} -> ${newStatus}`);
    }
  }

  editStudentName(studentId) {
    const student = this.store.students.find(s => s.id === studentId);
    if (!student) return;
    const newName = prompt("Nhập họ và tên học viên:", student.fullName);
    if (newName && newName.trim() !== "") {
      student.fullName = newName.trim();
      this.store.save();
      this.renderStudents();
      this.renderAttendance();
      this.renderMakeup();
      this.showToast("Đã cập nhật tên học viên!");
    }
  }

  openStudentModal(studentId = null) {
    const title = document.getElementById("modal-student-title");
    const form = this.formStudent;
    form.reset();

    if (studentId) {
      const s = this.store.students.find(item => item.id === studentId);
      if (!s) return;
      title.textContent = "Chỉnh Sửa Thông Tin Học Viên";
      document.getElementById("student-id").value = s.id;
      document.getElementById("student-fullName").value = s.fullName;
      document.getElementById("student-phone").value = s.phone || "";
      document.getElementById("student-parentName").value = s.parentName || "";
      document.getElementById("student-email").value = s.email || "";
      document.getElementById("student-courseTrack").value = s.courseTrack || "";
      document.getElementById("student-currentModule").value = s.currentModule || "";
      document.getElementById("student-trackCategory").value = s.trackCategory;
      document.getElementById("student-classCode").value = s.classCode;
      document.getElementById("student-studyFormat").value = s.studyFormat;
      document.getElementById("student-status").value = s.status;
    } else {
      title.textContent = "Thêm Học Viên Mới";
      document.getElementById("student-id").value = "";
    }

    this.modalStudent.classList.add("open");
  }

  handleStudentSubmit(e) {
    e.preventDefault();
    const id = document.getElementById("student-id").value;
    const studentData = {
      fullName: document.getElementById("student-fullName").value.trim(),
      phone: document.getElementById("student-phone").value.trim(),
      parentName: document.getElementById("student-parentName").value.trim(),
      email: document.getElementById("student-email").value.trim(),
      courseTrack: document.getElementById("student-courseTrack").value.trim(),
      currentModule: document.getElementById("student-currentModule").value.trim(),
      trackCategory: document.getElementById("student-trackCategory").value,
      classCode: document.getElementById("student-classCode").value,
      studyFormat: document.getElementById("student-studyFormat").value,
      status: document.getElementById("student-status").value
    };

    if (id) {
      // Edit existing
      const index = this.store.students.findIndex(s => s.id === id);
      if (index !== -1) {
        this.store.students[index] = { ...this.store.students[index], ...studentData };
        this.showToast("Cập nhật học viên thành công!");
      }
    } else {
      // Create new
      const newStudent = {
        id: "std-" + Date.now(),
        ...studentData
      };
      this.store.students.unshift(newStudent);
      this.showToast("Thêm học viên mới thành công!");
    }

    this.store.save();
    this.modalStudent.classList.remove("open");
    this.render();
  }

  deleteStudent(id) {
    const student = this.store.students.find(s => s.id === id);
    if (!student) return;
    if (confirm(`Bạn có chắc muốn xóa học viên "${student.fullName}" không?`)) {
      this.store.students = this.store.students.filter(s => s.id !== id);
      this.store.save();
      this.render();
      this.showToast(`Đã xóa học viên ${student.fullName}`);
    }
  }

  // ================= 2. TAB CLASSES =================
  renderClasses() {
    const query = this.searchClass.value.toLowerCase().trim();
    const statusFilter = this.filterClassStatus.value;
    const trackFilter = this.filterClassTrack.value;
    const capacityFilter = this.filterClassCapacity.value;

    const filtered = this.store.classes.filter(c => {
      const matchQuery = !query ||
        c.classCode.toLowerCase().includes(query) ||
        (c.teacher && c.teacher.toLowerCase().includes(query)) ||
        (c.ta && c.ta.toLowerCase().includes(query)) ||
        (c.cs && c.cs.toLowerCase().includes(query));

      const matchStatus = !statusFilter || c.status === statusFilter;
      const matchTrack = !trackFilter || c.trackCategory === trackFilter;

      const activeCount = this.store.getClassActiveCount(c.classCode);
      const isFull = activeCount >= 6;
      let matchCapacity = true;
      if (capacityFilter === "Đủ sĩ số") matchCapacity = isFull;
      if (capacityFilter === "Thiếu sĩ số") matchCapacity = !isFull;

      return matchQuery && matchStatus && matchTrack && matchCapacity;
    });

    // Update Summary Metrics for Classes
    const total = this.store.classes.length;
    const running = this.store.classes.filter(c => c.status === "Running").length;
    const pending = this.store.classes.filter(c => c.status === "Chờ lớp").length;
    const finished = this.store.classes.filter(c => c.status === "Finished").length;
    const full = this.store.classes.filter(c => this.store.getClassActiveCount(c.classCode) >= 6).length;
    const low = total - full;

    document.getElementById("metric-total-classes").textContent = total;
    document.getElementById("metric-running-classes").textContent = running;
    document.getElementById("metric-pending-classes").textContent = pending;
    document.getElementById("metric-finished-classes").textContent = finished;
    document.getElementById("metric-full-classes").textContent = full;
    document.getElementById("metric-low-classes").textContent = low;

    this.classesTableCount.textContent = `Hiển thị ${filtered.length} / ${total} lớp`;

    if (filtered.length === 0) {
      this.tbodyClasses.innerHTML = `<tr><td colspan="15" style="text-align: center; padding: 30px; color: #94a3b8;">Không tìm thấy lớp học nào phù hợp.</td></tr>`;
      return;
    }

    this.tbodyClasses.innerHTML = filtered.map((c, idx) => {
      const activeCount = this.store.getClassActiveCount(c.classCode);
      const isFull = activeCount >= 6;
      const capacityBadge = isFull
        ? `<span class="badge badge-full">Đủ sĩ số (${activeCount})</span>`
        : `<span class="badge badge-low">Thiếu sĩ số (${activeCount}/6)</span>`;

      const trackBadge = c.trackCategory === "Coding" ? "badge-coding" : "badge-robotics";
      const statusBadge = c.status === "Running"
        ? `<span class="badge badge-running">Running</span>`
        : (c.status === "Chờ lớp" ? `<span class="badge badge-pending">Chờ lớp</span>` : `<span class="badge badge-finished">Finished</span>`);

      return `
        <tr data-class-code="${c.classCode}">
          <td class="col-num sticky-col">${idx + 1}</td>
          <td class="sticky-col"><span class="badge ${trackBadge}">${c.trackCategory}</span></td>
          <td class="sticky-col-2"><strong>${c.classCode}</strong></td>
          <td>${c.studyFormat}</td>
          <td>${c.schedule || '-'}</td>
          <td>${c.startDate || '-'}</td>
          <td>${c.cp1Date || '-'}</td>
          <td>${c.cp2Date || '-'}</td>
          <td>${c.demoDate || '-'}</td>
          <td>${capacityBadge}</td>
          <td>${c.teacher || '-'}</td>
          <td>${c.ta || '-'}</td>
          <td>${c.cs || '-'}</td>
          <td>
            <select class="filter-select" style="padding: 2px 6px;" onchange="app.changeClassStatus('${c.id}', this.value)">
              <option value="Running" ${c.status === 'Running' ? 'selected' : ''}>Running</option>
              <option value="Chờ lớp" ${c.status === 'Chờ lớp' ? 'selected' : ''}>Chờ lớp</option>
              <option value="Finished" ${c.status === 'Finished' ? 'selected' : ''}>Finished</option>
            </select>
          </td>
          <td class="col-actions">
            <div class="row-actions">
              <button class="btn-icon" title="Điểm danh lớp này" onclick="app.quickAttendance('${c.classCode}')"><i data-lucide="check-square"></i></button>
              <button class="btn-icon" title="Sửa lớp" onclick="app.openClassModal('${c.id}')"><i data-lucide="edit-3"></i></button>
              <button class="btn-icon btn-delete" title="Xóa lớp" onclick="app.deleteClass('${c.id}')"><i data-lucide="trash-2"></i></button>
            </div>
          </td>
        </tr>
      `;
    }).join("");

    if (window.lucide) window.lucide.createIcons();
  }

  changeClassStatus(classId, newStatus) {
    const cls = this.store.classes.find(c => c.id === classId);
    if (cls) {
      cls.status = newStatus;
      this.store.save();
      this.renderClasses();
      this.showToast(`Đã đổi tình trạng lớp ${cls.classCode} sang: ${newStatus}`);
    }
  }

  quickAttendance(classCode) {
    this.selectedAttendanceClass = classCode;
    this.selectAttendanceClass.value = classCode;
    this.switchTab("attendance");
    this.renderAttendance();
  }

  openClassModal(classId = null) {
    const title = document.getElementById("modal-class-title");
    const form = this.formClass;
    form.reset();

    if (classId) {
      const c = this.store.classes.find(item => item.id === classId);
      if (!c) return;
      title.textContent = "Chỉnh Sửa Lớp Học";
      form.dataset.classId = c.id;
      document.getElementById("class-trackCategory").value = c.trackCategory;
      document.getElementById("class-classCode").value = c.classCode;
      document.getElementById("class-studyFormat").value = c.studyFormat;
      document.getElementById("class-schedule").value = c.schedule || "";
      document.getElementById("class-startDate").value = c.startDate || "";
      document.getElementById("class-cp1Date").value = c.cp1Date || "";
      document.getElementById("class-cp2Date").value = c.cp2Date || "";
      document.getElementById("class-demoDate").value = c.demoDate || "";
      document.getElementById("class-teacher").value = c.teacher || "";
      document.getElementById("class-ta").value = c.ta || "";
      document.getElementById("class-cs").value = c.cs || "";
      document.getElementById("class-status").value = c.status;
    } else {
      title.textContent = "Thêm Lớp Học Mới";
      delete form.dataset.classId;
    }

    this.modalClass.classList.add("open");
  }

  handleClassSubmit(e) {
    e.preventDefault();
    const classId = this.formClass.dataset.classId;
    const classData = {
      trackCategory: document.getElementById("class-trackCategory").value,
      classCode: document.getElementById("class-classCode").value.trim(),
      studyFormat: document.getElementById("class-studyFormat").value,
      schedule: document.getElementById("class-schedule").value.trim(),
      startDate: document.getElementById("class-startDate").value,
      cp1Date: document.getElementById("class-cp1Date").value,
      cp2Date: document.getElementById("class-cp2Date").value,
      demoDate: document.getElementById("class-demoDate").value,
      teacher: document.getElementById("class-teacher").value.trim(),
      ta: document.getElementById("class-ta").value.trim(),
      cs: document.getElementById("class-cs").value.trim(),
      status: document.getElementById("class-status").value
    };

    if (classId) {
      const idx = this.store.classes.findIndex(c => c.id === classId);
      if (idx !== -1) {
        this.store.classes[idx] = { ...this.store.classes[idx], ...classData };
        this.showToast("Cập nhật thông tin lớp học thành công!");
      }
    } else {
      // Check duplicate classCode
      if (this.store.classes.some(c => c.classCode === classData.classCode)) {
        alert(`Mã lớp "${classData.classCode}" đã tồn tại! Vui lòng chọn mã khác.`);
        return;
      }
      const newClass = {
        id: "cls-" + Date.now(),
        ...classData
      };
      this.store.classes.push(newClass);
      this.showToast("Thêm lớp học mới thành công!");
    }

    this.store.save();
    this.modalClass.classList.remove("open");
    this.render();
  }

  deleteClass(classId) {
    const cls = this.store.classes.find(c => c.id === classId);
    if (!cls) return;
    if (confirm(`Bạn có chắc muốn xóa lớp "${cls.classCode}" không?`)) {
      this.store.classes = this.store.classes.filter(c => c.id !== classId);
      this.store.save();
      this.render();
      this.showToast(`Đã xóa lớp ${cls.classCode}`);
    }
  }

  // ================= 3. TAB ATTENDANCE =================
  renderAttendance() {
    const classCode = this.selectedAttendanceClass;
    const curClass = this.store.classes.find(c => c.classCode === classCode);

    // Render Class meta header
    if (curClass) {
      const activeCount = this.store.getClassActiveCount(classCode);
      this.attendanceClassInfo.innerHTML = `
        <span class="class-info-pill"><b>Khối:</b> ${curClass.trackCategory}</span>
        <span class="class-info-pill"><b>Lịch học:</b> ${curClass.schedule || 'Chưa xếp'}</span>
        <span class="class-info-pill"><b>GV:</b> ${curClass.teacher || 'Chưa phân'}</span>
        <span class="class-info-pill"><b>TA:</b> ${curClass.ta || 'Chưa phân'}</span>
        <span class="class-info-pill"><b>CS:</b> ${curClass.cs || 'Chưa phân'}</span>
        <span class="class-info-pill"><b>Sĩ số Active:</b> ${activeCount}</span>
      `;
    } else {
      this.attendanceClassInfo.innerHTML = "";
    }

    // Get students of this class
    const classStudents = this.store.students.filter(s => s.classCode === classCode);

    if (classStudents.length === 0) {
      this.tbodyAttendance.innerHTML = `
        <tr>
          <td colspan="18" style="text-align: center; padding: 40px; color: #94a3b8;">
            Lớp <b>${classCode}</b> hiện chưa có học viên nào. Vui lòng thêm học viên ở Tab 1.
          </td>
        </tr>
      `;
      return;
    }

    // Render Attendance Rows
    this.tbodyAttendance.innerHTML = classStudents.map((s, idx) => {
      let absentCount = 0;
      let sessionCells = "";

      for (let sess = 1; sess <= 14; sess++) {
        const key = this.store.getAttKey(classCode, s.id, sess);
        const status = this.store.attendance[key] || "";

        let cellClass = "att-state-empty";
        let cellText = "-";

        if (status === "P") {
          cellClass = "att-state-present";
          cellText = "🟢 P";
        } else if (status === "L") {
          cellClass = "att-state-late";
          cellText = "🟡 L";
        } else if (status === "A") {
          cellClass = "att-state-absent";
          cellText = "🔴 A";
          absentCount++;
        } else if (status === "E") {
          cellClass = "att-state-excused";
          cellText = "🔵 E";
          absentCount++;
        }

        sessionCells += `
          <td class="att-cell ${cellClass}" title="Bấm để chuyển trạng thái (Có mặt / Trễ / Vắng không phép / Có phép / Trống)"
              onclick="app.cycleAttendanceState('${classCode}', '${s.id}', ${sess})">
            ${cellText}
          </td>
        `;
      }

      const countBadgeClass = absentCount >= 2 ? "att-count-high" : "";

      return `
        <tr data-student-id="${s.id}">
          <td class="col-num sticky-col">${idx + 1}</td>
          <td class="col-name sticky-col">${s.fullName}</td>
          <td class="sticky-col-2"><code>${s.classCode}</code></td>
          ${sessionCells}
          <td style="text-align:center;">
            <span class="att-count-badge ${countBadgeClass}">${absentCount} buổi</span>
          </td>
        </tr>
      `;
    }).join("");
  }

  // Cycle Attendance status on cell click: Empty -> P -> L -> A -> E -> Empty
  cycleAttendanceState(classCode, studentId, session) {
    const key = this.store.getAttKey(classCode, studentId, session);
    const curState = this.store.attendance[key] || "";
    let nextState = "";

    if (!curState) nextState = "P";
    else if (curState === "P") nextState = "L";
    else if (curState === "L") nextState = "A";
    else if (curState === "A") nextState = "E";
    else if (curState === "E") nextState = "";

    if (nextState) {
      this.store.attendance[key] = nextState;
    } else {
      delete this.store.attendance[key];
    }

    // Auto synchronize to makeup tab when status is A or E
    this.store.syncMakeupFromAttendance();
    this.store.save();

    this.renderAttendance();
    this.renderMakeup();

    // Tab badge
    document.getElementById("badge-makeup-count").textContent = this.store.makeup.length;

    const student = this.store.students.find(s => s.id === studentId);
    const label = nextState === "P" ? "Có mặt (P)" :
                  nextState === "L" ? "Đi trễ (L)" :
                  nextState === "A" ? "Vắng không phép (A) -> Đã đồng bộ sang Học bù!" :
                  nextState === "E" ? "Vắng có phép (E) -> Đã đồng bộ sang Học bù!" : "Đã xóa điểm danh";

    this.showToast(`${student ? student.fullName : 'Học viên'} (Buổi ${session}): ${label}`);
  }

  // ================= 4. TAB MAKEUP & MATERIALS =================
  renderMakeup() {
    const query = this.searchMakeup.value.toLowerCase().trim();
    const classFilter = this.filterMakeupClass.value;
    const statusFilter = this.filterMakeupStatus.value;

    const filtered = this.store.makeup.filter(m => {
      const matchQuery = !query ||
        m.studentName.toLowerCase().includes(query) ||
        m.classCode.toLowerCase().includes(query) ||
        (m.absent1Schedule && m.absent1Schedule.toLowerCase().includes(query)) ||
        (m.csNotes && m.csNotes.toLowerCase().includes(query));

      const matchClass = !classFilter || m.classCode === classFilter;

      let matchStatus = true;
      if (statusFilter === "pending") {
        matchStatus = (m.absent1Status !== "Đã bù") || (m.absent2Date && m.absent2Status !== "Đã bù");
      } else if (statusFilter === "completed") {
        matchStatus = (m.absent1Status === "Đã bù") && (!m.absent2Date || m.absent2Status === "Đã bù");
      }

      return matchQuery && matchClass && matchStatus;
    });

    if (filtered.length === 0) {
      this.tbodyMakeup.innerHTML = `
        <tr>
          <td colspan="12" style="text-align: center; padding: 40px; color: #94a3b8;">
            Hiện không có lịch học bù nào cần xử lý. Khi điểm danh tích vắng (🔴 hoặc 🔵), hệ thống sẽ tự động tạo bản ghi tại đây.
          </td>
        </tr>
      `;
      return;
    }

    this.tbodyMakeup.innerHTML = filtered.map((m, idx) => {
      return `
        <tr data-makeup-id="${m.id}">
          <td class="col-num sticky-col">${idx + 1}</td>
          <td class="col-name sticky-col"><strong>${m.studentName}</strong></td>
          <td class="sticky-col-2"><code>${m.classCode}</code></td>

          <!-- Đợt vắng 1 -->
          <td>
            <span class="badge badge-drop">${m.absent1Date || '-'}</span>
          </td>
          <td class="checkbox-center">
            <input type="checkbox" class="custom-checkbox" ${m.absent1SentDoc ? 'checked' : ''}
              onchange="app.toggleMakeupDoc('${m.id}', 1, this.checked)" title="Đã gửi slide/tài liệu buổi học bù">
          </td>
          <td>
            <input type="text" class="filter-select" style="width: 170px;" value="${m.absent1Schedule || ''}"
              placeholder="VD: CN (17:30 - Lớp GB03)" onchange="app.updateMakeupSchedule('${m.id}', 1, this.value)">
          </td>
          <td>
            <select class="filter-select" style="font-weight:600;" onchange="app.changeMakeupStatus('${m.id}', 1, this.value)">
              <option value="Chưa bù" ${m.absent1Status === 'Chưa bù' ? 'selected' : ''}>Chưa bù</option>
              <option value="Đã bù" ${m.absent1Status === 'Đã bù' ? 'selected' : ''}>Đã bù</option>
              <option value="Hủy bù" ${m.absent1Status === 'Hủy bù' ? 'selected' : ''}>Hủy bù</option>
            </select>
          </td>

          <!-- Đợt vắng 2 -->
          <td>
            ${m.absent2Date ? `<span class="badge badge-drop">${m.absent2Date}</span>` : '<span style="color:#cbd5e1;">-</span>'}
          </td>
          <td class="checkbox-center">
            ${m.absent2Date ? `
              <input type="checkbox" class="custom-checkbox" ${m.absent2SentDoc ? 'checked' : ''}
                onchange="app.toggleMakeupDoc('${m.id}', 2, this.checked)" title="Đã gửi slide/tài liệu đợt 2">
            ` : '<span style="color:#cbd5e1;">-</span>'}
          </td>
          <td>
            ${m.absent2Date ? `
              <input type="text" class="filter-select" style="width: 170px;" value="${m.absent2Schedule || ''}"
                placeholder="VD: T7 (19:30 - Thầy Minh)" onchange="app.updateMakeupSchedule('${m.id}', 2, this.value)">
            ` : '<span style="color:#cbd5e1;">-</span>'}
          </td>
          <td>
            ${m.absent2Date ? `
              <select class="filter-select" style="font-weight:600;" onchange="app.changeMakeupStatus('${m.id}', 2, this.value)">
                <option value="Chưa bù" ${m.absent2Status === 'Chưa bù' ? 'selected' : ''}>Chưa bù</option>
                <option value="Đã bù" ${m.absent2Status === 'Đã bù' ? 'selected' : ''}>Đã bù</option>
                <option value="Hủy bù" ${m.absent2Status === 'Hủy bù' ? 'selected' : ''}>Hủy bù</option>
              </select>
            ` : '<span style="color:#cbd5e1;">-</span>'}
          </td>

          <!-- Notes -->
          <td>
            <input type="text" class="filter-select" style="width: 220px;" value="${m.csNotes || ''}"
              placeholder="Ghi chú CS/GV..." onchange="app.updateMakeupNotes('${m.id}', this.value)">
          </td>

          <!-- Actions -->
          <td class="col-actions">
            <button class="btn-icon btn-delete" title="Xóa dòng học bù này" onclick="app.deleteMakeup('${m.id}')">
              <i data-lucide="trash-2"></i>
            </button>
          </td>
        </tr>
      `;
    }).join("");

    if (window.lucide) window.lucide.createIcons();
  }

  toggleMakeupDoc(makeupId, round, checked) {
    const item = this.store.makeup.find(m => m.id === makeupId);
    if (item) {
      if (round === 1) item.absent1SentDoc = checked;
      if (round === 2) item.absent2SentDoc = checked;
      this.store.save();
      this.showToast(`Đã cập nhật trạng thái gửi tài liệu đợt ${round}: ${checked ? 'Đã gửi' : 'Chưa gửi'}`);
    }
  }

  updateMakeupSchedule(makeupId, round, value) {
    const item = this.store.makeup.find(m => m.id === makeupId);
    if (item) {
      if (round === 1) item.absent1Schedule = value;
      if (round === 2) item.absent2Schedule = value;
      this.store.save();
      this.showToast(`Đã lưu lịch xếp học bù đợt ${round}`);
    }
  }

  changeMakeupStatus(makeupId, round, status) {
    const item = this.store.makeup.find(m => m.id === makeupId);
    if (item) {
      if (round === 1) item.absent1Status = status;
      if (round === 2) item.absent2Status = status;
      this.store.save();
      this.showToast(`Đã cập nhật hoàn thành bù đợt ${round}: ${status}`);
    }
  }

  updateMakeupNotes(makeupId, value) {
    const item = this.store.makeup.find(m => m.id === makeupId);
    if (item) {
      item.csNotes = value;
      this.store.save();
    }
  }

  deleteMakeup(id) {
    if (confirm("Bạn có chắc muốn xóa bản ghi theo dõi học bù này không?")) {
      this.store.makeup = this.store.makeup.filter(m => m.id !== id);
      this.store.save();
      this.renderMakeup();
      document.getElementById("badge-makeup-count").textContent = this.store.makeup.length;
      this.showToast("Đã xóa bản ghi học bù");
    }
  }

  openAddMakeupRecord() {
    const studentName = prompt("Nhập tên học viên cần xếp học bù:");
    if (!studentName) return;
    const classCode = prompt("Nhập mã lớp của học viên (ví dụ: TA-C4K-GB02-HB):", this.store.classes[0]?.classCode || "");
    const absentReason = prompt("Ngày vắng hoặc lý do vắng lần 1 (ví dụ: Buổi 3 ngày 21/03):", "Buổi 1");

    const newRec = {
      id: "mk-" + Date.now(),
      studentId: "manual-" + Date.now(),
      studentName: studentName.trim(),
      classCode: classCode.trim(),
      absent1Date: absentReason || "Buổi 1",
      absent1SentDoc: false,
      absent1Schedule: "",
      absent1Status: "Chưa bù",
      absent2Date: "",
      absent2SentDoc: false,
      absent2Schedule: "",
      absent2Status: "",
      csNotes: "Thêm thủ công"
    };

    this.store.makeup.unshift(newRec);
    this.store.save();
    this.renderMakeup();
    document.getElementById("badge-makeup-count").textContent = this.store.makeup.length;
    this.showToast("Đã thêm bản ghi theo dõi học bù!");
  }

  // ================= EXPORT & IMPORT =================
  exportToExcel() {
    if (typeof XLSX === "undefined") {
      alert("Đang tải thư viện Excel, vui lòng thử lại sau vài giây.");
      return;
    }

    const wb = XLSX.utils.book_new();

    // Sheet 1: Học viên
    const wsStudentsData = this.store.students.map((s, idx) => ({
      "STT": idx + 1,
      "Họ và tên học viên": s.fullName,
      "Số điện thoại": s.phone,
      "Họ tên phụ huynh": s.parentName,
      "Email liên hệ": s.email,
      "Lộ trình đăng ký": s.courseTrack,
      "Học phần": s.currentModule,
      "Mã khối": s.trackCategory,
      "Mã lớp": s.classCode,
      "Hình thức học": s.studyFormat,
      "Trạng thái học viên": s.status
    }));
    const wsStudents = XLSX.utils.json_to_sheet(wsStudentsData);
    XLSX.utils.book_append_sheet(wb, wsStudents, "Danh sách học viên");

    // Sheet 2: Danh sách lớp
    const wsClassesData = this.store.classes.map((c, idx) => {
      const activeCount = this.store.getClassActiveCount(c.classCode);
      return {
        "STT": idx + 1,
        "Mã khối": c.trackCategory,
        "Mã lớp": c.classCode,
        "Mô hình học": c.studyFormat,
        "Lịch học": c.schedule,
        "Ngày khai giảng": c.startDate,
        "Ngày CP1": c.cp1Date,
        "Ngày CP2": c.cp2Date,
        "Ngày Demo": c.demoDate,
        "Sĩ số Active": activeCount,
        "Tình trạng sĩ số": activeCount >= 6 ? "Đủ sĩ số" : "Thiếu sĩ số",
        "Giáo viên phụ trách": c.teacher,
        "Trợ giảng": c.ta,
        "CS phụ trách": c.cs,
        "Tình trạng lớp": c.status
      };
    });
    const wsClasses = XLSX.utils.json_to_sheet(wsClassesData);
    XLSX.utils.book_append_sheet(wb, wsClasses, "Danh sách lớp học");

    // Sheet 3: Học bù
    const wsMakeupData = this.store.makeup.map((m, idx) => ({
      "STT": idx + 1,
      "Tên học viên": m.studentName,
      "Mã lớp": m.classCode,
      "Ngày vắng lần 1": m.absent1Date,
      "Đã gửi tài liệu 1": m.absent1SentDoc ? "Có" : "Không",
      "Lịch bù lần 1": m.absent1Schedule,
      "Trạng thái bù 1": m.absent1Status,
      "Ngày vắng lần 2": m.absent2Date,
      "Đã gửi tài liệu 2": m.absent2SentDoc ? "Có" : "Không",
      "Lịch bù lần 2": m.absent2Schedule,
      "Trạng thái bù 2": m.absent2Status,
      "Ghi chú CS/GV": m.csNotes
    }));
    const wsMakeup = XLSX.utils.json_to_sheet(wsMakeupData);
    XLSX.utils.book_append_sheet(wb, wsMakeup, "Quản lý học bù");

    const fileName = `MindX_ThuanAn_Ops_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, fileName);
    this.showToast(`Đã xuất báo cáo: ${fileName}`);
  }

  handleFileImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.name.endsWith(".json")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (parsed.students && parsed.classes) {
            this.store.students = parsed.students;
            this.store.classes = parsed.classes;
            if (parsed.attendance) this.store.attendance = parsed.attendance;
            if (parsed.makeup) this.store.makeup = parsed.makeup;
            this.store.save();
            this.render();
            this.showToast("Nhập dữ liệu JSON thành công!");
          } else {
            alert("Định dạng file JSON không hợp lệ.");
          }
        } catch (err) {
          alert("Lỗi khi đọc file JSON: " + err.message);
        }
      };
      reader.readAsText(file);
    } else {
      // Excel file
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(firstSheet);
          if (rows.length > 0) {
            alert(`Đã nhận ${rows.length} dòng dữ liệu từ Excel.`);
          }
        } catch (err) {
          alert("Lỗi đọc file Excel: " + err.message);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  }
}

// Instantiate on DOM load
window.addEventListener("DOMContentLoaded", () => {
  window.app = new App();
});

