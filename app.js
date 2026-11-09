/**
 * MindX Thuận An - Sheet-Like Ops Management System Core Logic
 * Clean slate mode (No preset demo data - ready for full manual input by staff)
 * No placeholder hints in inputs
 */

// Blank initial datasets
const INITIAL_CLASSES = [];
const INITIAL_STUDENTS = [];
const INITIAL_ATTENDANCE = {};

// State Store
class Store {
  constructor() {
    this.classes = this.load("mx_ta_classes", INITIAL_CLASSES);
    this.students = this.load("mx_ta_students", INITIAL_STUDENTS);
    this.attendance = this.load("mx_ta_attendance", INITIAL_ATTENDANCE);
    this.makeup = this.load("mx_ta_makeup", []);
    this.waiting = this.load("mx_ta_waiting", []);
    this.reserve = this.load("mx_ta_reserve", []);

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
    localStorage.setItem("mx_ta_waiting", JSON.stringify(this.waiting));
    localStorage.setItem("mx_ta_reserve", JSON.stringify(this.reserve));
  }

  clearAll() {
    this.classes = [];
    this.students = [];
    this.attendance = {};
    this.makeup = [];
    this.waiting = [];
    this.reserve = [];
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
    const absencesMap = {};

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
      makeup: document.getElementById("tab-makeup"),
      waiting: document.getElementById("tab-waiting"),
      reserve: document.getElementById("tab-reserve")
    };

    // Header buttons
    this.btnAddRow = document.getElementById("btn-add-row");
    this.addBtnText = document.getElementById("add-btn-text");
    this.btnExportExcel = document.getElementById("btn-export-excel");
    this.btnImportExcel = document.getElementById("btn-import-excel");
    this.fileImport = document.getElementById("file-import");
    this.btnClearAll = document.getElementById("btn-clear-all");

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

    // Waiting (Chờ lớp)
    this.searchWaiting = document.getElementById("search-waiting");
    this.filterWaitingType = document.getElementById("filter-waiting-type");
    this.filterWaitingStatus = document.getElementById("filter-waiting-status");
    this.filterWaitingTime = document.getElementById("filter-waiting-time");
    this.tbodyWaiting = document.getElementById("tbody-waiting");
    this.waitingTableCount = document.getElementById("waiting-table-count");

    // Reserve (Bảo lưu)
    this.searchReserve = document.getElementById("search-reserve");
    this.filterReserveType = document.getElementById("filter-reserve-type");
    this.filterReserveStatus = document.getElementById("filter-reserve-status");
    this.filterReserveUrgency = document.getElementById("filter-reserve-urgency");
    this.tbodyReserve = document.getElementById("tbody-reserve");
    this.reserveTableCount = document.getElementById("reserve-table-count");

    // Modals
    this.modalStudent = document.getElementById("modal-student");
    this.formStudent = document.getElementById("form-student");
    this.modalClass = document.getElementById("modal-class");
    this.formClass = document.getElementById("form-class");
    this.modalWaiting = document.getElementById("modal-waiting");
    this.formWaiting = document.getElementById("form-waiting");
    this.modalReserve = document.getElementById("modal-reserve");
    this.formReserve = document.getElementById("form-reserve");
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
      } else if (this.currentTab === "waiting") {
        this.openWaitingModal();
      } else if (this.currentTab === "reserve") {
        this.openReserveModal();
      }
    });

    // Clear all tables to start 100% fresh
    this.btnClearAll.addEventListener("click", () => {
      if (confirm("Chị có chắc chắn muốn xóa trắng tất cả dữ liệu để nhập lại từ đầu không?")) {
        this.store.clearAll();
        this.render();
        this.showToast("Đã xóa trắng dữ liệu. Chị có thể bắt đầu nhập mới!");
      }
    });

    // Export Excel
    this.btnExportExcel.addEventListener("click", () => this.exportToExcel());

    // Import Excel/JSON
    if (this.btnImportExcel) this.btnImportExcel.addEventListener("click", () => this.fileImport.click());
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

    // Waiting filters
    [this.searchWaiting, this.filterWaitingType, this.filterWaitingStatus, this.filterWaitingTime].forEach(el => {
      if (el) el.addEventListener("input", () => this.renderWaiting());
    });

    // Reserve filters
    [this.searchReserve, this.filterReserveType, this.filterReserveStatus, this.filterReserveUrgency].forEach(el => {
      if (el) el.addEventListener("input", () => this.renderReserve());
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
    if (this.formWaiting) this.formWaiting.addEventListener("submit", (e) => this.handleWaitingSubmit(e));
    if (this.formReserve) this.formReserve.addEventListener("submit", (e) => this.handleReserveSubmit(e));
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
    } else if (tab === "waiting") {
      this.btnAddRow.style.display = "inline-flex";
      this.addBtnText.textContent = "Thêm Học Viên Chờ";
    } else if (tab === "reserve") {
      this.btnAddRow.style.display = "inline-flex";
      this.addBtnText.textContent = "Thêm Hồ Sơ Bảo Lưu";
    } else {
      this.btnAddRow.style.display = "none";
    }

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
    this.renderWaiting();
    this.renderReserve();

    // Update tab badges
    document.getElementById("badge-students-count").textContent = this.store.students.length;
    document.getElementById("badge-classes-count").textContent = this.store.classes.length;
    document.getElementById("badge-makeup-count").textContent = this.store.makeup.length;
    if (document.getElementById("badge-waiting-count")) {
      document.getElementById("badge-waiting-count").textContent = this.store.waiting ? this.store.waiting.length : 0;
    }
    if (document.getElementById("badge-reserve-count")) {
      document.getElementById("badge-reserve-count").textContent = this.store.reserve ? this.store.reserve.length : 0;
    }

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
    if (classCodes.length > 0) {
      modalStdClass.innerHTML = classCodes.map(code => `<option value="${code}">${code}</option>`).join("");
    } else {
      modalStdClass.innerHTML = `<option value="">(Chưa tạo lớp - vui lòng tạo lớp trước)</option>`;
    }

    // Attendance class selector
    if (!classCodes.includes(this.selectedAttendanceClass) && classCodes.length > 0) {
      this.selectedAttendanceClass = classCodes[0];
    } else if (classCodes.length === 0) {
      this.selectedAttendanceClass = "";
    }

    this.selectAttendanceClass.innerHTML = classCodes.length > 0
      ? classCodes.map(code => `<option value="${code}" ${code === this.selectedAttendanceClass ? 'selected' : ''}>${code}</option>`).join("")
      : `<option value="">(Chưa có lớp nào)</option>`;

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

    const filtered = this.store.students.filter(s => {
      const matchQuery = !query ||
        s.fullName.toLowerCase().includes(query) ||
        (s.phone && s.phone.includes(query)) ||
        (s.parentName && s.parentName.toLowerCase().includes(query)) ||
        (s.email && s.email.toLowerCase().includes(query)) ||
        (s.classCode && s.classCode.toLowerCase().includes(query));

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

    if (filtered.length === 0) {
      this.tbodyStudents.innerHTML = `<tr><td colspan="12" style="text-align: center; padding: 40px; color: #64748b; font-weight:600;">Chưa có dữ liệu học viên. Chị Vy bấm nút <b>"Thêm Học Viên"</b> ở góc trên bên phải để bắt đầu nhập.</td></tr>`;
      return;
    }

    this.tbodyStudents.innerHTML = filtered.map((s, idx) => {
      const trackBadge = s.trackCategory === "Coding" ? "badge-coding" : "badge-robotics";
      return `
        <tr data-student-id="${s.id}">
          <td class="col-num sticky-col">${idx + 1}</td>
          <td class="col-name sticky-col">
            <span class="cell-editable" title="Bấm để sửa nhanh họ tên" onclick="app.editStudentName('${s.id}')">${s.fullName}</span>
          </td>
          <td>${s.phone || '-'}</td>
          <td>${s.parentName || '-'}</td>
          <td>${s.email || '-'}</td>
          <td>${s.courseTrack || '-'}</td>
          <td><strong>${s.currentModule || '-'}</strong></td>
          <td><span class="badge ${trackBadge}">${s.trackCategory}</span></td>
          <td><code>${s.classCode || '-'}</code></td>
          <td>${s.studyFormat}</td>
          <td>
            <select class="filter-select" style="padding: 2px 6px; font-weight:700;" onchange="app.changeStudentStatus('${s.id}', this.value)">
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
              <button class="btn-icon" title="Sửa thông tin" onclick="app.openStudentModal('${s.id}')"><i data-lucide="edit-3"></i></button>
              <button class="btn-icon btn-delete" title="Xóa học viên" onclick="app.deleteStudent('${s.id}')"><i data-lucide="trash-2"></i></button>
            </div>
          </td>
        </tr>
      `;
    }).join("");

    if (window.lucide) window.lucide.createIcons();
  }

  changeStudentStatus(studentId, newStatus) {
    const student = this.store.students.find(s => s.id === studentId);
    if (student) {
      student.status = newStatus;
      this.store.save();
      this.renderStudents();
      this.renderClasses();
      this.showToast(`Đã cập nhật trạng thái: ${student.fullName} -> ${newStatus}`);
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
      this.showToast("Đã cập nhật họ tên học viên!");
    }
  }

  openStudentModal(studentId = null) {
    const title = document.getElementById("modal-student-title");
    const form = this.formStudent;
    form.reset();

    if (this.store.classes.length === 0) {
      if (confirm("Hiện chưa có lớp học nào trong hệ thống. Chị có muốn tạo lớp học trước không?")) {
        this.switchTab("classes");
        this.openClassModal();
        return;
      }
    }

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
      const index = this.store.students.findIndex(s => s.id === id);
      if (index !== -1) {
        this.store.students[index] = { ...this.store.students[index], ...studentData };
        this.showToast("Cập nhật học viên thành công!");
      }
    } else {
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
    if (confirm(`Chị có chắc muốn xóa học viên "${student.fullName}" không?`)) {
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
      const targetCapacity = c.maxCapacity ? parseInt(c.maxCapacity) : 6;
      const isFull = activeCount >= targetCapacity;
      let matchCapacity = true;
      if (capacityFilter === "Đủ sĩ số") matchCapacity = isFull;
      if (capacityFilter === "Thiếu sĩ số") matchCapacity = !isFull;

      return matchQuery && matchStatus && matchTrack && matchCapacity;
    });

    const total = this.store.classes.length;
    const running = this.store.classes.filter(c => c.status === "Running").length;
    const pending = this.store.classes.filter(c => c.status === "Chờ lớp").length;
    const finished = this.store.classes.filter(c => c.status === "Finished").length;
    const full = this.store.classes.filter(c => {
      const target = c.maxCapacity ? parseInt(c.maxCapacity) : 6;
      return this.store.getClassActiveCount(c.classCode) >= target;
    }).length;
    const low = total - full;

    document.getElementById("metric-total-classes").textContent = total;
    document.getElementById("metric-running-classes").textContent = running;
    document.getElementById("metric-pending-classes").textContent = pending;
    document.getElementById("metric-finished-classes").textContent = finished;
    document.getElementById("metric-full-classes").textContent = full;
    document.getElementById("metric-low-classes").textContent = low;

    this.classesTableCount.textContent = `Hiển thị ${filtered.length} / ${total} lớp`;

    if (filtered.length === 0) {
      this.tbodyClasses.innerHTML = `<tr><td colspan="15" style="text-align: center; padding: 40px; color: #64748b; font-weight:600;">Chưa có lớp học nào trong hệ thống. Chị Vy bấm nút <b>"Thêm Lớp Học"</b> để bắt đầu tạo lớp.</td></tr>`;
      return;
    }

    this.tbodyClasses.innerHTML = filtered.map((c, idx) => {
      const activeCount = this.store.getClassActiveCount(c.classCode);
      const targetCapacity = c.maxCapacity ? parseInt(c.maxCapacity) : 6;
      const isFull = activeCount >= targetCapacity;
      const capacityBadge = isFull
        ? `<span class="badge badge-full">Đủ sĩ số (${activeCount}/${targetCapacity})</span>`
        : `<span class="badge badge-low">Thiếu sĩ số (${activeCount}/${targetCapacity})</span>`;

      const trackBadge = c.trackCategory === "Coding" ? "badge-coding" : "badge-robotics";

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
      document.getElementById("class-maxCapacity").value = c.maxCapacity || "";
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
      maxCapacity: document.getElementById("class-maxCapacity").value ? parseInt(document.getElementById("class-maxCapacity").value) : 6,
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
      if (this.store.classes.some(c => c.classCode === classData.classCode)) {
        alert(`Mã lớp "${classData.classCode}" đã tồn tại! Vui lòng nhập mã lớp khác.`);
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
    if (confirm(`Chị có chắc muốn xóa lớp "${cls.classCode}" không?`)) {
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

    // Dynamic Checkpoint milestones per track:
    // Chỉ hiển thị mốc CP khi ĐÃ CHỌN LỚP CỤ THỂ!
    // Nếu chưa chọn lớp (hoặc chưa có lớp): Hiển thị bình thường B1 -> B14 không tô màu CP.
    const isRobotics = curClass && curClass.trackCategory === "Robotics";
    const isCoding = curClass && curClass.trackCategory === "Coding";
    const cp1Session = isRobotics ? 4 : (isCoding ? 5 : null);
    const cp2Session = isRobotics ? 8 : (isCoding ? 9 : null);

    // Render Dynamic Thead based on selected class category
    const theadTr = document.getElementById("attendance-thead-tr");
    if (theadTr) {
      let thSessions = "";
      for (let s = 1; s <= 14; s++) {
        let label = `B${s}`;
        let sub = `Buổi ${s}`;
        let highlightClass = "";

        if (curClass) {
          if (s === cp1Session) {
            label = `B${s} (CP1)`;
            sub = "Checkpoint 1";
            highlightClass = " style='background-color:#fef3c7; color:#b45309; border-bottom:3px solid #f59e0b;'";
          } else if (s === cp2Session) {
            label = `B${s} (CP2)`;
            sub = "Checkpoint 2";
            highlightClass = " style='background-color:#e0f2fe; color:#0284c7; border-bottom:3px solid #0284c7;'";
          } else if (s === 14) {
            label = `B14 (Demo)`;
            sub = "Demo Day";
            highlightClass = " style='background-color:#fce7f3; color:#be185d; border-bottom:3px solid #db2777;'";
          }
        }

        thSessions += `<th class="col-session"${highlightClass}>${label}<span class="session-date">${sub}</span></th>`;
      }

      theadTr.innerHTML = `
        <th class="col-num sticky-col">#</th>
        <th class="col-name sticky-col">Họ và tên học viên</th>
        <th class="sticky-col-2">Mã lớp</th>
        ${thSessions}
        <th>Tổng vắng</th>
      `;
    }

    if (curClass) {
      const activeCount = this.store.getClassActiveCount(classCode);
      const targetCapacity = curClass.maxCapacity ? parseInt(curClass.maxCapacity) : 6;
      const trackBadge = curClass.trackCategory === "Coding" ? "badge-coding" : "badge-robotics";
      const cpNote = isRobotics 
        ? "🤖 <b>Robotics:</b> CP1 (Buổi 4) | CP2 (Buổi 8) | Demo (Buổi 14)" 
        : "💻 <b>Coding:</b> CP1 (Buổi 5) | CP2 (Buổi 9) | Demo (Buổi 14)";

      this.attendanceClassInfo.innerHTML = `
        <span class="class-info-pill"><span class="badge ${trackBadge}">${curClass.trackCategory}</span></span>
        <span class="class-info-pill"><b>Lịch học:</b> ${curClass.schedule || 'Chưa xếp'}</span>
        <span class="class-info-pill"><b>GV:</b> ${curClass.teacher || 'Chưa phân'}</span>
        <span class="class-info-pill"><b>TA:</b> ${curClass.ta || 'Chưa phân'}</span>
        <span class="class-info-pill"><b>CS:</b> ${curClass.cs || 'Chưa phân'}</span>
        <span class="class-info-pill"><b>Sĩ số:</b> ${activeCount}/${targetCapacity}</span>
        <span class="class-info-pill" style="color: #b91c1c; background:#fef2f2; border-color:#fecaca;">${cpNote}</span>
      `;
    } else {
      this.attendanceClassInfo.innerHTML = "";
    }

    if (!classCode) {
      this.tbodyAttendance.innerHTML = `
        <tr>
          <td colspan="18" style="text-align: center; padding: 40px; color: #64748b; font-weight:600;">
            Chưa có lớp nào được chọn. Chị Vy vui lòng tạo lớp học ở Tab 2 trước.
          </td>
        </tr>
      `;
      return;
    }

    const classStudents = this.store.students.filter(s => s.classCode === classCode);

    if (classStudents.length === 0) {
      this.tbodyAttendance.innerHTML = `
        <tr>
          <td colspan="18" style="text-align: center; padding: 40px; color: #64748b; font-weight:600;">
            Lớp <b>${classCode}</b> hiện chưa có học viên nào. Chị Vy qua Tab 1 để thêm học viên vào lớp này nhé.
          </td>
        </tr>
      `;
      return;
    }

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
          <td class="att-cell ${cellClass}" title="Bấm để chuyển: Có mặt -> Đi trễ -> Vắng ko phép -> Vắng có phép -> Trống"
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

    this.store.syncMakeupFromAttendance();
    this.store.save();

    this.renderAttendance();
    this.renderMakeup();

    document.getElementById("badge-makeup-count").textContent = this.store.makeup.length;

    const student = this.store.students.find(s => s.id === studentId);
    const label = nextState === "P" ? "Có mặt (P)" :
                  nextState === "L" ? "Đi trễ (L)" :
                  nextState === "A" ? "Vắng không phép (A) -> Đã chuyển sang Học Bù!" :
                  nextState === "E" ? "Vắng có phép (E) -> Đã chuyển sang Học Bù!" : "Đã xóa";

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
          <td colspan="12" style="text-align: center; padding: 40px; color: #64748b; font-weight:600;">
            Chưa có buổi học bù nào cần xếp lịch. Khi điểm danh ở Tab 3 tích vắng (🔴 hoặc 🔵), hệ thống sẽ tự động tạo bản ghi tại đây.
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
              onchange="app.toggleMakeupDoc('${m.id}', 1, this.checked)">
          </td>
          <td>
            <input type="text" class="filter-select" style="width: 170px;" value="${m.absent1Schedule || ''}"
              onchange="app.updateMakeupSchedule('${m.id}', 1, this.value)">
          </td>
          <td>
            <select class="filter-select" style="font-weight:700;" onchange="app.changeMakeupStatus('${m.id}', 1, this.value)">
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
                onchange="app.toggleMakeupDoc('${m.id}', 2, this.checked)">
            ` : '<span style="color:#cbd5e1;">-</span>'}
          </td>
          <td>
            ${m.absent2Date ? `
              <input type="text" class="filter-select" style="width: 170px;" value="${m.absent2Schedule || ''}"
                onchange="app.updateMakeupSchedule('${m.id}', 2, this.value)">
            ` : '<span style="color:#cbd5e1;">-</span>'}
          </td>
          <td>
            ${m.absent2Date ? `
              <select class="filter-select" style="font-weight:700;" onchange="app.changeMakeupStatus('${m.id}', 2, this.value)">
                <option value="Chưa bù" ${m.absent2Status === 'Chưa bù' ? 'selected' : ''}>Chưa bù</option>
                <option value="Đã bù" ${m.absent2Status === 'Đã bù' ? 'selected' : ''}>Đã bù</option>
                <option value="Hủy bù" ${m.absent2Status === 'Hủy bù' ? 'selected' : ''}>Hủy bù</option>
              </select>
            ` : '<span style="color:#cbd5e1;">-</span>'}
          </td>

          <!-- Notes -->
          <td>
            <input type="text" class="filter-select" style="width: 220px;" value="${m.csNotes || ''}"
              onchange="app.updateMakeupNotes('${m.id}', this.value)">
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
      this.showToast(`Đã lưu trạng thái gửi tài liệu đợt ${round}`);
    }
  }

  updateMakeupSchedule(makeupId, round, value) {
    const item = this.store.makeup.find(m => m.id === makeupId);
    if (item) {
      if (round === 1) item.absent1Schedule = value;
      if (round === 2) item.absent2Schedule = value;
      this.store.save();
      this.showToast(`Đã lưu lịch bù đợt ${round}`);
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
    if (confirm("Chị có chắc muốn xóa bản ghi theo dõi học bù này không?")) {
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
    const classCode = prompt("Nhập mã lớp của học viên:", this.store.classes[0]?.classCode || "");
    const absentReason = prompt("Ngày vắng hoặc lý do vắng lần 1:", "Buổi 1");

    const newRec = {
      id: "mk-" + Date.now(),
      studentId: "manual-" + Date.now(),
      studentName: studentName.trim(),
      classCode: classCode ? classCode.trim() : "",
      absent1Date: absentReason || "Buổi 1",
      absent1SentDoc: false,
      absent1Schedule: "",
      absent1Status: "Chưa bù",
      absent2Date: "",
      absent2SentDoc: false,
      absent2Schedule: "",
      absent2Status: "",
      csNotes: ""
    };

    this.store.makeup.unshift(newRec);
    this.store.save();
    this.renderMakeup();
    document.getElementById("badge-makeup-count").textContent = this.store.makeup.length;
    this.showToast("Đã thêm bản ghi học bù!");
  }

  // ================= 5. TAB WAITING (CHỜ LỚP NEW / LEVEL UP) =================
  renderWaiting() {
    if (!this.tbodyWaiting) return;
    const query = (this.searchWaiting ? this.searchWaiting.value : "").toLowerCase().trim();
    const typeFilter = this.filterWaitingType ? this.filterWaitingType.value : "";
    const statusFilter = this.filterWaitingStatus ? this.filterWaitingStatus.value : "";
    const timeFilter = this.filterWaitingTime ? this.filterWaitingTime.value : "";

    const waitingList = this.store.waiting || [];

    const filtered = waitingList.filter(item => {
      const matchQuery = !query ||
        (item.fullName && item.fullName.toLowerCase().includes(query)) ||
        (item.phone && item.phone.toLowerCase().includes(query)) ||
        (item.parentName && item.parentName.toLowerCase().includes(query)) ||
        (item.email && item.email.toLowerCase().includes(query)) ||
        (item.courseTrack && item.courseTrack.toLowerCase().includes(query)) ||
        (item.subject && item.subject.toLowerCase().includes(query));

      const matchType = !typeFilter || item.type === typeFilter;
      const matchStatus = !statusFilter || item.status === statusFilter;
      const matchTime = !timeFilter || item.timeCategory === timeFilter;

      return matchQuery && matchType && matchStatus && matchTime;
    });

    // Update metrics
    const total = waitingList.length;
    const c12w = waitingList.filter(w => w.timeCategory === "Học viên đã Chờ 1 - 2 tuần").length;
    const c34w = waitingList.filter(w => w.timeCategory === "Học viên đã Chờ 3 - 4 tuần").length;
    const cOver1m = waitingList.filter(w => w.timeCategory === "Học viên đã Chờ hơn 1 tháng").length;
    const placed = waitingList.filter(w => w.status === "Đã vào lớp" || w.status === "Đã xếp lớp").length;

    if (document.getElementById("metric-waiting-total")) document.getElementById("metric-waiting-total").textContent = total;
    if (document.getElementById("metric-waiting-1-2w")) document.getElementById("metric-waiting-1-2w").textContent = c12w;
    if (document.getElementById("metric-waiting-3-4w")) document.getElementById("metric-waiting-3-4w").textContent = c34w;
    if (document.getElementById("metric-waiting-over1m")) document.getElementById("metric-waiting-over1m").textContent = cOver1m;
    if (document.getElementById("metric-waiting-placed")) document.getElementById("metric-waiting-placed").textContent = placed;

    if (this.waitingTableCount) {
      this.waitingTableCount.textContent = `Hiển thị ${filtered.length} / ${total} học viên`;
    }

    if (filtered.length === 0) {
      this.tbodyWaiting.innerHTML = `<tr><td colspan="14" style="text-align: center; padding: 40px; color: #64748b; font-weight:600;">Chưa có học viên nào trong danh sách chờ lớp. Bấm nút <b>"Thêm Học Viên Chờ"</b> để tạo hồ sơ mới.</td></tr>`;
      return;
    }

    this.tbodyWaiting.innerHTML = filtered.map((item, idx) => {
      const typeBadge = item.type === "Chờ lớp New" ? "badge-coding" : "badge-robotics";
      let statusBadge = "badge-low";
      if (item.status === "Đã vào lớp" || item.status === "Đã xếp lớp") statusBadge = "badge-full";
      if (item.status === "Ngừng học") statusBadge = "badge-neutral";

      let timeBadgeClass = "badge-low";
      if (item.timeCategory === "Học viên đã Chờ 1 - 2 tuần") timeBadgeClass = "badge-coding";
      if (item.timeCategory === "Học viên đã Chờ 3 - 4 tuần") timeBadgeClass = "badge-robotics";

      return `
        <tr data-waiting-id="${item.id}">
          <td class="col-num sticky-col">${idx + 1}</td>
          <td class="sticky-col"><span class="badge ${typeBadge}">${item.type || 'Chờ lớp'}</span></td>
          <td class="col-name sticky-col-2"><strong>${item.fullName || '-'}</strong></td>
          <td>${item.phone || '-'}</td>
          <td>${item.parentName || '-'}</td>
          <td>${item.email || '-'}</td>
          <td>${item.courseTrack || '-'}</td>
          <td><span class="badge" style="background:#e0e7ff; color:#3730a3; font-weight:900;">${item.subject || '-'}</span></td>
          <td>${item.startDate || '-'}</td>
          <td>${item.endDate || '-'}</td>
          <td><span class="badge ${statusBadge}">${item.status || 'Đang đợi lớp'}</span></td>
          <td><span class="badge ${timeBadgeClass}">${item.timeCategory || '-'}</span></td>
          <td style="max-width: 200px; white-space: normal;">${item.note || '-'}</td>
          <td class="col-actions">
            <div class="row-actions">
              <button class="btn-icon" title="Chỉnh sửa" onclick="app.openWaitingModal('${item.id}')"><i data-lucide="edit-3"></i></button>
              <button class="btn-icon btn-delete" title="Xóa" onclick="app.deleteWaiting('${item.id}')"><i data-lucide="trash-2"></i></button>
            </div>
          </td>
        </tr>
      `;
    }).join("");

    if (window.lucide) window.lucide.createIcons();
  }

  openWaitingModal(id = null) {
    if (!this.formWaiting) return;
    const title = document.getElementById("modal-waiting-title");
    this.formWaiting.reset();

    if (id) {
      const item = (this.store.waiting || []).find(w => w.id === id);
      if (!item) return;
      title.textContent = "Chỉnh Sửa Hồ Sơ Chờ Lớp";
      document.getElementById("waiting-id").value = item.id;
      document.getElementById("waiting-type").value = item.type || "Chờ lớp New";
      document.getElementById("waiting-fullName").value = item.fullName || "";
      document.getElementById("waiting-phone").value = item.phone || "";
      document.getElementById("waiting-parentName").value = item.parentName || "";
      document.getElementById("waiting-email").value = item.email || "";
      document.getElementById("waiting-courseTrack").value = item.courseTrack || "";
      document.getElementById("waiting-subject").value = item.subject || "pre";
      document.getElementById("waiting-startDate").value = item.startDate || "";
      document.getElementById("waiting-endDate").value = item.endDate || "";
      document.getElementById("waiting-status").value = item.status || "Đang đợi lớp";
      document.getElementById("waiting-timeCategory").value = item.timeCategory || "Học viên đã Chờ 1 - 2 tuần";
      document.getElementById("waiting-note").value = item.note || "";
    } else {
      title.textContent = "Thêm Học Viên Chờ Lớp";
      document.getElementById("waiting-id").value = "";
    }

    this.modalWaiting.classList.add("open");
  }

  handleWaitingSubmit(e) {
    e.preventDefault();
    const id = document.getElementById("waiting-id").value;
    const data = {
      type: document.getElementById("waiting-type").value,
      fullName: document.getElementById("waiting-fullName").value.trim(),
      phone: document.getElementById("waiting-phone").value.trim(),
      parentName: document.getElementById("waiting-parentName").value.trim(),
      email: document.getElementById("waiting-email").value.trim(),
      courseTrack: document.getElementById("waiting-courseTrack").value.trim(),
      subject: document.getElementById("waiting-subject").value,
      startDate: document.getElementById("waiting-startDate").value,
      endDate: document.getElementById("waiting-endDate").value,
      status: document.getElementById("waiting-status").value,
      timeCategory: document.getElementById("waiting-timeCategory").value,
      note: document.getElementById("waiting-note").value.trim()
    };

    if (!this.store.waiting) this.store.waiting = [];

    if (id) {
      const idx = this.store.waiting.findIndex(w => w.id === id);
      if (idx !== -1) {
        this.store.waiting[idx] = { ...this.store.waiting[idx], ...data };
        this.showToast("Cập nhật hồ sơ chờ lớp thành công!");
      }
    } else {
      const newRec = {
        id: "wt-" + Date.now(),
        ...data
      };
      this.store.waiting.unshift(newRec);
      this.showToast("Thêm học viên chờ lớp thành công!");
    }

    this.store.save();
    this.modalWaiting.classList.remove("open");
    this.render();
  }

  deleteWaiting(id) {
    if (confirm("Chị có chắc chắn muốn xóa học viên khỏi danh sách chờ lớp?")) {
      this.store.waiting = (this.store.waiting || []).filter(w => w.id !== id);
      this.store.save();
      this.render();
      this.showToast("Đã xóa học viên chờ lớp");
    }
  }

  // ================= 6. TAB RESERVE (BẢO LƯU HỌC VIÊN) =================
  calcReserveUrgency(endDateStr, status) {
    if (status === "Đã đi học lại" || status === "Nghỉ ngang") {
      return status;
    }
    if (!endDateStr) return "Còn hạn";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(endDateStr);
    if (isNaN(end.getTime())) return "Còn hạn";

    const diffDays = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return "Quá hạn";
    if (diffDays <= 15) return "Sắp tới hạn";
    return "Còn hạn";
  }

  renderReserve() {
    if (!this.tbodyReserve) return;
    const query = (this.searchReserve ? this.searchReserve.value : "").toLowerCase().trim();
    const typeFilter = this.filterReserveType ? this.filterReserveType.value : "";
    const statusFilter = this.filterReserveStatus ? this.filterReserveStatus.value : "";
    const urgencyFilter = this.filterReserveUrgency ? this.filterReserveUrgency.value : "";

    const reserveList = this.store.reserve || [];

    const filtered = reserveList.filter(item => {
      const matchQuery = !query ||
        (item.fullName && item.fullName.toLowerCase().includes(query)) ||
        (item.classCode && item.classCode.toLowerCase().includes(query)) ||
        (item.phone && item.phone.toLowerCase().includes(query)) ||
        (item.parentName && item.parentName.toLowerCase().includes(query)) ||
        (item.email && item.email.toLowerCase().includes(query)) ||
        (item.courseTrack && item.courseTrack.toLowerCase().includes(query));

      const matchType = !typeFilter || item.type === typeFilter;
      const matchStatus = !statusFilter || item.status === statusFilter;
      const urgency = this.calcReserveUrgency(item.endDate, item.status);
      const matchUrgency = !urgencyFilter || urgency === urgencyFilter;

      return matchQuery && matchType && matchStatus && matchUrgency;
    });

    // Update metrics
    const total = reserveList.length;
    const active = reserveList.filter(r => r.status === "Đang bảo lưu" && this.calcReserveUrgency(r.endDate, r.status) === "Còn hạn").length;
    const nearExpire = reserveList.filter(r => r.status === "Đang bảo lưu" && this.calcReserveUrgency(r.endDate, r.status) === "Sắp tới hạn").length;
    const expired = reserveList.filter(r => r.status === "Đang bảo lưu" && this.calcReserveUrgency(r.endDate, r.status) === "Quá hạn").length;
    const rejoined = reserveList.filter(r => r.status === "Đã đi học lại").length;

    if (document.getElementById("metric-reserve-tab-total")) document.getElementById("metric-reserve-tab-total").textContent = total;
    if (document.getElementById("metric-reserve-active")) document.getElementById("metric-reserve-active").textContent = active;
    if (document.getElementById("metric-reserve-near-expire")) document.getElementById("metric-reserve-near-expire").textContent = nearExpire;
    if (document.getElementById("metric-reserve-expired")) document.getElementById("metric-reserve-expired").textContent = expired;
    if (document.getElementById("metric-reserve-rejoined")) document.getElementById("metric-reserve-rejoined").textContent = rejoined;

    if (this.reserveTableCount) {
      this.reserveTableCount.textContent = `Hiển thị ${filtered.length} / ${total} học viên`;
    }

    if (filtered.length === 0) {
      this.tbodyReserve.innerHTML = `<tr><td colspan="14" style="text-align: center; padding: 40px; color: #64748b; font-weight:600;">Chưa có hồ sơ bảo lưu nào. Bấm nút <b>"Thêm Hồ Sơ Bảo Lưu"</b> để tạo mới.</td></tr>`;
      return;
    }

    this.tbodyReserve.innerHTML = filtered.map((item, idx) => {
      const typeBadge = item.type === "Bảo lưu vượt hạn" ? "badge-low" : "badge-neutral";
      let statusBadge = "badge-coding";
      if (item.status === "Đã đi học lại") statusBadge = "badge-full";
      if (item.status === "Nghỉ ngang") statusBadge = "badge-low";

      const urgency = this.calcReserveUrgency(item.endDate, item.status);
      let urgencyBadge = "badge-full";
      if (urgency === "Sắp tới hạn") urgencyBadge = "badge-low";
      if (urgency === "Quá hạn") urgencyBadge = "badge-low";

      return `
        <tr data-reserve-id="${item.id}">
          <td class="col-num sticky-col">${idx + 1}</td>
          <td class="col-name sticky-col"><strong>${item.fullName || '-'}</strong></td>
          <td class="sticky-col-2"><strong>${item.classCode || '-'}</strong></td>
          <td>${item.phone || '-'}</td>
          <td>${item.parentName || '-'}</td>
          <td>${item.email || '-'}</td>
          <td>${item.courseTrack || '-'}</td>
          <td><span class="badge ${typeBadge}">${item.type || 'Bảo lưu thường'}</span></td>
          <td><span class="badge ${statusBadge}">${item.status || 'Đang bảo lưu'}</span></td>
          <td>${item.startDate || '-'}</td>
          <td>${item.endDate || '-'}</td>
          <td><span class="badge ${urgencyBadge}">${urgency}</span></td>
          <td style="max-width: 200px; white-space: normal;">${item.note || '-'}</td>
          <td class="col-actions">
            <div class="row-actions">
              <button class="btn-icon" title="Chỉnh sửa" onclick="app.openReserveModal('${item.id}')"><i data-lucide="edit-3"></i></button>
              <button class="btn-icon btn-delete" title="Xóa" onclick="app.deleteReserve('${item.id}')"><i data-lucide="trash-2"></i></button>
            </div>
          </td>
        </tr>
      `;
    }).join("");

    if (window.lucide) window.lucide.createIcons();
  }

  openReserveModal(id = null) {
    if (!this.formReserve) return;
    const title = document.getElementById("modal-reserve-title");
    this.formReserve.reset();

    if (id) {
      const item = (this.store.reserve || []).find(r => r.id === id);
      if (!item) return;
      title.textContent = "Chỉnh Sửa Hồ Sơ Bảo Lưu";
      document.getElementById("reserve-id").value = item.id;
      document.getElementById("reserve-fullName").value = item.fullName || "";
      document.getElementById("reserve-classCode").value = item.classCode || "";
      document.getElementById("reserve-phone").value = item.phone || "";
      document.getElementById("reserve-parentName").value = item.parentName || "";
      document.getElementById("reserve-email").value = item.email || "";
      document.getElementById("reserve-courseTrack").value = item.courseTrack || "";
      document.getElementById("reserve-type").value = item.type || "Bảo lưu thường";
      document.getElementById("reserve-status").value = item.status || "Đang bảo lưu";
      document.getElementById("reserve-startDate").value = item.startDate || "";
      document.getElementById("reserve-endDate").value = item.endDate || "";
      document.getElementById("reserve-note").value = item.note || "";
    } else {
      title.textContent = "Thêm Hồ Sơ Bảo Lưu";
      document.getElementById("reserve-id").value = "";
    }

    this.modalReserve.classList.add("open");
  }

  handleReserveSubmit(e) {
    e.preventDefault();
    const id = document.getElementById("reserve-id").value;
    const data = {
      fullName: document.getElementById("reserve-fullName").value.trim(),
      classCode: document.getElementById("reserve-classCode").value.trim(),
      phone: document.getElementById("reserve-phone").value.trim(),
      parentName: document.getElementById("reserve-parentName").value.trim(),
      email: document.getElementById("reserve-email").value.trim(),
      courseTrack: document.getElementById("reserve-courseTrack").value.trim(),
      type: document.getElementById("reserve-type").value,
      status: document.getElementById("reserve-status").value,
      startDate: document.getElementById("reserve-startDate").value,
      endDate: document.getElementById("reserve-endDate").value,
      note: document.getElementById("reserve-note").value.trim()
    };

    if (!this.store.reserve) this.store.reserve = [];

    if (id) {
      const idx = this.store.reserve.findIndex(r => r.id === id);
      if (idx !== -1) {
        this.store.reserve[idx] = { ...this.store.reserve[idx], ...data };
        this.showToast("Cập nhật hồ sơ bảo lưu thành công!");
      }
    } else {
      const newRec = {
        id: "rs-" + Date.now(),
        ...data
      };
      this.store.reserve.unshift(newRec);
      this.showToast("Thêm hồ sơ bảo lưu thành công!");
    }

    this.store.save();
    this.modalReserve.classList.remove("open");
    this.render();
  }

  deleteReserve(id) {
    if (confirm("Chị có chắc chắn muốn xóa hồ sơ bảo lưu này không?")) {
      this.store.reserve = (this.store.reserve || []).filter(r => r.id !== id);
      this.store.save();
      this.render();
      this.showToast("Đã xóa hồ sơ bảo lưu");
    }
  }

  // ================= EXPORT & IMPORT =================
  exportToExcel() {
    if (typeof XLSX === "undefined") {
      alert("Đang tải thư viện Excel, vui lòng thử lại sau vài giây.");
      return;
    }

    const wb = XLSX.utils.book_new();

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

    const wsClassesData = this.store.classes.map((c, idx) => {
      const activeCount = this.store.getClassActiveCount(c.classCode);
      const targetCapacity = c.maxCapacity ? parseInt(c.maxCapacity) : 6;
      return {
        "STT": idx + 1,
        "Mã khối": c.trackCategory,
        "Mã lớp": c.classCode,
        "Mô hình học": c.studyFormat,
        "Sĩ số mục tiêu": targetCapacity,
        "Sĩ số hiện tại": activeCount,
        "Tình trạng sĩ số": activeCount >= targetCapacity ? "Đủ sĩ số" : "Thiếu sĩ số",
        "Lịch học": c.schedule,
        "Ngày khai giảng": c.startDate,
        "Ngày CP1": c.cp1Date,
        "Ngày CP2": c.cp2Date,
        "Ngày Demo": c.demoDate,
        "Giáo viên phụ trách": c.teacher,
        "Trợ giảng": c.ta,
        "CS phụ trách": c.cs,
        "Tình trạng lớp": c.status
      };
    });
    const wsClasses = XLSX.utils.json_to_sheet(wsClassesData);
    XLSX.utils.book_append_sheet(wb, wsClasses, "Danh sách lớp học");

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

    const wsWaitingData = (this.store.waiting || []).map((w, idx) => ({
      "STT": idx + 1,
      "Loại chờ lớp": w.type,
      "Họ và tên học viên": w.fullName,
      "Số điện thoại": w.phone,
      "Tên phụ huynh": w.parentName,
      "Email": w.email,
      "Lộ trình": w.courseTrack,
      "Bộ môn": w.subject,
      "Ngày khai giảng": w.startDate,
      "Ngày demo/kết thúc": w.endDate,
      "Trạng thái chờ": w.status,
      "Phân loại chờ": w.timeCategory,
      "Note": w.note
    }));
    const wsWaiting = XLSX.utils.json_to_sheet(wsWaitingData);
    XLSX.utils.book_append_sheet(wb, wsWaiting, "Chờ lớp");

    const wsReserveData = (this.store.reserve || []).map((r, idx) => ({
      "STT": idx + 1,
      "Họ và tên học viên": r.fullName,
      "Mã lớp": r.classCode,
      "Số điện thoại": r.phone,
      "Tên phụ huynh": r.parentName,
      "Email": r.email,
      "Lộ trình": r.courseTrack,
      "Loại bảo lưu": r.type,
      "Trạng thái bảo lưu": r.status,
      "Ngày bắt đầu": r.startDate,
      "Ngày kết thúc": r.endDate,
      "Tình trạng thời hạn": this.calcReserveUrgency(r.endDate, r.status),
      "Ghi chú": r.note
    }));
    const wsReserve = XLSX.utils.json_to_sheet(wsReserveData);
    XLSX.utils.book_append_sheet(wb, wsReserve, "Bảo lưu");

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
            this.showToast("Nhập dữ liệu thành công!");
          } else {
            alert("Định dạng file JSON không hợp lệ.");
          }
        } catch (err) {
          alert("Lỗi khi đọc file: " + err.message);
        }
      };
      reader.readAsText(file);
    } else {
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

// Clear any existing localStorage mock demo if it came from the initial demo template
try {
  const existingClasses = localStorage.getItem("mx_ta_classes");
  if (existingClasses && existingClasses.includes("TA-C4K-GB02-HB")) {
    localStorage.removeItem("mx_ta_classes");
    localStorage.removeItem("mx_ta_students");
    localStorage.removeItem("mx_ta_attendance");
    localStorage.removeItem("mx_ta_makeup");
  }
} catch(e) {}

// Instantiate on DOM load
window.addEventListener("DOMContentLoaded", () => {
  window.app = new App();
  window.authManager = new AuthManager();
});

// ================= SESSION & AUTH GUARD =================
class AuthManager {
  constructor() {
    this.sessionKey = "mx_ta_auth_session";
    this.userPill = document.getElementById("user-header-pill");
    this.userDisplayName = document.getElementById("user-display-name");
    this.userRoleTag = document.getElementById("user-role-tag");
    this.btnLogout = document.getElementById("btn-logout");

    this.checkSession();
  }

  checkSession() {
    let session = null;
    try {
      const data = sessionStorage.getItem(this.sessionKey) || localStorage.getItem(this.sessionKey);
      session = data ? JSON.parse(data) : null;
    } catch (e) {
      session = null;
    }

    if (!session || !session.isLoggedIn) {
      window.location.replace("index.html");
      return;
    }

    if (this.userPill) {
      this.userPill.style.display = "inline-flex";
      if (this.userDisplayName) {
        this.userDisplayName.textContent = session.staffId;
      }
      if (this.userRoleTag) {
        this.userRoleTag.textContent = `ROLE: ${session.role || 'CS'}`;
        if (session.role === "ADMIN") {
          this.userRoleTag.style.backgroundColor = "#0f172a";
        } else {
          this.userRoleTag.style.backgroundColor = "var(--brand-red)";
        }
      }
    }

    if (this.btnLogout) {
      this.btnLogout.addEventListener("click", () => {
        if (confirm("Chị có chắc chắn muốn đăng xuất không?")) {
          sessionStorage.removeItem(this.sessionKey);
          localStorage.removeItem(this.sessionKey);
          window.location.replace("index.html");
        }
      });
    }

    if (window.lucide && window.lucide.createIcons) {
      window.lucide.createIcons();
    }
  }
}
