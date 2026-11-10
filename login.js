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
    labelLoginId.textContent = "Mã nhân viên CS *";
    staffIdInput.value = "";
  } else {
    roleBtnAdmin.classList.add("active");
    roleBtnCS.classList.remove("active");
    labelLoginId.textContent = "Tài khoản Quản lý (Admin) *";
    staffIdInput.value = "admin";
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
        loginTime: new Date().toISOString()
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

window.addEventListener("DOMContentLoaded", () => {
  if (window.lucide && window.lucide.createIcons) {
    window.lucide.createIcons();
  }
});

