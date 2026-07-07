/**
 * SIDIRA Sync Debugger
 *
 * Script ini akan memonitor semua operasi sync secara detail untuk menemukan bug
 *
 * CARA PAKAI:
 * 1. Buka SIDIRA di browser
 * 2. Buka Developer Console (F12)
 * 3. Copy-paste seluruh script ini
 * 4. Jalankan: startDebugging()
 * 5. Lakukan operasi checklist
 * 6. Lihat log yang dihasilkan
 */

(function() {
  'use strict';

  // Storage untuk log
  window.__SYNC_LOG__ = [];
  window.__DEBUG_MODE__ = false;

  // Helper untuk timestamp
  function getTimestamp() {
    return new Date().toISOString().substr(11, 12); // HH:MM:SS.mmm
  }

  // Helper untuk log
  function debugLog(category, message, data) {
    const entry = {
      timestamp: getTimestamp(),
      category: category,
      message: message,
      data: data ? JSON.parse(JSON.stringify(data)) : null
    };

    window.__SYNC_LOG__.push(entry);

    if (window.__DEBUG_MODE__) {
      console.log(
        `%c[${entry.timestamp}] %c${category}: %c${message}`,
        'color: #888',
        'color: #0af; font-weight: bold',
        'color: #fff',
        data || ''
      );
    }
  }

  // Intercept localStorage.setItem
  const originalSetItem = Storage.prototype.setItem;
  Storage.prototype.setItem = function(key, value) {
    if (this === localStorage && key.startsWith('sidira_')) {
      const size = (value.length / 1024).toFixed(2);
      debugLog('LOCALSTORAGE', `SET ${key} (${size} KB)`, {
        key: key,
        size: size + ' KB',
        preview: value.substring(0, 100) + '...'
      });
    }
    return originalSetItem.apply(this, arguments);
  };

  // Intercept localStorage.getItem
  const originalGetItem = Storage.prototype.getItem;
  Storage.prototype.getItem = function(key) {
    const result = originalGetItem.apply(this, arguments);
    if (this === localStorage && key.startsWith('sidira_') && result) {
      const size = (result.length / 1024).toFixed(2);
      debugLog('LOCALSTORAGE', `GET ${key} (${size} KB)`, {
        key: key,
        size: size + ' KB',
        preview: result.substring(0, 100) + '...'
      });
    }
    return result;
  };

  // Intercept google.script.run jika ada
  if (typeof google !== 'undefined' && google.script && google.script.run) {
    const originalRun = google.script.run;

    // Proxy untuk intercept semua method calls
    google.script.run = new Proxy(originalRun, {
      get: function(target, prop) {
        if (prop === 'doPost_wrapper') {
          return function(payload) {
            const data = JSON.parse(payload);
            debugLog('GAS_CALL', `doPost_wrapper(${data.action})`, {
              action: data.action,
              hasToken: !!data.token,
              dataSize: data.data ? JSON.stringify(data.data).length : 0
            });

            // Wrap success handler untuk logging
            const originalWithSuccess = target[prop].withSuccessHandler;
            const wrappedTarget = target[prop]
              .withSuccessHandler(function(response) {
                debugLog('GAS_RESPONSE', `${data.action} SUCCESS`, {
                  action: data.action,
                  ok: response.ok,
                  dataKeys: response.data ? Object.keys(response.data) : []
                });
                // Call original handler
                return originalWithSuccess.call(this, response);
              })
              .withFailureHandler(function(error) {
                debugLog('GAS_RESPONSE', `${data.action} FAILED`, {
                  action: data.action,
                  error: error.message
                });
              });

            return wrappedTarget.doPost_wrapper(payload);
          };
        }
        return target[prop];
      }
    });
  }

  // Monitor clSaveToStorage
  if (typeof window.clSaveToStorage === 'function') {
    const originalClSave = window.clSaveToStorage;
    window.clSaveToStorage = function() {
      debugLog('CHECKLIST', 'clSaveToStorage() called', {
        clDataKeys: Object.keys(window.clData || {}),
        totalEntries: countChecklistEntries()
      });
      return originalClSave.apply(this, arguments);
    };
  }

  // Monitor clLoadFromStorage
  if (typeof window.clLoadFromStorage === 'function') {
    const originalClLoad = window.clLoadFromStorage;
    window.clLoadFromStorage = function() {
      debugLog('CHECKLIST', 'clLoadFromStorage() called (BEFORE)', {
        clDataKeys: Object.keys(window.clData || {})
      });
      const result = originalClLoad.apply(this, arguments);
      debugLog('CHECKLIST', 'clLoadFromStorage() completed (AFTER)', {
        clDataKeys: Object.keys(window.clData || {}),
        totalEntries: countChecklistEntries()
      });
      return result;
    };
  }

  // Monitor clReplaceFromStorage
  if (typeof window.clReplaceFromStorage === 'function') {
    const originalClReplace = window.clReplaceFromStorage;
    window.clReplaceFromStorage = function() {
      debugLog('CHECKLIST', 'clReplaceFromStorage() called (BEFORE)', {
        clDataKeys: Object.keys(window.clData || {})
      });
      const result = originalClReplace.apply(this, arguments);
      debugLog('CHECKLIST', 'clReplaceFromStorage() completed (AFTER)', {
        clDataKeys: Object.keys(window.clData || {}),
        totalEntries: countChecklistEntries()
      });
      return result;
    };
  }

  // Monitor gasSyncKey
  if (typeof window.gasSyncKey === 'function') {
    const originalGasSyncKey = window.gasSyncKey;
    window.gasSyncKey = function(key) {
      debugLog('SYNC', `gasSyncKey("${key}") scheduled`, {
        key: key,
        willSync: !!(window.IS_GAS && window.GAS_TOKEN)
      });
      return originalGasSyncKey.apply(this, arguments);
    };
  }

  // Monitor gasSyncAllNow
  if (typeof window.gasSyncAllNow === 'function') {
    const originalGasSyncAll = window.gasSyncAllNow;
    window.gasSyncAllNow = function() {
      debugLog('SYNC', 'gasSyncAllNow() called', {
        keys: Object.keys(window.GAS_SYNC_KEYS || {})
      });
      return originalGasSyncAll.apply(this, arguments);
    };
  }

  // Monitor gasLoadAll
  if (typeof window.gasLoadAll === 'function') {
    const originalGasLoadAll = window.gasLoadAll;
    window.gasLoadAll = function(token) {
      debugLog('LOAD', 'gasLoadAll() called', {
        hasToken: !!token
      });
      return originalGasLoadAll.apply(this, arguments);
    };
  }

  // Helper untuk hitung total checklist entries
  function countChecklistEntries() {
    if (!window.clData) return 0;
    let count = 0;
    for (const roomId in window.clData) {
      for (const kat in window.clData[roomId]) {
        for (const idx in window.clData[roomId][kat]) {
          for (const dateKey in window.clData[roomId][kat][idx]) {
            count++;
          }
        }
      }
    }
    return count;
  }

  // Export fungsi untuk user
  window.startDebugging = function() {
    window.__DEBUG_MODE__ = true;
    console.log('%c✅ Sync Debugger Started', 'color: #0f0; font-size: 16px; font-weight: bold');
    console.log('%cSemua operasi sync akan di-log secara detail', 'color: #888');
    console.log('%cLakukan operasi checklist, lalu jalankan: showSyncLog()', 'color: #888');
  };

  window.stopDebugging = function() {
    window.__DEBUG_MODE__ = false;
    console.log('%c⏹️ Sync Debugger Stopped', 'color: #f80; font-size: 16px; font-weight: bold');
  };

  window.showSyncLog = function(filter) {
    let logs = window.__SYNC_LOG__;

    if (filter) {
      logs = logs.filter(log =>
        log.category.toLowerCase().includes(filter.toLowerCase()) ||
        log.message.toLowerCase().includes(filter.toLowerCase())
      );
    }

    console.log(`%c📋 Sync Log (${logs.length} entries)`, 'color: #0af; font-size: 14px; font-weight: bold');

    logs.forEach((log, idx) => {
      const colors = {
        'LOCALSTORAGE': '#f80',
        'GAS_CALL': '#0af',
        'GAS_RESPONSE': '#0f0',
        'CHECKLIST': '#f0f',
        'SYNC': '#ff0',
        'LOAD': '#0ff'
      };

      console.log(
        `%c${idx + 1}. [${log.timestamp}] %c${log.category}%c: ${log.message}`,
        'color: #888',
        `color: ${colors[log.category] || '#fff'}; font-weight: bold`,
        'color: #fff',
        log.data || ''
      );
    });
  };

  window.clearSyncLog = function() {
    window.__SYNC_LOG__ = [];
    console.log('%c🗑️ Sync log cleared', 'color: #888');
  };

  window.exportSyncLog = function() {
    const data = JSON.stringify(window.__SYNC_LOG__, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sync-log-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    console.log('%c💾 Sync log exported', 'color: #0f0');
  };

  window.analyzeSyncLog = function() {
    const logs = window.__SYNC_LOG__;

    console.log('%c🔍 Sync Log Analysis', 'color: #0af; font-size: 16px; font-weight: bold');

    // Hitung per kategori
    const categories = {};
    logs.forEach(log => {
      categories[log.category] = (categories[log.category] || 0) + 1;
    });

    console.log('\n%c📊 Operations by Category:', 'color: #ff0; font-weight: bold');
    Object.entries(categories).forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count}`);
    });

    // Cari potensi masalah
    console.log('\n%c⚠️ Potential Issues:', 'color: #f80; font-weight: bold');

    // Check apakah ada gasSyncAllNow setelah gasLoadAll
    const loadAllIndex = logs.findIndex(log => log.message.includes('gasLoadAll()'));
    const syncAllIndex = logs.findIndex(log => log.message.includes('gasSyncAllNow()'));

    if (loadAllIndex !== -1 && syncAllIndex !== -1 && syncAllIndex > loadAllIndex) {
      console.log('  ❌ CRITICAL: gasSyncAllNow() called AFTER gasLoadAll()!');
      console.log('     This will overwrite server data with local data!');
    }

    // Check apakah ada sync setelah load
    const loadIndices = logs.reduce((acc, log, idx) => {
      if (log.message.includes('clLoadFromStorage') || log.message.includes('clReplaceFromStorage')) {
        acc.push(idx);
      }
      return acc;
    }, []);

    const syncIndices = logs.reduce((acc, log, idx) => {
      if (log.message.includes('gasSyncKey') && log.category === 'SYNC') {
        acc.push(idx);
      }
      return acc;
    }, []);

    loadIndices.forEach(loadIdx => {
      const syncAfter = syncIndices.find(syncIdx => syncIdx > loadIdx && syncIdx < loadIdx + 10);
      if (syncAfter) {
        console.log(`  ⚠️  WARNING: Sync triggered shortly after load (load at #${loadIdx + 1}, sync at #${syncAfter + 1})`);
      }
    });

    // Check localStorage operations
    const lsOperations = logs.filter(log => log.category === 'LOCALSTORAGE');
    console.log(`\n  LocalStorage operations: ${lsOperations.length}`);
    console.log(`    - SET: ${lsOperations.filter(l => l.message.startsWith('SET')).length}`);
    console.log(`    - GET: ${lsOperations.filter(l => l.message.startsWith('GET')).length}`);

    // Check GAS calls
    const gasCalls = logs.filter(log => log.category === 'GAS_CALL');
    const gasResponses = logs.filter(log => log.category === 'GAS_RESPONSE');
    console.log(`\n  GAS API calls: ${gasCalls.length}`);
    console.log(`  GAS responses: ${gasResponses.length}`);

    if (gasCalls.length !== gasResponses.length) {
      console.log('  ⚠️  WARNING: Mismatch between calls and responses!');
    }
  };

  console.log('%c🔧 SIDIRA Sync Debugger Loaded', 'color: #0af; font-size: 18px; font-weight: bold');
  console.log('%cAvailable commands:', 'color: #888; font-size: 12px');
  console.log('  • startDebugging()  - Start logging (verbose mode)');
  console.log('  • stopDebugging()   - Stop logging');
  console.log('  • showSyncLog()     - Show all logs');
  console.log('  • showSyncLog("checklist") - Filter logs');
  console.log('  • analyzeSyncLog()  - Analyze for issues');
  console.log('  • exportSyncLog()   - Export to JSON file');
  console.log('  • clearSyncLog()    - Clear log history');
})();
