const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');

console.log('================================================================');
console.log('RADCOR B2B Authentication & Personal Cabinet Test Suite');
console.log('================================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
    if (condition) {
        passCount++;
        console.log(`[PASS] ${message}`);
    } else {
        failCount++;
        console.error(`[FAIL] ${message}`);
    }
}

// 1. i18n dictionary audit
console.log('--- 1. i18n Dictionary Audit ---');
const i18nCode = fs.readFileSync('i18n.js', 'utf8');
const i18nSandbox = { window: {} };
vm.createContext(i18nSandbox);
vm.runInContext(i18nCode, i18nSandbox);
const I18N = i18nSandbox.window.I18N;

const requiredB2BKeys = [
    'b2b_login_title',
    'b2b_login_desc',
    'b2b_login_idno_label',
    'b2b_login_code_label',
    'b2b_login_error',
    'b2b_login_submit',
    'b2b_login_no_account',
    'b2b_login_contact_link',
    'b2b_login_logout',
    'b2b_tab_clients',
    'b2b_tab_products'
];

requiredB2BKeys.forEach(k => {
    assert(I18N.ru[k] && I18N.ru[k].length > 0, `RU i18n contains key: ${k}`);
    assert(I18N.ro[k] && I18N.ro[k].length > 0, `RO i18n contains key: ${k}`);
});

// 2. SHA-256 calculation for test client
console.log('\n--- 2. Built-in Test Client Credentials ---');
const testCode = 'RC-2026-TEST';
const expectedHash = crypto.createHash('sha256').update(testCode.toLowerCase()).digest('hex');
assert(expectedHash === '900f3241fcf5cb767ff6bd141b9980b5bdbd7330e98128e707921ec0136a4f29', 'SHA-256 for rc-2026-test matches expected hash');

// 3. b2b-auth.js simulation
console.log('\n--- 3. b2b-auth.js Execution Simulation ---');
const authCode = fs.readFileSync('b2b-auth.js', 'utf8');

const mockLocalStorage = {
    store: {},
    getItem(k) { return this.store[k] || null; },
    setItem(k, v) { this.store[k] = String(v); },
    removeItem(k) { delete this.store[k]; }
};

const authSandbox = {
    window: {},
    document: {
        readyState: 'complete',
        addEventListener: () => {},
        body: { insertAdjacentHTML: () => {} },
        getElementById: () => null
    },
    localStorage: mockLocalStorage,
    crypto: {
        subtle: {
            digest: async (algo, buffer) => {
                const hash = crypto.createHash('sha256').update(Buffer.from(buffer)).digest();
                return hash.buffer.slice(hash.byteOffset, hash.byteOffset + hash.byteLength);
            }
        }
    },
    TextEncoder: TextEncoder,
    console: console,
    fetch: () => Promise.reject(new Error('Network offline'))
};

vm.createContext(authSandbox);
vm.runInContext(authCode, authSandbox);

const B2BAuth = authSandbox.window.B2BAuth;
assert(B2BAuth && typeof B2BAuth.login === 'function', 'B2BAuth.login is function');
assert(B2BAuth && typeof B2BAuth.getSession === 'function', 'B2BAuth.getSession is function');
assert(B2BAuth && typeof B2BAuth.logout === 'function', 'B2BAuth.logout is function');
assert(B2BAuth && typeof B2BAuth.applyDiscount === 'function', 'B2BAuth.applyDiscount is function');

(async () => {
    // Test login with invalid credentials
    const badLogin = await B2BAuth.login('1234567890123', 'wrong-pass');
    assert(badLogin.ok === false, 'Invalid credentials rejected');

    // Test login with built-in test client
    const goodLogin = await B2BAuth.login('1003600012345', 'RC-2026-TEST');
    assert(goodLogin.ok === true, 'Built-in test client authenticated successfully');
    assert(goodLogin.profile.company_name === 'SRL "Trans-Auto-Grup"', 'Profile company name is correct');
    assert(goodLogin.profile.discount_pct === 15, 'Profile discount is 15%');

    // Check persistent session
    const session = B2BAuth.getSession();
    assert(session !== null && session.is_authenticated === true, 'Session persisted in localStorage');
    assert(session.idno === '1003600012345', 'Session IDNO matches 1003600012345');

    // Test B2B discount calculation
    const basePrice = 1000;
    const discountedPrice = B2BAuth.applyDiscount(basePrice);
    assert(discountedPrice === 850, `B2B discount: 1000 MDL with 15% discount => 850 MDL (got ${discountedPrice})`);

    // Test Logout
    authSandbox.window.location = { href: '' };
    B2BAuth.logout();
    assert(B2BAuth.getSession() === null, 'Session cleared upon logout');

    // 4. Verification of Google Apps Script instructions
    console.log('\n--- 4. Google Apps Script File ---');
    assert(fs.existsSync('docs/gas_clients_script.js'), 'docs/gas_clients_script.js exists');
    const gasContent = fs.readFileSync('docs/gas_clients_script.js', 'utf8');
    assert(gasContent.includes('Radcor_Clients_DB'), 'GAS script contains sheet name Radcor_Clients_DB');
    assert(gasContent.includes('1003600012345'), 'GAS script contains test client IDNO 1003600012345');
    assert(gasContent.includes('900f3241fcf5cb767ff6bd141b9980b5bdbd7330e98128e707921ec0136a4f29'), 'GAS script contains test client hash');

    // 5. Admin HTML tabs and client generator
    console.log('\n--- 5. admin.html & b2b-dashboard.html Structure ---');
    const adminHtml = fs.readFileSync('admin.html', 'utf8');
    assert(adminHtml.includes('tabBtnClients'), 'admin.html contains B2B clients tab button');
    assert(adminHtml.includes('b2bClientRegisterForm'), 'admin.html contains client registration form');
    assert(adminHtml.includes('c_hash_preview'), 'admin.html contains real-time SHA-256 hash preview');
    assert(adminHtml.includes('clientInviteText'), 'admin.html contains client invitation text generator');

    const b2bDashHtml = fs.readFileSync('b2b-dashboard.html', 'utf8');
    assert(b2bDashHtml.includes('b2bCompanyName'), 'b2b-dashboard.html contains b2bCompanyName ID');
    assert(b2bDashHtml.includes('b2bBalanceValue'), 'b2b-dashboard.html contains b2bBalanceValue ID');
    assert(b2bDashHtml.includes('b2bOrdersTableBody'), 'b2b-dashboard.html contains b2bOrdersTableBody ID');
    assert(b2bDashHtml.includes('b2b-dashboard.js'), 'b2b-dashboard.html links b2b-dashboard.js');

    console.log('\n================================================================');
    console.log(`B2B SUITE COMPLETE: ${passCount} PASSED, ${failCount} FAILED`);
    console.log('================================================================');

    if (failCount > 0) process.exit(1);
})();
