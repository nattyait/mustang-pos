const STORAGE_KEY = "mustang-franchise-pos-v1";
const EVENT_KEY = "mustang-franchise-pos-event";
const CART_KEY = "mustang-franchise-pos-draft-carts";
const AUTH_KEY = "mustang-franchise-auth-user";
const SERVER_SYNC = location.protocol.startsWith("http");
const realtimeChannel = "BroadcastChannel" in window ? new BroadcastChannel("mustang-franchise-pos") : null;
const PAGE_ID = crypto.randomUUID();

const thaiEnglishWords = [
  ["เครื่องดื่ม", "drink"],
  ["กูโรตี", "guroti"],
  ["ชาชัก", "cha-chak"],
  ["โรตี", "roti"],
  ["อาหาร", "food"],
  ["นมสด", "fresh-milk"],
  ["กาแฟ", "coffee"],
  ["ชา", "tea"],
  ["โกโก้", "cocoa"],
  ["นูเทลล่า", "nutella"],
  ["โอรีโอ", "oreo"],
  ["กล้วย", "banana"],
  ["ข้าว", "rice"],
  ["ไก่", "chicken"],
  ["หมู", "pork"],
  ["เนื้อ", "beef"],
  ["ปลา", "fish"],
  ["ไข่", "egg"],
  ["น้ำแข็ง", "ice"],
  ["ความหวาน", "sweetness"],
  ["หวาน", "sweet"],
  ["ร้อน", "hot"],
  ["เย็น", "iced"],
  ["ปั่น", "blended"],
  ["สด", "fresh"],
  ["หลัก", "main"],
];

function englishifyText(text) {
  let value = String(text || "").toLowerCase();
  thaiEnglishWords.forEach(([thai, english]) => {
    value = value.replaceAll(thai, ` ${english} `);
  });
  return value;
}

function slugify(text) {
  return englishifyText(text)
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

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
        {
          id: "sweet",
          th: "ความหวาน",
          required: true,
          choices: [{ th: "ไม่หวาน" }, { th: "25%" }, { th: "50%" }, { th: "75%" }, { th: "100%" }],
        },
        {
          id: "ice",
          th: "น้ำแข็ง",
          required: true,
          choices: [{ th: "ปกติ" }, { th: "น้อย" }, { th: "ไม่ใส่น้ำแข็ง" }],
        },
        {
          id: "topping",
          th: "ท็อปปิ้ง",
          required: false,
          choices: [
            { th: "โอรีโอเพิ่ม", price: 10 },
            { th: "นูเทลล่าเพิ่ม", price: 15 },
          ],
        },
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
        {
          id: "sweet",
          th: "ความหวาน",
          required: true,
          choices: [{ th: "ไม่หวาน" }, { th: "25%" }, { th: "50%" }, { th: "75%" }, { th: "100%" }],
        },
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
      options: [
        {
          id: "sweet",
          th: "ความหวาน",
          required: true,
          choices: [{ th: "ไม่หวาน" }, { th: "25%" }, { th: "50%" }, { th: "75%" }, { th: "100%" }],
        },
      ],
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
      options: [],
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
      options: [],
    },
  ],
  promotions: [
    { id: "none", nameTh: "ไม่ใช้โปรโมชั่น", type: "none", value: 0, active: true },
    { id: "promo-10", nameTh: "ลด 10%", type: "percent", value: 10, active: true },
    { id: "promo-20b", nameTh: "ลด 20 บาท", type: "amount", value: 20, active: true },
  ],
  users: [
    {
      id: "u-super",
      username: "owner",
      password: "mustang666",
      name: "Mustang Owner",
      role: "super_admin",
      branchIds: ["branch-kiosk", "branch-main"],
      active: true,
    },
    {
      id: "u-franchise",
      username: "franchise",
      password: "mustang666",
      name: "Kiosk Franchise Owner",
      role: "branch_owner",
      branchIds: ["branch-kiosk"],
      active: true,
    },
    {
      id: "u-manager",
      username: "manager",
      password: "mustang666",
      name: "Kiosk Manager",
      role: "branch_manager",
      branchIds: ["branch-kiosk"],
      active: true,
    },
    {
      id: "u-cashier",
      username: "cashier",
      password: "mustang666",
      name: "Cashier",
      role: "cashier",
      branchIds: ["branch-kiosk"],
      active: true,
    },
    {
      id: "u-kitchen",
      username: "kitchen",
      password: "mustang666",
      name: "Kitchen Staff",
      role: "kitchen",
      branchIds: ["branch-kiosk"],
      active: true,
    },
    {
      id: "u-customer",
      username: "customer",
      password: "mustang666",
      name: "Customer Kiosk",
      role: "customer_kiosk",
      branchIds: ["branch-kiosk"],
      active: true,
    },
  ],
  orders: [],
};

const roles = {
  super_admin: {
    label: "Mustang Superuser",
    views: ["pos", "customer", "kitchen", "reports", "admin", "menus"],
    canSwitchBranches: true,
    canManageRoles: true,
    canManageFranchise: true,
  },
  branch_owner: {
    label: "Franchise Owner",
    views: ["pos", "customer", "kitchen", "reports"],
    canSwitchBranches: false,
    canManageRoles: false,
    canManageFranchise: false,
  },
  branch_manager: {
    label: "Branch Manager",
    views: ["pos", "kitchen", "reports"],
    canSwitchBranches: false,
    canManageRoles: false,
    canManageFranchise: false,
  },
  cashier: {
    label: "Cashier",
    views: ["pos", "kitchen"],
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

/* eslint-disable no-unused-vars -- Legacy slug migration is staged but not enabled until data rollout is planned. */
let legacySlugMigrationApplied = false;
let lastNormalizeMigratedLegacySlugs = false;
let state = loadState();
let carts = loadDraftCarts();
let selectedCategory = "signature";
let selectedCustomerCategory = "signature";
let lastStoredStateRaw = localStorage.getItem(STORAGE_KEY);
let lastMenuActivation = { id: "", at: 0 };
let uploadedMenuImageDataUrl = "";
let editingMenuId = "";
let editingCategoryId = "";
let menuFormPriceMode = "";
let categoryToolsOpen = false;
let costingMenuId = "";
let costingVariantId = "";
let menuCostDraft = {};
const reportMenuCategoryFilters = new Map();
let lastLocalWriteAt = 0;
let stateRevision = 0;
let stateSavePromise = Promise.resolve();
let realtimeConnected = false;
let lastServerFetchAt = 0;
let lastPollingFetchAt = 0;

const $ = (id) => document.getElementById(id);
const fmt = new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 });
const costFmt = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const dateFmt = new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Bangkok" });

function setSyncStatus(text, isOnline = navigator.onLine) {
  $("syncStatus").textContent = text;
  $("syncStatus").classList.toggle("dark", Boolean(isOnline));
}

function markServerOnline() {
  lastServerFetchAt = Date.now();
  setSyncStatus(realtimeConnected ? "Realtime" : "Online");
}

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
  lastNormalizeMigratedLegacySlugs = false;
  const next = { ...structuredClone(seedState), ...rawState };
  next.masterTemplate = next.masterTemplate || structuredClone(seedState.masterTemplate);
  const defaultUsersById = new Map(seedState.users.map((user) => [user.id, user]));
  next.users = (next.users || structuredClone(seedState.users)).map((user) => {
    const fallback = defaultUsersById.get(user.id) || {};
    const username = user.username || fallback.username || slugify(user.name || user.role || user.id);
    return {
      ...fallback,
      ...user,
      username,
      password: user.password || fallback.password || "mustang666",
      active: user.active !== false,
    };
  });
  next.activeUserId = next.activeUserId || "u-super";
  next.branches = next.branches.map((item) => ({
    templateMode: "linked",
    templateVersion: next.masterTemplate?.version || 1,
    ...item,
    tokens: item.tokens || [],
  }));
  next.categories = Array.isArray(next.categories) ? next.categories : [];
  next.menu = Array.isArray(next.menu) ? next.menu : [];
  next.masterTemplate.menuIds = Array.isArray(next.masterTemplate.menuIds) ? next.masterTemplate.menuIds : [];
  next.orders = (next.orders || []).map((order) => ({
    ...order,
    _updatedAt: Number(
      order._updatedAt ||
        Date.parse(order.pickedUpAt || order.readyAt || order.paidAt || order.createdAt || 0) ||
        Date.now(),
    ),
    items: (order.items || []).map(normalizeCartLine),
  }));
  return next;
}

function markLegacySlugMigration() {
  legacySlugMigrationApplied = true;
  lastNormalizeMigratedLegacySlugs = true;
}

function isAsciiId(value) {
  return /^[a-z0-9_-]+$/i.test(String(value || ""));
}

function uniqueSlug(base, used, fallback) {
  const root = slugify(base) || fallback;
  let candidate = root;
  let index = 2;
  while (used.has(candidate)) {
    candidate = `${root}-${index}`;
    index += 1;
  }
  used.add(candidate);
  return candidate;
}

function migrateLegacySlugs(next) {
  const categoryMap = new Map();
  const usedCategoryIds = new Set();
  next.categories = (next.categories || []).map((category, index) => {
    const currentId = String(category.id || "");
    const keepId = currentId && isAsciiId(currentId) && slugify(currentId) === currentId.toLowerCase();
    const nextId = keepId
      ? uniqueSlug(currentId, usedCategoryIds, `category-${index + 1}`)
      : uniqueSlug(category.en || category.th || currentId, usedCategoryIds, `category-${index + 1}`);
    if (currentId && currentId !== nextId) {
      categoryMap.set(currentId, nextId);
      markLegacySlugMigration();
    }
    return { ...category, id: nextId };
  });

  const menuMap = new Map();
  const usedMenuIds = new Set();
  next.menu = (next.menu || []).map((menuItem, index) => {
    const currentId = String(menuItem.id || "");
    const keepId = currentId && isAsciiId(currentId) && slugify(currentId) === currentId.toLowerCase();
    const fallback = `menu-${index + 1}`;
    const base = menuItem.en || menuItem.th || menuItem.sku || currentId || fallback;
    const nextCore = keepId ? uniqueSlug(currentId.replace(/^m-/, ""), usedMenuIds, fallback) : uniqueSlug(base, usedMenuIds, fallback);
    const nextId = nextCore.startsWith("m-") ? nextCore : `m-${nextCore}`;
    if (currentId && currentId !== nextId) {
      menuMap.set(currentId, nextId);
      markLegacySlugMigration();
    }
    const categoryId = categoryMap.get(menuItem.categoryId) || menuItem.categoryId;
    if (categoryId !== menuItem.categoryId) markLegacySlugMigration();
    return { ...menuItem, id: nextId, categoryId };
  });

  next.masterTemplate.menuIds = (next.masterTemplate.menuIds || []).map((id) => menuMap.get(id) || id);
  next.orders = (next.orders || []).map((order) => ({
    ...order,
    items: (order.items || []).map((line) => {
      const menuId = menuMap.get(line.menuId) || line.menuId;
      if (menuId !== line.menuId) markLegacySlugMigration();
      return { ...line, menuId };
    }),
  }));
}
/* eslint-enable no-unused-vars */

function touchOrder(order) {
  order._updatedAt = Date.now();
  return order;
}

function normalizeMenuItem(item) {
  const options = Array.isArray(item.options) ? item.options : [];
  const variants =
    Array.isArray(item.variants) && item.variants.length
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
  const fallback = normalizedVariants.length
    ? normalizedVariants
    : [{ id: "default", th: "ราคาเดียว", en: "Single price", price: Number(item.price || 0), active: true }];
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

async function saveState({ allowCatalogWrite = false } = {}) {
  stateRevision += 1;
  lastLocalWriteAt = Date.now();
  state = normalizeState(state);
  lastStoredStateRaw = JSON.stringify(state);
  localStorage.setItem(STORAGE_KEY, lastStoredStateRaw);
  if (SERVER_SYNC) {
    const stateForServer = allowCatalogWrite
      ? state
      : Object.fromEntries(
          Object.entries(state).filter(([key]) => !["menu", "categories", "masterTemplate"].includes(key)),
        );
    stateSavePromise = fetch("/api/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state: stateForServer, allowCatalogWrite }),
    }).catch(() => {});
    await stateSavePromise;
  }
}

async function saveMenuItemToLatestState(menuId, menuItem) {
  stateRevision += 1;
  lastLocalWriteAt = Date.now();
  const normalizedMenu = normalizeMenuItem({ ...menuItem, _updatedAt: Date.now() });
  let latest = state;
  const applyMenuToState = (baseState) => {
    const next = normalizeState(baseState);
    const index = next.menu.findIndex((item) => item.id === menuId);
    if (index >= 0) next.menu[index] = normalizedMenu;
    else next.menu.push(normalizedMenu);
    if (!next.masterTemplate.menuIds.includes(menuId)) next.masterTemplate.menuIds.push(menuId);
    next.activeBranchId = state.activeBranchId;
    next.activeUserId = state.activeUserId;
    return normalizeState(next);
  };
  if (SERVER_SYNC) {
    const optimisticState = applyMenuToState(state);
    const response = await fetch("/api/menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state: optimisticState, menu: normalizedMenu, actorRole: currentUser().role }),
    });
    if (!response.ok) throw new Error("Save failed");
    const data = await response.json();
    latest = data.state || optimisticState;
  } else {
    latest = applyMenuToState(state);
  }
  state = normalizeState(latest);
  lastStoredStateRaw = JSON.stringify(state);
  localStorage.setItem(STORAGE_KEY, lastStoredStateRaw);
}

function reloadState() {
  state = loadState();
  enforceBranchAccess();
}

async function fetchServerState({ notify = false, force = false, operationalOnly = false } = {}) {
  if (!SERVER_SYNC) return;
  if (!force && Date.now() - lastLocalWriteAt < 1800) return;
  const fetchStartedAt = Date.now();
  const fetchRevision = stateRevision;
  try {
    const previousKitchenIds = new Set(
      state.orders
        .filter((order) => order.branchId === state.activeBranchId && order.status === "in_kitchen")
        .map((order) => order.id),
    );
    const response = await fetch(operationalOnly ? "/api/state?scope=operations" : "/api/state", { cache: "no-store" });
    if (!response.ok) return;
    const data = await response.json();
    markServerOnline();
    if (!data.state) return;
    if (fetchStartedAt < lastLocalWriteAt || fetchRevision !== stateRevision) return;
    const serverState = operationalOnly
      ? {
          ...state,
          ...data.state,
          menu: state.menu,
          categories: state.categories,
          masterTemplate: state.masterTemplate,
        }
      : data.state;
    const nextState = normalizeState(serverState);
    nextState.activeUserId = state.activeUserId;
    nextState.activeBranchId = state.activeBranchId;
    const nextStateRaw = JSON.stringify(nextState);
    if (nextStateRaw === lastStoredStateRaw) return;
    state = nextState;
    lastStoredStateRaw = nextStateRaw;
    localStorage.setItem(STORAGE_KEY, lastStoredStateRaw);
    enforceBranchAccess();
    renderSyncedState();
    if (!notify) return;
    const newKitchenOrder = state.orders.find(
      (order) =>
        order.branchId === state.activeBranchId && order.status === "in_kitchen" && !previousKitchenIds.has(order.id),
    );
    if (newKitchenOrder) notifyKitchen(newKitchenOrder);
  } catch {
    realtimeConnected = false;
    setSyncStatus("Local only", false);
  }
}

async function broadcastEvent(type, payload = {}) {
  const event = { type, payload, at: Date.now(), sourceId: PAGE_ID };
  localStorage.setItem(EVENT_KEY, JSON.stringify(event));
  realtimeChannel?.postMessage(event);
  if (SERVER_SYNC) {
    await fetch("/api/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    }).catch(() => {});
  }
}

async function handleRealtimeEvent(event) {
  if (!event || event.sourceId === PAGE_ID) return;
  if (event.type === "state_updated") {
    await fetchServerState({ notify: true, force: true, operationalOnly: !event.payload?.menuId });
  }
  if (event.type === "new_kitchen_order") {
    await fetchServerState({ notify: true, force: true, operationalOnly: true });
    notifyKitchen(event.payload);
  }
  if (event.type === "pending_payment_order") {
    await fetchServerState({ notify: false, force: true, operationalOnly: true });
    toast(`มีออเดอร์รอยืนยันชำระเงิน ${event.payload.orderNo} / คิว ${event.payload.queueToken}`);
  }
  if (event.type === "order_updated") {
    await fetchServerState({ notify: false, force: true, operationalOnly: true });
  }
}

function syncStateFromStorage({ notify = false } = {}) {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw || raw === lastStoredStateRaw) return;
  const previousKitchenIds = new Set(
    state.orders
      .filter((order) => order.branchId === state.activeBranchId && order.status === "in_kitchen")
      .map((order) => order.id),
  );
  lastStoredStateRaw = raw;
  reloadState();
  renderSyncedState();
  if (!notify) return;
  const newKitchenOrder = state.orders.find(
    (order) =>
      order.branchId === state.activeBranchId && order.status === "in_kitchen" && !previousKitchenIds.has(order.id),
  );
  if (newKitchenOrder) notifyKitchen(newKitchenOrder);
}

function isMenuManagementEditing() {
  const active = document.activeElement;
  if (!active) return false;
  return Boolean(
    document.querySelector("#menus.view.active") &&
    active.closest("#menuFormAdmin, #categoryAdmin") &&
    ["INPUT", "SELECT", "TEXTAREA", "BUTTON"].includes(active.tagName),
  );
}

function renderSyncedState() {
  if (isMenuManagementEditing()) {
    renderMenus();
    renderCarts();
    renderPayments();
    renderKitchen();
    renderReports();
    renderAdmin();
    return;
  }
  render();
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

function routeMode() {
  const path = location.pathname.replace(/\/+$/, "");
  if (path === "/pos" || path.endsWith("/pos")) return "pos";
  if (path === "/customer" || path.endsWith("/customer")) return "customer";
  if (path === "/admin" || path.endsWith("/admin")) return "admin";
  return "app";
}

function isPublicRoute() {
  return ["pos", "customer"].includes(routeMode());
}

function loginUserId() {
  return localStorage.getItem(AUTH_KEY) || "";
}

function loggedInUser() {
  return state.users.find((item) => item.id === loginUserId() && item.active);
}

function applyRouteUser() {
  const mode = routeMode();
  if (mode === "pos") {
    state.activeUserId = "u-cashier";
    return true;
  }
  if (mode === "customer") {
    state.activeUserId = "u-customer";
    return true;
  }
  const user = loggedInUser();
  if (!user) return false;
  state.activeUserId = user.id;
  return true;
}

function updateAuthShell() {
  const authenticated = applyRouteUser();
  document.body.classList.toggle("login-required", !authenticated);
  document.body.classList.toggle("public-route", isPublicRoute());
  $("loginScreen")?.classList.toggle("hidden", authenticated);
  document.querySelector(".app-shell")?.classList.toggle("hidden", !authenticated);
  if (isPublicRoute()) $("logoutButton")?.classList.add("hidden");
  else $("logoutButton")?.classList.remove("hidden");
  return authenticated;
}

function canView(viewId) {
  if (routeMode() === "pos") return viewId === "pos";
  if (routeMode() === "customer") return viewId === "customer";
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

function isCatalogMenu(item) {
  return item && item.archived !== true;
}

function categoryName(item) {
  return state.language === "en" ? item.en : item.th;
}

function variantName(variant) {
  if (!variant) return "";
  return state.language === "en" ? variant.en || variant.th : variant.th || variant.en;
}

function hasBrokenThaiText(value) {
  return String(value || "").includes("�");
}

function lineCatalogMenu(line) {
  const exact = state.menu.find((menuItem) => menuItem.id === line.menuId && isCatalogMenu(menuItem));
  const skuMatches = state.menu.filter(
    (menuItem) =>
      isCatalogMenu(menuItem) &&
      line.sku &&
      menuItem.sku &&
      menuItem.sku.toLowerCase() === String(line.sku).toLowerCase(),
  );
  const cleanSkuMatch = skuMatches.find((menuItem) => !hasBrokenThaiText(`${menuItem.th} ${menuItem.en}`));
  if (exact && !hasBrokenThaiText(`${exact.th} ${exact.en}`)) return exact;
  return cleanSkuMatch || exact || skuMatches[0] || null;
}

function lineCatalogVariant(line, item = lineCatalogMenu(line)) {
  if (!line.variant || !item) return null;
  const variants = activeVariants(item);
  return (
    variants.find((variant) => variant.id === line.variant.id) ||
    variants.find((variant) => variant.th === line.variant.th || variant.en === line.variant.en) ||
    null
  );
}

function activeVariants(item) {
  const normalized = normalizeMenuItem(item);
  return normalized.variants.filter((variant) => variant.active !== false && variant.price > 0);
}

function defaultVariant(item) {
  return activeVariants(item)[0] || normalizeMenuItem(item).variants[0];
}

function hasRealVariants(item) {
  return activeVariants(item).some(
    (variant) => variant.id !== "default" || !["ราคาเดียว", "Single price"].includes(variant.th),
  );
}

function canViewCostReport() {
  return ["super_admin", "branch_owner", "branch_manager"].includes(currentUser().role);
}

function menuPriceLabel(item) {
  const variants = activeVariants(item);
  if (!variants.length) return fmt.format(item.price || 0);
  if (variants.length === 1) return fmt.format(variants[0].price);
  const prices = variants.map((variant) => Number(variant.price || 0));
  return `${fmt.format(Math.min(...prices))} - ${fmt.format(Math.max(...prices))}`;
}

function costingVariants(item) {
  const variants = activeVariants(item);
  return variants.length ? variants : [defaultVariant(item)].filter(Boolean);
}

function ingredientCostTotal(ingredients) {
  return (ingredients || []).reduce((sum, ingredient) => sum + Number(ingredient.cost || 0), 0);
}

function variantCostIngredients(item, variantId) {
  const costing = item?.costing || {};
  const variants = costingVariants(item || {});
  const fallbackId = variants[0]?.id || "default";
  return costing[variantId] || costing[fallbackId] || costing.default || [];
}

function lineUnitCost(line) {
  const item = lineCatalogMenu(line);
  if (!item) return 0;
  const catalogVariant = lineCatalogVariant(line, item);
  const variantId =
    catalogVariant?.id ||
    (hasRealVariants(item) ? line.variant?.id : "") ||
    activeVariants(item)[0]?.id ||
    "default";
  return ingredientCostTotal(variantCostIngredients(item, variantId));
}

function lineTotalCost(line) {
  return lineUnitCost(line) * Number(line.qty || 0);
}

function orderCost(order) {
  return (order.items || []).reduce((sum, line) => sum + lineTotalCost(line), 0);
}

function menuVariantCost(item, variantId) {
  return ingredientCostTotal(variantCostIngredients(item, variantId));
}

function menuCostLabel(item) {
  const variants = costingVariants(item);
  if (variants.length <= 1) return `ต้นทุน ${costFmt.format(menuVariantCost(item, variants[0]?.id || "default"))}`;
  return `ต้นทุน ${variants.map((variant) => `${variant.th} ${costFmt.format(menuVariantCost(item, variant.id))}`).join(" / ")}`;
}

function syncCostDraftFromModal() {
  if (!costingVariantId || !$("costIngredientRows")) return;
  menuCostDraft[costingVariantId] = [...document.querySelectorAll("[data-cost-ingredient-row]")]
    .map((row) => ({
      id: row.dataset.ingredientId || crypto.randomUUID(),
      ingredient: row.querySelector("[data-cost-ingredient-name]")?.value.trim() || "",
      cost: Number(row.querySelector("[data-cost-ingredient-price]")?.value || 0),
    }))
    .filter((ingredient) => ingredient.ingredient || ingredient.cost > 0);
}

function updateCostModalTotal() {
  const target = $("costTotalValue");
  if (!target) return;
  const total = [...document.querySelectorAll("[data-cost-ingredient-price]")].reduce(
    (sum, input) => sum + Number(input.value || 0),
    0,
  );
  target.textContent = costFmt.format(total);
}

function openMenuCostModal(menuId) {
  const item = state.menu.find((menuItem) => menuItem.id === menuId);
  if (!item) return toast("ไม่พบเมนูที่ต้องการตั้งต้นทุน");
  costingMenuId = item.id;
  const variants = costingVariants(item);
  costingVariantId = variants[0]?.id || "default";
  menuCostDraft = structuredClone(item.costing || {});
  variants.forEach((variant) => {
    if (!Array.isArray(menuCostDraft[variant.id])) menuCostDraft[variant.id] = [];
  });
  renderMenuCostModal();
}

function closeMenuCostModal() {
  costingMenuId = "";
  costingVariantId = "";
  menuCostDraft = {};
  $("menuCostModal")?.classList.add("hidden");
}

function openCostMasterModal() {
  const modal = $("costMasterModal");
  if (!modal) return;
  const rows = state.menu
    .filter(isCatalogMenu)
    .sort(
      (a, b) =>
        lineCategoryName({ menuId: a.id, categoryId: a.categoryId }).localeCompare(
          lineCategoryName({ menuId: b.id, categoryId: b.categoryId }),
          "th",
        ) ||
        String(a.sku || "").localeCompare(String(b.sku || "")) ||
        String(a.th || a.en || "").localeCompare(String(b.th || b.en || ""), "th"),
    )
    .flatMap((item) =>
      costingVariants(item).map((variant) => {
        const ingredients = variantCostIngredients(item, variant.id);
        return {
          category: lineCategoryName({ menuId: item.id, categoryId: item.categoryId }),
          sku: item.sku || "-",
          name: menuName(item),
          variant: hasRealVariants(item) ? variantName(variant) : "ราคาเดียว",
          ingredients,
          total: ingredientCostTotal(ingredients),
        };
      }),
    );
  modal.innerHTML = `
    <div class="cost-modal-dialog cost-master-dialog" role="dialog" aria-modal="true" aria-labelledby="costMasterTitle">
      <header>
        <div>
          <p class="eyebrow">Master ต้นทุน / Cost master</p>
          <h2 id="costMasterTitle">Master ต้นทุนเมนู</h2>
          <span>ดูสูตรต้นทุนที่กรอกไว้ทั้งหมด ไม่รวมยอดขาย</span>
        </div>
        <button class="ghost cost-modal-close" type="button" data-close-cost-master aria-label="ปิด">×</button>
      </header>
      <div class="table-wrap cost-master-table">
        <table>
          <thead>
            <tr>
              <th>หมวดหมู่</th>
              <th>SKU</th>
              <th>เมนู</th>
              <th>รูปแบบราคา</th>
              <th>ส่วนผสม</th>
              <th>ต้นทุนรวม</th>
            </tr>
          </thead>
          <tbody>
            ${
              rows
                .map(
                  (row) => `
                    <tr>
                      <td>${escapeHtml(row.category)}</td>
                      <td>${escapeHtml(row.sku)}</td>
                      <td>${escapeHtml(row.name)}</td>
                      <td>${escapeHtml(row.variant)}</td>
                      <td>${escapeHtml(
                        row.ingredients.length
                          ? row.ingredients
                              .map((ingredient) => `${ingredient.ingredient || "-"} ${costFmt.format(ingredient.cost || 0)}`)
                              .join(", ")
                          : "ยังไม่ได้กรอก",
                      )}</td>
                      <td>${costFmt.format(row.total)}</td>
                    </tr>
                  `,
                )
                .join("") || `<tr><td colspan="6">ยังไม่มีเมนูสำหรับแสดงต้นทุน</td></tr>`
            }
          </tbody>
        </table>
      </div>
      <div class="cost-modal-actions">
        <button class="secondary" type="button" data-close-cost-master>ปิด</button>
      </div>
    </div>
  `;
  modal.classList.remove("hidden");
}

function closeCostMasterModal() {
  $("costMasterModal")?.classList.add("hidden");
}

function renderMenuCostModal() {
  const modal = $("menuCostModal");
  const item = state.menu.find((menuItem) => menuItem.id === costingMenuId);
  if (!modal || !item) return;
  const variants = costingVariants(item);
  if (!variants.some((variant) => variant.id === costingVariantId)) costingVariantId = variants[0]?.id || "default";
  const selectedVariant = variants.find((variant) => variant.id === costingVariantId) || variants[0];
  const ingredients = menuCostDraft[costingVariantId] || [];
  const total = ingredientCostTotal(ingredients);
  modal.innerHTML = `
    <div class="cost-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="costModalTitle">
      <header>
        <div>
          <p class="eyebrow">ต้นทุนเมนู / Menu costing</p>
          <h2 id="costModalTitle">${escapeHtml(item.th)}</h2>
          <span>${escapeHtml(item.sku)} · ราคาขาย ${fmt.format(selectedVariant?.price || item.price || 0)}</span>
        </div>
        <button class="ghost cost-modal-close" type="button" data-close-cost-modal aria-label="ปิด">×</button>
      </header>
      ${
        variants.length > 1
          ? `<label class="field"><span>สูตรต้นทุนสำหรับรูปแบบราคา</span>
              <select id="costVariantSelect">${variants
                .map(
                  (variant) =>
                    `<option value="${escapeHtml(variant.id)}" ${variant.id === costingVariantId ? "selected" : ""}>${escapeHtml(variant.th || variant.en)} · ${fmt.format(variant.price)}</option>`,
                )
                .join("")}</select>
            </label>`
          : `<p class="cost-variant-label">สูตรต้นทุน: ${escapeHtml(selectedVariant?.th || "ราคาเดียว")}</p>`
      }
      <div class="cost-ingredient-head"><span>ส่วนผสม</span><span>ต้นทุน</span><span></span></div>
      <div class="cost-ingredient-rows" id="costIngredientRows">
        ${ingredients
          .map(
            (ingredient, index) => `
              <div class="cost-ingredient-row" data-cost-ingredient-row data-ingredient-id="${escapeHtml(ingredient.id || `ingredient-${index + 1}`)}">
                <input data-cost-ingredient-name value="${escapeHtml(ingredient.ingredient || "")}" placeholder="เช่น นมสด 150 ml">
                <input data-cost-ingredient-price type="number" min="0" step="0.01" inputmode="decimal" value="${Number(ingredient.cost || 0) || ""}" placeholder="0.00">
                <button class="secondary danger" type="button" data-remove-cost-ingredient="${index}" aria-label="ลบส่วนผสม">ลบ</button>
              </div>
            `,
          )
          .join("") || `<p class="cost-empty">ยังไม่มีส่วนผสม กดเพิ่มส่วนผสมเพื่อเริ่มกรอกต้นทุน</p>`}
      </div>
      <button class="secondary" type="button" id="addCostIngredient">+ เพิ่มส่วนผสม</button>
      <div class="cost-total"><span>ต้นทุนรวมต่อแก้ว/ชิ้น</span><strong id="costTotalValue">${costFmt.format(total)}</strong></div>
      <div class="cost-modal-actions">
        <button class="secondary" type="button" data-close-cost-modal>ยกเลิก</button>
        <button class="primary" type="button" id="saveMenuCost">บันทึกต้นทุนเมนู</button>
      </div>
    </div>
  `;
  modal.classList.remove("hidden");
}

function lineDisplayName(line) {
  const item = lineMenu(line);
  const catalogItem = lineCatalogMenu(line);
  if (catalogItem) {
    const variant = lineCatalogVariant(line, catalogItem) || (hasRealVariants(catalogItem) ? line.variant : null);
    const itemName = menuName(catalogItem);
    return variant ? `${itemName} - ${variantName(variant)}` : itemName;
  }
  const variant = line.variant;
  return variant ? `${menuName(item)} - ${variantName(variant)}` : menuName(item);
}

function optionSummary(line) {
  const parts = [];
  if (line.variant) parts.push(`รูปแบบ: ${variantName(line.variant)}`);
  parts.push(...(line.options || []).map((option) => `${option.group}: ${option.label}`));
  return parts.join(", ");
}

function customerLabel(order) {
  return String(order.customerName || "").trim();
}

function customerLine(order) {
  const name = customerLabel(order);
  if (!name) return "";
  return `<p class="customer-name">ลูกค้า: ${escapeHtml(name)}</p>`;
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
  return branch()
    .tokens.filter((token) => token.active)
    .map((token) => token.label);
}

function tokenStatus(token) {
  const activeOrder = state.orders.find(
    (order) =>
      order.branchId === state.activeBranchId &&
      order.queueToken === token.label &&
      !["picked_up", "cancelled"].includes(order.status),
  );
  if (!activeOrder) return "available";
  if (activeOrder.status === "pending_payment") return "waiting_payment";
  if (activeOrder.status === "ready") return "ready";
  return "in_kitchen";
}

function isOrderPaid(order) {
  return Boolean(order?.paidAt);
}

function isTokenAvailable(label) {
  const exists = activeTokenIds().includes(String(label));
  if (!exists) return false;
  return !state.orders.some(
    (order) =>
      order.branchId === state.activeBranchId &&
      order.queueToken === String(label) &&
      !["picked_up", "cancelled"].includes(order.status),
  );
}

function defaultOptions(item) {
  return item.options
    .filter((group) => group.required)
    .map((group) => {
      const choice =
        group.id === "sweet" || group.th === "ความหวาน"
          ? group.choices.find((itemChoice) => itemChoice.th === "100%") || group.choices[0]
          : group.choices[0];
      return {
        groupId: group.id,
        group: group.th,
        label: choice.th,
        price: choice.price || 0,
        required: group.required,
      };
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
      categoryId: item.categoryId,
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
  window.requestAnimationFrame(() =>
    renderCart(
      cartName,
      cartName === "customer" ? "customerCartList" : "cartList",
      cartName === "customer" ? "customerTotals" : "cartTotals",
    ),
  );
  toast(`เพิ่ม ${menuName(item)}${storedVariant ? ` - ${variantName(storedVariant)}` : ""} แล้ว`);
}

function lineMenu(line) {
  const item = lineCatalogMenu(line);
  return {
    id: item?.id || line.menuId,
    sku: item?.sku || line.sku || "",
    th: item?.th || line.nameTh || "เมนู",
    en: item?.en || line.nameEn || line.nameTh || "Menu",
    categoryId: item?.categoryId || line.categoryId || "",
    price: Number(line.basePrice ?? line.variant?.price ?? item?.price ?? 0),
    options: line.optionGroups || item?.options || [],
  };
}

function lineCategoryName(line) {
  const categoryId = lineCategoryId(line);
  const category = state.categories.find((item) => item.id === categoryId);
  return category?.th || category?.en || categoryId || "ไม่ระบุหมวดหมู่";
}

function lineCategoryId(line) {
  const exactMenu = lineCatalogMenu(line);
  const fallbackMenu = state.menu.find(
    (item) =>
      (line.sku && item.sku === line.sku) ||
      (line.nameTh && item.th === line.nameTh) ||
      (line.nameEn && item.en === line.nameEn),
  );
  return exactMenu?.categoryId || line.categoryId || fallbackMenu?.categoryId || "";
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
  if (!updateAuthShell()) return;
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
  renderReports();
  renderAdmin();
  renderMenuManagement();
  if (routeMode() === "pos" && !$("pos").classList.contains("active")) showView("pos", false);
  if (routeMode() === "customer" && !$("customer").classList.contains("active")) showView("customer", false);
}

function renderUserSelect() {
  $("userSelect").innerHTML =
    `<option value="${currentUser().id}">${currentUser().name} - ${roles[currentUser().role]?.label || currentUser().role}</option>`;
  $("userSelect").value = state.activeUserId;
  $("userSelect").disabled = true;
}

function showView(viewId, updateHash = true) {
  if (routeMode() === "pos") viewId = "pos";
  if (routeMode() === "customer") viewId = "customer";
  if (viewId === "payments") viewId = "kitchen";
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

function categorySkuPrefix(categoryId) {
  const category = state.categories.find((item) => item.id === categoryId);
  const source = category?.en || category?.th || categoryId || "menu";
  const slug = slugify(source) || "menu";
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 4)
    .toUpperCase()
    .padEnd(3, "X");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function readNumber(value) {
  const thaiDigits = "๐๑๒๓๔๕๖๗๘๙";
  const normalized = String(value ?? "")
    .trim()
    .replace(/[๐-๙]/g, (digit) => String(thaiDigits.indexOf(digit)))
    .replaceAll(",", "");
  return Number(normalized || 0);
}

function nextSku(categoryId) {
  const prefixMap = { signature: "SIG", "cha-chak": "CHA", roti: "ROT", food: "FOOD" };
  const prefix = prefixMap[categoryId] || categorySkuPrefix(categoryId);
  const numbers = state.menu
    .filter((item) => item.sku?.startsWith(`${prefix}-`))
    .map((item) => Number(item.sku.split("-")[1] || 0))
    .filter(Boolean);
  return `${prefix}-${String(Math.max(0, ...numbers) + 1).padStart(3, "0")}`;
}

function nextMenuId(form) {
  const base = slugify(form.en) || slugify(form.th) || slugify(form.sku) || "menu";
  let id = `m-${base}`;
  let index = 2;
  while (state.menu.some((item) => item.id === id)) {
    id = `m-${base}-${index}`;
    index += 1;
  }
  return id;
}

function buildOptionGroups(flags, categoryId = "") {
  if (["roti", "food"].includes(categoryId)) return [];
  const groups = [];
  if (flags.sweetness) {
    groups.push({
      id: "sweet",
      th: "ความหวาน",
      required: true,
      choices: [{ th: "ไม่หวาน" }, { th: "25%" }, { th: "50%" }, { th: "75%" }, { th: "100%" }],
    });
  }
  if (flags.ice) {
    groups.push({
      id: "ice",
      th: "น้ำแข็ง",
      required: true,
      choices: [{ th: "ปกติ" }, { th: "น้อย" }, { th: "ไม่ใส่น้ำแข็ง" }],
    });
  }
  return groups;
}

function syncMenuOptionControlsForCategory(categoryId) {
  const sweetness = $("newMenuSweetness");
  const ice = $("newMenuIce");
  if (!sweetness || !ice) return;
  const noOptions = ["roti", "food"].includes(categoryId);
  sweetness.disabled = noOptions;
  ice.disabled = noOptions;
  if (noOptions) {
    sweetness.checked = false;
    ice.checked = false;
    return;
  }
  if (categoryId === "signature") sweetness.checked = true;
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
      const price = readNumber(row.querySelector("[data-variant-price]")?.value || 0);
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
  const price = readNumber($("newMenuPrice").value || 0);
  const mode = $("priceMode")?.value || "single";
  const sku = $("newMenuSku").value.trim() || nextSku(categoryId);
  const sweetness = categoryId === "signature" || $("newMenuSweetness").checked;
  const ice = !["roti", "food"].includes(categoryId) && $("newMenuIce").checked;
  if (!th) {
    toast("กรุณาใส่ชื่อเมนู");
    return null;
  }
  if (existing && sku !== existing.sku && currentUser().role !== "super_admin") {
    toast("เฉพาะ Mustang admin เท่านั้นที่แก้ไข SKU ได้");
    return null;
  }
  if (!/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(sku)) {
    toast("SKU ต้องเป็นภาษาอังกฤษ ตัวเลข เครื่องหมาย - หรือ _ เท่านั้น");
    return null;
  }
  if (mode === "single" && price <= 0) {
    toast("กรุณาใส่ราคา");
    return null;
  }
  const variants = readPriceVariantsFromForm(price);
  if (!variants) {
    toast("กรุณาใส่รูปแบบราคาและราคาอย่างน้อย 1 รายการ");
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
    options: buildOptionGroups({ sweetness, ice }, categoryId),
  };
}

function nextCategorySort() {
  return Math.max(0, ...state.categories.map((cat) => Number(cat.sort || 0))) + 1;
}

function readCategoryForm(existingId = "") {
  const th = $("categoryTh").value.trim();
  const en = $("categoryEn").value.trim() || th;
  const sort = Number($("categorySort").value || nextCategorySort());
  const id = existingId || slugify($("categoryId").value.trim() || en || th) || `category-${Date.now()}`;
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

function menuExportPayload() {
  const categoryIds = new Set(state.menu.map((item) => item.categoryId));
  const categories = state.categories
    .filter((category) => categoryIds.has(category.id))
    .map((category) => ({ ...category }));
  const menu = state.menu.map((item) => {
    const normalized = normalizeMenuItem(item);
    return {
      id: normalized.id,
      sku: normalized.sku,
      categoryId: normalized.categoryId,
      th: normalized.th,
      en: normalized.en,
      price: normalized.price,
      variants: structuredClone(normalized.variants || []),
      available: normalized.available !== false,
      options: structuredClone(normalized.options || []),
      costing: structuredClone(normalized.costing || {}),
    };
  });
  return {
    type: "mustang-menu-export",
    version: 1,
    exportedAt: new Date().toISOString(),
    categories,
    menu,
  };
}

function exportMenuJson() {
  const payload = menuExportPayload();
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `mustang-menu-${todayKey()}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}

function normalizeImportedMenuPayload(payload) {
  const categories = Array.isArray(payload?.categories) ? payload.categories : [];
  const menu = Array.isArray(payload?.menu) ? payload.menu : Array.isArray(payload) ? payload : [];
  return {
    categories: categories
      .map((category, index) => ({
        id: slugify(category.id || category.en || category.th || `category-${index + 1}`) || `category-${index + 1}`,
        th: String(category.th || category.en || category.id || "").trim(),
        en: String(category.en || category.th || category.id || "").trim(),
        sort: Number(category.sort || index + 1),
      }))
      .filter((category) => category.id && category.th),
    menu: menu
      .map((item) => {
        const sku = String(item.sku || "").trim();
        const th = String(item.th || item.nameTh || "").trim();
        const categoryId = slugify(item.categoryId || item.category || "imported") || "imported";
        if (!sku || !th || !categoryId) return null;
        return normalizeMenuItem({
          id: item.id ? slugify(item.id) : `m-${slugify(sku)}`,
          sku,
          categoryId,
          th,
          en: String(item.en || item.nameEn || th).trim(),
          price: Number(item.price || item.variants?.[0]?.price || 0),
          variants: Array.isArray(item.variants) ? item.variants : [],
          image: "assets/mustang-logo.png",
          available: item.available !== false,
          options: Array.isArray(item.options) ? item.options : [],
          costing: item.costing && typeof item.costing === "object" ? item.costing : {},
          _updatedAt: Date.now(),
        });
      })
      .filter(Boolean),
  };
}

async function importMenuJsonFile(file) {
  if (!file) return;
  try {
    const payload = JSON.parse(await file.text());
    const imported = normalizeImportedMenuPayload(payload);
    if (!imported.menu.length) return toast("ไม่พบข้อมูลเมนูในไฟล์");
    const categoryById = new Map(state.categories.map((category) => [category.id, category]));
    for (const category of imported.categories) {
      const existing = categoryById.get(category.id);
      if (existing) Object.assign(existing, { th: category.th, en: category.en, sort: category.sort });
      else {
        state.categories.push(category);
        categoryById.set(category.id, category);
      }
    }
    for (const menuItem of imported.menu) {
      if (!categoryById.has(menuItem.categoryId)) {
        const fallbackCategory = {
          id: menuItem.categoryId,
          th: menuItem.categoryId,
          en: menuItem.categoryId,
          sort: nextCategorySort(),
        };
        state.categories.push(fallbackCategory);
        categoryById.set(fallbackCategory.id, fallbackCategory);
      }
      const existingIndex = state.menu.findIndex((item) => item.sku.toLowerCase() === menuItem.sku.toLowerCase());
      if (existingIndex >= 0) {
        state.menu[existingIndex] = normalizeMenuItem({
          ...state.menu[existingIndex],
          ...menuItem,
          id: state.menu[existingIndex].id,
          image: state.menu[existingIndex].image || "assets/mustang-logo.png",
        });
        if (!state.masterTemplate.menuIds.includes(state.menu[existingIndex].id))
          state.masterTemplate.menuIds.push(state.menu[existingIndex].id);
      } else {
        let id = menuItem.id;
        if (state.menu.some((item) => item.id === id)) id = `m-${slugify(menuItem.sku)}-${Date.now()}`;
        state.menu.push({ ...menuItem, id });
        if (!state.masterTemplate.menuIds.includes(id)) state.masterTemplate.menuIds.push(id);
      }
    }
    state.masterTemplate.updatedAt = new Date().toISOString();
    editingMenuId = "";
    uploadedMenuImageDataUrl = "";
    menuFormPriceMode = "";
    await saveState({ allowCatalogWrite: true });
    render();
    toast(`นำเข้าเมนู ${imported.menu.length} รายการแล้ว`);
  } catch {
    toast("นำเข้าไฟล์ไม่สำเร็จ กรุณาตรวจสอบไฟล์ JSON");
  }
}

function renderBranchSelect() {
  const branches = currentRole().canSwitchBranches
    ? state.branches
    : state.branches.filter((item) => currentUser().branchIds.includes(item.id));
  $("branchSelect").innerHTML = branches.map((item) => `<option value="${item.id}">${item.nameTh}</option>`).join("");
  $("branchSelect").value = state.activeBranchId;
}

function renderTabs() {
  const sortedCategories = [...state.categories].sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0));
  if (!sortedCategories.some((cat) => cat.id === selectedCategory)) selectedCategory = sortedCategories[0]?.id || "";
  if (!sortedCategories.some((cat) => cat.id === selectedCustomerCategory))
    selectedCustomerCategory = sortedCategories[0]?.id || "";
  const tabs = sortedCategories
    .map(
      (cat) =>
        `<button class="${cat.id === selectedCategory ? "active" : ""}" data-cat="${cat.id}">${categoryName(cat)}</button>`,
    )
    .join("");
  $("categoryTabs").innerHTML = tabs;
  $("customerTabs").innerHTML = sortedCategories
    .map(
      (cat) =>
        `<button class="${cat.id === selectedCustomerCategory ? "active" : ""}" data-customer-cat="${cat.id}">${categoryName(cat)}</button>`,
    )
    .join("");
}

function renderMenus() {
  const search = ($("menuSearch").value || "").toLowerCase();
  const staffItems = state.menu.filter(
    (item) =>
      isCatalogMenu(item) &&
      item.categoryId === selectedCategory &&
      item.available &&
      (!search || `${item.th} ${item.en} ${item.sku}`.toLowerCase().includes(search)),
  );
  $("menuGrid").innerHTML = staffItems.map(menuCard).join("");
  const customerItems = state.menu.filter((item) => isCatalogMenu(item) && item.categoryId === selectedCustomerCategory && item.available);
  $("customerMenuGrid").innerHTML = customerItems.map((item) => menuCard(item, true)).join("");
}

function menuCard(item, customer = false) {
  const variants = activeVariants(item);
  const variantButtons =
    variants.length > 1
      ? `<span class="variant-buttons">${variants
          .map(
            (variant) => `
        <button type="button" data-menu-variant="${item.id}" data-variant-id="${variant.id}" data-cart="${customer ? "customer" : "staff"}">
          <span>${variantName(variant)}</span>
          <strong>${fmt.format(variant.price)}</strong>
        </button>
      `,
          )
          .join("")}</span>`
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
  $("promotionSelect").innerHTML = state.promotions
    .filter((item) => item.active)
    .map((promo) => `<option value="${promo.id}">${promo.nameTh}</option>`)
    .join("");
  $("promotionSelect").value = state.promotions.some((promo) => promo.id === selectedPromo && promo.active)
    ? selectedPromo
    : "none";
  renderTokenSelect();
  renderCart("staff", "cartList", "cartTotals");
  renderCart("customer", "customerCartList", "customerTotals");
  renderRecentStaffBills();
}

function renderTokenSelect() {
  renderTokenPicker("staffToken", "staffTokenButtons", "pick-token");
  renderTokenPicker("customerToken", "customerTokenButtons", "pick-customer-token");
}

function renderTokenPicker(inputId, buttonsId, actionName) {
  const selected = $(inputId).value;
  const tokenOptions = branch()
    .tokens.filter((token) => token.active)
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
                <div class="option-selects">${item.options
                  .map((group) => {
                    const current = line.options.find((option) => option.groupId === group.id);
                    return `
                    <label>${group.th}${group.required ? " *" : ""}
                      <select data-cart-option="${cartName}" data-index="${index}" data-group="${group.id}">
                        ${group.required ? "" : `<option value="" ${current ? "" : "selected"}>ไม่เลือก</option>`}
                        ${group.choices
                          .map((choice) => {
                            const selected = current && current.label === choice.th ? "selected" : "";
                            const price = choice.price ? ` +${choice.price}` : "";
                            return `<option value="${choice.th}" ${selected}>${choice.th}${price}</option>`;
                          })
                          .join("")}
                      </select>
                    </label>
                  `;
                  })
                  .join("")}</div>
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
    $(listId).innerHTML =
      html ||
      cart
        .map((line) => `<div class="cart-item"><strong>${line.nameTh || line.sku || line.menuId}</strong></div>`)
        .join("");
  } else {
    $(listId).innerHTML = `<p class="sku">ยังไม่มีรายการ</p>`;
  }
  const summary = cartSummary(cartName);
  const received = Number($("paymentAmount").value || 0);
  const change = cartName === "staff" ? Math.max(0, received - summary.total) : 0;
  $(totalsId).innerHTML = `
    <div class="total-line"><span>ยอดรวม</span><strong>${fmt.format(summary.subtotal)}</strong></div>
    <div class="total-line"><span>ส่วนลด</span><strong>${fmt.format(summary.discount)}</strong></div>
    <div class="total-line final"><span>สุทธิ</span><strong>${fmt.format(summary.total)}</strong></div>
    ${cartName === "staff" ? `<div class="total-line"><span>เงินทอน</span><strong>${fmt.format(change)}</strong></div>` : ""}
  `;
}

function renderRecentStaffBills() {
  const target = $("recentStaffBills");
  if (!target) return;
  const orders = state.orders
    .filter((order) => order.branchId === state.activeBranchId && order.source === "staff" && order.status !== "cancelled")
    .slice(0, 4);
  target.innerHTML = orders.length
    ? orders
        .map((order) => {
          const paid = isOrderPaid(order);
          const status = paid ? "ชำระแล้ว" : "ยังไม่ชำระ";
          const confirmButton = !paid ? `<button class="primary" data-confirm-payment="${order.id}">รับเงินแล้ว</button>` : "";
          return `
            <article class="recent-bill ${paid ? "paid" : "unpaid"}">
              <div>
                <strong>${order.orderNo} / คิว ${escapeHtml(order.queueToken)}</strong>
                <span>${status} · ${fmt.format(order.total)}</span>
              </div>
              <div class="recent-bill-items">
                ${order.items
                  .map((line) => {
                    const options = optionSummary(line);
                    return `<div><span>${line.qty} x ${lineDisplayName(line)}</span>${options ? `<small>${escapeHtml(options)}</small>` : ""}</div>`;
                  })
                  .join("")}
              </div>
              <div class="recent-bill-actions">
                <button class="secondary" data-print="${order.id}">${paid ? "พิมพ์บิลอีกครั้ง" : "พิมพ์ Invoice"}</button>
                ${confirmButton}
              </div>
            </article>
          `;
        })
        .join("")
    : `<p class="sku">ยังไม่มีบิลล่าสุด</p>`;
}

async function createOrder(source, forceInvoice = false) {
  const cartName = source === "customer" ? "customer" : "staff";
  const cart = carts[cartName];
  if (!cart.length) return toast("กรุณาเลือกเมนูก่อน");
  const token = source === "customer" ? $("customerToken").value.trim() : $("staffToken").value;
  if (!token) return toast("กรุณาระบุหมายเลขคิว");
  if (!isTokenAvailable(token)) return toast("หมายเลขคิวนี้ไม่พร้อมใช้งาน กรุณาตรวจสอบอีกครั้ง");
  const summary = cartSummary(cartName);
  const paymentMethod = source === "customer" ? $("customerPayment").value : $("paymentMethod").value;
  const paymentAmount = source === "staff" ? Number($("paymentAmount").value || 0) : 0;
  const paidNow = source === "staff" && !forceInvoice && paymentAmount >= summary.total;
  if (source === "staff" && !forceInvoice && paymentAmount > 0 && paymentAmount < summary.total) {
    return toast("จำนวนเงินที่รับยังไม่ครบ ถ้าต้องการออก Invoice ให้เว้นช่องจำนวนเงินไว้");
  }
  const order = {
    id: crypto.randomUUID(),
    branchId: state.activeBranchId,
    orderNo: nextOrderNo(),
    queueToken: token,
    source,
    customerName: source === "customer" ? $("customerName").value.trim() : $("staffCustomerName").value.trim(),
    customerPhone: source === "customer" ? $("customerPhone").value.trim() : $("staffCustomerPhone").value.trim(),
    paymentMethod,
    cashReceived: source === "staff" && paidNow && paymentMethod === "cash" ? paymentAmount : 0,
    transferReceived: source === "staff" && paidNow && paymentMethod === "transfer" ? paymentAmount : 0,
    subtotal: summary.subtotal,
    discount: summary.discount,
    total: summary.total,
    promotion: summary.promo,
    status: "in_kitchen",
    createdAt: new Date().toISOString(),
    _updatedAt: Date.now(),
    paidAt: paidNow ? new Date().toISOString() : null,
    items: cart.map((line) => ({ ...line, done: false })),
  };
  state.orders.unshift(order);
  carts[cartName] = [];
  saveDraftCarts();
  $("customerToken").value = "";
  $("customerName").value = "";
  $("customerPhone").value = "";
  $("staffCustomerName").value = "";
  $("staffCustomerPhone").value = "";
  $("paymentAmount").value = "";
  await saveState();
  notifyKitchen(order);
  await broadcastEvent("new_kitchen_order", {
    orderId: order.id,
    branchId: order.branchId,
    orderNo: order.orderNo,
    queueToken: order.queueToken,
  });
  render();
  if (paidNow) {
    printReceipt(order.id);
    toast("ส่งออเดอร์เข้าครัวแล้ว");
  } else if (source === "staff") {
    printReceipt(order.id);
    toast("ออก Invoice และส่งเข้าครัวแล้ว");
  } else {
    showCustomerOrderSummary(order);
  }
}

function showCustomerOrderSummary(order) {
  const target = $("customerOrderSummary");
  if (!target) return toast("ส่งออเดอร์เข้าครัวแล้ว กรุณาชำระเงินก่อนรับอาหาร");
  const phone = String(order.customerPhone || "").trim();
  target.innerHTML = `
    <div class="customer-summary-card">
      <div class="customer-summary-top">
        <img src="assets/mustang-logo.png" alt="Mustang cafe" />
        <div>
          <p class="eyebrow">Mustang Cafe</p>
          <h2>ส่งออเดอร์เข้าครัวแล้ว</h2>
          <span>กรุณาชำระเงินก่อนรับอาหาร</span>
        </div>
      </div>
      <div class="customer-summary-queue">
        <span>หมายเลขคิว</span>
        <strong>${escapeHtml(order.queueToken)}</strong>
      </div>
      <div class="customer-summary-meta">
        <div><span>เลขออเดอร์</span><strong>${escapeHtml(order.orderNo)}</strong></div>
        <div><span>เวลา</span><strong>${dateFmt.format(new Date(order.createdAt))}</strong></div>
        <div><span>ชำระเงิน</span><strong>${paymentName(order.paymentMethod)}</strong></div>
        ${customerLabel(order) ? `<div><span>ชื่อลูกค้า</span><strong>${escapeHtml(customerLabel(order))}</strong></div>` : ""}
        ${phone ? `<div><span>โทรศัพท์</span><strong>${escapeHtml(phone)}</strong></div>` : ""}
      </div>
      <div class="customer-summary-items">
        <h3>รายการที่สั่ง</h3>
        ${order.items.map(itemLine).join("")}
      </div>
      <div class="total-line final customer-summary-total"><span>ยอดรวม</span><strong>${fmt.format(order.total)}</strong></div>
      <p class="customer-summary-note">กรุณาแคปหน้าจอนี้ หรือแสดงหน้านี้ให้พนักงานที่ kiosk เพื่อยืนยันออเดอร์และชำระเงินก่อนรับอาหาร</p>
      <button class="primary" data-close-customer-summary="true">สั่งออเดอร์ใหม่</button>
    </div>
  `;
  target.classList.remove("hidden");
}

function hideCustomerOrderSummary() {
  $("customerOrderSummary")?.classList.add("hidden");
}

async function confirmPayment(orderId) {
  const order = state.orders.find((item) => item.id === orderId);
  order.paidAt = new Date().toISOString();
  order.cashReceived = order.paymentMethod === "cash" ? order.total : 0;
  order.transferReceived = order.paymentMethod === "transfer" ? order.total : 0;
  touchOrder(order);
  await saveState();
  await broadcastEvent("order_updated", {
    orderId: order.id,
    branchId: order.branchId,
    status: order.status,
    orderNo: order.orderNo,
    queueToken: order.queueToken,
  });
  render();
}

function renderPayments() {
  // Kept as a legacy hook because older render paths still call it.
}

function orderCardPayment(order) {
  return `
    <article class="order-card order-card-payment">
      <header><div><h3>${order.orderNo}</h3><span>${dateFmt.format(new Date(order.createdAt))}</span></div><span class="queue">คิว ${order.queueToken}</span></header>
      ${customerLine(order)}
      <span class="pill warn">รอยืนยันชำระเงิน</span>
      <div>${order.items.map(itemLine).join("")}</div>
      <div class="total-line final"><span>ยอดชำระ</span><strong>${fmt.format(order.total)}</strong></div>
      <p>วิธีชำระ: ${paymentName(order.paymentMethod)}</p>
      <button class="secondary" data-print="${order.id}">พิมพ์ Invoice / ใบแจ้งยอด</button>
      <button class="primary" data-confirm-payment="${order.id}">ยืนยันชำระเงินและส่งเข้าครัว</button>
      <button class="secondary danger" data-cancel-order="${order.id}">ยกเลิกออเดอร์</button>
    </article>
  `;
}

function renderKitchen() {
  const pending = state.orders.filter(
    (order) => order.branchId === state.activeBranchId && order.status === "pending_payment",
  );
  const active = state.orders.filter(
    (order) => order.branchId === state.activeBranchId && order.status === "in_kitchen",
  );
  const done = state.orders.filter((order) => order.branchId === state.activeBranchId && order.status === "ready");
  const sections = [
    { title: "กำลังทำอาหาร", className: "cooking", count: active.length, cards: active.map(orderCardKitchen) },
    { title: "รอลูกค้ารับอาหาร", className: "ready", count: done.length, cards: done.map(orderCardKitchen) },
    { title: "รอยืนยันชำระเงิน", className: "waiting", count: pending.length, cards: pending.map(orderCardPayment) },
  ];
  const hasOrders = sections.some((section) => section.count);
  $("kitchenBoard").innerHTML = hasOrders
    ? sections
        .map(
          (section) => `
      <div class="order-section-head ${section.className}">
        <h2>${section.title}</h2>
        <span class="pill">${section.count} ออเดอร์</span>
      </div>
      ${section.cards.join("") || `<p class="pill muted-card">ไม่มีรายการ</p>`}
    `,
        )
        .join("")
    : `<p class="pill">ไม่มีรายการ</p>`;
}

function orderCardKitchen(order) {
  return `
    <article class="order-card ${order.status === "ready" ? "order-card-ready" : "order-card-cooking"}">
      <header>
        <div><h3>${order.orderNo}</h3><span>${dateFmt.format(new Date(order.createdAt))}</span></div>
        <span class="queue">คิว ${order.queueToken}</span>
      </header>
      ${customerLine(order)}
      <span class="pill ${order.status === "ready" ? "success" : ""}">${order.status === "ready" ? "รอลูกค้ารับอาหาร" : "กำลังทำ"}</span>
      ${isOrderPaid(order) ? `<span class="pill success">ชำระแล้ว</span>` : `<span class="pill warn">ยังไม่ชำระ</span>`}
      <div>${order.items
        .map((line, index) => {
          const item = lineMenu(line);
          return `
          <label class="check-line">
            <input type="checkbox" data-item-done="${order.id}" data-index="${index}" ${line.done ? "checked" : ""}>
            <span>${line.qty} x ${lineDisplayName(line)}<br><small>${optionSummary(line)}</small></span>
            <strong>${item.sku}</strong>
          </label>
        `;
        })
        .join("")}</div>
      ${
        order.status === "in_kitchen"
          ? `
        <button class="primary" data-order-ready="${order.id}">อาหารเสร็จแล้ว</button>
        ${isOrderPaid(order) ? "" : `<button class="secondary" data-confirm-payment="${order.id}">รับเงินแล้ว</button>`}
        <button class="secondary" data-print="${order.id}">${isOrderPaid(order) ? "พิมพ์บิลอีกครั้ง" : "พิมพ์ Invoice"}</button>
        <button class="secondary danger" data-cancel-order="${order.id}">ยกเลิกออเดอร์</button>
      `
          : `
        <span class="pill">พร้อมเรียกคิว ${order.queueToken}</span>
        ${isOrderPaid(order) ? "" : `<button class="secondary" data-confirm-payment="${order.id}">รับเงินแล้ว</button>`}
        <button class="primary" data-picked-up="${order.id}">รับอาหารแล้ว / คืน token แล้ว</button>
        <button class="secondary" data-print="${order.id}">${isOrderPaid(order) ? "พิมพ์บิลอีกครั้ง" : "พิมพ์ Invoice"}</button>
      `
      }
    </article>
  `;
}

function itemLine(line) {
  const options = optionSummary(line);
  return `<div class="total-line"><span>${line.qty} x ${lineDisplayName(line)}${options ? `<br><small>${escapeHtml(options)}</small>` : ""}</span><strong>${fmt.format(linePrice(line))}</strong></div>`;
}

function paymentName(method) {
  return { cash: "เงินสด", transfer: "โอน/QR", mixed: "ผสม" }[method] || method;
}

function orderPaymentBreakdown(order) {
  if (order.paymentMethod === "cash") return { cash: order.total, transfer: 0, mixed: 0 };
  if (order.paymentMethod === "transfer") return { cash: 0, transfer: order.total, mixed: 0 };
  return { cash: 0, transfer: 0, mixed: order.total };
}

function orderLineNet(line, order) {
  const gross = linePrice(line);
  if (!order.subtotal) return gross;
  return (gross / order.subtotal) * order.total;
}

function renderReports() {
  const start = $("reportStart").value;
  const end = $("reportEnd").value;
  const rows = state.orders.filter((order) => {
    if (order.branchId !== state.activeBranchId) return false;
    const day = order.createdAt.slice(0, 10);
    return (!start || day >= start) && (!end || day <= end);
  });
  const paid = rows.filter((order) => isOrderPaid(order) && order.status !== "cancelled");
  const sales = paid.reduce((sum, order) => sum + order.total, 0);
  const totalUnits = paid.reduce(
    (sum, order) => sum + order.items.reduce((orderTotal, line) => orderTotal + Number(line.qty || 0), 0),
    0,
  );
  const cancelled = rows.filter((order) => order.status === "cancelled").length;
  $("metricGrid").innerHTML = `
    <div class="metric"><span>ยอดขาย</span><strong>${fmt.format(sales)}</strong></div>
    <div class="metric"><span>จำนวนออเดอร์</span><strong>${paid.length}</strong></div>
    <div class="metric"><span>จำนวนแก้ว/ชิ้นรวม</span><strong>${totalUnits}</strong></div>
    <div class="metric"><span>ยกเลิก</span><strong>${cancelled}</strong></div>
  `;
  renderOwnerCostReport(paid);
  const paymentTotals = paid.reduce(
    (totals, order) => {
      const payment = orderPaymentBreakdown(order);
      totals.cash += payment.cash;
      totals.transfer += payment.transfer;
      totals.mixed += payment.mixed;
      totals.counts[order.paymentMethod] += 1;
      return totals;
    },
    { cash: 0, transfer: 0, mixed: 0, counts: { cash: 0, transfer: 0, mixed: 0 } },
  );
  $("reportPaymentSummary").innerHTML = `
    <div class="metric"><span>เงินสด</span><strong>${fmt.format(paymentTotals.cash)}</strong><small>${paymentTotals.counts.cash} ออเดอร์</small></div>
    <div class="metric"><span>โอน/QR</span><strong>${fmt.format(paymentTotals.transfer)}</strong><small>${paymentTotals.counts.transfer} ออเดอร์</small></div>
    <div class="metric"><span>ผสม</span><strong>${fmt.format(paymentTotals.mixed)}</strong><small>${paymentTotals.counts.mixed} ออเดอร์</small></div>
  `;
  const menuSummary = new Map();
  paid.forEach((order) => {
    order.items.forEach((line) => {
      const item = lineMenu(line);
      const catalogItem = lineCatalogMenu(line);
      const catalogVariant = lineCatalogVariant(line, catalogItem);
      const name = lineDisplayName(line);
      const category = lineCategoryName(line);
      const keySku = String(item.sku || line.sku || catalogItem?.id || line.menuId || name).toLowerCase();
      const keyVariant = catalogVariant?.id || (catalogItem && hasRealVariants(catalogItem) ? line.variant?.id || "" : "");
      const key = `${lineCategoryId(line)}:${keySku}:${keyVariant}`;
      if (!menuSummary.has(key)) {
        menuSummary.set(key, {
          sku: item.sku || line.sku || "-",
          category,
          name,
          qty: 0,
          total: 0,
          cashQty: 0,
          cashTotal: 0,
          transferQty: 0,
          transferTotal: 0,
          mixedQty: 0,
          mixedTotal: 0,
        });
      }
      const summary = menuSummary.get(key);
      const amount = orderLineNet(line, order);
      summary.qty += line.qty;
      summary.total += amount;
      if (order.paymentMethod === "cash") {
        summary.cashQty += line.qty;
        summary.cashTotal += amount;
      } else if (order.paymentMethod === "transfer") {
        summary.transferQty += line.qty;
        summary.transferTotal += amount;
      } else {
        summary.mixedQty += line.qty;
        summary.mixedTotal += amount;
      }
    });
  });
  const categorySummary = new Map();
  menuSummary.forEach((item) => {
    if (!categorySummary.has(item.category)) {
      categorySummary.set(item.category, {
        category: item.category,
        qty: 0,
        total: 0,
        cashQty: 0,
        cashTotal: 0,
        transferQty: 0,
        transferTotal: 0,
        mixedQty: 0,
        mixedTotal: 0,
      });
    }
    const category = categorySummary.get(item.category);
    category.qty += item.qty;
    category.total += item.total;
    category.cashQty += item.cashQty;
    category.cashTotal += item.cashTotal;
    category.transferQty += item.transferQty;
    category.transferTotal += item.transferTotal;
    category.mixedQty += item.mixedQty;
    category.mixedTotal += item.mixedTotal;
  });
  $("reportCategorySummaryRows").innerHTML =
    Array.from(categorySummary.values())
      .sort((a, b) => a.category.localeCompare(b.category, "th"))
      .map(
        (item) => `
      <tr>
        <td>${escapeHtml(item.category)}</td>
        <td>${item.qty}</td>
        <td>${fmt.format(item.total)}</td>
        <td>${item.cashQty} / ${fmt.format(item.cashTotal)}</td>
        <td>${item.transferQty} / ${fmt.format(item.transferTotal)}</td>
        <td>${item.mixedQty} / ${fmt.format(item.mixedTotal)}</td>
      </tr>
    `,
      )
      .join("") || `<tr><td colspan="6">ไม่มีข้อมูลยอดขายในช่วงนี้</td></tr>`;
  $("reportMenuSummaryRows").innerHTML =
    Array.from(menuSummary.values())
      .sort(
        (a, b) =>
          a.category.localeCompare(b.category, "th") ||
          a.sku.localeCompare(b.sku) ||
          a.name.localeCompare(b.name, "th"),
      )
      .map(
        (item) => `
      <tr>
        <td>${escapeHtml(item.sku)}</td>
        <td>${escapeHtml(item.category)}</td>
        <td>${escapeHtml(item.name)}</td>
        <td>${item.qty}</td>
        <td>${fmt.format(item.total)}</td>
        <td>${item.cashQty} / ${fmt.format(item.cashTotal)}</td>
        <td>${item.transferQty} / ${fmt.format(item.transferTotal)}</td>
        <td>${item.mixedQty} / ${fmt.format(item.mixedTotal)}</td>
      </tr>
    `,
      )
      .join("") || `<tr><td colspan="8">ไม่มีข้อมูลยอดขายในช่วงนี้</td></tr>`;
  const reportCategories = [...state.categories].sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0));
  $("reportRows").innerHTML = rows
    .map(
      (order) => `
      <tr>
        <td>${dateFmt.format(new Date(order.createdAt))}</td>
        <td>${order.orderNo}</td>
        <td>${order.queueToken}</td>
        <td>${escapeHtml(customerLabel(order) || "-")}</td>
        <td>${order.items
          .map((line, index) => {
            const filterKey = `${order.id}:${index}`;
            const linkedMenu = state.menu.find((item) => item.id === line.menuId);
            const selectedCategoryId =
              reportMenuCategoryFilters.get(filterKey) || lineCategoryId(line) || reportCategories[0]?.id || "";
            const filteredMenus = state.menu
              .filter((item) => isCatalogMenu(item) && item.categoryId === selectedCategoryId)
              .sort((a, b) => (a.th || a.en || "").localeCompare(b.th || b.en || "", "th"));
            return `
              <div class="report-order-line">
                <strong>${line.qty} x ${escapeHtml(lineDisplayName(line))}</strong>
                <small>เชื่อมกับ: ${linkedMenu ? `${escapeHtml(lineCategoryName(line))} / ${escapeHtml(linkedMenu.th || linkedMenu.en)}` : "ยังไม่พบเมนูหลัก"}</small>
                <div class="report-link-controls">
                  <label>
                    <span>กรองหมวดหมู่</span>
                    <select data-order-menu-category="${order.id}" data-line-index="${index}">
                    ${reportCategories
                      .map(
                        (category) =>
                          `<option value="${escapeHtml(category.id)}" ${category.id === selectedCategoryId ? "selected" : ""}>${escapeHtml(category.th || category.en)}</option>`,
                      )
                      .join("")}
                    </select>
                  </label>
                  <label>
                    <span>เลือกเมนูที่ถูกต้อง</span>
                    <select data-order-menu="${order.id}" data-line-index="${index}">
                      <option value="">เลือกเมนู...</option>
                      ${filteredMenus
                        .map(
                          (menu) =>
                            `<option value="${escapeHtml(menu.id)}" ${menu.id === line.menuId ? "selected" : ""}>${escapeHtml(menu.sku)} · ${escapeHtml(menu.th || menu.en)}</option>`,
                        )
                        .join("")}
                    </select>
                  </label>
                </div>
              </div>
            `;
          })
          .join("")}</td>
        <td>${paymentName(order.paymentMethod)}</td>
        <td>${fmt.format(order.total)}</td>
        <td>${statusName(order.status)}${!isOrderPaid(order) && order.status !== "cancelled" ? " / ยังไม่ชำระ" : ""}</td>
      </tr>
    `,
    )
    .join("");
}

function statusName(status) {
  return (
    {
      pending_payment: "รอชำระ",
      in_kitchen: "อยู่ในครัว",
      ready: "อาหารพร้อม",
      picked_up: "รับแล้ว",
      cancelled: "ยกเลิก",
    }[status] || status
  );
}

function renderOwnerCostReport(paidOrders) {
  const section = $("ownerCostReport");
  const metricTarget = $("ownerCostMetricGrid");
  const dailyTarget = $("ownerCostDailyRows");
  if (!section || !metricTarget || !dailyTarget) return;
  if (!canViewCostReport()) {
    section.classList.add("hidden");
    metricTarget.innerHTML = "";
    dailyTarget.innerHTML = "";
    return;
  }
  section.classList.remove("hidden");
  const totals = paidOrders.reduce(
    (summary, order) => {
      const cost = orderCost(order);
      summary.sales += Number(order.total || 0);
      summary.cost += cost;
      summary.qty += (order.items || []).reduce((sum, line) => sum + Number(line.qty || 0), 0);
      return summary;
    },
    { sales: 0, cost: 0, qty: 0 },
  );
  const profit = totals.sales - totals.cost;
  const margin = totals.sales > 0 ? (profit / totals.sales) * 100 : 0;
  metricTarget.innerHTML = `
    <div class="metric"><span>ยอดขาย</span><strong>${fmt.format(totals.sales)}</strong></div>
    <div class="metric"><span>ต้นทุนรวม</span><strong>${costFmt.format(totals.cost)}</strong></div>
    <div class="metric"><span>ส่วนต่าง</span><strong>${costFmt.format(profit)}</strong></div>
    <div class="metric"><span>ส่วนต่าง %</span><strong>${margin.toFixed(1)}%</strong><small>${totals.qty} แก้ว/ชิ้น</small></div>
  `;
  const daily = new Map();
  paidOrders.forEach((order) => {
    const day = order.createdAt.slice(0, 10);
    if (!daily.has(day)) daily.set(day, { day, qty: 0, sales: 0, cost: 0 });
    const row = daily.get(day);
    row.qty += (order.items || []).reduce((sum, line) => sum + Number(line.qty || 0), 0);
    row.sales += Number(order.total || 0);
    row.cost += orderCost(order);
  });
  dailyTarget.innerHTML =
    Array.from(daily.values())
      .sort((a, b) => a.day.localeCompare(b.day))
      .map((row) => {
        const rowProfit = row.sales - row.cost;
        const rowMargin = row.sales > 0 ? (rowProfit / row.sales) * 100 : 0;
        return `
          <tr>
            <td>${escapeHtml(row.day)}</td>
            <td>${row.qty}</td>
            <td>${fmt.format(row.sales)}</td>
            <td>${costFmt.format(row.cost)}</td>
            <td>${costFmt.format(rowProfit)}</td>
            <td>${rowMargin.toFixed(1)}%</td>
          </tr>
        `;
      })
      .join("") || `<tr><td colspan="6">ไม่มีข้อมูลยอดขายในช่วงนี้</td></tr>`;
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
      ${state.users
        .map(
          (user) => `
        <div class="admin-row">
          <span>
            <strong>${user.name}</strong><br>
            <small>@${user.username} / ${roles[user.role]?.label || user.role} / ${user.branchIds.map((id) => state.branches.find((branchItem) => branchItem.id === id)?.nameTh || id).join(", ")}</small>
          </span>
          <div class="role-matrix">
            <select data-user-role="${user.id}">
              ${Object.entries(roles)
                .map(
                  ([roleId, role]) =>
                    `<option value="${roleId}" ${user.role === roleId ? "selected" : ""}>${role.label}</option>`,
                )
                .join("")}
            </select>
            <select data-user-branch="${user.id}">
              ${state.branches.map((branchItem) => `<option value="${branchItem.id}" ${user.branchIds.includes(branchItem.id) ? "selected" : ""}>${branchItem.nameTh}</option>`).join("")}
            </select>
            <button class="secondary" data-open-password="${user.id}">เปลี่ยน password</button>
            <label class="field hidden" data-password-panel="${user.id}">
              <span>Password ใหม่</span>
              <input data-user-field="password" data-user-id="${user.id}" type="password" value="" placeholder="กรอก password ใหม่">
            </label>
            <button class="secondary" data-delete-user="${user.id}">ลบ user</button>
          </div>
        </div>
      `,
        )
        .join("")}
    </div>
    <div class="admin-form">
      <label class="field"><span>ชื่อผู้ใช้ใหม่</span><input id="newUserName" placeholder="Branch Staff"></label>
      <label class="field"><span>Username</span><input id="newUserUsername" placeholder="staff1"></label>
      <label class="field"><span>Password</span><input id="newUserPassword" type="password" value="mustang666"></label>
      <label class="field"><span>Role</span><select id="newUserRole">${Object.entries(roles)
        .map(([roleId, role]) => `<option value="${roleId}">${role.label}</option>`)
        .join("")}</select></label>
      <label class="field"><span>Branch</span><select id="newUserBranch">${state.branches.map((branchItem) => `<option value="${branchItem.id}">${branchItem.nameTh}</option>`).join("")}</select></label>
      <button class="primary" id="addUser">เพิ่ม user</button>
    </div>
  `;

  $("branchAdmin").innerHTML = `
    <div class="admin-list">
      ${state.branches
        .map(
          (item) => `
        <div class="admin-row">
          <span>
            <strong>${item.nameTh}</strong><br>
            <small>${item.nameEn} / ${item.tokens.length} tokens / ${item.templateMode === "linked" ? "Linked template" : "Copied template"}</small>
          </span>
          <button class="secondary" data-switch-branch="${item.id}">${item.id === state.activeBranchId ? "กำลังใช้" : "เปิดสาขา"}</button>
        </div>
      `,
        )
        .join("")}
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

  $("tokenAdmin").innerHTML = `<div class="admin-list">${branch()
    .tokens.map(
      (token) => `
    <div class="admin-row">
      <span>Token ${token.label} - ${tokenLabel(tokenStatus(token))}</span>
      <button class="secondary" data-toggle-token="${token.id}">${token.active ? "เปิดใช้" : "ปิด"}</button>
    </div>
  `,
    )
    .join("")}</div>
  <div class="admin-form">
    <label class="field"><span>Token list ของสาขานี้</span><input id="branchTokenList" value="${branch()
      .tokens.map((token) => token.label)
      .join(",")}"></label>
    <label class="field"><span>QR / bank label</span><input id="branchQrLabel" value="${branch().qrLabel || ""}"></label>
    <button class="primary" id="saveBranchSettings">บันทึกคิวและ QR ของสาขา</button>
  </div>`;
  $("promoAdmin").innerHTML = `<div class="admin-list">${state.promotions
    .filter((promo) => promo.id !== "none")
    .map(
      (promo) => `
    <div class="admin-row">
      <span>${promo.nameTh}</span>
      <button class="secondary" data-toggle-promo="${promo.id}">${promo.active ? "เปิดใช้" : "ปิด"}</button>
    </div>
  `,
    )
    .join("")}</div>`;
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
  const canEditSku = currentUser().role === "super_admin";
  const imageValue = editing && !editing.image.startsWith("data:") ? editing.image : "";
  const previewImage = uploadedMenuImageDataUrl || editing?.image || "assets/mustang-logo.png";
  const formCategoryId = editing?.categoryId || sortedCategories[0]?.id || "signature";
  const hasSweetness = editing ? editing.options.some((group) => group.id === "sweet") : formCategoryId === "signature";
  const hasIce = editing ? editing.options.some((group) => group.id === "ice") : false;
  const disableOptions = ["roti", "food"].includes(formCategoryId);
  const editingVariants = variantsForForm(editing);
  const priceMode = menuFormPriceMode || (editing && hasRealVariants(editing) ? "variants" : "single");
  const basePrice = editing ? defaultVariant(editing)?.price || editing.price : "";
  const formModeTitle = editing ? "โหมดแก้ไขเมนูเดิม" : "โหมดเพิ่มเมนูใหม่";
  const formModeDetail = editing
    ? `กำลังแก้ไข ${editing.sku} · ${editing.th} การกดบันทึกจะทับเมนูนี้ ไม่ได้สร้างเมนูใหม่`
    : "กำลังสร้างเมนูใหม่ ฟอร์มนี้จะเพิ่มรายการใหม่เข้าเมนูร้าน";

  $("categoryAdmin").innerHTML = `
    <details id="categoryToolsDetails" class="category-admin-details" ${categoryToolsOpen || editingCategory ? "open" : ""}>
      <summary>เปิดเครื่องมือจัดการหมวดหมู่</summary>
      <div class="category-admin-body">
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
          ${sortedCategories
            .map((cat) => {
              const count = state.menu.filter((item) => isCatalogMenu(item) && item.categoryId === cat.id).length;
              return `
              <div class="admin-row">
                <span><strong>${cat.th}</strong><br><small>${cat.id} / ${cat.en} / ลำดับ ${cat.sort} / ${count} เมนู</small></span>
                <div class="role-matrix">
                  <button class="secondary" data-edit-category="${cat.id}">แก้ไข</button>
                  <button class="secondary" data-delete-category="${cat.id}">ลบ</button>
                </div>
              </div>
            `;
            })
            .join("")}
        </div>
      </div>
    </details>
  `;

  $("menuFormAdmin").innerHTML = `
    <div class="admin-form flat menu-form-shell ${editing ? "editing" : "creating"}">
      <div class="menu-form-mode ${editing ? "editing" : "creating"}">
        <div>
          <p class="mode-chip">${editing ? "แก้ไข" : "เพิ่มใหม่"}</p>
          <strong>${formModeTitle}</strong>
          <span>${escapeHtml(formModeDetail)}</span>
        </div>
        ${editing ? `<button class="primary" type="button" id="startNewMenu">เพิ่มเมนูใหม่แทน</button>` : ""}
      </div>
      <label class="field"><span>หมวดหมู่</span><select id="newMenuCategory">${sortedCategories.map((cat) => `<option value="${cat.id}" ${editing?.categoryId === cat.id ? "selected" : ""}>${cat.th}</option>`).join("")}</select></label>
      <label class="field"><span>SKU *${editing && !canEditSku ? " (แก้ไขได้เฉพาะ Mustang admin)" : ""}</span><input id="newMenuSku" value="${escapeHtml(editing?.sku || "")}" placeholder="เช่น COFFEE-001" autocapitalize="characters" spellcheck="false" ${editing && !canEditSku ? "readonly" : ""}></label>
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
          ${editingVariants
            .map(
              (variant) => `
            <div class="variant-row" data-price-variant-row data-variant-id="${escapeHtml(variant.id)}">
              <input data-variant-th value="${escapeHtml(variant.th)}" placeholder="ร้อน">
              <input data-variant-en value="${escapeHtml(variant.en)}" placeholder="Hot">
              <input data-variant-price type="number" min="0" inputmode="decimal" value="${variant.price || ""}" placeholder="79">
              <label><input data-variant-active type="checkbox" ${variant.active !== false ? "checked" : ""}></label>
            </div>
          `,
            )
            .join("")}
        </div>
        <button class="secondary" type="button" id="addVariantRow">เพิ่มรูปแบบราคา</button>
      </div>
      <label class="field"><span>อัปโหลดรูปจากเครื่อง</span><input id="newMenuImageFile" type="file" accept="image/*"></label>
      <label class="field"><span>หรือใส่ path/URL รูปภาพ</span><input id="newMenuImage" value="${escapeHtml(imageValue)}" placeholder="assets/mustang-logo.png"></label>
      <div class="image-preview" id="newMenuImagePreview"><img src="${escapeHtml(previewImage)}" alt="preview"><span>${editing ? "รูปปัจจุบัน" : "Preview"}</span></div>
      <label class="check-inline"><input id="newMenuSweetness" type="checkbox" ${hasSweetness && !disableOptions ? "checked" : ""} ${disableOptions ? "disabled" : ""}> ตัวเลือกความหวาน</label>
      <label class="check-inline"><input id="newMenuIce" type="checkbox" ${hasIce && !disableOptions ? "checked" : ""} ${disableOptions ? "disabled" : ""}> ตัวเลือกน้ำแข็ง</label>
      <div class="form-actions">
        <button class="primary" id="${editing ? "saveMenuEdit" : "addMenu"}">${editing ? "บันทึกการแก้ไขเมนูนี้" : "เพิ่มเมนูใหม่เข้า kiosk"}</button>
        ${editing ? `<button class="secondary" id="cancelMenuEdit">ยกเลิกการแก้ไขและล้างฟอร์ม</button>` : ""}
      </div>
    </div>
  `;

  $("menuAdmin").innerHTML = `
    <div class="menu-transfer-tools">
      <div>
        <strong>นำเข้า / ส่งออกเมนู</strong>
        <span>ส่งออกข้อมูลตัวหนังสือ ราคา SKU หมวดหมู่ ตัวเลือก และต้นทุน ไม่รวมรูปภาพ</span>
      </div>
      <div class="menu-transfer-actions">
        <button class="secondary" type="button" id="openCostMaster">ดู Master ต้นทุน</button>
        <button class="secondary" type="button" id="exportMenuJson">Export menu JSON</button>
        <button class="primary" type="button" id="importMenuJsonButton">Import menu JSON</button>
        <input id="importMenuJsonFile" class="hidden" type="file" accept="application/json,.json">
      </div>
    </div>
    <div class="menu-catalog">
      ${sortedCategories
        .map((cat) => {
          const items = state.menu.filter((item) => isCatalogMenu(item) && item.categoryId === cat.id);
          if (!items.length) return "";
          return `
          <section class="menu-catalog-group">
            <header>
              <div>
                <p class="eyebrow">${cat.en}</p>
                <h3>${cat.th}</h3>
              </div>
              <span class="pill">${items.length} เมนู</span>
            </header>
            <div class="menu-catalog-list">
              ${items
                .map((item) => {
                  const variants = activeVariants(item);
                  const variantChips =
                    variants.length > 1
                      ? variants.map((variant) => `<span>${variant.th} ${fmt.format(variant.price)}</span>`).join("")
                      : "";
                  const isEditingThisMenu = editing?.id === item.id;
                  return `
	                  <article class="menu-admin-card ${item.available ? "" : "is-hidden"} ${isEditingThisMenu ? "editing" : ""}">
                    <img src="${item.image}" alt="${item.th}">
                    <div class="menu-admin-main">
                      <div class="menu-admin-title">
                        <div>
                          <strong>${item.th}</strong>
                          <small>${item.en}</small>
                        </div>
	                        <span class="menu-status ${isEditingThisMenu ? "editing" : item.available ? "active" : ""}">${isEditingThisMenu ? "กำลังแก้ไข" : item.available ? "ขายอยู่" : "ซ่อนอยู่"}</span>
                      </div>
                      <div class="menu-admin-meta">
                        <span>${item.sku}</span>
                        <span>${menuPriceLabel(item)}</span>
                        <span class="menu-cost-pill">${menuCostLabel(item)}</span>
                        <span>${item.options.length ? `${item.options.length} ตัวเลือก` : "ไม่มีตัวเลือก"}</span>
                      </div>
                      ${variantChips ? `<div class="variant-chips">${variantChips}</div>` : ""}
                    </div>
                    <div class="menu-admin-actions">
                      <button class="primary" data-edit-menu="${item.id}">แก้ไข</button>
                      <button class="secondary" data-menu-cost="${item.id}">เพิ่ม/แก้ต้นทุน</button>
                      <button class="secondary" data-toggle-menu="${item.id}">${item.available ? "ซ่อน" : "เปิดขาย"}</button>
                      <button class="secondary" data-delete-menu="${item.id}">ลบ</button>
                    </div>
                  </article>
                `;
                })
                .join("")}
            </div>
          </section>
        `;
        })
        .join("")}
    </div>
  `;
}

function printReceipt(orderId) {
  const order = state.orders.find((item) => item.id === orderId);
  if (!order) return;
  const isUnpaid = !isOrderPaid(order);
  const documentTitle = isUnpaid ? "INVOICE / ยังไม่ชำระ" : "RECEIPT / ชำระเงินแล้ว";
  const paymentStatus = isUnpaid ? "UNPAID - กรุณาชำระเงินก่อนรับอาหาร" : "PAID - ชำระเงินแล้ว";
  const receiptLogoUrl = new URL("assets/receipt-horse-line.png", window.location.href);
  receiptLogoUrl.searchParams.set("v", "receipt-2");
  const receiptHtml = `
    <div class="receipt">
    <img class="receipt-logo" src="${receiptLogoUrl.href}" alt="Mustang horse">
    <h2>Mustang Cafe</h2>
    <p class="${isUnpaid ? "unpaid" : "paid"}">${documentTitle}</p>
    <p>${branch().nameTh}</p>
    <p>${order.orderNo} / Queue ${order.queueToken}</p>
    ${customerLabel(order) ? `<p>Customer: ${escapeHtml(customerLabel(order))}</p>` : ""}
    <p>${dateFmt.format(new Date(order.createdAt))}</p>
    <p class="${isUnpaid ? "unpaid" : "paid"}">${paymentStatus}</p>
    <div class="line"></div>
    ${order.items
      .map((line) => {
        const options = optionSummary(line);
        return `<div class="row"><span>${line.qty} x ${escapeHtml(lineDisplayName(line))}${options ? `<small>${escapeHtml(options)}</small>` : ""}</span><strong>${fmt.format(linePrice(line))}</strong></div>`;
      })
      .join("")}
    <div class="line"></div>
    <div class="row"><span>Subtotal</span><strong>${fmt.format(order.subtotal)}</strong></div>
    <div class="row"><span>Discount</span><strong>${fmt.format(order.discount)}</strong></div>
    <div class="row"><span>Total</span><strong>${fmt.format(order.total)}</strong></div>
    <div class="row"><span>Payment</span><strong>${paymentName(order.paymentMethod)}</strong></div>
    ${isUnpaid ? `<p class="unpaid">ยอดนี้ยังไม่ได้รับชำระ</p>` : ""}
    <div class="line"></div>
    <p>ขอบคุณค่ะ / Thank you</p>
    <div class="receipt-feed" aria-hidden="true">&nbsp;<br>&nbsp;<br>&nbsp;<br>&nbsp;<br>&nbsp;<br>&nbsp;<br>&nbsp;<br>&nbsp;</div>
    </div>
  `;
  const frame = document.createElement("iframe");
  frame.title = "receipt-print";
  frame.style.position = "fixed";
  frame.style.right = "0";
  frame.style.bottom = "0";
  frame.style.width = "1px";
  frame.style.height = "1px";
  frame.style.border = "0";
  frame.style.opacity = "0";
  document.body.appendChild(frame);

  const doc = frame.contentDocument || frame.contentWindow.document;
  doc.open();
  doc.write(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${order.orderNo}</title>
        <style>
          @page { size: 57mm auto; margin: 0; }
          * { box-sizing: border-box; }
          html, body {
            width: 57mm;
            min-width: 57mm;
            margin: 0;
            padding: 0;
            background: #fff;
            color: #000;
          }
          .receipt {
            width: 48mm;
            margin: 0;
            padding: 0 1.5mm 2mm;
            color: #000;
            background: #fff;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            font-size: 13px;
            font-weight: 450;
            line-height: 1.22;
            page-break-after: avoid;
            break-after: avoid;
          }
          .receipt-logo {
            display: block;
            width: 17mm;
            height: 17mm;
            margin: 0 auto 0.2mm;
            fill: none;
            stroke: #000;
            stroke-width: 4;
            stroke-linecap: round;
            stroke-linejoin: round;
          }
          h2 { font-size: 15px; line-height: 1.1; }
          h2, p {
            text-align: center;
            margin: 0 0 0.7mm;
          }
          .paid,
          .unpaid {
            border: 1px solid #000;
            padding: 0.8mm;
            font-weight: 800;
            text-transform: uppercase;
          }
          .unpaid {
            font-size: 14px;
          }
          .line {
            border-top: 1px dashed #000;
            margin: 1mm 0;
          }
          .row {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 1.4mm;
            margin-bottom: 0.6mm;
          }
          .row span {
            flex: 1;
            min-width: 0;
            overflow-wrap: anywhere;
          }
          .row small {
            display: block;
            margin-top: 0.4mm;
            font-size: 11px;
            line-height: 1.18;
          }
          .row strong {
            flex: 0 0 auto;
            white-space: nowrap;
            font-weight: 650;
          }
          .receipt-feed {
            display: block;
            height: auto;
            font-size: 13px;
            line-height: 5mm;
            margin: 0;
            padding: 0;
          }
        </style>
      </head>
      <body>${receiptHtml}</body>
    </html>
  `);
  doc.close();

  let cleaned = false;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    frame.remove();
  };
  frame.contentWindow.addEventListener("afterprint", cleanup, { once: true });
  const waitForReceiptImages = () => {
    const images = [...doc.images];
    return Promise.all(
      images.map((image) => {
        if (image.complete && image.naturalWidth > 0) return Promise.resolve();
        if (image.decode) return image.decode().catch(() => {});
        return new Promise((resolve) => {
          image.addEventListener("load", resolve, { once: true });
          image.addEventListener("error", resolve, { once: true });
        });
      }),
    );
  };

  window.setTimeout(async () => {
    await waitForReceiptImages();
    frame.contentWindow.focus();
    frame.contentWindow.print();
    window.setTimeout(cleanup, 30000);
  }, 250);
}

function notifyKitchen() {
  $("ding")
    .play()
    .catch(() => {});
}

function exportCsv() {
  const rows = [
    ["time", "order_no", "queue", "customer_name", "items", "payment", "subtotal", "discount", "total", "status"],
  ];
  state.orders
    .filter((order) => order.branchId === state.activeBranchId)
    .forEach((order) => {
      rows.push([
        order.createdAt,
        order.orderNo,
        order.queueToken,
        customerLabel(order),
        order.items
          .map((line) => {
            return `${line.qty}x [${lineCategoryName(line)}] ${lineDisplayName(line)}`;
          })
          .join("; "),
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
  const item = state.menu.find(
    (menuItem) => menuItem.id === menuTarget.dataset.menuId || menuItem.sku === menuTarget.dataset.sku,
  );
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

document.addEventListener("click", async (event) => {
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
    const recentlyHandled =
      lastMenuActivation.id.startsWith(`${menuTarget.dataset.menuId}:`) && Date.now() - lastMenuActivation.at < 450;
    if (!recentlyHandled) activateMenuCard(menuTarget);
    return;
  }
  const target = event.target.closest("button, input");
  if (!target) return;
  if (target.dataset.menuCost) {
    if (!requireSuperuser()) return;
    openMenuCostModal(target.dataset.menuCost);
    return;
  }
  if (target.hasAttribute("data-close-cost-modal")) {
    closeMenuCostModal();
    return;
  }
  if (target.id === "openCostMaster") {
    openCostMasterModal();
    return;
  }
  if (target.hasAttribute("data-close-cost-master")) {
    closeCostMasterModal();
    return;
  }
  if (target.id === "addCostIngredient") {
    syncCostDraftFromModal();
    if (!Array.isArray(menuCostDraft[costingVariantId])) menuCostDraft[costingVariantId] = [];
    menuCostDraft[costingVariantId].push({ id: crypto.randomUUID(), ingredient: "", cost: 0 });
    renderMenuCostModal();
    $("costIngredientRows")
      ?.querySelector("[data-cost-ingredient-row]:last-child [data-cost-ingredient-name]")
      ?.focus();
    return;
  }
  if (target.dataset.removeCostIngredient !== undefined) {
    syncCostDraftFromModal();
    menuCostDraft[costingVariantId]?.splice(Number(target.dataset.removeCostIngredient), 1);
    renderMenuCostModal();
    return;
  }
  if (target.id === "saveMenuCost") {
    if (!requireSuperuser()) return;
    const item = state.menu.find((menuItem) => menuItem.id === costingMenuId);
    if (!item) return toast("ไม่พบเมนูที่ต้องการบันทึกต้นทุน");
    syncCostDraftFromModal();
    const costing = structuredClone(menuCostDraft);
    target.disabled = true;
    target.textContent = "กำลังบันทึก...";
    try {
      await saveMenuItemToLatestState(item.id, { ...item, costing });
      closeMenuCostModal();
      render();
      toast(`บันทึกต้นทุน ${item.th} แล้ว`);
    } catch {
      target.disabled = false;
      target.textContent = "บันทึกต้นทุนเมนู";
      toast("บันทึกต้นทุนไม่สำเร็จ กรุณาลองอีกครั้ง");
    }
    return;
  }
  if (target.id === "loginButton") {
    const username = $("loginUsername").value.trim().toLowerCase();
    const password = $("loginPassword").value;
    const user = state.users.find(
      (item) => item.active && item.username.toLowerCase() === username && item.password === password,
    );
    if (!user) return toast("Username หรือ password ไม่ถูกต้อง");
    localStorage.setItem(AUTH_KEY, user.id);
    state.activeUserId = user.id;
    $("loginPassword").value = "";
    render();
    showView(isAdminRoute() ? "admin" : currentRole().views[0], false);
    return;
  }
  if (target.id === "logoutButton") {
    localStorage.removeItem(AUTH_KEY);
    updateAuthShell();
    return;
  }
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
  if (target.id === "invoiceStaffOrder") createOrder("staff", true);
  if (target.id === "submitCustomerOrder") createOrder("customer");
  if (target.dataset.closeCustomerSummary) hideCustomerOrderSummary();
  if (target.dataset.confirmPayment) confirmPayment(target.dataset.confirmPayment);
  if (target.dataset.cancelOrder) {
    const order = state.orders.find((item) => item.id === target.dataset.cancelOrder);
    if (!order) return toast("ไม่พบออเดอร์ที่ต้องการยกเลิก");
    if (!["pending_payment", "in_kitchen"].includes(order.status)) {
      return toast("ออเดอร์รอรับอาหารหรือปิดแล้ว ไม่สามารถยกเลิกได้");
    }
    if (!window.confirm(`ยืนยันยกเลิกออเดอร์ ${order.orderNo} / คิว ${order.queueToken}?`)) return;
    order.status = "cancelled";
    order.cancelledAt = new Date().toISOString();
    touchOrder(order);
    await saveState();
    await broadcastEvent("order_updated", {
      orderId: order.id,
      branchId: order.branchId,
      status: order.status,
      queueToken: order.queueToken,
    });
    render();
  }
  if (target.dataset.itemDone) {
    const order = state.orders.find((item) => item.id === target.dataset.itemDone);
    order.items[Number(target.dataset.index)].done = target.checked;
    touchOrder(order);
    await saveState();
    await broadcastEvent("order_updated", {
      orderId: order.id,
      branchId: order.branchId,
      status: order.status,
      queueToken: order.queueToken,
    });
    renderKitchen();
  }
  if (target.dataset.orderReady) {
    const order = state.orders.find((item) => item.id === target.dataset.orderReady);
    if (!order.items.every((item) => item.done)) return toast("กรุณาติ๊กว่าทำครบทุกเมนูก่อน");
    order.status = "ready";
    order.readyAt = new Date().toISOString();
    touchOrder(order);
    await saveState();
    await broadcastEvent("order_updated", {
      orderId: order.id,
      branchId: order.branchId,
      status: order.status,
      queueToken: order.queueToken,
    });
    render();
  }
  if (target.dataset.pickedUp) {
    const order = state.orders.find((item) => item.id === target.dataset.pickedUp);
    if (!isOrderPaid(order)) return toast("ออเดอร์นี้ยังไม่ชำระ กรุณากดรับเงินแล้วก่อนคืน token");
    order.status = "picked_up";
    order.pickedUpAt = new Date().toISOString();
    touchOrder(order);
    await saveState();
    await broadcastEvent("order_updated", {
      orderId: order.id,
      branchId: order.branchId,
      status: order.status,
      queueToken: order.queueToken,
    });
    render();
  }
  if (target.dataset.print) printReceipt(target.dataset.print);
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
    saveState({ allowCatalogWrite: true });
    render();
  }
  if (target.dataset.deleteMenu) {
    if (!requireSuperuser()) return;
    const menuId = target.dataset.deleteMenu;
    const inOrder = state.orders.some((order) => order.items.some((line) => line.menuId === menuId));
    const item = state.menu.find((menuItem) => menuItem.id === menuId);
    if (!item) return toast("ไม่พบเมนูนี้");
    if (inOrder) {
      item.archived = true;
      item.available = false;
    } else {
      state.menu = state.menu.filter((menuItem) => menuItem.id !== menuId);
    }
    state.masterTemplate.menuIds = state.masterTemplate.menuIds.filter((id) => id !== target.dataset.deleteMenu);
    if (editingMenuId === target.dataset.deleteMenu) {
      editingMenuId = "";
      uploadedMenuImageDataUrl = "";
      menuFormPriceMode = "";
    }
    await saveState({ allowCatalogWrite: true });
    render();
    toast(inOrder ? "ลบออกจากรายการเมนูแล้ว ประวัติออเดอร์เดิมยังเก็บไว้" : "ลบเมนูแล้ว");
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
    state.branches.push({
      id,
      nameTh,
      nameEn,
      tokens,
      qrLabel: `บัญชี ${nameTh}`,
      templateMode: "linked",
      templateVersion: state.masterTemplate.version,
    });
    state.activeBranchId = id;
    saveState();
    render();
    toast("เพิ่มสาขาแล้ว");
  }
  if (target.id === "addMenu") {
    if (!requireSuperuser()) return;
    const form = readMenuForm();
    if (!form) return;
    const id = nextMenuId(form);
    const menuItem = { id, ...form };
    state.menu.push(menuItem);
    if (!state.masterTemplate.menuIds.includes(id)) state.masterTemplate.menuIds.push(id);
    selectedCategory = form.categoryId;
    selectedCustomerCategory = form.categoryId;
    uploadedMenuImageDataUrl = "";
    menuFormPriceMode = "";
    saveState({ allowCatalogWrite: true });
    render();
    toast(`เพิ่มเมนู ${form.th} แล้ว`);
  }
  if (target.id === "addVariantRow") {
    const rows = $("variantRows");
    const index = rows.querySelectorAll("[data-price-variant-row]").length + 1;
    rows.insertAdjacentHTML(
      "beforeend",
      `
      <div class="variant-row" data-price-variant-row data-variant-id="custom-${Date.now()}">
        <input data-variant-th placeholder="แบบที่ ${index}">
        <input data-variant-en placeholder="Variant ${index}">
        <input data-variant-price type="number" min="0" inputmode="decimal" placeholder="79">
        <label><input data-variant-active type="checkbox" checked></label>
      </div>
    `,
    );
  }
  if (target.dataset.priceMode) {
    menuFormPriceMode = target.dataset.priceMode;
    $("priceMode").value = target.dataset.priceMode;
    document
      .querySelectorAll("[data-price-mode]")
      .forEach((button) => button.classList.toggle("active", button === target));
    $("variantEditor")?.classList.toggle("hidden", target.dataset.priceMode !== "variants");
  }
  if (target.id === "addCategory") {
    if (!requireSuperuser()) return;
    const form = readCategoryForm();
    if (!form) return;
    state.categories.push(form);
    selectedCategory = form.id;
    selectedCustomerCategory = form.id;
    saveState({ allowCatalogWrite: true });
    render();
    toast(`เพิ่มหมวดหมู่ ${form.th} แล้ว`);
  }
  if (target.dataset.editCategory) {
    if (!requireSuperuser()) return;
    editingCategoryId = target.dataset.editCategory;
    categoryToolsOpen = true;
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
    saveState({ allowCatalogWrite: true });
    render();
    toast(`บันทึกหมวดหมู่ ${form.th} แล้ว`);
  }
  if (target.dataset.deleteCategory) {
    if (!requireSuperuser()) return;
    const id = target.dataset.deleteCategory;
    if (state.categories.length <= 1) return toast("ต้องมีหมวดหมู่อย่างน้อย 1 หมวด");
    const fallbackCategory = state.categories
      .filter((cat) => cat.id !== id)
      .sort((a, b) => (a.sort || 0) - (b.sort || 0))[0];
    if (!fallbackCategory) return toast("ต้องมีหมวดหมู่อื่นสำหรับย้ายเมนูก่อน");
    const movedCount = state.menu.filter((item) => isCatalogMenu(item) && item.categoryId === id).length;
    state.menu.forEach((item) => {
      if (isCatalogMenu(item) && item.categoryId === id) item.categoryId = fallbackCategory.id;
    });
    state.categories = state.categories.filter((cat) => cat.id !== id);
    if (selectedCategory === id) selectedCategory = fallbackCategory.id;
    if (selectedCustomerCategory === id) selectedCustomerCategory = fallbackCategory.id;
    if (editingCategoryId === id) editingCategoryId = "";
    saveState({ allowCatalogWrite: true });
    render();
    toast(movedCount ? `ลบหมวดหมู่แล้ว และย้าย ${movedCount} เมนูไป ${fallbackCategory.th}` : "ลบหมวดหมู่แล้ว");
  }
  if (target.dataset.editMenu) {
    if (!requireSuperuser()) return;
    editingMenuId = target.dataset.editMenu;
    uploadedMenuImageDataUrl = "";
    const item = state.menu.find((menuItem) => menuItem.id === editingMenuId);
    menuFormPriceMode = item && hasRealVariants(item) ? "variants" : "single";
    renderMenuManagement();
    document.querySelector("#menus").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  if (target.id === "cancelMenuEdit" || target.id === "startNewMenu") {
    editingMenuId = "";
    uploadedMenuImageDataUrl = "";
    menuFormPriceMode = "";
    renderMenuManagement();
  }
  if (target.id === "saveMenuEdit") {
    if (!requireSuperuser()) return;
    const existing = state.menu.find((item) => item.id === editingMenuId);
    if (!existing) return toast("ไม่พบเมนูที่จะแก้ไข");
    const form = readMenuForm(existing.id);
    if (!form) return;
    const updatedMenu = normalizeMenuItem({ ...existing, ...form, available: existing.available });
    Object.assign(existing, updatedMenu);
    selectedCategory = form.categoryId;
    selectedCustomerCategory = form.categoryId;
    uploadedMenuImageDataUrl = "";
    menuFormPriceMode = form.variants.length > 1 || form.variants[0]?.id !== "default" ? "variants" : "single";
    target.disabled = true;
    target.textContent = "กำลังบันทึก...";
    try {
      await saveMenuItemToLatestState(existing.id, updatedMenu);
      editingMenuId = existing.id;
      render();
      toast(`บันทึกเมนู ${form.th} แล้ว`);
    } catch {
      target.disabled = false;
      target.textContent = "บันทึกการแก้ไข";
      toast("บันทึกไม่สำเร็จ กรุณาลองอีกครั้ง");
    }
  }
  if (target.id === "saveBranchSettings") {
    if (!requireSuperuser()) return;
    const tokens = tokensFromText($("branchTokenList").value);
    if (!tokens.length) return toast("ต้องมี token อย่างน้อย 1 หมายเลข");
    if (
      branch().tokens.some(
        (token) => tokenStatus(token) !== "available" && !tokens.some((next) => next.label === token.label),
      )
    ) {
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
    state.masterTemplate.menuIds = state.menu.filter((item) => isCatalogMenu(item) && item.available).map((item) => item.id);
    state.branches
      .filter((item) => item.templateMode === "linked")
      .forEach((item) => {
        item.templateVersion = state.masterTemplate.version;
      });
    saveState({ allowCatalogWrite: true });
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
  if (target.id === "exportMenuJson") {
    if (!requireSuperuser()) return;
    exportMenuJson();
    toast("ส่งออกไฟล์เมนูแล้ว");
  }
  if (target.id === "importMenuJsonButton") {
    if (!requireSuperuser()) return;
    $("importMenuJsonFile")?.click();
  }
  if (target.id === "addUser") {
    if (!requireSuperuser()) return;
    const name = $("newUserName").value.trim();
    const username = $("newUserUsername").value.trim();
    const password = $("newUserPassword").value.trim() || "mustang666";
    if (!name) return toast("กรุณาใส่ชื่อผู้ใช้");
    if (!username) return toast("กรุณาใส่ username");
    if (state.users.some((item) => item.username.toLowerCase() === username.toLowerCase()))
      return toast("Username นี้มีอยู่แล้ว");
    state.users.push({
      id: `u-${Date.now()}`,
      name,
      username,
      password,
      role: $("newUserRole").value,
      branchIds: [$("newUserBranch").value],
      active: true,
    });
    saveState();
    render();
    toast("เพิ่ม user แล้ว");
  }
  if (target.dataset.openPassword) {
    const panel = document.querySelector(`[data-password-panel="${target.dataset.openPassword}"]`);
    panel?.classList.toggle("hidden");
    panel?.querySelector("input")?.focus();
  }
  if (target.dataset.deleteUser) {
    if (!requireSuperuser()) return;
    if (target.dataset.deleteUser === state.activeUserId) return toast("ไม่สามารถลบ user ที่กำลังใช้งาน");
    state.users = state.users.filter((item) => item.id !== target.dataset.deleteUser);
    saveState();
    render();
    toast("ลบ user แล้ว");
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
  if (event.key === "Escape" && !$("menuCostModal")?.classList.contains("hidden")) {
    closeMenuCostModal();
    return;
  }
  if (event.key === "Escape" && !$("costMasterModal")?.classList.contains("hidden")) {
    closeCostMasterModal();
    return;
  }
  if (event.key === "Enter" && event.target.closest("#loginScreen")) {
    event.preventDefault();
    $("loginButton")?.click();
    return;
  }
  if (!["Enter", " "].includes(event.key)) return;
  const menuTarget = event.target.closest("[data-menu-id]");
  if (!menuTarget) return;
  event.preventDefault();
  activateMenuCard(menuTarget);
});

document.addEventListener("change", async (event) => {
  const target = event.target;
  if (target.id === "costVariantSelect") {
    syncCostDraftFromModal();
    costingVariantId = target.value;
    renderMenuCostModal();
    return;
  }
  if (target.id === "newMenuCategory") {
    syncMenuOptionControlsForCategory(target.value);
  }
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
      $("newMenuImagePreview").innerHTML =
        `<img src="${uploadedMenuImageDataUrl}" alt="preview"><span>${file.name}</span>`;
    };
    reader.readAsDataURL(file);
  }
  if (target.id === "importMenuJsonFile") {
    if (!requireSuperuser()) return;
    importMenuJsonFile(target.files?.[0]);
    target.value = "";
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
  if (target.dataset.userField) {
    if (!requireSuperuser()) return;
    const user = state.users.find((item) => item.id === target.dataset.userId);
    if (!user) return;
    const value = target.value.trim();
    if (target.dataset.userField === "password" && !value) {
      return;
    }
    user[target.dataset.userField] = value;
    saveState();
    render();
    toast("บันทึกข้อมูล user แล้ว");
  }
  if (target.dataset.orderMenuCategory) {
    const filterKey = `${target.dataset.orderMenuCategory}:${target.dataset.lineIndex}`;
    reportMenuCategoryFilters.set(filterKey, target.value);
    renderReports();
  }
  if (target.dataset.orderMenu) {
    if (!target.value) return;
    const order = state.orders.find((item) => item.id === target.dataset.orderMenu);
    const line = order?.items[Number(target.dataset.lineIndex)];
    if (!order || !line) return toast("ไม่พบรายการออเดอร์ที่ต้องการแก้ไข");
    const menu = state.menu.find((item) => item.id === target.value && isCatalogMenu(item));
    if (!menu) return toast("ไม่พบเมนูที่เลือก");
    line.menuId = menu.id;
    line.sku = menu.sku;
    line.nameTh = menu.th;
    line.nameEn = menu.en;
    line.categoryId = menu.categoryId;
    touchOrder(order);
    await saveState();
    await broadcastEvent("order_updated", {
      orderId: order.id,
      branchId: order.branchId,
      status: order.status,
      queueToken: order.queueToken,
    });
    renderReports();
    toast(`เชื่อมรายการออเดอร์กับเมนู ${menu.th || menu.en} แล้ว`);
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
    const next = {
      groupId: group.id,
      group: group.th,
      label: choice.th,
      price: choice.price || 0,
      required: group.required,
    };
    const optionIndex = line.options.findIndex((option) => option.groupId === group.id);
    if (optionIndex >= 0) line.options[optionIndex] = next;
    else line.options.push(next);
    saveDraftCarts();
    renderCarts();
  }
});

document.addEventListener("input", (event) => {
  if (event.target.matches("[data-cost-ingredient-name], [data-cost-ingredient-price]")) {
    updateCostModalTotal();
  }
});

document.addEventListener(
  "toggle",
  (event) => {
    if (event.target.id === "categoryToolsDetails") {
      categoryToolsOpen = event.target.open;
    }
  },
  true,
);

["paymentAmount", "promotionSelect", "menuSearch"].forEach((id) => {
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
  setSyncStatus(SERVER_SYNC && realtimeConnected ? "Realtime" : "Online");
  fetchServerState({ notify: true, force: true });
});

window.addEventListener("offline", () => {
  realtimeConnected = false;
  setSyncStatus("Offline ready", false);
});

window.addEventListener("storage", (event) => {
  if (event.key === STORAGE_KEY) {
    syncStateFromStorage({ notify: true });
  }
  if (event.key === EVENT_KEY && event.newValue) {
    handleRealtimeEvent(JSON.parse(event.newValue)).catch(() => {});
  }
});

realtimeChannel?.addEventListener("message", (event) => {
  handleRealtimeEvent(event.data).catch(() => {});
});

if (SERVER_SYNC && "EventSource" in window) {
  const events = new EventSource("/api/events");
  events.onopen = () => {
    realtimeConnected = true;
    markServerOnline();
  };
  events.onmessage = (message) => {
    try {
      handleRealtimeEvent(JSON.parse(message.data)).catch(() => {});
    } catch {
      // Ignore malformed realtime messages.
    }
  };
  events.onerror = () => {
    realtimeConnected = false;
    if (Date.now() - lastServerFetchAt < 5000) setSyncStatus("Online");
    else setSyncStatus("Connecting");
  };
}

window.setInterval(() => {
  if (SERVER_SYNC) {
    const pollInterval = realtimeConnected ? 15000 : 1200;
    if (Date.now() - lastPollingFetchAt < pollInterval) return;
    lastPollingFetchAt = Date.now();
    fetchServerState({ notify: true, operationalOnly: true });
  } else syncStateFromStorage({ notify: true });
}, 1200);

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

const today = todayKey();
$("reportStart").value = today;
$("reportEnd").value = today;
setSyncStatus(navigator.onLine ? "Online" : "Offline ready", navigator.onLine);
render();
const initialMode = routeMode();
const initialView =
  initialMode === "pos"
    ? "pos"
    : initialMode === "customer"
      ? "customer"
      : isAdminRoute()
        ? "admin"
        : location.hash.replace("#", "") || currentRole().views[0] || "pos";
if (updateAuthShell()) showView(initialView, false);
fetchServerState({ notify: false });
