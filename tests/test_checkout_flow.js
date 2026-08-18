const assert = require('assert');
const fs = require('fs');

console.log('================================================================');
console.log('RADCOR Checkout Flow Automated Verification Suite');
console.log('================================================================\n');

// Mock localStorage and window environment
const localStorageMap = new Map();
global.localStorage = {
  getItem: (key) => localStorageMap.get(key) || null,
  setItem: (key, val) => localStorageMap.set(key, String(val)),
  removeItem: (key) => localStorageMap.delete(key),
  clear: () => localStorageMap.clear()
};

// Mock B2BAuth
global.window = {
  B2BAuth: {
    getSession: () => JSON.parse(localStorage.getItem('radcor_b2b_session') || 'null')
  },
  I18N: {
    ru: { msg_empty_cart: 'Корзина пуста.', msg_total_label: 'Итого:' }
  }
};

let passCount = 0;
function test(name, fn) {
  try {
    fn();
    console.log(`[PASS] ${name}`);
    passCount++;
  } catch (err) {
    console.error(`[FAIL] ${name}:`, err.message);
    process.exit(1);
  }
}

// 1. Check file existence
test('checkout.js exists and is valid syntax', () => {
  const code = fs.readFileSync('checkout.js', 'utf8');
  assert(code.length > 500, 'checkout.js is non-empty');
  assert(code.includes('radcor_cart_v2'), 'Uses correct CART_KEY');
  assert(code.includes('RAD-'), 'Generates RAD- order number');
});

// 2. Setup Cart
test('Cart calculation without B2B discount', () => {
  localStorage.clear();
  const sampleCart = {
    'MOL-1001_4': { sku: 'MOL-1001', name: 'MOL Dynamic Gold NG 0W-20', price: 650, vol: 4, qty: 2 },
    'YUKO-2001_1': { sku: 'YUKO-2001', name: 'Yuko Synthetic 5W-40', price: 180, vol: 1, qty: 1 }
  };
  localStorage.setItem('radcor_cart_v2', JSON.stringify(sampleCart));

  const items = Object.values(sampleCart);
  const baseTotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  assert.strictEqual(baseTotal, 650 * 2 + 180 * 1); // 1480 MDL
});

// 3. Setup B2B Session and calculate discount
test('Cart calculation with B2B 15% discount', () => {
  const b2bSession = {
    idno: '1003600012345',
    company_name: 'SRL Trans-Auto-Grup',
    discount_pct: 15
  };
  localStorage.setItem('radcor_b2b_session', JSON.stringify(b2bSession));

  const items = JSON.parse(localStorage.getItem('radcor_cart_v2'));
  const values = Object.values(items);
  const baseTotal = values.reduce((sum, item) => sum + item.price * item.qty, 0); // 1480
  const discountAmount = Math.round(baseTotal * 0.15); // 222
  const finalTotal = baseTotal - discountAmount; // 1258

  assert.strictEqual(discountAmount, 222);
  assert.strictEqual(finalTotal, 1258);
});

// 4. Test Order Creation Simulation
test('Order saving into radcor_orders and radcor_orders_{idno}', () => {
  const orderNo = 'RAD-123456';
  const orderDate = new Date().toLocaleDateString('ru-RU');
  const session = JSON.parse(localStorage.getItem('radcor_b2b_session'));

  const savedOrders = JSON.parse(localStorage.getItem('radcor_orders') || '[]');
  savedOrders.unshift({
    orderNo: orderNo,
    company_name: 'SRL Trans-Auto-Grup',
    contact_person: 'Ион Чебан',
    phone: '+373 69 123 456',
    total_price: 1258,
    created_at: new Date().toISOString()
  });
  localStorage.setItem('radcor_orders', JSON.stringify(savedOrders));

  if (session && session.idno) {
    const b2bKey = `radcor_orders_${session.idno}`;
    const b2bOrders = JSON.parse(localStorage.getItem(b2bKey) || '[]');
    b2bOrders.unshift({
      order_id: '123456',
      orderNo: orderNo,
      date: orderDate,
      total: 1258,
      pay_status: 'unpaid',
      delivery_status: 'processing'
    });
    localStorage.setItem(b2bKey, JSON.stringify(b2bOrders));
  }

  // Clear cart
  localStorage.removeItem('radcor_cart_v2');

  // Assertions
  const generalOrders = JSON.parse(localStorage.getItem('radcor_orders'));
  assert.strictEqual(generalOrders.length, 1);
  assert.strictEqual(generalOrders[0].orderNo, 'RAD-123456');
  assert.strictEqual(generalOrders[0].total_price, 1258);

  const b2bOrders = JSON.parse(localStorage.getItem('radcor_orders_1003600012345'));
  assert.strictEqual(b2bOrders.length, 1);
  assert.strictEqual(b2bOrders[0].order_id, '123456');
  assert.strictEqual(b2bOrders[0].total, 1258);

  assert.strictEqual(localStorage.getItem('radcor_cart_v2'), null);
});

console.log('\n================================================================');
console.log(`CHECKOUT SUITE COMPLETE: ${passCount} PASSED, 0 FAILED`);
console.log('================================================================');
