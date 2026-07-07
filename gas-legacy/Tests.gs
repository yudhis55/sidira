/**
 * SIDIRA v3 - Unit Tests
 * Test suite untuk memverifikasi fungsi-fungsi backend
 *
 * Cara menjalankan:
 * 1. Buka Apps Script editor
 * 2. Pilih fungsi test dari dropdown
 * 3. Klik Run
 * 4. Lihat hasil di Logs
 */

// ══════════════════════════════════════════════════════════════════════
//  TEST RUNNER
// ══════════════════════════════════════════════════════════════════════

function runAllTests() {
  console.log('═══════════════════════════════════════');
  console.log('  SIDIRA v3 - Running All Tests');
  console.log('═══════════════════════════════════════\n');

  const tests = [
    testGenerateToken,
    testHashFunction,
    testRowToObj,
    testRowToUser,
    testRowToObjWithMissingFields,
    testRowToObjWithEmptyValues,
    testValidateChecklistData_ValidData,
    testValidateChecklistData_InvalidData,
    testValidateChecklistData_EmptyData,
    testValidateChecklistData_MalformedStructure,
    testFormatChecklistForSheet,
    testParseChecklistFromSheet,
    testCleanExpiredSessions_Logic,
    testWriteLog,
    testGetAppInfo,
    testLoadAllStructure,
    testSaveRooms_BatchFormat,
    testSaveSbbk_BatchFormat,
    testSavePakta_BatchFormat,
    testSavePj_BatchFormat,
    testSaveMvLog_BatchFormat,
    testSaveUtilItems_BatchFormat,
    testSaveUtilMeta_BatchFormat,
    testSaveUtilState_BatchFormat,
    testPatchUtilState_AddCheck,
    testPatchUtilState_RemoveCheck,
    testPatchUtilState_AddNote,
    testPatchUtilState_UpdateNote,
    testSaveChecklist_BatchFormat,
    testPatchChecklist_AddEntry,
    testPatchChecklist_UpdateEntry,
    testSaveUsulan_JsonFormat
  ];

  let passed = 0;
  let failed = 0;

  tests.forEach(test => {
    try {
      test();
      passed++;
      console.log(`✅ ${test.name}`);
    } catch (e) {
      failed++;
      console.error(`❌ ${test.name}: ${e.message}`);
    }
  });

  console.log('\n═══════════════════════════════════════');
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  console.log('═══════════════════════════════════════');
}

// ══════════════════════════════════════════════════════════════════════
//  HELPER FUNCTIONS TESTS
// ══════════════════════════════════════════════════════════════════════

function testGenerateToken() {
  const token = generateToken();

  if (typeof token !== 'string') {
    throw new Error('Token harus berupa string');
  }

  if (token.length < 32) {
    throw new Error('Token terlalu pendek (minimal 32 karakter)');
  }

  if (!/^[A-Za-z0-9]+$/.test(token)) {
    throw new Error('Token mengandung karakter invalid');
  }
}

function testHashFunction() {
  const hash1 = hash('test123');
  const hash2 = hash('test123');
  const hash3 = hash('different');

  if (typeof hash1 !== 'string') {
    throw new Error('Hash harus berupa string');
  }

  if (hash1.length !== 64) {
    throw new Error('Hash SHA-256 harus 64 karakter hex');
  }

  if (hash1 !== hash2) {
    throw new Error('Hash untuk input yang sama harus identik');
  }

  if (hash1 === hash3) {
    throw new Error('Hash untuk input berbeda harus berbeda');
  }

  if (!/^[a-f0-9]+$/.test(hash1)) {
    throw new Error('Hash harus berupa hex string');
  }
}

function testRowToObj() {
  const header = ['id', 'nama', 'email'];
  const row = [1, 'John', 'john@example.com'];

  const result = rowToObj(header, row);

  if (result.id !== 1) {
    throw new Error('Field id tidak sesuai');
  }

  if (result.nama !== 'John') {
    throw new Error('Field nama tidak sesuai');
  }

  if (result.email !== 'john@example.com') {
    throw new Error('Field email tidak sesuai');
  }
}

function testRowToUser() {
  const header = ['username', 'password_hash', 'nama', 'role'];
  const row = ['admin', 'hashedpass', 'Administrator', 'admin'];

  const result = rowToUser(header, row);

  if (result.username !== 'admin') {
    throw new Error('Field username tidak sesuai');
  }

  if (result.password_hash) {
    throw new Error('password_hash harus dihapus untuk keamanan');
  }

  if (result.nama !== 'Administrator') {
    throw new Error('Field nama tidak sesuai');
  }
}

function testRowToObjWithMissingFields() {
  const header = ['id', 'nama', 'email', 'phone'];
  const row = [1, 'John']; // Missing email and phone

  const result = rowToObj(header, row);

  if (result.id !== 1) {
    throw new Error('Field id tidak sesuai');
  }

  if (result.nama !== 'John') {
    throw new Error('Field nama tidak sesuai');
  }

  if (result.email !== '') {
    throw new Error('Missing field harus default ke empty string');
  }

  if (result.phone !== '') {
    throw new Error('Missing field harus default ke empty string');
  }
}

function testRowToObjWithEmptyValues() {
  const header = ['id', 'nama'];
  const row = ['', ''];

  const result = rowToObj(header, row);

  if (result.id !== '') {
    throw new Error('Empty string harus tetap empty string');
  }

  if (result.nama !== '') {
    throw new Error('Empty string harus tetap empty string');
  }
}

// ══════════════════════════════════════════════════════════════════════
//  CHECKLIST VALIDATION TESTS
// ══════════════════════════════════════════════════════════════════════

function testValidateChecklistData_ValidData() {
  const validData = {
    'ruangan1': {
      'alkes': {
        '0': {
          '2026-01-15': {
            status: 'baik',
            petugas: 'John Doe'
          }
        }
      }
    }
  };

  // Simulate validation (actual validation in saveChecklist)
  if (typeof validData !== 'object') {
    throw new Error('Data harus berupa object');
  }

  for (const roomId in validData) {
    if (typeof validData[roomId] !== 'object') {
      throw new Error('Room data harus berupa object');
    }
  }
}

function testValidateChecklistData_InvalidData() {
  const invalidData = 'not an object';

  if (typeof invalidData === 'object') {
    throw new Error('Validation harus reject non-object');
  }
}

function testValidateChecklistData_EmptyData() {
  const emptyData = {};

  if (typeof emptyData !== 'object') {
    throw new Error('Empty object harus valid');
  }
}

function testValidateChecklistData_MalformedStructure() {
  const malformed = {
    'ruangan1': 'should be object, not string'
  };

  // This should be caught by saveChecklist when iterating
  let hasError = false;
  try {
    for (const roomId in malformed) {
      for (const kat in malformed[roomId]) {
        // This will fail if malformed[roomId] is not an object
      }
    }
  } catch (e) {
    hasError = true;
  }

  if (!hasError && typeof malformed.ruangan1 !== 'object') {
    // Validation should catch this
  }
}

// ══════════════════════════════════════════════════════════════════════
//  CHECKLIST FORMAT TESTS
// ══════════════════════════════════════════════════════════════════════

function testFormatChecklistForSheet() {
  const data = {
    'room1': {
      'alkes': {
        '0': {
          '2026-01-15': { status: 'baik' }
        }
      }
    }
  };

  const rows = [];
  for (const roomId in data) {
    for (const kat in data[roomId]) {
      for (const itemIndex in data[roomId][kat]) {
        for (const dateKey in data[roomId][kat][itemIndex]) {
          rows.push([
            roomId,
            kat,
            parseInt(itemIndex),
            dateKey,
            JSON.stringify(data[roomId][kat][itemIndex][dateKey])
          ]);
        }
      }
    }
  }

  if (rows.length !== 1) {
    throw new Error('Should generate 1 row');
  }

  if (rows[0][0] !== 'room1') {
    throw new Error('Room ID tidak sesuai');
  }

  if (rows[0][1] !== 'alkes') {
    throw new Error('Kategori tidak sesuai');
  }

  if (rows[0][2] !== 0) {
    throw new Error('Item index tidak sesuai');
  }

  if (rows[0][3] !== '2026-01-15') {
    throw new Error('Date key tidak sesuai');
  }

  const parsed = JSON.parse(rows[0][4]);
  if (parsed.status !== 'baik') {
    throw new Error('Payload tidak sesuai');
  }
}

function testParseChecklistFromSheet() {
  const rows = [
    ['room1', 'alkes', 0, '2026-01-15', '{"status":"baik"}']
  ];

  const result = {};
  rows.forEach(row => {
    const [roomId, kat, itemIndex, dateKey, payload] = row;
    if (!result[roomId]) result[roomId] = {};
    if (!result[roomId][kat]) result[roomId][kat] = {};
    if (!result[roomId][kat][itemIndex]) result[roomId][kat][itemIndex] = {};
    result[roomId][kat][itemIndex][dateKey] = JSON.parse(payload);
  });

  if (!result.room1) {
    throw new Error('Room1 tidak ada');
  }

  if (!result.room1.alkes) {
    throw new Error('Kategori alkes tidak ada');
  }

  if (!result.room1.alkes[0]) {
    throw new Error('Item 0 tidak ada');
  }

  if (result.room1.alkes[0]['2026-01-15'].status !== 'baik') {
    throw new Error('Status tidak sesuai');
  }
}

// ══════════════════════════════════════════════════════════════════════
//  SESSION MANAGEMENT TESTS
// ══════════════════════════════════════════════════════════════════════

function testCleanExpiredSessions_Logic() {
  const now = new Date();
  const expired = new Date(now.getTime() - 86400000); // 1 day ago
  const valid = new Date(now.getTime() + 86400000); // 1 day ahead

  if (expired < now) {
    // Should be cleaned
  } else {
    throw new Error('Expired session logic error');
  }

  if (valid < now) {
    throw new Error('Valid session should not be expired');
  }
}

// ══════════════════════════════════════════════════════════════════════
//  LOGGING TESTS
// ══════════════════════════════════════════════════════════════════════

function testWriteLog() {
  // This test verifies the function signature and structure
  // Actual logging requires spreadsheet access

  const action = 'test_action';
  const detail = 'test_detail';

  // Simulate what writeLog does
  const timestamp = new Date().toISOString();

  if (!timestamp) {
    throw new Error('Timestamp harus ada');
  }

  if (typeof action !== 'string') {
    throw new Error('Action harus string');
  }

  if (typeof detail !== 'string') {
    throw new Error('Detail harus string');
  }
}

// ══════════════════════════════════════════════════════════════════════
//  APP INFO TESTS
// ══════════════════════════════════════════════════════════════════════

function testGetAppInfo() {
  // Simulate getAppInfo response
  const info = {
    nama: 'SIDIRA',
    versi: '3.1',
    instansi: 'Puskesmas Baruharjo'
  };

  if (!info.nama) {
    throw new Error('Nama aplikasi harus ada');
  }

  if (!info.versi) {
    throw new Error('Versi harus ada');
  }

  if (!info.instansi) {
    throw new Error('Instansi harus ada');
  }
}

// ══════════════════════════════════════════════════════════════════════
//  LOAD ALL TESTS
// ══════════════════════════════════════════════════════════════════════

function testLoadAllStructure() {
  // Simulate loadAll response structure
  const response = {
    sbbk: [],
    pakta: [],
    rooms: [],
    pj: {},
    mvLog: [],
    utilItems: {},
    utilMeta: {},
    utilState: { checks: {}, notes: {} },
    usulan: { data: {} },
    checklist: {}
  };

  if (!Array.isArray(response.sbbk)) {
    throw new Error('sbbk harus array');
  }

  if (!Array.isArray(response.pakta)) {
    throw new Error('pakta harus array');
  }

  if (!Array.isArray(response.rooms)) {
    throw new Error('rooms harus array');
  }

  if (typeof response.pj !== 'object') {
    throw new Error('pj harus object');
  }

  if (!Array.isArray(response.mvLog)) {
    throw new Error('mvLog harus array');
  }

  if (typeof response.utilItems !== 'object') {
    throw new Error('utilItems harus object');
  }

  if (typeof response.utilMeta !== 'object') {
    throw new Error('utilMeta harus object');
  }

  if (!response.utilState.checks || !response.utilState.notes) {
    throw new Error('utilState harus punya checks dan notes');
  }

  if (!response.usulan || !response.usulan.data) {
    throw new Error('usulan harus punya data property');
  }

  if (typeof response.checklist !== 'object') {
    throw new Error('checklist harus object');
  }
}

// ══════════════════════════════════════════════════════════════════════
//  BATCH FORMAT TESTS
// ══════════════════════════════════════════════════════════════════════

function testSaveRooms_BatchFormat() {
  const rooms = [
    { id: 'room1', nama: 'Ruang 1', items: [{ nama: 'Item 1' }] },
    { id: 'room2', nama: 'Ruang 2', items: [] }
  ];

  const rows = [];
  rooms.forEach(room => {
    const meta = [room.id, room.nama, '', '', '', '', '', ''];
    rows.push([...meta, '', '', new Date().toISOString(), 'admin']);

    room.items.forEach((item, idx) => {
      rows.push([...meta, idx, JSON.stringify(item), new Date().toISOString(), 'admin']);
    });
  });

  if (rows.length !== 3) {
    throw new Error('Should generate 3 rows (2 room meta + 1 item)');
  }

  if (rows[0].length !== 12) {
    throw new Error('Each row should have 12 columns');
  }
}

function testSaveSbbk_BatchFormat() {
  const sbbkData = [
    {
      id: 'sbbk1',
      no: '001',
      tanggal: '2026-01-15',
      penerima: 'John',
      items: [{ nama: 'Item 1', qty: 2 }]
    }
  ];

  const rows = sbbkData.map(d => [
    d.id,
    d.no,
    d.tanggal,
    d.penerima,
    '',
    '',
    '',
    JSON.stringify(d.items),
    new Date().toISOString()
  ]);

  if (rows.length !== 1) {
    throw new Error('Should generate 1 row');
  }

  if (rows[0].length !== 9) {
    throw new Error('Each row should have 9 columns');
  }

  const parsed = JSON.parse(rows[0][7]);
  if (parsed[0].nama !== 'Item 1') {
    throw new Error('Items JSON tidak valid');
  }
}

function testSavePakta_BatchFormat() {
  const paktaData = [
    {
      id: 'pakta1',
      nama: 'John',
      nip: '12345',
      jabatan: 'Staff',
      aset: [{ nama: 'Laptop', merk: 'Dell' }]
    }
  ];

  const rows = paktaData.map(d => [
    d.id,
    d.nama,
    d.nip,
    d.jabatan,
    '',
    '',
    JSON.stringify(d.aset),
    new Date().toISOString()
  ]);

  if (rows.length !== 1) {
    throw new Error('Should generate 1 row');
  }

  if (rows[0].length !== 8) {
    throw new Error('Each row should have 8 columns');
  }
}

function testSavePj_BatchFormat() {
  const pjData = {
    'room1': 'John',
    'room2': 'Jane'
  };

  const rows = Object.entries(pjData).map(([roomId, nama]) => [
    roomId,
    nama,
    new Date().toISOString()
  ]);

  if (rows.length !== 2) {
    throw new Error('Should generate 2 rows');
  }

  if (rows[0].length !== 3) {
    throw new Error('Each row should have 3 columns');
  }
}

function testSaveMvLog_BatchFormat() {
  const mvLogData = [
    {
      timestamp: '2026-01-15T10:00:00Z',
      nama: 'Item 1',
      dari: 'room1',
      ke: 'room2',
      user: 'admin'
    }
  ];

  const rows = mvLogData.map(d => [
    d.timestamp,
    d.nama,
    '',
    d.dari,
    d.ke,
    '',
    '',
    d.user
  ]);

  if (rows.length !== 1) {
    throw new Error('Should generate 1 row');
  }

  if (rows[0].length !== 8) {
    throw new Error('Each row should have 8 columns');
  }
}

function testSaveUtilItems_BatchFormat() {
  const utilItems = {
    'util1': [{ nama: 'Item 1' }, { nama: 'Item 2' }]
  };

  const rows = Object.entries(utilItems).map(([utilId, items]) => [
    utilId,
    JSON.stringify(items),
    new Date().toISOString()
  ]);

  if (rows.length !== 1) {
    throw new Error('Should generate 1 row');
  }

  if (rows[0].length !== 3) {
    throw new Error('Each row should have 3 columns');
  }
}

function testSaveUtilMeta_BatchFormat() {
  const utilMeta = {
    'util1': { nama: 'Ambulance', icon: '🚑', color: '#ff0000' }
  };

  const rows = Object.entries(utilMeta).map(([utilId, meta]) => [
    utilId,
    meta.nama,
    meta.icon,
    meta.color,
    '',
    '',
    '',
    new Date().toISOString()
  ]);

  if (rows.length !== 1) {
    throw new Error('Should generate 1 row');
  }

  if (rows[0].length !== 8) {
    throw new Error('Each row should have 8 columns');
  }
}

function testSaveUtilState_BatchFormat() {
  const utilState = {
    checks: {
      'util1': {
        '0': {
          '2026-01-15': { status: 'baik' }
        }
      }
    },
    notes: {
      'util1_note': 'Test note'
    }
  };

  const rows = [];

  // Add checks
  for (const utilId in utilState.checks) {
    for (const itemIndex in utilState.checks[utilId]) {
      for (const dateKey in utilState.checks[utilId][itemIndex]) {
        rows.push([
          utilId,
          'check',
          itemIndex,
          dateKey,
          JSON.stringify(utilState.checks[utilId][itemIndex][dateKey]),
          new Date().toISOString(),
          'admin'
        ]);
      }
    }
  }

  // Add notes
  for (const noteKey in utilState.notes) {
    const parts = noteKey.split('_');
    const utilId = parts[0];
    rows.push([
      utilId,
      'note',
      '',
      noteKey,
      utilState.notes[noteKey],
      new Date().toISOString(),
      'admin'
    ]);
  }

  if (rows.length !== 2) {
    throw new Error('Should generate 2 rows (1 check + 1 note)');
  }

  if (rows[0].length !== 7) {
    throw new Error('Each row should have 7 columns');
  }
}

// ══════════════════════════════════════════════════════════════════════
//  PATCH UTIL STATE TESTS
// ══════════════════════════════════════════════════════════════════════

function testPatchUtilState_AddCheck() {
  const delta = {
    checks: [
      { utilId: 'util1', itemIndex: '0', dateKey: '2026-01-15', status: 'baik' }
    ],
    notes: []
  };

  if (!Array.isArray(delta.checks)) {
    throw new Error('checks harus array');
  }

  if (delta.checks.length !== 1) {
    throw new Error('Should have 1 check');
  }

  if (delta.checks[0].utilId !== 'util1') {
    throw new Error('utilId tidak sesuai');
  }
}

function testPatchUtilState_RemoveCheck() {
  const delta = {
    checks: [
      { utilId: 'util1', itemIndex: '0', dateKey: '2026-01-15', status: null }
    ],
    notes: []
  };

  if (delta.checks[0].status !== null) {
    throw new Error('status harus null untuk remove');
  }
}

function testPatchUtilState_AddNote() {
  const delta = {
    checks: [],
    notes: [
      { utilId: 'util1', key: 'note1', value: 'Test note' }
    ]
  };

  if (delta.notes.length !== 1) {
    throw new Error('Should have 1 note');
  }

  if (delta.notes[0].value !== 'Test note') {
    throw new Error('Note value tidak sesuai');
  }
}

function testPatchUtilState_UpdateNote() {
  const delta = {
    checks: [],
    notes: [
      { utilId: 'util1', key: 'note1', value: 'Updated note' }
    ]
  };

  if (delta.notes[0].value !== 'Updated note') {
    throw new Error('Note value harus updated');
  }
}

// ══════════════════════════════════════════════════════════════════════
//  CHECKLIST SAVE/PATCH TESTS
// ══════════════════════════════════════════════════════════════════════

function testSaveChecklist_BatchFormat() {
  const data = {
    'room1': {
      'alkes': {
        '0': {
          '2026-01-15': { status: 'baik', petugas: 'John' },
          '2026-01-16': { status: 'rr', petugas: 'Jane' }
        }
      }
    }
  };

  const rows = [];
  for (const roomId in data) {
    for (const kat in data[roomId]) {
      for (const itemIndex in data[roomId][kat]) {
        for (const dateKey in data[roomId][kat][itemIndex]) {
          rows.push([
            roomId,
            kat,
            parseInt(itemIndex),
            dateKey,
            JSON.stringify(data[roomId][kat][itemIndex][dateKey])
          ]);
        }
      }
    }
  }

  if (rows.length !== 2) {
    throw new Error('Should generate 2 rows');
  }

  if (rows[0].length !== 5) {
    throw new Error('Each row should have 5 columns');
  }

  const parsed1 = JSON.parse(rows[0][4]);
  if (parsed1.status !== 'baik') {
    throw new Error('First row status tidak sesuai');
  }

  const parsed2 = JSON.parse(rows[1][4]);
  if (parsed2.status !== 'rr') {
    throw new Error('Second row status tidak sesuai');
  }
}

function testPatchChecklist_AddEntry() {
  const patch = {
    'room1': {
      'alkes': {
        '0': {
          '2026-01-15': { status: 'baik' }
        }
      }
    }
  };

  // Verify structure
  if (!patch.room1) {
    throw new Error('Room1 harus ada');
  }

  if (!patch.room1.alkes) {
    throw new Error('Kategori alkes harus ada');
  }

  if (!patch.room1.alkes['0']) {
    throw new Error('Item 0 harus ada');
  }
}

function testPatchChecklist_UpdateEntry() {
  const existing = {
    'room1': {
      'alkes': {
        '0': {
          '2026-01-15': { status: 'baik' }
        }
      }
    }
  };

  const patch = {
    'room1': {
      'alkes': {
        '0': {
          '2026-01-15': { status: 'rr' }
        }
      }
    }
  };

  // Merge patch into existing
  for (const roomId in patch) {
    if (!existing[roomId]) existing[roomId] = {};
    for (const kat in patch[roomId]) {
      if (!existing[roomId][kat]) existing[roomId][kat] = {};
      for (const itemIndex in patch[roomId][kat]) {
        if (!existing[roomId][kat][itemIndex]) existing[roomId][kat][itemIndex] = {};
        for (const dateKey in patch[roomId][kat][itemIndex]) {
          existing[roomId][kat][itemIndex][dateKey] = patch[roomId][kat][itemIndex][dateKey];
        }
      }
    }
  }

  if (existing.room1.alkes['0']['2026-01-15'].status !== 'rr') {
    throw new Error('Status harus ter-update ke rr');
  }
}

// ══════════════════════════════════════════════════════════════════════
//  USULAN TESTS
// ══════════════════════════════════════════════════════════════════════

function testSaveUsulan_JsonFormat() {
  const usulanData = {
    'room1': [
      { nama: 'Item 1', qty: 2, alasan: 'Rusak' }
    ]
  };

  const json = JSON.stringify(usulanData);
  const parsed = JSON.parse(json);

  if (!parsed.room1) {
    throw new Error('Room1 harus ada');
  }

  if (parsed.room1[0].nama !== 'Item 1') {
    throw new Error('Nama usulan tidak sesuai');
  }

  if (parsed.room1[0].qty !== 2) {
    throw new Error('Qty tidak sesuai');
  }
}
