const STORAGE_KEY = "mustang-franchise-pos-v1";

const seedState = {
  language: "th",
  activeBranchId: "branch-kiosk",
  activeUserId: "u-super",
  orderSequenceByDay: {},
  kitchenTab: "active",
  branches: [
    {
      id: "branch-kiosk",
      nameTh: "Mustang Kiosk",
      nameEn: "Mustang Kiosk",
      tokens: Array.from({ length: 16 }, (_, i) => ({ id: String(i + 1), label: String(i + 1), active: true })),
      qrLabel: "บัญชี Mustang Cafe Kiosk",
      templateMode: "linked",
      templateVersion: 1,
    },
    {
      id: "branch-main",
      nameTh: "Mustang Cafe สาขาหลัก",
      nameEn: "Mustang Cafe Main",
      tokens: Array.from({ length: 12 }, (_, i) => ({ id: `A${i + 1}`, label: `A${i + 1}`, active: true })),
      qrLabel: "บัญชี Mustang Cafe Main",
      templateMode: "linked",
      templateVersion: 1,
    },
  ],
  masterTemplate: {
    version: 1,
    updatedAt: new Date().toISOString(),
    menuIds: ["m-nutella-oreo", "m-nutella-latte", "m-cha-chak", "m-roti-banana", "m-rice"],
  },
  categories: [
    { id: "signature", th: "Signature Mustang drink", en: "Signature Mustang drink", sort: 1 },
    { id: "cha-chak", th: "เครื่องดื่มกูโรตีชาชัก", en: "Guroti Cha Chak drinks", sort: 2 },
    { id: "roti", th: "โรตีหวาน", en: "Sweet roti", sort: 3 },
    { id: "food", th: "อาหาร", en: "Food", sort: 4 },
  ],
  menu: [
    {
      id: "m-nutella-oreo",
      sku: "SIG-001",
      categoryId: "signature",
      th: "นูเทลล่าโอรีโอนมสด",
      en: "Nutella Oreo Fresh Milk",
      price: 99,
      image: "assets/nutella-oreo-fresh-milk.png",
      available: true,
      options: [
        { id: "sweet", th: "ความหวาน", required: true, choices: [{ th: "หวานน้อย" }, { th: "ปกติ" }, { th: "หวานมาก" }] },
        { id: "ice", th: "น้ำแข็ง", required: true, choices: [{ th: "ปกติ" }, { th: "น้อย" }, { th: "ไม่ใส่น้ำแข็ง" }] },
        { id: "topping", th: "ท็อปปิ้ง", required: false, choices: [{ th: "โอรีโอเพิ่ม", price: 10 }, { th: "นูเทลล่าเพิ่ม", price: 15 }] },
      ],
    },
    {
      id: "m-nutella-latte",
      sku: "SIG-002",
      categoryId: "signature",
      th: "นูเทลล่าคอฟฟี่ลาเต้",
      en: "Nutella Coffee Latte",
      price: 99,
      image: "assets/nutella-coffee-latte.jpg",
      available: true,
      options: [
        { id: "sweet", th: "ความหวาน", required: true, choices: [{ th: "หวานน้อย" }, { th: "ปกติ" }, { th: "หวานมาก" }] },
        { id: "shot", th: "กาแฟ", required: false, choices: [{ th: "เพิ่มช็อต", price: 20 }] },
      ],
    },
    {
      id: "m-cha-chak",
      sku: "CHA-001",
      categoryId: "cha-chak",
      th: "ชาชักเย็น",
      en: "Iced Cha Chak",
      price: 65,
      image: "assets/mustang-logo.png",
      available: true,
      options: [{ id: "sweet", th: "ความหวาน", required: true, choices: [{ th: "25%" }, { th: "50%" }, { th: "100%" }] }],
    },
    {
      id: "m-roti-banana",
      sku: "ROT-001",
      categoryId: "roti",
      th: "โรตีกล้วยนูเทลล่า",
      en: "Banana Nutella Roti",
      price: 89,
      image: "assets/nutella-oreo-fresh-milk.png",
      available: true,
      options: [{ id: "cut", th: "ตัดชิ้น", required: false, choices: [{ th: "ตัด 4 ชิ้น" }, { th: "ตัด 8 ชิ้น" }] }],
    },
    {
      id: "m-rice",
      sku: "FOOD-001",
      categoryId: "food",
      th: "ข้าวไก่กรอบซอสมัสแตง",
      en: "Mustang Crispy Chicken Rice",
      price: 109,
      image: "assets/mustang-logo.png",
      available: true,
      options: [{ id: "spicy", th: "ระดับความเผ็ด", required: true, choices: [{ th: "ไม่เผ็ด" }, { th: "ปกติ" }, { th: "เผ็ด" }] }],
    },
  ],
  promotions: [
    { id: "none", nameTh: "ไม่ใช้โปรโมชั่น", type: "none", value: 0, active: true },
    { id: "promo-10", nameTh: "ลด 10%", type: "percent", value: 10, active: true },
    { id: "promo-20b", nameTh: "ลด 20 บาท", type: "amount", value: 20, active: true },
  ],
  users: [
    { id: "u-super", name: "Mustang Owner", role: "super_admin", branchIds: ["branch-kiosk", "branch-main"], active: true },
    { id: "u-franchise", name: "Kiosk Franchise Owner", role: "branch_owner", branchIds: ["branch-kiosk"], active: true },
    { id: "u-manager", name: "Kiosk Manager", role: "branch_manager", branchIds: ["branch-kiosk"], active: true },
    { id: "u-cashier", name: "Cashier", role: "cashier", branchIds: ["branch-kiosk"], active: true },
    { id: "u-kitchen", name: "Kitchen Staff", role: "kitchen", branchIds: ["branch-kiosk"], active: true },
    { id: "u-customer", name: "Customer Kiosk", role: "customer_kiosk", branchIds: ["branch-kiosk"], active: true },
  ],
  orders: [],
};

const roles = {
  super_admin: {
    label: "Mustang Superuser",
    views: ["pos", "customer", "payments", "kitchen", "pickup", "reports", "admin"],
    canSwitchBranches: true,
    canManageRoles: true,
    canManageFranchise: true,
  },
  branch_owner: {
    label: "Franchise Owner",
    views: ["pos", "customer", "payments", "kitchen", "pickup", "reports"],
    canSwitchBranches: false,
    canManageRoles: false,
    canManageFranchise: false,
  },
  branch_manager: {
    label: "Branch Manager",
    views: ["pos", "payments", "kitchen", "pickup", "reports"],
    canSwitchBranches: false,
    canManageRoles: false,
    canManageFranchise: false,
  },
  cashier: {
    label: "Cashier",
    views: ["pos", "payments", "pickup"],
    canSwitchBranches: false,
    canManageRoles: false,
    canManageFranchise: false,
  },
  kitchen: {
    label: "Kitchen Staff",
    views: ["kitchen"],
    canSwitchBranches: false,
    canManageRoles: false,
    canManageFranchise: false,
  },
  customer_kiosk: {
    label: "Customer Kiosk",
    views: ["customer"],
    canSwitchBranches: false,
    canManageRoles: false,
    canManageFranchise: false,
  },
};

let state = loadState();
let carts = { staff: [], customer: [] };
let selectedCategory = "signature";
let selectedCustomerCategory = "signature";

const $ = (id) => document.getElementById(id);
const fmt = new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 });
const dateFmt = new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Bangkok" });

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return structuredClone(seedState);
  try {
    const parsed = JSON.parse(raw);
    const next = { ...structuredClone(seedState), ...parsed };
    next.masterTemplate = next.masterTemplate || structuredClone(seedState.masterTemplate);
    next.users = next.users || structuredClone(seedState.users);
    next.activeUserId = next.activeUserId || "u-super";
    next.branches = next.branches.map((item) => ({
      templateMode: "linked",
      templateVersion: next.masterTemplate?.version || 1,
      ...item,
      tokens: item.tokens || [],
    }));
    return next;
  } catch {
    return structuredClone(seedState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function branch() {
  return state.branches.find((item) => item.id === state.activeBranchId) || state.branches[0];
}

function currentUser() {
  return state.users.find((item) => item.id === state.activeUserId) || state.users[0];
}

function currentRole() {
  return roles[currentUser().role] || roles.cashier;
}

function isAdminRoute() {
  return location.pathname.replace(/\/+$/, "").endsWith("/admin");
}

function canView(viewId) {
  return currentRole().views.includes(viewId);
}

function enforceBranchAccess() {
  if (currentRole().canSwitchBranches) return;
  if (!currentUser().branchIds.includes(state.activeBranchId)) {
    state.activeBranchId = currentUser().branchIds[0] || state.branches[0].id;
  }
}

function menuName(item) {
  return state.language === "en" ? item.en : item.th;
}

function categoryName(item) {
  return state.language === "en" ? item.en : item.th;
}

function toast(message) {
  $("toast").textContent = message;
  $("toast").classList.add("show");
  window.setTimeout(() => $("toast").classList.remove("show"), 2600);
}

function todayKey() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok" }).format(new Date());
}

function nextOrderNo() {
  const key = `${state.activeBranchId}-${todayKey()}`;
  const next = (state.orderSequenceByDay[key] || 0) + 1;
  state.orderSequenceByDay[key] = next;
  return `M${String(next).padStart(3, "0")}`;
}

function activeTokenIds() {
  return branch().tokens.filter((token) => token.active).map((token) => token.label);
}

function tokenStatus(token) {
  const activeOrder = state.orders.find((order) => order.branchId === state.activeBranchId && order.queueToken === token.label && !["picked_up", "cancelled"].includes(order.status));
  if (!activeOrder) return "available";
  if (activeOrder.status === "pending_payment") return "waiting_payment";
  if (activeOrder.status === "ready") return "ready";
  return "in_kitchen";
}

function isTokenAvailable(label) {
  const exists = activeTokenIds().includes(String(label));
  if (!exists) return false;
  return !state.orders.some((order) => order.branchId === state.activeBranchId && order.queueToken === String(label) && !["picked_up", "cancelled"].includes(order.status));
}

function defaultOptions(item) {
  return item.options.map((group) => {
    const choice = group.choices[0];
    return { groupId: group.id, group: group.th, label: choice.th, price: choice.price || 0, required: group.required };
  });
}

function addToCart(cartName, item) {
  const choices = defaultOptions(item);
  const key = `${item.id}:${choices.map((choice) => `${choice.groupId}-${choice.label}`).join("|")}`;
  const existing = carts[cartName].find((line) => line.key === key);
  if (existing) {
    existing.qty += 1;
  } else {
    carts[cartName].push({ key, menuId: item.id, qty: 1, options: choices, note: "" });
  }
  renderCarts();
}

function linePrice(line) {
  const item = state.menu.find((menuItem) => menuItem.id === line.menuId);
  const optionTotal = line.options.reduce((sum, option) => sum + (option.price || 0), 0);
  return (item.price + optionTotal) * line.qty;
}

function cartSummary(cartName) {
  const subtotal = carts[cartName].reduce((sum, line) => sum + linePrice(line), 0);
  const promoId = cartName === "staff" ? $("promotionSelect").value : "none";
  const promo = state.promotions.find((item) => item.id === promoId) || state.promotions[0];
  let discount = 0;
  if (promo.type === "percent") discount = Math.round(subtotal * (promo.value / 100));
  if (promo.type === "amount") discount = Math.min(subtotal, promo.value);
  const total = Math.max(0, subtotal - discount);
  return { subtotal, discount, total, promo };
}

function render() {
  enforceBranchAccess();
  $("todayLabel").textContent = dateFmt.format(new Date());
  $("activeBranchName").textContent = branch().nameTh;
  $("rolePill").textContent = currentRole().label;
  renderUserSelect();
  renderBranchSelect();
  renderNavigation();
  renderTabs();
  renderMenus();
  renderCarts();
  renderPayments();
  renderKitchen();
  renderPickup();
  renderReports();
  renderAdmin();
}

function renderUserSelect() {
  $("userSelect").innerHTML = state.users
    .filter((item) => item.active)
    .map((item) => `<option value="${item.id}">${item.name} - ${roles[item.role]?.label || item.role}</option>`)
    .join("");
  $("userSelect").value = state.activeUserId;
}

function showView(viewId, updateHash = true) {
  const requested = $(viewId) ? viewId : "pos";
  const fallback = currentRole().views[0] || "pos";
  const view = isAdminRoute() && requested === "admin" ? "admin" : canView(requested) ? requested : fallback;
  document.querySelectorAll(".view").forEach((item) => item.classList.remove("active"));
  document.querySelectorAll(".nav button").forEach((button) => button.classList.remove("active"));
  $(view).classList.add("active");
  const navButton = document.querySelector(`[data-view="${view}"]`);
  if (navButton) {
    navButton.classList.add("active");
    $("viewTitle").textContent = navButton.textContent;
  }
  if (updateHash) history.replaceState(null, "", `#${view}`);
}

function renderNavigation() {
  document.querySelectorAll("[data-view]").forEach((button) => {
    const isAdminButton = button.dataset.view === "admin";
    const allowed = canView(button.dataset.view) && (!isAdminButton || isAdminRoute());
    button.classList.toggle("hidden", !allowed);
  });
  $("branchSelect").disabled = !currentRole().canSwitchBranches;
}

function tokensFromText(text) {
  return text
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((label) => ({ id: label, label, active: true }));
}

function renderBranchSelect() {
  const branches = currentRole().canSwitchBranches ? state.branches : state.branches.filter((item) => currentUser().branchIds.includes(item.id));
  $("branchSelect").innerHTML = branches.map((item) => `<option value="${item.id}">${item.nameTh}</option>`).join("");
  $("branchSelect").value = state.activeBranchId;
}

function renderTabs() {
  const tabs = state.categories
    .sort((a, b) => a.sort - b.sort)
    .map((cat) => `<button class="${cat.id === selectedCategory ? "active" : ""}" data-cat="${cat.id}">${categoryName(cat)}</button>`)
    .join("");
  $("categoryTabs").innerHTML = tabs;
  $("customerTabs").innerHTML = state.categories
    .sort((a, b) => a.sort - b.sort)
    .map((cat) => `<button class="${cat.id === selectedCustomerCategory ? "active" : ""}" data-customer-cat="${cat.id}">${categoryName(cat)}</button>`)
    .join("");
}

function renderMenus() {
  const search = ($("menuSearch").value || "").toLowerCase();
  const staffItems = state.menu.filter((item) => item.categoryId === selectedCategory && item.available && (!search || `${item.th} ${item.en} ${item.sku}`.toLowerCase().includes(search)));
  $("menuGrid").innerHTML = staffItems.map(menuCard).join("");
  const customerItems = state.menu.filter((item) => item.categoryId === selectedCustomerCategory && item.available);
  $("customerMenuGrid").innerHTML = customerItems.map((item) => menuCard(item, true)).join("");
}

function menuCard(item, customer = false) {
  return `
    <button class="menu-card" data-menu-id="${item.id}" data-cart="${customer ? "customer" : "staff"}">
      <img src="${item.image}" alt="${menuName(item)}">
      <span class="info">
        <span class="sku">${item.sku}</span>
        <strong>${menuName(item)}</strong>
        <span>${item.options.length ? `${item.options.length} ตัวเลือก` : "ไม่มีตัวเลือก"}</span>
        <span class="price">${fmt.format(item.price)}</span>
      </span>
    </button>
  `;
}

function renderCarts() {
  const selectedPromo = $("promotionSelect").value || "none";
  $("promotionSelect").innerHTML = state.promotions.filter((item) => item.active).map((promo) => `<option value="${promo.id}">${promo.nameTh}</option>`).join("");
  $("promotionSelect").value = state.promotions.some((promo) => promo.id === selectedPromo && promo.active) ? selectedPromo : "none";
  renderTokenSelect();
  renderCart("staff", "cartList", "cartTotals");
  renderCart("customer", "customerCartList", "customerTotals");
}

function renderTokenSelect() {
  const options = branch().tokens
    .filter((token) => token.active)
    .map((token) => {
      const status = tokenStatus(token);
      const disabled = status !== "available" ? "disabled" : "";
      return `<option value="${token.label}" ${disabled}>${token.label} - ${tokenLabel(status)}</option>`;
    })
    .join("");
  $("staffToken").innerHTML = `<option value="">เลือกคิว</option>${options}`;
}

function tokenLabel(status) {
  return { available: "ว่าง", waiting_payment: "รอชำระ", in_kitchen: "อยู่ในครัว", ready: "อาหารพร้อม" }[status];
}

function renderCart(cartName, listId, totalsId) {
  const cart = carts[cartName];
  $(listId).innerHTML = cart.length
    ? cart
        .map((line, index) => {
          const item = state.menu.find((menuItem) => menuItem.id === line.menuId);
          return `
            <div class="cart-item">
              <div>
                <strong>${menuName(item)}</strong>
                <div class="option-selects">${item.options.map((group) => {
                  const current = line.options.find((option) => option.groupId === group.id);
                  return `
                    <label>${group.th}${group.required ? " *" : ""}
                      <select data-cart-option="${cartName}" data-index="${index}" data-group="${group.id}">
                        ${group.choices.map((choice) => {
                          const selected = current && current.label === choice.th ? "selected" : "";
                          const price = choice.price ? ` +${choice.price}` : "";
                          return `<option value="${choice.th}" ${selected}>${choice.th}${price}</option>`;
                        }).join("")}
                      </select>
                    </label>
                  `;
                }).join("")}</div>
                <span class="sku">${item.sku}</span>
              </div>
              <div>
                <div class="qty">
                  <button data-cart-act="dec" data-cart="${cartName}" data-index="${index}">-</button>
                  <span>${line.qty}</span>
                  <button data-cart-act="inc" data-cart="${cartName}" data-index="${index}">+</button>
                </div>
                <strong>${fmt.format(linePrice(line))}</strong>
              </div>
            </div>
          `;
        })
        .join("")
    : `<p class="sku">ยังไม่มีรายการ</p>`;
  const summary = cartSummary(cartName);
  const received = Number($("cashReceived").value || 0) + Number($("transferReceived").value || 0);
  const change = cartName === "staff" ? Math.max(0, received - summary.total) : 0;
  $(totalsId).innerHTML = `
    <div class="total-line"><span>ยอดรวม</span><strong>${fmt.format(summary.subtotal)}</strong></div>
    <div class="total-line"><span>ส่วนลด</span><strong>${fmt.format(summary.discount)}</strong></div>
    <div class="total-line final"><span>สุทธิ</span><strong>${fmt.format(summary.total)}</strong></div>
    ${cartName === "staff" ? `<div class="total-line"><span>เงินทอน</span><strong>${fmt.format(change)}</strong></div>` : ""}
  `;
}

function createOrder(source) {
  const cartName = source === "customer" ? "customer" : "staff";
  const cart = carts[cartName];
  if (!cart.length) return toast("กรุณาเลือกเมนูก่อน");
  const token = source === "customer" ? $("customerToken").value.trim() : $("staffToken").value;
  if (!token) return toast("กรุณาระบุหมายเลขคิว");
  if (!isTokenAvailable(token)) return toast("หมายเลขคิวนี้ไม่พร้อมใช้งาน กรุณาตรวจสอบอีกครั้ง");
  const summary = cartSummary(cartName);
  const paymentMethod = source === "customer" ? $("customerPayment").value : $("paymentMethod").value;
  const paidNow = source === "staff";
  const cash = Number($("cashReceived").value || 0);
  const transfer = Number($("transferReceived").value || 0);
  if (source === "staff" && cash + transfer < summary.total) return toast("จำนวนเงินที่รับยังไม่ครบ");
  const order = {
    id: crypto.randomUUID(),
    branchId: state.activeBranchId,
    orderNo: nextOrderNo(),
    queueToken: token,
    source,
    customerName: source === "customer" ? $("customerName").value.trim() : "",
    customerPhone: source === "customer" ? $("customerPhone").value.trim() : "",
    paymentMethod,
    cashReceived: source === "staff" ? cash : 0,
    transferReceived: source === "staff" ? transfer : 0,
    subtotal: summary.subtotal,
    discount: summary.discount,
    total: summary.total,
    promotion: summary.promo,
    status: paidNow ? "in_kitchen" : "pending_payment",
    createdAt: new Date().toISOString(),
    paidAt: paidNow ? new Date().toISOString() : null,
    items: cart.map((line) => ({ ...line, done: false })),
  };
  state.orders.unshift(order);
  carts[cartName] = [];
  $("customerToken").value = "";
  $("customerName").value = "";
  $("customerPhone").value = "";
  $("cashReceived").value = "";
  $("transferReceived").value = "";
  saveState();
  if (paidNow) notifyKitchen();
  render();
  printReceipt(order.id);
  toast(paidNow ? "ส่งออเดอร์เข้าครัวแล้ว" : "ส่งออเดอร์แล้ว รอพนักงานยืนยันชำระเงิน");
}

function confirmPayment(orderId) {
  const order = state.orders.find((item) => item.id === orderId);
  order.status = "in_kitchen";
  order.paidAt = new Date().toISOString();
  order.cashReceived = order.paymentMethod === "cash" ? order.total : 0;
  order.transferReceived = order.paymentMethod === "transfer" ? order.total : 0;
  saveState();
  notifyKitchen();
  render();
}

function renderPayments() {
  const pending = state.orders.filter((order) => order.branchId === state.activeBranchId && order.status === "pending_payment");
  $("paymentBoard").innerHTML = pending.length ? pending.map(orderCardPayment).join("") : `<p class="pill">ไม่มีออเดอร์รอยืนยันชำระเงิน</p>`;
}

function orderCardPayment(order) {
  return `
    <article class="order-card">
      <header><div><h3>${order.orderNo}</h3><span>${dateFmt.format(new Date(order.createdAt))}</span></div><span class="queue">คิว ${order.queueToken}</span></header>
      <div>${order.items.map(itemLine).join("")}</div>
      <div class="total-line final"><span>ยอดชำระ</span><strong>${fmt.format(order.total)}</strong></div>
      <p>วิธีชำระ: ${paymentName(order.paymentMethod)} ${order.customerName ? ` / ${order.customerName}` : ""}</p>
      <button class="primary" data-confirm-payment="${order.id}">ยืนยันชำระเงินและส่งเข้าครัว</button>
      <button class="secondary" data-cancel-order="${order.id}">ยกเลิกออเดอร์</button>
    </article>
  `;
}

function renderKitchen() {
  const active = state.orders.filter((order) => order.branchId === state.activeBranchId && order.status === "in_kitchen");
  const done = state.orders.filter((order) => order.branchId === state.activeBranchId && order.status === "ready");
  const list = state.kitchenTab === "active" ? active : done;
  $("kitchenBoard").innerHTML = list.length ? list.map(orderCardKitchen).join("") : `<p class="pill">ไม่มีรายการ</p>`;
}

function orderCardKitchen(order) {
  return `
    <article class="order-card">
      <header><div><h3>${order.orderNo}</h3><span>${dateFmt.format(new Date(order.createdAt))}</span></div><span class="queue">คิว ${order.queueToken}</span></header>
      <div>${order.items.map((line, index) => {
        const item = state.menu.find((menuItem) => menuItem.id === line.menuId);
        return `
          <label class="check-line">
            <input type="checkbox" data-item-done="${order.id}" data-index="${index}" ${line.done ? "checked" : ""}>
            <span>${line.qty} x ${menuName(item)}<br><small>${line.options.map((option) => `${option.group}: ${option.label}`).join(", ")}</small></span>
            <strong>${item.sku}</strong>
          </label>
        `;
      }).join("")}</div>
      ${order.status === "in_kitchen" ? `<button class="primary" data-order-ready="${order.id}">อาหารเสร็จแล้ว</button>` : `<span class="pill">พร้อมเรียกคิว ${order.queueToken}</span>`}
    </article>
  `;
}

function renderPickup() {
  const ready = state.orders.filter((order) => order.branchId === state.activeBranchId && order.status === "ready");
  $("pickupBoard").innerHTML = ready.length
    ? ready.map((order) => `
      <article class="order-card">
        <header><div><h3>${order.orderNo}</h3><span>เรียกลูกค้าคิว ${order.queueToken}</span></div><span class="queue">คิว ${order.queueToken}</span></header>
        <button class="primary" data-picked-up="${order.id}">รับอาหารแล้ว / คืน token แล้ว</button>
        <button class="secondary" data-print="${order.id}">พิมพ์บิลอีกครั้ง</button>
      </article>
    `).join("")
    : `<p class="pill">ยังไม่มีออเดอร์ที่พร้อมรับ</p>`;
}

function itemLine(line) {
  const item = state.menu.find((menuItem) => menuItem.id === line.menuId);
  return `<div class="total-line"><span>${line.qty} x ${menuName(item)}</span><strong>${fmt.format(linePrice(line))}</strong></div>`;
}

function paymentName(method) {
  return { cash: "เงินสด", transfer: "โอน/QR", mixed: "ผสม" }[method] || method;
}

function renderReports() {
  const start = $("reportStart").value;
  const end = $("reportEnd").value;
  const rows = state.orders.filter((order) => {
    if (order.branchId !== state.activeBranchId) return false;
    const day = order.createdAt.slice(0, 10);
    return (!start || day >= start) && (!end || day <= end);
  });
  const paid = rows.filter((order) => !["pending_payment", "cancelled"].includes(order.status));
  const sales = paid.reduce((sum, order) => sum + order.total, 0);
  const cancelled = rows.filter((order) => order.status === "cancelled").length;
  $("metricGrid").innerHTML = `
    <div class="metric"><span>ยอดขาย</span><strong>${fmt.format(sales)}</strong></div>
    <div class="metric"><span>จำนวนออเดอร์</span><strong>${paid.length}</strong></div>
    <div class="metric"><span>ยกเลิก</span><strong>${cancelled}</strong></div>
  `;
  $("reportRows").innerHTML = rows
    .map((order) => `
      <tr>
        <td>${dateFmt.format(new Date(order.createdAt))}</td>
        <td>${order.orderNo}</td>
        <td>${order.queueToken}</td>
        <td>${order.items.map((line) => {
          const item = state.menu.find((menuItem) => menuItem.id === line.menuId);
          return `${line.qty} x ${menuName(item)}`;
        }).join("<br>")}</td>
        <td>${paymentName(order.paymentMethod)}</td>
        <td>${fmt.format(order.total)}</td>
        <td>${statusName(order.status)}</td>
      </tr>
    `)
    .join("");
}

function statusName(status) {
  return { pending_payment: "รอชำระ", in_kitchen: "อยู่ในครัว", ready: "อาหารพร้อม", picked_up: "รับแล้ว", cancelled: "ยกเลิก" }[status] || status;
}

function renderAdmin() {
  const allowed = currentUser().role === "super_admin";
  $("adminGuard").classList.toggle("active", !allowed);
  $("adminGuard").innerHTML = !allowed
    ? `<strong>Access denied</strong><br>หน้านี้สำหรับ Mustang franchise owner / superuser เท่านั้น ตอนนี้คุณกำลังทดสอบ role: ${currentRole().label}`
    : "";
  document.querySelectorAll("#admin .admin-grid .panel").forEach((panel) => panel.classList.toggle("hidden", !allowed));
  if (!allowed) return;

  $("roleAdmin").innerHTML = `
    <div class="admin-list">
      ${state.users.map((user) => `
        <div class="admin-row">
          <span>
            <strong>${user.name}</strong><br>
            <small>${roles[user.role]?.label || user.role} / ${user.branchIds.map((id) => state.branches.find((branchItem) => branchItem.id === id)?.nameTh || id).join(", ")}</small>
          </span>
          <div class="role-matrix">
            <select data-user-role="${user.id}">
              ${Object.entries(roles).map(([roleId, role]) => `<option value="${roleId}" ${user.role === roleId ? "selected" : ""}>${role.label}</option>`).join("")}
            </select>
            <select data-user-branch="${user.id}">
              ${state.branches.map((branchItem) => `<option value="${branchItem.id}" ${user.branchIds.includes(branchItem.id) ? "selected" : ""}>${branchItem.nameTh}</option>`).join("")}
            </select>
          </div>
        </div>
      `).join("")}
    </div>
    <div class="admin-form">
      <label class="field"><span>ชื่อผู้ใช้ใหม่</span><input id="newUserName" placeholder="Branch Staff"></label>
      <label class="field"><span>Role</span><select id="newUserRole">${Object.entries(roles).map(([roleId, role]) => `<option value="${roleId}">${role.label}</option>`).join("")}</select></label>
      <label class="field"><span>Branch</span><select id="newUserBranch">${state.branches.map((branchItem) => `<option value="${branchItem.id}">${branchItem.nameTh}</option>`).join("")}</select></label>
      <button class="primary" id="addUser">เพิ่ม mock user</button>
    </div>
  `;

  $("branchAdmin").innerHTML = `
    <div class="admin-list">
      ${state.branches.map((item) => `
        <div class="admin-row">
          <span>
            <strong>${item.nameTh}</strong><br>
            <small>${item.nameEn} / ${item.tokens.length} tokens / ${item.templateMode === "linked" ? "Linked template" : "Copied template"}</small>
          </span>
          <button class="secondary" data-switch-branch="${item.id}">${item.id === state.activeBranchId ? "กำลังใช้" : "เปิดสาขา"}</button>
        </div>
      `).join("")}
    </div>
    <div class="admin-form">
      <label class="field"><span>ชื่อสาขาไทย</span><input id="newBranchTh" placeholder="Mustang Cafe สาขาใหม่"></label>
      <label class="field"><span>Branch English name</span><input id="newBranchEn" placeholder="Mustang Cafe New Branch"></label>
      <label class="field"><span>Queue tokens</span><input id="newBranchTokens" placeholder="1,2,3,4,5,6,7,8"></label>
      <button class="primary" id="addBranch">เพิ่มสาขา</button>
    </div>
  `;

  $("templateAdmin").innerHTML = `
    <div class="admin-list">
      <div class="admin-row">
        <span><strong>Master template v${state.masterTemplate.version}</strong><br><small>${state.masterTemplate.menuIds.length} menu items / branches can link or copy</small></span>
        <button class="secondary" id="publishTemplate">Publish update</button>
      </div>
      <div class="admin-row">
        <span>โหมดของสาขานี้<br><small>${branch().templateMode === "linked" ? "Linked: รับเมนูหลักจาก Mustang" : "Copied: คัดลอกแล้วแก้เองได้"}</small></span>
        <button class="secondary" id="toggleTemplateMode">${branch().templateMode === "linked" ? "เปลี่ยนเป็น Copy" : "เปลี่ยนเป็น Linked"}</button>
      </div>
      <div class="admin-row">
        <span>Apply master menu to this branch<br><small>สำหรับต้นแบบนี้จะบันทึกสถานะ version ให้สาขา</small></span>
        <button class="secondary" id="applyTemplate">Apply template</button>
      </div>
    </div>
  `;

  $("tokenAdmin").innerHTML = `<div class="admin-list">${branch().tokens.map((token) => `
    <div class="admin-row">
      <span>Token ${token.label} - ${tokenLabel(tokenStatus(token))}</span>
      <button class="secondary" data-toggle-token="${token.id}">${token.active ? "เปิดใช้" : "ปิด"}</button>
    </div>
  `).join("")}</div>
  <div class="admin-form">
    <label class="field"><span>Token list ของสาขานี้</span><input id="branchTokenList" value="${branch().tokens.map((token) => token.label).join(",")}"></label>
    <label class="field"><span>QR / bank label</span><input id="branchQrLabel" value="${branch().qrLabel || ""}"></label>
    <button class="primary" id="saveBranchSettings">บันทึกคิวและ QR ของสาขา</button>
  </div>`;
  $("menuAdmin").innerHTML = `<div class="admin-list">${state.menu.map((item) => `
    <div class="admin-row">
      <span><strong>${item.th}</strong><br><small>${item.sku} / ${fmt.format(item.price)}</small></span>
      <button class="secondary" data-toggle-menu="${item.id}">${item.available ? "ขายอยู่" : "ซ่อน"}</button>
    </div>
  `).join("")}</div>`;
  $("promoAdmin").innerHTML = `<div class="admin-list">${state.promotions.filter((promo) => promo.id !== "none").map((promo) => `
    <div class="admin-row">
      <span>${promo.nameTh}</span>
      <button class="secondary" data-toggle-promo="${promo.id}">${promo.active ? "เปิดใช้" : "ปิด"}</button>
    </div>
  `).join("")}</div>`;
}

function printReceipt(orderId) {
  const order = state.orders.find((item) => item.id === orderId);
  const node = document.createElement("div");
  node.className = "receipt";
  node.innerHTML = `
    <img src="assets/mustang-logo.png" alt="">
    <h2>Mustang Cafe</h2>
    <p>${branch().nameTh}</p>
    <p>${order.orderNo} / Queue ${order.queueToken}</p>
    <p>${dateFmt.format(new Date(order.createdAt))}</p>
    <div class="line"></div>
    ${order.items.map((line) => {
      const item = state.menu.find((menuItem) => menuItem.id === line.menuId);
      return `<div class="row"><span>${line.qty} x ${item.th}</span><strong>${fmt.format(linePrice(line))}</strong></div>`;
    }).join("")}
    <div class="line"></div>
    <div class="row"><span>Subtotal</span><strong>${fmt.format(order.subtotal)}</strong></div>
    <div class="row"><span>Discount</span><strong>${fmt.format(order.discount)}</strong></div>
    <div class="row"><span>Total</span><strong>${fmt.format(order.total)}</strong></div>
    <div class="row"><span>Payment</span><strong>${paymentName(order.paymentMethod)}</strong></div>
    <div class="line"></div>
    <p>ขอบคุณค่ะ / Thank you</p>
  `;
  document.body.appendChild(node);
  window.print();
  window.setTimeout(() => node.remove(), 500);
}

function notifyKitchen() {
  $("ding").play().catch(() => {});
}

function exportCsv() {
  const rows = [["time", "order_no", "queue", "items", "payment", "subtotal", "discount", "total", "status"]];
  state.orders
    .filter((order) => order.branchId === state.activeBranchId)
    .forEach((order) => {
      rows.push([
        order.createdAt,
        order.orderNo,
        order.queueToken,
        order.items.map((line) => {
          const item = state.menu.find((menuItem) => menuItem.id === line.menuId);
          return `${line.qty}x ${item.th}`;
        }).join("; "),
        order.paymentMethod,
        order.subtotal,
        order.discount,
        order.total,
        order.status,
      ]);
    });
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `mustang-orders-${todayKey()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function requireSuperuser() {
  if (currentUser().role === "super_admin") return true;
  toast("เฉพาะ Mustang superuser เท่านั้น");
  return false;
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("button, input");
  if (!target) return;
  if (target.dataset.view) {
    showView(target.dataset.view);
  }
  if (target.dataset.cat) {
    selectedCategory = target.dataset.cat;
    renderTabs();
    renderMenus();
  }
  if (target.dataset.customerCat) {
    selectedCustomerCategory = target.dataset.customerCat;
    renderTabs();
    renderMenus();
  }
  if (target.dataset.menuId) addToCart(target.dataset.cart, state.menu.find((item) => item.id === target.dataset.menuId));
  if (target.dataset.cartAct) {
    const line = carts[target.dataset.cart][Number(target.dataset.index)];
    line.qty += target.dataset.cartAct === "inc" ? 1 : -1;
    if (line.qty <= 0) carts[target.dataset.cart].splice(Number(target.dataset.index), 1);
    renderCarts();
  }
  if (target.id === "completeStaffOrder") createOrder("staff");
  if (target.id === "submitCustomerOrder") createOrder("customer");
  if (target.dataset.confirmPayment) confirmPayment(target.dataset.confirmPayment);
  if (target.dataset.cancelOrder) {
    const order = state.orders.find((item) => item.id === target.dataset.cancelOrder);
    order.status = "cancelled";
    saveState();
    render();
  }
  if (target.dataset.itemDone) {
    const order = state.orders.find((item) => item.id === target.dataset.itemDone);
    order.items[Number(target.dataset.index)].done = target.checked;
    saveState();
    renderKitchen();
  }
  if (target.dataset.orderReady) {
    const order = state.orders.find((item) => item.id === target.dataset.orderReady);
    if (!order.items.every((item) => item.done)) return toast("กรุณาติ๊กว่าทำครบทุกเมนูก่อน");
    order.status = "ready";
    order.readyAt = new Date().toISOString();
    saveState();
    render();
  }
  if (target.dataset.pickedUp) {
    const order = state.orders.find((item) => item.id === target.dataset.pickedUp);
    order.status = "picked_up";
    order.pickedUpAt = new Date().toISOString();
    saveState();
    render();
  }
  if (target.dataset.print) printReceipt(target.dataset.print);
  if (target.dataset.kitchenTab) {
    state.kitchenTab = target.dataset.kitchenTab;
    document.querySelectorAll("[data-kitchen-tab]").forEach((button) => button.classList.toggle("active", button.dataset.kitchenTab === state.kitchenTab));
    renderKitchen();
  }
  if (target.dataset.toggleToken) {
    const token = branch().tokens.find((item) => item.id === target.dataset.toggleToken);
    if (tokenStatus(token) !== "available") return toast("Token นี้กำลังใช้งานอยู่");
    token.active = !token.active;
    saveState();
    render();
  }
  if (target.dataset.toggleMenu) {
    const item = state.menu.find((menuItem) => menuItem.id === target.dataset.toggleMenu);
    item.available = !item.available;
    saveState();
    render();
  }
  if (target.dataset.togglePromo) {
    const promo = state.promotions.find((item) => item.id === target.dataset.togglePromo);
    promo.active = !promo.active;
    saveState();
    render();
  }
  if (target.dataset.switchBranch) {
    if (!requireSuperuser()) return;
    state.activeBranchId = target.dataset.switchBranch;
    carts = { staff: [], customer: [] };
    saveState();
    render();
  }
  if (target.id === "addBranch") {
    if (!requireSuperuser()) return;
    const nameTh = $("newBranchTh").value.trim();
    const nameEn = $("newBranchEn").value.trim() || nameTh;
    const tokens = tokensFromText($("newBranchTokens").value || "1,2,3,4,5,6,7,8");
    if (!nameTh || !tokens.length) return toast("กรุณาใส่ชื่อสาขาและ token");
    const id = `branch-${Date.now()}`;
    state.branches.push({ id, nameTh, nameEn, tokens, qrLabel: `บัญชี ${nameTh}`, templateMode: "linked", templateVersion: state.masterTemplate.version });
    state.activeBranchId = id;
    saveState();
    render();
    toast("เพิ่มสาขาแล้ว");
  }
  if (target.id === "saveBranchSettings") {
    if (!requireSuperuser()) return;
    const tokens = tokensFromText($("branchTokenList").value);
    if (!tokens.length) return toast("ต้องมี token อย่างน้อย 1 หมายเลข");
    if (branch().tokens.some((token) => tokenStatus(token) !== "available" && !tokens.some((next) => next.label === token.label))) {
      return toast("ไม่สามารถลบ token ที่กำลังใช้งาน");
    }
    branch().tokens = tokens;
    branch().qrLabel = $("branchQrLabel").value.trim();
    saveState();
    render();
    toast("บันทึกข้อมูลสาขาแล้ว");
  }
  if (target.id === "publishTemplate") {
    if (!requireSuperuser()) return;
    state.masterTemplate.version += 1;
    state.masterTemplate.updatedAt = new Date().toISOString();
    state.masterTemplate.menuIds = state.menu.filter((item) => item.available).map((item) => item.id);
    state.branches.filter((item) => item.templateMode === "linked").forEach((item) => {
      item.templateVersion = state.masterTemplate.version;
    });
    saveState();
    render();
    toast("Publish Mustang menu template แล้ว");
  }
  if (target.id === "toggleTemplateMode") {
    if (!requireSuperuser()) return;
    branch().templateMode = branch().templateMode === "linked" ? "copied" : "linked";
    if (branch().templateMode === "linked") branch().templateVersion = state.masterTemplate.version;
    saveState();
    render();
  }
  if (target.id === "applyTemplate") {
    if (!requireSuperuser()) return;
    branch().templateVersion = state.masterTemplate.version;
    saveState();
    render();
    toast("Apply template ให้สาขานี้แล้ว");
  }
  if (target.id === "exportCsv") exportCsv();
  if (target.id === "addUser") {
    if (!requireSuperuser()) return;
    const name = $("newUserName").value.trim();
    if (!name) return toast("กรุณาใส่ชื่อผู้ใช้");
    state.users.push({
      id: `u-${Date.now()}`,
      name,
      role: $("newUserRole").value,
      branchIds: [$("newUserBranch").value],
      active: true,
    });
    saveState();
    render();
    toast("เพิ่ม mock user แล้ว");
  }
  if (target.id === "seedReset") {
    state = structuredClone(seedState);
    carts = { staff: [], customer: [] };
    saveState();
    render();
    toast("รีเซ็ตข้อมูลตัวอย่างแล้ว");
  }
  if (target.id === "langToggle") {
    state.language = state.language === "th" ? "en" : "th";
    saveState();
    render();
  }
});

document.addEventListener("change", (event) => {
  const target = event.target;
  if (target.id === "userSelect") {
    state.activeUserId = target.value;
    enforceBranchAccess();
    saveState();
    render();
    showView(isAdminRoute() ? "admin" : currentRole().views[0], false);
  }
  if (target.dataset.userRole) {
    if (!requireSuperuser()) return;
    const user = state.users.find((item) => item.id === target.dataset.userRole);
    user.role = target.value;
    if (user.id === state.activeUserId) enforceBranchAccess();
    saveState();
    render();
  }
  if (target.dataset.userBranch) {
    if (!requireSuperuser()) return;
    const user = state.users.find((item) => item.id === target.dataset.userBranch);
    user.branchIds = [target.value];
    if (user.id === state.activeUserId) enforceBranchAccess();
    saveState();
    render();
  }
  if (target.dataset.cartOption) {
    const line = carts[target.dataset.cartOption][Number(target.dataset.index)];
    const item = state.menu.find((menuItem) => menuItem.id === line.menuId);
    const group = item.options.find((optionGroup) => optionGroup.id === target.dataset.group);
    const choice = group.choices.find((itemChoice) => itemChoice.th === target.value);
    const next = { groupId: group.id, group: group.th, label: choice.th, price: choice.price || 0, required: group.required };
    const optionIndex = line.options.findIndex((option) => option.groupId === group.id);
    if (optionIndex >= 0) line.options[optionIndex] = next;
    else line.options.push(next);
    renderCarts();
  }
});

["cashReceived", "transferReceived", "promotionSelect", "menuSearch"].forEach((id) => {
  document.addEventListener("input", (event) => {
    if (event.target.id === id) {
      renderMenus();
      renderCarts();
    }
  });
});

$("branchSelect").addEventListener("change", (event) => {
  if (!currentRole().canSwitchBranches) {
    event.target.value = state.activeBranchId;
    return toast("Role นี้ดูได้เฉพาะสาขาที่ได้รับสิทธิ์");
  }
  state.activeBranchId = event.target.value;
  carts = { staff: [], customer: [] };
  saveState();
  render();
});

["reportStart", "reportEnd"].forEach((id) => $(id).addEventListener("change", renderReports));

window.addEventListener("online", () => {
  $("syncStatus").textContent = "Online";
  $("syncStatus").classList.add("dark");
});

window.addEventListener("offline", () => {
  $("syncStatus").textContent = "Offline ready";
  $("syncStatus").classList.remove("dark");
});

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

const today = todayKey();
$("reportStart").value = today;
$("reportEnd").value = today;
$("syncStatus").textContent = navigator.onLine ? "Online" : "Offline ready";
render();
showView(isAdminRoute() ? "admin" : location.hash.replace("#", "") || currentRole().views[0] || "pos", false);
