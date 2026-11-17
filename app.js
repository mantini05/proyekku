/**
 * SawitScale Pro — Aplikasi Timbangan TBS Kelapa Sawit Mobile
 * Offline-First PWA for Android & Desktop
 */

const STORAGE_KEY = "SAWITSCALE_PRO_DB_V1";
const SESSION_KEY = "SAWITSCALE_PRO_SESSION_V1";
const SYNC_CFG_KEY = "SAWITSCALE_PRO_SYNC_CFG_V1";

const DEFAULT_USERS = [
  {
    id: "USR-01",
    username: "superadmin",
    password: "123456",
    fullName: "H. Darmawan",
    role: "superadmin",
    active: true,
  },
  {
    id: "USR-02",
    username: "admin",
    password: "123456",
    fullName: "Rina Wulandari",
    role: "admin",
    active: true,
  },
  {
    id: "USR-03",
    username: "kasir",
    password: "123456",
    fullName: "Budi Santoso",
    role: "kasir",
    active: true,
  },
];

const cleanCashierName = (name) =>
  String(name || "Kasir")
    .replace(/\s*\([^)]*\)/g, "")
    .trim() || "Kasir";

// Helper formatters for Indonesian locale
const fmtNum = (n) =>
  new Intl.NumberFormat("id-ID").format(Math.round(Number(n) || 0));
const fmtRp = (n) => "Rp " + fmtNum(n);
const parseNum = (val) => {
  if (typeof val === "number") return val;
  if (!val) return 0;
  const cleaned = String(val)
    .replace(/[^0-9,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const num = parseFloat(cleaned);
  return Number.isFinite(num) ? num : 0;
};

const todayISO = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const daysAgoISO = (days) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const fmtDateTimeID = (isoString) => {
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return isoString;
  }
};

const fmtDateOnlyID = (isoString) => {
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(d);
  } catch {
    return isoString;
  }
};

const fmtTimeOnlyID = (isoString) => {
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(d);
  } catch {
    return "";
  }
};

// Default Sample Database for RAM Sawit
function createInitialDatabase() {
  const t0 = todayISO();
  const t1 = daysAgoISO(1);
  const t2 = daysAgoISO(2);

  return {
    settings: {
      ramName: "RAM SAWIT MAKMUR JAYA",
      cashierName: "Budi Santoso",
      address: "Jl. Lintas Sumatera KM 42, Simpang Sawit",
      phone: "0812-7890-4455",
      defaultBuyPrice: 2650,
      defaultCutPercent: 4,
      defaultUnloadingRate: 15,
      paperWidth: "58mm",
      showScalePanel: false,
    },
    farmers: [
      {
        id: "F-01",
        name: "H. Syamsul Bahri",
        phone: "081265001122",
        defaultPlate: "BM 8421 QA",
        specialPrice: 2680,
        loanBalance: 1500000,
      },
      {
        id: "F-02",
        name: "KUD Sawit Sejahtera",
        phone: "081377889900",
        defaultPlate: "BM 9015 TP",
        specialPrice: 2700,
        loanBalance: 0,
      },
      {
        id: "F-03",
        name: "Pak Hendra Wijaya",
        phone: "085266112233",
        defaultPlate: "BM 8192 KC",
        specialPrice: 0,
        loanBalance: 750000,
      },
      {
        id: "F-04",
        name: "Ibu Hj. Rosmawati",
        phone: "08117504433",
        defaultPlate: "BM 8834 QD",
        specialPrice: 2660,
        loanBalance: 350000,
      },
      {
        id: "F-05",
        name: "Kelompok Tani Harapan",
        phone: "082170008899",
        defaultPlate: "BM 9540 TU",
        specialPrice: 2690,
        loanBalance: 2000000,
      },
    ],
    mills: [
      {
        id: "M-01",
        name: "PT. Agro Sawit Nusantara (PKS 1)",
        doPrefix: "DO-ASN/XI",
        price: 2940,
      },
      {
        id: "M-02",
        name: "PT. Perkebunan Inti Riau (PKS 2)",
        doPrefix: "DO-PIR/XI",
        price: 2960,
      },
      {
        id: "M-03",
        name: "PKS Mitra Sawit Mandiri",
        doPrefix: "DO-MSM/XI",
        price: 2910,
      },
    ],
    pendingTrucks: [
      {
        id: "PEND-01",
        ticketNo: "TBS-IN-ANTRE-01",
        farmerId: "F-03",
        farmerName: "Pak Hendra Wijaya",
        plate: "BM 8192 KC",
        driver: "Agus",
        bruto: 6480,
        cutPercent: 4,
        cutKg: 0,
        pricePerKg: 2650,
        unloadingRate: 15,
        timeIn: new Date(Date.now() - 25 * 60000).toISOString(),
      },
    ],
    purchases: [
      {
        id: "BUY-101",
        ticketNo: "TBS-IN-001",
        date: t2,
        timestamp: `${t2}T09:15:00`,
        farmerId: "F-01",
        farmerName: "H. Syamsul Bahri",
        plate: "BM 8421 QA",
        driver: "Wahyu",
        bruto: 7850,
        tara: 2350,
        netto1: 5500,
        cutPercent: 4,
        cutKg: 0,
        totalCutKg: 220,
        nettoClean: 5280,
        pricePerKg: 2680,
        grossTotal: 14150400,
        unloadingRate: 15,
        unloadingCost: 79200,
        loanDeduct: 500000,
        netPaid: 13571200,
        paymentMethod: "Tunai",
        notes: "Buah tenera super, brondolan 12%",
      },
      {
        id: "BUY-102",
        ticketNo: "TBS-IN-002",
        date: t2,
        timestamp: `${t2}T13:40:00`,
        farmerId: "F-02",
        farmerName: "KUD Sawit Sejahtera",
        plate: "BM 9015 TP",
        driver: "Surya",
        bruto: 11420,
        tara: 3420,
        netto1: 8000,
        cutPercent: 3.5,
        cutKg: 20,
        totalCutKg: 300,
        nettoClean: 7700,
        pricePerKg: 2700,
        grossTotal: 20790000,
        unloadingRate: 15,
        unloadingCost: 115500,
        loanDeduct: 0,
        netPaid: 20674500,
        paymentMethod: "Transfer",
        notes: "Colt Diesel penuh, buah matang merata",
      },
      {
        id: "BUY-103",
        ticketNo: "TBS-IN-003",
        date: t1,
        timestamp: `${t1}T10:20:00`,
        farmerId: "F-04",
        farmerName: "Ibu Hj. Rosmawati",
        plate: "BM 8834 QD",
        driver: "Dedi",
        bruto: 5620,
        tara: 1920,
        netto1: 3700,
        cutPercent: 4,
        cutKg: 12,
        totalCutKg: 160,
        nettoClean: 3540,
        pricePerKg: 2660,
        grossTotal: 9416400,
        unloadingRate: 15,
        unloadingCost: 53100,
        loanDeduct: 250000,
        netPaid: 9113300,
        paymentMethod: "Tunai",
        notes: "Pick up L300, potongan basah hujan",
      },
      {
        id: "BUY-104",
        ticketNo: "TBS-IN-004",
        date: t1,
        timestamp: `${t1}T15:05:00`,
        farmerId: "F-05",
        farmerName: "Kelompok Tani Harapan",
        plate: "BM 9540 TU",
        driver: "Anton",
        bruto: 12100,
        tara: 3600,
        netto1: 8500,
        cutPercent: 4,
        cutKg: 0,
        totalCutKg: 340,
        nettoClean: 8160,
        pricePerKg: 2690,
        grossTotal: 21950400,
        unloadingRate: 15,
        unloadingCost: 122400,
        loanDeduct: 500000,
        netPaid: 21328000,
        paymentMethod: "Transfer",
        notes: "Panen rotasi ke-2",
      },
      {
        id: "BUY-105",
        ticketNo: "TBS-IN-005",
        date: t0,
        timestamp: `${t0}T08:45:00`,
        farmerId: "F-03",
        farmerName: "Pak Hendra Wijaya",
        plate: "BM 8192 KC",
        driver: "Agus",
        bruto: 6890,
        tara: 2190,
        netto1: 4700,
        cutPercent: 4,
        cutKg: 0,
        totalCutKg: 188,
        nettoClean: 4512,
        pricePerKg: 2650,
        grossTotal: 11956800,
        unloadingRate: 15,
        unloadingCost: 67680,
        loanDeduct: 250000,
        netPaid: 11639120,
        paymentMethod: "Tunai",
        notes: "Pengiriman pagi",
      },
    ],
    sales: [
      {
        id: "SELL-201",
        ticketNo: "TBS-OUT-001",
        date: t2,
        timestamp: `${t2}T17:10:00`,
        millId: "M-01",
        millName: "PT. Agro Sawit Nusantara (PKS 1)",
        doNumber: "DO-ASN/XI/088",
        plate: "BM 9912 QU",
        driver: "Rudi Hartono",
        bruto: 17450,
        tara: 4250,
        netto1: 13200,
        cutPercent: 3.2,
        cutKg: 0,
        totalCutKg: 422,
        nettoClean: 12778,
        pricePerKg: 2940,
        grossTotal: 37567320,
        freightCost: 750000,
        loadingCost: 220000,
        netReceived: 36597320,
        saleStatus: "Lunas",
        notes: "Tronton pengiriman sore",
      },
      {
        id: "SELL-202",
        ticketNo: "TBS-OUT-002",
        date: t1,
        timestamp: `${t1}T16:40:00`,
        millId: "M-02",
        millName: "PT. Perkebunan Inti Riau (PKS 2)",
        doNumber: "DO-PIR/XI/104",
        plate: "BM 9401 TG",
        driver: "Bambang",
        bruto: 15980,
        tara: 3980,
        netto1: 12000,
        cutPercent: 3.5,
        cutKg: 0,
        totalCutKg: 420,
        nettoClean: 11580,
        pricePerKg: 2960,
        grossTotal: 34276800,
        freightCost: 700000,
        loadingCost: 200000,
        netReceived: 33376800,
        saleStatus: "Lunas",
        notes: "Pengiriman DO Kontrak",
      },
      {
        id: "SELL-203",
        ticketNo: "TBS-OUT-003",
        date: t0,
        timestamp: `${t0}T10:15:00`,
        millId: "M-01",
        millName: "PT. Agro Sawit Nusantara (PKS 1)",
        doNumber: "DO-ASN/XI/112",
        plate: "BM 9912 QU",
        driver: "Rudi Hartono",
        bruto: 8650,
        tara: 3850,
        netto1: 4800,
        cutPercent: 3.0,
        cutKg: 0,
        totalCutKg: 144,
        nettoClean: 4656,
        pricePerKg: 2940,
        grossTotal: 13688640,
        freightCost: 450000,
        loadingCost: 120000,
        netReceived: 13118640,
        saleStatus: "Piutang DO",
        notes: "Pengiriman kloter pertama hari ini",
      },
    ],
    users: DEFAULT_USERS.map((u) => ({ ...u })),
  };
}

let syncConfig = loadSyncConfig();
let syncState = {
  status: "checking", // "online" | "syncing" | "offline" | "checking"
  lanUrls: [],
  inFlight: false,
  debounceTimer: null,
};
let db = loadDatabase();
let currentUser = loadSession();
let currentScaleWeight = 0;
let currentReceiptText = "";
let currentReceiptPhone = "";

function isNativeAndroidApp() {
  return Boolean(
    window.AndroidBluetooth ||
    (window.location.protocol === "https:" &&
      window.location.hostname === "localhost"),
  );
}

function getDefaultSyncServerUrl() {
  if (isNativeAndroidApp()) {
    return "http://192.168.3.180:5173";
  }
  return "";
}

function normalizeServerUrl(rawUrl) {
  const trimmed = String(rawUrl || "")
    .trim()
    .replace(/\/+$/, "");
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  if (/^\d+\.\d+\.\d+\.\d+$/.test(trimmed)) {
    return `http://${trimmed}:5173`;
  }
  return `http://${trimmed}`;
}

function loadSyncConfig() {
  try {
    const raw = localStorage.getItem(SYNC_CFG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        return {
          serverUrl:
            typeof parsed.serverUrl === "string"
              ? parsed.serverUrl
              : getDefaultSyncServerUrl(),
          autoSync: parsed.autoSync !== false,
          lastSyncAt: parsed.lastSyncAt || null,
          lastRevision: Number(parsed.lastRevision) || 0,
          deletedIds:
            parsed.deletedIds && typeof parsed.deletedIds === "object"
              ? parsed.deletedIds
              : {},
        };
      }
    }
  } catch {
    // Ignore storage read error
  }
  return {
    serverUrl: getDefaultSyncServerUrl(),
    autoSync: true,
    lastSyncAt: null,
    lastRevision: 0,
    deletedIds: {},
  };
}

function saveSyncConfig() {
  try {
    localStorage.setItem(SYNC_CFG_KEY, JSON.stringify(syncConfig));
  } catch {
    // Ignore storage write error
  }
}

function markDeletedId(id) {
  if (!id) return;
  if (!syncConfig.deletedIds || typeof syncConfig.deletedIds !== "object") {
    syncConfig.deletedIds = {};
  }
  syncConfig.deletedIds[id] = Date.now();
  saveSyncConfig();
}

function loadDatabase() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (
        parsed &&
        parsed.settings &&
        Array.isArray(parsed.purchases) &&
        Array.isArray(parsed.sales)
      ) {
        if (!Array.isArray(parsed.users) || parsed.users.length === 0) {
          parsed.users = DEFAULT_USERS.map((u) => ({ ...u }));
        } else {
          parsed.users = parsed.users.map((u) => ({
            ...u,
            fullName: cleanCashierName(u.fullName),
            active: u.active !== false,
          }));
        }
        if (parsed.settings.cashierName) {
          parsed.settings.cashierName = cleanCashierName(
            parsed.settings.cashierName,
          );
        }
        parsed.purchases = parsed.purchases.map((p) =>
          p.cashierName
            ? { ...p, cashierName: cleanCashierName(p.cashierName) }
            : p,
        );
        parsed.sales = parsed.sales.map((s) =>
          s.cashierName
            ? { ...s, cashierName: cleanCashierName(s.cashierName) }
            : s,
        );
        saveDatabase(parsed);
        return parsed;
      }
    }
  } catch (err) {
    console.error("Failed loading local DB:", err);
  }
  const initial = createInitialDatabase();
  saveDatabase(initial);
  return initial;
}

function saveDatabase(data = db, options = {}) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error("Failed saving local DB:", err);
  }
  pushBtSyncSnapshotToNative(data);
  if (!options?.fromSync && !options?.skipSync && syncConfig?.autoSync) {
    scheduleAutoSync();
  }
}

function pushBtSyncSnapshotToNative(data = db) {
  try {
    if (
      window.AndroidBluetooth &&
      typeof window.AndroidBluetooth.updateBtSyncSnapshot === "function"
    ) {
      const snap = JSON.stringify({
        deletedIds: syncConfig?.deletedIds || {},
        data,
      });
      window.AndroidBluetooth.updateBtSyncSnapshot(snap);
    }
  } catch {
    // Ignore native bridge error
  }
}

function scheduleAutoSync() {
  if (syncState.debounceTimer) {
    clearTimeout(syncState.debounceTimer);
  }
  syncState.debounceTimer = setTimeout(() => {
    syncWithServer("merge", { silent: true });
  }, 350);
}

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.username && parsed.role) {
      const match = (db.users || []).find(
        (u) =>
          u.username.toLowerCase() === String(parsed.username).toLowerCase(),
      );
      if (match && match.active !== false) {
        return {
          id: match.id,
          username: match.username,
          fullName: match.fullName,
          role: match.role,
        };
      }
    }
  } catch {
    // Ignore invalid session
  }
  return null;
}

function saveSession(user) {
  try {
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

function showToast(message) {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3500);
}

// ============================================================================
// 0. AUTHENTICATION & ROLE-BASED ACCESS CONTROL (SUPERADMIN / ADMIN / KASIR)
// ============================================================================
function roleBadgeClass(role) {
  if (role === "superadmin") return "role-pill role-superadmin";
  if (role === "admin") return "role-pill role-admin";
  return "role-pill role-kasir";
}

function roleLabelText(role) {
  if (role === "superadmin") return "Superadmin";
  if (role === "admin") return "Admin";
  return "Kasir";
}

function applyAuthState() {
  const authScreen = document.getElementById("auth-screen");
  const appHeader = document.getElementById("app-header");
  const appMain = document.getElementById("app-main");
  const bottomNav = document.getElementById("bottom-nav");

  if (!currentUser) {
    if (authScreen) authScreen.hidden = false;
    if (appHeader) appHeader.hidden = true;
    if (appMain) appMain.hidden = true;
    if (bottomNav) bottomNav.hidden = true;
    return;
  }

  if (authScreen) authScreen.hidden = true;
  if (appHeader) appHeader.hidden = false;
  if (appMain) appMain.hidden = false;
  if (bottomNav) bottomNav.hidden = false;

  const roleEl = document.getElementById("header-user-role");
  const nameEl = document.getElementById("header-user-name");
  if (roleEl) {
    roleEl.className = roleBadgeClass(currentUser.role);
    roleEl.textContent = roleLabelText(currentUser.role);
  }
  if (nameEl) {
    nameEl.textContent = currentUser.fullName;
  }

  // Sync active cashier name on receipts with logged-in user
  db.settings.cashierName = currentUser.fullName;

  const isKasir = currentUser.role === "kasir";
  const isSuperadmin = currentUser.role === "superadmin";

  const quickSettingsBtn = document.getElementById("btn-quick-price");
  const navUsersBtn = document.getElementById("nav-item-users");
  const userShortcutCard = document.getElementById(
    "user-management-shortcut-card",
  );
  const clearAllBtn = document.getElementById("btn-clear-all-data");

  if (quickSettingsBtn) quickSettingsBtn.hidden = isKasir;
  if (navUsersBtn) navUsersBtn.hidden = !isSuperadmin;
  if (userShortcutCard) userShortcutCard.hidden = !isSuperadmin;
  if (clearAllBtn) clearAllBtn.hidden = !isSuperadmin;

  if (
    (isKasir && currentActiveTab === "view-setelan") ||
    (!isSuperadmin && currentActiveTab === "view-users")
  ) {
    switchTab("view-beli");
  }

  renderUsersList();
  renderPartnersView();
}

function openEditUserModal(user) {
  const dialog = document.getElementById("edit-user-dialog");
  if (!dialog) return;

  document.getElementById("edit-user-id").value = user.id;
  document.getElementById("edit-user-fullname").value = user.fullName || "";
  document.getElementById("edit-user-username").value = user.username || "";

  const roleRadio = dialog.querySelector(
    `input[name="editUserRole"][value="${user.role}"]`,
  );
  if (roleRadio) roleRadio.checked = true;

  const isActive = user.active !== false;
  const activeRadio = dialog.querySelector(
    `input[name="editUserActive"][value="${isActive ? "true" : "false"}"]`,
  );
  if (activeRadio) activeRadio.checked = true;

  dialog.showModal();
}

function openResetPasswordModal(user) {
  const dialog = document.getElementById("reset-password-dialog");
  if (!dialog) return;

  document.getElementById("reset-password-user-id").value = user.id;
  const label = document.getElementById("reset-password-target-label");
  if (label) {
    label.textContent = `Atur ulang password untuk akun: ${user.fullName} (@${user.username} — ${roleLabelText(user.role)})`;
  }
  const passInput = document.getElementById("reset-password-new");
  if (passInput) {
    passInput.value = "";
  }

  dialog.showModal();
}

function renderUsersList() {
  const container = document.getElementById("users-list-container");
  const countBadge = document.getElementById("users-count-badge");
  if (!container) return;

  const users = db.users || [];
  if (countBadge) {
    countBadge.textContent = `${users.length} User`;
  }

  container.innerHTML = "";
  users.forEach((u) => {
    const isActive = u.active !== false;
    const item = document.createElement("li");
    item.className = `user-list-item ${isActive ? "" : "user-card-inactive"}`;

    const info = document.createElement("div");
    info.className = "user-list-info";

    const top = document.createElement("div");
    top.className = "user-list-title-row";

    const title = document.createElement("strong");
    title.textContent = u.fullName;

    const roleBadge = document.createElement("span");
    roleBadge.className = roleBadgeClass(u.role);
    roleBadge.textContent = roleLabelText(u.role);

    const statusBadge = document.createElement("span");
    statusBadge.className = `badge ${isActive ? "badge-stable" : "badge-loan"}`;
    statusBadge.textContent = isActive ? "AKTIF" : "TIDAK AKTIF";

    top.append(title, roleBadge, statusBadge);

    const meta = document.createElement("div");
    meta.className = "text-muted user-list-meta";
    meta.textContent = `Username: ${u.username} • Password: ${u.password}`;

    info.append(top, meta);

    const actions = document.createElement("div");
    actions.className = "user-list-actions toolbar";

    // 1. Edit User Button
    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "btn btn-outline btn-sm";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => openEditUserModal(u));
    actions.appendChild(editBtn);

    // 2. Toggle Aktif / Tidak Aktif Button
    const toggleActiveBtn = document.createElement("button");
    toggleActiveBtn.type = "button";
    toggleActiveBtn.className = isActive
      ? "btn btn-ghost btn-sm"
      : "btn btn-secondary btn-sm";
    toggleActiveBtn.textContent = isActive ? "Nonaktifkan" : "Aktifkan";
    toggleActiveBtn.addEventListener("click", () => {
      if (
        isActive &&
        (u.username === "superadmin" || u.id === currentUser?.id)
      ) {
        showToast(
          "Akun Superadmin utama / yang sedang digunakan tidak dapat dinonaktifkan.",
        );
        return;
      }
      u.active = !isActive;
      u.updatedAt = Date.now();
      saveDatabase();
      renderUsersList();
      showToast(
        `Status akun "${u.username}" diubah menjadi ${u.active ? "AKTIF" : "TIDAK AKTIF"}.`,
      );
    });
    actions.appendChild(toggleActiveBtn);

    // 3. Reset Password Button
    const resetPassBtn = document.createElement("button");
    resetPassBtn.type = "button";
    resetPassBtn.className = "btn btn-outline btn-sm";
    resetPassBtn.textContent = "Reset Password";
    resetPassBtn.addEventListener("click", () => openResetPasswordModal(u));
    actions.appendChild(resetPassBtn);

    // 4. Delete User Button (for non-primary accounts)
    if (u.username !== "superadmin" && u.id !== currentUser?.id) {
      const delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "btn btn-danger-outline btn-sm";
      delBtn.textContent = "Hapus";
      delBtn.addEventListener("click", () => {
        markDeletedId(u.id);
        db.users = db.users.filter((item) => item.id !== u.id);
        saveDatabase();
        renderUsersList();
        showToast(`Akun "${u.username}" telah dihapus.`);
      });
      actions.appendChild(delBtn);
    }

    item.append(info, actions);
    container.appendChild(item);
  });
}

function initAuthAndUsers() {
  const loginForm = document.getElementById("form-login");
  const userInput = document.getElementById("login-username");
  const passInput = document.getElementById("login-password");
  const togglePassBtn = document.getElementById("btn-toggle-login-password");
  const errBanner = document.getElementById("login-error-banner");
  const logoutBtn = document.getElementById("btn-logout");

  const clearLoginError = () => {
    if (errBanner && !errBanner.hidden) {
      errBanner.hidden = true;
      errBanner.textContent = "";
    }
    if (userInput) userInput.removeAttribute("aria-invalid");
    if (passInput) passInput.removeAttribute("aria-invalid");
  };

  if (userInput) userInput.addEventListener("input", clearLoginError);
  if (passInput) passInput.addEventListener("input", clearLoginError);

  if (togglePassBtn && passInput) {
    togglePassBtn.addEventListener("click", () => {
      const isRevealed = togglePassBtn.getAttribute("aria-pressed") === "true";
      const nextState = !isRevealed;
      togglePassBtn.setAttribute("aria-pressed", String(nextState));
      togglePassBtn.textContent = nextState ? "Sembunyikan" : "Lihat Password";
      passInput.type = nextState ? "text" : "password";
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const username = (userInput?.value || "").trim().toLowerCase();
      const password = passInput?.value || "";

      if (!username || !password) {
        if (errBanner) {
          errBanner.textContent =
            "Masukkan username dan password terlebih dahulu.";
          errBanner.hidden = false;
        }
        if (!username && userInput) {
          userInput.setAttribute("aria-invalid", "true");
          userInput.focus();
        } else if (passInput) {
          passInput.setAttribute("aria-invalid", "true");
          passInput.focus();
        }
        return;
      }

      const matched = (db.users || []).find(
        (u) => u.username.toLowerCase() === username && u.password === password,
      );

      if (!matched) {
        if (errBanner) {
          errBanner.textContent =
            "Username atau password salah. Silakan coba lagi.";
          errBanner.hidden = false;
        }
        if (passInput) {
          passInput.setAttribute("aria-invalid", "true");
          passInput.focus();
        }
        return;
      }

      if (matched.active === false) {
        if (errBanner) {
          errBanner.textContent = `Akun "${matched.username}" sedang Tidak Aktif (dinonaktifkan oleh Superadmin).`;
          errBanner.hidden = false;
        }
        if (userInput) {
          userInput.setAttribute("aria-invalid", "true");
          userInput.focus();
        }
        return;
      }

      clearLoginError();
      currentUser = {
        id: matched.id,
        username: matched.username,
        fullName: matched.fullName,
        role: matched.role,
      };
      saveSession(currentUser);
      loginForm.reset();
      if (passInput) passInput.type = "password";
      if (togglePassBtn) {
        togglePassBtn.setAttribute("aria-pressed", "false");
        togglePassBtn.textContent = "Lihat Password";
      }
      applyAuthState();
      populateSettingsForm();
      showToast(
        `Selamat datang, ${currentUser.fullName} (${roleLabelText(currentUser.role)})!`,
      );
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      const prevName = currentUser?.fullName || "User";
      currentUser = null;
      saveSession(null);
      applyAuthState();
      showToast(`${prevName} telah keluar dari sesi.`);
      document.getElementById("login-username")?.focus();
    });
  }

  const gotoUsersBtn = document.getElementById("btn-goto-users-menu");
  if (gotoUsersBtn) {
    gotoUsersBtn.addEventListener("click", () => {
      switchTab("view-users");
    });
  }

  // Add New User Form
  const addUserForm = document.getElementById("form-add-user");
  if (addUserForm) {
    addUserForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!currentUser || currentUser.role !== "superadmin") {
        showToast("Hanya Superadmin yang dapat mengelola akun user.");
        return;
      }

      const fullName = document
        .getElementById("new-user-fullname")
        .value.trim();
      const username = document
        .getElementById("new-user-username")
        .value.trim()
        .toLowerCase();
      const password = document
        .getElementById("new-user-password")
        .value.trim();
      const roleRadio = addUserForm.querySelector(
        'input[name="userRole"]:checked',
      );
      const role = roleRadio ? roleRadio.value : "kasir";
      const activeRadio = addUserForm.querySelector(
        'input[name="userActive"]:checked',
      );
      const active = activeRadio ? activeRadio.value === "true" : true;

      if (!fullName || !username || !password) {
        showToast("Lengkapi Nama, Username, dan Password user.");
        return;
      }

      const existing = (db.users || []).find(
        (u) => u.username.toLowerCase() === username,
      );
      if (existing) {
        showToast(
          `Username "${username}" sudah terdaftar. Gunakan tombol Edit pada kartu user.`,
        );
        return;
      }

      db.users.push({
        id: "USR-" + Date.now(),
        username,
        password,
        fullName,
        role,
        active,
      });

      saveDatabase();
      renderUsersList();
      addUserForm.reset();
      showToast(
        `Akun baru "${username}" (${roleLabelText(role)}) berhasil ditambahkan!`,
      );
    });
  }

  // Edit User Dialog
  const editUserDialog = document.getElementById("edit-user-dialog");
  const editUserForm = document.getElementById("form-edit-user");
  const cancelEditUserBtn = document.getElementById("btn-cancel-edit-user");

  if (cancelEditUserBtn && editUserDialog) {
    cancelEditUserBtn.addEventListener("click", () =>
      editUserDialog.close("cancel"),
    );
  }

  if (editUserForm && editUserDialog) {
    editUserForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!currentUser || currentUser.role !== "superadmin") return;

      const userId = document.getElementById("edit-user-id").value;
      const fullName = document
        .getElementById("edit-user-fullname")
        .value.trim();
      const username = document
        .getElementById("edit-user-username")
        .value.trim()
        .toLowerCase();
      const roleRadio = editUserForm.querySelector(
        'input[name="editUserRole"]:checked',
      );
      const role = roleRadio ? roleRadio.value : "kasir";
      const activeRadio = editUserForm.querySelector(
        'input[name="editUserActive"]:checked',
      );
      let active = activeRadio ? activeRadio.value === "true" : true;

      const target = (db.users || []).find((u) => u.id === userId);
      if (!target || !fullName || !username) return;

      const duplicate = (db.users || []).find(
        (u) => u.id !== userId && u.username.toLowerCase() === username,
      );
      if (duplicate) {
        showToast(`Username "${username}" sudah dipakai oleh akun lain.`);
        return;
      }

      if (
        (target.username === "superadmin" || target.id === currentUser.id) &&
        !active
      ) {
        showToast(
          "Akun Superadmin utama / yang sedang digunakan harus tetap Aktif.",
        );
        active = true;
      }

      target.fullName = fullName;
      target.username = username;
      target.role = target.username === "superadmin" ? "superadmin" : role;
      target.active = active;

      if (currentUser.id === target.id) {
        currentUser.fullName = target.fullName;
        currentUser.username = target.username;
        currentUser.role = target.role;
        saveSession(currentUser);
      }

      saveDatabase();
      applyAuthState();
      editUserDialog.close("saved");
      showToast(`Data akun "${target.username}" berhasil diperbarui!`);
    });
  }

  // Reset Password Dialog
  const resetPassDialog = document.getElementById("reset-password-dialog");
  const resetPassForm = document.getElementById("form-reset-password");
  const cancelResetPassBtn = document.getElementById(
    "btn-cancel-reset-password",
  );
  const fillDefaultPassBtn = document.getElementById("btn-fill-default-pass");

  if (cancelResetPassBtn && resetPassDialog) {
    cancelResetPassBtn.addEventListener("click", () =>
      resetPassDialog.close("cancel"),
    );
  }

  if (fillDefaultPassBtn) {
    fillDefaultPassBtn.addEventListener("click", () => {
      const passInputEl = document.getElementById("reset-password-new");
      if (passInputEl) {
        passInputEl.value = "123456";
        passInputEl.focus();
      }
    });
  }

  if (resetPassForm && resetPassDialog) {
    resetPassForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!currentUser || currentUser.role !== "superadmin") return;

      const userId = document.getElementById("reset-password-user-id").value;
      const newPassword = document
        .getElementById("reset-password-new")
        .value.trim();
      const target = (db.users || []).find((u) => u.id === userId);
      if (!target || !newPassword) return;

      target.password = newPassword;
      saveDatabase();
      renderUsersList();
      resetPassForm.reset();
      resetPassDialog.close("saved");
      showToast(`Password akun "${target.username}" berhasil direset!`);
    });
  }
}

// ============================================================================
// 1. MODERN WEB GUIDANCE: DIALOG LIGHT-DISMISS FALLBACK & RETURNVALUE RESET
// ============================================================================
function initDialogs() {
  if (!("closedBy" in HTMLDialogElement.prototype)) {
    // Test the pointer position, not event.target: the <dialog> is also the target for its own
    // padding and the gaps between its children, so a target check would close on those clicks
    const outside = (e, dialog) => {
      const r = dialog.getBoundingClientRect();
      return (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      );
    };
    for (const dialog of document.querySelectorAll('dialog[closedby="any"]')) {
      let pressedOutside = false;
      dialog.addEventListener("pointerdown", (e) => {
        pressedOutside = outside(e, dialog);
      });
      // Require the press and the release outside, so a text-selection drag that ends on the backdrop does not dismiss
      dialog.addEventListener("pointerup", (e) => {
        if (pressedOutside && outside(e, dialog)) dialog.close();
      });
    }
  }

  for (const dialog of document.querySelectorAll("dialog")) {
    dialog.addEventListener("close", () => {
      // Reset returnValue so Esc/dismiss does not leak a stale value on subsequent closes
      dialog.returnValue = "";
      document.body.classList.remove("print-receipt-mode");
    });
  }
}

// ============================================================================
// 2. MODERN WEB GUIDANCE: WEB INSTALL API + BEFOREINSTALLPROMPT FALLBACK
// ============================================================================
function initWebAppInstall() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => reg.update())
      .catch(() => {});
  }

  const installButton = document.querySelector("#install-app");
  const installStatus = document.querySelector("#install-status");
  if (!installButton || !installStatus) return;

  const supportsWebInstall = typeof Navigator.prototype.install === "function";
  let deferredInstallPrompt;

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
  });

  installButton.addEventListener("click", async () => {
    if (installButton.getAttribute("aria-disabled") === "true") {
      return;
    }
    // Use aria-disabled instead of disabled so activating the button does not drop focus.
    installButton.setAttribute("aria-disabled", "true");

    try {
      if (supportsWebInstall) {
        await navigator.install();
        installStatus.textContent = "Aplikasi berhasil di-install atau dibuka.";
        showToast("Aplikasi Timbangan TBS berhasil di-install!");
      } else if (deferredInstallPrompt) {
        // Save and clear the single-use event before awaiting the user's choice.
        const promptEvent = deferredInstallPrompt;
        deferredInstallPrompt = undefined;
        await promptEvent.prompt();
        const { outcome } = await promptEvent.userChoice;

        installStatus.textContent =
          outcome === "accepted"
            ? "Aplikasi berhasil di-install."
            : "Instalasi dibatalkan.";
        if (outcome === "accepted") {
          showToast("Aplikasi Timbangan TBS berhasil di-install!");
        }
      } else {
        installStatus.textContent =
          "Aplikasi sudah terpasang atau buka menu browser Chrome (titik tiga) lalu pilih Install Aplikasi.";
        showToast(
          'Jika belum terpasang, buka menu browser (⋮) lalu pilih "Install Aplikasi" / "Tambahkan ke Layar Utama".',
        );
      }
    } catch (error) {
      if (error.name === "AbortError") {
        installStatus.textContent = "Instalasi dibatalkan atau belum selesai.";
      } else {
        installStatus.textContent = "Instalasi tidak dapat dimulai.";
        console.error(error);
      }
    } finally {
      installButton.removeAttribute("aria-disabled");
    }
  });
}

// ============================================================================
// 3. NAVIGATION & HEADER SYNC
// ============================================================================
let currentActiveTab = "view-beli";

function syncScalePanelVisibility(targetViewId = currentActiveTab) {
  const scalePanel = document.getElementById("scale-indicator-panel");
  const mainSlot = document.getElementById("scale-panel-main-slot");
  const settingsSlot = document.getElementById("scale-panel-settings-slot");
  if (!scalePanel) return;

  const showPanel = Boolean(db.settings.showScalePanel);

  if (targetViewId === "view-setelan" && settingsSlot) {
    if (scalePanel.parentElement !== settingsSlot) {
      settingsSlot.appendChild(scalePanel);
    }
    scalePanel.hidden = !showPanel;
  } else if (
    (targetViewId === "view-beli" || targetViewId === "view-jual") &&
    mainSlot
  ) {
    if (scalePanel.parentElement !== mainSlot) {
      mainSlot.appendChild(scalePanel);
    }
    scalePanel.hidden = !showPanel;
  } else {
    scalePanel.hidden = true;
  }
}

function syncHeaderAndDefaults() {
  document.getElementById("ram-header-name").textContent = db.settings.ramName;
  document.getElementById("header-price-badge").textContent =
    `Harga TBS: ${fmtRp(db.settings.defaultBuyPrice)}/kg`;
  document.getElementById("header-date-badge").textContent =
    new Intl.DateTimeFormat("id-ID", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date());

  // Next ticket numbers
  const nextBuyNum = String(db.purchases.length + 1).padStart(3, "0");
  document.getElementById("beli-ticket-preview").textContent =
    `TBS-IN-${nextBuyNum}`;

  const nextSellNum = String(db.sales.length + 1).padStart(3, "0");
  document.getElementById("jual-ticket-preview").textContent =
    `TBS-OUT-${nextSellNum}`;
}

function switchTab(targetViewId) {
  if (targetViewId === "view-setelan" && currentUser?.role === "kasir") {
    showToast(
      "Menu Pengaturan hanya dapat diakses oleh Admin atau Superadmin.",
    );
    return;
  }
  if (targetViewId === "view-users" && currentUser?.role !== "superadmin") {
    showToast("Menu Pengaturan User hanya dapat diakses oleh Superadmin.");
    return;
  }
  currentActiveTab = targetViewId;
  const views = document.querySelectorAll(".view-section");
  views.forEach((v) => {
    v.hidden = v.id !== targetViewId;
  });

  syncScalePanelVisibility(targetViewId);

  document.querySelectorAll(".bottom-bar .nav-item").forEach((btn) => {
    const active = btn.dataset.target === targetViewId;
    btn.classList.toggle("active", active);
    if (active) {
      btn.setAttribute("aria-current", "page");
    } else {
      btn.removeAttribute("aria-current");
    }
  });

  const quickSettingsBtn = document.getElementById("btn-quick-price");
  if (quickSettingsBtn) {
    if (targetViewId === "view-setelan") {
      quickSettingsBtn.setAttribute("aria-current", "page");
    } else {
      quickSettingsBtn.removeAttribute("aria-current");
    }
  }

  if (targetViewId === "view-laporan") {
    renderReports();
  } else if (targetViewId === "view-mitra") {
    renderPartnersView();
  } else if (targetViewId === "view-setelan") {
    populateSettingsForm();
  } else if (targetViewId === "view-users") {
    renderUsersList();
  }
}

// ============================================================================
// 4. DIGITAL SCALE INDICATOR & SIMULATOR / WEB BLUETOOTH
// ============================================================================
function setScaleWeight(weightKg) {
  currentScaleWeight = Math.max(0, Math.round(Number(weightKg) || 0));
  const out = document.getElementById("digital-weight-output");
  const slider = document.getElementById("scale-sim-slider");
  if (out) out.textContent = fmtNum(currentScaleWeight);
  if (slider && Number(slider.value) !== currentScaleWeight) {
    slider.value = String(Math.min(15000, currentScaleWeight));
  }
}

function initDigitalScale() {
  const slider = document.getElementById("scale-sim-slider");
  if (slider) {
    slider.addEventListener("input", () => {
      setScaleWeight(slider.value);
    });
  }

  document.querySelectorAll("[data-sim-weight]").forEach((btn) => {
    btn.addEventListener("click", () => {
      setScaleWeight(btn.dataset.simWeight);
    });
  });

  const toggleBtn = document.getElementById("btn-toggle-scale-sim");
  const controls = document.getElementById("scale-sim-controls");
  if (toggleBtn && controls) {
    toggleBtn.addEventListener("click", () => {
      const expanded = toggleBtn.getAttribute("aria-expanded") === "true";
      toggleBtn.setAttribute("aria-expanded", String(!expanded));
      controls.hidden = expanded;
    });
  }

  // Capture Bruto / Tara buttons into active form (Beli or Jual)
  document.getElementById("btn-capture-bruto").addEventListener("click", () => {
    const isJual = !document.getElementById("view-jual").hidden;
    const input = document.getElementById(isJual ? "jual-bruto" : "beli-bruto");
    if (input) {
      input.value = String(currentScaleWeight);
      input.dispatchEvent(new Event("input", { bubbles: true }));
      showToast(`Berat Bruto diambil: ${fmtNum(currentScaleWeight)} kg`);
    }
  });

  document.getElementById("btn-capture-tara").addEventListener("click", () => {
    const isJual = !document.getElementById("view-jual").hidden;
    const input = document.getElementById(isJual ? "jual-tara" : "beli-tara");
    if (input) {
      input.value = String(currentScaleWeight);
      input.dispatchEvent(new Event("input", { bubbles: true }));
      showToast(`Berat Tara diambil: ${fmtNum(currentScaleWeight)} kg`);
    }
  });

  // Bluetooth scale connection (supports Native Android APK & Web Bluetooth)
  document
    .getElementById("btn-connect-bt-scale")
    .addEventListener("click", async () => {
      const flag = document.getElementById("bt-conn-flag");
      if (isNativeAndroidBt()) {
        openNativeBtPrinterModal((dev) => {
          if (flag) {
            flag.textContent = `BT: ${dev.name || "TERHUBUNG"}`;
            flag.classList.add("active");
          }
          showToast(`Terhubung ke indikator: ${dev.name || "Timbangan BT"}`);
        });
        return;
      }
      if (!navigator.bluetooth) {
        showToast(
          "Gunakan aplikasi APK Android atau Chrome untuk koneksi Bluetooth, atau pakai simulator/input manual.",
        );
        return;
      }
      try {
        const device = await navigator.bluetooth.requestDevice({
          acceptAllDevices: true,
        });
        if (flag) {
          flag.textContent = `BT: ${device.name || "TERHUBUNG"}`;
          flag.classList.add("active");
        }
        showToast(`Terhubung ke indikator: ${device.name || "Timbangan BLE"}`);
      } catch {
        showToast("Koneksi Bluetooth dibatalkan. Mode Simulator/Manual aktif.");
      }
    });
}

// ============================================================================
// 5. TIMBANG BELI (PEMBELIAN TBS DARI PETANI & ANTREAN TIMBANG 1)
// ============================================================================
function populatePartnerSelects() {
  const farmerSelect = document.getElementById("beli-farmer");
  const loanFarmerSelect = document.getElementById("loan-farmer-select");
  const currentFarmerVal = farmerSelect.value;

  farmerSelect.innerHTML =
    '<option value="">-- Pilih Petani/Pemasok --</option>';
  loanFarmerSelect.innerHTML = "";

  db.farmers.forEach((f) => {
    const priceLabel =
      f.specialPrice > 0 ? `${fmtRp(f.specialPrice)}/kg` : "Harga Harian";
    const opt = document.createElement("option");
    opt.value = f.id;
    opt.textContent = `${f.name} (${priceLabel})`;
    farmerSelect.appendChild(opt);

    const optLoan = document.createElement("option");
    optLoan.value = f.id;
    optLoan.textContent = `${f.name} — Kasbon: ${fmtRp(f.loanBalance)}`;
    loanFarmerSelect.appendChild(optLoan);
  });

  if (currentFarmerVal) farmerSelect.value = currentFarmerVal;

  const millSelect = document.getElementById("jual-mill");
  const currentMillVal = millSelect.value;
  millSelect.innerHTML = '<option value="">-- Pilih Pabrik / PKS --</option>';
  db.mills.forEach((m) => {
    const opt = document.createElement("option");
    opt.value = m.id;
    opt.textContent = `${m.name} (${fmtRp(m.price)}/kg)`;
    millSelect.appendChild(opt);
  });
  if (currentMillVal) millSelect.value = currentMillVal;

  // Report partner filter
  const filterPartner = document.getElementById("filter-partner");
  const currFilterVal = filterPartner.value;
  filterPartner.innerHTML =
    '<option value="ALL">Semua Petani & Pabrik</option>';
  db.farmers.forEach((f) => {
    const opt = document.createElement("option");
    opt.value = `FARMER:${f.id}`;
    opt.textContent = `[Petani] ${f.name}`;
    filterPartner.appendChild(opt);
  });
  db.mills.forEach((m) => {
    const opt = document.createElement("option");
    opt.value = `MILL:${m.id}`;
    opt.textContent = `[PKS] ${m.name}`;
    filterPartner.appendChild(opt);
  });
  if (currFilterVal) filterPartner.value = currFilterVal;
}

function renderPendingTrucks() {
  const card = document.getElementById("pending-trucks-card");
  const list = document.getElementById("pending-trucks-list");
  const badge = document.getElementById("pending-trucks-count");

  if (!db.pendingTrucks || db.pendingTrucks.length === 0) {
    card.hidden = true;
    return;
  }

  card.hidden = false;
  badge.textContent = `${db.pendingTrucks.length} Truk`;
  list.innerHTML = "";

  db.pendingTrucks.forEach((item) => {
    const div = document.createElement("div");
    div.className = "pending-item";

    const info = document.createElement("div");
    info.className = "pending-item-info";
    const title = document.createElement("strong");
    title.textContent = `${item.plate} — ${item.farmerName}`;
    const sub = document.createElement("span");
    sub.textContent = `Bruto: ${fmtNum(item.bruto)} kg • Sopir: ${item.driver || "-"}`;
    info.append(title, sub);

    const actions = document.createElement("div");
    actions.className = "toolbar";

    const btnLoad = document.createElement("button");
    btnLoad.type = "button";
    btnLoad.className = "btn btn-primary btn-sm";
    btnLoad.textContent = "Timbang Tara";
    btnLoad.addEventListener("click", () => loadPendingTruckIntoForm(item.id));

    const btnDel = document.createElement("button");
    btnDel.type = "button";
    btnDel.className = "btn btn-ghost btn-sm";
    btnDel.setAttribute("aria-label", `Hapus antrean ${item.plate}`);
    btnDel.textContent = "✕";
    btnDel.addEventListener("click", () => {
      markDeletedId(item.id);
      db.pendingTrucks = db.pendingTrucks.filter((p) => p.id !== item.id);
      saveDatabase();
      renderPendingTrucks();
      showToast(`Antrean ${item.plate} dihapus.`);
    });

    actions.append(btnLoad, btnDel);
    div.append(info, actions);
    list.appendChild(div);
  });
}

function loadPendingTruckIntoForm(pendingId) {
  const item = db.pendingTrucks.find((p) => p.id === pendingId);
  if (!item) return;

  document.getElementById("beli-pending-id").value = item.id;
  document.getElementById("beli-farmer").value = item.farmerId;
  document.getElementById("beli-farmer").dispatchEvent(new Event("change"));
  document.getElementById("beli-plate").value = item.plate;
  document.getElementById("beli-driver").value = item.driver || "";
  document.getElementById("beli-bruto").value = String(item.bruto);
  document.getElementById("beli-cut-percent").value = String(
    item.cutPercent ?? db.settings.defaultCutPercent,
  );
  document.getElementById("beli-cut-kg").value = String(item.cutKg ?? 0);
  document.getElementById("beli-price").value = String(
    item.pricePerKg || db.settings.defaultBuyPrice,
  );
  document.getElementById("beli-unloading-rate").value = String(
    item.unloadingRate ?? db.settings.defaultUnloadingRate,
  );

  const taraInput = document.getElementById("beli-tara");
  if (currentScaleWeight > 0 && currentScaleWeight < item.bruto) {
    taraInput.value = String(currentScaleWeight);
  } else {
    taraInput.value = "";
  }

  calculateBeliLive();
  taraInput.focus();
  showToast(
    `Data Bruto ${item.plate} (${fmtNum(item.bruto)} kg) dimuat. Silakan isi Berat Tara.`,
  );
}

function calculateBeliLive() {
  const bruto = parseNum(document.getElementById("beli-bruto").value);
  const tara = parseNum(document.getElementById("beli-tara").value);
  const cutPercent = parseNum(
    document.getElementById("beli-cut-percent").value,
  );
  const cutKg = parseNum(document.getElementById("beli-cut-kg").value);
  const pricePerKg = parseNum(document.getElementById("beli-price").value);
  const unloadingRate = parseNum(
    document.getElementById("beli-unloading-rate").value,
  );
  const loanDeduct = parseNum(
    document.getElementById("beli-loan-deduct").value,
  );

  const netto1 = Math.max(0, bruto - tara);
  const percentCutKg = Math.round(netto1 * (cutPercent / 100));
  const totalCutKg = Math.min(netto1, percentCutKg + Math.round(cutKg));
  const nettoClean = Math.max(0, netto1 - totalCutKg);

  const grossTotal = Math.round(nettoClean * pricePerKg);
  const unloadingCost = Math.round(nettoClean * unloadingRate);
  const netPaid = Math.max(0, grossTotal - unloadingCost - loanDeduct);

  document.getElementById("beli-netto1-display").textContent =
    `${fmtNum(netto1)} kg`;
  document.getElementById("beli-cut-total-display").textContent =
    `- ${fmtNum(totalCutKg)} kg`;
  document.getElementById("beli-netto-clean-display").textContent =
    `${fmtNum(nettoClean)} kg`;

  document.getElementById("beli-unloading-total-hint").textContent =
    `Total bongkar: ${fmtRp(unloadingCost)}`;

  const farmerId = document.getElementById("beli-farmer").value;
  const farmer = db.farmers.find((f) => f.id === farmerId);
  const currentLoan = farmer ? farmer.loanBalance : 0;
  const remLoan = Math.max(0, currentLoan - loanDeduct);
  document.getElementById("beli-loan-remaining-hint").textContent =
    `Sisa kasbon setelah potong: ${fmtRp(remLoan)}`;

  document.getElementById("sum-beli-netto").textContent =
    `${fmtNum(nettoClean)} kg`;
  document.getElementById("sum-beli-price").textContent = fmtRp(pricePerKg);
  document.getElementById("sum-beli-gross").textContent = fmtRp(grossTotal);
  document.getElementById("sum-beli-unloading").textContent =
    `- ${fmtRp(unloadingCost)}`;
  document.getElementById("sum-beli-loan").textContent =
    `- ${fmtRp(loanDeduct)}`;
  document.getElementById("sum-beli-net-pay").textContent = fmtRp(netPaid);

  return {
    bruto,
    tara,
    netto1,
    cutPercent,
    cutKg,
    totalCutKg,
    nettoClean,
    pricePerKg,
    grossTotal,
    unloadingRate,
    unloadingCost,
    loanDeduct,
    netPaid,
  };
}

function initFormBeli() {
  const form = document.getElementById("form-pembelian");
  const farmerSelect = document.getElementById("beli-farmer");
  const errorBanner = document.getElementById("beli-form-error");

  // Set initial defaults from settings
  document.getElementById("beli-price").value = String(
    db.settings.defaultBuyPrice,
  );
  document.getElementById("beli-cut-percent").value = String(
    db.settings.defaultCutPercent,
  );
  document.getElementById("beli-unloading-rate").value = String(
    db.settings.defaultUnloadingRate,
  );

  farmerSelect.addEventListener("change", () => {
    const farmer = db.farmers.find((f) => f.id === farmerSelect.value);
    const infoBanner = document.getElementById("beli-farmer-info");
    if (farmer) {
      infoBanner.hidden = false;
      const effectivePrice =
        farmer.specialPrice > 0
          ? farmer.specialPrice
          : db.settings.defaultBuyPrice;
      document.getElementById("beli-price").value = String(effectivePrice);
      if (farmer.defaultPlate && !document.getElementById("beli-plate").value) {
        document.getElementById("beli-plate").value = farmer.defaultPlate;
      }
      document.getElementById("beli-farmer-tier").textContent =
        farmer.specialPrice > 0
          ? `Harga Spesial Mitra: ${fmtRp(effectivePrice)}/kg`
          : `Harga Harian RAM: ${fmtRp(effectivePrice)}/kg`;
      document.getElementById("beli-farmer-loan-badge").textContent =
        `Saldo Kasbon: ${fmtRp(farmer.loanBalance)}`;
    } else {
      infoBanner.hidden = true;
    }
    calculateBeliLive();
  });

  // Live calculation & non-intrusive validation reset on input
  form.addEventListener("input", (e) => {
    if (e.target.matches("input, select")) {
      e.target.setCustomValidity("");
      e.target.removeAttribute("aria-invalid");
      errorBanner.hidden = true;
    }
    calculateBeliLive();
  });

  // Contextual validation on blur (if edited)
  form
    .querySelectorAll("input[required], select[required]")
    .forEach((field) => {
      field.addEventListener("blur", () => {
        if (field.value !== "" && !field.checkValidity()) {
          field.setAttribute("aria-invalid", "true");
        }
      });
    });

  // Max loan deduction button
  document
    .getElementById("btn-max-loan-deduct")
    .addEventListener("click", () => {
      const farmer = db.farmers.find((f) => f.id === farmerSelect.value);
      if (!farmer || farmer.loanBalance <= 0) {
        showToast("Petani ini tidak memiliki saldo kasbon aktif.");
        return;
      }
      const calc = calculateBeliLive();
      const availableAfterUnloading = Math.max(
        0,
        calc.grossTotal - calc.unloadingCost,
      );
      const maxDeduct = Math.min(farmer.loanBalance, availableAfterUnloading);
      document.getElementById("beli-loan-deduct").value = String(maxDeduct);
      calculateBeliLive();
    });

  // Hold Truck (Antrean Timbang 1 / Bruto Only)
  document.getElementById("btn-hold-beli")?.addEventListener("click", () => {
    const farmer = db.farmers.find((f) => f.id === farmerSelect.value);
    const plate = document
      .getElementById("beli-plate")
      .value.trim()
      .toUpperCase();
    const bruto = parseNum(document.getElementById("beli-bruto").value);

    if (!farmer || !plate || bruto <= 0) {
      errorBanner.textContent =
        "Untuk simpan Antrean Bruto, pilih Petani, isi Plat Nomor, dan isi Berat Bruto (> 0 kg).";
      errorBanner.hidden = false;
      return;
    }

    const pendingItem = {
      id: "PEND-" + Date.now(),
      ticketNo: `TBS-IN-ANTRE-${db.pendingTrucks.length + 1}`,
      farmerId: farmer.id,
      farmerName: farmer.name,
      plate,
      driver: document.getElementById("beli-driver").value.trim(),
      bruto,
      cutPercent: parseNum(document.getElementById("beli-cut-percent").value),
      cutKg: parseNum(document.getElementById("beli-cut-kg").value),
      pricePerKg: parseNum(document.getElementById("beli-price").value),
      unloadingRate: parseNum(
        document.getElementById("beli-unloading-rate").value,
      ),
      timeIn: new Date().toISOString(),
    };

    db.pendingTrucks.unshift(pendingItem);
    saveDatabase();
    renderPendingTrucks();
    resetBeliForm();
    showToast(
      `Truk ${plate} disimpan ke Antrean RAM (Bruto: ${fmtNum(bruto)} kg).`,
    );
  });

  document
    .getElementById("btn-reset-beli")
    ?.addEventListener("click", resetBeliForm);

  // Final Submit Pembelian TBS
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    errorBanner.hidden = true;

    const farmer = db.farmers.find((f) => f.id === farmerSelect.value);
    const plateField = document.getElementById("beli-plate");
    const brutoField = document.getElementById("beli-bruto");
    const taraField = document.getElementById("beli-tara");
    const calc = calculateBeliLive();

    if (!farmer) {
      farmerSelect.setAttribute("aria-invalid", "true");
      errorBanner.textContent =
        "Silakan pilih Nama Petani / Pemasok terlebih dahulu.";
      errorBanner.hidden = false;
      farmerSelect.focus();
      return;
    }

    if (!plateField.value.trim()) {
      plateField.setAttribute("aria-invalid", "true");
      errorBanner.textContent = "Nomor Polisi (Plat Kendaraan) wajib diisi.";
      errorBanner.hidden = false;
      plateField.focus();
      return;
    }

    if (calc.bruto <= 0 || calc.tara <= 0 || calc.bruto <= calc.tara) {
      brutoField.setAttribute("aria-invalid", "true");
      taraField.setAttribute("aria-invalid", "true");
      errorBanner.textContent =
        "Berat Bruto harus lebih besar dari Berat Tara (dan Tara > 0 kg).";
      errorBanner.hidden = false;
      brutoField.focus();
      return;
    }

    const paymentMethodRadio = form.querySelector(
      'input[name="paymentMethod"]:checked',
    );
    const ticketNo = `TBS-IN-${String(db.purchases.length + 1).padStart(3, "0")}`;
    const now = new Date();

    const record = {
      id: "BUY-" + Date.now(),
      ticketNo,
      date: todayISO(),
      timestamp: now.toISOString(),
      farmerId: farmer.id,
      farmerName: farmer.name,
      plate: plateField.value.trim().toUpperCase(),
      driver: document.getElementById("beli-driver").value.trim() || "-",
      bruto: calc.bruto,
      tara: calc.tara,
      netto1: calc.netto1,
      cutPercent: calc.cutPercent,
      cutKg: calc.cutKg,
      totalCutKg: calc.totalCutKg,
      nettoClean: calc.nettoClean,
      pricePerKg: calc.pricePerKg,
      grossTotal: calc.grossTotal,
      unloadingRate: calc.unloadingRate,
      unloadingCost: calc.unloadingCost,
      loanDeduct: calc.loanDeduct,
      netPaid: calc.netPaid,
      paymentMethod: paymentMethodRadio ? paymentMethodRadio.value : "Tunai",
      cashierName: currentUser?.fullName || db.settings.cashierName || "Kasir",
      notes: document.getElementById("beli-notes").value.trim(),
    };

    // Deduct farmer's loan balance if loanDeduct > 0
    if (record.loanDeduct > 0) {
      farmer.loanBalance = Math.max(
        0,
        (farmer.loanBalance || 0) - record.loanDeduct,
      );
      farmer.updatedAt = Date.now();
    }

    // Remove from pending queue if loaded from queue
    const pendingId = document.getElementById("beli-pending-id").value;
    if (pendingId) {
      markDeletedId(pendingId);
      db.pendingTrucks = db.pendingTrucks.filter((p) => p.id !== pendingId);
    }

    db.purchases.unshift(record);
    saveDatabase();

    populatePartnerSelects();
    renderPendingTrucks();
    renderPartnersView();
    syncHeaderAndDefaults();
    resetBeliForm();

    showToast(`Transaksi ${record.ticketNo} berhasil disimpan!`);
    openReceiptDialog("BUY", record);
  });
}

function resetBeliForm() {
  const form = document.getElementById("form-pembelian");
  form.reset();
  document.getElementById("beli-pending-id").value = "";
  document.getElementById("beli-farmer-info").hidden = true;
  document.getElementById("beli-form-error").hidden = true;
  document.getElementById("beli-price").value = String(
    db.settings.defaultBuyPrice,
  );
  document.getElementById("beli-cut-percent").value = String(
    db.settings.defaultCutPercent,
  );
  document.getElementById("beli-unloading-rate").value = String(
    db.settings.defaultUnloadingRate,
  );
  document.getElementById("beli-cut-kg").value = "0";
  document.getElementById("beli-loan-deduct").value = "0";
  calculateBeliLive();
}

// ============================================================================
// 6. TIMBANG JUAL (PENJUALAN / PENGIRIMAN DO KE PABRIK PKS)
// ============================================================================
function calculateJualLive() {
  const bruto = parseNum(document.getElementById("jual-bruto").value);
  const tara = parseNum(document.getElementById("jual-tara").value);
  const cutPercent = parseNum(
    document.getElementById("jual-cut-percent").value,
  );
  const cutKg = parseNum(document.getElementById("jual-cut-kg").value);
  const pricePerKg = parseNum(document.getElementById("jual-price").value);
  const freightCost = parseNum(
    document.getElementById("jual-freight-cost").value,
  );
  const loadingCost = parseNum(
    document.getElementById("jual-loading-cost").value,
  );

  const netto1 = Math.max(0, bruto - tara);
  const percentCutKg = Math.round(netto1 * (cutPercent / 100));
  const totalCutKg = Math.min(netto1, percentCutKg + Math.round(cutKg));
  const nettoClean = Math.max(0, netto1 - totalCutKg);

  const grossTotal = Math.round(nettoClean * pricePerKg);
  const totalExpenses = Math.round(freightCost + loadingCost);
  const netReceived = Math.max(0, grossTotal - totalExpenses);

  document.getElementById("jual-netto1-display").textContent =
    `${fmtNum(netto1)} kg`;
  document.getElementById("jual-cut-total-display").textContent =
    `- ${fmtNum(totalCutKg)} kg`;
  document.getElementById("jual-netto-clean-display").textContent =
    `${fmtNum(nettoClean)} kg`;

  document.getElementById("sum-jual-netto").textContent =
    `${fmtNum(nettoClean)} kg`;
  document.getElementById("sum-jual-price").textContent = fmtRp(pricePerKg);
  document.getElementById("sum-jual-gross").textContent = fmtRp(grossTotal);
  document.getElementById("sum-jual-expenses").textContent =
    `- ${fmtRp(totalExpenses)}`;
  document.getElementById("sum-jual-net-receive").textContent =
    fmtRp(netReceived);

  return {
    bruto,
    tara,
    netto1,
    cutPercent,
    cutKg,
    totalCutKg,
    nettoClean,
    pricePerKg,
    grossTotal,
    freightCost,
    loadingCost,
    netReceived,
  };
}

function initFormJual() {
  const form = document.getElementById("form-penjualan");
  const millSelect = document.getElementById("jual-mill");
  const errorBanner = document.getElementById("jual-form-error");

  millSelect.addEventListener("change", () => {
    const mill = db.mills.find((m) => m.id === millSelect.value);
    if (mill) {
      document.getElementById("jual-price").value = String(mill.price);
      const doInput = document.getElementById("jual-do-number");
      if (!doInput.value) {
        const seq = String(db.sales.length + 1).padStart(3, "0");
        doInput.value = `${mill.doPrefix || "DO-PKS"}/${seq}`;
      }
    }
    calculateJualLive();
  });

  form.addEventListener("input", (e) => {
    if (e.target.matches("input, select")) {
      e.target.setCustomValidity("");
      e.target.removeAttribute("aria-invalid");
      errorBanner.hidden = true;
    }
    calculateJualLive();
  });

  document.getElementById("btn-reset-jual")?.addEventListener("click", () => {
    form.reset();
    errorBanner.hidden = true;
    calculateJualLive();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    errorBanner.hidden = true;

    const mill = db.mills.find((m) => m.id === millSelect.value);
    const doField = document.getElementById("jual-do-number");
    const plateField = document.getElementById("jual-plate");
    const brutoField = document.getElementById("jual-bruto");
    const calc = calculateJualLive();

    if (!mill) {
      millSelect.setAttribute("aria-invalid", "true");
      errorBanner.textContent =
        "Silakan pilih Pabrik Kelapa Sawit (PKS) tujuan.";
      errorBanner.hidden = false;
      millSelect.focus();
      return;
    }

    if (!doField.value.trim()) {
      doField.setAttribute("aria-invalid", "true");
      errorBanner.textContent = "Nomor DO / SPB pengiriman wajib diisi.";
      errorBanner.hidden = false;
      doField.focus();
      return;
    }

    if (!plateField.value.trim()) {
      plateField.setAttribute("aria-invalid", "true");
      errorBanner.textContent = "Plat Nomor Truk wajib diisi.";
      errorBanner.hidden = false;
      plateField.focus();
      return;
    }

    if (calc.bruto <= 0 || calc.tara <= 0 || calc.bruto <= calc.tara) {
      brutoField.setAttribute("aria-invalid", "true");
      errorBanner.textContent =
        "Berat Bruto harus lebih besar dari Berat Tara.";
      errorBanner.hidden = false;
      brutoField.focus();
      return;
    }

    const statusRadio = form.querySelector('input[name="saleStatus"]:checked');
    const ticketNo = `TBS-OUT-${String(db.sales.length + 1).padStart(3, "0")}`;

    const record = {
      id: "SELL-" + Date.now(),
      ticketNo,
      date: todayISO(),
      timestamp: new Date().toISOString(),
      millId: mill.id,
      millName: mill.name,
      doNumber: doField.value.trim(),
      plate: plateField.value.trim().toUpperCase(),
      driver: document.getElementById("jual-driver").value.trim() || "-",
      bruto: calc.bruto,
      tara: calc.tara,
      netto1: calc.netto1,
      cutPercent: calc.cutPercent,
      cutKg: calc.cutKg,
      totalCutKg: calc.totalCutKg,
      nettoClean: calc.nettoClean,
      pricePerKg: calc.pricePerKg,
      grossTotal: calc.grossTotal,
      freightCost: calc.freightCost,
      loadingCost: calc.loadingCost,
      netReceived: calc.netReceived,
      saleStatus: statusRadio ? statusRadio.value : "Lunas",
      cashierName: currentUser?.fullName || db.settings.cashierName || "Kasir",
      notes: document.getElementById("jual-notes").value.trim(),
    };

    db.sales.unshift(record);
    saveDatabase();
    syncHeaderAndDefaults();
    form.reset();
    calculateJualLive();

    showToast(`Pengiriman PKS ${record.ticketNo} berhasil disimpan!`);
    openReceiptDialog("SELL", record);
  });
}

// ============================================================================
// 7. THERMAL RECEIPT MODAL (58mm / 80mm), BLUETOOTH PRINTER PAIRING & WHATSAPP
// ============================================================================
const BT_PRINTER_SERVICES = [
  "000018f0-0000-1000-8000-00805f9b34fb",
  "e7810a71-73ae-499d-8c15-faa9aef0c3f2",
  "49535343-fe7d-4ae5-8fa9-9fafd205e455",
  "0000ff00-0000-1000-8000-00805f9b34fb",
  "0000ffe0-0000-1000-8000-00805f9b34fb",
  "0000ae30-0000-1000-8000-00805f9b34fb",
];

function isNativeAndroidBt() {
  return Boolean(
    window.AndroidBluetooth &&
    typeof window.AndroidBluetooth.getPairedPrinters === "function",
  );
}

const btPrinterState = {
  device: null,
  characteristic: null,
  connected: false,
  name: "",
  address: "",
};

function syncBtPrinterUI() {
  if (
    isNativeAndroidBt() &&
    !btPrinterState.connected &&
    db.settings.btPrinterId &&
    db.settings.btPrinterName
  ) {
    btPrinterState.connected = true;
    btPrinterState.name = db.settings.btPrinterName;
    btPrinterState.address = db.settings.btPrinterId;
  }

  const badge = document.getElementById("bt-printer-status-badge");
  const info = document.getElementById("bt-printer-device-info");
  const pairBtnText = document.getElementById("btn-pair-bt-printer-text");
  const disconnectBtn = document.getElementById("btn-disconnect-bt-printer");
  const receiptStatus = document.getElementById("receipt-bt-status-text");
  const receiptPairBtn = document.getElementById("btn-receipt-pair-bt");

  const savedName = btPrinterState.name || db.settings.btPrinterName || "";

  if (btPrinterState.connected) {
    if (badge) {
      badge.className = "badge badge-stable";
      badge.textContent = `Terhubung: ${savedName || "Printer BT"}`;
    }
    if (info) {
      info.textContent = `Printer Bluetooth aktif: ${savedName} (${db.settings.paperWidth || "58mm"}). Siap mencetak struk ESC/POS secara langsung.`;
    }
    if (pairBtnText) {
      pairBtnText.textContent = "Ganti / Pair Ulang Printer";
    }
    if (disconnectBtn) {
      disconnectBtn.hidden = false;
    }
    if (receiptStatus) {
      receiptStatus.innerHTML = `Printer BT: <strong class="text-success">${escapeHTML(savedName || "Terhubung")}</strong>`;
    }
    if (receiptPairBtn) {
      receiptPairBtn.textContent = "Ganti Printer BT";
    }
  } else {
    if (badge) {
      badge.className = "badge badge-warning";
      badge.textContent = savedName
        ? `Tersimpan: ${savedName} (Terputus)`
        : "Belum Terhubung";
    }
    if (info) {
      info.textContent = savedName
        ? `Printer terakhir: ${savedName}. Klik tombol di bawah untuk menghubungkan kembali Bluetooth.`
        : "Hubungkan printer kasir Bluetooth 58mm/80mm (Eppos, VSC, Blueprint, Panda, Xprinter, dll) untuk cetak struk langsung.";
    }
    if (pairBtnText) {
      pairBtnText.textContent = savedName
        ? `Hubungkan ke ${savedName}`
        : "Cari & Pair Printer Bluetooth";
    }
    if (disconnectBtn) {
      disconnectBtn.hidden = !savedName;
    }
    if (receiptStatus) {
      receiptStatus.textContent = savedName
        ? `Printer BT: ${savedName} (Belum aktif)`
        : "Printer Bluetooth: Belum Terhubung";
    }
    if (receiptPairBtn) {
      receiptPairBtn.textContent = "Pair Printer BT";
    }
  }
}

let currentNativeBtSelectCallback = null;

function renderNativeBtPairedList() {
  const listEl = document.getElementById("bt-paired-list");
  const hintEl = document.getElementById("bt-printer-dialog-hint");
  if (!listEl || !isNativeAndroidBt()) return;

  listEl.innerHTML = "";
  try {
    const raw = window.AndroidBluetooth.getPairedPrinters();
    const res = JSON.parse(raw || "{}");
    if (!res.ok) {
      if (hintEl && res.message) {
        hintEl.textContent = res.message;
      }
      const li = document.createElement("li");
      li.className = "user-list-item";
      li.innerHTML = `<div class="user-list-info"><strong>${escapeHTML(res.message || "Izin atau Bluetooth belum aktif.")}</strong></div>`;
      listEl.appendChild(li);
      return;
    }

    if (hintEl) {
      hintEl.innerHTML =
        "Pilih printer thermal Bluetooth yang sudah di-pair di HP Android Anda. Jika printer belum muncul, klik <strong>Buka Bluetooth HP</strong> untuk pair terlebih dahulu.";
    }

    const devices = Array.isArray(res.devices) ? res.devices : [];
    if (devices.length === 0) {
      const li = document.createElement("li");
      li.className = "user-list-item";
      li.innerHTML = `
        <div class="user-list-info">
          <strong>Belum ada perangkat Bluetooth yang di-pair di HP ini.</strong>
          <small class="text-muted">Klik tombol "Buka Bluetooth HP (Pair Baru)" di bawah, hubungkan printer (PIN: 0000 atau 1234), lalu kembali ke aplikasi dan klik "Muat Ulang Daftar".</small>
        </div>
      `;
      listEl.appendChild(li);
      return;
    }

    devices.forEach((dev) => {
      const li = document.createElement("li");
      li.className = "user-list-item";

      const isSelected =
        (btPrinterState.address || db.settings.btPrinterId) === dev.address;

      const infoDiv = document.createElement("div");
      infoDiv.className = "user-list-info";
      infoDiv.innerHTML = `
        <div class="user-list-title-row">
          <strong>${escapeHTML(dev.name || "Printer BT")}</strong>
          ${isSelected ? '<span class="badge badge-stable">Terpilih</span>' : ""}
        </div>
        <div class="text-muted user-list-meta">MAC: ${escapeHTML(dev.address)}</div>
      `;

      const actionDiv = document.createElement("div");
      actionDiv.className = "user-list-actions toolbar";

      const selectBtn = document.createElement("button");
      selectBtn.type = "button";
      selectBtn.className = "btn btn-primary btn-sm";
      selectBtn.textContent = isSelected ? "Terhubung" : "Pilih & Hubungkan";
      selectBtn.addEventListener("click", () => {
        if (typeof currentNativeBtSelectCallback === "function") {
          currentNativeBtSelectCallback(dev);
        } else {
          btPrinterState.connected = true;
          btPrinterState.name = dev.name || "Printer Thermal BT";
          btPrinterState.address = dev.address || "";
          db.settings.btPrinterName = btPrinterState.name;
          db.settings.btPrinterId = btPrinterState.address;
          saveDatabase();
          syncBtPrinterUI();
          showToast(
            `Printer Bluetooth "${btPrinterState.name}" berhasil dihubungkan!`,
          );
        }
        const dlg = document.getElementById("bt-printer-dialog");
        if (dlg?.open) dlg.close("selected");
      });

      actionDiv.appendChild(selectBtn);
      li.append(infoDiv, actionDiv);
      listEl.appendChild(li);
    });
  } catch {
    showToast("Gagal memuat daftar perangkat Bluetooth Android.");
  }
}

function openNativeBtPrinterModal(customCallback = null) {
  currentNativeBtSelectCallback = customCallback;
  const dlg = document.getElementById("bt-printer-dialog");
  if (!dlg) return;
  renderNativeBtPairedList();
  if (!dlg.open) dlg.showModal();
}

async function pairBluetoothPrinter() {
  if (isNativeAndroidBt()) {
    openNativeBtPrinterModal(null);
    return true;
  }

  if (!navigator.bluetooth) {
    showToast(
      "Browser ini belum mendukung Web Bluetooth. Gunakan aplikasi APK Android atau Google Chrome.",
    );
    return false;
  }

  try {
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: BT_PRINTER_SERVICES,
    });

    const printerName = device.name || "Printer Thermal BT";
    btPrinterState.device = device;
    btPrinterState.name = printerName;
    btPrinterState.characteristic = null;

    device.addEventListener("gattserverdisconnected", () => {
      btPrinterState.connected = false;
      btPrinterState.characteristic = null;
      syncBtPrinterUI();
      showToast(`Koneksi Printer Bluetooth "${printerName}" terputus.`);
    });

    if (device.gatt) {
      try {
        const server = await device.gatt.connect();
        for (const serviceUuid of BT_PRINTER_SERVICES) {
          try {
            const service = await server.getPrimaryService(serviceUuid);
            const characteristics = await service.getCharacteristics();
            const writable = characteristics.find(
              (c) => c.properties.write || c.properties.writeWithoutResponse,
            );
            if (writable) {
              btPrinterState.characteristic = writable;
              break;
            }
          } catch {
            // Try next service UUID
          }
        }
      } catch {
        // Device paired even if GATT service discovery is handled by OS print spooler
      }
    }

    btPrinterState.connected = true;
    db.settings.btPrinterName = printerName;
    db.settings.btPrinterId = device.id || "";
    saveDatabase();
    syncBtPrinterUI();
    showToast(
      `Printer Bluetooth "${printerName}" berhasil di-pair & terhubung!`,
    );
    return true;
  } catch (err) {
    if (err && err.name !== "NotFoundError") {
      showToast(
        "Gagal menghubungkan printer Bluetooth. Pastikan printer menyala.",
      );
    } else {
      showToast("Pencarian printer Bluetooth dibatalkan.");
    }
    return false;
  }
}

function disconnectBluetoothPrinter() {
  if (btPrinterState.device?.gatt?.connected) {
    try {
      btPrinterState.device.gatt.disconnect();
    } catch {
      // Ignore disconnect errors
    }
  }
  btPrinterState.device = null;
  btPrinterState.characteristic = null;
  btPrinterState.connected = false;
  btPrinterState.name = "";
  btPrinterState.address = "";
  db.settings.btPrinterName = "";
  db.settings.btPrinterId = "";
  saveDatabase();
  syncBtPrinterUI();
  showToast("Printer Bluetooth telah diputuskan dan dihapus dari memori.");
}

async function sendEscPosToBtPrinter(plainText) {
  if (isNativeAndroidBt()) {
    try {
      const mac = btPrinterState.address || db.settings.btPrinterId || "";
      const raw = window.AndroidBluetooth.printEscPos(mac, plainText);
      const res = JSON.parse(raw || "{}");
      if (res.ok) {
        if (res.name) {
          btPrinterState.name = res.name;
          db.settings.btPrinterName = res.name;
        }
        if (res.address) {
          btPrinterState.address = res.address;
          db.settings.btPrinterId = res.address;
        }
        btPrinterState.connected = true;
        saveDatabase();
        syncBtPrinterUI();
        return true;
      }
      if (res.message) {
        showToast(res.message);
      }
      return false;
    } catch {
      return false;
    }
  }

  if (!btPrinterState.characteristic) {
    return false;
  }
  try {
    const encoder = new TextEncoder();
    const escPosText = plainText
      .replace(/\*([^*\n]+)\*/g, "\x1b\x45\x01$1\x1b\x45\x00")
      .replace(/\*/g, "");
    const initCmd = new Uint8Array([0x1b, 0x40]); // ESC @ Initialize printer
    const bodyBytes = encoder.encode(escPosText + "\n\n\n\n");
    const payload = new Uint8Array(initCmd.length + bodyBytes.length);
    payload.set(initCmd, 0);
    payload.set(bodyBytes, initCmd.length);

    const chunkSize = 100;
    for (let i = 0; i < payload.length; i += chunkSize) {
      const chunk = payload.slice(i, i + chunkSize);
      if (btPrinterState.characteristic.properties.writeWithoutResponse) {
        await btPrinterState.characteristic.writeValueWithoutResponse(chunk);
      } else {
        await btPrinterState.characteristic.writeValue(chunk);
      }
    }
    return true;
  } catch {
    return false;
  }
}

function renderReceiptTextToHTML(text) {
  const escaped = escapeHTML(text);
  const formatted = escaped.replace(/\*([^*\n]+)\*/g, "<strong>$1</strong>");
  return `<pre class="receipt-pre">${formatted}</pre>`;
}

async function testPrintBluetoothPrinter() {
  const printerName =
    btPrinterState.name || db.settings.btPrinterName || "Printer Thermal";
  const paperWidth = db.settings.paperWidth || "58mm";
  const nowIso = new Date().toISOString();
  const testText = [
    `*${db.settings.ramName}*`,
    ...(db.settings.address ? [db.settings.address] : []),
    ...(db.settings.phone ? [`Telp: ${db.settings.phone}`] : []),
    `--------------------------------`,
    `*TES CETAK PRINTER BLUETOOTH*`,
    `--------------------------------`,
    `Perangkat       : ${printerName}`,
    `Ukuran Kertas   : ${paperWidth}`,
    `Tanggal         : ${fmtDateOnlyID(nowIso)}`,
    `Waktu           : ${fmtTimeOnlyID(nowIso)}`,
    `Status          : NORMAL / SIAP CETAK`,
    `--------------------------------`,
    `TBSscale Pro - Timbangan TBS`,
  ].join("\n");

  if (
    isNativeAndroidBt() ||
    (btPrinterState.connected && btPrinterState.characteristic)
  ) {
    const sent = await sendEscPosToBtPrinter(testText);
    if (sent) {
      showToast(
        `Tes cetak berhasil dikirim ke ${btPrinterState.name || printerName}!`,
      );
      return;
    }
  }

  const dialog = document.getElementById("receipt-dialog");
  const paper = document.getElementById("thermal-receipt-paper");
  paper.className = `thermal-paper ${paperWidth === "80mm" ? "paper-80mm" : "paper-58mm"}`;
  paper.innerHTML = renderReceiptTextToHTML(testText);
  const historyBar = document.getElementById("receipt-history-selector-bar");
  if (historyBar) historyBar.hidden = true;
  currentReceiptText = testText;
  currentReceiptPhone = "";
  syncBtPrinterUI();
  if (!dialog.open) dialog.showModal();
}

function openReceiptDialog(type, record, historyList = null) {
  const dialog = document.getElementById("receipt-dialog");
  const paper = document.getElementById("thermal-receipt-paper");
  const historyBar = document.getElementById("receipt-history-selector-bar");
  const historySelect = document.getElementById("receipt-history-select");
  paper.className = `thermal-paper ${db.settings.paperWidth === "80mm" ? "paper-80mm" : "paper-58mm"}`;

  if (historyBar && historySelect) {
    if (Array.isArray(historyList) && historyList.length > 0) {
      historyBar.hidden = false;
      historySelect.innerHTML = "";
      historyList.forEach((item) => {
        const opt = document.createElement("option");
        opt.value = item.id;
        opt.textContent = `${item.ticketNo} • ${fmtDateTimeID(item.timestamp)} • ${fmtNum(item.nettoClean)} kg • ${fmtRp(item.netPaid)}`;
        if (item.id === record.id) opt.selected = true;
        historySelect.appendChild(opt);
      });
      historySelect.onchange = () => {
        const chosen = historyList.find((x) => x.id === historySelect.value);
        if (chosen) {
          openReceiptDialog(type, chosen, historyList);
        }
      };
    } else {
      historyBar.hidden = true;
    }
  }

  const isBuy = type === "BUY";
  const partnerFarmer = isBuy
    ? db.farmers.find((f) => f.id === record.farmerId)
    : null;
  currentReceiptPhone = partnerFarmer?.phone
    ? partnerFarmer.phone.replace(/[^0-9]/g, "")
    : "";
  if (currentReceiptPhone.startsWith("0")) {
    currentReceiptPhone = "62" + currentReceiptPhone.slice(1);
  }

  const cashierName = cleanCashierName(
    record.cashierName ||
      db.settings.cashierName ||
      currentUser?.fullName ||
      "Kasir",
  );
  const paymentLabel =
    record.paymentMethod === "Titip Saldo"
      ? "Pending"
      : record.paymentMethod || "Tunai";

  const driverOrFarmer =
    record.driver && record.driver !== "-" ? record.driver : record.farmerName;

  if (isBuy) {
    currentReceiptText = [
      `*${db.settings.ramName}*`,
      ...(db.settings.address ? [db.settings.address] : []),
      ...(db.settings.phone ? [`Telp: ${db.settings.phone}`] : []),
      `--------------------------------`,
      `*NOTA TIMBANGAN PEMBELIAN TBS*`,
      `--------------------------------`,
      `No. Tiket       : ${record.ticketNo}`,
      `Tanggal         : ${fmtDateOnlyID(record.timestamp)}`,
      `Waktu           : ${fmtTimeOnlyID(record.timestamp)}`,
      `Penimbang/Kasir : ${cashierName}`,
      `Petani          : ${record.farmerName}`,
      `No. Plat        : ${record.plate}`,
      `--------------------------------`,
      `Bruto           : ${fmtNum(record.bruto)} kg`,
      `Tara            : ${fmtNum(record.tara)} kg`,
      `Netto 1         : ${fmtNum(record.netto1)} kg`,
      `Potongan        : -${fmtNum(record.totalCutKg)} kg (${record.cutPercent}%)`,
      `*NETTO BERSIH   : ${fmtNum(record.nettoClean)} kg*`,
      `--------------------------------`,
      `Harga TBS       : ${fmtRp(record.pricePerKg)} /kg`,
      `Subtotal        : ${fmtRp(record.grossTotal)}`,
      `Pot. Bongkar    : -${fmtRp(record.unloadingCost)}`,
      `Pot. Kasbon     : -${fmtRp(record.loanDeduct)}`,
      `--------------------------------`,
      `*TOTAL BAYAR    : ${fmtRp(record.netPaid)}*`,
      `Keterangan Bayar: ${paymentLabel}`,
      ...(record.notes ? [`Catatan         : ${record.notes}`] : []),
      `--------------------------------`,
      `Penimbang/Kasir  : ${cashierName}`,
      `Petani/Sopir     : ${driverOrFarmer}`,
      `Tidak menerima TBS curian!`,
      `Terimakasih atas kerjasama Anda`,
    ].join("\n");
  } else {
    currentReceiptText = [
      `*${db.settings.ramName}*`,
      ...(db.settings.address ? [db.settings.address] : []),
      ...(db.settings.phone ? [`Telp: ${db.settings.phone}`] : []),
      `--------------------------------`,
      `*NOTA PENGIRIMAN DO PABRIK (PKS)*`,
      `--------------------------------`,
      `No. Tiket       : ${record.ticketNo}`,
      `No. DO          : ${record.doNumber}`,
      `Tanggal         : ${fmtDateOnlyID(record.timestamp)}`,
      `Waktu           : ${fmtTimeOnlyID(record.timestamp)}`,
      `Penimbang/Kasir : ${cashierName}`,
      `Pabrik PKS      : ${record.millName}`,
      `No. Plat        : ${record.plate}`,
      `--------------------------------`,
      `Bruto           : ${fmtNum(record.bruto)} kg`,
      `Tara            : ${fmtNum(record.tara)} kg`,
      `Netto           : ${fmtNum(record.netto1)} kg`,
      `Refraksi PKS    : -${fmtNum(record.totalCutKg)} kg (${record.cutPercent}%)`,
      `*NETTO PKS      : ${fmtNum(record.nettoClean)} kg*`,
      `--------------------------------`,
      `Harga DO        : ${fmtRp(record.pricePerKg)} /kg`,
      `Nilai Kotor     : ${fmtRp(record.grossTotal)}`,
      `Ongkos Angkut   : -${fmtRp(record.freightCost)}`,
      `Upah Muat       : -${fmtRp(record.loadingCost)}`,
      `--------------------------------`,
      `*BERSIH PKS     : ${fmtRp(record.netReceived)}*`,
      `Keterangan Bayar: ${record.saleStatus}`,
      ...(record.notes ? [`Catatan         : ${record.notes}`] : []),
      `--------------------------------`,
      `Penimbang/Kasir : (${cashierName})`,
      `Sopir Ekspedisi : (${record.driver})`,
      `Terimakasih atas kerjasama Anda.`,
    ].join("\n");
  }

  paper.innerHTML = renderReceiptTextToHTML(currentReceiptText);
  syncBtPrinterUI();
  if (!dialog.open) dialog.showModal();
}

function initReceiptActions() {
  document
    .getElementById("btn-print-thermal")
    .addEventListener("click", async () => {
      if (
        currentReceiptText &&
        (isNativeAndroidBt() ||
          (btPrinterState.connected && btPrinterState.characteristic))
      ) {
        if (
          isNativeAndroidBt() &&
          !btPrinterState.address &&
          !db.settings.btPrinterId
        ) {
          openNativeBtPrinterModal(async (dev) => {
            btPrinterState.connected = true;
            btPrinterState.name = dev.name || "Printer Thermal BT";
            btPrinterState.address = dev.address || "";
            db.settings.btPrinterName = btPrinterState.name;
            db.settings.btPrinterId = btPrinterState.address;
            saveDatabase();
            syncBtPrinterUI();
            const sent = await sendEscPosToBtPrinter(currentReceiptText);
            if (sent) {
              showToast(
                `Struk berhasil dicetak ke Printer Bluetooth (${btPrinterState.name})!`,
              );
            }
          });
          return;
        }
        const sent = await sendEscPosToBtPrinter(currentReceiptText);
        if (sent) {
          showToast(
            `Struk berhasil dicetak ke Printer Bluetooth (${btPrinterState.name || db.settings.btPrinterName || "Printer BT"})!`,
          );
          return;
        }
      }
      document.body.classList.add("print-receipt-mode");
      if (
        window.AndroidBluetooth &&
        typeof window.AndroidBluetooth.printSystemPage === "function"
      ) {
        window.AndroidBluetooth.printSystemPage("Struk_Timbangan_TBS");
      } else {
        window.print();
      }
    });

  const receiptPairBtn = document.getElementById("btn-receipt-pair-bt");
  if (receiptPairBtn) {
    receiptPairBtn.addEventListener("click", () => {
      pairBluetoothPrinter();
    });
  }

  document
    .getElementById("btn-refresh-bt-list")
    ?.addEventListener("click", () => {
      renderNativeBtPairedList();
      showToast("Daftar perangkat Bluetooth diperbarui.");
    });

  document
    .getElementById("btn-open-android-bt-settings")
    ?.addEventListener("click", () => {
      if (
        window.AndroidBluetooth &&
        typeof window.AndroidBluetooth.openBluetoothSettings === "function"
      ) {
        window.AndroidBluetooth.openBluetoothSettings();
      }
    });

  document.getElementById("btn-share-wa").addEventListener("click", () => {
    const encoded = encodeURIComponent(currentReceiptText);
    const waUrl = currentReceiptPhone
      ? `https://wa.me/${currentReceiptPhone}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  });

  document
    .getElementById("btn-copy-receipt")
    .addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(currentReceiptText);
        showToast("Teks nota berhasil disalin ke Clipboard!");
      } catch {
        showToast("Gagal menyalin otomatis.");
      }
    });
}

function escapeHTML(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ============================================================================
// 8. LAPORAN PEMBELIAN, PENJUALAN, SUSUT & LABA RUGI + EXPORT CSV
// ============================================================================
function getFilteredTransactions() {
  const startDate = document.getElementById("filter-start-date").value;
  const endDate = document.getElementById("filter-end-date").value;
  const partnerFilter = document.getElementById("filter-partner").value;
  const keyword = document
    .getElementById("filter-keyword")
    .value.trim()
    .toLowerCase();

  const purchases = db.purchases.filter((p) => {
    if (startDate && p.date < startDate) return false;
    if (endDate && p.date > endDate) return false;
    if (partnerFilter.startsWith("FARMER:")) {
      const fId = partnerFilter.split(":")[1];
      if (p.farmerId !== fId) return false;
    } else if (partnerFilter.startsWith("MILL:")) {
      return false;
    }
    if (keyword) {
      const hay =
        `${p.ticketNo} ${p.farmerName} ${p.plate} ${p.driver} ${p.notes}`.toLowerCase();
      if (!hay.includes(keyword)) return false;
    }
    return true;
  });

  const sales = db.sales.filter((s) => {
    if (startDate && s.date < startDate) return false;
    if (endDate && s.date > endDate) return false;
    if (partnerFilter.startsWith("MILL:")) {
      const mId = partnerFilter.split(":")[1];
      if (s.millId !== mId) return false;
    } else if (partnerFilter.startsWith("FARMER:")) {
      return false;
    }
    if (keyword) {
      const hay =
        `${s.ticketNo} ${s.doNumber} ${s.millName} ${s.plate} ${s.driver} ${s.notes}`.toLowerCase();
      if (!hay.includes(keyword)) return false;
    }
    return true;
  });

  return { purchases, sales };
}

function renderReports() {
  const { purchases, sales } = getFilteredTransactions();

  // KPI 1: Pembelian
  const buyTonnage = purchases.reduce((acc, p) => acc + p.nettoClean, 0);
  const buyCutKg = purchases.reduce((acc, p) => acc + p.totalCutKg, 0);
  const buyGrossRp = purchases.reduce((acc, p) => acc + p.grossTotal, 0);
  const buyLoanRp = purchases.reduce((acc, p) => acc + p.loanDeduct, 0);
  const buyAvgPrice = buyTonnage > 0 ? Math.round(buyGrossRp / buyTonnage) : 0;

  document.getElementById("kpi-buy-count").textContent =
    `${purchases.length} Transaksi`;
  document.getElementById("kpi-buy-tonnage").textContent =
    `${fmtNum(buyTonnage)} kg`;
  document.getElementById("kpi-buy-gross-rp").textContent = fmtRp(buyGrossRp);
  document.getElementById("kpi-buy-loan-rp").textContent = fmtRp(buyLoanRp);
  document.getElementById("kpi-buy-avg-price").textContent =
    `${fmtRp(buyAvgPrice)} /kg`;

  // KPI 2: Penjualan PKS
  const sellTonnage = sales.reduce((acc, s) => acc + s.nettoClean, 0);
  const sellCutKg = sales.reduce((acc, s) => acc + s.totalCutKg, 0);
  const sellGrossRp = sales.reduce((acc, s) => acc + s.grossTotal, 0);
  const sellNetRp = sales.reduce((acc, s) => acc + s.netReceived, 0);
  const sellCostRp = sales.reduce(
    (acc, s) => acc + s.freightCost + s.loadingCost,
    0,
  );
  const sellAvgPrice =
    sellTonnage > 0 ? Math.round(sellGrossRp / sellTonnage) : 0;

  document.getElementById("kpi-sell-count").textContent = `${sales.length} DO`;
  document.getElementById("kpi-sell-tonnage").textContent =
    `${fmtNum(sellTonnage)} kg`;
  document.getElementById("kpi-sell-net-rp").textContent = fmtRp(sellNetRp);
  document.getElementById("kpi-sell-cost-rp").textContent = fmtRp(sellCostRp);
  document.getElementById("kpi-sell-avg-price").textContent =
    `${fmtRp(sellAvgPrice)} /kg`;

  // KPI 3: Stok Lantai RAM & Susut
  const stockDiff = buyTonnage - sellTonnage;
  const refBuyPrice = buyAvgPrice || db.settings.defaultBuyPrice;
  const estimatedStockVal = Math.max(0, stockDiff * refBuyPrice);

  document.getElementById("kpi-stock-diff").textContent =
    `${fmtNum(stockDiff)} kg`;
  document.getElementById("kpi-buy-cut-kg").textContent =
    `${fmtNum(buyCutKg)} kg`;
  document.getElementById("kpi-sell-cut-kg").textContent =
    `${fmtNum(sellCutKg)} kg`;
  document.getElementById("kpi-stock-value").textContent =
    fmtRp(estimatedStockVal);

  const shrinkBadge = document.getElementById("kpi-shrink-badge");
  if (stockDiff > 0) {
    shrinkBadge.textContent = "Stok Tersedia di RAM";
    shrinkBadge.className = "badge badge-warning";
  } else if (stockDiff < 0) {
    shrinkBadge.textContent = "Surplus Kirim PKS";
    shrinkBadge.className = "badge badge-stable";
  } else {
    shrinkBadge.textContent = "Stok Habis Terkirim";
    shrinkBadge.className = "badge";
  }

  // KPI 4: Laba / Rugi Operasional
  const totalRevenueWithStock = sellNetRp + estimatedStockVal;
  const netProfit = totalRevenueWithStock - buyGrossRp;
  const spreadPerKg =
    sellAvgPrice > 0 && buyAvgPrice > 0 ? sellAvgPrice - buyAvgPrice : 0;
  const profitPct =
    buyGrossRp > 0 ? ((netProfit / buyGrossRp) * 100).toFixed(1) : "0.0";

  document.getElementById("kpi-margin-per-kg").textContent =
    `Spread: ${fmtRp(spreadPerKg)}/kg`;
  const profitEl = document.getElementById("kpi-net-profit");
  profitEl.textContent = fmtRp(netProfit);
  profitEl.className = `kpi-main-val ${netProfit >= 0 ? "text-success" : "text-danger"}`;
  document.getElementById("kpi-total-revenue").textContent = fmtRp(
    totalRevenueWithStock,
  );
  document.getElementById("kpi-total-cogs").textContent = fmtRp(buyGrossRp);
  document.getElementById("kpi-profit-percent").textContent = `${profitPct}%`;

  // Render Visual Comparison Chart
  const maxTon = Math.max(1, buyTonnage, sellTonnage);
  const buyTonPct = Math.min(100, Math.round((buyTonnage / maxTon) * 100));
  const sellTonPct = Math.min(100, Math.round((sellTonnage / maxTon) * 100));

  const maxRp = Math.max(1, buyGrossRp, sellNetRp);
  const buyRpPct = Math.min(100, Math.round((buyGrossRp / maxRp) * 100));
  const sellRpPct = Math.min(100, Math.round((sellNetRp / maxRp) * 100));

  document.getElementById("report-chart-container").innerHTML = `
    <div class="chart-bar-group">
      <div class="chart-bar-label">
        <span>Tonase Pembelian Bersih Petani</span>
        <strong>${fmtNum(buyTonnage)} kg</strong>
      </div>
      <div class="chart-bar-track">
        <div class="chart-bar-fill fill-buy" style="width: ${buyTonPct}%"></div>
      </div>
    </div>
    <div class="chart-bar-group">
      <div class="chart-bar-label">
        <span>Tonase Penjualan Diterima PKS</span>
        <strong>${fmtNum(sellTonnage)} kg</strong>
      </div>
      <div class="chart-bar-track">
        <div class="chart-bar-fill fill-sell" style="width: ${sellTonPct}%"></div>
      </div>
    </div>
    <div class="chart-bar-group">
      <div class="chart-bar-label">
        <span>Nilai Modal Pembelian TBS</span>
        <strong>${fmtRp(buyGrossRp)}</strong>
      </div>
      <div class="chart-bar-track">
        <div class="chart-bar-fill fill-buy" style="width: ${buyRpPct}%"></div>
      </div>
    </div>
    <div class="chart-bar-group">
      <div class="chart-bar-label">
        <span>Nilai Bersih Penjualan PKS</span>
        <strong>${fmtRp(sellNetRp)}</strong>
      </div>
      <div class="chart-bar-track">
        <div class="chart-bar-fill fill-sell" style="width: ${sellRpPct}%"></div>
      </div>
    </div>
  `;

  // Sub-tab counts
  document.getElementById("count-tab-beli").textContent = String(
    purchases.length,
  );
  document.getElementById("count-tab-jual").textContent = String(sales.length);

  // Render Table 1: Pembelian
  const tbodyBeli = document.getElementById("tbody-laporan-beli");
  tbodyBeli.innerHTML = "";
  if (purchases.length === 0) {
    tbodyBeli.innerHTML =
      '<tr class="empty-row"><th scope="row" colspan="9">Belum ada transaksi pembelian pada filter ini.</th></tr>';
  } else {
    purchases.forEach((p) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <th scope="row">
          <div class="cell-row-header">
            <span class="row-ticket-title">${escapeHTML(p.ticketNo)}</span>
            <small class="text-muted">${escapeHTML(fmtDateTimeID(p.timestamp))}</small>
          </div>
        </th>
        <td>
          <div class="cell-val">
            <strong>${escapeHTML(p.farmerName)}</strong>
            <small class="text-muted">${escapeHTML(p.plate)} (${escapeHTML(p.driver)})</small>
          </div>
        </td>
        <td><div class="cell-val">${fmtNum(p.bruto)} / ${fmtNum(p.tara)} kg</div></td>
        <td class="text-danger"><div class="cell-val">-${fmtNum(p.totalCutKg)} kg (${p.cutPercent}%)</div></td>
        <td><div class="cell-val"><strong>${fmtNum(p.nettoClean)} kg</strong></div></td>
        <td><div class="cell-val">${fmtRp(p.pricePerKg)}</div></td>
        <td>
          <div class="cell-val">
            <span>Bongkar: ${fmtRp(p.unloadingCost)}</span>
            <small class="text-muted">Kasbon: ${fmtRp(p.loanDeduct)}</small>
          </div>
        </td>
        <td>
          <div class="cell-val">
            <strong class="text-success">${fmtRp(p.netPaid)}</strong>
            <small class="text-muted">${escapeHTML(p.paymentMethod)}</small>
          </div>
        </td>
        <td>
          <div class="cell-val cell-actions">
            <button type="button" class="btn btn-outline btn-sm" data-print-buy="${escapeHTML(p.id)}">Struk</button>
            <button type="button" class="btn btn-danger-outline btn-sm" data-del-buy="${escapeHTML(p.id)}" aria-label="Hapus ${escapeHTML(p.ticketNo)}">Hapus</button>
          </div>
        </td>
      `;
      tbodyBeli.appendChild(tr);
    });
  }

  // Render Table 2: Penjualan PKS
  const tbodyJual = document.getElementById("tbody-laporan-jual");
  tbodyJual.innerHTML = "";
  if (sales.length === 0) {
    tbodyJual.innerHTML =
      '<tr class="empty-row"><th scope="row" colspan="9">Belum ada pengiriman PKS pada filter ini.</th></tr>';
  } else {
    sales.forEach((s) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <th scope="row">
          <div class="cell-row-header">
            <span class="row-ticket-title">${escapeHTML(s.doNumber)}</span>
            <small class="text-muted">${escapeHTML(s.ticketNo)} • ${escapeHTML(fmtDateTimeID(s.timestamp))}</small>
          </div>
        </th>
        <td>
          <div class="cell-val">
            <strong>${escapeHTML(s.millName)}</strong>
            <small class="text-muted">${escapeHTML(s.plate)} (${escapeHTML(s.driver)})</small>
          </div>
        </td>
        <td><div class="cell-val">${fmtNum(s.bruto)} / ${fmtNum(s.tara)} kg</div></td>
        <td class="text-danger"><div class="cell-val">-${fmtNum(s.totalCutKg)} kg (${s.cutPercent}%)</div></td>
        <td><div class="cell-val"><strong>${fmtNum(s.nettoClean)} kg</strong></div></td>
        <td><div class="cell-val">${fmtRp(s.pricePerKg)}</div></td>
        <td><div class="cell-val">${fmtRp(s.freightCost + s.loadingCost)}</div></td>
        <td>
          <div class="cell-val">
            <strong class="text-success">${fmtRp(s.netReceived)}</strong>
            <small class="text-muted">${escapeHTML(s.saleStatus)}</small>
          </div>
        </td>
        <td>
          <div class="cell-val cell-actions">
            <button type="button" class="btn btn-outline btn-sm" data-print-sell="${escapeHTML(s.id)}">Nota DO</button>
            <button type="button" class="btn btn-danger-outline btn-sm" data-del-sell="${escapeHTML(s.id)}" aria-label="Hapus ${escapeHTML(s.ticketNo)}">Hapus</button>
          </div>
        </td>
      `;
      tbodyJual.appendChild(tr);
    });
  }

  // Render Table 3: Rekap Per Petani & Per Pabrik
  const tbodyRekapPetani = document.getElementById("tbody-rekap-petani");
  tbodyRekapPetani.innerHTML = "";
  db.farmers.forEach((f) => {
    const fBuys = purchases.filter((p) => p.farmerId === f.id);
    const ton = fBuys.reduce((a, b) => a + b.nettoClean, 0);
    const val = fBuys.reduce((a, b) => a + b.grossTotal, 0);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <th scope="row"><div class="cell-row-header"><span class="row-ticket-title">${escapeHTML(f.name)}</span></div></th>
      <td><div class="cell-val">${fBuys.length} Truk</div></td>
      <td><div class="cell-val"><strong>${fmtNum(ton)} kg</strong></div></td>
      <td><div class="cell-val">${fmtRp(val)}</div></td>
      <td class="${f.loanBalance > 0 ? "text-danger" : ""}"><div class="cell-val"><strong>${fmtRp(f.loanBalance)}</strong></div></td>
    `;
    tbodyRekapPetani.appendChild(tr);
  });

  const tbodyRekapPabrik = document.getElementById("tbody-rekap-pabrik");
  tbodyRekapPabrik.innerHTML = "";
  db.mills.forEach((m) => {
    const mSales = sales.filter((s) => s.millId === m.id);
    const ton = mSales.reduce((a, b) => a + b.nettoClean, 0);
    const cost = mSales.reduce((a, b) => a + b.freightCost + b.loadingCost, 0);
    const net = mSales.reduce((a, b) => a + b.netReceived, 0);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <th scope="row"><div class="cell-row-header"><span class="row-ticket-title">${escapeHTML(m.name)}</span></div></th>
      <td><div class="cell-val">${mSales.length} DO</div></td>
      <td><div class="cell-val"><strong>${fmtNum(ton)} kg</strong></div></td>
      <td><div class="cell-val">${fmtRp(cost)}</div></td>
      <td class="text-success"><div class="cell-val"><strong>${fmtRp(net)}</strong></div></td>
    `;
    tbodyRekapPabrik.appendChild(tr);
  });
}

function initReportControls() {
  const filterForm = document.getElementById("form-filter-laporan");

  // Quick period buttons
  filterForm.querySelectorAll("[data-period]").forEach((btn) => {
    btn.addEventListener("click", () => {
      filterForm
        .querySelectorAll("[data-period]")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const p = btn.dataset.period;
      const startInput = document.getElementById("filter-start-date");
      const endInput = document.getElementById("filter-end-date");
      const nowISO = todayISO();

      if (p === "all") {
        startInput.value = "";
        endInput.value = "";
      } else if (p === "today") {
        startInput.value = nowISO;
        endInput.value = nowISO;
      } else if (p === "7days") {
        startInput.value = daysAgoISO(7);
        endInput.value = nowISO;
      } else if (p === "month") {
        startInput.value = nowISO.slice(0, 8) + "01";
        endInput.value = nowISO;
      }
      renderReports();
    });
  });

  filterForm.addEventListener("submit", (e) => {
    e.preventDefault();
    renderReports();
  });

  document.getElementById("btn-reset-filter").addEventListener("click", () => {
    filterForm.reset();
    filterForm
      .querySelectorAll("[data-period]")
      .forEach((b) => b.classList.remove("active"));
    filterForm.querySelector('[data-period="all"]').classList.add("active");
    renderReports();
  });

  // Sub-tabs switching
  const subtabs = [
    { btn: "tab-rep-beli", panel: "panel-rep-beli" },
    { btn: "tab-rep-jual", panel: "panel-rep-jual" },
    { btn: "tab-rep-rekap", panel: "panel-rep-rekap" },
  ];

  subtabs.forEach((t) => {
    document.getElementById(t.btn).addEventListener("click", () => {
      subtabs.forEach((other) => {
        const active = other.btn === t.btn;
        const b = document.getElementById(other.btn);
        const p = document.getElementById(other.panel);
        b.classList.toggle("active", active);
        b.setAttribute("aria-selected", String(active));
        p.hidden = !active;
      });
    });
  });

  // Delegated actions on report tables (Print receipt or Delete row)
  document.getElementById("view-laporan").addEventListener("click", (e) => {
    const printBuyBtn = e.target.closest("[data-print-buy]");
    if (printBuyBtn) {
      const rec = db.purchases.find(
        (p) => p.id === printBuyBtn.dataset.printBuy,
      );
      if (rec) openReceiptDialog("BUY", rec);
      return;
    }

    const printSellBtn = e.target.closest("[data-print-sell]");
    if (printSellBtn) {
      const rec = db.sales.find((s) => s.id === printSellBtn.dataset.printSell);
      if (rec) openReceiptDialog("SELL", rec);
      return;
    }

    const delBuyBtn = e.target.closest("[data-del-buy]");
    if (delBuyBtn) {
      markDeletedId(delBuyBtn.dataset.delBuy);
      db.purchases = db.purchases.filter(
        (p) => p.id !== delBuyBtn.dataset.delBuy,
      );
      saveDatabase();
      renderReports();
      renderPartnersView();
      syncHeaderAndDefaults();
      showToast("Data transaksi pembelian dihapus.");
      return;
    }

    const delSellBtn = e.target.closest("[data-del-sell]");
    if (delSellBtn) {
      markDeletedId(delSellBtn.dataset.delSell);
      db.sales = db.sales.filter((s) => s.id !== delSellBtn.dataset.delSell);
      saveDatabase();
      renderReports();
      renderPartnersView();
      syncHeaderAndDefaults();
      showToast("Data pengiriman PKS dihapus.");
    }
  });

  // Export CSV Pembelian
  document
    .getElementById("btn-export-beli-csv")
    .addEventListener("click", () => {
      const { purchases } = getFilteredTransactions();
      const headers = [
        "No Tiket",
        "Tanggal",
        "Petani",
        "No Polisi",
        "Sopir",
        "Bruto (kg)",
        "Tara (kg)",
        "Netto 1 (kg)",
        "Potongan (%)",
        "Total Potongan (kg)",
        "Netto Bersih (kg)",
        "Harga/kg (Rp)",
        "Subtotal Kotor (Rp)",
        "Biaya Bongkar (Rp)",
        "Potong Kasbon (Rp)",
        "Total Dibayar (Rp)",
        "Metode Bayar",
        "Catatan",
      ];
      const rows = purchases.map((p) => [
        p.ticketNo,
        p.date,
        p.farmerName,
        p.plate,
        p.driver,
        p.bruto,
        p.tara,
        p.netto1,
        p.cutPercent,
        p.totalCutKg,
        p.nettoClean,
        p.pricePerKg,
        p.grossTotal,
        p.unloadingCost,
        p.loanDeduct,
        p.netPaid,
        p.paymentMethod,
        p.notes || "",
      ]);
      downloadCSV(`Laporan_Pembelian_TBS_${todayISO()}.csv`, headers, rows);
    });

  // Export CSV Penjualan PKS
  document
    .getElementById("btn-export-jual-csv")
    .addEventListener("click", () => {
      const { sales } = getFilteredTransactions();
      const headers = [
        "No Tiket",
        "No DO",
        "Tanggal",
        "Pabrik PKS",
        "No Polisi",
        "Sopir",
        "Bruto (kg)",
        "Tara (kg)",
        "Netto Timbang (kg)",
        "Refraksi (%)",
        "Total Refraksi (kg)",
        "Netto PKS (kg)",
        "Harga DO (Rp)",
        "Nilai Kotor (Rp)",
        "Ongkos Angkut (Rp)",
        "Upah Muat (Rp)",
        "Total Bersih Diterima (Rp)",
        "Status DO",
        "Catatan",
      ];
      const rows = sales.map((s) => [
        s.ticketNo,
        s.doNumber,
        s.date,
        s.millName,
        s.plate,
        s.driver,
        s.bruto,
        s.tara,
        s.netto1,
        s.cutPercent,
        s.totalCutKg,
        s.nettoClean,
        s.pricePerKg,
        s.grossTotal,
        s.freightCost,
        s.loadingCost,
        s.netReceived,
        s.saleStatus,
        s.notes || "",
      ]);
      downloadCSV(`Laporan_Penjualan_PKS_${todayISO()}.csv`, headers, rows);
    });

  document.getElementById("btn-print-report").addEventListener("click", () => {
    document.body.classList.remove("print-receipt-mode");
    window.print();
  });
}

function downloadCSV(filename, headers, rows) {
  const escapeCell = (cell) => {
    const str = String(cell ?? "").replace(/"/g, '""');
    return `"${str}"`;
  };
  const csvContent =
    "\uFEFF" +
    [
      headers.map(escapeCell).join(";"),
      ...rows.map((r) => r.map(escapeCell).join(";")),
    ].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showToast(`File ${filename} berhasil diunduh.`);
}

// ============================================================================
// 9. MITRA (PETANI & PABRIK PKS) + MANAJEMEN KASBON
// ============================================================================
function openEditFarmer(farmer) {
  const farmerDialog = document.getElementById("farmer-dialog");
  if (!farmerDialog || !farmer) return;

  document.getElementById("farmer-dialog-title").textContent =
    "Edit Petani / Pemasok TBS";
  document.getElementById("edit-farmer-id").value = farmer.id;
  document.getElementById("new-farmer-name").value = farmer.name || "";
  document.getElementById("new-farmer-phone").value = farmer.phone || "";
  document.getElementById("new-farmer-plate").value = farmer.defaultPlate || "";
  document.getElementById("new-farmer-price").value =
    farmer.specialPrice > 0 ? String(farmer.specialPrice) : "";
  document.getElementById("new-farmer-loan").value = String(
    farmer.loanBalance || 0,
  );

  farmerDialog.showModal();
}

function renderPartnersView() {
  const farmersList = document.getElementById("farmers-cards-list");
  const millsList = document.getElementById("mills-cards-list");
  const totalLoan = db.farmers.reduce(
    (acc, f) => acc + (f.loanBalance || 0),
    0,
  );

  document.getElementById("total-kasbon-badge").textContent =
    `Total Piutang Kasbon: ${fmtRp(totalLoan)}`;

  farmersList.innerHTML = "";
  const isSuperadmin = currentUser?.role === "superadmin";

  db.farmers.forEach((f) => {
    const farmerPurchases = db.purchases.filter(
      (p) => p.farmerId === f.id || p.farmerName === f.name,
    );
    const latestTicket = farmerPurchases[0];

    const card = document.createElement("article");
    card.className = "partner-card";
    card.innerHTML = `
      <div class="partner-card-top">
        <strong>${escapeHTML(f.name)}</strong>
        <span class="badge ${f.loanBalance > 0 ? "badge-loan" : "badge-stable"}">
          Kasbon: ${fmtRp(f.loanBalance)}
        </span>
      </div>
      <div class="text-muted partner-card-meta">
        Plat: <strong>${escapeHTML(f.defaultPlate || "-")}</strong> • HP: ${escapeHTML(f.phone || "-")}
      </div>
      <div class="partner-card-price">
        Harga: <strong>${f.specialPrice > 0 ? fmtRp(f.specialPrice) + "/kg (Spesial)" : fmtRp(db.settings.defaultBuyPrice) + "/kg (Harian)"}</strong>
      </div>
      <div class="text-muted partner-card-history">
        Riwayat Timbang: <strong>${farmerPurchases.length} Transaksi</strong>${latestTicket ? ` • Terakhir: <strong>${escapeHTML(latestTicket.ticketNo)}</strong>` : ""}
      </div>
    `;

    const actions = document.createElement("div");
    actions.className = "toolbar partner-card-actions";

    if (isSuperadmin) {
      const reprintBtn = document.createElement("button");
      reprintBtn.type = "button";
      reprintBtn.className = "btn btn-secondary btn-sm";
      reprintBtn.textContent = "Cetak Ulang Struk";
      reprintBtn.addEventListener("click", () => {
        const currentPurchases = db.purchases.filter(
          (p) => p.farmerId === f.id || p.farmerName === f.name,
        );
        if (currentPurchases.length === 0) {
          showToast(
            `Petani "${f.name}" belum memiliki transaksi timbangan untuk dicetak ulang.`,
          );
          return;
        }
        openReceiptDialog("BUY", currentPurchases[0], currentPurchases);
      });
      actions.appendChild(reprintBtn);
    }

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "btn btn-outline btn-sm";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => openEditFarmer(f));

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "btn btn-danger-outline btn-sm";
    delBtn.textContent = "Hapus";
    delBtn.addEventListener("click", () => {
      markDeletedId(f.id);
      db.farmers = db.farmers.filter((item) => item.id !== f.id);
      saveDatabase();
      populatePartnerSelects();
      renderPartnersView();
      showToast(`Petani "${f.name}" berhasil dihapus.`);
    });

    actions.append(editBtn, delBtn);
    card.appendChild(actions);
    farmersList.appendChild(card);
  });

  millsList.innerHTML = "";
  db.mills.forEach((m) => {
    const card = document.createElement("article");
    card.className = "partner-card";
    card.innerHTML = `
      <div class="partner-card-top">
        <strong>${escapeHTML(m.name)}</strong>
        <span class="badge badge-stable">${fmtRp(m.price)} /kg</span>
      </div>
      <div class="text-muted partner-card-meta">
        Kode Kontrak DO: <strong>${escapeHTML(m.doPrefix || "-")}</strong>
      </div>
    `;
    millsList.appendChild(card);
  });
}

function initPartnerModals() {
  const farmerDialog = document.getElementById("farmer-dialog");
  const millDialog = document.getElementById("mill-dialog");
  const loanDialog = document.getElementById("loan-dialog");

  const openFarmer = () => {
    document.getElementById("form-add-farmer").reset();
    document.getElementById("edit-farmer-id").value = "";
    document.getElementById("farmer-dialog-title").textContent =
      "Tambah Petani / Pemasok TBS";
    farmerDialog.showModal();
  };
  const openMill = () => millDialog.showModal();
  const openLoan = () => {
    populatePartnerSelects();
    loanDialog.showModal();
  };

  document
    .getElementById("btn-add-farmer-quick")
    .addEventListener("click", openFarmer);
  document
    .getElementById("btn-open-farmer-modal")
    .addEventListener("click", openFarmer);
  document
    .getElementById("btn-cancel-farmer")
    .addEventListener("click", () => farmerDialog.close("cancel"));

  document
    .getElementById("btn-add-mill-quick")
    .addEventListener("click", openMill);
  document
    .getElementById("btn-open-mill-modal")
    .addEventListener("click", openMill);
  document
    .getElementById("btn-cancel-mill")
    .addEventListener("click", () => millDialog.close("cancel"));

  document
    .getElementById("btn-open-loan-modal")
    .addEventListener("click", openLoan);
  document
    .getElementById("btn-cancel-loan")
    .addEventListener("click", () => loanDialog.close("cancel"));

  document.getElementById("form-add-farmer").addEventListener("submit", (e) => {
    e.preventDefault();
    const editId = document.getElementById("edit-farmer-id").value;
    const name = document.getElementById("new-farmer-name").value.trim();
    if (!name) return;

    const phone = document.getElementById("new-farmer-phone").value.trim();
    const defaultPlate = document
      .getElementById("new-farmer-plate")
      .value.trim()
      .toUpperCase();
    const specialPrice = parseNum(
      document.getElementById("new-farmer-price").value,
    );
    const loanBalance = parseNum(
      document.getElementById("new-farmer-loan").value,
    );

    if (editId) {
      const target = db.farmers.find((f) => f.id === editId);
      if (target) {
        target.name = name;
        target.phone = phone;
        target.defaultPlate = defaultPlate;
        target.specialPrice = specialPrice;
        target.loanBalance = loanBalance;
        target.updatedAt = Date.now();
        saveDatabase();
        populatePartnerSelects();
        renderPartnersView();
        e.target.reset();
        document.getElementById("edit-farmer-id").value = "";
        farmerDialog.close("saved");
        showToast(`Data petani "${target.name}" berhasil diperbarui!`);
        return;
      }
    }

    const newFarmer = {
      id: "F-" + Date.now(),
      name,
      phone,
      defaultPlate,
      specialPrice,
      loanBalance,
      updatedAt: Date.now(),
    };

    db.farmers.push(newFarmer);
    saveDatabase();
    populatePartnerSelects();
    renderPartnersView();
    document.getElementById("beli-farmer").value = newFarmer.id;
    document.getElementById("beli-farmer").dispatchEvent(new Event("change"));
    e.target.reset();
    document.getElementById("edit-farmer-id").value = "";
    farmerDialog.close("saved");
    showToast(`Petani "${newFarmer.name}" berhasil ditambahkan!`);
  });

  document.getElementById("form-add-mill").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("new-mill-name").value.trim();
    const price = parseNum(document.getElementById("new-mill-price").value);
    if (!name || price <= 0) return;

    const newMill = {
      id: "M-" + Date.now(),
      name,
      doPrefix:
        document.getElementById("new-mill-code").value.trim().toUpperCase() ||
        "DO-PKS",
      price,
    };

    db.mills.push(newMill);
    saveDatabase();
    populatePartnerSelects();
    renderPartnersView();
    document.getElementById("jual-mill").value = newMill.id;
    document.getElementById("jual-mill").dispatchEvent(new Event("change"));
    e.target.reset();
    millDialog.close("saved");
    showToast(`Pabrik PKS "${newMill.name}" berhasil ditambahkan!`);
  });

  document
    .getElementById("form-loan-mutation")
    .addEventListener("submit", (e) => {
      e.preventDefault();
      const farmerId = document.getElementById("loan-farmer-select").value;
      const farmer = db.farmers.find((f) => f.id === farmerId);
      const amount = parseNum(
        document.getElementById("loan-amount-input").value,
      );
      const typeRadio = e.target.querySelector(
        'input[name="loanType"]:checked',
      );
      const type = typeRadio ? typeRadio.value : "ADD";

      if (!farmer || amount <= 0) return;

      if (type === "ADD") {
        farmer.loanBalance = (farmer.loanBalance || 0) + amount;
        showToast(`Kasbon ${farmer.name} bertambah ${fmtRp(amount)}.`);
      } else {
        farmer.loanBalance = Math.max(0, (farmer.loanBalance || 0) - amount);
        showToast(
          `Pembayaran kasbon ${farmer.name} sebesar ${fmtRp(amount)} dicatat.`,
        );
      }
      farmer.updatedAt = Date.now();

      saveDatabase();
      populatePartnerSelects();
      renderPartnersView();
      e.target.reset();
      loanDialog.close("saved");
    });
}

// ============================================================================
// 10. PENGATURAN RAM & BACKUP / RESTORE OFFLINE
// ============================================================================
function populateSettingsForm() {
  document.getElementById("set-ram-name").value = db.settings.ramName || "";
  document.getElementById("set-cashier").value = db.settings.cashierName || "";
  document.getElementById("set-address").value = db.settings.address || "";
  document.getElementById("set-phone").value = db.settings.phone || "";
  document.getElementById("set-default-buy-price").value = String(
    db.settings.defaultBuyPrice || 2650,
  );
  document.getElementById("set-default-cut").value = String(
    db.settings.defaultCutPercent ?? 4,
  );
  document.getElementById("set-default-unloading").value = String(
    db.settings.defaultUnloadingRate ?? 15,
  );

  const paperRadio = document.querySelector(
    `input[name="paperWidth"][value="${db.settings.paperWidth || "58mm"}"]`,
  );
  if (paperRadio) paperRadio.checked = true;

  const scaleRadioVal = db.settings.showScalePanel ? "true" : "false";
  const scaleRadio = document.querySelector(
    `input[name="showScalePanel"][value="${scaleRadioVal}"]`,
  );
  if (scaleRadio) scaleRadio.checked = true;

  syncBtPrinterUI();
}

function initSettingsAndBackup() {
  document.getElementById("btn-quick-price").addEventListener("click", () => {
    switchTab("view-setelan");
    document.getElementById("set-default-buy-price").focus();
  });

  const pairPrinterBtn = document.getElementById("btn-pair-bt-printer");
  if (pairPrinterBtn) {
    pairPrinterBtn.addEventListener("click", () => {
      pairBluetoothPrinter();
    });
  }

  const testPrinterBtn = document.getElementById("btn-test-bt-printer");
  if (testPrinterBtn) {
    testPrinterBtn.addEventListener("click", () => {
      testPrintBluetoothPrinter();
    });
  }

  const disconnectPrinterBtn = document.getElementById(
    "btn-disconnect-bt-printer",
  );
  if (disconnectPrinterBtn) {
    disconnectPrinterBtn.addEventListener("click", () => {
      disconnectBluetoothPrinter();
    });
  }

  document.querySelectorAll('input[name="showScalePanel"]').forEach((radio) => {
    radio.addEventListener("change", (e) => {
      db.settings.showScalePanel = e.target.value === "true";
      saveDatabase();
      syncScalePanelVisibility();
      showToast(
        db.settings.showScalePanel
          ? "Panel Indikator Timbangan Digital ditampilkan."
          : "Panel Indikator Timbangan Digital disembunyikan.",
      );
    });
  });

  document.getElementById("form-settings").addEventListener("submit", (e) => {
    e.preventDefault();
    const paperRadio = e.target.querySelector(
      'input[name="paperWidth"]:checked',
    );
    const scaleRadio = document.querySelector(
      'input[name="showScalePanel"]:checked',
    );
    db.settings = {
      ramName:
        document.getElementById("set-ram-name").value.trim() ||
        "RAM SAWIT MAKMUR JAYA",
      cashierName:
        document.getElementById("set-cashier").value.trim() || "Kasir",
      address: document.getElementById("set-address").value.trim(),
      phone: document.getElementById("set-phone").value.trim(),
      defaultBuyPrice:
        parseNum(document.getElementById("set-default-buy-price").value) ||
        2650,
      defaultCutPercent: parseNum(
        document.getElementById("set-default-cut").value,
      ),
      defaultUnloadingRate: parseNum(
        document.getElementById("set-default-unloading").value,
      ),
      paperWidth: paperRadio ? paperRadio.value : "58mm",
      showScalePanel: scaleRadio
        ? scaleRadio.value === "true"
        : Boolean(db.settings.showScalePanel),
      btPrinterName: db.settings.btPrinterName || "",
      btPrinterId: db.settings.btPrinterId || "",
      updatedAt: Date.now(),
    };

    saveDatabase();
    syncHeaderAndDefaults();
    syncScalePanelVisibility();
    syncBtPrinterUI();
    populatePartnerSelects();
    resetBeliForm();
    showToast("Pengaturan RAM & Harga Harian berhasil disimpan!");
  });

  // Backup JSON
  document.getElementById("btn-backup-json").addEventListener("click", () => {
    const json = JSON.stringify(db, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Backup_Timbangan_TBS_${todayISO()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast("File Backup JSON berhasil diunduh.");
  });

  // Restore JSON
  document
    .getElementById("input-restore-json")
    .addEventListener("change", async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        if (
          !parsed.settings ||
          !Array.isArray(parsed.purchases) ||
          !Array.isArray(parsed.sales)
        ) {
          throw new Error("Format file backup tidak valid");
        }
        db = parsed;
        syncConfig.deletedIds = {};
        saveSyncConfig();
        saveDatabase(db, { skipSync: true });
        syncWithServer("overwrite", { silent: true });
        syncHeaderAndDefaults();
        syncScalePanelVisibility();
        populatePartnerSelects();
        renderPendingTrucks();
        populateSettingsForm();
        showToast("Database berhasil dipulihkan dari file backup!");
      } catch {
        showToast("Gagal memulihkan data: File JSON tidak sesuai format.");
      } finally {
        e.target.value = "";
      }
    });

  // Reset Demo Data
  document
    .getElementById("btn-reset-demo-data")
    .addEventListener("click", () => {
      db = createInitialDatabase();
      syncConfig.deletedIds = {};
      saveSyncConfig();
      saveDatabase(db, { skipSync: true });
      syncWithServer("overwrite", { silent: true });
      syncHeaderAndDefaults();
      syncScalePanelVisibility();
      populatePartnerSelects();
      renderPendingTrucks();
      populateSettingsForm();
      showToast("Data contoh berhasil dimuat ulang!");
    });

  // Clear All Transactions
  document
    .getElementById("btn-clear-all-data")
    .addEventListener("click", () => {
      (db.purchases || []).forEach((p) => markDeletedId(p.id));
      (db.sales || []).forEach((s) => markDeletedId(s.id));
      (db.pendingTrucks || []).forEach((t) => markDeletedId(t.id));
      db.purchases = [];
      db.sales = [];
      db.pendingTrucks = [];
      saveDatabase(db, { skipSync: true });
      syncWithServer("overwrite", { silent: true });
      syncHeaderAndDefaults();
      renderPendingTrucks();
      renderReports();
      showToast("Semua riwayat transaksi telah dikosongkan.");
    });
}

// ============================================================================
// 11. SINKRONISASI DATA MOBILE APK <-> DESKTOP (REAL-TIME WI-FI / LAN)
// ============================================================================
function resolveSyncEndpointUrl(pathSuffix) {
  const customBase = normalizeServerUrl(syncConfig.serverUrl);
  if (customBase) {
    return `${customBase}${pathSuffix}`;
  }
  if (isNativeAndroidApp()) {
    return `http://192.168.3.180:5173${pathSuffix}`;
  }
  return pathSuffix;
}

async function callSyncApi(pathSuffix, method = "GET", payload = null) {
  const targetUrl = resolveSyncEndpointUrl(pathSuffix);
  const bodyStr = payload ? JSON.stringify(payload) : null;

  // Prefer Native Android HTTP bridge when calling external LAN http:// from APK
  if (
    window.AndroidBluetooth &&
    typeof window.AndroidBluetooth.syncHttpRequest === "function" &&
    /^https?:\/\//i.test(targetUrl)
  ) {
    const raw = window.AndroidBluetooth.syncHttpRequest(
      targetUrl,
      method,
      bodyStr || "",
    );
    return JSON.parse(raw || "{}");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);
  try {
    const res = await fetch(targetUrl, {
      method,
      headers: bodyStr
        ? { "Content-Type": "application/json", Accept: "application/json" }
        : { Accept: "application/json" },
      body: bodyStr,
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

function updateSyncUI() {
  const dot = document.getElementById("header-sync-dot");
  const headerLabel = document.getElementById("header-sync-label");
  const cardBadge = document.getElementById("sync-card-status-badge");
  const modalBadge = document.getElementById("sync-modal-status-badge");
  const lastHint = document.getElementById("sync-last-time-hint");
  const modalLastHint = document.getElementById("sync-modal-last-hint");

  const status = syncState.status;
  if (dot) {
    dot.className = `sync-dot ${status === "online" ? "online" : status === "syncing" ? "syncing" : "offline"}`;
  }
  if (headerLabel) {
    headerLabel.textContent =
      status === "syncing"
        ? "Sinkron..."
        : status === "online"
          ? "Sinkron Aktif"
          : "Sinkron";
  }

  const badgeText =
    status === "online"
      ? `Terhubung (Rev #${syncConfig.lastRevision || 1})`
      : status === "syncing"
        ? "Menyinkronkan..."
        : "Offline / Lokal";
  const badgeClass =
    status === "online"
      ? "badge badge-stable"
      : status === "syncing"
        ? "badge badge-warning"
        : "badge badge-loan";

  if (cardBadge) {
    cardBadge.className = badgeClass;
    cardBadge.textContent = badgeText;
  }
  if (modalBadge) {
    modalBadge.className = badgeClass;
    modalBadge.textContent = badgeText;
  }

  const timeText = syncConfig.lastSyncAt
    ? `Sinkron terakhir: ${fmtDateTimeID(syncConfig.lastSyncAt)} (Revisi #${syncConfig.lastRevision || 1})`
    : "Pastikan HP Android dan Desktop berada di jaringan Wi-Fi / Hotspot yang sama.";
  if (lastHint) lastHint.textContent = timeText;
  if (modalLastHint) modalLastHint.textContent = timeText;

  const primaryLan = syncState.lanUrls?.[0] || "";
  const lanBox = document.getElementById("sync-lan-info-box");
  const lanDisplay = document.getElementById("sync-lan-url-display");
  const modalLanBox = document.getElementById("sync-modal-lan-box");
  const modalLanUrl = document.getElementById("sync-modal-lan-url");

  if (primaryLan) {
    if (lanBox && lanDisplay) {
      lanBox.hidden = false;
      lanDisplay.textContent = primaryLan;
    }
    if (modalLanBox && modalLanUrl) {
      modalLanBox.hidden = false;
      modalLanUrl.textContent = primaryLan;
    }
  }

  const settingsUrlInput = document.getElementById("sync-server-url-input");
  const modalUrlInput = document.getElementById("sync-modal-url-input");
  const displayUrl = syncConfig.serverUrl || primaryLan || "";

  if (settingsUrlInput && document.activeElement !== settingsUrlInput) {
    settingsUrlInput.value = displayUrl;
  }
  if (modalUrlInput && document.activeElement !== modalUrlInput) {
    modalUrlInput.value = displayUrl;
  }

  const autoRadio = document.querySelector(
    `input[name="syncAutoMode"][value="${syncConfig.autoSync ? "true" : "false"}"]`,
  );
  if (autoRadio) autoRadio.checked = true;
}

function applySyncedDatabase(remoteData, remoteDeletedIds) {
  if (!remoteData || typeof remoteData !== "object") return false;

  if (remoteDeletedIds && typeof remoteDeletedIds === "object") {
    syncConfig.deletedIds = {
      ...(syncConfig.deletedIds || {}),
      ...remoteDeletedIds,
    };
  }

  const prevJson = JSON.stringify(db);
  const localBtName = db.settings?.btPrinterName || "";
  const localBtId = db.settings?.btPrinterId || "";

  db = {
    settings: {
      ...(db.settings || {}),
      ...(remoteData.settings || {}),
      btPrinterName: localBtName || remoteData.settings?.btPrinterName || "",
      btPrinterId: localBtId || remoteData.settings?.btPrinterId || "",
    },
    farmers: Array.isArray(remoteData.farmers)
      ? remoteData.farmers
      : db.farmers,
    mills: Array.isArray(remoteData.mills) ? remoteData.mills : db.mills,
    pendingTrucks: Array.isArray(remoteData.pendingTrucks)
      ? remoteData.pendingTrucks
      : db.pendingTrucks,
    purchases: Array.isArray(remoteData.purchases)
      ? remoteData.purchases
      : db.purchases,
    sales: Array.isArray(remoteData.sales) ? remoteData.sales : db.sales,
    users:
      Array.isArray(remoteData.users) && remoteData.users.length > 0
        ? remoteData.users
        : db.users,
  };

  const nextJson = JSON.stringify(db);
  const hasChanged = prevJson !== nextJson;

  if (hasChanged) {
    saveDatabase(db, { fromSync: true });
    syncHeaderAndDefaults();
    syncScalePanelVisibility();
    populatePartnerSelects();
    renderPendingTrucks();
    renderPartnersView();
    renderReports();
    renderUsersList();
    populateSettingsForm();
  }

  return hasChanged;
}

async function syncWithServer(mode = "merge", options = {}) {
  if (syncState.inFlight) return false;
  syncState.inFlight = true;
  syncState.status = "syncing";
  updateSyncUI();

  try {
    const res = await callSyncApi("/api/sync", "POST", {
      mode,
      deletedIds: syncConfig.deletedIds || {},
      data: db,
    });

    if (!res || !res.ok) {
      throw new Error(res?.message || "Gagal menyinkronkan data");
    }

    if (Array.isArray(res.lanUrls) && res.lanUrls.length > 0) {
      syncState.lanUrls = res.lanUrls;
    }

    if (mode === "overwrite") {
      syncConfig.lastRevision = Number(res.revision) || 1;
      syncConfig.lastSyncAt = res.updatedAt || new Date().toISOString();
      saveSyncConfig();
    } else if (res.data) {
      const updatedUi = applySyncedDatabase(res.data, res.deletedIds);
      syncConfig.lastRevision = Number(res.revision) || 1;
      syncConfig.lastSyncAt = res.updatedAt || new Date().toISOString();
      saveSyncConfig();
      if (updatedUi && options.silent) {
        showToast("Data terbaru otomatis disinkronkan dari perangkat lain.");
      }
    }

    syncState.status = "online";
    updateSyncUI();

    if (!options.silent) {
      const actionMsg =
        mode === "pull"
          ? "Data berhasil diambil dari Server Desktop!"
          : mode === "overwrite"
            ? "Data perangkat ini berhasil dikirim ke Server Desktop!"
            : "Sinkronisasi 2 arah (Mobile APK ↔ Desktop) berhasil!";
      showToast(actionMsg);
    }
    return true;
  } catch {
    syncState.status = "offline";
    updateSyncUI();
    if (!options.silent) {
      showToast(
        "Server Desktop belum terjangkau. Pastikan server aktif & alamat IP Wi-Fi benar.",
      );
    }
    return false;
  } finally {
    syncState.inFlight = false;
  }
}

async function pollServerRevision() {
  if (syncState.inFlight || !syncConfig.autoSync || document.hidden) return;
  try {
    const info = await callSyncApi("/api/sync/info", "GET");
    if (info && info.ok) {
      if (Array.isArray(info.lanUrls) && info.lanUrls.length > 0) {
        syncState.lanUrls = info.lanUrls;
      }
      const remoteRev = Number(info.revision) || 0;
      if (
        !info.hasData ||
        remoteRev !== syncConfig.lastRevision ||
        syncState.status !== "online"
      ) {
        await syncWithServer("merge", { silent: true });
      } else {
        syncState.status = "online";
        updateSyncUI();
      }
    }
  } catch {
    if (syncState.status !== "offline") {
      syncState.status = "offline";
      updateSyncUI();
    }
  }
}

function mergeArrayItemsById(
  localArr = [],
  remoteArr = [],
  deletedIds = {},
  sortByTimeDesc = false,
) {
  const map = new Map();
  for (const item of localArr) {
    if (!item || !item.id || deletedIds[item.id]) continue;
    map.set(item.id, item);
  }
  for (const item of remoteArr) {
    if (!item || !item.id || deletedIds[item.id]) continue;
    const existing = map.get(item.id);
    if (!existing) {
      map.set(item.id, item);
    } else {
      const localTime = Number(existing.updatedAt || 0);
      const remoteTime = Number(item.updatedAt || 0);
      if (remoteTime >= localTime) {
        map.set(item.id, { ...existing, ...item });
      }
    }
  }
  const list = Array.from(map.values());
  if (sortByTimeDesc) {
    list.sort((a, b) => {
      const tA = a.timestamp || a.timeIn || a.date || "";
      const tB = b.timestamp || b.timeIn || b.date || "";
      return String(tB).localeCompare(String(tA));
    });
  }
  return list;
}

function mergeWithIncomingSyncPayload(rawPayload) {
  if (!rawPayload || typeof rawPayload !== "object") return false;
  const incomingData =
    rawPayload.data && typeof rawPayload.data === "object"
      ? rawPayload.data
      : rawPayload.settings && Array.isArray(rawPayload.purchases)
        ? rawPayload
        : null;
  if (!incomingData) return false;

  const incomingDeleted =
    rawPayload.deletedIds && typeof rawPayload.deletedIds === "object"
      ? rawPayload.deletedIds
      : {};

  const mergedDeleted = {
    ...(syncConfig.deletedIds || {}),
    ...incomingDeleted,
  };
  syncConfig.deletedIds = mergedDeleted;
  saveSyncConfig();

  const localSettingsTime = Number(db.settings?.updatedAt || 0);
  const remoteSettingsTime = Number(incomingData.settings?.updatedAt || 0);
  const mergedSettings =
    remoteSettingsTime >= localSettingsTime
      ? { ...(db.settings || {}), ...(incomingData.settings || {}) }
      : { ...(incomingData.settings || {}), ...(db.settings || {}) };

  const mergedDb = {
    settings: mergedSettings,
    farmers: mergeArrayItemsById(
      db.farmers,
      incomingData.farmers,
      mergedDeleted,
      false,
    ),
    mills: mergeArrayItemsById(
      db.mills,
      incomingData.mills,
      mergedDeleted,
      false,
    ),
    pendingTrucks: mergeArrayItemsById(
      db.pendingTrucks,
      incomingData.pendingTrucks,
      mergedDeleted,
      true,
    ),
    purchases: mergeArrayItemsById(
      db.purchases,
      incomingData.purchases,
      mergedDeleted,
      true,
    ),
    sales: mergeArrayItemsById(
      db.sales,
      incomingData.sales,
      mergedDeleted,
      true,
    ),
    users: mergeArrayItemsById(
      db.users,
      incomingData.users,
      mergedDeleted,
      false,
    ),
  };

  applySyncedDatabase(mergedDb, mergedDeleted);
  saveDatabase(db);
  return true;
}

// Callback invoked by Native Android Bluetooth RFCOMM Server when PC connects
window.__onNativeBtSyncReceived = (base64Payload) => {
  try {
    const jsonStr = decodeURIComponent(
      Array.prototype.map
        .call(
          atob(base64Payload),
          (c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2),
        )
        .join(""),
    );
    const parsed = JSON.parse(jsonStr);
    if (mergeWithIncomingSyncPayload(parsed)) {
      syncConfig.lastSyncAt = new Date().toISOString();
      saveSyncConfig();
      updateSyncUI();
      showToast(
        "Sinkronisasi Bluetooth langsung dari PC berhasil digabungkan!",
      );
    }
  } catch {
    showToast("Menerima sinyal Bluetooth dari PC.");
  }
};

async function syncDirectViaBluetooth() {
  const localEnvelope = JSON.stringify({
    deletedIds: syncConfig.deletedIds || {},
    data: db,
  });

  // 1. Native Android APK: Start RFCOMM Server & allow picking paired PC Bluetooth
  if (
    window.AndroidBluetooth &&
    typeof window.AndroidBluetooth.syncViaBluetoothDevice === "function"
  ) {
    try {
      window.AndroidBluetooth.startBtSyncServer(localEnvelope);
    } catch {
      // Ignore
    }
    openNativeBtPrinterModal((dev) => {
      showToast(
        `Menghubungkan sinkronisasi Bluetooth ke ${dev.name || "PC"}...`,
      );
      setTimeout(() => {
        try {
          const raw = window.AndroidBluetooth.syncViaBluetoothDevice(
            dev.address,
            localEnvelope,
          );
          const res = JSON.parse(raw || "{}");
          if (res.ok) {
            if (res.remotePayload) {
              try {
                const remoteObj = JSON.parse(res.remotePayload);
                mergeWithIncomingSyncPayload(remoteObj);
              } catch {
                // Ignore parse error
              }
            }
            syncConfig.lastSyncAt = new Date().toISOString();
            saveSyncConfig();
            updateSyncUI();
            showToast(
              `Sinkronisasi Bluetooth ke ${res.deviceName || dev.name || "PC"} berhasil!`,
            );
          } else {
            // Fallback to native Android Bluetooth File Share to PC
            showToast(
              "Mengirim paket sinkronisasi ke PC melalui Bluetooth File Transfer...",
            );
            sendSyncFileViaBluetooth();
          }
        } catch {
          sendSyncFileViaBluetooth();
        }
      }, 150);
    });
    return;
  }

  // 2. Desktop PC Browser (Chrome / Edge): Use Web Serial API to connect to HP Bluetooth COM Port
  if ("serial" in navigator) {
    let port = null;
    try {
      try {
        port = await navigator.serial.requestPort({
          allowedBluetoothServiceClassIds: [
            "00001101-0000-1000-8000-00805f9b34fb",
          ],
        });
      } catch {
        port = await navigator.serial.requestPort();
      }
      await port.open({ baudRate: 115200 });
      showToast("Terhubung ke Bluetooth Serial HP! Mengirim & menerima data...");

      const encoder = new TextEncoder();
      const writer = port.writable.getWriter();
      await writer.write(encoder.encode(`SAWITSYNC_REQ:${localEnvelope}\n`));
      writer.releaseLock();

      const reader = port.readable.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      const timeoutId = setTimeout(() => {
        try {
          reader.cancel();
        } catch {
          // Ignore
        }
      }, 6500);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        if (buffer.includes("\n")) break;
      }
      clearTimeout(timeoutId);
      reader.releaseLock();
      await port.close();

      const resLine = buffer
        .split("\n")
        .find((l) => l.startsWith("SAWITSYNC_RES:") || l.startsWith("SAWITSYNC_REQ:"));
      if (resLine) {
        const jsonPart = resLine.replace(/^SAWITSYNC_(RES|REQ):/, "");
        const parsed = JSON.parse(jsonPart);
        if (mergeWithIncomingSyncPayload(parsed)) {
          syncConfig.lastSyncAt = new Date().toISOString();
          saveSyncConfig();
          updateSyncUI();
          showToast(
            "Sinkronisasi 2 arah via Bluetooth (HP ↔ PC) berhasil digabungkan!",
          );
          return;
        }
      }
      showToast("Data sinkronisasi berhasil dikirim melalui port Bluetooth!");
      return;
    } catch (err) {
      try {
        if (port) await port.close();
      } catch {
        // Ignore
      }
      if (err && err.name === "NotFoundError") {
        showToast("Pemilihan perangkat Bluetooth Serial dibatalkan.");
        return;
      }
      showToast(
        "Pastikan HP sudah di-pair di Bluetooth PC atau gunakan tombol '1. Terima Bluetooth di PC' & 'Kirim Data via Bluetooth'.",
      );
      return;
    }
  }

  showToast(
    "Gunakan tombol 'Kirim Data via Bluetooth' di HP dan 'Gabung File Bluetooth' di PC.",
  );
}

async function sendSyncFileViaBluetooth() {
  const fileName = `Sinkron_Timbangan_TBS_${todayISO()}.json`;
  const payloadStr = JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      deletedIds: syncConfig.deletedIds || {},
      data: db,
    },
    null,
    2,
  );

  // 1. Native Android APK: Launch Android Bluetooth File Transfer directly
  if (
    window.AndroidBluetooth &&
    typeof window.AndroidBluetooth.shareSyncFileViaBluetooth === "function"
  ) {
    try {
      const raw = window.AndroidBluetooth.shareSyncFileViaBluetooth(
        payloadStr,
        fileName,
      );
      const res = JSON.parse(raw || "{}");
      if (res.ok) {
        showToast(
          "Pilih perangkat Bluetooth PC/Laptop Anda untuk mengirim data sinkronisasi.",
        );
        return;
      }
    } catch {
      // Fallback below
    }
  }

  // 2. Web Share API with file support (Mobile browsers)
  const blob = new Blob([payloadStr], { type: "application/json" });
  const file = new File([blob], fileName, { type: "application/json" });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title: "Sinkronisasi Data Timbangan TBS",
        text: "Pilih Bluetooth untuk mengirim data sinkronisasi ke PC/HP",
        files: [file],
      });
      return;
    } catch {
      // Fallback to download
    }
  }

  // 3. Fallback: Download sync file
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showToast(
    `File ${fileName} siap dikirim via Bluetooth ke perangkat tujuan.`,
  );
}

async function openWindowsBluetoothReceiver() {
  try {
    const res = await callSyncApi("/api/sync/open-bt-receiver", "POST", {});
    if (res && res.ok) {
      showToast(
        "Jendela 'Terima File Bluetooth' Windows telah dibuka di PC! Silakan kirim dari HP.",
      );
    } else {
      showToast(
        res?.message ||
          "Klik ikon Bluetooth di pojok kanan bawah Windows lalu pilih 'Receive a File'.",
      );
    }
  } catch {
    showToast(
      "Di PC Windows, klik kanan ikon Bluetooth di taskbar lalu pilih 'Receive a File / Terima File'.",
    );
  }
}

async function handleBluetoothMergeFileInput(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const ok = mergeWithIncomingSyncPayload(parsed);
    if (!ok) {
      throw new Error("Format file tidak sesuai");
    }
    syncConfig.lastSyncAt = new Date().toISOString();
    saveSyncConfig();
    updateSyncUI();
    showToast(
      `Data Bluetooth dari "${file.name}" berhasil digabungkan (${db.purchases.length} Beli, ${db.sales.length} Jual, ${db.farmers.length} Petani)!`,
    );
  } catch {
    showToast("Gagal menggabungkan file Bluetooth: pastikan file berformat .JSON dari aplikasi ini.");
  } finally {
    e.target.value = "";
  }
}

function initSyncAndPolling() {
  const syncDialog = document.getElementById("sync-dialog");
  const headerSyncBtn = document.getElementById("btn-header-sync");
  const settingsUrlInput = document.getElementById("sync-server-url-input");
  const modalUrlInput = document.getElementById("sync-modal-url-input");

  const saveUrlFromInput = (inputEl) => {
    if (!inputEl) return;
    const normalized = normalizeServerUrl(inputEl.value);
    syncConfig.serverUrl = normalized;
    saveSyncConfig();
    updateSyncUI();
  };

  if (settingsUrlInput) {
    settingsUrlInput.addEventListener("change", () =>
      saveUrlFromInput(settingsUrlInput),
    );
  }
  if (modalUrlInput) {
    modalUrlInput.addEventListener("change", () =>
      saveUrlFromInput(modalUrlInput),
    );
  }

  document.querySelectorAll('input[name="syncAutoMode"]').forEach((radio) => {
    radio.addEventListener("change", (e) => {
      syncConfig.autoSync = e.target.value === "true";
      saveSyncConfig();
      updateSyncUI();
      showToast(
        syncConfig.autoSync
          ? "Sinkronisasi Otomatis (Real-Time) diaktifkan."
          : "Mode Sinkronisasi Manual dipilih.",
      );
      if (syncConfig.autoSync) {
        syncWithServer("merge", { silent: true });
      }
    });
  });

  if (headerSyncBtn && syncDialog) {
    headerSyncBtn.addEventListener("click", () => {
      updateSyncUI();
      syncDialog.showModal();
      pollServerRevision();
    });
  }

  const copyLanAddress = async () => {
    const addr =
      syncState.lanUrls?.[0] ||
      normalizeServerUrl(syncConfig.serverUrl) ||
      window.location.origin;
    try {
      await navigator.clipboard.writeText(addr);
      showToast(`Alamat server disalin: ${addr}`);
    } catch {
      showToast(`Alamat server: ${addr}`);
    }
  };

  document
    .getElementById("btn-copy-lan-url")
    ?.addEventListener("click", copyLanAddress);
  document
    .getElementById("btn-modal-copy-lan")
    ?.addEventListener("click", copyLanAddress);

  document
    .getElementById("btn-sync-merge-settings")
    ?.addEventListener("click", () => {
      saveUrlFromInput(settingsUrlInput);
      syncWithServer("merge", { silent: false });
    });
  document
    .getElementById("btn-sync-pull-settings")
    ?.addEventListener("click", () => {
      saveUrlFromInput(settingsUrlInput);
      syncWithServer("pull", { silent: false });
    });
  document
    .getElementById("btn-sync-push-settings")
    ?.addEventListener("click", () => {
      saveUrlFromInput(settingsUrlInput);
      syncWithServer("overwrite", { silent: false });
    });

  document
    .getElementById("btn-sync-merge-modal")
    ?.addEventListener("click", () => {
      saveUrlFromInput(modalUrlInput);
      syncWithServer("merge", { silent: false });
    });
  document
    .getElementById("btn-sync-pull-modal")
    ?.addEventListener("click", () => {
      saveUrlFromInput(modalUrlInput);
      syncWithServer("pull", { silent: false });
    });
  document
    .getElementById("btn-sync-push-modal")
    ?.addEventListener("click", () => {
      saveUrlFromInput(modalUrlInput);
      syncWithServer("overwrite", { silent: false });
    });

  // Bluetooth Sync listeners (Settings Card & Modal)
  document
    .getElementById("btn-bt-sync-direct-settings")
    ?.addEventListener("click", syncDirectViaBluetooth);
  document
    .getElementById("btn-bt-sync-direct-modal")
    ?.addEventListener("click", syncDirectViaBluetooth);

  document
    .getElementById("btn-bt-send-file-settings")
    ?.addEventListener("click", sendSyncFileViaBluetooth);
  document
    .getElementById("btn-bt-send-file-modal")
    ?.addEventListener("click", sendSyncFileViaBluetooth);

  document
    .getElementById("btn-bt-open-pc-receiver-settings")
    ?.addEventListener("click", openWindowsBluetoothReceiver);
  document
    .getElementById("btn-bt-open-pc-receiver-modal")
    ?.addEventListener("click", openWindowsBluetoothReceiver);

  document
    .getElementById("input-bt-merge-settings")
    ?.addEventListener("change", handleBluetoothMergeFileInput);
  document
    .getElementById("input-bt-merge-modal")
    ?.addEventListener("change", handleBluetoothMergeFileInput);

  // Start Native Bluetooth RFCOMM Sync Server on Android APK if available
  pushBtSyncSnapshotToNative(db);

  updateSyncUI();
  // Initial sync on startup
  setTimeout(() => {
    syncWithServer("merge", { silent: true });
  }, 400);

  // Real-time background polling every 4 seconds
  setInterval(pollServerRevision, 4000);
  window.addEventListener("focus", () => pollServerRevision());
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) pollServerRevision();
  });
}

// ============================================================================
// INITIALIZE APPLICATION
// ============================================================================
document.addEventListener("DOMContentLoaded", () => {
  initAuthAndUsers();
  applyAuthState();
  initDialogs();
  initWebAppInstall();
  syncHeaderAndDefaults();
  populatePartnerSelects();
  renderPendingTrucks();
  initDigitalScale();
  initFormBeli();
  initFormJual();
  initReceiptActions();
  initReportControls();
  initPartnerModals();
  initSettingsAndBackup();
  initSyncAndPolling();
  populateSettingsForm();
  syncScalePanelVisibility("view-beli");

  calculateBeliLive();
  calculateJualLive();

  // Bottom bar navigation listeners
  document.querySelectorAll(".bottom-bar .nav-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      switchTab(btn.dataset.target);
    });
  });
});
