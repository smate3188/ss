// orders.js
// ===============================
// ✅ Sifarişləri göstər (Trendyol kimi) — HAMISI GÖRÜNSÜN (toggle yoxdur)
// ordersByUser: { "email": [ {order} , ... ] }
// ===============================

function getLoggedUser() {
    return JSON.parse(localStorage.getItem("loggedUser")) || null;
  }
  
  function getOrdersByUser() {
    return JSON.parse(localStorage.getItem("ordersByUser")) || {};
  }
  
  function formatAZDate(iso) {
    try {
      const d = new Date(iso);
      return d.toLocaleString("az-AZ", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return iso;
    }
  }
  
  function money(n) {
    return (Math.round(Number(n) * 100) / 100).toFixed(2) + " ₼";
  }
  
  function renderOrders() {
    const user = getLoggedUser();
    const emailEl = document.getElementById("accEmail");
    if (emailEl) emailEl.textContent = user?.email || "—";
  
    // login yoxdursa -> giris
    if (!user) {
      if (typeof showToast === "function") showToast("Sifarişlər üçün giriş edin ❗");
      setTimeout(() => (window.location.href = "giris.html"), 700);
      return;
    }
  
    const ordersByUser = getOrdersByUser();
    const list = ordersByUser[user.email] || [];
  
    const wrap = document.getElementById("ordersList");
    const empty = document.getElementById("ordersEmpty");
    if (!wrap || !empty) return;
  
    if (list.length === 0) {
      wrap.innerHTML = "";
      empty.style.display = "block";
      return;
    }
  
    empty.style.display = "none";
  
    // ən yenisi yuxarıda
    const sorted = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
    wrap.innerHTML = sorted
      .map((order) => {
        // ✅ HAMISI GÖRÜNSÜN (slice yoxdur)
        const itemsHtml = (order.items || [])
          .map((it) => {
            const img = it.img || it.image || "";
            const name = it.name || "";
            const qty = it.qty || it.quantity || 1;
            const price = it.price || 0;
  
            return `
              <div class="order-item">
                <img src="${img}" alt="${name}">
                <div class="oi-meta">
                  <div class="oi-name">${name}</div>
                  <div class="oi-sub">${qty} × ${money(price)}</div>
                </div>
              </div>
            `;
          })
          .join("");
  
        return `
          <div class="order-card">
            <div class="order-top">
              <div class="order-id">
                <div class="k">Sifariş #</div>
                <div class="v">${order.orderId}</div>
              </div>
  
              <div class="order-date">
                <div class="k">Tarix</div>
                <div class="v">${formatAZDate(order.createdAt)}</div>
              </div>
  
              <div class="order-status ${order.status === "Təsdiqləndi" ? "ok" : ""}">
                ${order.status || "Təsdiqləndi"}
              </div>
            </div>
  
            <div class="order-mid">
              <div class="order-block">
                <div class="k">Göndərilmə yeri</div>
                <div class="v">${order.shippingCity || "—"}</div>
              </div>
  
              <div class="order-block">
                <div class="k">Ünvan</div>
                <div class="v">${order.shippingAddress || "—"}</div>
              </div>
  
              <div class="order-block right">
                <div class="k">Total</div>
                <div class="v total">${money(order.total || 0)}</div>
              </div>
            </div>
  
            <div class="order-items">
              ${itemsHtml}
            </div>
          </div>
        `;
      })
      .join("");
  }
  
  document.addEventListener("DOMContentLoaded", renderOrders);
  