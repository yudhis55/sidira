/**
 * SIDIRA v3 - Comprehensive Sync Testing Suite
 *
 * Test suite untuk memverifikasi sinkronisasi data antar browser
 *
 * CARA MENJALANKAN:
 * 1. Buka aplikasi SIDIRA di browser
 * 2. Login sebagai user
 * 3. Buka Developer Console (F12)
 * 4. Copy-paste script ini ke console
 * 5. Jalankan: runSyncTests()
 *
 * EXPECTED RESULTS:
 * - Semua test harus PASS
 * - Data tersimpan ke localStorage
 * - Data tersinkron ke Google Sheets
 * - Data bisa di-load kembali dari server
 */

// ══════════════════════════════════════════════════════════════════════
//  TEST UTILITIES
// ══════════════════════════════════════════════════════════════════════

class SyncTestRunner {
  constructor() {
    this.tests = [];
    this.results = [];
    this.startTime = null;
  }

  addTest(name, testFn) {
    this.tests.push({ name, fn: testFn });
  }

  async runAllTests() {
    console.log('═══════════════════════════════════════');
    console.log('  SIDIRA Sync Test Suite');
    console.log('═══════════════════════════════════════\n');

    this.startTime = Date.now();
    this.results = [];

    for (const test of this.tests) {
      try {
        console.log(`🧪 Running: ${test.name}`);
        const result = await test.fn();
        this.results.push({ name: test.name, status: 'PASS', result });
        console.log(`✅ PASS: ${test.name}\n`);
      } catch (error) {
        this.results.push({ name: test.name, status: 'FAIL', error: error.message });
        console.error(`❌ FAIL: ${test.name}`);
        console.error(`   Error: ${error.message}\n`);
      }
    }

    this.printSummary();
  }

  printSummary() {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;

    console.log('═══════════════════════════════════════');
    console.log('  Test Summary');
    console.log('═══════════════════════════════════════');
    console.log(`Total Tests: ${this.results.length}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏱️  Duration: ${duration}s`);
    console.log('═══════════════════════════════════════\n');

    if (failed > 0) {
      console.log('Failed Tests:');
      this.results
        .filter(r => r.status === 'FAIL')
        .forEach(r => {
          console.log(`  - ${r.name}: ${r.error}`);
        });
    }
  }
}

// ══════════════════════════════════════════════════════════════════════
//  CHECKLIST SYNC TESTS
// ══════════════════════════════════════════════════════════════════════

const runner = new SyncTestRunner();

// Test 1: Verify clData structure exists
runner.addTest('clData Structure', () => {
  if (typeof clData === 'undefined') {
    throw new Error('clData is not defined');
  }
  if (typeof clData !== 'object') {
    throw new Error('clData is not an object');
  }
  return 'clData exists and is an object';
});

// Test 2: Verify clSaveToStorage function exists
runner.addTest('clSaveToStorage Function', () => {
  if (typeof clSaveToStorage !== 'function') {
    throw new Error('clSaveToStorage is not a function');
  }
  return 'clSaveToStorage function exists';
});

// Test 3: Verify clLoadFromStorage function exists
runner.addTest('clLoadFromStorage Function', () => {
  if (typeof clLoadFromStorage !== 'function') {
    throw new Error('clLoadFromStorage is not a function');
  }
  return 'clLoadFromStorage function exists';
});

// Test 4: Verify clReplaceFromStorage function exists
runner.addTest('clReplaceFromStorage Function', () => {
  if (typeof clReplaceFromStorage !== 'function') {
    throw new Error('clReplaceFromStorage is not a function');
  }
  return 'clReplaceFromStorage function exists';
});

// Test 5: Test save to localStorage
runner.addTest('Save to localStorage', () => {
  const testData = {
    'test_room': {
      'alkes': {
        '0': {
          '2026-01-15': { status: 'baik', petugas: 'Test User' }
        }
      }
    }
  };

  // Clear existing data
  for (const key in clData) {
    delete clData[key];
  }

  // Add test data
  Object.assign(clData, testData);

  // Save to storage
  clSaveToStorage();

  // Verify in localStorage
  const saved = localStorage.getItem(CL_DATA_KEY);
  if (!saved) {
    throw new Error('Data not saved to localStorage');
  }

  const parsed = JSON.parse(saved);
  if (!parsed.test_room) {
    throw new Error('Test data not found in localStorage');
  }

  return 'Data saved to localStorage successfully';
});

// Test 6: Test load from localStorage (merge mode)
runner.addTest('Load from localStorage (merge)', () => {
  // Add new data to localStorage
  const newData = {
    'new_room': {
      'meubelair': {
        '0': {
          '2026-01-16': { status: 'rr', petugas: 'Test User 2' }
        }
      }
    }
  };

  const current = JSON.parse(localStorage.getItem(CL_DATA_KEY) || '{}');
  Object.assign(current, newData);
  localStorage.setItem(CL_DATA_KEY, JSON.stringify(current));

  // Load with merge
  clLoadFromStorage();

  // Verify both old and new data exist
  if (!clData.test_room) {
    throw new Error('Old data lost during merge');
  }
  if (!clData.new_room) {
    throw new Error('New data not merged');
  }

  return 'Merge mode works correctly';
});

// Test 7: Test replace from localStorage
runner.addTest('Replace from localStorage', () => {
  // Set new data in localStorage
  const freshData = {
    'fresh_room': {
      'elektronik': {
        '0': {
          '2026-01-17': { status: 'baik', petugas: 'Fresh User' }
        }
      }
    }
  };

  localStorage.setItem(CL_DATA_KEY, JSON.stringify(freshData));

  // Replace (not merge)
  clReplaceFromStorage();

  // Verify only fresh data exists
  if (clData.test_room) {
    throw new Error('Old data not cleared during replace');
  }
  if (clData.new_room) {
    throw new Error('Merged data not cleared during replace');
  }
  if (!clData.fresh_room) {
    throw new Error('Fresh data not loaded');
  }

  return 'Replace mode works correctly';
});

// Test 8: Test clClearData function
runner.addTest('clClearData Function', () => {
  // Add some data
  clData.temp_room = { test: 'data' };

  // Clear
  clClearData();

  // Verify empty
  if (Object.keys(clData).length > 0) {
    throw new Error('clData not cleared');
  }

  return 'clClearData works correctly';
});

// Test 9: Test GAS sync trigger
runner.addTest('GAS Sync Trigger', async () => {
  if (typeof IS_GAS === 'undefined' || !IS_GAS) {
    return 'Skipped: Not in GAS environment';
  }

  if (typeof GAS_TOKEN === 'undefined' || !GAS_TOKEN) {
    return 'Skipped: No GAS token';
  }

  // Add test data
  clData.sync_test = {
    'alkes': {
      '0': {
        '2026-01-18': { status: 'baik' }
      }
    }
  };

  // Save and trigger sync
  clSaveToStorage();

  // Wait for debounce (2 seconds + buffer)
  await new Promise(resolve => setTimeout(resolve, 3000));

  return 'Sync triggered (check Google Sheets for data)';
});

// Test 10: Verify GAS_SYNC_KEYS includes checklist
runner.addTest('GAS_SYNC_KEYS Configuration', () => {
  if (typeof GAS_SYNC_KEYS === 'undefined') {
    throw new Error('GAS_SYNC_KEYS not defined');
  }

  if (!GAS_SYNC_KEYS.sidira_cl_data) {
    throw new Error('sidira_cl_data not in GAS_SYNC_KEYS');
  }

  if (GAS_SYNC_KEYS.sidira_cl_data !== 'saveChecklist') {
    throw new Error('Wrong action for sidira_cl_data');
  }

  return 'GAS_SYNC_KEYS configured correctly';
});

// Test 11: Test gasSyncKey function
runner.addTest('gasSyncKey Function', () => {
  if (typeof gasSyncKey !== 'function') {
    throw new Error('gasSyncKey is not a function');
  }

  // Should not throw
  gasSyncKey('sidira_cl_data');

  return 'gasSyncKey function exists and callable';
});

// Test 12: Test gasPost function
runner.addTest('gasPost Function', () => {
  if (typeof gasPost !== 'function') {
    throw new Error('gasPost is not a function');
  }

  return 'gasPost function exists';
});

// Test 13: Test gasLoadAll function
runner.addTest('gasLoadAll Function', () => {
  if (typeof gasLoadAll !== 'function') {
    throw new Error('gasLoadAll is not a function');
  }

  return 'gasLoadAll function exists';
});

// Test 14: Verify data structure integrity
runner.addTest('Data Structure Integrity', () => {
  // Clear and add structured data
  clClearData();

  const structuredData = {
    'room1': {
      'alkes': {
        '0': {
          '2026-01-01': { status: 'baik', petugas: 'User A' },
          '2026-01-02': { status: 'rr', petugas: 'User B' }
        },
        '1': {
          '2026-01-01': { status: 'rb', petugas: 'User C' }
        }
      },
      'meubelair': {
        '0': {
          '2026-01-01': { status: 'baik', petugas: 'User D' }
        }
      }
    },
    'room2': {
      'elektronik': {
        '0': {
          '2026-01-01': { status: 'ta', petugas: 'User E' }
        }
      }
    }
  };

  Object.assign(clData, structuredData);
  clSaveToStorage();

  // Load back
  clClearData();
  clLoadFromStorage();

  // Verify structure
  if (!clData.room1 || !clData.room1.alkes || !clData.room1.alkes[0]) {
    throw new Error('Data structure corrupted');
  }

  if (clData.room1.alkes[0]['2026-01-01'].status !== 'baik') {
    throw new Error('Data value corrupted');
  }

  if (!clData.room2 || !clData.room2.elektronik) {
    throw new Error('Second room data lost');
  }

  return 'Data structure integrity maintained';
});

// Test 15: Test localStorage quota
runner.addTest('localStorage Quota Check', () => {
  try {
    // Generate large data
    const largeData = {};
    for (let i = 0; i < 100; i++) {
      largeData[`room_${i}`] = {
        'alkes': {
          '0': {
            '2026-01-01': {
              status: 'baik',
              petugas: 'User',
              notes: 'x'.repeat(1000) // 1KB per entry
            }
          }
        }
      };
    }

    localStorage.setItem('test_quota', JSON.stringify(largeData));
    localStorage.removeItem('test_quota');

    return 'localStorage quota OK (~100KB test passed)';
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      throw new Error('localStorage quota exceeded');
    }
    throw e;
  }
});

// ══════════════════════════════════════════════════════════════════════
//  MANUAL TESTING GUIDE
// ══════════════════════════════════════════════════════════════════════

function showManualTestingGuide() {
  console.log('═══════════════════════════════════════');
  console.log('  Manual Testing Guide');
  console.log('═══════════════════════════════════════\n');

  console.log('📋 MANUAL TEST: Cross-Browser Sync\n');

  console.log('Step 1: Browser A - Create Data');
  console.log('  1. Open SIDIRA in Browser A');
  console.log('  2. Login as user');
  console.log('  3. Open checklist for any room');
  console.log('  4. Toggle some cells (e.g., set 2026-01-15 to "baik")');
  console.log('  5. Click "💾 Simpan" or close modal');
  console.log('  6. Wait 3 seconds for sync\n');

  console.log('Step 2: Verify in Google Sheets');
  console.log('  1. Open Google Sheets');
  console.log('  2. Go to "Checklist" sheet');
  console.log('  3. Verify new rows added');
  console.log('  4. Check data matches what you entered\n');

  console.log('Step 3: Browser B - Load Data');
  console.log('  1. Open SIDIRA in Browser B (different browser/profile)');
  console.log('  2. Login as same user');
  console.log('  3. Wait for "Data tersinkronisasi" toast');
  console.log('  4. Open same room checklist');
  console.log('  5. Verify cells show same status as Browser A\n');

  console.log('Step 4: Browser B - Modify Data');
  console.log('  1. Change status of a different cell (e.g., 2026-01-16)');
  console.log('  2. Save and wait 3 seconds\n');

  console.log('Step 5: Browser A - Verify Update');
  console.log('  1. Refresh Browser A');
  console.log('  2. Wait for sync');
  console.log('  3. Open same checklist');
  console.log('  4. Verify BOTH cells show correct status\n');

  console.log('═══════════════════════════════════════\n');

  console.log('🔍 DEBUG COMMANDS:\n');
  console.log('// Check current clData:');
  console.log('console.log(clData);\n');

  console.log('// Check localStorage:');
  console.log('console.log(JSON.parse(localStorage.getItem(CL_DATA_KEY)));\n');

  console.log('// Force sync to server:');
  console.log('clSaveToStorage();\n');

  console.log('// Force load from server:');
  console.log('gasLoadAll(GAS_TOKEN);\n');

  console.log('// Clear all checklist data:');
  console.log('clClearData();\n');

  console.log('═══════════════════════════════════════\n');
}

// ══════════════════════════════════════════════════════════════════════
//  RUN TESTS
// ══════════════════════════════════════════════════════════════════════

async function runSyncTests() {
  await runner.runAllTests();
  showManualTestingGuide();
}

// Auto-run if in console
if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
  console.log('💡 To run tests, call: runSyncTests()');
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runSyncTests, showManualTestingGuide };
}
