# RADCOR E2E Testing & Audit - HTML Files & Asset Audit Report

**Date**: 2026-08-06  
**Auditor**: Explorer Subagent (`explorer_exp_1`)  
**Scope**: 11 HTML files at project root `c:\Users\DenCrut\Documents\radcor.md`

---

## Executive Summary

A comprehensive, read-only audit of all 11 HTML files in the RADCOR web application was conducted. The audit focused on asset versioning (`?v=36.0`), script execution order, form elements and event handlers (`checkout.html` & `contacts.html`), and internationalization components (`.lang-selector`, `data-i18n`, `data-i18n-placeholder`, `data-i18n-title`).

### Key Findings:
1. **Asset Versioning**: Uniform `?v=36.0` cache-busting is applied across all local CSS (`style.css?v=36.0`) and JS (`i18n.js?v=36.0`, `app.js?v=36.0`, `checkout.js?v=36.0`) files across all 11 HTML pages. Google Fonts links are omitted in `checkout.html` and `guides.html`.
2. **Script Order**: `i18n.js?v=36.0` precedes `app.js?v=36.0` across 10 HTML files. In `admin.html`, an 8.5KB inline `<script>` block for table rendering and file picker API precedes `i18n.js` and `app.js`.
3. **Form Submissions**:
   - `checkout.html` has a complete `checkoutForm` with submission handler in `checkout.js` sending `POST /api/v1/orders`.
   - `contacts.html` has a `#contactForm`, but **CRITICAL BUG**: No submit event listener exists in JS. Form submission triggers default HTTP GET page reload.
4. **Language Switchers & i18n**:
   - Language switchers (`.lang-selector`) are present on 8 pages and **missing on 3 pages** (`checkout.html`, `b2b-dashboard.html`, `admin.html`).
   - All 520 `data-i18n` attributes and 10 `data-i18n-placeholder` attributes across all 11 files map to valid entries in `i18n.js`. `data-i18n-title` is 0 across all files.
   - **Duplicated Attributes Bug**: `checkout.html` contains duplicated `data-i18n` attributes on `<option>` tags (e.g. `data-i18n="checkout_text_option" data-i18n="opt_pickup"`).

---

## 1. Asset Versioning Audit (`?v=36.0`)

| HTML File | `style.css` Version | `i18n.js` Version | `app.js` Version | Page-Specific Scripts | External Fonts Preconnect | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `index.html` | `?v=36.0` | `?v=36.0` | `?v=36.0` | N/A | Google Fonts | PASS |
| `catalog.html` | `?v=36.0` | `?v=36.0` | `?v=36.0` | N/A | Google Fonts | PASS |
| `checkout.html` | `?v=36.0` | `?v=36.0` | `?v=36.0` | `checkout.js?v=36.0` | **Missing** | PASS (Local assets) |
| `b2b-dashboard.html` | `?v=36.0` | `?v=36.0` | `?v=36.0` | N/A | Google Fonts | PASS |
| `admin.html` | `?v=36.0` | `?v=36.0` | `?v=36.0` | Inline script | Google Fonts | PASS |
| `delivery.html` | `?v=36.0` | `?v=36.0` | `?v=36.0` | N/A | Google Fonts | PASS |
| `returns.html` | `?v=36.0` | `?v=36.0` | `?v=36.0` | N/A | Google Fonts | PASS |
| `service.html` | `?v=36.0` | `?v=36.0` | `?v=36.0` | N/A | Google Fonts | PASS |
| `faq.html` | `?v=36.0` | `?v=36.0` | `?v=36.0` | N/A | Google Fonts | PASS |
| `guides.html` | `?v=36.0` | `?v=36.0` | `?v=36.0` | N/A | **Missing** | PASS (Local assets) |
| `contacts.html` | `?v=36.0` | `?v=36.0` | `?v=36.0` | N/A | Google Fonts | PASS |

---

## 2. Script Tag Presence & Loading Order

```
Standard Order (10 files):
  1. <script src="i18n.js?v=36.0"></script>
  2. <script src="app.js?v=36.0"></script>
  [3. <script src="checkout.js?v=36.0"></script> in checkout.html]

Non-Standard Order (admin.html):
  1. <script> [8.5 KB Inline Script for admin table rendering & File System Access API] </script>
  2. <script src="i18n.js?v=36.0"></script>
  3. <script src="app.js?v=36.0"></script>
```

### Observation:
In `admin.html`, the inline script executes before `i18n.js` is loaded into memory (`window.I18N` is undefined during initial parse). However, since `renderTable()` is triggered asynchronously by user events (`#btnOpenFile`), `app.js` has loaded by the time table interaction occurs.

---

## 3. Form Inputs, Field IDs & Submission Handlers

### A. `checkout.html` Form Audit

* **Form Tag**: `<form id="checkoutForm" novalidate>`
* **Field Controls**:

| Field ID | Tag | Type / Attributes | Label `data-i18n` | i18n Key / Placeholder |
| :--- | :--- | :--- | :--- | :--- |
| `companyName` | `<input>` | required, autocomplete="organization" | `checkout_text_label` | "Компания" |
| `contactName` | `<input>` | required, autocomplete="name" | `catalog_text_label_79` | "Контактное лицо" |
| `orderPhone` | `<input>` | required, type="tel", autocomplete="tel" | `catalog_text_label_80` | "Телефон" |
| `orderEmail` | `<input>` | type="email", autocomplete="email" | **MISSING** | Label text "Email" is hardcoded without `data-i18n` |
| `deliveryMethod` | `<select>` | Options: `pickup`, `delivery` | `checkout_text_label_88` | **DUPLICATED ATTRIBUTE BUG** on `<option>` tags |
| `deliveryCity` | `<input>` | inside `#deliveryFields` (hidden) | `checkout_text_label_89` | "Город" |
| `deliveryAddress` | `<input>` | inside `#deliveryFields` (hidden) | `checkout_text_label_90` | "Адрес" |
| `paymentMethod` | `<select>` | Options: `invoice`, `contract` | `checkout_text_label_91` | **DUPLICATED ATTRIBUTE BUG** on `<option>` tags |
| `orderComment` | `<textarea>`| rows="3" | `checkout_text_label_94` | "Комментарий к заказу" |
| Submit Button | `<button>` | type="submit", class="btn btn-primary" | `checkout_text_button` | "Отправить заказ" |

* **Submission Handler Verification**:
  - Listener: `form.addEventListener('submit', async event => { ... })` in `checkout.js:66`.
  - Logic: Validates items in `radcor_cart_v2`, checks `form.reportValidity()`, validates `deliveryCity` and `deliveryAddress` if delivery is selected, posts JSON payload to `/api/v1/orders`. On success, clears cart, resets form, and updates `#checkoutMessage`.

### B. `contacts.html` Form Audit

* **Form Tag**: `<form class="b2b-form" id="contactForm">`
* **Field Controls**:

| Field ID | Tag | Type / Attributes | Label `data-i18n` | Placeholder `data-i18n-placeholder` |
| :--- | :--- | :--- | :--- | :--- |
| `cName` | `<input>` | type="text", required | `contacts_text_label` | `contact_name_ph` ("Ваше имя") |
| `cEmail` | `<input>` | type="email", required | **MISSING** | Hardcoded placeholder "name@company.md" |
| `cText` | `<input>` | type="text", required | `contacts_text_label_102` | `contact_msg_ph` ("Введите текст вашего сообщения...") |
| Submit Button | `<button>` | type="submit", class="btn btn-primary full-width" | `contacts_text_h3` | Text: "Отправить сообщение" |

* **Submission Handler Verification**:
  - Listener: **CRITICAL MISSING LISTENER!**
  - Neither `app.js`, `i18n.js`, nor `contacts.html` contains an event handler for `#contactForm`. Submitting the form performs an HTTP GET request to `contacts.html?cName=...&cEmail=...&cText=...`, causing a page refresh without feedback or API submission. `#contactSuccess` (`<div id="contactSuccess">`) is never shown.

---

## 4. Language Switcher & i18n Attribute Inventory

### A. Language Switcher Component Presence

* **Present (8 Pages)**: `index.html`, `catalog.html`, `delivery.html`, `returns.html`, `service.html`, `faq.html`, `guides.html`, `contacts.html`.
  ```html
  <div class="lang-selector">
      <a href="#" class="lang-link active">RU</a>
      <span>|</span>
      <a href="#" class="lang-link">RO</a>
  </div>
  ```
* **Missing (3 Pages)**: `checkout.html`, `b2b-dashboard.html`, `admin.html`.

### B. i18n Attributes Summary

| Page | `data-i18n` Count | `data-i18n-placeholder` Count | `data-i18n-title` Count | Dictionary Match |
| :--- | :--- | :--- | :--- | :--- |
| `index.html` | 91 | 2 (`label_company_placeholder`, `label_name_placeholder`) | 0 | 100% |
| `catalog.html` | 93 | 3 (`search_placeholder`, `label_company_placeholder`, `label_name_placeholder`) | 0 | 100% |
| `checkout.html` | 28 | 0 | 0 | 100% |
| `b2b-dashboard.html` | 45 | 1 (`b2b_order_ph`) | 0 | 100% |
| `admin.html` | 39 | 2 (`admin_spec_label_ph`, `admin_spec_val_ph`) | 0 | 100% |
| `delivery.html` | 51 | 0 | 0 | 100% |
| `returns.html` | 36 | 0 | 0 | 100% |
| `service.html` | 31 | 0 | 0 | 100% |
| `faq.html` | 22 | 0 | 0 | 100% |
| `guides.html` | 28 | 0 | 0 | 100% |
| `contacts.html` | 30 | 2 (`contact_name_ph`, `contact_msg_ph`) | 0 | 100% |
| **TOTAL** | **520** | **10** | **0** | **100%** |

### C. i18n Anatomic Anomalies & Defects

1. **Duplicated `data-i18n` attribute bug in `checkout.html`**:
   - Line 21: `<option value="pickup" data-i18n="checkout_text_option" data-i18n="opt_pickup">`
   - Line 21: `<option value="delivery" data-i18n="b2b_dashboard_text_th_43" data-i18n="opt_delivery">`
   - Line 23: `<option value="invoice" data-i18n="checkout_text_option_92" data-i18n="opt_invoice">`
   - Line 23: `<option value="contract" data-i18n="checkout_text_option_93" data-i18n="opt_contract">`
   - *Impact*: Standard HTML parsers ignore the second duplicate attribute (`opt_pickup`, `opt_delivery`, `opt_invoice`, `opt_contract`). The elements receive the text corresponding to the first key (`checkout_text_option`, etc.), causing incorrect option labels upon language switch.

2. **Unimplemented `data-i18n-title` attribute handling**:
   - `app.js` implements handlers for `data-i18n` (textContent) and `data-i18n-placeholder` (placeholder), but lacks code for `data-i18n-title` (`el.title = text`). Currently no HTML file uses `data-i18n-title`.

3. **Untranslated Text Nodes**:
   - `checkout.html` (line 19): `<label for="orderEmail">Email</label>` lacks `data-i18n="checkout_email"`.
   - `contacts.html` (line 116): `<label for="cEmail">Email</label>` lacks `data-i18n="checkout_email"`.
   - `contacts.html` (lines 82, 83, 90, 91): Hardcoded parenthetical Russian annotations (`(Общая)`, `(Отдел продаж)`, `(Офис / Отдел продаж)`, `(Александр)`).
   - `admin.html` (line 196): `<h1>Radcor-Prim Admin</h1>` lacks `data-i18n`.
   - `faq.html` (line 42): `<a href="faq.html" class="active">FAQ</a>` in main navigation lacks `data-i18n="nav_faq"`.

---

## 5. Verification Commands Run

All data extracted and verified via automated Node.js scripts executed directly against local filesystem:
- Asset & link versioning audit: `parse_scripts.js`
- Form & input parsing: `analyze_summary.js`
- i18n key verification against `i18n.js`: `check_missing_keys.js`
- Untranslated node scan: `check_untranslated.js`
