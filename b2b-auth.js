/**
 * Radcor-Prim — B2B Authentication & Session Module
 * Version: 45.0
 * 
 * Supports:
 * - SHA-256 access code hashing (WebCrypto)
 * - Google Apps Script Web App authentication endpoint
 * - Zero-config built-in test partner fallback for instant offline testing
 * - Persistent session storage in localStorage (radcor_b2b_session)
 * - Dynamic login modal injection and header state management
 * - B2B discount calculation
 */

(function() {
    'use strict';

    const B2B_SESSION_KEY = 'radcor_b2b_session';
    
    // Google Apps Script Web App URL (замените после развертывания скрипта из docs/gas_clients_script.js)
    const GAS_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';

    // Встроенный эталонный тестовый клиент для автономной работы и тестирования
    const BUILTIN_TEST_CLIENT = {
        id: 1,
        company_name: 'SRL "Trans-Auto-Grup"',
        idno: '1003600012345',
        contact_name: 'Ион Чебан',
        phone: '+373 69 123 456',
        address: 'г. Кишинёв, ул. Заводская, 12',
        iban: 'MD24AG0000000225123456',
        bank: 'Moldindconbank',
        discount_pct: 15,
        credit_limit: 50000,
        balance: 32500,
        // SHA-256 hash для 'rc-2026-test'
        access_code_hash: '900f3241fcf5cb767ff6bd141b9980b5bdbd7330e98128e707921ec0136a4f29'
    };

    /**
     * Вычисление SHA-256 хеша строки
     */
    async function sha256hex(message) {
        const msgBuffer = new TextEncoder().encode(String(message).trim().toLowerCase());
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        return Array.from(new Uint8Array(hashBuffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    /**
     * Сохранение сессии в localStorage
     */
    function b2bSaveSession(profile) {
        const session = {
            is_authenticated: true,
            logged_in_at: Date.now(),
            ...profile
        };
        localStorage.setItem(B2B_SESSION_KEY, JSON.stringify(session));
        return session;
    }

    /**
     * Получение текущей активной сессии
     */
    function b2bGetSession() {
        try {
            const raw = localStorage.getItem(B2B_SESSION_KEY);
            if (!raw) return null;
            const session = JSON.parse(raw);
            return (session && session.is_authenticated) ? session : null;
        } catch (e) {
            return null;
        }
    }

    /**
     * Выход из B2B кабинета
     */
    function b2bLogout() {
        localStorage.removeItem(B2B_SESSION_KEY);
        window.location.href = 'index.html';
    }

    /**
     * Авторизация B2B клиента по IDNO и коду доступа
     */
    async function b2bLogin(idno, rawCode) {
        const cleanIdno = String(idno || '').trim();
        const cleanCode = String(rawCode || '').trim();

        if (!cleanIdno || !cleanCode) {
            return { ok: false, error: 'missing_fields' };
        }

        const code_hash = await sha256hex(cleanCode);

        // 1. Попытка запроса к Google Apps Script Web App (если настроен)
        if (GAS_URL && !GAS_URL.includes('YOUR_DEPLOYMENT_ID')) {
            try {
                const resp = await fetch(GAS_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify({ action: 'login', idno: cleanIdno, code_hash: code_hash })
                });
                const data = await resp.json();
                if (data && data.ok && data.profile) {
                    b2bSaveSession(data.profile);
                    return { ok: true, profile: data.profile };
                }
            } catch (err) {
                console.warn('GAS endpoint unavailable, falling back to local verification:', err);
            }
        }

        // 2. Локальная проверка эталонного тестового клиента
        if (cleanIdno === BUILTIN_TEST_CLIENT.idno && code_hash === BUILTIN_TEST_CLIENT.access_code_hash) {
            const profile = {
                id: BUILTIN_TEST_CLIENT.id,
                company_name: BUILTIN_TEST_CLIENT.company_name,
                idno: BUILTIN_TEST_CLIENT.idno,
                contact_name: BUILTIN_TEST_CLIENT.contact_name,
                phone: BUILTIN_TEST_CLIENT.phone,
                address: BUILTIN_TEST_CLIENT.address,
                iban: BUILTIN_TEST_CLIENT.iban,
                bank: BUILTIN_TEST_CLIENT.bank,
                discount_pct: BUILTIN_TEST_CLIENT.discount_pct,
                credit_limit: BUILTIN_TEST_CLIENT.credit_limit,
                balance: BUILTIN_TEST_CLIENT.balance
            };
            b2bSaveSession(profile);
            return { ok: true, profile: profile };
        }

        // 3. Проверка сохраненных локально клиентов из admin.html (если есть)
        try {
            const customClientsRaw = localStorage.getItem('radcor_custom_b2b_clients');
            if (customClientsRaw) {
                const customClients = JSON.parse(customClientsRaw);
                const found = customClients.find(c => String(c.idno).trim() === cleanIdno && String(c.access_code_hash).trim().toLowerCase() === code_hash);
                if (found) {
                    b2bSaveSession(found);
                    return { ok: true, profile: found };
                }
            }
        } catch (e) {}

        return { ok: false, error: 'invalid_credentials' };
    }

    /**
     * Применение скидки B2B партнера к базовой цене
     */
    function b2bApplyDiscount(basePrice) {
        const num = Number(basePrice) || 0;
        const session = b2bGetSession();
        if (!session || !session.discount_pct) return num;
        return Math.round(num * (1 - session.discount_pct / 100));
    }

    /**
     * Внедрение разметки модального окна в DOM
     */
    function injectB2BModal() {
        if (document.getElementById('b2bLoginOverlay')) return;

        const modalMarkup = `
        <div id="b2bLoginOverlay" class="b2b-modal-overlay" style="display:none;" role="dialog" aria-modal="true" aria-labelledby="b2bModalTitle">
            <div class="b2b-modal-card">
                <div class="b2b-modal-header">
                    <h2 id="b2bModalTitle" data-i18n="b2b_login_title">Вход в B2B Кабинет</h2>
                    <button class="b2b-modal-close" id="b2bModalClose" aria-label="Закрыть" type="button">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <p class="b2b-modal-desc" data-i18n="b2b_login_desc">Доступ только для зарегистрированных партнеров Radcor-Prim. Реквизиты выдаются представителем компании.</p>
                <form id="b2bLoginForm" novalidate>
                    <div class="b2b-form-group">
                        <label for="b2bIdno" data-i18n="b2b_login_idno_label">IDNO / Фискальный код компании</label>
                        <input type="text" id="b2bIdno" autocomplete="organization" placeholder="1003600012345" maxlength="13" required>
                    </div>
                    <div class="b2b-form-group">
                        <label for="b2bCode" data-i18n="b2b_login_code_label">B2B Код доступа</label>
                        <input type="password" id="b2bCode" autocomplete="current-password" placeholder="••••••••" required>
                    </div>
                    <div id="b2bLoginError" class="b2b-login-error" style="display:none;" data-i18n="b2b_login_error">Неверный IDNO или код доступа. Обратитесь к вашему менеджеру.</div>
                    <button type="submit" class="btn btn-primary full-width" id="b2bSubmitBtn" data-i18n="b2b_login_submit">Войти</button>
                </form>
                <p class="b2b-modal-footer-note">
                    <span data-i18n="b2b_login_no_account">Не являетесь партнером?</span> 
                    <a href="contacts.html" data-i18n="b2b_login_contact_link">Свяжитесь с нами</a>
                </p>
            </div>
        </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalMarkup);
    }

    /**
     * Инициализация UI и событий
     */
    function initB2BUI() {
        try {
            // Очищаем старые ключи демо-пользователя
            localStorage.removeItem('radcor_user');
        } catch (e) {}

        injectB2BModal();

        const loginBtn = document.getElementById('loginBtn');
        const overlay = document.getElementById('b2bLoginOverlay');
        const closeBtn = document.getElementById('b2bModalClose');
        const form = document.getElementById('b2bLoginForm');
        const errorBox = document.getElementById('b2bLoginError');
        const submitBtn = document.getElementById('b2bSubmitBtn');

        const session = b2bGetSession();

        // 1. Состояние кнопки в шапке
        if (loginBtn) {
            if (session) {
                const initial = (session.company_name || 'B').replace(/['"]/g, '').charAt(0).toUpperCase();
                const discountText = session.discount_pct ? `−${session.discount_pct}%` : '';
                
                loginBtn.classList.add('b2b-active');
                loginBtn.title = `${session.company_name} (Скидка: ${session.discount_pct || 0}%)`;
                loginBtn.innerHTML = `
                    <span class="login-avatar-company">${initial}</span>
                    <span id="loginBtnLabel" class="login-company-label">${session.company_name}</span>
                    ${discountText ? `<span class="login-discount-badge">${discountText}</span>` : ''}
                `;
                
                loginBtn.onclick = function(e) {
                    e.preventDefault();
                    window.location.href = 'b2b-dashboard.html';
                };
            } else {
                loginBtn.classList.remove('b2b-active');
                const lang = localStorage.getItem('radcor_lang') || 'ru';
                const label = (window.I18N && window.I18N[lang] && window.I18N[lang].nav_login) ? window.I18N[lang].nav_login : 'B2B Вход';
                loginBtn.innerHTML = `
                    <span class="login-avatar"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></span>
                    <span id="loginBtnLabel" data-i18n="nav_login">${label}</span>
                `;
                loginBtn.onclick = function(e) {
                    e.preventDefault();
                    if (overlay) {
                        overlay.style.display = 'flex';
                        const idnoInput = document.getElementById('b2bIdno');
                        if (idnoInput) idnoInput.focus();
                    }
                };
            }
        }

        // 2. Закрытие модального окна
        if (closeBtn && overlay) {
            closeBtn.onclick = function() { overlay.style.display = 'none'; };
        }
        if (overlay) {
            overlay.onclick = function(e) {
                if (e.target === overlay) overlay.style.display = 'none';
            };
        }
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && overlay && overlay.style.display === 'flex') {
                overlay.style.display = 'none';
            }
        });

        // 3. Обработка отправки формы логина
        if (form) {
            form.onsubmit = async function(e) {
                e.preventDefault();
                if (errorBox) errorBox.style.display = 'none';

                const idno = document.getElementById('b2bIdno') ? document.getElementById('b2bIdno').value.trim() : '';
                const code = document.getElementById('b2bCode') ? document.getElementById('b2bCode').value : '';

                if (!idno || !code) {
                    if (errorBox) errorBox.style.display = 'block';
                    return;
                }

                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.textContent = '…';
                }

                const result = await b2bLogin(idno, code);

                if (submitBtn) {
                    submitBtn.disabled = false;
                    const lang = localStorage.getItem('radcor_lang') || 'ru';
                    const label = (window.I18N && window.I18N[lang] && window.I18N[lang].b2b_login_submit) ? window.I18N[lang].b2b_login_submit : 'Войти';
                    submitBtn.textContent = label;
                }

                if (result.ok) {
                    if (overlay) overlay.style.display = 'none';
                    window.location.href = 'b2b-dashboard.html';
                } else {
                    if (errorBox) errorBox.style.display = 'block';
                }
            };
        }
    }

    // Экспорт глобального API B2B
    window.B2BAuth = {
        login: b2bLogin,
        logout: b2bLogout,
        getSession: b2bGetSession,
        saveSession: b2bSaveSession,
        applyDiscount: b2bApplyDiscount,
        sha256hex: sha256hex,
        initUI: initB2BUI,
        BUILTIN_TEST_CLIENT: BUILTIN_TEST_CLIENT
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initB2BUI);
    } else {
        initB2BUI();
    }
})();
