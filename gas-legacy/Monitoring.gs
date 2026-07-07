/**
 * SIDIRA v3 - Monitoring & Alerts System
 * Sistem monitoring untuk memantau penggunaan aplikasi
 *
 * Fitur:
 * - Monitor quota Google Apps Script
 * - Monitor error logs
 * - Monitor active sessions
 * - Monitor data size
 * - Email alerts untuk kondisi abnormal
 * - Performance tracking
 * - Scheduled monitoring (bisa otomatis)
 *
 * Cara setup:
 * 1. Jalankan setupMonitoring() untuk inisialisasi
 * 2. Setup email alerts dengan configureAlerts()
 * 3. Jalankan checkSystemHealth() untuk cek manual
 * 4. Setup triggers untuk monitoring otomatis (lihat setupTriggers())
 */

// ══════════════════════════════════════════════════════════════════════
//  CONFIGURATION
// ══════════════════════════════════════════════════════════════════════

const MONITORING_CONFIG = {
  // Email settings
  alertEmail: 'admin@example.com', // Ganti dengan email admin
  alertEnabled: true,

  // Thresholds
  quotaWarningThreshold: 0.70, // 70% usage
  quotaCriticalThreshold: 0.90, // 90% usage
  maxSessionAge: 8 * 60 * 60 * 1000, // 8 hours in ms
  maxErrorCount: 10, // Alert if more than 10 errors in last hour
  maxLogSize: 5000, // Alert if log sheet has more than 5000 rows

  // Monitoring intervals
  healthCheckInterval: 60, // minutes
  quotaCheckInterval: 360, // minutes (6 hours)
};

// ══════════════════════════════════════════════════════════════════════
//  SETUP FUNCTIONS
// ══════════════════════════════════════════════════════════════════════

/**
 * Setup monitoring system
 */
function setupMonitoring() {
  console.log('═══════════════════════════════════════');
  console.log('  Setting Up Monitoring System');
  console.log('═══════════════════════════════════════\n');

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Create Monitoring sheet
  let monitoringSheet = ss.getSheetByName('Monitoring');
  if (!monitoringSheet) {
    monitoringSheet = ss.insertSheet('Monitoring');
    console.log('✅ Created Monitoring sheet');
  }

  // Setup headers
  const headers = [
    'timestamp',
    'check_type',
    'status',
    'metric_name',
    'metric_value',
    'threshold',
    'details',
    'alert_sent'
  ];

  if (monitoringSheet.getLastRow() === 0) {
    monitoringSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    monitoringSheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    monitoringSheet.getRange(1, 1, 1, headers.length).setBackground('#4CAF50');
    monitoringSheet.getRange(1, 1, 1, headers.length).setFontColor('#FFFFFF');
    console.log('✅ Setup Monitoring headers');
  }

  // Create Monitoring_Config sheet
  let configSheet = ss.getSheetByName('Monitoring_Config');
  if (!configSheet) {
    configSheet = ss.insertSheet('Monitoring_Config');
    console.log('✅ Created Monitoring_Config sheet');

    // Add config data
    const configData = [
      ['Key', 'Value', 'Description'],
      ['alert_email', MONITORING_CONFIG.alertEmail, 'Email untuk menerima alerts'],
      ['alert_enabled', MONITORING_CONFIG.alertEnabled.toString(), 'Enable/disable email alerts'],
      ['quota_warning_threshold', MONITORING_CONFIG.quotaWarningThreshold.toString(), 'Warning threshold (0-1)'],
      ['quota_critical_threshold', MONITORING_CONFIG.quotaCriticalThreshold.toString(), 'Critical threshold (0-1)'],
      ['max_session_age', MONITORING_CONFIG.maxSessionAge.toString(), 'Max session age (ms)'],
      ['max_error_count', MONITORING_CONFIG.maxErrorCount.toString(), 'Max errors per hour before alert'],
      ['max_log_size', MONITORING_CONFIG.maxLogSize.toString(), 'Max log rows before alert'],
    ];

    configSheet.getRange(1, 1, configData.length, 3).setValues(configData);
    configSheet.getRange(1, 1, 1, 3).setFontWeight('bold');
    configSheet.getRange(1, 1, 1, 3).setBackground('#2196F3');
    configSheet.getRange(1, 1, 1, 3).setFontColor('#FFFFFF');
    console.log('✅ Setup Monitoring_Config');
  }

  console.log('\n═══════════════════════════════════════');
  console.log('  ✅ Monitoring Setup Complete!');
  console.log('═══════════════════════════════════════\n');

  console.log('Next steps:');
  console.log('1. Edit Monitoring_Config sheet to set your email');
  console.log('2. Run checkSystemHealth() to test monitoring');
  console.log('3. Run setupTriggers() to enable automatic monitoring');
}

/**
 * Configure email alerts
 */
function configureAlerts(email, enabled = true) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const configSheet = ss.getSheetByName('Monitoring_Config');

  if (!configSheet) {
    console.error('❌ Monitoring_Config sheet not found. Run setupMonitoring() first.');
    return;
  }

  // Update alert_email
  const data = configSheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === 'alert_email') {
      configSheet.getRange(i + 1, 2).setValue(email);
      console.log(`✅ Updated alert email to: ${email}`);
    }
    if (data[i][0] === 'alert_enabled') {
      configSheet.getRange(i + 1, 2).setValue(enabled.toString());
      console.log(`✅ Alert enabled: ${enabled}`);
    }
  }

  // Update MONITORING_CONFIG
  MONITORING_CONFIG.alertEmail = email;
  MONITORING_CONFIG.alertEnabled = enabled;
}

/**
 * Setup automatic triggers for monitoring
 */
function setupTriggers() {
  console.log('═══════════════════════════════════════');
  console.log('  Setting Up Automatic Triggers');
  console.log('═══════════════════════════════════════\n');

  // Delete existing triggers
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'scheduledHealthCheck' ||
        trigger.getHandlerFunction() === 'scheduledQuotaCheck') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  // Create health check trigger (every hour)
  ScriptApp.newTrigger('scheduledHealthCheck')
    .timeBased()
    .everyHours(1)
    .create();
  console.log('✅ Created health check trigger (every hour)');

  // Create quota check trigger (every 6 hours)
  ScriptApp.newTrigger('scheduledQuotaCheck')
    .timeBased()
    .everyHours(6)
    .create();
  console.log('✅ Created quota check trigger (every 6 hours)');

  console.log('\n═══════════════════════════════════════');
  console.log('  ✅ Triggers Setup Complete!');
  console.log('═══════════════════════════════════════\n');
}

/**
 * Remove all monitoring triggers
 */
function removeTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  let count = 0;

  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'scheduledHealthCheck' ||
        trigger.getHandlerFunction() === 'scheduledQuotaCheck') {
      ScriptApp.deleteTrigger(trigger);
      count++;
    }
  });

  console.log(`✅ Removed ${count} monitoring trigger(s)`);
}

// ══════════════════════════════════════════════════════════════════════
//  SCHEDULED FUNCTIONS (Called by triggers)
// ══════════════════════════════════════════════════════════════════════

/**
 * Scheduled health check (called by trigger)
 */
function scheduledHealthCheck() {
  console.log('⏰ Scheduled health check started');
  checkSystemHealth();
}

/**
 * Scheduled quota check (called by trigger)
 */
function scheduledQuotaCheck() {
  console.log('⏰ Scheduled quota check started');
  checkQuotaUsage();
}

// ══════════════════════════════════════════════════════════════════════
//  HEALTH CHECK FUNCTIONS
// ══════════════════════════════════════════════════════════════════════

/**
 * Comprehensive system health check
 */
function checkSystemHealth() {
  console.log('═══════════════════════════════════════');
  console.log('  System Health Check');
  console.log('═══════════════════════════════════════\n');

  const results = [];
  let overallStatus = 'healthy';

  // Check 1: Quota usage
  console.log('1. Checking quota usage...');
  const quotaCheck = checkQuotaUsage();
  results.push(quotaCheck);
  if (quotaCheck.status === 'critical') overallStatus = 'critical';
  else if (quotaCheck.status === 'warning' && overallStatus === 'healthy') overallStatus = 'warning';

  // Check 2: Active sessions
  console.log('2. Checking active sessions...');
  const sessionCheck = checkActiveSessions();
  results.push(sessionCheck);
  if (sessionCheck.status === 'critical') overallStatus = 'critical';
  else if (sessionCheck.status === 'warning' && overallStatus === 'healthy') overallStatus = 'warning';

  // Check 3: Error logs
  console.log('3. Checking error logs...');
  const errorCheck = checkErrorLogs();
  results.push(errorCheck);
  if (errorCheck.status === 'critical') overallStatus = 'critical';
  else if (errorCheck.status === 'warning' && overallStatus === 'healthy') overallStatus = 'warning';

  // Check 4: Log sheet size
  console.log('4. Checking log sheet size...');
  const logCheck = checkLogSize();
  results.push(logCheck);
  if (logCheck.status === 'critical') overallStatus = 'critical';
  else if (logCheck.status === 'warning' && overallStatus === 'healthy') overallStatus = 'warning';

  // Check 5: Data integrity
  console.log('5. Checking data integrity...');
  const integrityCheck = checkDataIntegrity();
  results.push(integrityCheck);
  if (integrityCheck.status === 'critical') overallStatus = 'critical';
  else if (integrityCheck.status === 'warning' && overallStatus === 'healthy') overallStatus = 'warning';

  // Check 6: Performance metrics
  console.log('6. Checking performance metrics...');
  const perfCheck = checkPerformanceMetrics();
  results.push(perfCheck);

  // Log results to Monitoring sheet
  logMonitoringResults(results);

  // Send alert if needed
  if (overallStatus !== 'healthy') {
    sendHealthAlert(overallStatus, results);
  }

  // Print summary
  console.log('\n═══════════════════════════════════════');
  console.log('  Health Check Summary');
  console.log('═══════════════════════════════════════\n');

  results.forEach(result => {
    const icon = result.status === 'healthy' ? '✅' :
                 result.status === 'warning' ? '⚠️' : '❌';
    console.log(`${icon} ${result.check_type}: ${result.status.toUpperCase()}`);
    console.log(`   ${result.metric_name}: ${result.metric_value}`);
    if (result.details) {
      console.log(`   ${result.details}`);
    }
  });

  console.log('\n═══════════════════════════════════════');
  const statusIcon = overallStatus === 'healthy' ? '✅' :
                     overallStatus === 'warning' ? '⚠️' : '❌';
  console.log(`  ${statusIcon} Overall Status: ${overallStatus.toUpperCase()}`);
  console.log('═══════════════════════════════════════\n');

  return {
    status: overallStatus,
    results: results,
    timestamp: new Date().toISOString()
  };
}

/**
 * Check Google Apps Script quota usage
 */
function checkQuotaUsage() {
  try {
    // Get quota limits
    const quotaLimit = UrlFetchApp.getRemainingDailyQuota();
    const quotaTotal = 20000; // Approximate daily quota for free accounts

    const usageRatio = 1 - (quotaLimit / quotaTotal);
    const usagePercent = (usageRatio * 100).toFixed(1);

    let status = 'healthy';
    if (usageRatio >= MONITORING_CONFIG.quotaCriticalThreshold) {
      status = 'critical';
    } else if (usageRatio >= MONITORING_CONFIG.quotaWarningThreshold) {
      status = 'warning';
    }

    const result = {
      timestamp: new Date().toISOString(),
      check_type: 'quota',
      status: status,
      metric_name: 'URL Fetch Quota Usage',
      metric_value: `${usagePercent}%`,
      threshold: `${(MONITORING_CONFIG.quotaWarningThreshold * 100).toFixed(0)}%`,
      details: `Remaining: ${quotaLimit} / ${quotaTotal}`,
      alert_sent: false
    };

    if (status !== 'healthy') {
      console.warn(`⚠️  Quota usage at ${usagePercent}%`);
    } else {
      console.log(`✅ Quota usage: ${usagePercent}%`);
    }

    return result;
  } catch (e) {
    console.error('❌ Error checking quota:', e.message);
    return {
      timestamp: new Date().toISOString(),
      check_type: 'quota',
      status: 'warning',
      metric_name: 'URL Fetch Quota Usage',
      metric_value: 'N/A',
      threshold: 'N/A',
      details: `Error: ${e.message}`,
      alert_sent: false
    };
  }
}

/**
 * Check active sessions
 */
function checkActiveSessions() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sessionsSheet = ss.getSheetByName('Sessions');

    if (!sessionsSheet || sessionsSheet.getLastRow() <= 1) {
      return {
        timestamp: new Date().toISOString(),
        check_type: 'sessions',
        status: 'healthy',
        metric_name: 'Active Sessions',
        metric_value: '0',
        threshold: 'N/A',
        details: 'No active sessions',
        alert_sent: false
      };
    }

    const data = sessionsSheet.getDataRange().getValues();
    const headers = data[0];
    const expiresAtIdx = headers.indexOf('expiresAt');

    if (expiresAtIdx === -1) {
      return {
        timestamp: new Date().toISOString(),
        check_type: 'sessions',
        status: 'warning',
        metric_name: 'Active Sessions',
        metric_value: 'N/A',
        threshold: 'N/A',
        details: 'expiresAt column not found',
        alert_sent: false
      };
    }

    const now = new Date();
    let activeCount = 0;
    let expiredCount = 0;

    for (let i = 1; i < data.length; i++) {
      const expiresAt = new Date(data[i][expiresAtIdx]);
      if (expiresAt > now) {
        activeCount++;
      } else {
        expiredCount++;
      }
    }

    let status = 'healthy';
    const details = `Active: ${activeCount}, Expired: ${expiredCount}`;

    if (expiredCount > 50) {
      status = 'warning';
    }

    console.log(`✅ Sessions - ${details}`);

    return {
      timestamp: new Date().toISOString(),
      check_type: 'sessions',
      status: status,
      metric_name: 'Active Sessions',
      metric_value: activeCount.toString(),
      threshold: 'N/A',
      details: details,
      alert_sent: false
    };
  } catch (e) {
    console.error('❌ Error checking sessions:', e.message);
    return {
      timestamp: new Date().toISOString(),
      check_type: 'sessions',
      status: 'warning',
      metric_name: 'Active Sessions',
      metric_value: 'N/A',
      threshold: 'N/A',
      details: `Error: ${e.message}`,
      alert_sent: false
    };
  }
}

/**
 * Check error logs in Log sheet
 */
function checkErrorLogs() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const logSheet = ss.getSheetByName('Log');

    if (!logSheet || logSheet.getLastRow() <= 1) {
      return {
        timestamp: new Date().toISOString(),
        check_type: 'errors',
        status: 'healthy',
        metric_name: 'Error Count (Last Hour)',
        metric_value: '0',
        threshold: MONITORING_CONFIG.maxErrorCount.toString(),
        details: 'No errors',
        alert_sent: false
      };
    }

    const data = logSheet.getDataRange().getValues();
    const headers = data[0];
    const timestampIdx = headers.indexOf('timestamp');
    const actionIdx = headers.indexOf('action');

    if (timestampIdx === -1 || actionIdx === -1) {
      return {
        timestamp: new Date().toISOString(),
        check_type: 'errors',
        status: 'warning',
        metric_name: 'Error Count (Last Hour)',
        metric_value: 'N/A',
        threshold: MONITORING_CONFIG.maxErrorCount.toString(),
        details: 'Required columns not found',
        alert_sent: false
      };
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    let errorCount = 0;

    for (let i = 1; i < data.length; i++) {
      const timestamp = new Date(data[i][timestampIdx]);
      const action = data[i][actionIdx].toString().toLowerCase();

      if (timestamp >= oneHourAgo && action.includes('error')) {
        errorCount++;
      }
    }

    let status = 'healthy';
    if (errorCount > MONITORING_CONFIG.maxErrorCount) {
      status = 'critical';
    } else if (errorCount > MONITORING_CONFIG.maxErrorCount * 0.5) {
      status = 'warning';
    }

    console.log(`✅ Errors (last hour): ${errorCount}`);

    return {
      timestamp: new Date().toISOString(),
      check_type: 'errors',
      status: status,
      metric_name: 'Error Count (Last Hour)',
      metric_value: errorCount.toString(),
      threshold: MONITORING_CONFIG.maxErrorCount.toString(),
      details: errorCount > 0 ? `${errorCount} errors in last hour` : 'No errors',
      alert_sent: false
    };
  } catch (e) {
    console.error('❌ Error checking error logs:', e.message);
    return {
      timestamp: new Date().toISOString(),
      check_type: 'errors',
      status: 'warning',
      metric_name: 'Error Count (Last Hour)',
      metric_value: 'N/A',
      threshold: MONITORING_CONFIG.maxErrorCount.toString(),
      details: `Error: ${e.message}`,
      alert_sent: false
    };
  }
}

/**
 * Check log sheet size
 */
function checkLogSize() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const logSheet = ss.getSheetByName('Log');

    if (!logSheet) {
      return {
        timestamp: new Date().toISOString(),
        check_type: 'log_size',
        status: 'healthy',
        metric_name: 'Log Sheet Size',
        metric_value: '0',
        threshold: MONITORING_CONFIG.maxLogSize.toString(),
        details: 'Log sheet not found',
        alert_sent: false
      };
    }

    const rowCount = logSheet.getLastRow();
    let status = 'healthy';

    if (rowCount > MONITORING_CONFIG.maxLogSize) {
      status = 'critical';
    } else if (rowCount > MONITORING_CONFIG.maxLogSize * 0.8) {
      status = 'warning';
    }

    console.log(`✅ Log size: ${rowCount} rows`);

    return {
      timestamp: new Date().toISOString(),
      check_type: 'log_size',
      status: status,
      metric_name: 'Log Sheet Size',
      metric_value: rowCount.toString(),
      threshold: MONITORING_CONFIG.maxLogSize.toString(),
      details: `${rowCount} rows in Log sheet`,
      alert_sent: false
    };
  } catch (e) {
    console.error('❌ Error checking log size:', e.message);
    return {
      timestamp: new Date().toISOString(),
      check_type: 'log_size',
      status: 'warning',
      metric_name: 'Log Sheet Size',
      metric_value: 'N/A',
      threshold: MONITORING_CONFIG.maxLogSize.toString(),
      details: `Error: ${e.message}`,
      alert_sent: false
    };
  }
}

/**
 * Check data integrity
 */
function checkDataIntegrity() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const issues = [];

    // Check required sheets
    const requiredSheets = ['Users', 'Sessions', 'Rooms', 'SBBK', 'Pakta', 'PJ', 'MvLog',
                           'UtilItems', 'UtilMeta', 'UtilState', 'Usulan', 'Checklist', 'Log'];

    requiredSheets.forEach(sheetName => {
      if (!ss.getSheetByName(sheetName)) {
        issues.push(`Missing sheet: ${sheetName}`);
      }
    });

    // Check Users sheet has admin
    const usersSheet = ss.getSheetByName('Users');
    if (usersSheet && usersSheet.getLastRow() > 1) {
      const data = usersSheet.getDataRange().getValues();
      const headers = data[0];
      const roleIdx = headers.indexOf('role');

      if (roleIdx !== -1) {
        let hasAdmin = false;
        for (let i = 1; i < data.length; i++) {
          if (data[i][roleIdx] === 'admin') {
            hasAdmin = true;
            break;
          }
        }

        if (!hasAdmin) {
          issues.push('No admin user found');
        }
      }
    }

    let status = 'healthy';
    if (issues.length > 0) {
      status = issues.length > 2 ? 'critical' : 'warning';
    }

    console.log(`✅ Data integrity: ${issues.length} issue(s)`);

    return {
      timestamp: new Date().toISOString(),
      check_type: 'integrity',
      status: status,
      metric_name: 'Data Integrity',
      metric_value: `${issues.length} issues`,
      threshold: '0',
      details: issues.length > 0 ? issues.join(', ') : 'No issues',
      alert_sent: false
    };
  } catch (e) {
    console.error('❌ Error checking data integrity:', e.message);
    return {
      timestamp: new Date().toISOString(),
      check_type: 'integrity',
      status: 'warning',
      metric_name: 'Data Integrity',
      metric_value: 'N/A',
      threshold: '0',
      details: `Error: ${e.message}`,
      alert_sent: false
    };
  }
}

/**
 * Check performance metrics
 */
function checkPerformanceMetrics() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const logSheet = ss.getSheetByName('Log');

    if (!logSheet || logSheet.getLastRow() <= 1) {
      return {
        timestamp: new Date().toISOString(),
        check_type: 'performance',
        status: 'healthy',
        metric_name: 'Avg Response Time',
        metric_value: 'N/A',
        threshold: 'N/A',
        details: 'No performance data',
        alert_sent: false
      };
    }

    // Calculate average operations per hour
    const data = logSheet.getDataRange().getValues();
    const headers = data[0];
    const timestampIdx = headers.indexOf('timestamp');

    if (timestampIdx === -1) {
      return {
        timestamp: new Date().toISOString(),
        check_type: 'performance',
        status: 'healthy',
        metric_name: 'Operations per Hour',
        metric_value: 'N/A',
        threshold: 'N/A',
        details: 'timestamp column not found',
        alert_sent: false
      };
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    let opsLastHour = 0;

    for (let i = 1; i < data.length; i++) {
      const timestamp = new Date(data[i][timestampIdx]);
      if (timestamp >= oneHourAgo) {
        opsLastHour++;
      }
    }

    console.log(`✅ Performance: ${opsLastHour} ops/hour`);

    return {
      timestamp: new Date().toISOString(),
      check_type: 'performance',
      status: 'healthy',
      metric_name: 'Operations per Hour',
      metric_value: opsLastHour.toString(),
      threshold: 'N/A',
      details: `${opsLastHour} operations in last hour`,
      alert_sent: false
    };
  } catch (e) {
    console.error('❌ Error checking performance:', e.message);
    return {
      timestamp: new Date().toISOString(),
      check_type: 'performance',
      status: 'healthy',
      metric_name: 'Operations per Hour',
      metric_value: 'N/A',
      threshold: 'N/A',
      details: `Error: ${e.message}`,
      alert_sent: false
    };
  }
}

// ══════════════════════════════════════════════════════════════════════
//  LOGGING & ALERTING FUNCTIONS
// ══════════════════════════════════════════════════════════════════════

/**
 * Log monitoring results to Monitoring sheet
 */
function logMonitoringResults(results) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const monitoringSheet = ss.getSheetByName('Monitoring');

    if (!monitoringSheet) {
      console.warn('⚠️  Monitoring sheet not found');
      return;
    }

    const rows = results.map(r => [
      r.timestamp,
      r.check_type,
      r.status,
      r.metric_name,
      r.metric_value,
      r.threshold,
      r.details,
      r.alert_sent ? 'YES' : 'NO'
    ]);

    if (rows.length > 0) {
      monitoringSheet.getRange(monitoringSheet.getLastRow() + 1, 1, rows.length, 8).setValues(rows);
    }
  } catch (e) {
    console.error('❌ Error logging monitoring results:', e.message);
  }
}

/**
 * Send health alert email
 */
function sendHealthAlert(status, results) {
  if (!MONITORING_CONFIG.alertEnabled) {
    console.log('ℹ️  Alerts disabled, skipping email');
    return;
  }

  if (!MONITORING_CONFIG.alertEmail || MONITORING_CONFIG.alertEmail === 'admin@example.com') {
    console.warn('⚠️  Alert email not configured');
    return;
  }

  try {
    const subject = `🚨 SIDIRA Alert: System ${status.toUpperCase()}`;

    let body = 'SIDIRA System Health Alert\n';
    body += '═══════════════════════════════════════\n\n';
    body += `Status: ${status.toUpperCase()}\n`;
    body += `Timestamp: ${new Date().toLocaleString('id-ID')}\n\n`;
    body += 'Details:\n';
    body += '───────────────────────────────────────\n\n';

    results.forEach(result => {
      const icon = result.status === 'healthy' ? '✅' :
                   result.status === 'warning' ? '⚠️' : '❌';
      body += `${icon} ${result.check_type}: ${result.status.toUpperCase()}\n`;
      body += `   ${result.metric_name}: ${result.metric_value}\n`;
      if (result.details) {
        body += `   ${result.details}\n`;
      }
      body += '\n';
    });

    body += '═══════════════════════════════════════\n';
    body += 'Action Required:\n';

    if (status === 'critical') {
      body += '• Immediate attention needed\n';
      body += '• Check system logs\n';
      body += '• Review quota usage\n';
      body += '• Clean up expired sessions if needed\n';
    } else {
      body += '• Monitor closely\n';
      body += '• Plan maintenance if trend continues\n';
    }

    body += '\n═══════════════════════════════════════\n';
    body += 'This is an automated alert from SIDIRA Monitoring System.\n';

    GmailApp.sendEmail(MONITORING_CONFIG.alertEmail, subject, body);
    console.log(`✅ Alert email sent to ${MONITORING_CONFIG.alertEmail}`);

    // Update results to mark alert sent
    results.forEach(r => r.alert_sent = true);
  } catch (e) {
    console.error('❌ Error sending alert email:', e.message);
  }
}

// ══════════════════════════════════════════════════════════════════════
//  DASHBOARD & REPORTS
// ══════════════════════════════════════════════════════════════════════

/**
 * Generate monitoring dashboard data
 */
function generateDashboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const monitoringSheet = ss.getSheetByName('Monitoring');

  if (!monitoringSheet || monitoringSheet.getLastRow() <= 1) {
    console.log('No monitoring data available');
    return null;
  }

  const data = monitoringSheet.getDataRange().getValues();
  const headers = data[0];

  // Get last 24 hours of data
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const recentData = [];
  for (let i = 1; i < data.length; i++) {
    const timestamp = new Date(data[i][0]);
    if (timestamp >= oneDayAgo) {
      recentData.push({
        timestamp: timestamp,
        check_type: data[i][1],
        status: data[i][2],
        metric_name: data[i][3],
        metric_value: data[i][4],
        threshold: data[i][5],
        details: data[i][6],
        alert_sent: data[i][7]
      });
    }
  }

  // Calculate statistics
  const stats = {
    total_checks: recentData.length,
    healthy_count: recentData.filter(r => r.status === 'healthy').length,
    warning_count: recentData.filter(r => r.status === 'warning').length,
    critical_count: recentData.filter(r => r.status === 'critical').length,
    alerts_sent: recentData.filter(r => r.alert_sent === 'YES').length,
    health_percentage: 0
  };

  if (stats.total_checks > 0) {
    stats.health_percentage = ((stats.healthy_count / stats.total_checks) * 100).toFixed(1);
  }

  console.log('═══════════════════════════════════════');
  console.log('  Monitoring Dashboard (Last 24 Hours)');
  console.log('═══════════════════════════════════════\n');
  console.log(`Total Checks: ${stats.total_checks}`);
  console.log(`✅ Healthy: ${stats.healthy_count}`);
  console.log(`⚠️  Warning: ${stats.warning_count}`);
  console.log(`❌ Critical: ${stats.critical_count}`);
  console.log(`📧 Alerts Sent: ${stats.alerts_sent}`);
  console.log(`📊 Health Score: ${stats.health_percentage}%`);
  console.log('═══════════════════════════════════════\n');

  return stats;
}

/**
 * Generate detailed monitoring report
 */
function generateMonitoringReport() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const monitoringSheet = ss.getSheetByName('Monitoring');

  if (!monitoringSheet || monitoringSheet.getLastRow() <= 1) {
    console.log('No monitoring data available');
    return;
  }

  const data = monitoringSheet.getDataRange().getValues();

  // Create report sheet
  let reportSheet = ss.getSheetByName('Monitoring_Report');
  if (!reportSheet) {
    reportSheet = ss.insertSheet('Monitoring_Report');
  } else {
    reportSheet.clear();
  }

  // Add title
  reportSheet.getRange(1, 1).setValue('SIDIRA Monitoring Report');
  reportSheet.getRange(1, 1).setFontSize(16);
  reportSheet.getRange(1, 1).setFontWeight('bold');

  // Add timestamp
  reportSheet.getRange(2, 1).setValue(`Generated: ${new Date().toLocaleString('id-ID')}`);

  // Add summary
  reportSheet.getRange(4, 1).setValue('Summary (Last 24 Hours)');
  reportSheet.getRange(4, 1).setFontWeight('bold');
  reportSheet.getRange(4, 1).setBackground('#2196F3');
  reportSheet.getRange(4, 1).setFontColor('#FFFFFF');

  const stats = generateDashboard();
  if (stats) {
    reportSheet.getRange(5, 1, 6, 2).setValues([
      ['Total Checks', stats.total_checks],
      ['Healthy', stats.healthy_count],
      ['Warning', stats.warning_count],
      ['Critical', stats.critical_count],
      ['Alerts Sent', stats.alerts_sent],
      ['Health Score', `${stats.health_percentage}%`]
    ]);
  }

  // Add recent alerts
  reportSheet.getRange(12, 1).setValue('Recent Alerts');
  reportSheet.getRange(12, 1).setFontWeight('bold');
  reportSheet.getRange(12, 1).setBackground('#FF9800');
  reportSheet.getRange(12, 1).setFontColor('#FFFFFF');

  const alerts = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][7] === 'YES') {
      alerts.push([
        data[i][0], // timestamp
        data[i][1], // check_type
        data[i][2], // status
        data[i][3], // metric_name
        data[i][6]  // details
      ]);
    }
  }

  if (alerts.length > 0) {
    reportSheet.getRange(13, 1, 1, 5).setValues([['Timestamp', 'Type', 'Status', 'Metric', 'Details']]);
    reportSheet.getRange(13, 1, 1, 5).setFontWeight('bold');
    reportSheet.getRange(14, 1, alerts.length, 5).setValues(alerts);
  } else {
    reportSheet.getRange(13, 1).setValue('No alerts in monitoring period');
  }

  console.log('✅ Monitoring report generated');
}

// ══════════════════════════════════════════════════════════════════════
//  MAINTENANCE FUNCTIONS
// ══════════════════════════════════════════════════════════════════════

/**
 * Clean old monitoring data (keep last 30 days)
 */
function cleanMonitoringData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const monitoringSheet = ss.getSheetByName('Monitoring');

  if (!monitoringSheet || monitoringSheet.getLastRow() <= 1) {
    console.log('No monitoring data to clean');
    return;
  }

  const data = monitoringSheet.getDataRange().getValues();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  let rowsToDelete = [];
  for (let i = 1; i < data.length; i++) {
    const timestamp = new Date(data[i][0]);
    if (timestamp < thirtyDaysAgo) {
      rowsToDelete.push(i + 1); // +1 because sheet rows are 1-indexed
    }
  }

  if (rowsToDelete.length > 0) {
    // Delete from bottom to top
    rowsToDelete.reverse();
    rowsToDelete.forEach(rowNum => {
      monitoringSheet.deleteRow(rowNum);
    });

    console.log(`✅ Cleaned ${rowsToDelete.length} old monitoring records`);
  } else {
    console.log('✅ No old data to clean');
  }
}

/**
 * Export monitoring data to CSV
 */
function exportMonitoringData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const monitoringSheet = ss.getSheetByName('Monitoring');

  if (!monitoringSheet || monitoringSheet.getLastRow() <= 1) {
    console.log('No monitoring data to export');
    return;
  }

  const data = monitoringSheet.getDataRange().getValues();
  const csv = data.map(row => row.join(',')).join('\n');

  // Create export sheet
  let exportSheet = ss.getSheetByName('Monitoring_Export');
  if (!exportSheet) {
    exportSheet = ss.insertSheet('Monitoring_Export');
  } else {
    exportSheet.clear();
  }

  exportSheet.getRange(1, 1).setValue('CSV_DATA');
  exportSheet.getRange(2, 1).setValue(csv);

  console.log('✅ Monitoring data exported to Monitoring_Export sheet');
  console.log('   Copy the CSV data from cell A2');
}

// ══════════════════════════════════════════════════════════════════════
//  UTILITY FUNCTIONS
// ══════════════════════════════════════════════════════════════════════

/**
 * Show monitoring help
 */
function showMonitoringHelp() {
  console.log('═══════════════════════════════════════');
  console.log('  SIDIRA Monitoring System Help');
  console.log('═══════════════════════════════════════\n');

  console.log('📋 SETUP FUNCTIONS:');
  console.log('');
  console.log('setupMonitoring()          - Initialize monitoring system');
  console.log('configureAlerts(email)     - Configure email alerts');
  console.log('setupTriggers()            - Setup automatic monitoring');
  console.log('removeTriggers()           - Remove automatic triggers');
  console.log('');
  console.log('═══════════════════════════════════════');
  console.log('');
  console.log('🔍 HEALTH CHECK FUNCTIONS:');
  console.log('');
  console.log('checkSystemHealth()        - Run comprehensive health check');
  console.log('checkQuotaUsage()          - Check Google Apps Script quota');
  console.log('checkActiveSessions()      - Check active user sessions');
  console.log('checkErrorLogs()           - Check error logs');
  console.log('checkLogSize()             - Check log sheet size');
  console.log('checkDataIntegrity()       - Check data integrity');
  console.log('checkPerformanceMetrics()  - Check performance metrics');
  console.log('');
  console.log('═══════════════════════════════════════');
  console.log('');
  console.log('📊 DASHBOARD & REPORTS:');
  console.log('');
  console.log('generateDashboard()        - Generate dashboard summary');
  console.log('generateMonitoringReport() - Generate detailed report');
  console.log('');
  console.log('═══════════════════════════════════════');
  console.log('');
  console.log('🔧 MAINTENANCE FUNCTIONS:');
  console.log('');
  console.log('cleanMonitoringData()      - Clean old monitoring data');
  console.log('exportMonitoringData()     - Export monitoring data');
  console.log('');
  console.log('═══════════════════════════════════════\n');
}
