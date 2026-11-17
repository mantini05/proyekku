const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { spawn } = require("node:child_process");

const SYNC_DB_FILE = path.join(__dirname, "sync-data.json");

function getLanAddresses() {
  const nets = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === "IPv4" && !net.internal) {
        addresses.push(net.address);
      }
    }
  }
  // Prioritize typical Wi-Fi / LAN 192.168.x.x or 10.x.x.x addresses
  addresses.sort((a, b) => {
    const score = (ip) =>
      ip.startsWith("192.168.") ? 0 : ip.startsWith("10.") ? 1 : 2;
    return score(a) - score(b);
  });
  return addresses;
}

function getLanUrls(port) {
  const p = port || 5173;
  return getLanAddresses().map((ip) => `http://${ip}:${p}`);
}

function loadSyncState() {
  try {
    if (fs.existsSync(SYNC_DB_FILE)) {
      const raw = fs.readFileSync(SYNC_DB_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && parsed.data && typeof parsed.data === "object") {
        return {
          revision: Number(parsed.revision) || 1,
          updatedAt: parsed.updatedAt || new Date().toISOString(),
          deletedIds:
            parsed.deletedIds && typeof parsed.deletedIds === "object"
              ? parsed.deletedIds
              : {},
          data: parsed.data,
        };
      }
    }
  } catch (err) {
    console.error("[SyncServer] Failed reading sync-data.json:", err);
  }
  return {
    revision: 0,
    updatedAt: null,
    deletedIds: {},
    data: null,
  };
}

function saveSyncState(state) {
  try {
    fs.writeFileSync(SYNC_DB_FILE, JSON.stringify(state, null, 2), "utf-8");
  } catch (err) {
    console.error("[SyncServer] Failed writing sync-data.json:", err);
  }
}

function mergeArrayById(serverArr = [], clientArr = [], deletedIds = {}, sortByTimeDesc = false) {
  const map = new Map();

  for (const item of serverArr) {
    if (!item || !item.id) continue;
    if (deletedIds[item.id]) continue;
    map.set(item.id, item);
  }

  for (const item of clientArr) {
    if (!item || !item.id) continue;
    if (deletedIds[item.id]) continue;
    const existing = map.get(item.id);
    if (!existing) {
      map.set(item.id, item);
    } else {
      const serverTime = Number(existing.updatedAt || 0);
      const clientTime = Number(item.updatedAt || 0);
      if (clientTime >= serverTime) {
        map.set(item.id, { ...existing, ...item });
      }
    }
  }

  const result = Array.from(map.values());
  if (sortByTimeDesc) {
    result.sort((a, b) => {
      const tA = a.timestamp || a.timeIn || a.date || "";
      const tB = b.timestamp || b.timeIn || b.date || "";
      return String(tB).localeCompare(String(tA));
    });
  }
  return result;
}

function mergeDatabases(serverState, clientPayload) {
  const clientData = clientPayload?.data;
  const clientDeleted =
    clientPayload?.deletedIds && typeof clientPayload.deletedIds === "object"
      ? clientPayload.deletedIds
      : {};

  const mergedDeleted = {
    ...(serverState.deletedIds || {}),
    ...clientDeleted,
  };

  if (!serverState.data) {
    return {
      deletedIds: mergedDeleted,
      data: clientData,
    };
  }
  if (!clientData) {
    return {
      deletedIds: mergedDeleted,
      data: serverState.data,
    };
  }

  const sData = serverState.data;
  const cData = clientData;

  const sSettingsTime = Number(sData.settings?.updatedAt || 0);
  const cSettingsTime = Number(cData.settings?.updatedAt || 0);
  const newerSettings =
    cSettingsTime >= sSettingsTime
      ? { ...(sData.settings || {}), ...(cData.settings || {}) }
      : { ...(cData.settings || {}), ...(sData.settings || {}) };

  // Preserve Bluetooth printer pairing per-device if one side is empty
  if (!newerSettings.btPrinterId && sData.settings?.btPrinterId) {
    newerSettings.btPrinterId = sData.settings.btPrinterId;
    newerSettings.btPrinterName = sData.settings.btPrinterName;
  }

  const purchases = mergeArrayById(
    sData.purchases,
    cData.purchases,
    mergedDeleted,
    true,
  );
  const sales = mergeArrayById(
    sData.sales,
    cData.sales,
    mergedDeleted,
    true,
  );
  const pendingTrucks = mergeArrayById(
    sData.pendingTrucks,
    cData.pendingTrucks,
    mergedDeleted,
    true,
  );
  const farmers = mergeArrayById(
    sData.farmers,
    cData.farmers,
    mergedDeleted,
    false,
  );
  const mills = mergeArrayById(
    sData.mills,
    cData.mills,
    mergedDeleted,
    false,
  );
  const users = mergeArrayById(
    sData.users,
    cData.users,
    mergedDeleted,
    false,
  );

  return {
    deletedIds: mergedDeleted,
    data: {
      settings: newerSettings,
      farmers,
      mills,
      pendingTrucks,
      purchases,
      sales,
      users,
    },
  };
}

function setCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Accept, X-Requested-With",
  );
  res.setHeader("Access-Control-Allow-Private-Network", "true");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
}

function sendJson(res, statusCode, payload) {
  setCorsHeaders(res);
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function handleSyncRequest(req, res, defaultPort = 5173) {
  const urlPath = (req.url || "").split("?")[0];
  if (!urlPath.startsWith("/api/sync")) {
    return false;
  }

  if (req.method === "OPTIONS") {
    setCorsHeaders(res);
    res.statusCode = 204;
    res.end();
    return true;
  }

  const hostHeader = req.headers.host || "";
  const portMatch = hostHeader.match(/:(\d+)$/);
  const activePort = portMatch ? Number(portMatch[1]) : defaultPort;
  const lanUrls = getLanUrls(activePort);

  if (req.method === "POST" && urlPath === "/api/sync/open-bt-receiver") {
    try {
      const child = spawn("fsquirt.exe", ["-receive"], {
        detached: true,
        stdio: "ignore",
      });
      child.unref();
      sendJson(res, 200, {
        ok: true,
        message:
          "Jendela Penerima File Bluetooth Windows (fsquirt) telah dibuka.",
      });
    } catch (err) {
      sendJson(res, 500, {
        ok: false,
        message: "Gagal membuka fsquirt.exe: " + err.message,
      });
    }
    return true;
  }

  if (req.method === "GET" && urlPath === "/api/sync/info") {
    const state = loadSyncState();
    sendJson(res, 200, {
      ok: true,
      revision: state.revision,
      updatedAt: state.updatedAt,
      hasData: Boolean(state.data),
      lanUrls,
    });
    return true;
  }

  if (req.method === "GET" && urlPath === "/api/sync") {
    const state = loadSyncState();
    sendJson(res, 200, {
      ok: true,
      revision: state.revision,
      updatedAt: state.updatedAt,
      deletedIds: state.deletedIds || {},
      data: state.data,
      lanUrls,
    });
    return true;
  }

  if (req.method === "POST" && urlPath === "/api/sync") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 15 * 1024 * 1024) {
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        const payload = JSON.parse(body || "{}");
        const mode = payload.mode || "merge";
        const currentState = loadSyncState();

        if (mode === "pull") {
          sendJson(res, 200, {
            ok: true,
            revision: currentState.revision,
            updatedAt: currentState.updatedAt,
            deletedIds: currentState.deletedIds || {},
            data: currentState.data,
            lanUrls,
          });
          return;
        }

        if (mode === "overwrite") {
          const nextState = {
            revision: (currentState.revision || 0) + 1,
            updatedAt: new Date().toISOString(),
            deletedIds:
              payload.deletedIds && typeof payload.deletedIds === "object"
                ? payload.deletedIds
                : {},
            data: payload.data || currentState.data,
          };
          saveSyncState(nextState);
          sendJson(res, 200, {
            ok: true,
            revision: nextState.revision,
            updatedAt: nextState.updatedAt,
            deletedIds: nextState.deletedIds,
            data: nextState.data,
            lanUrls,
          });
          return;
        }

        // Default: smart two-way merge
        const merged = mergeDatabases(currentState, payload);
        const changed =
          JSON.stringify(currentState.data) !== JSON.stringify(merged.data) ||
          JSON.stringify(currentState.deletedIds) !==
            JSON.stringify(merged.deletedIds);

        const nextState = {
          revision: changed
            ? (currentState.revision || 0) + 1
            : currentState.revision || 1,
          updatedAt: changed
            ? new Date().toISOString()
            : currentState.updatedAt || new Date().toISOString(),
          deletedIds: merged.deletedIds,
          data: merged.data,
        };

        if (changed || !currentState.data) {
          saveSyncState(nextState);
        }

        sendJson(res, 200, {
          ok: true,
          revision: nextState.revision,
          updatedAt: nextState.updatedAt,
          deletedIds: nextState.deletedIds,
          data: nextState.data,
          lanUrls,
        });
      } catch (err) {
        sendJson(res, 400, {
          ok: false,
          message: "Format data sinkronisasi tidak valid: " + err.message,
        });
      }
    });
    return true;
  }

  sendJson(res, 404, { ok: false, message: "Endpoint tidak ditemukan" });
  return true;
}

module.exports = {
  handleSyncRequest,
  getLanUrls,
};
