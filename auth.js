// auth.js
// ===============================
// ✅ AUTH SYSTEM (Register/Login/Logout/Forgot) + Toast
// ===============================

let toastTimer;

function showToast(msg) {
  const toast = document.getElementById("toast");
  const text = document.getElementById("toastText");
  if (!toast || !text) return;

  text.textContent = msg;

  toast.classList.add("show");
  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 1800);
}

// Users storage
function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || [];
}
function setUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

// Logged user
function getLoggedUser() {
  return JSON.parse(localStorage.getItem("loggedUser")) || null;
}
function setLoggedUser(user) {
  localStorage.setItem("loggedUser", JSON.stringify(user));
}
function logout() {
  localStorage.removeItem("loggedUser");
  showToast("Çıxış edildi ✅");
  setTimeout(() => (window.location.href = "index.html"), 600);
}

// Header update (Giriş -> Hesabım / Çıxış düyməsi)
function updateHeaderAuthUI() {
  const user = getLoggedUser();

  const loginA = document.querySelector('a[href="giris.html"]');
  const loginSpan = document.querySelector('a[href="giris.html"] span');

  // Logout button yeri (header-də olacaq)
  const headerUserSection = document.querySelector(".user-section");
  let logoutBtn = document.getElementById("logoutBtn");

  if (user) {
    if (loginSpan) loginSpan.textContent = "Hesabım";
    if (loginA) loginA.setAttribute("href", "hesab.html"); // istəsən "hesab.html" açarıq

    if (headerUserSection && !logoutBtn) {
      logoutBtn = document.createElement("button");
      logoutBtn.id = "logoutBtn";
      logoutBtn.className = "logout-btn";
      logoutBtn.textContent = "Çıxış";
      logoutBtn.onclick = logout;
      headerUserSection.appendChild(logoutBtn);
    }
  } else {
    if (loginSpan) loginSpan.textContent = "Giriş";
    if (loginA) loginA.setAttribute("href", "giris.html");

    if (logoutBtn) logoutBtn.remove();
  }
}

// Cart count
function updateCartCount() {
  const el = document.querySelector(".cart-count");
  if (!el) return;
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  let count = 0;
  cart.forEach(i => (count += i.qty));
  el.textContent = count;
}

// ✅ Girişsiz səbətə icazə vermə (card.html açılarkən)
function protectCartPage() {
  const isCartPage =
    window.location.pathname.toLowerCase().includes("card.html") ||
    document.body.dataset.page === "cart";

  if (!isCartPage) return;

  const user = getLoggedUser();
  if (!user) {
    showToast("Səbət üçün əvvəl giriş edin ❗");
    setTimeout(() => (window.location.href = "giris.html"), 800);
  }
}

// ===============================
// ✅ REGISTER
// ===============================
function handleRegisterForm() {
  const form = document.getElementById("registerForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("regEmail").value.trim().toLowerCase();
    const pass = document.getElementById("regPass").value.trim();

    if (!email || !pass) {
      showToast("Email və şifrə boş ola bilməz ❌");
      return;
    }
    if (pass.length < 4) {
      showToast("Şifrə ən az 4 simvol olsun ❗");
      return;
    }

    const users = getUsers();
    const exists = users.find(u => u.email === email);

    if (exists) {
      showToast("Bu email artıq qeydiyyatdan keçib ❌");
      return;
    }

    users.push({ email, pass });
    setUsers(users);

    showToast("Qeydiyyat uğurlu ✅");
    setTimeout(() => (window.location.href = "giris.html"), 700);
  });
}

// ===============================
// ✅ LOGIN
// ===============================
function handleLoginForm() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const pass = document.getElementById("loginPass").value.trim();

    const users = getUsers();
    const user = users.find(u => u.email === email && u.pass === pass);

    if (!user) {
      showToast("Email və ya şifrə yanlışdır ❌");
      return;
    }

    setLoggedUser({ email });
    updateHeaderAuthUI();
    showToast("Uğurlu giriş ✅");

    setTimeout(() => (window.location.href = "index.html"), 700);
  });
}

// ===============================
// ✅ FORGOT PASSWORD (sadə)
// - email yazır, yeni şifrə yazır, users-də update edir
// ===============================
function handleForgotPassword() {
  const form = document.getElementById("forgotForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("forgotEmail").value.trim().toLowerCase();
    const newPass = document.getElementById("forgotNewPass").value.trim();

    if (!email || !newPass) {
      showToast("Məlumatları tam doldur ❗");
      return;
    }

    const users = getUsers();
    const idx = users.findIndex(u => u.email === email);

    if (idx === -1) {
      showToast("Bu email tapılmadı ❌");
      return;
    }

    users[idx].pass = newPass;
    setUsers(users);

    showToast("Şifrə yeniləndi ✅");
    setTimeout(() => (window.location.href = "giris.html"), 700);
  });
}

// ===============================
// ✅ INIT (bütün səhifələrdə işləsin)
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  updateHeaderAuthUI();
  updateCartCount();

  protectCartPage();
  handleRegisterForm();
  handleLoginForm();
  handleForgotPassword();
  handleProfilePage();

});
// ===============================
// ✅ PROFILE (hesab.html) Save/Load
// ===============================
function handleProfilePage() {
    const form = document.getElementById("profileForm");
    if (!form) return;
  
    const user = getLoggedUser();
    if (!user) {
      showToast("Hesab üçün giriş edin ❗");
      setTimeout(() => (window.location.href = "giris.html"), 700);
      return;
    }
  
    // Emaili göstər
    const emailEl = document.getElementById("accEmail");
    const pfEmail = document.getElementById("pfEmail");
    if (emailEl) emailEl.textContent = user.email;
    if (pfEmail) pfEmail.value = user.email;
  
    // Profil açarı: profile_<email>
    const key = "profile_" + user.email;
    const saved = JSON.parse(localStorage.getItem(key)) || {};
  
    // Doldur
    document.getElementById("pfName").value = saved.name || "";
    document.getElementById("pfSurname").value = saved.surname || "";
    document.getElementById("pfPhone").value = saved.phone || "";
    document.getElementById("pfBirth").value = saved.birth || "";
    document.getElementById("pfGender").value = saved.gender || "";
  
    // Yadda saxla
    form.addEventListener("submit", (e) => {
      e.preventDefault();
  
      const data = {
        name: document.getElementById("pfName").value.trim(),
        surname: document.getElementById("pfSurname").value.trim(),
        phone: document.getElementById("pfPhone").value.trim(),
        birth: document.getElementById("pfBirth").value,
        gender: document.getElementById("pfGender").value
      };
  
      localStorage.setItem(key, JSON.stringify(data));
      showToast("Məlumatlar yadda saxlandı ✅");
    });
  }
  document.addEventListener("DOMContentLoaded", () => {
    const header = document.querySelector("header");
    const btn = document.querySelector(".menu-toggle");
    const links = document.querySelectorAll("nav .menu a");
  
    if (btn && header) {
      btn.addEventListener("click", () => {
        header.classList.toggle("menu-open");
      });
  
      // Linkə basanda menyu bağlansın
      links.forEach(a => {
        a.addEventListener("click", () => header.classList.remove("menu-open"));
      });
    }
  });
  