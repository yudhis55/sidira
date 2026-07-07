/**
 * SIDIRA v3 - Migration Script
 * Script untuk migrasi data dari versi lama ke versi baru
 *
 * PERINGATAN: Backup data sebelum menjalankan migration!
 *
 * Cara menjalankan:
 * 1. Buka Apps Script editor
 * 2. Jalankan backupExistingData() terlebih dahulu
 * 3. Kemudian jalankan runMigration()
 * 4. Verifikasi hasil dengan verifyMigration()
 */

// ══════════════════════════════════════════════════════════════════════
//  BACKUP FUNCTIONS
// ══════════════════════════════════════════════════════════════════════

/**
 * Backup semua data existing sebelum migrasi
 * Disimpan ke sheet "Migration_Backup_[timestamp]"
 */
function backupExistingData() {
  console.log('═══════════════════════════════════════');
  console.log('  Starting Backup Process...');
  console.log('═══════════════════════════════════════\n');

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupSheetName = `Migration_Backup_${timestamp}`;

    // Create backup sheet
    let backupSheet = ss.getSheetByName(backupSheetName);
    if (!backupSheet) {
      backupSheet = ss.insertSheet(backupSheetName);
    }

    // Backup Usulan dari PropertiesService (jika ada)
    const props = PropertiesService.getScriptProperties();
    const usulanProp = props.getProperty('USULAN_DATA');

    const backupData = {
      timestamp: new Date().toISOString(),
      usulan_from_props: usulanProp || null,
      sheets_data: {}
    };

    // Backup data dari semua sheet
    const sheetsToBackup = ['Rooms', 'SBBK', 'Pakta', 'PJ', 'MvLog', 'UtilItems', 'UtilMeta', 'UtilState'];

    sheetsToBackup.forEach(sheetName => {
      const sheet = ss.getSheetByName(sheetName);
      if (sheet) {
        const data = sheet.getDataRange().getValues();
        backupData.sheets_data[sheetName] = data;
      }
    });

    // Save backup ke sheet
    const backupJson = JSON.stringify(backupData, null, 2);
    backupSheet.getRange(1, 1).setValue('BACKUP_DATA');
    backupSheet.getRange(2, 1).setValue(backupJson);

    console.log(`✅ Backup saved to sheet: ${backupSheetName}`);
    console.log(`   Data size: ${(backupJson.length / 1024).toFixed(2)} KB`);

    return backupSheetName;
  } catch (e) {
    console.error('❌ Backup failed:', e.message);
    throw e;
  }
}

/**
 * Restore data dari backup
 * @param {string} backupSheetName - Nama sheet backup
 */
function restoreFromBackup(backupSheetName) {
  console.log('═══════════════════════════════════════');
  console.log('  Starting Restore Process...');
  console.log('═══════════════════════════════════════\n');

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const backupSheet = ss.getSheetByName(backupSheetName);

    if (!backupSheet) {
      throw new Error(`Backup sheet "${backupSheetName}" not found`);
    }

    const backupJson = backupSheet.getRange(2, 1).getValue();
    const backupData = JSON.parse(backupJson);

    console.log(`📦 Restoring from backup: ${backupData.timestamp}`);

    // Restore Usulan ke PropertiesService
    if (backupData.usulan_from_props) {
      const props = PropertiesService.getScriptProperties();
      props.setProperty('USULAN_DATA', backupData.usulan_from_props);
      console.log('✅ Restored Usulan to PropertiesService');
    }

    // Restore sheet data
    for (const sheetName in backupData.sheets_data) {
      const sheet = ss.getSheetByName(sheetName);
      if (sheet) {
        const data = backupData.sheets_data[sheetName];
        sheet.clear();
        if (data.length > 0) {
          sheet.getRange(1, 1, data.length, data[0].length).setValues(data);
        }
        console.log(`✅ Restored sheet: ${sheetName} (${data.length} rows)`);
      }
    }

    console.log('\n✅ Restore completed successfully!');
  } catch (e) {
    console.error('❌ Restore failed:', e.message);
    throw e;
  }
}

// ══════════════════════════════════════════════════════════════════════
//  MIGRATION FUNCTIONS
// ══════════════════════════════════════════════════════════════════════

/**
 * Main migration function
 * Jalankan setelah backup berhasil
 */
function runMigration() {
  console.log('═══════════════════════════════════════');
  console.log('  SIDIRA v3.1 Migration');
  console.log('═══════════════════════════════════════\n');

  try {
    // Step 1: Migrate Usulan dari PropertiesService ke Sheet
    migrateUsulanToSheet();

    // Step 2: Fix MvLog field names (jika ada data lama)
    migrateMvLogFieldNames();

    // Step 3: Initialize Checklist sheet structure
    initializeChecklistSheet();

    // Step 4: Verify migration
    verifyMigration();

    console.log('\n═══════════════════════════════════════');
    console.log('  ✅ Migration Completed Successfully!');
    console.log('═══════════════════════════════════════');
  } catch (e) {
    console.error('\n❌ Migration failed:', e.message);
    console.error('Please restore from backup and try again.');
    throw e;
  }
}

/**
 * Migrate Usulan dari PropertiesService ke dedicated sheet
 */
function migrateUsulanToSheet() {
  console.log('📋 Migrating Usulan data...');

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const props = PropertiesService.getScriptProperties();

  // Check if Usulan sheet exists
  let usulanSheet = ss.getSheetByName('Usulan');
  if (!usulanSheet) {
    console.log('   Creating Usulan sheet...');
    usulanSheet = ss.insertSheet('Usulan');

    // Add header
    const header = ['id', 'payload_json', 'updated_at'];
    usulanSheet.getRange(1, 1, 1, 3).setValues([header]);
  }

  // Get data from PropertiesService
  const usulanProp = props.getProperty('USULAN_DATA');

  if (usulanProp) {
    console.log('   Found Usulan data in PropertiesService');

    try {
      const usulanData = JSON.parse(usulanProp);

      // Check if data already exists in sheet
      const existingData = usulanSheet.getDataRange().getValues();

      if (existingData.length <= 1) {
        // No data in sheet, migrate from PropertiesService
        const timestamp = new Date().toISOString();
        const row = [
          'usulan_data',
          usulanProp,
          timestamp
        ];

        usulanSheet.appendRow(row);
        console.log('   ✅ Migrated Usulan data to sheet');

        // Remove from PropertiesService after successful migration
        props.deleteProperty('USULAN_DATA');
        console.log('   ✅ Removed Usulan from PropertiesService');
      } else {
        console.log('   ⚠️  Usulan sheet already has data, skipping migration');
      }
    } catch (e) {
      console.error('   ❌ Failed to parse Usulan data:', e.message);
      throw e;
    }
  } else {
    console.log('   ℹ️  No Usulan data in PropertiesService');
  }
}

/**
 * Migrate MvLog field names dari versi lama
 * Old: namaItem, dariRoom, keRoom
 * New: nama, dari, ke
 */
function migrateMvLogFieldNames() {
  console.log('📋 Migrating MvLog field names...');

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const mvLogSheet = ss.getSheetByName('MvLog');

  if (!mvLogSheet) {
    console.log('   ℹ️  MvLog sheet not found, skipping');
    return;
  }

  const headerRange = mvLogSheet.getRange(1, 1, 1, mvLogSheet.getLastColumn());
  const headers = headerRange.getValues()[0];

  // Check if old field names exist
  const hasOldFields = headers.includes('namaItem') ||
                       headers.includes('dariRoom') ||
                       headers.includes('keRoom');

  if (hasOldFields) {
    console.log('   Found old field names, migrating...');

    // Map old to new
    const newHeaders = headers.map(h => {
      if (h === 'namaItem') return 'nama';
      if (h === 'dariRoom') return 'dari';
      if (h === 'keRoom') return 'ke';
      return h;
    });

    // Update header row
    headerRange.setValues([newHeaders]);
    console.log('   ✅ Updated MvLog header row');
  } else {
    console.log('   ✅ MvLog field names already up to date');
  }
}

/**
 * Initialize Checklist sheet structure
 */
function initializeChecklistSheet() {
  console.log('📋 Initializing Checklist sheet...');

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let checklistSheet = ss.getSheetByName('Checklist');

  if (!checklistSheet) {
    console.log('   Creating Checklist sheet...');
    checklistSheet = ss.insertSheet('Checklist');

    // Add header
    const header = ['roomId', 'kat', 'itemIndex', 'dateKey', 'payload_json'];
    checklistSheet.getRange(1, 1, 1, 5).setValues([header]);

    console.log('   ✅ Checklist sheet created');
  } else {
    console.log('   ✅ Checklist sheet already exists');
  }
}

// ══════════════════════════════════════════════════════════════════════
//  VERIFICATION FUNCTIONS
// ══════════════════════════════════════════════════════════════════════

/**
 * Verify migration results
 */
function verifyMigration() {
  console.log('\n═══════════════════════════════════════');
  console.log('  Verifying Migration...');
  console.log('═══════════════════════════════════════\n');

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const props = PropertiesService.getScriptProperties();

  let allGood = true;

  // Check 1: Usulan sheet exists and has correct structure
  console.log('1. Checking Usulan sheet...');
  const usulanSheet = ss.getSheetByName('Usulan');
  if (usulanSheet) {
    const headers = usulanSheet.getRange(1, 1, 1, 3).getValues()[0];
    if (headers[0] === 'id' && headers[1] === 'payload_json' && headers[2] === 'updated_at') {
      console.log('   ✅ Usulan sheet structure correct');
    } else {
      console.error('   ❌ Usulan sheet structure incorrect');
      allGood = false;
    }
  } else {
    console.error('   ❌ Usulan sheet not found');
    allGood = false;
  }

  // Check 2: Usulan removed from PropertiesService
  console.log('2. Checking PropertiesService cleanup...');
  const usulanProp = props.getProperty('USULAN_DATA');
  if (!usulanProp) {
    console.log('   ✅ Usulan removed from PropertiesService');
  } else {
    console.warn('   ⚠️  Usulan still exists in PropertiesService (may be intentional)');
  }

  // Check 3: MvLog field names
  console.log('3. Checking MvLog field names...');
  const mvLogSheet = ss.getSheetByName('MvLog');
  if (mvLogSheet) {
    const headers = mvLogSheet.getRange(1, 1, 1, mvLogSheet.getLastColumn()).getValues()[0];
    const hasNewFields = headers.includes('nama') &&
                         headers.includes('dari') &&
                         headers.includes('ke');
    const hasOldFields = headers.includes('namaItem') ||
                         headers.includes('dariRoom') ||
                         headers.includes('keRoom');

    if (hasNewFields && !hasOldFields) {
      console.log('   ✅ MvLog field names correct');
    } else {
      console.error('   ❌ MvLog field names incorrect');
      allGood = false;
    }
  } else {
    console.warn('   ⚠️  MvLog sheet not found');
  }

  // Check 4: Checklist sheet exists
  console.log('4. Checking Checklist sheet...');
  const checklistSheet = ss.getSheetByName('Checklist');
  if (checklistSheet) {
    const headers = checklistSheet.getRange(1, 1, 1, 5).getValues()[0];
    if (headers[0] === 'roomId' &&
        headers[1] === 'kat' &&
        headers[2] === 'itemIndex' &&
        headers[3] === 'dateKey' &&
        headers[4] === 'payload_json') {
      console.log('   ✅ Checklist sheet structure correct');
    } else {
      console.error('   ❌ Checklist sheet structure incorrect');
      allGood = false;
    }
  } else {
    console.error('   ❌ Checklist sheet not found');
    allGood = false;
  }

  // Check 5: All required sheets exist
  console.log('5. Checking all required sheets...');
  const requiredSheets = ['Users', 'Sessions', 'Rooms', 'SBBK', 'Pakta', 'PJ', 'MvLog',
                          'UtilItems', 'UtilMeta', 'UtilState', 'Usulan', 'Checklist', 'Log'];
  const missingSheets = requiredSheets.filter(name => !ss.getSheetByName(name));

  if (missingSheets.length === 0) {
    console.log('   ✅ All required sheets exist');
  } else {
    console.error('   ❌ Missing sheets:', missingSheets.join(', '));
    allGood = false;
  }

  // Summary
  console.log('\n═══════════════════════════════════════');
  if (allGood) {
    console.log('  ✅ All Verification Checks Passed!');
  } else {
    console.error('  ❌ Some Verification Checks Failed!');
    console.error('  Please review the errors above.');
  }
  console.log('═══════════════════════════════════════\n');

  return allGood;
}

/**
 * Generate migration report
 */
function generateMigrationReport() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const props = PropertiesService.getScriptProperties();

  const report = {
    timestamp: new Date().toISOString(),
    sheets: {},
    properties: {},
    summary: {}
  };

  // Collect sheet info
  const sheets = ss.getSheets();
  sheets.forEach(sheet => {
    const name = sheet.getName();
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();

    report.sheets[name] = {
      rows: lastRow,
      columns: lastCol,
      dataSize: lastRow > 0 ? `${lastRow} rows × ${lastCol} cols` : 'empty'
    };
  });

  // Collect properties info
  const keys = props.getKeys();
  keys.forEach(key => {
    const value = props.getProperty(key);
    report.properties[key] = {
      size: value ? `${value.length} chars` : 'null',
      preview: value ? value.substring(0, 100) : 'null'
    };
  });

  // Summary
  report.summary = {
    totalSheets: sheets.length,
    totalProperties: keys.length,
    usulanInSheet: !!ss.getSheetByName('Usulan'),
    usulanInProps: !!props.getProperty('USULAN_DATA'),
    checklistExists: !!ss.getSheetByName('Checklist')
  };

  // Create report sheet
  let reportSheet = ss.getSheetByName('Migration_Report');
  if (!reportSheet) {
    reportSheet = ss.insertSheet('Migration_Report');
  } else {
    reportSheet.clear();
  }

  const reportJson = JSON.stringify(report, null, 2);
  reportSheet.getRange(1, 1).setValue('MIGRATION_REPORT');
  reportSheet.getRange(2, 1).setValue(reportJson);

  console.log('✅ Migration report saved to sheet: Migration_Report');
  console.log('\nReport Summary:');
  console.log(JSON.stringify(report.summary, null, 2));

  return report;
}

// ══════════════════════════════════════════════════════════════════════
//  ROLLBACK FUNCTIONS
// ══════════════════════════════════════════════════════════════════════

/**
 * Rollback migration (restore Usulan to PropertiesService)
 * Use this if migration causes issues
 */
function rollbackMigration() {
  console.log('═══════════════════════════════════════');
  console.log('  Rolling Back Migration...');
  console.log('═══════════════════════════════════════\n');

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const props = PropertiesService.getScriptProperties();

    // Restore Usulan to PropertiesService
    const usulanSheet = ss.getSheetByName('Usulan');
    if (usulanSheet && usulanSheet.getLastRow() > 1) {
      const data = usulanSheet.getRange(2, 2).getValue(); // payload_json column
      if (data) {
        props.setProperty('USULAN_DATA', data);
        console.log('✅ Restored Usulan to PropertiesService');
      }
    }

    // Restore old MvLog field names
    const mvLogSheet = ss.getSheetByName('MvLog');
    if (mvLogSheet) {
      const headerRange = mvLogSheet.getRange(1, 1, 1, mvLogSheet.getLastColumn());
      const headers = headerRange.getValues()[0];

      const oldHeaders = headers.map(h => {
        if (h === 'nama') return 'namaItem';
        if (h === 'dari') return 'dariRoom';
        if (h === 'ke') return 'keRoom';
        return h;
      });

      headerRange.setValues([oldHeaders]);
      console.log('✅ Restored MvLog field names');
    }

    console.log('\n⚠️  Note: Checklist sheet was not removed (data preserved)');
    console.log('⚠️  You can manually delete it if needed.\n');

    console.log('✅ Rollback completed!');
  } catch (e) {
    console.error('❌ Rollback failed:', e.message);
    throw e;
  }
}

// ══════════════════════════════════════════════════════════════════════
//  CLEANUP FUNCTIONS
// ══════════════════════════════════════════════════════════════════════

/**
 * Clean up old backup sheets (older than 30 days)
 */
function cleanupOldBackups() {
  console.log('═══════════════════════════════════════');
  console.log('  Cleaning Up Old Backups...');
  console.log('═══════════════════════════════════════\n');

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  let deletedCount = 0;

  sheets.forEach(sheet => {
    const name = sheet.getName();

    // Check if it's a backup sheet
    if (name.startsWith('Migration_Backup_')) {
      // Extract timestamp from sheet name
      const timestampStr = name.replace('Migration_Backup_', '').replace(/-/g, ':');
      const sheetDate = new Date(timestampStr);

      if (sheetDate < thirtyDaysAgo) {
        ss.deleteSheet(sheet);
        console.log(`🗑️  Deleted old backup: ${name}`);
        deletedCount++;
      }
    }
  });

  console.log(`\n✅ Cleanup completed. Deleted ${deletedCount} old backup(s).`);
}

/**
 * Optimize spreadsheet (remove empty rows, etc)
 */
function optimizeSpreadsheet() {
  console.log('═══════════════════════════════════════');
  console.log('  Optimizing Spreadsheet...');
  console.log('═══════════════════════════════════════\n');

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();

  sheets.forEach(sheet => {
    const name = sheet.getName();
    const lastRow = sheet.getLastRow();
    const maxRows = sheet.getMaxRows();

    if (lastRow < maxRows) {
      const emptyRows = maxRows - lastRow;

      // Only delete if there are more than 100 empty rows
      if (emptyRows > 100) {
        sheet.deleteRows(lastRow + 1, emptyRows);
        console.log(`✅ ${name}: Removed ${emptyRows} empty rows`);
      }
    }
  });

  console.log('\n✅ Optimization completed!');
}

// ══════════════════════════════════════════════════════════════════════
//  UTILITY FUNCTIONS
// ══════════════════════════════════════════════════════════════════════

/**
 * List all backup sheets
 */
function listBackupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();

  console.log('═══════════════════════════════════════');
  console.log('  Available Backup Sheets');
  console.log('═══════════════════════════════════════\n');

  const backups = sheets.filter(s => s.getName().startsWith('Migration_Backup_'));

  if (backups.length === 0) {
    console.log('No backup sheets found.');
  } else {
    backups.forEach((sheet, idx) => {
      const name = sheet.getName();
      const timestamp = sheet.getRange(2, 1).getValue();
      console.log(`${idx + 1}. ${name}`);
      if (timestamp) {
        console.log(`   Created: ${timestamp}`);
      }
    });
  }

  console.log(`\nTotal: ${backups.length} backup(s)`);
}

/**
 * Show migration help
 */
function showMigrationHelp() {
  console.log('═══════════════════════════════════════');
  console.log('  SIDIRA v3.1 Migration Guide');
  console.log('═══════════════════════════════════════\n');

  console.log('📋 MIGRATION STEPS:');
  console.log('');
  console.log('1. BACKUP (Required)');
  console.log('   Run: backupExistingData()');
  console.log('   This creates a backup sheet with all your data.');
  console.log('');
  console.log('2. MIGRATE');
  console.log('   Run: runMigration()');
  console.log('   This performs the actual migration:');
  console.log('   - Migrates Usulan from PropertiesService to Sheet');
  console.log('   - Updates MvLog field names');
  console.log('   - Creates Checklist sheet');
  console.log('');
  console.log('3. VERIFY');
  console.log('   Run: verifyMigration()');
  console.log('   This checks if migration was successful.');
  console.log('');
  console.log('4. REPORT (Optional)');
  console.log('   Run: generateMigrationReport()');
  console.log('   This creates a detailed report of your data.');
  console.log('');
  console.log('═══════════════════════════════════════');
  console.log('');
  console.log('🔧 UTILITY FUNCTIONS:');
  console.log('');
  console.log('- listBackupSheets()     : List all backup sheets');
  console.log('- restoreFromBackup()    : Restore from a backup');
  console.log('- rollbackMigration()    : Undo migration changes');
  console.log('- cleanupOldBackups()    : Delete backups older than 30 days');
  console.log('- optimizeSpreadsheet()  : Remove empty rows');
  console.log('');
  console.log('═══════════════════════════════════════');
  console.log('');
  console.log('⚠️  IMPORTANT NOTES:');
  console.log('');
  console.log('- ALWAYS backup before migrating!');
  console.log('- Test migration in a copy first if possible');
  console.log('- Keep backups for at least 30 days');
  console.log('- Migration is reversible (use rollbackMigration)');
  console.log('');
  console.log('═══════════════════════════════════════\n');
}
