// ===============================
// ✅ CART + CHECKOUT + ORDER HISTORY (CLEAN VERSION)
// ===============================

// ✅ Header cart count
function updateCartCount() {
  const el = document.querySelector(".cart-count");
  if (!el) return;
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  let count = 0;
  cart.forEach(i => (count += (i.qty || i.quantity || 1)));
  el.textContent = count;
}

// ✅ Logged user
function getLoggedUser() {
  return JSON.parse(localStorage.getItem("loggedUser")) || null;
}

// ✅ Save order
function saveOrderToHistory({ items, total, shippingCity, shippingAddress }) {
  const user = getLoggedUser();
  if (!user) return;

  const ordersByUser = JSON.parse(localStorage.getItem("ordersByUser")) || {};
  const list = ordersByUser[user.email] || [];

  const order = {
    orderId: "NMX" + Math.floor(100000 + Math.random() * 900000),
    createdAt: new Date().toISOString(),
    status: "Təsdiqləndi",
    shippingCity: shippingCity || "Bakı",
    shippingAddress: shippingAddress || "—",
    items: items || [],
    total: Number(total) || 0
  };

  list.push(order);
  ordersByUser[user.email] = list;

  localStorage.setItem("ordersByUser", JSON.stringify(ordersByUser));
}

// ✅ Render cart
function renderCart() {
  const cartContainer =
    document.querySelector(".cart-left") ||
    document.querySelector(".cart-items");

  const subtotalEl = document.getElementById("subtotal");
  const deliveryEl = document.getElementById("delivery");
  const totalEl = document.getElementById("total");

  if (!cartContainer || !subtotalEl || !deliveryEl || !totalEl) return;

  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cartContainer.innerHTML = "";

  if (cart.length === 0) {
    cartContainer.innerHTML = "<p>Səbət boşdur</p>";
    subtotalEl.textContent = "0 ₼";
    deliveryEl.textContent = "0 ₼";
    totalEl.textContent = "0 ₼";
    return;
  }

  let subtotal = 0;
  const delivery = 3;

  cart.forEach((rawItem, index) => {
    const item = {
      name: rawItem.name,
      price: Number(rawItem.price) || 0,
      img: rawItem.img || rawItem.image || "",
      qty: rawItem.qty || rawItem.quantity || 1
    };

    subtotal += item.price * item.qty;

    const div = document.createElement("div");
    div.className = "cart-item";

    div.innerHTML = `
      <img src="${item.img}" class="cart-img" alt="${item.name}">
      <div class="item-info">
        <h3 class="item-name">${item.name}</h3>
        <div class="qty-area">
          <button class="qty-btn minus">-</button>
          <span class="qty-count">${item.qty}</span>
          <button class="qty-btn plus">+</button>
        </div>
      </div>
      <div class="item-price">
        <div class="line-price">${(item.price * item.qty).toFixed(2)} ₼</div>
        <button class="remove-btn">Sil</button>
      </div>
    `;

    cartContainer.appendChild(div);

    div.querySelector(".plus").onclick = () => {
      const q = cart[index].qty || cart[index].quantity || 1;
      cart[index].qty = q + 1;
      localStorage.setItem("cart", JSON.stringify(cart));
      updateCartCount();
      renderCart();
    };

    div.querySelector(".minus").onclick = () => {
      const q = cart[index].qty || cart[index].quantity || 1;
      if (q > 1) {
        cart[index].qty = q - 1;
        localStorage.setItem("cart", JSON.stringify(cart));
        updateCartCount();
        renderCart();
      }
    };

    div.querySelector(".remove-btn").onclick = () => {
      cart.splice(index, 1);
      localStorage.setItem("cart", JSON.stringify(cart));
      updateCartCount();
      renderCart();
    };
  });

  subtotalEl.textContent = subtotal.toFixed(2) + " ₼";
  deliveryEl.textContent = delivery.toFixed(2) + " ₼";
  totalEl.textContent = (subtotal + delivery).toFixed(2) + " ₼";
}

// ✅ Coupon
function initCoupon() {
  const btn = document.getElementById("applyCoupon");
  if (!btn) return;

  btn.onclick = () => {
    const code = document.getElementById("couponInput").value.trim().toLowerCase();
    const subtotal = Number((document.getElementById("subtotal").textContent || "0").replace(/[^\d.]/g, "")) || 0;
    const delivery = Number((document.getElementById("delivery").textContent || "0").replace(/[^\d.]/g, "")) || 0;
    const msg = document.getElementById("couponMessage");
    const totalEl = document.getElementById("total");

    if (!msg || !totalEl) return;

    if (code === "aysel20") {
      const newTotal = subtotal * 0.8 + delivery;
      totalEl.textContent = newTotal.toFixed(2) + " ₼";
      msg.style.color = "green";
      msg.textContent = "✔ 20% endirim tətbiq olundu!";
    } else {
      msg.style.color = "red";
      msg.textContent = "❌ Kupon düzgün deyil";
    }
  };
}

// ✅ Checkout popup
function initCheckout() {
  const checkoutBtn = document.querySelector(".checkout-btn");
  const checkoutPopup = document.getElementById("checkoutPopup");
  const closePopup = document.querySelector(".close-popup");
  const confirmOrder = document.querySelector(".confirm-order");

  if (!checkoutBtn || !checkoutPopup) return;

  // cart boşdursa blokla
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (cart.length === 0) {
    checkoutBtn.disabled = true;
    checkoutBtn.style.opacity = "0.6";
    checkoutBtn.style.cursor = "not-allowed";
  }

  checkoutBtn.addEventListener("click", () => {
    const cartNow = JSON.parse(localStorage.getItem("cart")) || [];
    if (cartNow.length === 0) return;
    checkoutPopup.style.display = "flex";
  });

  if (closePopup) {
    closePopup.addEventListener("click", () => {
      checkoutPopup.style.display = "none";
    });
  }

  if (confirmOrder) {
    confirmOrder.addEventListener("click", () => {
      const name = document.getElementById("custName")?.value.trim();
      const phone = document.getElementById("custPhone")?.value.trim();
      const city = document.getElementById("city")?.value.trim();
      const street = document.getElementById("street")?.value.trim();
      const exp = document.getElementById("cardExpiry")?.value.trim();
      const cvc = document.getElementById("cardCVC")?.value.trim();
      const card = document.getElementById("cardNumber")?.value.trim(); // popupdakı

      if (!name || !phone || !city || !street || !card || !exp || !cvc) {
        alert("❌ Xahiş edirik bütün məlumatları doldurun.");
        return;
      }

      const cartNow = JSON.parse(localStorage.getItem("cart")) || [];
      const totalText = document.getElementById("total")?.textContent || "0";
      const total = Number(totalText.replace(/[^\d.]/g, "")) || 0;

      saveOrderToHistory({
        items: cartNow,
        total,
        shippingCity: city,
        shippingAddress: street
      });

      alert("✅ Sifarişiniz uğurla tamamlandı!");
      localStorage.removeItem("cart");
      updateCartCount();
      location.reload();
    });
  }
}

// ✅ Init
document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  renderCart();
  initCoupon();
  initCheckout();
});
