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

  clearAll() {
    this.classes = [];
    this.students = [];
    this.attendance = {};
    this.makeup = [];
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
      makeup: document.getElementById("tab-makeup")
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
