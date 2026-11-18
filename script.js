// ---------- Data ----------
const products = [
  { id: 1, name: "Apples (1 kg)",   category: "Fruits",     price: 120, emoji: "🍎" },
  { id: 2, name: "Bananas (1 dozen)", category: "Fruits",   price: 60,  emoji: "🍌" },
  { id: 3, name: "Tomatoes (1 kg)", category: "Vegetables", price: 40,  emoji: "🍅" },
  { id: 4, name: "Carrots (1 kg)",  category: "Vegetables", price: 50,  emoji: "🥕" },
  { id: 5, name: "Milk (1 L)",      category: "Dairy",      price: 56,  emoji: "🥛" },
  { id: 6, name: "Bread loaf",      category: "Bakery",     price: 45,  emoji: "🍞" },
  { id: 7, name: "Eggs (12 pack)",  category: "Dairy",      price: 84,  emoji: "🥚" },
  { id: 8, name: "Rice (1 kg)",     category: "Grocery",    price: 75,  emoji: "🍚" }
];

const TAX_RATE = 0.05;
const STORAGE_KEY = "spirex_cart";

// cart is an array of { id, qty }
let cart = loadCart();

// ---------- DOM ----------
const productGrid = document.getElementById("productGrid");
const cartItems   = document.getElementById("cartItems");
const cartCount   = document.getElementById("cartCount");
const subtotalEl  = document.getElementById("subtotal");
const taxEl       = document.getElementById("tax");
const totalEl     = document.getElementById("total");
const clearBtn    = document.getElementById("clearBtn");
const checkoutBtn = document.getElementById("checkoutBtn");
const toastEl     = document.getElementById("toast");
const cartToggle  = document.getElementById("cartToggle");

// ---------- Helpers ----------
const formatPrice = (n) => "₹" + n.toFixed(2);
const getProduct  = (id) => products.find((p) => p.id === id);

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch (e) {
    return [];
  }
}
function saveCart() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch (e) {}
}
function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toastEl.classList.remove("show"), 1800);
}

// ---------- Cart actions ----------
function addToCart(id) {
  const item = cart.find((c) => c.id === id);
  if (item) item.qty += 1;
  else cart.push({ id, qty: 1 });
  showToast(getProduct(id).name + " added to cart");
  update();
}
function changeQty(id, delta) {
  const item = cart.find((c) => c.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter((c) => c.id !== id);
  update();
}
function removeFromCart(id) {
  cart = cart.filter((c) => c.id !== id);
  showToast(getProduct(id).name + " removed");
  update();
}
function clearCart() {
  if (cart.length === 0) return;
  cart = [];
  showToast("Cart cleared");
  update();
}
function checkout() {
  if (cart.length === 0) return;
  const total = totalEl.textContent;
  alert("Thank you for your order!\nTotal paid: " + total);
  cart = [];
  update();
}

// ---------- Rendering ----------
function renderProducts() {
  productGrid.innerHTML = products.map((p) => `
    <article class="card">
      <div class="emoji" aria-hidden="true">${p.emoji}</div>
      <h3>${p.name}</h3>
      <span class="category">${p.category}</span>
      <span class="price">${formatPrice(p.price)}</span>
      <button class="btn primary" data-add="${p.id}">Add to cart</button>
    </article>`).join("");
}

function renderCart() {
  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="empty">Your cart is empty. Add a product to get started.</p>';
  } else {
    cartItems.innerHTML = cart.map((c) => {
      const p = getProduct(c.id);
      return `
        <div class="cart-item">
          <div>
            <div class="name">${p.emoji} ${p.name}</div>
            <div class="unit">${formatPrice(p.price)} each</div>
          </div>
          <div class="line-total">${formatPrice(p.price * c.qty)}</div>
          <div class="qty">
            <button data-dec="${p.id}" aria-label="Decrease quantity of ${p.name}">−</button>
            <span aria-live="polite">${c.qty}</span>
            <button data-inc="${p.id}" aria-label="Increase quantity of ${p.name}">+</button>
          </div>
          <button class="remove" data-remove="${p.id}">Remove</button>
        </div>`;
    }).join("");
  }
}

function renderTotals() {
  const subtotal = cart.reduce((sum, c) => sum + getProduct(c.id).price * c.qty, 0);
  const tax = subtotal * TAX_RATE;
  subtotalEl.textContent = formatPrice(subtotal);
  taxEl.textContent = formatPrice(tax);
  totalEl.textContent = formatPrice(subtotal + tax);
  cartCount.textContent = cart.reduce((n, c) => n + c.qty, 0);
  clearBtn.disabled = checkoutBtn.disabled = cart.length === 0;
}

function update() {
  saveCart();
  renderCart();
  renderTotals();
}

// ---------- Events (delegation) ----------
productGrid.addEventListener("click", (e) => {
  const id = e.target.dataset.add;
  if (id) addToCart(Number(id));
});
cartItems.addEventListener("click", (e) => {
  const { inc, dec, remove } = e.target.dataset;
  if (inc) changeQty(Number(inc), 1);
  if (dec) changeQty(Number(dec), -1);
  if (remove) removeFromCart(Number(remove));
});
clearBtn.addEventListener("click", clearCart);
checkoutBtn.addEventListener("click", checkout);
cartToggle.addEventListener("click", () =>
  document.getElementById("cartSection").scrollIntoView({ behavior: "smooth" })
);

// ---------- Init ----------
// Drop any saved items whose product no longer exists
cart = cart.filter((c) => getProduct(c.id) && c.qty > 0);
renderProducts();
update();