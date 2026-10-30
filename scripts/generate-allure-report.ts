/**
 * @fileoverview Script for generating timestamped Allure HTML reports and executing tests.
 * Ensures Allure HTML reports are generated after complete test execution (even on test failure),
 * creating isolated timestamped report folders for every execution run.
 *
 * Flags:
 *   --run   Run Playwright tests before generating the report.
 *   --open  Open the generated Allure HTML report in the browser after generation.
 */

import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

/** Known internal flags consumed by this script — never forwarded to Playwright. */
const INTERNAL_FLAGS = new Set(['--run', '--open']);

/** Detect whether the current invocation was via ts-node (argv[1] is the .ts script). */
const scriptIndex = process.argv.findIndex((a) => a.endsWith('generate-allure-report.ts'));
const USER_ARGS_START = scriptIndex !== -1 ? scriptIndex + 1 : 2;

/** All CLI args passed after the script name, excluding our internal flags. */
const rawArgs = process.argv.slice(USER_ARGS_START);
const shouldRun = rawArgs.includes('--run');
const shouldOpen = rawArgs.includes('--open');
/** Any extra args the user wants forwarded to `playwright test` (e.g. --grep @smoke). */
const playwrightExtraArgs = rawArgs.filter((a) => !INTERNAL_FLAGS.has(a));

/**
 * Format current date-time into a clean timestamp string (YYYY-MM-DD_HH-mm-ss).
 */
export function getTimestamp(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
  ].join('-') + '_' + [
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds()),
  ].join('-');
}

/**
 * Generate Allure HTML report from allure-results into a unique timestamped folder.
 *
 * @param timestamp Optional custom timestamp directory name
 * @returns Path to the generated Allure HTML report folder, or empty string on failure
 */
export function generateAllureReport(timestamp: string = getTimestamp()): string {
  const rootDir = process.cwd();
  const resultsDir = path.join(rootDir, 'allure-results');
  const reportsBaseDir = path.join(rootDir, 'reports', 'allure');
  const targetReportDir = path.join(reportsBaseDir, timestamp);
  const latestReportDir = path.join(reportsBaseDir, 'latest');

  console.log('\n======================================================');
  console.log('📊 ALLURE REPORT GENERATION');
  console.log('======================================================');

  if (!fs.existsSync(resultsDir) || fs.readdirSync(resultsDir).length === 0) {
    console.warn('⚠️  No allure-results found. Skipping report generation.');
    return '';
  }

  fs.mkdirSync(targetReportDir, { recursive: true });
  console.log(`📁 Target Report Directory: ${targetReportDir}`);
  console.log('🔨 Compiling Allure HTML Report...');

  // Cross-platform allure generate command
  const allureProcess = spawnSync('npx', ['allure', 'generate', `"${resultsDir}"`, '--clean', '-o', `"${targetReportDir}"`], {
    stdio: 'inherit',
    shell: true,
    cwd: rootDir,
  });

  if (allureProcess.status !== 0) {
    console.error('❌ Failed to generate Allure HTML report.');
    console.log('======================================================\n');
    return '';
  }

  console.log('✅ Allure HTML Report successfully generated at:');
  console.log(`   👉 ${targetReportDir}`);

  // Update 'latest' snapshot for quick access
  try {
    if (fs.existsSync(latestReportDir)) {
      fs.rmSync(latestReportDir, { recursive: true, force: true });
    }
    fs.cpSync(targetReportDir, latestReportDir, { recursive: true });
    console.log(`   👉 Latest link updated at: ${latestReportDir}`);
  } catch (err) {
    console.warn('⚠️  Could not update latest report snapshot:', err);
  }

  console.log('======================================================\n');
  return targetReportDir;
}

/**
 * Opens the Allure HTML report in the default browser.
 * Starts the Allure HTTP server (blocking), and after a short delay explicitly
 * launches the browser via the OS open command so it works in all terminals
 * including Git Bash on Windows.
 *
 * Press Ctrl+C to stop the server.
 *
 * @param reportDir Path to the compiled Allure HTML report directory
 */
export function openAllureReport(reportDir: string): void {
  if (!reportDir || !fs.existsSync(reportDir)) {
    console.warn('⚠️  Report directory not found. Cannot open Allure report.');
    return;
  }

  const port = 9999;
  const reportUrl = `http://localhost:${port}`;

  console.log(`\n🌐 Starting Allure report server → ${reportUrl}`);
  console.log('   Press Ctrl+C to stop the server when done viewing.\n');

  // After 1.5s (enough time for the server to start), open the browser explicitly.
  // We use a detached child so it fires while spawnSync below is blocking.
  const { spawn: spawnBg } = require('child_process') as typeof import('child_process');
  const openTimer = setTimeout(() => {
    // Cross-platform OS browser open
    const openCmd =
      process.platform === 'win32'
        ? `cmd /c start "" "${reportUrl}"`
        : process.platform === 'darwin'
          ? `open "${reportUrl}"`
          : `xdg-open "${reportUrl}"`;

    spawnBg(openCmd, { shell: true, stdio: 'ignore', detached: true }).unref();
    console.log(`   ✅ Report opened in browser: ${reportUrl}\n`);
  }, 1500);

  // Block the process here — allure open starts the HTTP server and stays alive.
  // When user presses Ctrl+C, spawnSync returns and we exit.
  spawnSync('npx', ['allure', 'open', `"${reportDir}"`, '--port', String(port)], {
    shell: true,
    stdio: 'inherit',
  });

  clearTimeout(openTimer);
}


/**
 * Executes Playwright tests, then guarantees Allure HTML report generation after run completion.
 * Preserves the original Playwright test execution exit code for CI/CD pipeline compatibility.
 */
export function runAndReport(): void {
  const rootDir = process.cwd();

  // Only forward user-supplied args that are NOT our internal flags to playwright
  const testArgs = ['playwright', 'test', ...playwrightExtraArgs];

  console.log('🚀 Starting Playwright Test Execution...');
  if (playwrightExtraArgs.length > 0) {
    console.log(`   Extra args: ${playwrightExtraArgs.join(' ')}`);
  }

  const testProcess = spawnSync('npx', testArgs, {
    stdio: 'inherit',
    shell: true,
    cwd: rootDir,
    env: {
      ...process.env,
      PLAYWRIGHT_BROWSERS_PATH:
        process.env.PLAYWRIGHT_BROWSERS_PATH ||
        (fs.existsSync('D:\\ms-playwright') ? 'D:\\ms-playwright' : undefined),
    },
  });

  const testExitCode = testProcess.status ?? 1;

  if (testExitCode === 0) {
    console.log('\n✅ Playwright test suite execution completed successfully.');
  } else {
    console.log(
      `\n⚠️  Playwright test suite execution finished with code ${testExitCode} (some tests failed/errored).`,
    );
  }

  // Always generate Allure HTML report regardless of test status
  const reportDir = generateAllureReport();

  if (shouldOpen && reportDir) {
    // openAllureReport blocks (Ctrl+C to stop). Exit after server closes.
    openAllureReport(reportDir);
    process.exit(testExitCode);
  } else {
    // No browser open — exit immediately with original code for CI/CD.
    process.exit(testExitCode);
  }
}

// ─── Entrypoint ──────────────────────────────────────────────────────────────
if (require.main === module) {
  if (shouldRun) {
    runAndReport();
  } else if (shouldOpen) {
    // Standalone: just open the latest already-generated report
    const latestDir = path.join(process.cwd(), 'reports', 'allure', 'latest');
    openAllureReport(latestDir);
  } else {
    generateAllureReport();
  }
}
