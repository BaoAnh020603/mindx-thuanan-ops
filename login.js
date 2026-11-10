// ==========================================================================
// MindX Technology School - Thuận An Operations System
// LOGIN LOGIC (login.js) - Standalone Authentication Module
// ==========================================================================

const sessionKey = "mx_ta_auth_session";

let currentRole = "CS";
const roleBtnCS = document.getElementById("role-btn-cs");
const roleBtnAdmin = document.getElementById("role-btn-admin");
const labelLoginId = document.getElementById("label-login-id");
const staffIdInput = document.getElementById("login-staff-id");
const passwordInput = document.getElementById("login-password");
const errorMsg = document.getElementById("login-error-msg");
const btnTogglePassword = document.getElementById("btn-toggle-password");
const formLogin = document.getElementById("form-login");

function switchRole(role) {
  currentRole = role;
  if (role === "CS") {
    roleBtnCS.classList.add("active");
    roleBtnAdmin.classList.remove("active");
    labelLoginId.textContent = "Họ và tên CS (hoặc Mã NV) *";
    staffIdInput.value = "";
    staffIdInput.placeholder = "Ví dụ: Trần Thị Thảo Vy";
  } else {
    roleBtnAdmin.classList.add("active");
    roleBtnCS.classList.remove("active");
    labelLoginId.textContent = "Tài khoản Quản lý (Admin) *";
    staffIdInput.value = "admin";
    staffIdInput.placeholder = "";
  }
  errorMsg.style.display = "none";
  passwordInput.value = "";
  passwordInput.focus();
}

if (roleBtnCS) roleBtnCS.addEventListener("click", () => switchRole("CS"));
if (roleBtnAdmin) roleBtnAdmin.addEventListener("click", () => switchRole("ADMIN"));

// Toggle eye
if (btnTogglePassword && passwordInput) {
  btnTogglePassword.addEventListener("click", () => {
    const isPass = passwordInput.type === "password";
    passwordInput.type = isPass ? "text" : "password";
    const icon = document.getElementById("icon-eye");
    if (icon) {
      icon.setAttribute("data-lucide", isPass ? "eye-off" : "eye");
      if (window.lucide && window.lucide.createIcons) {
        window.lucide.createIcons();
      }
    }
  });
}

// Handle Login
if (formLogin) {
  formLogin.addEventListener("submit", (e) => {
    e.preventDefault();
    const loginId = staffIdInput.value.trim();
    const password = passwordInput.value.trim();
    const rememberMe = document.getElementById("remember-me")?.checked;

    let isValid = false;
    let displayName = loginId;

    if (currentRole === "ADMIN") {
      if (loginId.toLowerCase() === "admin" && password === "MindX@Admin2024") {
        isValid = true;
        displayName = "Administrator";
      }
    } else {
      if (password === "MindX@2024" && loginId.length > 0) {
        isValid = true;
        displayName = loginId;
      }
    }

    if (isValid) {
      const sessionData = {
        isLoggedIn: true,
        staffId: displayName,
        role: currentRole,
        loginTime: new Date().toISOString(),
        justLoggedIn: true
      };
      // Always store session in both sessionStorage and localStorage to prevent session loss on accidental browser close
      sessionStorage.setItem(sessionKey, JSON.stringify(sessionData));
      localStorage.setItem(sessionKey, JSON.stringify(sessionData));
      // Redirect straight to dashboard.html
      window.location.replace("dashboard.html");
    } else {
      errorMsg.style.display = "block";
      errorMsg.textContent = "Mã đăng nhập hoặc mật khẩu không chính xác!";
    }
  });
}

function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  if (!toast) return;

  const msgEl = document.getElementById("toast-message");
  const titleEl = document.getElementById("toast-title");
  const iconEl = document.getElementById("toast-icon");

  if (msgEl) msgEl.textContent = message;
  if (titleEl) {
    if (type === "info") titleEl.textContent = "HỆ THỐNG MINDX";
    else titleEl.textContent = "MINDX OPS THUẬN AN";
  }

  if (iconEl) {
    let iconName = "check-circle-2";
    if (type === "info") iconName = "log-out";
    iconEl.innerHTML = `<i data-lucide="${iconName}"></i>`;
    if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
  }

  toast.className = `toast toast-${type}`;
  toast.classList.remove("hidden");
  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  setTimeout(() => {
    hideToast();
  }, 3500);
}

function hideToast() {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.classList.remove("show");
  setTimeout(() => {
    toast.classList.add("hidden");
  }, 320);
}

window.addEventListener("DOMContentLoaded", () => {
  if (window.lucide && window.lucide.createIcons) {
    window.lucide.createIcons();
  }

  // Check if just logged out
  const logoutMsg = sessionStorage.getItem("mx_ta_logout_message") || localStorage.getItem("mx_ta_logout_message");
  if (logoutMsg) {
    sessionStorage.removeItem("mx_ta_logout_message");
    localStorage.removeItem("mx_ta_logout_message");
    setTimeout(() => {
      showToast(logoutMsg, "info");
    }, 400);
  }
});

