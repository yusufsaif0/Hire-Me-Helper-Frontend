const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawn, execFileSync } = require('node:child_process');
const { createHmac, randomInt } = require('node:crypto');
const { chromium } = require('playwright');
const pkg = require('../package.json');
const role = pkg.name.includes('admin')
  ? 'ADMIN'
  : pkg.name.includes('customer')
    ? 'CUSTOMER'
    : 'WORKER';
const frontend = path.resolve(__dirname, '..'),
  backend = path.resolve(frontend, '../backend');
const frontPort = role === 'ADMIN' ? 3300 : role === 'CUSTOMER' ? 8381 : 8382;
const apiPort = role === 'ADMIN' ? 4410 : role === 'CUSTOMER' ? 4411 : 4412;
const origin = `http://localhost:${frontPort}`;
const children = [];
let browser;
let activePage;
function start(cwd, args, env) {
  const child = spawn(process.execPath, args, {
    cwd,
    windowsHide: true,
    env: {
      ...process.env,
      CI: '1',
      EXPO_OFFLINE: '1',
      EXPO_NO_TELEMETRY: '1',
      NEXT_TELEMETRY_DISABLED: '1',
      ...env,
    },
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  child.logs = '';
  const read = (chunk) => {
    child.logs = (child.logs + chunk).slice(-10000);
  };
  child.stdout.on('data', read);
  child.stderr.on('data', read);
  children.push(child);
  return child;
}
async function ready(url, child) {
  const deadline = Date.now() + 120000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(child.logs);
    try {
      if ((await fetch(url, { signal: AbortSignal.timeout(1500) })).ok) return;
    } catch {
      /* Retry while the isolated server starts. */
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Startup timed out. ${child.logs}`);
}
async function control(child, command, marker) {
  child.logs = '';
  child.stdin.write(`${command}\n`);
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    if (child.logs.includes(marker)) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error('Fixture control timed out');
}
async function stop(child) {
  if (child.exitCode !== null || child.signalCode !== null) return;
  await new Promise((resolve) => {
    child.once('exit', resolve);
    if (process.platform === 'win32') {
      const killer = spawn('taskkill.exe', ['/PID', String(child.pid), '/T', '/F'], {
        windowsHide: true,
        stdio: 'ignore',
      });
      killer.on('error', () => child.kill());
    } else child.kill();
  });
}
function totp(time) {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(time / 30000)));
  const mac = createHmac('sha1', '12345678901234567890').update(counter).digest();
  return ((mac.readUInt32BE(mac[mac.length - 1] & 15) & 0x7fffffff) % 1000000)
    .toString()
    .padStart(6, '0');
}
async function adminChecks(page, api) {
  await page.goto(origin);
  await page.getByRole('heading', { name: 'Welcome to your workspace.' }).waitFor();
  await page.screenshot({ path: path.join(frontend, '.cache/ui/sign-in.png'), fullPage: true });
  const login = async (offset = 0) => {
    await page.getByLabel('Phone number').fill('+919998887777');
    await page.getByLabel('Password', { exact: true }).fill('Phase1-UI-test-only-password!');
    await page.getByRole('button', { name: 'Continue to MFA' }).click();
    await page.getByLabel('Authenticator code').waitFor();
    const code = totp(Date.now() + offset);
    return code;
  };
  const code = await login();
  const before = await page.request.get(`${origin}/api/admin/auth/me`);
  assert.equal(before.status(), 401);
  assert.equal(
    (await page.context().cookies()).some((cookie) => cookie.name === 'admin_access'),
    false,
  );
  await page.getByLabel('Authenticator code').fill(code.slice(0, 5) + ((Number(code[5]) + 1) % 10));
  await page.getByRole('button', { name: 'Verify and open workspace' }).click();
  await page.getByRole('alert').filter({ hasText: 'Invalid' }).waitFor();
  await page.getByLabel('Authenticator code').fill(code);
  await page.getByRole('button', { name: 'Verify and open workspace' }).click();
  await page.getByRole('button', { name: 'Sign out', exact: true }).waitFor();
  const cookies = await page.context().cookies();
  for (const name of ['admin_access', 'admin_refresh']) {
    const item = cookies.find((cookie) => cookie.name === name);
    assert.ok(item?.httpOnly);
    assert.equal(item.sameSite, 'Strict');
  }
  const response = await page.request.get(`${origin}/api/admin/auth/me`);
  const body = await response.json();
  assert.equal('refreshToken' in body, false);
  assert.equal('accessToken' in body, false);
  const denied = await page.evaluate(async () => ({
    status: (await fetch('/api/admin/auth/logout', { method: 'POST' })).status,
  }));
  assert.equal(denied.status, 403);
  assert.deepEqual(
    await page.evaluate(() =>
      Object.keys(localStorage).filter((key) => /token|refresh/i.test(key)),
    ),
    [],
  );
  await page.screenshot({ path: path.join(frontend, '.cache/ui/signed-in.png'), fullPage: true });
  console.log(
    'PASS: admin first-factor/MFA separation, invalid TOTP, protected overview, HttpOnly cookies and CSRF.',
  );
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await page.getByLabel('Password', { exact: true }).waitFor();
  assert.equal(
    (await page.context().cookies()).some((cookie) => cookie.name === 'admin_refresh'),
    false,
  );
  await control(api, 'advance', 'UI_FIXTURE_ADVANCED');
  const next = await login(61000);
  await page.getByLabel('Authenticator code').fill(next);
  await page.getByRole('button', { name: 'Verify and open workspace' }).click();
  await page.getByRole('button', { name: 'Sign out', exact: true }).waitFor();
  await control(api, 'revoke', 'UI_FIXTURE_REVOKED');
  await page.waitForTimeout(100);
  await page.clock.fastForward(61000);
  await page.getByLabel('Password', { exact: true }).waitFor();
  await page.getByRole('alert').filter({ hasText: 'session expired' }).waitFor();
  console.log('PASS: admin sign-out and real revoked-session recovery.');
}
async function mobileChecks(page, api) {
  await page.goto(origin);
  await page.getByLabel('Phone number').waitFor();
  await page.screenshot({ path: path.join(frontend, '.cache/ui/sign-in.png'), fullPage: true });
  await page.getByLabel('Phone number').fill('invalid');
  await page.getByRole('button', { name: 'Send verification code' }).click();
  await page.getByText('Check your phone number or six-digit code.').waitFor();
  const phone = `+919995${randomInt(100000, 999999)}`;
  await page.getByLabel('Phone number').fill(phone);
  await page.route('**/v1/auth/otp/request', (route) => route.abort());
  await page.getByRole('button', { name: 'Send verification code' }).click();
  await page.getByText('Unable to connect. Check your connection and try again.').waitFor();
  await page.unroute('**/v1/auth/otp/request');
  await page.getByRole('button', { name: 'Send verification code' }).click();
  await page.getByLabel('Verification code').waitFor();
  assert.ok(await page.getByText(/Resend code in/).isVisible());
  await page.getByLabel('Verification code').fill('000000');
  await page.getByRole('button', { name: 'Verify and sign in' }).click();
  await page
    .getByText('The code is invalid, expired, or already used. Request a new code if needed.')
    .waitFor();
  await page.getByLabel('Verification code').fill('456789');
  await page.getByRole('button', { name: 'Verify and sign in' }).click();
  await page.getByRole('button', { name: 'Sign out', exact: true }).waitFor();
  if (role === 'WORKER') await page.getByText(/Pending onboarding/).waitFor();
  assert.deepEqual(
    await page.evaluate(() =>
      Object.keys(localStorage).filter((key) => /token|refresh/i.test(key)),
    ),
    [],
  );
  await page.screenshot({ path: path.join(frontend, '.cache/ui/signed-in.png'), fullPage: true });
  console.log(
    `PASS: ${role} invalid input/network/code states, resend countdown and MongoDB-backed sign-in.`,
  );
  const logoutResponse = page.waitForResponse(
    (response) =>
      response.url().endsWith('/v1/auth/logout') && response.request().method() === 'POST',
  );
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  assert.equal((await logoutResponse).status(), 204);
  await page.getByLabel('Phone number').waitFor();
  await page.getByLabel('Phone number').fill('' + ('+919994' + randomInt(100000, 999999)));
  await page.getByRole('button', { name: 'Send verification code' }).click();
  await page.getByLabel('Verification code').waitFor();
  await page.getByLabel('Verification code').fill('456789');
  await page.getByRole('button', { name: 'Verify and sign in' }).click();
  await page.getByRole('button', { name: 'Sign out', exact: true }).waitFor();
  await control(api, 'revoke', 'UI_FIXTURE_REVOKED');
  await page.waitForTimeout(100);
  await page.clock.fastForward(61000);
  await page.getByLabel('Phone number').waitFor();
  await page.getByText('Your session expired. Please sign in again.').waitFor();
  console.log(`PASS: ${role} sign-out and real revoked-session recovery.`);
}
(async () => {
  const api = start(backend, ['scripts/e2e-server.cjs'], {
    NODE_ENV: 'test',
    CORS_ORIGIN: origin,
    E2E_BACKEND_PORT: String(apiPort),
  });
  try {
    await ready(`http://127.0.0.1:${apiPort}/v1/health`, api);
    const server =
      role === 'ADMIN'
        ? start(
            frontend,
            ['node_modules/next/dist/bin/next', 'dev', '--webpack', '-p', String(frontPort)],
            {
              NODE_ENV: 'development',
              NEXT_UI_TEST: '1',
              API_BASE_URL: `http://127.0.0.1:${apiPort}`,
              ADMIN_FRONTEND_ORIGIN: origin,
            },
          )
        : start(
            frontend,
            ['node_modules/expo/bin/cli', 'start', '--offline', '--port', String(frontPort)],
            { NODE_ENV: 'development', EXPO_PUBLIC_API_URL: `http://127.0.0.1:${apiPort}` },
          );
    await ready(origin, server);
    const candidates = [
      process.env.BROWSER_EXE,
      'C:/Program Files/Google/Chrome/Application/chrome.exe',
      'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
      '/usr/bin/google-chrome',
    ].filter(Boolean);
    const executablePath = candidates.find((filename) => fs.existsSync(filename));
    browser = await chromium.launch({
      headless: true,
      ...(executablePath ? { executablePath } : {}),
    });
    const page = await browser.newPage({
      viewport: { width: role === 'ADMIN' ? 1440 : 420, height: 900 },
    });
    await page.clock.install();
    activePage = page;
    page.setDefaultTimeout(30000);
    page.on('requestfailed', (request) =>
      console.error(
        'Browser request failed:',
        new URL(request.url()).pathname,
        request.failure()?.errorText,
      ),
    );
    page.on('console', (message) => {
      if (message.type() === 'error') console.error('Browser error:', message.text().slice(0, 500));
    });
    page.on('pageerror', (error) => console.error('Browser runtime error:', error.message));
    page.setDefaultNavigationTimeout(120000);
    fs.mkdirSync(path.join(frontend, '.cache/ui'), { recursive: true });
    if (role === 'ADMIN') await adminChecks(page, api);
    else await mobileChecks(page, api);
    console.log(`PASS: ${role} browser checks complete; native devices are not covered.`);
  } catch (error) {
    if (activePage) {
      console.error((await activePage.locator('body').innerText()).slice(0, 2500));
      await activePage.screenshot({
        path: path.join(frontend, '.cache/ui/failure.png'),
        fullPage: true,
      });
    }
    console.error(
      children
        .map((child) => child.logs)
        .join('\n')
        .slice(-7000),
    );
    throw error;
  } finally {
    await browser?.close();
    if (api.exitCode === null) {
      api.stdin.write('shutdown\n');
      await Promise.race([
        new Promise((resolve) => api.once('exit', resolve)),
        new Promise((resolve) => setTimeout(resolve, 10000)),
      ]);
    }
    await Promise.all(children.map(stop));
    if (role === 'ADMIN') {
      const filename = path.join(frontend, 'tsconfig.json');
      const config = JSON.parse(fs.readFileSync(filename, 'utf8'));
      config.include = config.include.filter((pattern) => !pattern.startsWith('.cache/next-ui/'));
      fs.writeFileSync(filename, JSON.stringify(config, null, 2) + '\n');
      execFileSync(process.execPath, ['node_modules/next/dist/bin/next', 'typegen'], {
        cwd: frontend,
        windowsHide: true,
        stdio: 'pipe',
        env: { ...process.env, NEXT_UI_TEST: '0', NEXT_TELEMETRY_DISABLED: '1' },
      });
    }
  }
})().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
