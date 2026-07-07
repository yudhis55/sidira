// ══════════════════════════════════════════════════════════════════════
//  SIDIRA v3 — Google Apps Script Backend
//  Sistem Digital Inventaris Ruangan Aset
//  Puskesmas Baruharjo, Kec. Durenan, Kab. Trenggalek
//
//  Versi ini mendukung:
//  • Inventaris 51 ruangan (767+ item)
//  • SBBK (Surat Bukti Barang Keluar)
//  • Pakta Integritas + Lampiran BMD
//  • Rekap Pemegang Inventaris
//  • Utilitas (Ambulance, Genset, IPAL)
//  • Penanggung Jawab per ruangan
//  • Riwayat perpindahan aset
//  • Usulan Sarana Prasarana
//  • Pencarian global
// ══════════════════════════════════════════════════════════════════════

// ── Kunci penyimpanan properti ──
const KEY_SHEET = "SIDIRA_SHEET_ID";
const KEY_ADMIN = "SIDIRA_ADMIN_EMAIL";

// ── Nama sheet dalam Spreadsheet ──
const SH = {
  USERS: "Users",
  SESSIONS: "Sessions",
  SBBK: "SBBK",
  PAKTA: "Pakta",
  ROOMS: "InventarisRuangan",
  PJ: "PenanggungJawab",
  MV_LOG: "RiwayatPindah",
  UTIL_ITEMS: "UtilItems",
  UTIL_META: "UtilMeta",
  UTIL_STATE: "UtilState",
  USULAN: "Usulan",
  CHECKLIST: "Checklist",
  LOG: "Log",
};

// ══════════════════════════════════════════════════════════════════════
//  HTTP HANDLER
// ══════════════════════════════════════════════════════════════════════
function doGet(e) {
  return HtmlService.createHtmlOutputFromFile("index")
    .setTitle("SIDIRA — Puskesmas Baruharjo")
    .addMetaTag("viewport", "width=device-width,initial-scale=1")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || "{}");
    return jsonOut(executeAction(body));
  } catch (err) {
    return jsonOut({ ok: false, error: err.toString() });
  }
}

// Dipakai oleh HTTP doPost dan google.script.run dari frontend
function executeAction(body) {
  body = body || {};
  const action = body.action || "";
  const token = body.token || "";

  // Public
  if (action === "login") return handleLogin(body);
  if (action === "setup") return handleSetup(body);
  if (action === "getInfo") return getAppInfo();

  // Perlu autentikasi
  const user = verifyToken(token);
  if (!user) return { ok: false, error: "Sesi berakhir, silakan login ulang." };

  // Data sync (semua disimpan di localStorage juga, ini backup cloud)
  if (action === "loadAll") return loadAll(user);
  if (action === "saveSbbk") return saveSbbk(body.data, user);
  if (action === "savePakta") return savePakta(body.data, user);
  if (action === "saveRooms") return saveRooms(body.data, user);
  if (action === "savePj") return savePj(body.data, user);
  if (action === "saveMvLog") return saveMvLog(body.data, user);
  if (action === "saveUtilItems") return saveUtilItems(body.data, user);
  if (action === "saveUtilMeta") return saveUtilMeta(body.data, user);
  if (action === "saveUtilState") return saveUtilState(body.data, user);
  if (action === "patchUtilState") return patchUtilState(body.data, user);
  if (action === "loadUsulan") return loadUsulan(user);
  if (action === "saveUsulan") return saveUsulan(body.data, user);
  if (action === "saveChecklist") return saveChecklist(body.data, user);
  if (action === "patchChecklist") return patchChecklist(body.data, user);
  if (action === "logout") return handleLogout(token);

  // Admin only
  if (!["admin"].includes(user.role)) {
    return { ok: false, error: "Akses ditolak." };
  }
  if (action === "getUsers") return getUsers();
  if (action === "saveUser") return saveUser(body.data);
  if (action === "deleteUser") return deleteUser(body.data);

  return { ok: false, error: "Action tidak dikenal: " + action };
}

// Bridge untuk google.script.run (tidak bisa panggil doPost langsung)
function doPost_wrapper(payload) {
  try {
    const body =
      typeof payload === "string" ? JSON.parse(payload || "{}") : payload || {};
    return executeAction(body);
  } catch (err) {
    return { ok: false, error: err.toString() };
  }
}

function jsonOut(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

// ══════════════════════════════════════════════════════════════════════
//  SETUP AWAL — jalankan satu kali
// ══════════════════════════════════════════════════════════════════════
function setup() {
  const ss = SpreadsheetApp.create("SIDIRA — Puskesmas Baruharjo");
  PropertiesService.getScriptProperties().setProperty(KEY_SHEET, ss.getId());

  initSheets(ss);
  seedUsers(ss);

  const url = ss.getUrl();
  Logger.log("✅ Setup selesai. Spreadsheet: " + url);
  Logger.log("Login: sidira / sidira2026");
  return url;
}

function initSheets(ss) {
  const needed = Object.values(SH);
  const exist = ss.getSheets().map((s) => s.getName());

  needed.forEach((name) => {
    if (!exist.includes(name)) {
      ss.insertSheet(name);
    }
  });

  // Header Users
  const usersSheet = ss.getSheetByName(SH.USERS);
  if (usersSheet.getLastRow() === 0) {
    usersSheet.appendRow([
      "username",
      "password_hash",
      "nama",
      "jabatan",
      "role",
      "avatar",
      "lastLogin",
    ]);
  }

  // Header Sessions
  const sessSheet = ss.getSheetByName(SH.SESSIONS);
  if (sessSheet.getLastRow() === 0) {
    sessSheet.appendRow(["token", "username", "role", "loginAt", "expiresAt"]);
  }

  // Header SBBK
  const sbbkSheet = ss.getSheetByName(SH.SBBK);
  if (sbbkSheet.getLastRow() === 0) {
    sbbkSheet.appendRow([
      "id",
      "no",
      "tgl",
      "kepada",
      "jenis",
      "anggaran",
      "ketUmum",
      "items_json",
      "updatedAt",
    ]);
  }

  // Header Pakta
  const paktaSheet = ss.getSheetByName(SH.PAKTA);
  if (paktaSheet.getLastRow() === 0) {
    paktaSheet.appendRow([
      "id",
      "hari",
      "tgl",
      "nama",
      "nip",
      "jabatan",
      "alamat",
      "asetKendaraan_json",
      "asetLaptop_json",
      "asetAlat_json",
      "createdAt",
    ]);
  }

  // Header Inventaris Ruangan (snapshot JSON)
  const roomsSheet = ss.getSheetByName(SH.ROOMS);
  if (roomsSheet.getLastRow() === 0) {
    roomsSheet.appendRow([
      "roomId",
      "roomName",
      "roomIcon",
      "roomColor",
      "roomBg",
      "roomDesc",
      "roomPj",
      "roomOrder",
      "itemIndex",
      "itemJson",
      "updatedAt",
      "updatedBy",
    ]);
  }

  // Header PJ
  const pjSheet = ss.getSheetByName(SH.PJ);
  if (pjSheet.getLastRow() === 0) {
    pjSheet.appendRow(["roomId", "nama", "updatedAt"]);
  }

  // Header MvLog
  const mvSheet = ss.getSheetByName(SH.MV_LOG);
  if (mvSheet.getLastRow() === 0) {
    mvSheet.appendRow([
      "ts",
      "nama",
      "kat",
      "dari",
      "ke",
      "dariName",
      "keName",
      "user",
    ]);
  }

  // Header UtilItems
  const utilSheet = ss.getSheetByName(SH.UTIL_ITEMS);
  if (utilSheet.getLastRow() === 0) {
    utilSheet.appendRow(["utilId", "items_json", "updatedAt"]);
  }

  // Header UtilMeta
  const utilMetaSheet = ss.getSheetByName(SH.UTIL_META);
  if (utilMetaSheet.getLastRow() === 0) {
    utilMetaSheet.appendRow([
      "utilId",
      "label",
      "icon",
      "warna",
      "bg",
      "custom",
      "orderNo",
      "updatedAt",
    ]);
  }

  // Header UtilState
  const utilStateSheet = ss.getSheetByName(SH.UTIL_STATE);
  if (utilStateSheet.getLastRow() === 0) {
    utilStateSheet.appendRow([
      "kind",
      "utilId",
      "itemIndex",
      "stateKey",
      "value",
      "updatedAt",
      "updatedBy",
    ]);
  }

  // Header Usulan
  const usulanSheet = ss.getSheetByName(SH.USULAN);
  if (usulanSheet.getLastRow() === 0) {
    usulanSheet.appendRow(["payload_json", "updatedAt", "updatedBy"]);
  }

  // Header Checklist
  const clSheet = ss.getSheetByName(SH.CHECKLIST);
  if (clSheet.getLastRow() === 0) {
    clSheet.appendRow([
      "roomId",
      "kat",
      "itemIndex",
      "dateKey",
      "payload_json",
      "updatedAt",
    ]);
  }

  // Header Log
  const logSheet = ss.getSheetByName(SH.LOG);
  if (logSheet.getLastRow() === 0) {
    logSheet.appendRow(["ts", "user", "action", "detail"]);
  }
}

function seedUsers(ss) {
  const sh = ss.getSheetByName(SH.USERS);
  const rows = [
    [
      "sidira",
      hash("sidira2026"),
      "Administrator SIDIRA",
      "Administrator",
      "admin",
      "🛡️",
      "",
    ],
    [
      "kapus",
      hash("kapus2026"),
      "dr. Riana Widyastuti",
      "Kepala Puskesmas",
      "viewer",
      "👩‍⚕️",
      "",
    ],
    [
      "pengurus",
      hash("barang2026"),
      "Muhammad Syaifulloh Mahdzur",
      "Pengurus Barang Pembantu",
      "editor",
      "📦",
      "",
    ],
  ];
  sh.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
}

// ══════════════════════════════════════════════════════════════════════
//  AUTH — Login / Session / Logout
// ══════════════════════════════════════════════════════════════════════
function handleLogin(body) {
  const { username, password } = body;
  if (!username || !password)
    return { ok: false, error: "Username dan password wajib diisi." };

  const ss = getSpreadsheet();
  const sh = ss.getSheetByName(SH.USERS);
  const rows = sh.getDataRange().getValues();
  const header = rows[0];
  const uIdx = header.indexOf("username");
  const pIdx = header.indexOf("password_hash");

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row[uIdx] === username && row[pIdx] === hash(password)) {
      const user = rowToUser(header, row);
      const token = generateToken();
      const exp = new Date(Date.now() + 8 * 3600 * 1000).toISOString();

      // Simpan session
      ss.getSheetByName(SH.SESSIONS).appendRow([
        token,
        user.username,
        user.role,
        new Date().toISOString(),
        exp,
      ]);

      // Update lastLogin
      sh.getRange(i + 1, header.indexOf("lastLogin") + 1).setValue(
        new Date().toISOString(),
      );

      // Bersihkan session expired (async, tidak blocking)
      cleanExpiredSessions(ss);

      writeLog(ss, user.username, "login", "OK");
      return { ok: true, token, user };
    }
  }
  return { ok: false, error: "Username atau password salah." };
}

function verifyToken(token) {
  if (!token) return null;
  try {
    const ss = getSpreadsheet();
    const sh = ss.getSheetByName(SH.SESSIONS);
    const rows = sh.getDataRange().getValues();
    const header = rows[0];
    const tIdx = header.indexOf("token");
    const eIdx = header.indexOf("expiresAt");
    const uIdx = header.indexOf("username");
    const rIdx = header.indexOf("role");

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row[tIdx] === token) {
        const exp = new Date(row[eIdx]);
        if (exp < new Date()) return null; // expired
        return { username: row[uIdx], role: row[rIdx] };
      }
    }
  } catch (e) {}
  return null;
}

function handleLogout(token) {
  try {
    const ss = getSpreadsheet();
    const sh = ss.getSheetByName(SH.SESSIONS);
    const rows = sh.getDataRange().getValues();
    const tIdx = rows[0].indexOf("token");
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][tIdx] === token) {
        sh.deleteRow(i + 1);
        break;
      }
    }
  } catch (e) {}
  return { ok: true };
}

/**
 * Membersihkan session yang sudah expired dari sheet Sessions.
 * Dipanggil saat login untuk menjaga sheet tetap bersih.
 */
function cleanExpiredSessions(ss) {
  try {
    const sh = ss.getSheetByName(SH.SESSIONS);
    const rows = sh.getDataRange().getValues();
    if (rows.length < 2) return;
    const eIdx = rows[0].indexOf("expiresAt");
    const now = new Date();
    // Hapus dari bawah ke atas agar index tidak bergeser
    for (let i = rows.length - 1; i >= 1; i--) {
      const exp = new Date(rows[i][eIdx]);
      if (exp < now) {
        sh.deleteRow(i + 1);
      }
    }
  } catch (e) {}
}

// ══════════════════════════════════════════════════════════════════════
//  DATA LOAD — Sync semua data ke client
// ══════════════════════════════════════════════════════════════════════
function loadAll(user) {
  const ss = getSpreadsheet();
  return {
    ok: true,
    sbbk: loadSbbk(ss),
    pakta: loadPakta(ss),
    rooms: loadRooms(ss),
    pj: loadPj(ss),
    mvLog: loadMvLog(ss),
    utilItems: loadUtilItems(ss),
    utilMeta: loadUtilMeta(ss),
    utilState: loadUtilState(ss),
    usulan: loadUsulan(user, ss),
    checklist: loadChecklist(ss),
  };
}

// ══════════════════════════════════════════════════════════════════════
//  SBBK
// ══════════════════════════════════════════════════════════════════════
function loadSbbk(ss) {
  ss = ss || getSpreadsheet();
  const sh = ss.getSheetByName(SH.SBBK);
  const rows = sh.getDataRange().getValues();
  if (rows.length < 2) return [];
  const h = rows[0];
  return rows.slice(1).map((r) => {
    const obj = rowToObj(h, r);
    try {
      obj.items = JSON.parse(obj.items_json || "[]");
    } catch (e) {
      obj.items = [];
    }
    delete obj.items_json;
    return obj;
  });
}

function saveSbbk(data, user) {
  const ss = getSpreadsheet();
  const sh = ss.getSheetByName(SH.SBBK);
  const payload = Array.isArray(data) ? data : [];

  // Hapus data lama
  const last = sh.getLastRow();
  if (last > 1) sh.deleteRows(2, last - 1);

  // Batch write
  if (payload.length > 0) {
    const rows = payload.map((d) => [
      d.id || "",
      d.no || "",
      d.tgl || "",
      d.kepada || "",
      d.jenis || "",
      d.anggaran || "",
      d.ketUmum || "",
      JSON.stringify(d.items || []),
      new Date().toISOString(),
    ]);
    sh.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  }

  writeLog(ss, user.username, "saveSbbk", payload.length + " records");
  return { ok: true };
}

// ══════════════════════════════════════════════════════════════════════
//  PAKTA INTEGRITAS
// ══════════════════════════════════════════════════════════════════════
function loadPakta(ss) {
  ss = ss || getSpreadsheet();
  const sh = ss.getSheetByName(SH.PAKTA);
  const rows = sh.getDataRange().getValues();
  if (rows.length < 2) return [];
  const h = rows[0];
  return rows.slice(1).map((r) => {
    const obj = rowToObj(h, r);
    try {
      obj.asetKendaraan = JSON.parse(obj.asetKendaraan_json || "[]");
    } catch (e) {
      obj.asetKendaraan = [];
    }
    try {
      obj.asetLaptop = JSON.parse(obj.asetLaptop_json || "[]");
    } catch (e) {
      obj.asetLaptop = [];
    }
    try {
      obj.asetAlat = JSON.parse(obj.asetAlat_json || "[]");
    } catch (e) {
      obj.asetAlat = [];
    }
    delete obj.asetKendaraan_json;
    delete obj.asetLaptop_json;
    delete obj.asetAlat_json;
    return obj;
  });
}

function savePakta(data, user) {
  const ss = getSpreadsheet();
  const sh = ss.getSheetByName(SH.PAKTA);
  const payload = Array.isArray(data) ? data : [];

  const last = sh.getLastRow();
  if (last > 1) sh.deleteRows(2, last - 1);

  if (payload.length > 0) {
    const rows = payload.map((d) => [
      d.id || "",
      d.hari || "",
      d.tgl || "",
      d.nama || "",
      d.nip || "",
      d.jabatan || "",
      d.alamat || "",
      JSON.stringify(d.asetKendaraan || []),
      JSON.stringify(d.asetLaptop || []),
      JSON.stringify(d.asetAlat || []),
      d.createdAt || new Date().toISOString(),
    ]);
    sh.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  }

  writeLog(ss, user.username, "savePakta", payload.length + " records");
  return { ok: true };
}

// ══════════════════════════════════════════════════════════════════════
//  INVENTARIS RUANGAN (Snapshot penuh)
// ══════════════════════════════════════════════════════════════════════
function loadRooms(ss) {
  ss = ss || getSpreadsheet();
  const sh = ss.getSheetByName(SH.ROOMS);
  const rows = sh.getDataRange().getValues();
  if (rows.length < 2) return [];

  const header = rows[0].map(String);

  // Support format legacy (payload_json single cell)
  const isLegacySingleCell = header.length === 3 && header[0] === "payload_json";
  if (isLegacySingleCell) {
    try {
      const payload = rows[1][0] || "[]";
      const parsed = JSON.parse(payload);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  const roomMap = new Map();
  rows.slice(1).forEach((row) => {
    const record = rowToObj(header, row);
    const roomId = record.roomId || "";
    if (!roomId) return;

    if (!roomMap.has(roomId)) {
      roomMap.set(roomId, {
        id: roomId,
        name: record.roomName || "",
        icon: record.roomIcon || "🏠",
        color: record.roomColor || "#0e7c6b",
        bg: record.roomBg || "#d4f0eb",
        desc: record.roomDesc || "",
        pj: record.roomPj || "",
        items: [],
        __order: parseInt(record.roomOrder, 10) || 0,
      });
    }

    const room = roomMap.get(roomId);
    if (!room.name && record.roomName) room.name = record.roomName;
    if (!room.icon && record.roomIcon) room.icon = record.roomIcon;
    if (!room.color && record.roomColor) room.color = record.roomColor;
    if (!room.bg && record.roomBg) room.bg = record.roomBg;
    if (!room.desc && record.roomDesc) room.desc = record.roomDesc;
    if (!room.pj && record.roomPj) room.pj = record.roomPj;

    if (record.itemJson) {
      try {
        const item = JSON.parse(record.itemJson);
        room.items.push(item);
      } catch (e) {}
    }
  });

  return Array.from(roomMap.values())
    .sort((a, b) => (a.__order || 0) - (b.__order || 0))
    .map((room) => {
      delete room.__order;
      return room;
    });
}

function saveRooms(data, user) {
  const ss = getSpreadsheet();
  const sh = ss.getSheetByName(SH.ROOMS);
  const payload = Array.isArray(data) ? data : [];
  const header = [
    "roomId",
    "roomName",
    "roomIcon",
    "roomColor",
    "roomBg",
    "roomDesc",
    "roomPj",
    "roomOrder",
    "itemIndex",
    "itemJson",
    "updatedAt",
    "updatedBy",
  ];
  const updatedAt = new Date().toISOString();
  const updatedBy = user && user.username ? user.username : "";

  // Bangun semua baris di memori dulu
  const allRows = [];
  payload.forEach((room, roomIndex) => {
    const roomId = room && room.id ? room.id : "";
    const items = Array.isArray(room && room.items) ? room.items : [];
    const roomMeta = [
      roomId,
      room && room.name ? room.name : "",
      room && room.icon ? room.icon : "🏠",
      room && room.color ? room.color : "#0e7c6b",
      room && room.bg ? room.bg : "#d4f0eb",
      room && room.desc ? room.desc : "",
      room && room.pj ? room.pj : "",
      roomIndex,
    ];

    // Row metadata ruangan (walau item kosong)
    allRows.push([...roomMeta, "", "", updatedAt, updatedBy]);

    // Row per item
    items.forEach((item, itemIndex) => {
      allRows.push([
        ...roomMeta,
        itemIndex,
        JSON.stringify(item || {}),
        updatedAt,
        updatedBy,
      ]);
    });
  });

  // Tulis sekaligus (batch)
  sh.clearContents();
  sh.getRange(1, 1, 1, header.length).setValues([header]);
  if (allRows.length > 0) {
    sh.getRange(2, 1, allRows.length, header.length).setValues(allRows);
  }

  writeLog(ss, user.username, "saveRooms", payload.length + " rooms");
  return { ok: true };
}

// ══════════════════════════════════════════════════════════════════════
//  PENANGGUNG JAWAB
// ══════════════════════════════════════════════════════════════════════
function loadPj(ss) {
  ss = ss || getSpreadsheet();
  const sh = ss.getSheetByName(SH.PJ);
  const rows = sh.getDataRange().getValues();
  if (rows.length < 2) return {};
  const h = rows[0];
  const result = {};
  rows.slice(1).forEach((r) => {
    const obj = rowToObj(h, r);
    if (obj.roomId) result[obj.roomId] = obj.nama || "";
  });
  return result;
}

function savePj(data, user) {
  const ss = getSpreadsheet();
  const sh = ss.getSheetByName(SH.PJ);
  const entries = data && typeof data === "object" ? Object.entries(data) : [];

  const last = sh.getLastRow();
  if (last > 1) sh.deleteRows(2, last - 1);

  if (entries.length > 0) {
    const updatedAt = new Date().toISOString();
    const rows = entries.map(([roomId, nama]) => [roomId, nama, updatedAt]);
    sh.getRange(2, 1, rows.length, 3).setValues(rows);
  }

  writeLog(ss, user.username, "savePj", entries.length + " rooms");
  return { ok: true };
}

// ══════════════════════════════════════════════════════════════════════
//  RIWAYAT PERPINDAHAN
// ══════════════════════════════════════════════════════════════════════
function loadMvLog(ss) {
  ss = ss || getSpreadsheet();
  const sh = ss.getSheetByName(SH.MV_LOG);
  const rows = sh.getDataRange().getValues();
  if (rows.length < 2) return [];
  const h = rows[0];
  return rows.slice(1).map((r) => rowToObj(h, r));
}

function saveMvLog(data, user) {
  const ss = getSpreadsheet();
  const sh = ss.getSheetByName(SH.MV_LOG);
  const payload = Array.isArray(data) ? data : [];

  const last = sh.getLastRow();
  if (last > 1) sh.deleteRows(2, last - 1);

  if (payload.length > 0) {
    const rows = payload.map((d) => [
      d.ts || "",
      d.nama || "",
      d.kat || "",
      d.dari || "",
      d.ke || "",
      d.dariName || "",
      d.keName || "",
      user.username,
    ]);
    sh.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  }

  writeLog(ss, user.username, "saveMvLog", payload.length + " records");
  return { ok: true };
}

// ══════════════════════════════════════════════════════════════════════
//  UTILITAS ITEMS (Override jadwal)
// ══════════════════════════════════════════════════════════════════════
function loadUtilItems(ss) {
  ss = ss || getSpreadsheet();
  const sh = ss.getSheetByName(SH.UTIL_ITEMS);
  if (!sh) return {};
  const rows = sh.getDataRange().getValues();
  if (rows.length < 2) return {};
  const h = rows[0];
  const result = {};
  rows.slice(1).forEach((r) => {
    const obj = rowToObj(h, r);
    if (obj.utilId) {
      try {
        result[obj.utilId] = JSON.parse(obj.items_json || "[]");
      } catch (e) {
        result[obj.utilId] = [];
      }
    }
  });
  return result;
}

function saveUtilItems(data, user) {
  const ss = getSpreadsheet();
  const sh = ss.getSheetByName(SH.UTIL_ITEMS);
  const entries = data && typeof data === "object" ? Object.entries(data) : [];

  const last = sh.getLastRow();
  if (last > 1) sh.deleteRows(2, last - 1);

  if (entries.length > 0) {
    const updatedAt = new Date().toISOString();
    const rows = entries.map(([utilId, items]) => [
      utilId,
      JSON.stringify(items),
      updatedAt,
    ]);
    sh.getRange(2, 1, rows.length, 3).setValues(rows);
  }

  writeLog(ss, user.username, "saveUtilItems", entries.length + " utils");
  return { ok: true };
}

function loadUtilMeta(ss) {
  ss = ss || getSpreadsheet();
  const sh = ss.getSheetByName(SH.UTIL_META);
  if (!sh) return {};
  const rows = sh.getDataRange().getValues();
  if (rows.length < 2) return {};
  const h = rows[0];
  const result = {};

  rows.slice(1).forEach((r) => {
    const obj = rowToObj(h, r);
    if (!obj.utilId) return;
    result[obj.utilId] = {
      label: obj.label || "",
      icon: obj.icon || "",
      warna: obj.warna || "",
      bg: obj.bg || "",
      custom:
        String(obj.custom || "") === "true" || String(obj.custom || "") === "1",
      orderNo: parseInt(obj.orderNo, 10) || 0,
    };
  });
  return result;
}

function saveUtilMeta(data, user) {
  const ss = getSpreadsheet();
  const sh = ss.getSheetByName(SH.UTIL_META);
  const entries = data && typeof data === "object" ? Object.entries(data) : [];

  const last = sh.getLastRow();
  if (last > 1) sh.deleteRows(2, last - 1);

  if (entries.length > 0) {
    const updatedAt = new Date().toISOString();
    const rows = entries.map(([utilId, meta]) => {
      meta = meta || {};
      return [
        utilId,
        meta.label || "",
        meta.icon || "",
        meta.warna || "",
        meta.bg || "",
        meta.custom ? "true" : "false",
        parseInt(meta.orderNo, 10) || 0,
        updatedAt,
      ];
    });
    sh.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  }

  writeLog(ss, user.username, "saveUtilMeta", entries.length + " utils");
  return { ok: true };
}

function loadUtilState(ss) {
  ss = ss || getSpreadsheet();
  const sh = ss.getSheetByName(SH.UTIL_STATE);
  if (!sh) return { checks: {}, notes: {} };
  const rows = sh.getDataRange().getValues();
  const result = { checks: {}, notes: {} };
  if (rows.length < 2) return result;
  const h = rows[0];

  rows.slice(1).forEach((r) => {
    const obj = rowToObj(h, r);
    if (obj.kind === "check" && obj.utilId && obj.stateKey) {
      if (!result.checks[obj.utilId]) result.checks[obj.utilId] = {};
      if (!result.checks[obj.utilId][obj.itemIndex]) {
        result.checks[obj.utilId][obj.itemIndex] = {};
      }
      result.checks[obj.utilId][obj.itemIndex][obj.stateKey] = true;
    }
    if (obj.kind === "note" && obj.stateKey) {
      result.notes[obj.stateKey] = obj.value || "";
    }
  });

  return result;
}

function saveUtilState(data, user) {
  const ss = getSpreadsheet();
  const sh = ss.getSheetByName(SH.UTIL_STATE);

  const last = sh.getLastRow();
  if (last > 1) sh.deleteRows(2, last - 1);

  const checks =
    data && data.checks && typeof data.checks === "object" ? data.checks : {};
  const notes =
    data && data.notes && typeof data.notes === "object" ? data.notes : {};
  const updatedAt = new Date().toISOString();
  const updatedBy = user && user.username ? user.username : "";

  // Bangun semua baris di memori
  const allRows = [];

  Object.entries(checks).forEach(([utilId, itemMap]) => {
    if (!itemMap || typeof itemMap !== "object") return;
    Object.entries(itemMap).forEach(([itemIndex, dateMap]) => {
      if (!dateMap || typeof dateMap !== "object") return;
      Object.entries(dateMap).forEach(([stateKey, done]) => {
        if (!done) return;
        allRows.push(["check", utilId, itemIndex, stateKey, "1", updatedAt, updatedBy]);
      });
    });
  });

  Object.entries(notes).forEach(([stateKey, value]) => {
    if (value === undefined || value === null) return;
    allRows.push(["note", "", "", stateKey, String(value), updatedAt, updatedBy]);
  });

  // Batch write
  if (allRows.length > 0) {
    sh.getRange(2, 1, allRows.length, 7).setValues(allRows);
  }

  writeLog(ss, user.username, "saveUtilState", allRows.length + " entries");
  return { ok: true };
}

/**
 * Incremental patch untuk UtilState — menerima hanya delta (perubahan terbaru).
 * Mengatasi batas payload 256KB google.script.run untuk data checklist besar.
 *
 * Format data:
 * {
 *   checks: [{utilId, itemIndex, stateKey, value}],  // value: true/false
 *   notes: [{stateKey, value}]
 * }
 */
function patchUtilState(data, user) {
  if (!data) return { ok: true };
  const ss = getSpreadsheet();
  const sh = ss.getSheetByName(SH.UTIL_STATE);
  const updatedAt = new Date().toISOString();
  const updatedBy = user && user.username ? user.username : "";

  const checks = Array.isArray(data.checks) ? data.checks : [];
  const notes = Array.isArray(data.notes) ? data.notes : [];

  if (checks.length === 0 && notes.length === 0) return { ok: true };

  // Baca data existing untuk upsert
  const rows = sh.getDataRange().getValues();
  const header = rows[0];
  const kindIdx = header.indexOf("kind");
  const utilIdIdx = header.indexOf("utilId");
  const itemIndexIdx = header.indexOf("itemIndex");
  const stateKeyIdx = header.indexOf("stateKey");
  const valueIdx = header.indexOf("value");
  const updatedAtIdx = header.indexOf("updatedAt");
  const updatedByIdx = header.indexOf("updatedBy");

  // Index existing rows untuk lookup cepat
  // key: "check|utilId|itemIndex|stateKey" atau "note|||stateKey"
  const rowIndex = {};
  for (let i = 1; i < rows.length; i++) {
    const kind = rows[i][kindIdx];
    const key =
      kind +
      "|" +
      rows[i][utilIdIdx] +
      "|" +
      rows[i][itemIndexIdx] +
      "|" +
      rows[i][stateKeyIdx];
    rowIndex[key] = i + 1; // 1-based row number in sheet
  }

  // Proses checks
  const toAppend = [];
  const toDelete = []; // row numbers to delete

  checks.forEach((c) => {
    if (!c.utilId || !c.stateKey) return;
    const key = "check|" + c.utilId + "|" + c.itemIndex + "|" + c.stateKey;
    const existingRow = rowIndex[key];

    if (c.value) {
      // Set checked
      if (existingRow) {
        // Update existing row
        sh.getRange(existingRow, updatedAtIdx + 1).setValue(updatedAt);
        sh.getRange(existingRow, updatedByIdx + 1).setValue(updatedBy);
      } else {
        // Append new row
        toAppend.push([
          "check",
          c.utilId,
          String(c.itemIndex),
          c.stateKey,
          "1",
          updatedAt,
          updatedBy,
        ]);
      }
    } else {
      // Uncheck — hapus row
      if (existingRow) {
        toDelete.push(existingRow);
      }
    }
  });

  // Proses notes
  notes.forEach((n) => {
    if (!n.stateKey) return;
    const key = "note|||" + n.stateKey;
    const existingRow = rowIndex[key];

    if (existingRow) {
      // Update existing note
      sh.getRange(existingRow, valueIdx + 1).setValue(n.value || "");
      sh.getRange(existingRow, updatedAtIdx + 1).setValue(updatedAt);
      sh.getRange(existingRow, updatedByIdx + 1).setValue(updatedBy);
    } else {
      // Append new note
      toAppend.push([
        "note",
        "",
        "",
        n.stateKey,
        n.value || "",
        updatedAt,
        updatedBy,
      ]);
    }
  });

  // Hapus rows (dari bawah ke atas agar index tidak bergeser)
  toDelete.sort((a, b) => b - a);
  toDelete.forEach((rowNum) => {
    sh.deleteRow(rowNum);
  });

  // Append new rows (batch)
  if (toAppend.length > 0) {
    const lastRow = sh.getLastRow();
    sh.getRange(lastRow + 1, 1, toAppend.length, 7).setValues(toAppend);
  }

  writeLog(
    ss,
    user.username,
    "patchUtilState",
    checks.length + " checks, " + notes.length + " notes",
  );
  return { ok: true };
}

// ══════════════════════════════════════════════════════════════════════
//  USULAN SARANA PRASARANA
// ══════════════════════════════════════════════════════════════════════
function loadUsulan(user, ss) {
  ss = ss || getSpreadsheet();
  try {
    // Coba baca dari sheet Usulan dulu
    const sh = ss.getSheetByName(SH.USULAN);
    if (sh && sh.getLastRow() >= 2) {
      const payload = sh.getRange(2, 1).getValue();
      if (payload) {
        return { ok: true, data: JSON.parse(payload) };
      }
    }
    // Fallback: baca dari ScriptProperties (migrasi dari versi lama)
    const legacy =
      PropertiesService.getScriptProperties().getProperty("SIDIRA_USULAN");
    if (legacy) {
      const parsed = JSON.parse(legacy);
      // Migrasi ke sheet
      _saveUsulanToSheet(ss, parsed, user);
      // Hapus dari properties
      PropertiesService.getScriptProperties().deleteProperty("SIDIRA_USULAN");
      return { ok: true, data: parsed };
    }
    return { ok: true, data: {} };
  } catch (e) {
    return { ok: true, data: {} };
  }
}

function saveUsulan(data, user) {
  try {
    const ss = getSpreadsheet();
    _saveUsulanToSheet(ss, data, user);
    writeLog(ss, user.username, "saveUsulan", "OK");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.toString() };
  }
}

function _saveUsulanToSheet(ss, data, user) {
  const sh = ss.getSheetByName(SH.USULAN);
  const last = sh.getLastRow();
  if (last > 1) sh.deleteRows(2, last - 1);
  sh.getRange(2, 1, 1, 3).setValues([
    [
      JSON.stringify(data || {}),
      new Date().toISOString(),
      user && user.username ? user.username : "",
    ],
  ]);
}

// ══════════════════════════════════════════════════════════════════════
//  CHECKLIST (Ceklist Harian Ruangan)
// ══════════════════════════════════════════════════════════════════════
function loadChecklist(ss) {
  ss = ss || getSpreadsheet();
  const sh = ss.getSheetByName(SH.CHECKLIST);
  const rows = sh.getDataRange().getValues();
  if (rows.length < 2) return {};
  const h = rows[0];

  // Bangun nested object: { roomId: { kat: { itemIndex: { dateKey: entry } } } }
  const result = {};
  for (let i = 1; i < rows.length; i++) {
    const r = rowToObj(h, rows[i]);
    const roomId = r.roomId || "";
    const kat = r.kat || "";
    const idx = Number(r.itemIndex) || 0;
    const dateKey = r.dateKey || "";
    let entry = {};
    try {
      entry = JSON.parse(r.payload_json || "{}");
    } catch (e) {}
    if (!result[roomId]) result[roomId] = {};
    if (!result[roomId][kat]) result[roomId][kat] = {};
    if (!result[roomId][kat][idx]) result[roomId][kat][idx] = {};
    result[roomId][kat][idx][dateKey] = entry;
  }
  return result;
}

function saveChecklist(data, user) {
  const ss = getSpreadsheet();
  const sh = ss.getSheetByName(SH.CHECKLIST);
  const last = sh.getLastRow();
  if (last > 1) sh.deleteRows(2, last - 1);

  // data = { roomId: { kat: { itemIndex: { dateKey: entry } } } }
  const rows = [];
  const now = new Date().toISOString();
  for (const roomId in data) {
    for (const kat in data[roomId]) {
      for (const idx in data[roomId][kat]) {
        for (const dateKey in data[roomId][kat][idx]) {
          const entry = data[roomId][kat][idx][dateKey];
          rows.push([
            roomId,
            kat,
            Number(idx),
            dateKey,
            JSON.stringify(entry),
            now,
          ]);
        }
      }
    }
  }

  if (rows.length > 0) {
    sh.getRange(2, 1, rows.length, 6).setValues(rows);
  }
  writeLog(ss, user.username, "saveChecklist", rows.length + " entries");
  return { ok: true };
}

function patchChecklist(data, user) {
  // Incremental update: data = { roomId: { kat: { idx: { dateKey: entry } } } }
  // Hanya update entry yang dikirim, tidak hapus data lain
  const ss = getSpreadsheet();
  const sh = ss.getSheetByName(SH.CHECKLIST);
  const last = sh.getLastRow();
  const now = new Date().toISOString();

  if (last < 2) {
    // Sheet kosong, langsung tulis semua
    return saveChecklist(data, user);
  }

  const h = sh.getRange(1, 1, 1, 6).getValues()[0];
  const allRows = sh.getRange(2, 1, last - 1, 6).getValues();
  const iRoomId = h.indexOf("roomId");
  const iKat = h.indexOf("kat");
  const iIdx = h.indexOf("itemIndex");
  const iDateKey = h.indexOf("dateKey");
  const iPayload = h.indexOf("payload_json");
  const iUpdated = h.indexOf("updatedAt");

  // Bangun index existing rows: "roomId|kat|idx|dateKey" → row number (1-based)
  const index = {};
  for (let i = 0; i < allRows.length; i++) {
    const key =
      allRows[i][iRoomId] +
      "|" +
      allRows[i][iKat] +
      "|" +
      allRows[i][iIdx] +
      "|" +
      allRows[i][iDateKey];
    index[key] = i + 2; // row number (1-based, +1 for header)
  }

  const newRows = [];
  const updateCells = [];

  for (const roomId in data) {
    for (const kat in data[roomId]) {
      for (const idx in data[roomId][kat]) {
        for (const dateKey in data[roomId][kat][idx]) {
          const entry = data[roomId][kat][idx][dateKey];
          const key = roomId + "|" + kat + "|" + Number(idx) + "|" + dateKey;
          const payload = JSON.stringify(entry);

          if (index[key]) {
            // Update existing row
            const rowNum = index[key];
            updateCells.push(
              sh.getRange(rowNum, iPayload + 1).setValue(payload),
            );
            updateCells.push(
              sh.getRange(rowNum, iUpdated + 1).setValue(now),
            );
          } else {
            // New row
            newRows.push([roomId, kat, Number(idx), dateKey, payload, now]);
          }
        }
      }
    }
  }

  // Append new rows
  if (newRows.length > 0) {
    sh.getRange(last + 1, 1, newRows.length, 6).setValues(newRows);
  }

  writeLog(
    ss,
    user.username,
    "patchChecklist",
    newRows.length +
      " new, " +
      Math.floor(updateCells.length / 2) +
      " updated",
  );
  return { ok: true };
}

// ══════════════════════════════════════════════════════════════════════
//  USER MANAGEMENT (Admin)
// ══════════════════════════════════════════════════════════════════════
function getUsers() {
  const ss = getSpreadsheet();
  const sh = ss.getSheetByName(SH.USERS);
  const rows = sh.getDataRange().getValues();
  if (rows.length < 2) return { ok: true, data: [] };
  const h = rows[0];
  return {
    ok: true,
    data: rows.slice(1).map((r) => {
      const u = rowToObj(h, r);
      delete u.password_hash;
      return u;
    }),
  };
}

function saveUser(data) {
  const ss = getSpreadsheet();
  const sh = ss.getSheetByName(SH.USERS);
  const rows = sh.getDataRange().getValues();
  const h = rows[0];
  const uIdx = h.indexOf("username");

  // Cek apakah update atau insert
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][uIdx] === data.username) {
      // Update
      const rowIdx = i + 1;
      if (data.nama)
        sh.getRange(rowIdx, h.indexOf("nama") + 1).setValue(data.nama);
      if (data.jabatan)
        sh.getRange(rowIdx, h.indexOf("jabatan") + 1).setValue(data.jabatan);
      if (data.role)
        sh.getRange(rowIdx, h.indexOf("role") + 1).setValue(data.role);
      if (data.avatar)
        sh.getRange(rowIdx, h.indexOf("avatar") + 1).setValue(data.avatar);
      if (data.password)
        sh.getRange(rowIdx, h.indexOf("password_hash") + 1).setValue(
          hash(data.password),
        );
      return { ok: true, action: "updated" };
    }
  }
  // Insert baru
  sh.appendRow([
    data.username,
    hash(data.password || "sidira2026"),
    data.nama || "",
    data.jabatan || "",
    data.role || "viewer",
    data.avatar || "👤",
    "",
  ]);
  return { ok: true, action: "created" };
}

function deleteUser(data) {
  const ss = getSpreadsheet();
  const sh = ss.getSheetByName(SH.USERS);
  const rows = sh.getDataRange().getValues();
  const uIdx = rows[0].indexOf("username");
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][uIdx] === data.username) {
      sh.deleteRow(i + 1);
      return { ok: true };
    }
  }
  return { ok: false, error: "User tidak ditemukan." };
}

// ══════════════════════════════════════════════════════════════════════
//  INFO APLIKASI
// ══════════════════════════════════════════════════════════════════════
function getAppInfo() {
  return {
    ok: true,
    app: "SIDIRA",
    versi: "3.1",
    instansi: "Puskesmas Baruharjo",
    kecamatan: "Durenan",
    kabupaten: "Trenggalek",
    tahun: 2026,
  };
}

// ══════════════════════════════════════════════════════════════════════
//  HELPER FUNCTIONS
// ══════════════════════════════════════════════════════════════════════

/**
 * Mendapatkan spreadsheet SIDIRA.
 * initSheets() hanya dipanggil jika ada sheet yang belum ada (lazy check).
 */
function getSpreadsheet() {
  const id = PropertiesService.getScriptProperties().getProperty(KEY_SHEET);
  if (!id)
    throw new Error(
      "Spreadsheet belum dikonfigurasi. Jalankan fungsi setup() terlebih dahulu.",
    );
  const ss = SpreadsheetApp.openById(id);

  // Lazy init: hanya jalankan initSheets jika ada sheet yang kurang
  const needed = Object.values(SH);
  const exist = ss.getSheets().map((s) => s.getName());
  const missing = needed.some((name) => !exist.includes(name));
  if (missing) {
    initSheets(ss);
  }

  return ss;
}

function rowToObj(header, row) {
  const obj = {};
  header.forEach((k, i) => {
    obj[k] = row[i] !== undefined ? row[i] : "";
  });
  return obj;
}

function rowToUser(header, row) {
  const u = rowToObj(header, row);
  delete u.password_hash;
  return u;
}

function generateToken() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 48; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

function hash(str) {
  // SHA-256 menggunakan Utilities GAS
  const bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    str,
    Utilities.Charset.UTF_8,
  );
  return bytes
    .map((b) => (b < 0 ? b + 256 : b).toString(16).padStart(2, "0"))
    .join("");
}

function handleSetup(body) {
  // Boleh dipanggil sekali
  const exist = PropertiesService.getScriptProperties().getProperty(KEY_SHEET);
  if (exist) return { ok: false, error: "Setup sudah dilakukan sebelumnya." };
  const url = setup();
  return { ok: true, message: "Setup berhasil. Spreadsheet: " + url };
}

function writeLog(ss, username, action, detail) {
  try {
    ss.getSheetByName(SH.LOG).appendRow([
      new Date().toISOString(),
      username,
      action,
      detail,
    ]);
  } catch (e) {}
}
