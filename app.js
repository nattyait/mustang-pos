const STORAGE_KEY = "mustang-franchise-pos-v1";
const EVENT_KEY = "mustang-franchise-pos-event";
const CART_KEY = "mustang-franchise-pos-draft-carts";
const SERVER_SYNC = location.protocol.startsWith("http");
const realtimeChannel = "BroadcastChannel" in window ? new BroadcastChannel("mustang-franchise-pos") : null;
const PAGE_ID = crypto.randomUUID();

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
      variants: [
        { id: "hot", th: "ร้อน", en: "Hot", price: 89, active: true },
        { id: "iced", th: "เย็น", en: "Iced", price: 99, active: true },
        { id: "blended", th: "ปั่น", en: "Blended", price: 109, active: true },
      ],
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
    views: ["pos", "customer", "payments", "kitchen", "pickup", "reports", "admin", "menus"],
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
let carts = loadDraftCarts();
let selectedCategory = "signature";
let selectedCustomerCategory = "signature";
let lastStoredStateRaw = localStorage.getItem(STORAGE_KEY);
let lastMenuActivation = { id: "", at: 0 };
let uploadedMenuImageDataUrl = "";
let editingMenuId = "";
let editingCategoryId = "";
let lastLocalWriteAt = 0;
let stateSavePromise = Promise.resolve();

const $ = (id) => document.getElementById(id);
const fmt = new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 });
const dateFmt = new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Bangkok" });

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return normalizeState(structuredClone(seedState));
  try {
    return normalizeState(JSON.parse(raw));
  } catch {
    return normalizeState(structuredClone(seedState));
  }
}

function normalizeState(rawState) {
  const next = { ...structuredClone(seedState), ...rawState };
  next.masterTemplate = next.masterTemplate || structuredClone(seedState.masterTemplate);
  next.users = next.users || structuredClone(seedState.users);
  next.activeUserId = next.activeUserId || "u-super";
  next.branches = next.branches.map((item) => ({
    templateMode: "linked",
    templateVersion: next.masterTemplate?.version || 1,
    ...item,
    tokens: item.tokens || [],
  }));
  next.menu = (next.menu || []).map(normalizeMenuItem);
  next.orders = (next.orders || []).map((order) => ({
    ...order,
    items: (order.items || []).map(normalizeCartLine),
  }));
  return next;
}

function normalizeMenuItem(item) {
  const options = Array.isArray(item.options) ? item.options : [];
  const variants = Array.isArray(item.variants) && item.variants.length
    ? item.variants
    : [{ id: "default", th: "ราคาเดียว", en: "Single price", price: Number(item.price || 0), active: true }];
  const normalizedVariants = variants
    .map((variant, index) => ({
      id: String(variant.id || slugify(variant.th || variant.en || `variant-${index + 1}`) || `variant-${index + 1}`),
      th: variant.th || variant.en || `ราคา ${index + 1}`,
      en: variant.en || variant.th || `Price ${index + 1}`,
      price: Number(variant.price ?? item.price ?? 0),
      active: variant.active !== false,
    }))
    .filter((variant) => variant.price > 0);
  const fallback = normalizedVariants.length ? normalizedVariants : [{ id: "default", th: "ราคาเดียว", en: "Single price", price: Number(item.price || 0), active: true }];
  return {
    ...item,
    price: Number(item.price || fallback[0]?.price || 0),
    variants: fallback,
    options,
  };
}

function normalizeCartLine(line) {
  if (!line) return line;
  const variant = line.variant || null;
  return {
    ...line,
    variant,
    basePrice: Number(line.basePrice ?? variant?.price ?? 0),
    options: Array.isArray(line.options) ? line.options : [],
    optionGroups: Array.isArray(line.optionGroups) ? line.optionGroups : [],
  };
}

function loadDraftCarts() {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(CART_KEY) || "{}");
    return {
      staff: Array.isArray(parsed.staff) ? parsed.staff.map(normalizeCartLine) : [],
      customer: Array.isArray(parsed.customer) ? parsed.customer.map(normalizeCartLine) : [],
    };
  } catch {
    return { staff: [], customer: [] };
  }
}

function saveDraftCarts() {
  sessionStorage.setItem(CART_KEY, JSON.stringify(carts));
}

async function saveState() {
  lastLocalWriteAt = Date.now();
  lastStoredStateRaw = JSON.stringify(state);
  localStorage.setItem(STORAGE_KEY, lastStoredStateRaw);
  if (SERVER_SYNC) {
    stateSavePromise = fetch("/api/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state }),
    }).catch(() => {});
    await stateSavePromise;
  }
}

function reloadState() {
  state = loadState();
  enforceBranchAccess();
}

async function fetchServerState({ notify = false } = {}) {
  if (!SERVER_SYNC) return;
  if (Date.now() - lastLocalWriteAt < 1800) return;
  try {
    const previousKitchenIds = new Set(
      state.orders.filter((order) => order.branchId === state.activeBranchId && order.status === "in_kitchen").map((order) => order.id)
    );
    const response = await fetch("/api/state", { cache: "no-store" });
    if (!response.ok) return;
    const data = await response.json();
    if (!data.state) {
      await saveState();
      return;
    }
    state = normalizeState(data.state);
    lastStoredStateRaw = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, lastStoredStateRaw);
    enforceBranchAccess();
    render();
    if (!notify) return;
    const newKitchenOrder = state.orders.find(
      (order) => order.branchId === state.activeBranchId && order.status === "in_kitchen" && !previousKitchenIds.has(order.id)
    );
    if (newKitchenOrder) notifyKitchen(newKitchenOrder);
  } catch {
    $("syncStatus").textContent = "Local only";
  }
}

async function broadcastEvent(type, payload = {}) {
  const event = { type, payload, at: Date.now(), sourceId: PAGE_ID };
  localStorage.setItem(EVENT_KEY, JSON.stringify(event));
  realtimeChannel?.postMessage(event);
  if (SERVER_SYNC) {
    fetch("/api/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...event, state }),
    }).catch(() => {});
  }
}

function handleRealtimeEvent(event) {
  if (!event || event.sourceId === PAGE_ID) return;
  if (event.type === "state_updated") {
    reloadState();
    render();
  }
  if (event.type === "new_kitchen_order") {
    reloadState();
    render();
    notifyKitchen(event.payload);
  }
  if (event.type === "pending_payment_order") {
    reloadState();
    render();
    toast(`มีออเดอร์รอยืนยันชำระเงิน ${event.payload.orderNo} / คิว ${event.payload.queueToken}`);
  }
}

function syncStateFromStorage({ notify = false } = {}) {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw || raw === lastStoredStateRaw) return;
  const previousKitchenIds = new Set(
    state.orders.filter((order) => order.branchId === state.activeBranchId && order.status === "in_kitchen").map((order) => order.id)
  );
  lastStoredStateRaw = raw;
  reloadState();
  render();
  if (!notify) return;
  const newKitchenOrder = state.orders.find(
    (order) => order.branchId === state.activeBranchId && order.status === "in_kitchen" && !previousKitchenIds.has(order.id)
  );
  if (newKitchenOrder) notifyKitchen(newKitchenOrder);
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

function variantName(variant) {
  if (!variant) return "";
  return state.language === "en" ? variant.en || variant.th : variant.th || variant.en;
}

function activeVariants(item) {
  const normalized = normalizeMenuItem(item);
  return normalized.variants.filter((variant) => variant.active !== false && variant.price > 0);
}

function defaultVariant(item) {
  return activeVariants(item)[0] || normalizeMenuItem(item).variants[0];
}

function hasRealVariants(item) {
  return activeVariants(item).some((variant) => variant.id !== "default" || !["ราคาเดียว", "Single price"].includes(variant.th));
}

function menuPriceLabel(item) {
  const variants = activeVariants(item);
  if (!variants.length) return fmt.format(item.price || 0);
  if (variants.length === 1) return fmt.format(variants[0].price);
  const prices = variants.map((variant) => Number(variant.price || 0));
  return `${fmt.format(Math.min(...prices))} - ${fmt.format(Math.max(...prices))}`;
}

function lineDisplayName(line) {
  const item = lineMenu(line);
  const variant = line.variant;
  return variant ? `${menuName(item)} - ${variantName(variant)}` : menuName(item);
}

function optionSummary(line) {
  const parts = [];
  if (line.variant) parts.push(`รูปแบบ: ${variantName(line.variant)}`);
  parts.push(...(line.options || []).map((option) => `${option.group}: ${option.label}`));
  return parts.join(", ");
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
  return item.options.filter((group) => group.required).map((group) => {
    const choice = group.choices[0];
    return { groupId: group.id, group: group.th, label: choice.th, price: choice.price || 0, required: group.required };
  });
}

function addToCart(cartName, item, variant = null) {
  cartName = cartName === "customer" ? "customer" : "staff";
  if (!carts[cartName]) carts[cartName] = [];
  const selectedVariant = variant || defaultVariant(item);
  const storedVariant = hasRealVariants(item) ? selectedVariant : null;
  const choices = defaultOptions(item);
  const key = `${item.id}:${selectedVariant?.id || "default"}:${choices.map((choice) => `${choice.groupId}-${choice.label}`).join("|")}`;
  const existing = carts[cartName].find((line) => line.key === key);
  if (existing) {
    existing.qty += 1;
  } else {
    carts[cartName].push({
      key,
      menuId: item.id,
      sku: item.sku,
      nameTh: item.th,
      nameEn: item.en,
      variant: storedVariant ? structuredClone(storedVariant) : null,
      basePrice: Number(selectedVariant?.price ?? item.price ?? 0),
      optionGroups: structuredClone(item.options || []),
      qty: 1,
      options: choices,
      note: "",
    });
  }
  saveDraftCarts();
  renderCarts();
  window.requestAnimationFrame(() => renderCart(cartName, cartName === "customer" ? "customerCartList" : "cartList", cartName === "customer" ? "customerTotals" : "cartTotals"));
  toast(`เพิ่ม ${menuName(item)}${storedVariant ? ` - ${variantName(storedVariant)}` : ""} แล้ว`);
}

function lineMenu(line) {
  const item = state.menu.find((menuItem) => menuItem.id === line.menuId);
  return {
    id: line.menuId,
    sku: line.sku || item?.sku || "",
    th: line.nameTh || item?.th || "เมนู",
    en: line.nameEn || item?.en || line.nameTh || "Menu",
    price: Number(line.basePrice ?? line.variant?.price ?? item?.price ?? 0),
    options: line.optionGroups || item?.options || [],
  };
}

function linePrice(line) {
  const item = lineMenu(line);
  const optionTotal = (line.options || []).reduce((sum, option) => sum + (option.price || 0), 0);
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
  renderMenuManagement();
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

function slugify(text) {
  return String(text || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9ก-๙]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function nextSku(categoryId) {
  const prefixMap = { signature: "SIG", "cha-chak": "CHA", roti: "ROT", food: "FOOD" };
  const prefix = prefixMap[categoryId] || categoryId.slice(0, 4).toUpperCase();
  const numbers = state.menu
    .filter((item) => item.sku?.startsWith(`${prefix}-`))
    .map((item) => Number(item.sku.split("-")[1] || 0))
    .filter(Boolean);
  return `${prefix}-${String(Math.max(0, ...numbers) + 1).padStart(3, "0")}`;
}

function buildOptionGroups(flags) {
  const groups = [];
  if (flags.sweetness) {
    groups.push({ id: "sweet", th: "ความหวาน", required: true, choices: [{ th: "หวานน้อย" }, { th: "ปกติ" }, { th: "หวานมาก" }] });
  }
  if (flags.ice) {
    groups.push({ id: "ice", th: "น้ำแข็ง", required: true, choices: [{ th: "ปกติ" }, { th: "น้อย" }, { th: "ไม่ใส่น้ำแข็ง" }] });
  }
  return groups;
}

function defaultMenuVariants() {
  return [
    { id: "hot", th: "ร้อน", en: "Hot", price: 0, active: true },
    { id: "iced", th: "เย็น", en: "Iced", price: 0, active: true },
    { id: "blended", th: "ปั่น", en: "Blended", price: 0, active: true },
  ];
}

function variantsForForm(item) {
  if (!item) return defaultMenuVariants();
  const variants = activeVariants(item).length ? normalizeMenuItem(item).variants : defaultMenuVariants();
  if (variants.length === 1 && variants[0].id === "default") return defaultMenuVariants();
  return variants;
}

function readPriceVariantsFromForm(basePrice) {
  const mode = $("priceMode")?.value || "single";
  if (mode === "single") {
    return [{ id: "default", th: "ราคาเดียว", en: "Single price", price: basePrice, active: true }];
  }
  const variants = [...document.querySelectorAll("[data-price-variant-row]")]
    .map((row, index) => {
      const th = row.querySelector("[data-variant-th]")?.value.trim() || "";
      const en = row.querySelector("[data-variant-en]")?.value.trim() || th;
      const price = Number(row.querySelector("[data-variant-price]")?.value || 0);
      const active = row.querySelector("[data-variant-active]")?.checked !== false;
      const id = row.dataset.variantId || slugify(en || th || `variant-${index + 1}`) || `variant-${index + 1}`;
      return { id, th, en, price, active };
    })
    .filter((variant) => variant.th && variant.price > 0);
  if (!variants.length) return null;
  return variants;
}

function readMenuForm(existingId = "") {
  const existing = existingId ? state.menu.find((item) => item.id === existingId) : null;
  const categoryId = $("newMenuCategory").value;
  const th = $("newMenuTh").value.trim();
  const en = $("newMenuEn").value.trim() || th;
  const price = Number($("newMenuPrice").value || 0);
  const sku = $("newMenuSku").value.trim() || nextSku(categoryId);
  if (!th || price <= 0) {
    toast("กรุณาใส่ชื่อเมนูและราคา");
    return null;
  }
  const variants = readPriceVariantsFromForm(price);
  if (!variants) {
    toast("กรุณาใส่รูปแบบราคาอย่างน้อย 1 รายการ");
    return null;
  }
  if (state.menu.some((item) => item.id !== existingId && item.sku.toLowerCase() === sku.toLowerCase())) {
    toast("SKU นี้มีอยู่แล้ว");
    return null;
  }
  return {
    sku,
    categoryId,
    th,
    en,
    price: variants[0].price,
    variants,
    image: uploadedMenuImageDataUrl || $("newMenuImage").value.trim() || existing?.image || "assets/mustang-logo.png",
    available: true,
    options: buildOptionGroups({ sweetness: $("newMenuSweetness").checked, ice: $("newMenuIce").checked }),
  };
}

function nextCategorySort() {
  return Math.max(0, ...state.categories.map((cat) => Number(cat.sort || 0))) + 1;
}

function readCategoryForm(existingId = "") {
  const th = $("categoryTh").value.trim();
  const en = $("categoryEn").value.trim() || th;
  const sort = Number($("categorySort").value || nextCategorySort());
  const id = existingId || slugify($("categoryId").value.trim() || en || th);
  if (!th || !id) {
    toast("กรุณาใส่ชื่อหมวดหมู่");
    return null;
  }
  if (state.categories.some((cat) => cat.id !== existingId && cat.id.toLowerCase() === id.toLowerCase())) {
    toast("Category ID นี้มีอยู่แล้ว");
    return null;
  }
  return { id, th, en, sort };
}

function renderBranchSelect() {
  const branches = currentRole().canSwitchBranches ? state.branches : state.branches.filter((item) => currentUser().branchIds.includes(item.id));
  $("branchSelect").innerHTML = branches.map((item) => `<option value="${item.id}">${item.nameTh}</option>`).join("");
  $("branchSelect").value = state.activeBranchId;
}

function renderTabs() {
  const sortedCategories = [...state.categories].sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0));
  if (!sortedCategories.some((cat) => cat.id === selectedCategory)) selectedCategory = sortedCategories[0]?.id || "";
  if (!sortedCategories.some((cat) => cat.id === selectedCustomerCategory)) selectedCustomerCategory = sortedCategories[0]?.id || "";
  const tabs = sortedCategories
    .map((cat) => `<button class="${cat.id === selectedCategory ? "active" : ""}" data-cat="${cat.id}">${categoryName(cat)}</button>`)
    .join("");
  $("categoryTabs").innerHTML = tabs;
  $("customerTabs").innerHTML = sortedCategories
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
  const variants = activeVariants(item);
  const variantButtons = variants.length > 1
    ? `<span class="variant-buttons">${variants.map((variant) => `
        <button type="button" data-menu-variant="${item.id}" data-variant-id="${variant.id}" data-cart="${customer ? "customer" : "staff"}">
          <span>${variantName(variant)}</span>
          <strong>${fmt.format(variant.price)}</strong>
        </button>
      `).join("")}</span>`
    : "";
  return `
    <div class="menu-card" role="button" tabindex="0" data-menu-id="${item.id}" data-sku="${item.sku}" data-cart="${customer ? "customer" : "staff"}">
      <img src="${item.image}" alt="${menuName(item)}">
      <span class="info">
        <span class="sku">${item.sku}</span>
        <strong>${menuName(item)}</strong>
        <span>${item.options.length ? `${item.options.length} ตัวเลือก` : "ไม่มีตัวเลือก"}</span>
        <span class="price">${menuPriceLabel(item)}</span>
        ${variantButtons}
      </span>
    </div>
  `;
}

function renderCarts() {
  $("staffCartBadge").textContent = carts.staff.reduce((sum, line) => sum + line.qty, 0);
  $("customerCartBadge").textContent = carts.customer.reduce((sum, line) => sum + line.qty, 0);
  const selectedPromo = $("promotionSelect").value || "none";
  $("promotionSelect").innerHTML = state.promotions.filter((item) => item.active).map((promo) => `<option value="${promo.id}">${promo.nameTh}</option>`).join("");
  $("promotionSelect").value = state.promotions.some((promo) => promo.id === selectedPromo && promo.active) ? selectedPromo : "none";
  renderTokenSelect();
  renderCart("staff", "cartList", "cartTotals");
  renderCart("customer", "customerCartList", "customerTotals");
}

function renderTokenSelect() {
  renderTokenPicker("staffToken", "staffTokenButtons", "pick-token");
  renderTokenPicker("customerToken", "customerTokenButtons", "pick-customer-token");
}

function renderTokenPicker(inputId, buttonsId, actionName) {
  const selected = $(inputId).value;
  const tokenOptions = branch().tokens
    .filter((token) => token.active)
    .map((token) => ({ token, status: tokenStatus(token) }));
  if (selected && !isTokenAvailable(selected)) $(inputId).value = "";
  const current = $(inputId).value;
  $(buttonsId).innerHTML = `
    <div class="token-current">${current ? `เลือกคิว ${current}` : "กรุณาเลือกหมายเลขคิว"}</div>
    ${tokenOptions
      .map(({ token, status }) => {
        const active = current === token.label ? "active" : "";
        return `<button type="button" class="${active}" data-${actionName}="${token.label}" ${status !== "available" ? "disabled" : ""}>${token.label}</button>`;
      })
      .join("")}
  `;
}

function tokenLabel(status) {
  return { available: "ว่าง", waiting_payment: "รอชำระ", in_kitchen: "อยู่ในครัว", ready: "อาหารพร้อม" }[status];
}

function renderCart(cartName, listId, totalsId) {
  const cart = carts[cartName];
  if (cart.length) {
    const html = cart
      .map((line, index) => {
          const item = lineMenu(line);
          return `
            <div class="cart-item">
              <div>
                <strong>${lineDisplayName(line)}</strong>
                <div class="option-selects">${item.options.map((group) => {
                  const current = line.options.find((option) => option.groupId === group.id);
                  return `
                    <label>${group.th}${group.required ? " *" : ""}
                      <select data-cart-option="${cartName}" data-index="${index}" data-group="${group.id}">
                        ${group.required ? "" : `<option value="" ${current ? "" : "selected"}>ไม่เลือก</option>`}
                        ${group.choices.map((choice) => {
                          const selected = current && current.label === choice.th ? "selected" : "";
                          const price = choice.price ? ` +${choice.price}` : "";
                          return `<option value="${choice.th}" ${selected}>${choice.th}${price}</option>`;
                        }).join("")}
                      </select>
                    </label>
                  `;
                }).join("")}</div>
                <span class="sku">${item.sku}${line.variant ? ` / ${fmt.format(line.variant.price)}` : ""}</span>
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
      .join("");
    $(listId).innerHTML = html || cart.map((line) => `<div class="cart-item"><strong>${line.nameTh || line.sku || line.menuId}</strong></div>`).join("");
  } else {
    $(listId).innerHTML = `<p class="sku">ยังไม่มีรายการ</p>`;
  }
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

async function createOrder(source) {
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
  saveDraftCarts();
  $("customerToken").value = "";
  $("customerName").value = "";
  $("customerPhone").value = "";
  $("cashReceived").value = "";
  $("transferReceived").value = "";
  await saveState();
  if (paidNow) {
    notifyKitchen(order);
    broadcastEvent("new_kitchen_order", { orderId: order.id, branchId: order.branchId, orderNo: order.orderNo, queueToken: order.queueToken });
  } else {
    broadcastEvent("pending_payment_order", { orderId: order.id, branchId: order.branchId, orderNo: order.orderNo, queueToken: order.queueToken, paymentMethod: order.paymentMethod });
  }
  render();
  if (paidNow) printReceipt(order.id);
  toast(paidNow ? "ส่งออเดอร์เข้าครัวแล้ว" : "ส่งออเดอร์แล้ว รอพนักงานยืนยันชำระเงิน");
}

async function confirmPayment(orderId) {
  const order = state.orders.find((item) => item.id === orderId);
  order.status = "in_kitchen";
  order.paidAt = new Date().toISOString();
  order.cashReceived = order.paymentMethod === "cash" ? order.total : 0;
  order.transferReceived = order.paymentMethod === "transfer" ? order.total : 0;
  await saveState();
  notifyKitchen(order);
  broadcastEvent("new_kitchen_order", { orderId: order.id, branchId: order.branchId, orderNo: order.orderNo, queueToken: order.queueToken });
  render();
}

function renderPayments() {
  const branchIds = currentRole().canSwitchBranches ? state.branches.map((item) => item.id) : currentUser().branchIds;
  const pending = state.orders.filter((order) => branchIds.includes(order.branchId) && order.status === "pending_payment");
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
        const item = lineMenu(line);
        return `
          <label class="check-line">
            <input type="checkbox" data-item-done="${order.id}" data-index="${index}" ${line.done ? "checked" : ""}>
            <span>${line.qty} x ${lineDisplayName(line)}<br><small>${optionSummary(line)}</small></span>
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
  const item = lineMenu(line);
  return `<div class="total-line"><span>${line.qty} x ${lineDisplayName(line)}</span><strong>${fmt.format(linePrice(line))}</strong></div>`;
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
          const item = lineMenu(line);
          return `${line.qty} x ${lineDisplayName(line)}`;
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
  $("promoAdmin").innerHTML = `<div class="admin-list">${state.promotions.filter((promo) => promo.id !== "none").map((promo) => `
    <div class="admin-row">
      <span>${promo.nameTh}</span>
      <button class="secondary" data-toggle-promo="${promo.id}">${promo.active ? "เปิดใช้" : "ปิด"}</button>
    </div>
  `).join("")}</div>`;
}

function renderMenuManagement() {
  if (!$("menuAdmin") || !$("menuFormAdmin") || !$("categoryAdmin")) return;
  const allowed = currentUser().role === "super_admin";
  $("menuGuard").classList.toggle("active", !allowed);
  $("menuGuard").innerHTML = !allowed
    ? `<strong>Access denied</strong><br>หน้านี้สำหรับ Mustang franchise owner / superuser เท่านั้น`
    : "";
  document.querySelectorAll("#menus .panel").forEach((panel) => panel.classList.toggle("hidden", !allowed));
  if (!allowed) return;
  const sortedCategories = [...state.categories].sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0));
  const editingCategory = state.categories.find((cat) => cat.id === editingCategoryId);
  const editing = state.menu.find((item) => item.id === editingMenuId);
  const formTitle = editing ? `แก้ไขเมนู ${editing.th}` : "เพิ่มเมนูใหม่";
  const imageValue = editing && !editing.image.startsWith("data:") ? editing.image : "";
  const previewImage = uploadedMenuImageDataUrl || editing?.image || "assets/mustang-logo.png";
  const hasSweetness = editing ? editing.options.some((group) => group.id === "sweet") : true;
  const hasIce = editing ? editing.options.some((group) => group.id === "ice") : true;
  const editingVariants = variantsForForm(editing);
  const priceMode = editing && hasRealVariants(editing) ? "variants" : "single";
  const basePrice = editing ? defaultVariant(editing)?.price || editing.price : "";

  $("categoryAdmin").innerHTML = `
    <div class="admin-form flat">
      <p class="eyebrow">${editingCategory ? `แก้ไขหมวดหมู่ ${editingCategory.th}` : "เพิ่มหมวดหมู่ใหม่"}</p>
      ${editingCategory ? "" : `<label class="field"><span>Category ID</span><input id="categoryId" placeholder="เช่น fresh-milk"></label>`}
      <label class="field"><span>ชื่อหมวดหมู่ไทย *</span><input id="categoryTh" value="${escapeHtml(editingCategory?.th || "")}" placeholder="เช่น นมสด"></label>
      <label class="field"><span>English name</span><input id="categoryEn" value="${escapeHtml(editingCategory?.en || "")}" placeholder="Fresh Milk"></label>
      <label class="field"><span>ลำดับ</span><input id="categorySort" type="number" value="${editingCategory?.sort || nextCategorySort()}"></label>
      <button class="primary" id="${editingCategory ? "saveCategoryEdit" : "addCategory"}">${editingCategory ? "บันทึกหมวดหมู่" : "เพิ่มหมวดหมู่"}</button>
      ${editingCategory ? `<button class="secondary" id="cancelCategoryEdit">ยกเลิกการแก้ไข</button>` : ""}
    </div>
    <div class="admin-list category-list">
      ${sortedCategories.map((cat) => {
        const count = state.menu.filter((item) => item.categoryId === cat.id).length;
        return `
          <div class="admin-row">
            <span><strong>${cat.th}</strong><br><small>${cat.id} / ${cat.en} / ลำดับ ${cat.sort} / ${count} เมนู</small></span>
            <div class="role-matrix">
              <button class="secondary" data-edit-category="${cat.id}">แก้ไข</button>
              <button class="secondary" data-delete-category="${cat.id}">ลบ</button>
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;

  $("menuFormAdmin").innerHTML = `
    <div class="admin-form flat">
      <p class="eyebrow">${formTitle}</p>
      <label class="field"><span>หมวดหมู่</span><select id="newMenuCategory">${sortedCategories.map((cat) => `<option value="${cat.id}" ${editing?.categoryId === cat.id ? "selected" : ""}>${cat.th}</option>`).join("")}</select></label>
      <label class="field"><span>SKU</span><input id="newMenuSku" value="${escapeHtml(editing?.sku || "")}" placeholder="เว้นว่างเพื่อสร้างอัตโนมัติ"></label>
      <label class="field"><span>ชื่อเมนูไทย *</span><input id="newMenuTh" value="${escapeHtml(editing?.th || "")}" placeholder="เช่น นมสดคาราเมล"></label>
      <label class="field"><span>English name</span><input id="newMenuEn" value="${escapeHtml(editing?.en || "")}" placeholder="Caramel Fresh Milk"></label>
      <label class="field"><span>ราคาเริ่มต้น / ราคาเดียว *</span><input id="newMenuPrice" type="number" min="0" inputmode="decimal" value="${basePrice}" placeholder="79"></label>
      <input id="priceMode" type="hidden" value="${priceMode}">
      <div class="field"><span>รูปแบบราคา</span>
        <div class="segmented">
          <button type="button" class="${priceMode === "single" ? "active" : ""}" data-price-mode="single">ราคาเดียว</button>
          <button type="button" class="${priceMode === "variants" ? "active" : ""}" data-price-mode="variants">หลายราคา เช่น ร้อน / เย็น / ปั่น</button>
        </div>
      </div>
      <div class="variant-editor ${priceMode === "variants" ? "" : "hidden"}" id="variantEditor">
        <div class="variant-head">
          <span>ชื่อไทย</span>
          <span>English</span>
          <span>ราคา</span>
          <span>เปิด</span>
        </div>
        <div id="variantRows">
          ${editingVariants.map((variant) => `
            <div class="variant-row" data-price-variant-row data-variant-id="${escapeHtml(variant.id)}">
              <input data-variant-th value="${escapeHtml(variant.th)}" placeholder="ร้อน">
              <input data-variant-en value="${escapeHtml(variant.en)}" placeholder="Hot">
              <input data-variant-price type="number" min="0" inputmode="decimal" value="${variant.price || ""}" placeholder="79">
              <label><input data-variant-active type="checkbox" ${variant.active !== false ? "checked" : ""}></label>
            </div>
          `).join("")}
        </div>
        <button class="secondary" type="button" id="addVariantRow">เพิ่มรูปแบบราคา</button>
      </div>
      <label class="field"><span>อัปโหลดรูปจากเครื่อง</span><input id="newMenuImageFile" type="file" accept="image/*"></label>
      <label class="field"><span>หรือใส่ path/URL รูปภาพ</span><input id="newMenuImage" value="${escapeHtml(imageValue)}" placeholder="assets/mustang-logo.png"></label>
      <div class="image-preview" id="newMenuImagePreview"><img src="${escapeHtml(previewImage)}" alt="preview"><span>${editing ? "รูปปัจจุบัน" : "Preview"}</span></div>
      <label class="check-inline"><input id="newMenuSweetness" type="checkbox" ${hasSweetness ? "checked" : ""}> ตัวเลือกความหวาน</label>
      <label class="check-inline"><input id="newMenuIce" type="checkbox" ${hasIce ? "checked" : ""}> ตัวเลือกน้ำแข็ง</label>
      <button class="primary" id="${editing ? "saveMenuEdit" : "addMenu"}">${editing ? "บันทึกการแก้ไข" : "เพิ่มเมนูเข้า kiosk"}</button>
      ${editing ? `<button class="secondary" id="cancelMenuEdit">ยกเลิกการแก้ไข</button>` : ""}
    </div>
  `;

  $("menuAdmin").innerHTML = `
    <div class="admin-list">${state.menu.map((item) => `
      <div class="admin-row menu-row">
        <img src="${item.image}" alt="${item.th}">
        <span><strong>${item.th}</strong><br><small>${item.sku} / ${menuPriceLabel(item)} / ${state.categories.find((cat) => cat.id === item.categoryId)?.th || item.categoryId}</small></span>
        <div class="role-matrix">
          <button class="secondary" data-edit-menu="${item.id}">แก้ไข</button>
          <button class="secondary" data-toggle-menu="${item.id}">${item.available ? "ขายอยู่" : "ซ่อน"}</button>
          <button class="secondary" data-delete-menu="${item.id}">ลบ</button>
        </div>
      </div>
    `).join("")}</div>
  `;
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
      return `<div class="row"><span>${line.qty} x ${lineDisplayName(line)}</span><strong>${fmt.format(linePrice(line))}</strong></div>`;
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

function notifyKitchen(payload = {}) {
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
          const item = lineMenu(line);
          return `${line.qty}x ${lineDisplayName(line)}`;
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

function activateMenuCard(menuTarget, variantId = "") {
  const item = state.menu.find((menuItem) => menuItem.id === menuTarget.dataset.menuId || menuItem.sku === menuTarget.dataset.sku);
  if (!item || !item.available) return;
  const cartName = document.querySelector("#customer.view.active") ? "customer" : "staff";
  const variants = activeVariants(item);
  if (hasRealVariants(item) && !variantId) return toast("กรุณาเลือกรูปแบบราคา");
  const variant = variantId ? variants.find((itemVariant) => itemVariant.id === variantId) : defaultVariant(item);
  if (!variant) return toast("เมนูนี้ยังไม่ได้ตั้งราคา");
  lastMenuActivation = { id: `${item.id}:${variant.id}`, at: Date.now() };
  menuTarget.classList.add("just-added");
  window.setTimeout(() => menuTarget.classList.remove("just-added"), 180);
  addToCart(cartName, item, variant);
}

document.addEventListener("pointerup", (event) => {
  if (event.target.closest("[data-menu-variant]")) return;
  const menuTarget = event.target.closest("[data-menu-id]");
  if (!menuTarget) return;
  event.preventDefault();
  activateMenuCard(menuTarget);
});

document.addEventListener("click", (event) => {
  const variantTarget = event.target.closest("[data-menu-variant]");
  if (variantTarget) {
    const menuTarget = variantTarget.closest("[data-menu-id]");
    if (!menuTarget) return;
    event.preventDefault();
    activateMenuCard(menuTarget, variantTarget.dataset.variantId);
    return;
  }
  const menuTarget = event.target.closest("[data-menu-id]");
  if (menuTarget) {
    const recentlyHandled = lastMenuActivation.id.startsWith(`${menuTarget.dataset.menuId}:`) && Date.now() - lastMenuActivation.at < 450;
    if (!recentlyHandled) activateMenuCard(menuTarget);
    return;
  }
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
  if (target.dataset.cartAct) {
    const line = carts[target.dataset.cart][Number(target.dataset.index)];
    line.qty += target.dataset.cartAct === "inc" ? 1 : -1;
    if (line.qty <= 0) carts[target.dataset.cart].splice(Number(target.dataset.index), 1);
    saveDraftCarts();
    renderCarts();
  }
  const staffQueueToken = target.dataset.pickToken || target.getAttribute("data-pick-token");
  const customerQueueToken = target.dataset.pickCustomerToken || target.getAttribute("data-pick-customer-token");
  if (staffQueueToken) {
    $("staffToken").value = staffQueueToken;
    renderTokenSelect();
  }
  if (customerQueueToken) {
    $("customerToken").value = customerQueueToken;
    renderTokenSelect();
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
  if (target.dataset.deleteMenu) {
    if (!requireSuperuser()) return;
    const inOrder = state.orders.some((order) => order.items.some((line) => line.menuId === target.dataset.deleteMenu));
    if (inOrder) return toast("เมนูนี้มีประวัติออเดอร์แล้ว กรุณาใช้ซ่อนแทนลบ");
    state.menu = state.menu.filter((item) => item.id !== target.dataset.deleteMenu);
    state.masterTemplate.menuIds = state.masterTemplate.menuIds.filter((id) => id !== target.dataset.deleteMenu);
    saveState();
    render();
    toast("ลบเมนูแล้ว");
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
    saveDraftCarts();
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
  if (target.id === "addMenu") {
    if (!requireSuperuser()) return;
    const form = readMenuForm();
    if (!form) return;
    const id = `m-${slugify(form.sku || form.th) || Date.now()}`;
    const menuItem = { id, ...form };
    state.menu.push(menuItem);
    if (!state.masterTemplate.menuIds.includes(id)) state.masterTemplate.menuIds.push(id);
    selectedCategory = form.categoryId;
    selectedCustomerCategory = form.categoryId;
    uploadedMenuImageDataUrl = "";
    saveState();
    render();
    toast(`เพิ่มเมนู ${form.th} แล้ว`);
  }
  if (target.id === "addVariantRow") {
    const rows = $("variantRows");
    const index = rows.querySelectorAll("[data-price-variant-row]").length + 1;
    rows.insertAdjacentHTML("beforeend", `
      <div class="variant-row" data-price-variant-row data-variant-id="custom-${Date.now()}">
        <input data-variant-th placeholder="แบบที่ ${index}">
        <input data-variant-en placeholder="Variant ${index}">
        <input data-variant-price type="number" min="0" inputmode="decimal" placeholder="79">
        <label><input data-variant-active type="checkbox" checked></label>
      </div>
    `);
  }
  if (target.dataset.priceMode) {
    $("priceMode").value = target.dataset.priceMode;
    document.querySelectorAll("[data-price-mode]").forEach((button) => button.classList.toggle("active", button === target));
    $("variantEditor")?.classList.toggle("hidden", target.dataset.priceMode !== "variants");
  }
  if (target.id === "addCategory") {
    if (!requireSuperuser()) return;
    const form = readCategoryForm();
    if (!form) return;
    state.categories.push(form);
    selectedCategory = form.id;
    selectedCustomerCategory = form.id;
    saveState();
    render();
    toast(`เพิ่มหมวดหมู่ ${form.th} แล้ว`);
  }
  if (target.dataset.editCategory) {
    if (!requireSuperuser()) return;
    editingCategoryId = target.dataset.editCategory;
    renderMenuManagement();
  }
  if (target.id === "cancelCategoryEdit") {
    editingCategoryId = "";
    renderMenuManagement();
  }
  if (target.id === "saveCategoryEdit") {
    if (!requireSuperuser()) return;
    const existing = state.categories.find((cat) => cat.id === editingCategoryId);
    if (!existing) return toast("ไม่พบหมวดหมู่ที่จะแก้ไข");
    const form = readCategoryForm(existing.id);
    if (!form) return;
    Object.assign(existing, { th: form.th, en: form.en, sort: form.sort });
    editingCategoryId = "";
    saveState();
    render();
    toast(`บันทึกหมวดหมู่ ${form.th} แล้ว`);
  }
  if (target.dataset.deleteCategory) {
    if (!requireSuperuser()) return;
    const id = target.dataset.deleteCategory;
    if (state.categories.length <= 1) return toast("ต้องมีหมวดหมู่อย่างน้อย 1 หมวด");
    const count = state.menu.filter((item) => item.categoryId === id).length;
    if (count) return toast("หมวดหมู่นี้ยังมีเมนูอยู่ กรุณาย้ายหรือลบ/ซ่อนเมนูก่อน");
    state.categories = state.categories.filter((cat) => cat.id !== id);
    if (selectedCategory === id) selectedCategory = state.categories[0]?.id || "";
    if (selectedCustomerCategory === id) selectedCustomerCategory = state.categories[0]?.id || "";
    if (editingCategoryId === id) editingCategoryId = "";
    saveState();
    render();
    toast("ลบหมวดหมู่แล้ว");
  }
  if (target.dataset.editMenu) {
    if (!requireSuperuser()) return;
    editingMenuId = target.dataset.editMenu;
    uploadedMenuImageDataUrl = "";
    renderMenuManagement();
    document.querySelector("#menus").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  if (target.id === "cancelMenuEdit") {
    editingMenuId = "";
    uploadedMenuImageDataUrl = "";
    renderMenuManagement();
  }
  if (target.id === "saveMenuEdit") {
    if (!requireSuperuser()) return;
    const existing = state.menu.find((item) => item.id === editingMenuId);
    if (!existing) return toast("ไม่พบเมนูที่จะแก้ไข");
    const form = readMenuForm(existing.id);
    if (!form) return;
    Object.assign(existing, form, { available: existing.available });
    selectedCategory = form.categoryId;
    selectedCustomerCategory = form.categoryId;
    editingMenuId = "";
    uploadedMenuImageDataUrl = "";
    saveState();
    render();
    toast(`บันทึกเมนู ${form.th} แล้ว`);
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
    state = normalizeState(structuredClone(seedState));
    carts = { staff: [], customer: [] };
    saveDraftCarts();
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

document.addEventListener("keydown", (event) => {
  if (!["Enter", " "].includes(event.key)) return;
  const menuTarget = event.target.closest("[data-menu-id]");
  if (!menuTarget) return;
  event.preventDefault();
  activateMenuCard(menuTarget);
});

document.addEventListener("change", (event) => {
  const target = event.target;
  if (target.id === "newMenuImageFile") {
    const file = target.files?.[0];
    if (!file) {
      uploadedMenuImageDataUrl = "";
      return;
    }
    if (!file.type.startsWith("image/")) return toast("กรุณาเลือกรูปภาพ");
    const reader = new FileReader();
    reader.onload = () => {
      uploadedMenuImageDataUrl = String(reader.result || "");
      $("newMenuImage").value = "";
      $("newMenuImagePreview").innerHTML = `<img src="${uploadedMenuImageDataUrl}" alt="preview"><span>${file.name}</span>`;
    };
    reader.readAsDataURL(file);
  }
  if (target.id === "priceMode") {
    $("variantEditor")?.classList.toggle("hidden", target.value !== "variants");
  }
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
    if (!line) return;
    const item = lineMenu(line);
    const group = item.options.find((optionGroup) => optionGroup.id === target.dataset.group);
    if (!group) return;
    if (!target.value) {
      line.options = line.options.filter((option) => option.groupId !== group.id);
      saveDraftCarts();
      renderCarts();
      return;
    }
    const choice = group.choices.find((itemChoice) => itemChoice.th === target.value);
    const next = { groupId: group.id, group: group.th, label: choice.th, price: choice.price || 0, required: group.required };
    const optionIndex = line.options.findIndex((option) => option.groupId === group.id);
    if (optionIndex >= 0) line.options[optionIndex] = next;
    else line.options.push(next);
    saveDraftCarts();
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
  saveDraftCarts();
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

window.addEventListener("storage", (event) => {
  if (event.key === STORAGE_KEY) {
    syncStateFromStorage({ notify: true });
  }
  if (event.key === EVENT_KEY && event.newValue) {
    handleRealtimeEvent(JSON.parse(event.newValue));
  }
});

realtimeChannel?.addEventListener("message", (event) => {
  handleRealtimeEvent(event.data);
});

window.setInterval(() => {
  if (SERVER_SYNC) fetchServerState({ notify: true });
  else syncStateFromStorage({ notify: true });
}, 1200);

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

const today = todayKey();
$("reportStart").value = today;
$("reportEnd").value = today;
$("syncStatus").textContent = navigator.onLine ? "Online" : "Offline ready";
render();
showView(isAdminRoute() ? "admin" : location.hash.replace("#", "") || currentRole().views[0] || "pos", false);
fetchServerState({ notify: false });
