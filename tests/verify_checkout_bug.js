const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT_DIR = path.resolve(__dirname, '..');
const checkoutJsCode = fs.readFileSync(path.join(ROOT_DIR, 'checkout.js'), 'utf8');

let submitHandler = null;
let domContentLoadedHandler = null;

const formMock = {
    addEventListener(event, fn) {
        if (event === 'submit') submitHandler = fn;
    },
    reportValidity() { return true; }
};

const domMock = {
    addEventListener(event, fn) {
        if (event === 'DOMContentLoaded') domContentLoadedHandler = fn;
    },
    getElementById(id) {
        if (id === 'checkoutForm') return formMock;
        return { value: 'test', addEventListener() {}, textContent: '', style: {} };
    }
};

const localStorageMock = {
    getItem(key) {
        if (key === 'radcor_cart_v2') return JSON.stringify({ "item1": { sku: "MOL-1", qty: 1 } });
        return null;
    },
    setItem() {},
    removeItem() {}
};

const context = {
    document: domMock,
    localStorage: localStorageMock,
    window: { localStorage: localStorageMock },
    console,
    fetch: async () => ({ ok: true, json: async () => ({ success: true, data: { orderNo: '123' } }) })
};

vm.createContext(context);
vm.runInContext(checkoutJsCode, context);

if (domContentLoadedHandler) domContentLoadedHandler();

console.log("Registered submitHandler:", typeof submitHandler === 'function');
if (submitHandler) {
    const fakeEvent = { preventDefault() {} };
    try {
        const res = submitHandler(fakeEvent);
        if (res && res.catch) {
            res.catch(err => {
                console.log("CATCHED PROMISE REJECTION:", err.name, err.message);
            });
        }
    } catch (err) {
        console.log("SYNCHRONOUS ERROR:", err.name, err.message);
    }
}
