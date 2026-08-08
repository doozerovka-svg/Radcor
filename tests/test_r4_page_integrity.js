const fs = require('fs');
const path = require('path');
const vm = require('vm');

const EXPECTED_VERSION = '?v=40.0';
const ROOT_DIR = path.resolve(__dirname, '..');

const HTML_PAGES = [
  'index.html',
  'catalog.html',
  'service.html',
  'delivery.html',
  'returns.html',
  'guides.html',
  'faq.html',
  'contacts.html',
  'b2b-dashboard.html',
  'admin.html',
  'checkout.html'
];

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

console.log('================================================================');
console.log('RADCOR R4 Page Integrity, Script Assets & Checkout Flow Suite');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// SECTION 1: Asset Versioning Audit (?v=37.0)
// -----------------------------------------------------------------------------
console.log('--- SECTION 1: Asset Versioning Audit (?v=37.0) ---');

assert(HTML_PAGES.length === 11, `Expected 11 HTML pages, found ${HTML_PAGES.length}`);

HTML_PAGES.forEach(page => {
  const filePath = path.join(ROOT_DIR, page);
  assert(fs.existsSync(filePath), `Page file exists: ${page}`);
  const html = fs.readFileSync(filePath, 'utf8');

  // Audit stylesheet links
  const cssMatches = html.match(/<link[^>]+rel=["']stylesheet["'][^>]*>/gi) || [];
  cssMatches.forEach(linkTag => {
    const hrefMatch = linkTag.match(/href=["']([^"']+)["']/i);
    if (hrefMatch) {
      const href = hrefMatch[1];
      if (href.includes('.css') && !href.startsWith('http')) {
        assert(href.includes(EXPECTED_VERSION), `${page}: CSS link '${href}' includes ${EXPECTED_VERSION}`);
      }
    }
  });

  // Audit script src tags
  const scriptMatches = html.match(/<script[^>]+src=["']([^"']+)["'][^>]*>/gi) || [];
  scriptMatches.forEach(scriptTag => {
    const srcMatch = scriptTag.match(/src=["']([^"']+)["']/i);
    if (srcMatch) {
      const src = srcMatch[1];
      if (src.includes('.js') && !src.startsWith('http')) {
        assert(src.includes(EXPECTED_VERSION), `${page}: JS script '${src}' includes ${EXPECTED_VERSION}`);
      }
    }
  });
});

console.log('');

// -----------------------------------------------------------------------------
// SECTION 2: Script Loading Order Audit for admin.html
// -----------------------------------------------------------------------------
console.log('--- SECTION 2: Script Loading Order for admin.html ---');

const adminHtml = fs.readFileSync(path.join(ROOT_DIR, 'admin.html'), 'utf8');
const i18nPos = adminHtml.indexOf(`i18n.js${EXPECTED_VERSION}`);
const appPos = adminHtml.indexOf(`app.js${EXPECTED_VERSION}`);

// Find the first inline <script> block (not having a src attribute)
const inlineScriptMatches = [...adminHtml.matchAll(/<script(?![^>]*src=)[^>]*>/gi)];
const firstInlineScriptPos = inlineScriptMatches.length > 0 ? inlineScriptMatches[0].index : -1;

assert(i18nPos !== -1, 'admin.html includes i18n.js?v=37.0');
assert(appPos !== -1, 'admin.html includes app.js?v=37.0');
assert(firstInlineScriptPos !== -1, 'admin.html contains inline script block');
assert(i18nPos < firstInlineScriptPos, `i18n.js loads before inline script block (i18n pos: ${i18nPos}, inline pos: ${firstInlineScriptPos})`);
assert(appPos < firstInlineScriptPos, `app.js loads before inline script block (app pos: ${appPos}, inline pos: ${firstInlineScriptPos})`);

console.log('');

// -----------------------------------------------------------------------------
// SECTION 3: Contact Form Handling Assertion (contacts.html & app.js)
// -----------------------------------------------------------------------------
console.log('--- SECTION 3: Contact Form Handling Audit ---');

const contactsHtml = fs.readFileSync(path.join(ROOT_DIR, 'contacts.html'), 'utf8');
assert(contactsHtml.includes('id="contactForm"'), 'contacts.html contains #contactForm');
assert(contactsHtml.includes('id="cName"'), 'contacts.html contains #cName input');
assert(contactsHtml.includes('id="cEmail"'), 'contacts.html contains #cEmail input');
assert(contactsHtml.includes('id="cText"'), 'contacts.html contains #cText input');
assert(contactsHtml.includes('id="contactSuccess"'), 'contacts.html contains #contactSuccess container');

// Functional testing of #contactForm event listener in app.js
function testContactFormLogic() {
  const elements = {
    cName: { id: 'cName', value: '', trim() { return this.value.trim(); } },
    cEmail: { id: 'cEmail', value: '', trim() { return this.value.trim(); } },
    cText: { id: 'cText', value: '', trim() { return this.value.trim(); } },
    contactSuccess: { id: 'contactSuccess', style: { display: 'none' } },
    contactForm: {
      id: 'contactForm',
      listeners: {},
      addEventListener(evt, fn) { this.listeners[evt] = fn; },
      reset() {
        elements.cName.value = '';
        elements.cEmail.value = '';
        elements.cText.value = '';
      },
      checkValidity() { return true; }
    }
  };

  const documentMock = {
    getElementById(id) { return elements[id] || null; },
    querySelectorAll() { return []; },
    addEventListener() {},
    documentElement: { lang: 'ru' }
  };

  const windowMock = { I18N: {} };
  const localStorageMock = { getItem() { return null; }, setItem() {}, removeItem() {} };

  const appCode = fs.readFileSync(path.join(ROOT_DIR, 'app.js'), 'utf8');

  // Wrap in VM to execute DOMContentLoaded handlers
  let runnableCode = appCode.replace(
    /document\.addEventListener\('DOMContentLoaded',\s*\(\)\s*=>\s*\{/,
    'function runInit() {'
  );
  const lastIdx = runnableCode.lastIndexOf('});');
  if (lastIdx !== -1) {
    runnableCode = runnableCode.substring(0, lastIdx) + '}' + runnableCode.substring(lastIdx + 3);
  }
  runnableCode += '\nrunInit();';

  const context = {
    document: documentMock,
    window: windowMock,
    localStorage: localStorageMock,
    console,
    fetch: async () => ({ ok: true, json: async () => ([]) }),
    URLSearchParams: class { get() { return null; } }
  };

  vm.createContext(context);
  vm.runInContext(runnableCode, context);

  const submitHandler = elements.contactForm.listeners['submit'];
  assert(typeof submitHandler === 'function', 'app.js registered submit listener on #contactForm');

  if (typeof submitHandler === 'function') {
    // Case 1: Empty submit
    let prevented = false;
    submitHandler({ preventDefault() { prevented = true; } });
    assert(prevented, 'Default submit action was prevented on empty submit');
    assert(elements.contactSuccess.style.display === 'none', '#contactSuccess remains hidden when fields are empty');

    // Case 2: Valid submit
    elements.cName.value = 'John Doe';
    elements.cEmail.value = 'john@example.com';
    elements.cText.value = 'Test inquiry message';

    prevented = false;
    submitHandler({ preventDefault() { prevented = true; } });

    assert(prevented, 'Default submit action was prevented on valid submit');
    assert(elements.contactSuccess.style.display === 'block', '#contactSuccess is displayed (display: block) on valid submit');
    assert(elements.cName.value === '' && elements.cEmail.value === '' && elements.cText.value === '', 'Form inputs cleared on successful submit');
  }
}
testContactFormLogic();

console.log('');

// -----------------------------------------------------------------------------
// SECTION 4: Checkout Form Handling Assertion (checkout.html & checkout.js)
// -----------------------------------------------------------------------------
console.log('--- SECTION 4: Checkout Form Handling Audit ---');

const checkoutHtml = fs.readFileSync(path.join(ROOT_DIR, 'checkout.html'), 'utf8');
assert(checkoutHtml.includes('id="checkoutForm"'), 'checkout.html contains #checkoutForm');
assert(checkoutHtml.includes('id="companyName"'), 'checkout.html contains #companyName input');
assert(checkoutHtml.includes('id="contactName"'), 'checkout.html contains #contactName input');
assert(checkoutHtml.includes('id="orderPhone"'), 'checkout.html contains #orderPhone input');
assert(checkoutHtml.includes('id="orderEmail"'), 'checkout.html contains #orderEmail input');
assert(checkoutHtml.includes('id="deliveryMethod"'), 'checkout.html contains #deliveryMethod select');
assert(checkoutHtml.includes('id="paymentMethod"'), 'checkout.html contains #paymentMethod select');
assert(checkoutHtml.includes('id="checkoutMessage"'), 'checkout.html contains #checkoutMessage element');

function testCheckoutFormLogic() {
  const cartStore = { 'MOL-001': { sku: 'MOL-001', name: 'MOL Dynamic 5W-30', vol: 4, qty: 2 } };
  
  const elements = {
    checkoutForm: {
      id: 'checkoutForm',
      listeners: {},
      addEventListener(evt, fn) { this.listeners[evt] = fn; },
      reportValidity() { return true; },
      reset() {
        elements.companyName.value = '';
        elements.contactName.value = '';
        elements.orderPhone.value = '';
        elements.orderEmail.value = '';
        elements.deliveryCity.value = '';
        elements.deliveryAddress.value = '';
      }
    },
    checkoutMessage: { id: 'checkoutMessage', textContent: '', style: {} },
    deliveryMethod: { id: 'deliveryMethod', value: 'pickup', listeners: {}, addEventListener(evt, fn) { this.listeners[evt] = fn; } },
    deliveryFields: { id: 'deliveryFields', hidden: true },
    companyName: { id: 'companyName', value: 'Radcor Partner' },
    contactName: { id: 'contactName', value: 'Alex' },
    orderPhone: { id: 'orderPhone', value: '+37368550595' },
    orderEmail: { id: 'orderEmail', value: 'alex@radcor.md' },
    deliveryCity: { id: 'deliveryCity', value: 'Chisinau' },
    deliveryAddress: { id: 'deliveryAddress', value: 'Petricani 84/1' },
    paymentMethod: { id: 'paymentMethod', value: 'invoice' },
    orderComment: { id: 'orderComment', value: 'Urgent' },
    checkoutItems: { id: 'checkoutItems', innerHTML: '', textContent: '' },
    checkoutTotal: { id: 'checkoutTotal', textContent: '' }
  };

  const documentMock = {
    getElementById(id) { return elements[id] || null; },
    addEventListener(evt, fn) { if (evt === 'DOMContentLoaded') fn(); },
    documentElement: { lang: 'ru' }
  };

  const localStorageMock = {
    data: { radcor_cart_v2: JSON.stringify(cartStore) },
    getItem(k) { return this.data[k] || null; },
    setItem(k, v) { this.data[k] = String(v); },
    removeItem(k) { delete this.data[k]; }
  };

  const checkoutJs = fs.readFileSync(path.join(ROOT_DIR, 'checkout.js'), 'utf8');

  const context = {
    document: documentMock,
    window: { I18N: { ru: { msg_empty_cart: 'Корзина пуста.' } } },
    localStorage: localStorageMock,
    console,
    fetch: async () => ({ ok: true, json: async () => ({ success: true, data: { orderNo: 'RAD-100200', total_price: 1500 } }) })
  };

  vm.createContext(context);
  vm.runInContext(checkoutJs, context);

  const submitHandler = elements.checkoutForm.listeners['submit'];
  assert(typeof submitHandler === 'function', 'checkout.js registered submit listener on #checkoutForm');

  if (typeof submitHandler === 'function') {
    // Test 1: Submit with cart items
    let prevented = false;
    submitHandler({ preventDefault() { prevented = true; } }).then(() => {
      assert(prevented, 'Checkout submit prevented default form submit');
      assert(elements.checkoutMessage.textContent.includes('RAD-100200'), 'Order confirmation message displayed in #checkoutMessage');
      assert(elements.checkoutMessage.style.color === 'var(--colour-green)', '#checkoutMessage styled with success color');
      assert(localStorageMock.getItem('radcor_cart_v2') === null, 'Cart cleared from localStorage upon successful checkout');

      // Test 2: Submit with empty cart
      prevented = false;
      submitHandler({ preventDefault() { prevented = true; } });
      assert(prevented, 'Empty cart submit prevented default form submit');
      assert(elements.checkoutMessage.textContent.includes('Корзина пуста'), 'Empty cart message displayed in #checkoutMessage');
    });
  }
}
testCheckoutFormLogic();

console.log('');

// -----------------------------------------------------------------------------
// SECTION 5: Console Error Audit Across All 11 HTML Pages
// -----------------------------------------------------------------------------
console.log('--- SECTION 5: Console Error Audit Across All 11 Pages ---');

let totalConsoleErrors = 0;

HTML_PAGES.forEach(page => {
  const capturedErrors = [];
  const customConsole = {
    log: () => {},
    warn: () => {},
    info: () => {},
    error: (...args) => {
      capturedErrors.push(args.join(' '));
    }
  };

  const documentMock = {
    getElementById() {
      return {
        style: {},
        classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
        querySelectorAll() { return []; },
        addEventListener() {},
        setAttribute() {}
      };
    },
    querySelectorAll() { return []; },
    querySelector() { return null; },
    addEventListener() {},
    documentElement: { lang: 'ru' }
  };

  const context = {
    document: documentMock,
    window: { I18N: {} },
    localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
    console: customConsole,
    fetch: async () => ({ ok: true, json: async () => ([]) }),
    URLSearchParams: class { get() { return null; } },
    setInterval() {},
    clearInterval() {},
    setTimeout() {},
    clearTimeout() {}
  };

  vm.createContext(context);

  // Run i18n.js
  const i18nCode = fs.readFileSync(path.join(ROOT_DIR, 'i18n.js'), 'utf8');
  try {
    vm.runInContext(i18nCode, context);
  } catch (err) {
    capturedErrors.push(`i18n.js exception on ${page}: ${err.message}`);
  }

  // Run app.js
  const appCode = fs.readFileSync(path.join(ROOT_DIR, 'app.js'), 'utf8');
  try {
    vm.runInContext(appCode, context);
  } catch (err) {
    capturedErrors.push(`app.js exception on ${page}: ${err.message}`);
  }

  // If checkout.html, also run checkout.js
  if (page === 'checkout.html') {
    const checkoutCode = fs.readFileSync(path.join(ROOT_DIR, 'checkout.js'), 'utf8');
    try {
      vm.runInContext(checkoutCode, context);
    } catch (err) {
      capturedErrors.push(`checkout.js exception: ${err.message}`);
    }
  }

  assert(capturedErrors.length === 0, `0 console errors on ${page} (Errors: ${capturedErrors.length})`);
  if (capturedErrors.length > 0) {
    capturedErrors.forEach(e => console.error(`  -> ${e}`));
  }
  totalConsoleErrors += capturedErrors.length;
});

assert(totalConsoleErrors === 0, `Total console errors across all 11 pages is 0 (Found: ${totalConsoleErrors})`);

console.log('\n================================================================');
console.log(`R4 SUITE COMPLETE: ${passCount} PASSED, ${failCount} FAILED`);
console.log('================================================================');

process.exit(failCount === 0 ? 0 : 1);
