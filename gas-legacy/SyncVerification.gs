/**
 * VERIFIKASI END-TO-END SYNC
 * Fungsi-fungsi ini untuk MEMBUKTIKAN bahwa data benar-benar tersimpan ke Google Sheets
 * dan bisa di-load di browser session lain.
 *
 * JALANKAN DI APPS SCRIPT EDITOR untuk test dari server side.
 */

// ══════════════════════════════════════════════════════════════════════
//  TEST 1: Verifikasi data ada di Google Sheets
// ══════════════════════════════════════════════════════════════════════

function testChecklistInDatabase() {
  const ss = getSpreadsheet();
  const sh = ss.getSheetByName(SH.CHECKLIST);
  const lastRow = sh.getLastRow();

  console.log("=== TEST: Checklist Data in Database ===");
  console.log("Sheet: " + sh.getName());
  console.log("Total rows: " + lastRow);

  if (lastRow < 2) {
    console.log("❌ FAIL: No checklist data in database");
    return { success: false, message: "Database kosong", count: 0 };
  }

  const data = sh.getRange(2, 1, lastRow - 1, 6).getValues();
  console.log("✅ PASS: Found " + data.length + " checklist entries");

  // Sample beberapa entries
  console.log("\nSample entries:");
  const sampleSize = Math.min(5, data.length);
  for (let i = 0; i < sampleSize; i++) {
    const row = data[i];
    console.log(
      "  " +
        (i + 1) +
        ". RoomID=" +
        row[0] +
        ", Kat=" +
        row[1] +
        ", Idx=" +
        row[2] +
        ", Date=" +
        row[3],
    );
  }

  return {
    success: true,
    message: "Data ditemukan di database",
    count: data.length,
    sample: data.slice(0, sampleSize),
  };
}

// ══════════════════════════════════════════════════════════════════════
//  TEST 2: Simulasi save dari Browser A, load dari Browser B
// ══════════════════════════════════════════════════════════════════════

function testSyncFlow() {
  console.log("=== TEST: Sync Flow Simulation ===\n");

  // Login sebagai user test
  const loginRes = handleLogin({ username: "sidira", password: "sidira2026" });
  if (!loginRes.ok) {
    console.log("❌ FAIL: Login gagal");
    return { success: false, message: "Login gagal" };
  }

  const token = loginRes.token;
  const user = loginRes.user;
  console.log("✅ Login berhasil: " + user.username + " (" + user.nama + ")");

  // Step 1: Browser A - Save checklist data
  console.log("\n--- STEP 1: Browser A saves data ---");
  const testData = {
    "room-test-1": {
      alkes: {
        0: {
          "2026-06-18": {
            status: "baik",
            jenisKerusakan: "",
            uraianKerusakan: "",
            jenisTindakan: "",
            uraianTindakan: "",
            petugas: "Test User A",
            noLaporan: "",
          },
        },
        1: {
          "2026-06-18": {
            status: "rr",
            jenisKerusakan: "ringan",
            uraianKerusakan: "Test kerusakan ringan",
            jenisTindakan: "perbaikan",
            uraianTindakan: "Test tindakan",
            petugas: "Test User A",
            noLaporan: "LP-001",
          },
        },
      },
      meubelair: {
        2: {
          "2026-06-18": {
            status: "ta",
            jenisKerusakan: "",
            uraianKerusakan: "",
            jenisTindakan: "",
            uraianTindakan: "",
            petugas: "Test User A",
            noLaporan: "",
          },
        },
      },
    },
  };

  const saveRes = saveChecklist(testData, user);
  if (!saveRes.ok) {
    console.log("❌ FAIL: Save gagal - " + (saveRes.error || "Unknown error"));
    return { success: false, message: "Save gagal" };
  }
  console.log("✅ Save berhasil ke database");

  // Step 2: Verifikasi data ada di database
  console.log("\n--- STEP 2: Verify data in database ---");
  const dbCheck = testChecklistInDatabase();
  if (!dbCheck.success) {
    console.log("❌ FAIL: Data tidak ditemukan di database");
    return { success: false, message: "Data tidak tersimpan ke database" };
  }
  console.log("✅ Data terverifikasi di database: " + dbCheck.count + " entries");

  // Step 3: Browser B - Load data
  console.log("\n--- STEP 3: Browser B loads data ---");
  const loadedData = loadChecklist();
  const loadedKeys = Object.keys(loadedData);

  if (loadedKeys.length === 0) {
    console.log("❌ FAIL: Load mengembalikan data kosong");
    return { success: false, message: "Load gagal" };
  }

  console.log("✅ Load berhasil: " + loadedKeys.length + " rooms");

  // Step 4: Verifikasi data yang di-load sama dengan yang di-save
  console.log("\n--- STEP 4: Compare saved vs loaded data ---");
  let match = true;

  for (const roomId in testData) {
    if (!loadedData[roomId]) {
      console.log("❌ FAIL: Room " + roomId + " tidak ditemukan di loaded data");
      match = false;
      continue;
    }

    for (const kat in testData[roomId]) {
      if (!loadedData[roomId][kat]) {
        console.log(
          "❌ FAIL: Kategori " + kat + " tidak ditemukan di room " + roomId,
        );
        match = false;
        continue;
      }

      for (const idx in testData[roomId][kat]) {
        if (!loadedData[roomId][kat][idx]) {
          console.log(
            "❌ FAIL: Index " + idx + " tidak ditemukan di " + roomId + "/" + kat,
          );
          match = false;
          continue;
        }

        for (const dateKey in testData[roomId][kat][idx]) {
          const saved = testData[roomId][kat][idx][dateKey];
          const loaded = loadedData[roomId][kat][idx][dateKey];

          if (!loaded) {
            console.log(
              "❌ FAIL: DateKey " + dateKey + " tidak ditemukan di " + roomId + "/" + kat + "/" + idx,
            );
            match = false;
            continue;
          }

          // Bandingkan field-field penting
          const fields = [
            "status",
            "jenisKerusakan",
            "uraianKerusakan",
            "petugas",
            "noLaporan",
          ];
          for (const field of fields) {
            if (saved[field] !== loaded[field]) {
              console.log(
                "❌ FAIL: Field '" +
                  field +
                  "' mismatch di " +
                  roomId +
                  "/" +
                  kat +
                  "/" +
                  idx +
                  "/" +
                  dateKey,
              );
              console.log("  Saved: " + saved[field]);
              console.log("  Loaded: " + loaded[field]);
              match = false;
            }
          }
        }
      }
    }
  }

  if (match) {
    console.log("✅ PASS: Semua data match sempurna!");
    console.log(
      "\n🎉 SYNC FLOW TEST PASSED: Data dari Browser A bisa di-load oleh Browser B",
    );
    return { success: true, message: "Sync flow bekerja dengan benar" };
  } else {
    console.log("\n❌ FAIL: Ada data yang tidak match");
    return { success: false, message: "Data mismatch" };
  }
}

// ══════════════════════════════════════════════════════════════════════
//  TEST 3: Cek apakah saveChecklist action benar-benar dipanggil
// ══════════════════════════════════════════════════════════════════════

function testSaveChecklistAction() {
  console.log("=== TEST: saveChecklist Action ===\n");

  // Login
  const loginRes = handleLogin({ username: "sidira", password: "sidira2026" });
  if (!loginRes.ok) {
    console.log("❌ FAIL: Login gagal");
    return { success: false };
  }

  const token = loginRes.token;

  // Simulasi request dari frontend
  const requestBody = {
    action: "saveChecklist",
    token: token,
    data: {
      "room-action-test": {
        alkes: {
          0: {
            "2026-06-18": {
              status: "baik",
              jenisKerusakan: "",
              uraianKerusakan: "",
              jenisTindakan: "",
              uraianTindakan: "",
              petugas: "Action Test",
              noLaporan: "",
            },
          },
        },
      },
    },
  };

  console.log("Simulating request from frontend...");
  console.log("Request body: " + JSON.stringify(requestBody, null, 2));

  // Panggil executeAction seperti yang dipanggil oleh doPost_wrapper
  const result = executeAction(requestBody);

  console.log("\nResponse:");
  console.log(JSON.stringify(result, null, 2));

  if (result.ok) {
    console.log("✅ PASS: Action berhasil dieksekusi");

    // Verifikasi di database
    const ss = getSpreadsheet();
    const sh = ss.getSheetByName(SH.CHECKLIST);
    const lastRow = sh.getLastRow();

    console.log("Database check: " + (lastRow - 1) + " rows in Checklist sheet");

    return { success: true, message: "Action berhasil" };
  } else {
    console.log("❌ FAIL: Action gagal - " + (result.error || "Unknown error"));
    return { success: false, message: result.error };
  }
}

// ══════════════════════════════════════════════════════════════════════
//  TEST 4: Cek log untuk melihat apakah saveChecklist pernah dipanggil
// ══════════════════════════════════════════════════════════════════════

function testCheckSaveLogs() {
  console.log("=== TEST: Check Save Logs ===\n");

  const ss = getSpreadsheet();
  const logSheet = ss.getSheetByName(SH.LOG);
  const lastRow = logSheet.getLastRow();

  if (lastRow < 2) {
    console.log("❌ FAIL: Log sheet kosong");
    return { success: false, message: "Log kosong" };
  }

  const logs = logSheet.getRange(2, 1, lastRow - 1, 4).getValues();
  const saveLogs = logs.filter((row) => row[2] === "saveChecklist");

  console.log("Total log entries: " + logs.length);
  console.log("saveChecklist entries: " + saveLogs.length);

  if (saveLogs.length > 0) {
    console.log("\n✅ PASS: Found saveChecklist logs:");
    const recent = saveLogs.slice(-10); // 10 terakhir
    recent.forEach((row, i) => {
      console.log(
        "  " +
          (i + 1) +
          ". " +
          row[0] +
          " - " +
          row[1] +
          " - " +
          row[2] +
          " - " +
          row[3],
      );
    });
    return { success: true, count: saveLogs.length, recent: recent };
  } else {
    console.log("❌ FAIL: Tidak ada log saveChecklist");
    return { success: false, message: "Tidak ada saveChecklist log" };
  }
}

// ══════════════════════════════════════════════════════════════════════
//  RUN ALL TESTS
// ══════════════════════════════════════════════════════════════════════

function runAllSyncTests() {
  console.log("\n");
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║     SIDIRA - COMPREHENSIVE SYNC VERIFICATION TESTS         ║");
  console.log("╚════════════════════════════════════════════════════════════╝");
  console.log("\n");

  const results = [];

  // Test 1
  console.log("\n" + "=".repeat(60));
  const test1 = testChecklistInDatabase();
  results.push({ name: "Database Check", result: test1 });

  // Test 2
  console.log("\n" + "=".repeat(60));
  const test2 = testSyncFlow();
  results.push({ name: "Sync Flow", result: test2 });

  // Test 3
  console.log("\n" + "=".repeat(60));
  const test3 = testSaveChecklistAction();
  results.push({ name: "Save Action", result: test3 });

  // Test 4
  console.log("\n" + "=".repeat(60));
  const test4 = testCheckSaveLogs();
  results.push({ name: "Save Logs", result: test4 });

  // Summary
  console.log("\n\n");
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║                      TEST SUMMARY                          ║");
  console.log("╚════════════════════════════════════════════════════════════╝");
  console.log("\n");

  results.forEach((r, i) => {
    const status = r.result.success ? "✅ PASS" : "❌ FAIL";
    console.log((i + 1) + ". " + r.name + ": " + status);
    if (r.result.message) {
      console.log("   " + r.result.message);
    }
  });

  const passed = results.filter((r) => r.result.success).length;
  const total = results.length;

  console.log("\n");
  console.log("Total: " + passed + "/" + total + " tests passed");

  if (passed === total) {
    console.log("\n🎉 ALL TESTS PASSED! Backend sync bekerja dengan benar.");
    console.log(
      "\nJika cross-browser sync masih bermasalah, masalahnya ada di FRONTEND.",
    );
    console.log("Lihat: SyncDebugger.js untuk debug frontend");
  } else {
    console.log("\n❌ SOME TESTS FAILED! Ada masalah di backend.");
    console.log("Perbaiki backend dulu sebelum debug frontend.");
  }

  return results;
}
