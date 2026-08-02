/**
 * RADCOR-PRIM — Frontend Application Logic v10
 * Light Theme, Sidebar Category + Filter System, Real Product Cards
 */

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================================================
    // MOBILE NAVIGATION
    // ==========================================================================
    const navToggle = document.getElementById('navToggle');
    const mainNav   = document.getElementById('mainNav');

    if (navToggle && mainNav) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('open');
            mainNav.classList.toggle('open');
            document.body.style.overflow = mainNav.classList.contains('open') ? 'hidden' : '';
        });
        mainNav.querySelectorAll('.nav-links a, .nav-actions a').forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('open');
                mainNav.classList.remove('open');
                document.body.style.overflow = '';
            });
        });
    }

    // ==========================================================================
    // CATEGORY LABEL MAP & HIERARCHY
    // ==========================================================================
    const CATEGORY_LABELS = {
        'all':                   'Все товары',
        'lubricants':            'Смазочные материалы',
        'motor-oils-pkw':        'Моторные масла для легковых (PKW)',
        'motor-oils-lkw':        'Моторные масла для грузовых (LKW)',
        'moto-oils':             'Мото масла',
        'transmission-oils':     'Трансмиссионные масла',
        'hydraulic-oils':        'Гидравлические масла',
        'greases':               'Смазки',
        'industrial-lubricants': 'Промышленные смазочные материалы',
        'coolants':              'Охлаждающие жидкости',
        'brake-fluids':          'Тормозные жидкости',
        'auto-chemistry':        'Автохимия и автокосметика',
        'accessories':           'Аксессуары',
        'auto-lamps':            'Автолампы'
    };

    const LUBRICANT_SUBCATEGORIES = [
        'motor-oils-pkw',
        'motor-oils-lkw',
        'moto-oils',
        'transmission-oils',
        'hydraulic-oils',
        'greases',
        'industrial-lubricants'
    ];

    // ==========================================================================
    // CATALOG STATE
    // ==========================================================================
    let allProducts = [];

    // ==========================================================================
    // I18N SYSTEM
    // ==========================================================================
    let currentLang = localStorage.getItem('radcor_lang') || 'ru';

    function getI18nText(key) {
        if (window.I18N && window.I18N[currentLang] && window.I18N[currentLang][key]) {
            return window.I18N[currentLang][key];
        }
        if (window.I18N && window.I18N['ru'] && window.I18N['ru'][key]) {
            return window.I18N['ru'][key];
        }
        return key;
    }

    function applyLanguage(lang) {
        try {
            currentLang = lang;
            localStorage.setItem('radcor_lang', lang);
            document.documentElement.lang = lang;

            // Update CATEGORY_LABELS
            Object.keys(CATEGORY_LABELS).forEach(catKey => {
                const i18nKey = `cat_${catKey.replace(/-/g, '_')}`;
                if (window.I18N && window.I18N[lang] && window.I18N[lang][i18nKey]) {
                    CATEGORY_LABELS[catKey] = window.I18N[lang][i18nKey];
                }
            });

            // Translate elements with data-i18n attribute
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                const text = getI18nText(key);
                if (text) el.textContent = text;
            });

            // Translate elements with data-i18n-placeholder
            document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
                const key = el.getAttribute('data-i18n-placeholder');
                const text = getI18nText(key);
                if (text) el.placeholder = text;
            });

            // Update language selector active states
            document.querySelectorAll('.lang-selector').forEach(selector => {
                const links = selector.querySelectorAll('a, span');
                links.forEach(link => {
                    const text = link.textContent.trim().toUpperCase();
                    if (text === 'RU' || text === 'RO') {
                        if ((text === 'RU' && lang === 'ru') || (text === 'RO' && lang === 'ro')) {
                            link.className = 'active';
                        } else {
                            link.className = 'lang-link';
                        }
                    }
                });
            });

            // Re-render catalog and cart if present
            if (typeof renderCatalog === 'function' && allProducts && allProducts.length > 0) {
                renderCatalog(allProducts);
            }
            if (typeof renderCart === 'function') {
                renderCart();
            }
        } catch (e) {
            console.error('i18n error:', e);
        }
    }

    // Language switcher click handlers
    document.addEventListener('click', (e) => {
        const langLink = e.target.closest('.lang-selector a, .lang-link');
        if (langLink) {
            e.preventDefault();
            const lang = langLink.textContent.trim().toLowerCase();
            if (lang === 'ru' || lang === 'ro') {
                applyLanguage(lang);
            }
        }
    });

    // Initial apply language
    applyLanguage(currentLang);

    const COLOR_CLASSES = {
        'Красный': 'color-dot-red',
        'Зелёный': 'color-dot-green',
        'Синий': 'color-dot-blue',
        'Жёлтый': 'color-dot-yellow',
        'Розовый': 'color-dot-pink',
        'Фиолетовый': 'color-dot-purple'
    };

    function getColorDotHtml(color) {
        const cls = COLOR_CLASSES[color] || 'color-dot-default';
        return `<span class="swatch-dot ${cls}"></span>`;
    }

    const catalogState = {
        activeCategory: 'all',
        activeBrands:   new Set(),
        activeVolumes:  new Set(),
        activeColors:   new Set(),
        searchQuery:    ''
    };

    // ==========================================================================
    // FALLBACK OFFLINE PRODUCT DATA
    // ==========================================================================
    const OFFLINE_PRODUCTS = [
        {
            sku: '151201', name: 'MOL Essence 5W-30', category: 'motor-oils-pkw', brand: 'MOL',
            photo_url: 'https://www.mol.com/o/MOL_Public_Content/images/products/mol-essence-5w30.png',
            volumes: [1, 4, 5, 20, 60, 208],
            description: 'Высокотехнологичное синтетическое масло для современных легковых автомобилей и фургонов, снижающее трение и износ.',
            specs: [{ label: 'Вязкость', value: '5W-30' }, { label: 'Допуски', value: 'API SL/CF, ACEA A5/B5' }],
            canister_vol: 4, canister_price: 780, barrel_vol: 205, barrel_price: 28000
        },
        {
            sku: '151205', name: 'MOL Dynamic Transit 10W-40', category: 'motor-oils-lkw', brand: 'MOL',
            photo_url: 'https://www.mol.com/o/MOL_Public_Content/images/products/mol-dynamic-transit-10w40.png',
            volumes: [4, 5, 20, 60, 208],
            description: 'Полусинтетическое масло для высоконагруженных дизельных двигателей коммерческого автотранспорта.',
            specs: [{ label: 'Вязкость', value: '10W-40' }, { label: 'Допуски', value: 'API CI-4/SL, MB 228.3' }],
            canister_vol: 4, canister_price: 640, barrel_vol: 205, barrel_price: 22000
        },
        {
            sku: '240502', name: 'Felix Carbox G12+', category: 'coolants', brand: 'Felix',
            photo_url: 'https://felix-auto.ru/upload/iblock/felix-carbox-g12plus-5kg.png',
            volumes: [1, 5, 10, 20, 220],
            description: 'Профессиональный карбоксилатный антифриз нового поколения с увеличенным ресурсом эксплуатации.',
            specs: [{ label: 'Класс', value: 'G12+' }, { label: 'Цвет', value: 'Красный/Фиолетовый' }, { label: 't замерзания', value: '-40 °C' }],
            canister_vol: 5, canister_price: 220, barrel_vol: 220, barrel_price: 7500
        }
    ];

    // ==========================================================================
    // PRODUCT SVG PLACEHOLDERS (when no photo)
    // ==========================================================================
    const CATEGORY_SVG = {
        'lubricants':           `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>`,
        'motor-oils-pkw':       `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 8h11v12H4z"></path><path d="M15 11l4-2v6l-4-2"></path><path d="M7 8V5h4v3"></path><circle cx="9.5" cy="14" r="1.5"></circle></svg>`,
        'motor-oils-lkw':       `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 3h15v13H1z"></path><path d="M16 8h4l3 3v5h-7V8z"></path><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>`,
        'moto-oils':            `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="5.5" cy="17.5" r="3.5"></circle><circle cx="18.5" cy="17.5" r="3.5"></circle><path d="M15 6h5l-3.5 6.5L12 17.5H5.5M12 6L8.5 12"></path></svg>`,
        'transmission-oils':    `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
        'hydraulic-oils':       `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`,
        'greases':              `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 2h8v4H8zM6 6h12v16H6zM10 10h4v4h-4z"></path></svg>`,
        'industrial-lubricants':`<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 20h20"></path><path d="M20 20V9l-6 4V9l-6 4V4H2v16"></path></svg>`,
        'coolants':             `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2.5v19M2.5 12h19M5.2 5.2l13.6 13.6M5.2 18.8L18.8 5.2"></path><circle cx="12" cy="12" r="2.5" fill="var(--colour-surface)"></circle></svg>`,
        'brake-fluids':         `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"></circle><circle cx="12" cy="12" r="4"></circle><path d="M12 3v3M12 18v3M3 12h3M18 12h3"></path></svg>`,
        'auto-chemistry':       `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>`,
        'accessories':          `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`,
        'auto-lamps':           `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z"></path></svg>`
    };

    // ==========================================================================
    // LOAD PRODUCTS FROM JSON
    // ==========================================================================
    async function loadProducts() {
        try {
            const response = await fetch('products.json', { cache: 'no-cache' });
            if (!response.ok) throw new Error('Failed to load products.json');
            const data = await response.json();
            return data;
        } catch (e) {
            console.error('Error loading products:', e);
            return OFFLINE_PRODUCTS;
        }
    }

    // ==========================================================================
    // SIDEBAR: CATEGORY COUNTS
    // ==========================================================================
    // ==========================================================================
    // SIDEBAR: CATEGORY COUNTS
    // ==========================================================================
    function updateCategoryCounts(products) {
        const counts = {};
        products.forEach(p => {
            counts[p.category] = (counts[p.category] || 0) + 1;
        });
        // Parent 'lubricants' sum of all subcategories
        counts['lubricants'] = LUBRICANT_SUBCATEGORIES.reduce((sum, cat) => sum + (counts[cat] || 0), counts['lubricants'] || 0);
        counts['all'] = products.length;

        Object.keys(CATEGORY_LABELS).forEach(cat => {
            const el = document.getElementById(`count-${cat}`);
            if (el) el.textContent = counts[cat] || 0;
        });
    }

    // ==========================================================================
    // SIDEBAR: DYNAMIC FILTERS (brands & volumes for current category)
    // ==========================================================================
    function renderSidebarFilters(products) {
        const colorGroup  = document.getElementById('filterColorGroup');
        const colorOpts   = document.getElementById('filterColorOptions');
        const brandGroup  = document.getElementById('filterBrandGroup');
        const volumeGroup = document.getElementById('filterVolumeGroup');
        const brandOpts   = document.getElementById('filterBrandOptions');
        const volumeOpts  = document.getElementById('filterVolumeOptions');
        if (!brandOpts || !volumeOpts || !brandGroup || !volumeGroup) return;

        const filtered = applyCategoryFilterOnly(products);

        // Collect unique colors with counts
        const colorMap = {};
        filtered.forEach(p => {
            if (p.color) colorMap[p.color] = (colorMap[p.color] || 0) + 1;
        });

        // Collect unique brands with counts
        const brandMap = {};
        filtered.forEach(p => {
            if (p.brand) brandMap[p.brand] = (brandMap[p.brand] || 0) + 1;
        });

        // Collect unique volumes with counts
        const volumeMap = {};
        filtered.forEach(p => {
            (p.volumes || []).forEach(v => {
                volumeMap[v] = (volumeMap[v] || 0) + 1;
            });
        });

        // Render color checkboxes
        if (colorGroup && colorOpts) {
            const colors = Object.keys(colorMap).sort();
            if (colors.length > 0) {
                colorOpts.innerHTML = colors.map(color => `
                    <label class="filter-checkbox-label">
                        <input type="checkbox" class="filter-color-cb" value="${color}" ${catalogState.activeColors.has(color) ? 'checked' : ''}>
                        <span class="filter-color-item-wrap">
                            ${getColorDotHtml(color)}
                            <span class="color-name">${color}</span>
                        </span>
                        <span class="filter-count">${colorMap[color]}</span>
                    </label>
                `).join('');
                colorGroup.style.display = '';
            } else {
                colorGroup.style.display = 'none';
            }
        }

        // Render brand checkboxes
        const brands = Object.keys(brandMap).sort();
        if (brands.length > 0) {
            brandOpts.innerHTML = brands.map(brand => `
                <label class="filter-checkbox-label">
                    <input type="checkbox" class="filter-brand-cb" value="${brand}" ${catalogState.activeBrands.has(brand) ? 'checked' : ''}>
                    ${brand}
                    <span class="filter-count">${brandMap[brand]}</span>
                </label>
            `).join('');
            brandGroup.style.display = '';
        } else {
            brandGroup.style.display = 'none';
        }

        // Render volume checkboxes
        const volumes = Object.keys(volumeMap).map(Number).sort((a, b) => a - b);
        if (volumes.length > 0) {
            volumeOpts.innerHTML = volumes.map(v => {
                const label = v >= 1 ? `${v} л` : `${v * 1000} мл`;
                return `
                    <label class="filter-checkbox-label">
                        <input type="checkbox" class="filter-volume-cb" value="${v}" ${catalogState.activeVolumes.has(String(v)) ? 'checked' : ''}>
                        ${label}
                        <span class="filter-count">${volumeMap[v]}</span>
                    </label>
                `;
            }).join('');
            volumeGroup.style.display = '';
        } else {
            volumeGroup.style.display = 'none';
        }

        // Attach listeners to new checkboxes
        colorOpts?.querySelectorAll('.filter-color-cb').forEach(cb => {
            cb.addEventListener('change', () => {
                if (cb.checked) catalogState.activeColors.add(cb.value);
                else catalogState.activeColors.delete(cb.value);
                renderCatalog(allProducts);
            });
        });
        brandOpts.querySelectorAll('.filter-brand-cb').forEach(cb => {
            cb.addEventListener('change', () => {
                if (cb.checked) catalogState.activeBrands.add(cb.value);
                else catalogState.activeBrands.delete(cb.value);
                renderCatalog(allProducts);
            });
        });
        volumeOpts.querySelectorAll('.filter-volume-cb').forEach(cb => {
            cb.addEventListener('change', () => {
                if (cb.checked) catalogState.activeVolumes.add(cb.value);
                else catalogState.activeVolumes.delete(cb.value);
                renderCatalog(allProducts);
            });
        });
    }

    function applyCategoryFilterOnly(products) {
        if (catalogState.activeCategory === 'all') return products;
        if (catalogState.activeCategory === 'lubricants') {
            return products.filter(p => LUBRICANT_SUBCATEGORIES.includes(p.category) || p.category === 'lubricants');
        }
        return products.filter(p => p.category === catalogState.activeCategory);
    }

    // ==========================================================================
    // APPLY FILTERS & SEARCH
    // ==========================================================================
    function applyFilters(products) {
        return products.filter(p => {
            // Category match logic
            let catMatch = false;
            if (catalogState.activeCategory === 'all') {
                catMatch = true;
            } else if (catalogState.activeCategory === 'lubricants') {
                catMatch = LUBRICANT_SUBCATEGORIES.includes(p.category) || p.category === 'lubricants';
            } else {
                catMatch = (p.category === catalogState.activeCategory);
            }

            // Color filter
            const colorMatch = catalogState.activeColors.size === 0 || catalogState.activeColors.has(p.color);

            // Brand filter
            const brandMatch = catalogState.activeBrands.size === 0 || catalogState.activeBrands.has(p.brand);

            // Volume filter
            const volMatch = catalogState.activeVolumes.size === 0 || (p.volumes || []).some(v => catalogState.activeVolumes.has(String(v)));

            // Search
            const q = catalogState.searchQuery.toLowerCase();
            const searchMatch = !q
                || p.name.toLowerCase().includes(q)
                || (p.brand || '').toLowerCase().includes(q)
                || (p.sku || '').toLowerCase().includes(q)
                || (p.description || '').toLowerCase().includes(q)
                || (p.color || '').toLowerCase().includes(q)
                || (p.specs || []).some(s => s.value && s.value.toLowerCase().includes(q));

            return catMatch && colorMatch && brandMatch && volMatch && searchMatch;
        });
    }

    // ==========================================================================
    // RENDER PRODUCT CARD
    // ==========================================================================
    function getProductPacks(product) {
        if (Array.isArray(product.packs) && product.packs.length) return product.packs;
        return [
            { id: 'canister', volume_l: Number(product.canister_vol), price_mdl: Number(product.canister_price) },
            { id: 'barrel', volume_l: Number(product.barrel_vol), price_mdl: Number(product.barrel_price) }
        ].filter(pack => pack.volume_l > 0);
    }

    function getVolumePriceForProduct(product, selectedVol) {
        const exactPack = getProductPacks(product).find(pack => Number(pack.volume_l) === Number(selectedVol));
        if (exactPack) return Number(exactPack.price_mdl) || 0;
        // If multiple volumes, calculate per-liter price proportionally from canister
        const baseVol   = product.canister_vol || 1;
        const basePrice = product.canister_price || 0;
        if (!selectedVol || selectedVol === baseVol) return basePrice;
        // For barrel volume, use barrel price
        if (selectedVol === product.barrel_vol && product.barrel_price) return product.barrel_price;
        // Linear interpolation per litre for other volumes
        const perLitre = baseVol > 0 ? basePrice / baseVol : basePrice;
        return Math.round(perLitre * selectedVol);
    }

    function renderProductCard(product) {
        const volumes  = getProductPacks(product).map(pack => pack.volume_l);
        const allSpecs = product.specs || [];
        
        // Find approvals spec if present
        const approvalSpec = allSpecs.find(s => ['Допуски', 'Спецификации', 'Одобрения', 'Официальные допуски'].includes(s.label));
        
        // Main surface specs: strictly ONLY 'Вязкость' and 'Класс'
        const mainSpecs = allSpecs.filter(s => ['Вязкость', 'Класс'].includes(s.label));
        
        // Remaining specs for drawer
        const drawerSpecs = allSpecs.filter(s => !['Вязкость', 'Класс'].includes(s.label));

        const svgIcon  = CATEGORY_SVG[product.category] || `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>`;
        const firstVol = volumes.length > 0 ? volumes[0] : product.canister_vol;
        const displayPrice = getVolumePriceForProduct(product, firstVol);

        // Volume tags HTML
        const volTagsHtml = volumes.length > 0
            ? volumes.map((v, i) => {
                const pack = getProductPacks(product).find(p => Number(p.volume_l) === Number(v));
                const label = (pack && pack.label) ? pack.label : (v >= 1 ? `${v} л` : `${v * 1000} мл`);
                return `<span class="volume-tag ${i === 0 ? 'active' : ''}" data-vol="${v}" data-sku="${product.sku}">${label}</span>`;
              }).join('')
            : '<span class="volume-tag active" data-vol="1">—</span>';

        const SPEC_LABEL_TRANSLATIONS = {
            'Вязкость': 'Vâscozitate',
            'Класс': 'Clasă',
            'Объем': 'Volum',
            'Допуски': 'Aprobări OEM',
            'Спецификации': 'Specificații',
            'Одобрения': 'Aprobări',
            'Официальные допуски': 'Aprobări OEM',
            'Производитель': 'Producător',
            'Страна': 'Țară',
            'Штрихкод EAN': 'Cod de bare EAN'
        };

        function getSpecLabel(label) {
            if (currentLang === 'ro' && SPEC_LABEL_TRANSLATIONS[label]) {
                return SPEC_LABEL_TRANSLATIONS[label];
            }
            return label;
        }

        // Specs mini HTML (strictly 'Вязкость' and 'Класс' if present)
        const specsHtml = mainSpecs.map(s => `
            <div class="spec-mini-row">
                <span class="spec-mini-label">${getSpecLabel(s.label)}</span>
                <span class="spec-mini-value">${s.value}</span>
            </div>
        `).join('');

        // SVG icons for buttons
        const shieldSvg  = `<svg class="btn-spec-svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`;
        const slidersSvg = `<svg class="btn-spec-svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="12" x2="23" y2="12"></line></svg>`;

        // Action buttons (Допуски / Характеристики)
        const hasExtraSpecs = drawerSpecs.filter(s => !['Допуски', 'Спецификации', 'Одобрения', 'Официальные допуски'].includes(s.label)).length > 0;
        let specActionBtnsHtml = '';
        if (approvalSpec || hasExtraSpecs) {
            const approvalsLabel = getI18nText('product_btn_approvals');
            const specsLabel = getI18nText('product_btn_specs');
            specActionBtnsHtml = `
                <div class="product-card-spec-actions">
                    ${approvalSpec ? `<button class="btn-card-spec-action btn-toggle-approvals" data-sku="${product.sku}">${shieldSvg}<span>${approvalsLabel}</span></button>` : ''}
                    ${hasExtraSpecs ? `<button class="btn-card-spec-action btn-toggle-details" data-sku="${product.sku}">${slidersSvg}<span>${specsLabel}</span></button>` : ''}
                </div>
            `;
        }

        // Localized title & description
        const prodName = currentLang === 'ro' && product.name_ro ? product.name_ro : product.name;
        const prodDesc = currentLang === 'ro' && product.description_ro ? product.description_ro : product.description;

        // Image or placeholder
        const imgHtml = product.photo_url
            ? `<img src="${product.photo_url}" alt="${prodName}" class="product-card-img" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
               <span class="product-img-placeholder" style="display:none;">${svgIcon}</span>`
            : `<span class="product-img-placeholder">${svgIcon}</span>`;

        const colorTagHtml = product.color
            ? `<span class="product-tag-color">
                 ${getColorDotHtml(product.color)}
                 <span>${product.color}</span>
               </span>`
            : '';

        const card = document.createElement('div');
        card.className = 'product-card';
        card.setAttribute('data-sku', product.sku);
        card.setAttribute('data-brand', product.brand || '');
        card.setAttribute('data-category', product.category || '');

        const volLabel = currentLang === 'ro' ? 'Volum:' : 'Объём:';
        const perLabel = currentLang === 'ro' ? 'per' : 'за';
        const requestPriceLabel = getI18nText('product_price_request');
        const requestBtnLabel = getI18nText('product_btn_request');
        const addOrderLabel = getI18nText('cart_btn_add');

        card.innerHTML = `
            <div class="product-card-img-wrap">
                ${imgHtml}
                <span class="product-tag-brand" data-brand="${product.brand || ''}">${product.brand || ''}</span>
                ${colorTagHtml}
            </div>
            <div class="product-card-body">
                <div class="product-sku code-font">${product.sku}</div>
                <h3 class="product-card-title">${prodName}</h3>
                ${prodDesc ? `<p class="product-card-desc">${prodDesc}</p>` : ''}
                ${mainSpecs.length > 0 ? `<div class="product-specs-mini">${specsHtml}</div>` : ''}
                ${specActionBtnsHtml}

                <div class="product-card-drawer" id="drawer-${product.sku}" style="display: none;">
                    <div class="drawer-body" id="drawer-body-${product.sku}"></div>
                </div>

                <div class="product-volumes">
                    <span class="volumes-label">${volLabel}</span>
                    ${volTagsHtml}
                </div>
                <div class="product-card-footer">
                    ${product.category === 'industrial-lubricants' || product.price_on_request ? `
                        <div>
                            <span class="product-price price-on-request">${requestPriceLabel}</span>
                            <span class="product-price-unit">Tel: +373 685 50 595</span>
                        </div>
                        <a href="tel:+37368550595" class="btn-add-cart btn-call-request">📞 ${requestBtnLabel}</a>
                    ` : `
                        <div>
                            <span class="product-price" id="price-${product.sku}">${displayPrice} MDL</span>
                            <span class="product-price-unit">${perLabel} ${firstVol >= 1 ? firstVol + ' л' : (firstVol * 1000) + ' мл'}</span>
                        </div>
                        <button class="btn-add-cart" data-sku="${product.sku}" data-name="${prodName}"
                                data-price="${displayPrice}" data-vol="${firstVol}">
                            ${addOrderLabel}
                        </button>
                    `}
                </div>
            </div>
        `;

        return card;
    }

    // ==========================================================================
    // RENDER CATALOG GRID
    // ==========================================================================
    function renderCatalog(products) {
        const grid  = document.getElementById('catalogGrid');
        const loader = document.getElementById('catalogLoader');
        if (!grid) return;

        const visible = applyFilters(products);

        // Update breadcrumb
        const titleEl = document.getElementById('catalogBreadcrumbTitle');
        const countEl = document.getElementById('catalogProductCount');
        if (titleEl) titleEl.textContent = CATEGORY_LABELS[catalogState.activeCategory] || 'Все товары';
        if (countEl) countEl.textContent = `${visible.length} тов.`;

        // Clear grid except loader
        Array.from(grid.children).forEach(child => {
            if (child.id !== 'catalogLoader') child.remove();
        });

        if (loader) loader.style.display = 'none';

        if (visible.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'catalog-empty';
            empty.innerHTML = `<span class="catalog-empty-icon">🔍</span>
                <strong>Ничего не найдено</strong><br>
                <span style="font-size:0.85rem;margin-top:6px;display:block;">Попробуйте изменить фильтры или поисковый запрос</span>`;
            grid.appendChild(empty);
            return;
        }

        const fragment = document.createDocumentFragment();
        visible.forEach(p => fragment.appendChild(renderProductCard(p)));
        grid.appendChild(fragment);
    }

    // ==========================================================================
    // CATALOG GRID CLICK HANDLERS (VOLUME, SPECS DRAWER, ADD TO CART)
    // ==========================================================================
    document.getElementById('catalogGrid')?.addEventListener('click', e => {
        // Toggle Approvals / Specifications Drawer
        const specActionBtn = e.target.closest('.btn-card-spec-action');
        if (specActionBtn) {
            const sku = specActionBtn.getAttribute('data-sku');
            const card = specActionBtn.closest('.product-card');
            const drawer = card?.querySelector(`#drawer-${sku}`);
            const bodyEl = card?.querySelector(`#drawer-body-${sku}`);
            
            const product = allProducts.find(p => p.sku === sku);
            if (!product || !drawer) return;

            const isApprovals = specActionBtn.classList.contains('btn-toggle-approvals');
            const currentType = drawer.getAttribute('data-type');
            const isAlreadyOpen = drawer.style.display !== 'none' && currentType === (isApprovals ? 'approvals' : 'details');

            if (isAlreadyOpen) {
                drawer.style.display = 'none';
                return;
            }

            drawer.setAttribute('data-type', isApprovals ? 'approvals' : 'details');

            if (isApprovals) {
                const approvalSpec = (product.specs || []).find(s => ['Допуски', 'Спецификации', 'Одобрения', 'Официальные допуски'].includes(s.label));
                const text = approvalSpec ? approvalSpec.value : '';
                bodyEl.innerHTML = `
                    <div class="approval-exact-text">
                        ${text}
                    </div>
                `;
            } else {
                const drawerSpecs = (product.specs || []).filter(s => !['Вязкость', 'Класс', 'Допуски', 'Спецификации', 'Одобрения', 'Официальные допуски'].includes(s.label));
                const specsRows = drawerSpecs.map(s => {
                    const labelText = currentLang === 'ro' && s.label === 'Производитель' ? 'Producător' : s.label;
                    return `
                    <div class="drawer-spec-row">
                        <span class="drawer-spec-label">${labelText}:</span>
                        <span class="drawer-spec-val">${s.value}</span>
                    </div>
                    `;
                }).join('');
                bodyEl.innerHTML = specsRows ? `<div class="drawer-specs-table">${specsRows}</div>` : `<div style="font-size:0.78rem;color:var(--colour-text-muted);">${getI18nText('product_no_specs')}</div>`;
            }

            drawer.style.display = 'block';
            return;
        }

        // Close drawer button
        const closeBtn = e.target.closest('.btn-close-drawer');
        if (closeBtn) {
            const sku = closeBtn.getAttribute('data-sku');
            const drawer = document.getElementById(`drawer-${sku}`);
            if (drawer) drawer.style.display = 'none';
            return;
        }
        const volTag = e.target.closest('.volume-tag');
        if (volTag) {
            const card = volTag.closest('.product-card');
            if (!card) return;
            const sku = card.getAttribute('data-sku');
            const vol = parseFloat(volTag.getAttribute('data-vol'));
            const product = allProducts.find(p => p.sku === sku);
            if (!product) return;

            // Update active volume tag UI
            card.querySelectorAll('.volume-tag').forEach(t => t.classList.remove('active'));
            volTag.classList.add('active');

            // Recalculate price for selected volume
            const newPrice = getVolumePriceForProduct(product, vol);
            const priceEl  = card.querySelector(`#price-${sku}`);
            const unitEl   = priceEl?.nextElementSibling;
            const cartBtn  = card.querySelector('.btn-add-cart');
            const packObj = getProductPacks(product).find(p => Number(p.volume_l) === Number(vol));
            const volText = (packObj && packObj.label) ? packObj.label : (vol >= 1 ? `${vol} л` : `${vol * 1000} мл`);
            if (priceEl) priceEl.textContent = `${newPrice} MDL`;
            if (unitEl)  unitEl.textContent = `за ${volText}`;
            if (cartBtn) {
                cartBtn.setAttribute('data-price', newPrice);
                cartBtn.setAttribute('data-vol', vol);
            }
            return;
        }

        // Add to cart button click
        const addBtn = e.target.closest('.btn-add-cart');
        if (addBtn) {
            const sku   = addBtn.getAttribute('data-sku');
            const name  = addBtn.getAttribute('data-name');
            const price = parseFloat(addBtn.getAttribute('data-price'));
            const vol   = parseFloat(addBtn.getAttribute('data-vol'));
            const product = allProducts.find(p => p.sku === sku);
            const pack = product && getProductPacks(product).find(item => Number(item.volume_l) === vol);
            addToCart(sku, name, price, vol, pack?.id || 'canister');

            // Visual feedback
            addBtn.textContent = getI18nText('cart_btn_added');
            addBtn.style.backgroundColor = 'var(--colour-green)';
            setTimeout(() => {
                addBtn.textContent = getI18nText('cart_btn_add');
                addBtn.style.backgroundColor = '';
            }, 1200);
        }
    });

    // ==========================================================================
    // SIDEBAR CATEGORY CLICK & ACCORDION
    // ==========================================================================
    document.getElementById('sidebarCategoryList')?.addEventListener('click', e => {
        const toggleBtn = e.target.closest('.cat-accordion-toggle');
        const parentAcc = e.target.closest('.sidebar-cat-accordion');

        if (toggleBtn && parentAcc) {
            e.stopPropagation();
            parentAcc.classList.toggle('open');
            return;
        }

        const item = e.target.closest('.sidebar-cat-item');
        if (!item) return;

        const cat = item.getAttribute('data-cat');
        catalogState.activeCategory = cat;
        catalogState.activeBrands.clear();
        catalogState.activeVolumes.clear();
        catalogState.activeColors.clear();

        // If parent lubricants clicked, open accordion
        if (cat === 'lubricants' && parentAcc) {
            parentAcc.classList.add('open');
        }

        // Update active state
        document.querySelectorAll('.sidebar-cat-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        renderSidebarFilters(allProducts);
        renderCatalog(allProducts);
    });

    // ==========================================================================
    // SEARCH INPUT
    // ==========================================================================
    const catalogSearch = document.getElementById('catalogSearch');
    let searchDebounce;
    if (catalogSearch) {
        catalogSearch.addEventListener('input', () => {
            clearTimeout(searchDebounce);
            searchDebounce = setTimeout(() => {
                catalogState.searchQuery = catalogSearch.value.trim();
                renderCatalog(allProducts);
            }, 220);
        });
    }

    // ==========================================================================
    // CART LOGIC
    // ==========================================================================
    const cartItems = JSON.parse(localStorage.getItem('radcor_cart_v2') || '{}'); // { sku_pack: { name, price, vol, packId, qty } }
    const FREE_DELIVERY_THRESHOLD = 1500;

    function addToCart(sku, name, price, vol, packId = 'canister') {
        const key = `${sku}_${packId}`;
        if (cartItems[key]) {
            cartItems[key].qty += 1;
        } else {
            cartItems[key] = { sku, name, price, vol, packId, qty: 1 };
        }
        renderCart();
        openCart();
    }

    function renderCart() {
        const list    = document.getElementById('cartItemsList');
        const count   = document.getElementById('cartCount');
        const totalEl = document.getElementById('cartTotalSum');
        const volEl   = document.getElementById('totalVolume');
        const delEl   = document.getElementById('deliveryProgress');
        if (!list) return;
        localStorage.setItem('radcor_cart_v2', JSON.stringify(cartItems));

        const keys = Object.keys(cartItems);
        if (keys.length === 0) {
            list.innerHTML = `<p class="empty-cart-msg">${getI18nText('cart_empty')}</p>`;
            if (count) count.textContent = '0';
            if (totalEl) totalEl.textContent = '0 MDL';
            if (volEl) volEl.textContent = '0 л';
            const remText = currentLang === 'ro' ? 'Au rămas' : 'Осталось';
            if (delEl) delEl.textContent = `${remText} ${FREE_DELIVERY_THRESHOLD} MDL`;
            return;
        }

        let totalQty = 0, totalPrice = 0, totalVol = 0;
        list.innerHTML = keys.map(key => {
            const item = cartItems[key];
            totalQty   += item.qty;
            totalPrice += item.price * item.qty;
            totalVol   += item.vol * item.qty;
            const prod = allProducts.find(p => p.sku === item.sku);
            const itemName = currentLang === 'ro' && prod && prod.name_ro ? prod.name_ro : item.name;
            const packMatch = prod && getProductPacks(prod).find(p => Number(p.volume_l) === Number(item.vol));
            const volLabel = (packMatch && packMatch.label) ? packMatch.label : (item.vol >= 1 ? `${item.vol} л` : `${item.vol * 1000} мл`);
            return `
            <div class="cart-item-row" data-key="${key}">
                <div class="cart-item-info">
                    <div>
                        <h4>${itemName}</h4>
                        <span class="cart-item-sku">${item.sku} · ${volLabel}</span>
                    </div>
                    <span class="cart-item-price">${item.price * item.qty} MDL</span>
                </div>
                <div class="cart-item-controls">
                    <div class="qty-selector">
                        <button class="qty-btn cart-qty-minus" data-key="${key}">−</button>
                        <span class="qty-input">${item.qty}</span>
                        <button class="qty-btn cart-qty-plus" data-key="${key}">+</button>
                    </div>
                    <button class="item-remove-btn cart-remove" data-key="${key}" title="Удалить">🗑</button>
                </div>
            </div>`;
        }).join('');

        if (count) count.textContent = totalQty;
        if (totalEl) totalEl.textContent = `${totalPrice.toLocaleString()} MDL`;
        if (volEl) volEl.textContent = `${totalVol.toFixed(1)} л`;
        const remaining = Math.max(0, FREE_DELIVERY_THRESHOLD - totalPrice);
        const remText = currentLang === 'ro' ? 'Au rămas' : 'Осталось';
        const freeText = currentLang === 'ro' ? '✅ Livrare gratuită!' : '✅ Бесплатная доставка!';
        if (delEl) delEl.textContent = remaining > 0
            ? `${remText} ${remaining.toLocaleString()} MDL`
            : freeText;

        // Event delegation on list
        list.querySelectorAll('.cart-qty-plus').forEach(btn => btn.addEventListener('click', () => {
            cartItems[btn.dataset.key].qty++;
            renderCart();
        }));
        list.querySelectorAll('.cart-qty-minus').forEach(btn => btn.addEventListener('click', () => {
            if (cartItems[btn.dataset.key].qty > 1) cartItems[btn.dataset.key].qty--;
            else delete cartItems[btn.dataset.key];
            renderCart();
        }));
        list.querySelectorAll('.cart-remove').forEach(btn => btn.addEventListener('click', () => {
            delete cartItems[btn.dataset.key];
            renderCart();
        }));
    }

    function openCart() {
        document.getElementById('cartDrawer')?.classList.add('open');
        document.getElementById('cartOverlay')?.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
    function closeCart() {
        document.getElementById('cartDrawer')?.classList.remove('open');
        document.getElementById('cartOverlay')?.classList.remove('open');
        document.body.style.overflow = '';
    }

    document.getElementById('cartBtn')?.addEventListener('click', openCart);
    document.getElementById('cartClose')?.addEventListener('click', closeCart);
    document.getElementById('cartOverlay')?.addEventListener('click', closeCart);

    // ==========================================================================
    // CHECKOUT
    // ==========================================================================
    document.getElementById('checkoutBtn')?.addEventListener('click', async () => {
        const keys = Object.keys(cartItems);
        if (keys.length > 0) {
            localStorage.setItem('radcor_cart_v2', JSON.stringify(cartItems));
            window.location.href = 'checkout.html';
            return;
        }
        if (keys.length === 0) { alert('Корзина пуста.'); return; }

        const items = keys.map(k => ({
            product_id: cartItems[k].sku,
            product_name: cartItems[k].name,
            quantity: cartItems[k].qty,
            price: cartItems[k].price
        }));
        const totalPrice = items.reduce((s, i) => s + i.price * i.quantity, 0);

        try {
            const res = await fetch('/api/v1/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    company_name: 'Оптовый клиент (сайт)',
                    contact_person: 'Не указано',
                    email: '', phone: '',
                    payment_method: 'По договору',
                    delivery_method: 'Доставка',
                    items,
                    total_price: totalPrice
                })
            });
            if (res.ok) {
                Object.keys(cartItems).forEach(k => delete cartItems[k]);
                renderCart();
                closeCart();
                alert(getI18nText('msg_order_accepted'));
            } else {
                throw new Error('API error');
            }
        } catch {
            // Offline fallback
            const saved = JSON.parse(localStorage.getItem('radcor_orders') || '[]');
            saved.push({ items, total_price: totalPrice, created_at: new Date().toISOString(), status: 'Pending' });
            localStorage.setItem('radcor_orders', JSON.stringify(saved));
            Object.keys(cartItems).forEach(k => delete cartItems[k]);
            renderCart();
            closeCart();
            alert(getI18nText('msg_order_saved_offline'));
        }
    });

    // ==========================================================================
    // LOGIN MODAL
    // ==========================================================================
    const loginModal  = document.getElementById('loginModal');
    const loginBtn    = document.getElementById('loginBtn');
    const loginBtnLabel = document.getElementById('loginBtnLabel');
    const modalClose  = document.getElementById('modalClose');
    const loginForm   = document.getElementById('loginForm');
    const registerLink = document.getElementById('registerLink');

    // Restore login state
    const savedUser = localStorage.getItem('radcor_user');
    if (savedUser) {
        const user = JSON.parse(savedUser);
        if (loginBtnLabel) loginBtnLabel.textContent = user.name || 'Кабинет';
    }

    function openLoginModal() {
        loginModal?.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
    function closeLoginModal() {
        loginModal?.classList.remove('open');
        document.body.style.overflow = '';
    }

    loginBtn?.addEventListener('click', () => {
        if (localStorage.getItem('radcor_user')) {
            window.location.href = 'b2b-dashboard.html';
        } else {
            openLoginModal();
        }
    });
    modalClose?.addEventListener('click', closeLoginModal);
    loginModal?.addEventListener('click', e => { if (e.target === loginModal) closeLoginModal(); });
    registerLink?.addEventListener('click', (e) => {
        e.preventDefault();
        closeLoginModal();
        document.getElementById('b2b')?.scrollIntoView({ behavior: 'smooth' });
    });

    loginForm?.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('loginEmail')?.value;
        // Simple mock auth: accept any email with password length >= 4
        const pass  = document.getElementById('loginPassword')?.value;
        if (!pass || pass.length < 4) {
            alert(getI18nText('msg_invalid_password'));
            return;
        }
        const userName = email.split('@')[0];
        localStorage.setItem('radcor_user', JSON.stringify({ email, name: userName }));
        if (loginBtnLabel) loginBtnLabel.textContent = userName;
        closeLoginModal();
        alert(`✅ Добро пожаловать, ${userName}! Функция личного кабинета будет доступна в ближайшее время.`);
    });

    // ==========================================================================
    // B2B PARTNER FORM
    // ==========================================================================
    document.getElementById('b2bForm')?.addEventListener('submit', async e => {
        e.preventDefault();
        const data = {
            company_name:   document.getElementById('compName')?.value,
            contact_person: document.getElementById('contactPerson')?.value,
            phone:          document.getElementById('phone')?.value,
            status: 'New',
            created_at: new Date().toISOString()
        };
        try {
            await fetch('/api/v1/partners', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } catch {
            const saved = JSON.parse(localStorage.getItem('radcor_partners') || '[]');
            saved.push(data);
            localStorage.setItem('radcor_partners', JSON.stringify(saved));
        }
        const successEl = document.getElementById('formSuccess');
        if (successEl) { successEl.style.display = 'block'; }
        e.target.reset();
    });

    // ==========================================================================
    // VIN DECODER
    // ==========================================================================
    const VIN_LENGTH = 17;

    catalogSearch?.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            const val = catalogSearch.value.trim().toUpperCase();
            if (val.length === VIN_LENGTH && /^[A-HJ-NPR-Z0-9]{17}$/.test(val)) {
                runVinDecode(val);
            }
        }
    });

    async function runVinDecode(vin) {
        const panel     = document.getElementById('vinDecoderPanel');
        const fillBar   = document.getElementById('fillBarScan');
        const resultsEl = document.getElementById('scannerResults');
        if (!panel) return;

        panel.style.display = 'block';
        if (resultsEl) { resultsEl.classList.remove('show'); resultsEl.style.display = 'none'; }
        if (fillBar) { fillBar.style.width = '0%'; }

        // Animate progress
        let progress = 0;
        const interval = setInterval(() => {
            progress = Math.min(progress + 4, 95);
            if (fillBar) fillBar.style.width = progress + '%';
        }, 100);

        let result;
        try {
            const res = await fetch('/api/v1/vin/decode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ vin })
            });
            if (res.ok) result = await res.json();
            else throw new Error('VIN API error');
        } catch {
            // Offline fallback
            result = {
                make: 'Mercedes-Benz', model: 'Sprinter', engine: 'OM 651.955',
                year: 2018, fuel: 'Дизель', displacement: '2.2L',
                recommendations: [
                    { sku: '151201', name: 'MOL Essence 5W-30' },
                    { sku: '240502', name: 'Felix Carbox G12+' }
                ]
            };
        }

        clearInterval(interval);
        if (fillBar) fillBar.style.width = '100%';

        setTimeout(() => {
            const nameEl = panel.querySelector('.result-vehicle-name');
            const detailEl = panel.querySelector('.result-details');
            const tagsEl   = panel.querySelector('.rec-tags');

            if (nameEl) nameEl.textContent = `${result.make} ${result.model} (${result.engine})`;
            if (detailEl) detailEl.textContent = `Двигатель: ${result.engine} | ${result.fuel} | ${result.displacement} | ${result.year} г.в.`;
            if (tagsEl && result.recommendations) {
                tagsEl.innerHTML = result.recommendations.map(r => `<span class="rec-tag">${r.name}</span>`).join('');
            }
            if (resultsEl) { resultsEl.style.display = 'block'; resultsEl.classList.add('show'); }
        }, 300);
    }

    // Add VIN fluids button
    document.getElementById('addAllVinFluidsBtn')?.addEventListener('click', () => {
        const tags = document.querySelectorAll('#scannerResults .rec-tag');
        let added = 0;
        tags.forEach(tag => {
            const name = tag.textContent.trim();
            const product = allProducts.find(p => p.name.includes(name.split(' ')[0]));
            if (product) {
                addToCart(product.sku, product.name, product.canister_price, product.canister_vol);
                added++;
            }
        });
        if (added === 0) alert('Продукты из списка уже добавлены или недоступны.');
    });

    // ==========================================================================
    // MOL LUBE FINDER WIZARD
    // ==========================================================================
    const wizardSteps = document.querySelectorAll('.wizard-step');
    let wizardSelections = {};

    const WIZARD_RESULTS = {
        'passenger_5w-30': { title: 'MOL Essence 5W-30', sku: '151201', desc: 'Специально рекомендовано для бензиновых и дизельных двигателей легковых машин с высокими требованиями экономии топлива.' },
        'passenger_10w-40': { title: 'MOL Dynamic 10W-40', sku: '151205', desc: 'Надёжное полусинтетическое масло для легковых автомобилей с умеренными нагрузками.' },
        'commercial_10w-40': { title: 'MOL Dynamic Transit 10W-40', sku: '151205', desc: 'Специально разработано для высоконагруженных коммерческих двигателей MB, MAN, Volvo.' },
        'commercial_5w-30': { title: 'MOL Essence 5W-30', sku: '151201', desc: 'Синтетическое масло с расширенными допусками — идеально для современных фургонов.' },
        'agro_10w-40': { title: 'MOL Dynamic Transit 10W-40', sku: '151205', desc: 'Устойчивое к высоким нагрузкам масло для сельхозтехники с дизельными двигателями.' },
        'agro_5w-30': { title: 'MOL Essence 5W-30', sku: '151201', desc: 'Применяется в современных дизельных тракторах с требованиями ACEA E6/E9.' }
    };

    document.querySelectorAll('.wizard-next-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const step    = btn.closest('.wizard-step');
            const stepNum = parseInt(step.getAttribute('data-step'));
            wizardSelections[stepNum] = btn.getAttribute('data-val');
            showWizardStep(stepNum + 1);
        });
    });

    function showWizardStep(num) {
        wizardSteps.forEach(s => s.classList.remove('active'));
        const nextStep = document.querySelector(`.wizard-step[data-step="${num}"]`);
        if (!nextStep) return;
        nextStep.classList.add('active');

        if (num === 3) {
            const key = `${wizardSelections[1]}_${wizardSelections[2]}`;
            const result = WIZARD_RESULTS[key] || WIZARD_RESULTS['passenger_5w-30'];
            document.getElementById('wizardResultTitle').textContent = result.title;
            document.getElementById('wizardResultDesc').textContent  = result.desc;
            document.getElementById('wizardAddCartBtn').setAttribute('data-sku', result.sku);
        }
    }

    document.getElementById('wizardRestartBtn')?.addEventListener('click', () => {
        wizardSelections = {};
        showWizardStep(1);
    });

    document.getElementById('wizardAddCartBtn')?.addEventListener('click', btn => {
        const sku = btn.target.getAttribute('data-sku');
        const product = allProducts.find(p => p.sku === sku);
        if (product) addToCart(product.sku, product.name, product.canister_price, product.canister_vol);
    });

    // ==========================================================================
    // FAQ ACCORDIONS (on FAQ page)
    // ==========================================================================
    document.querySelectorAll('.faq-accordion').forEach(acc => {
        acc.addEventListener('click', () => {
            const isOpen = acc.classList.contains('open');
            document.querySelectorAll('.faq-accordion.open').forEach(a => a.classList.remove('open'));
            if (!isOpen) acc.classList.add('open');
        });
    });

    // ==========================================================================
    // INIT: LOAD PRODUCTS & RENDER
    // ==========================================================================
    async function init() {
        const loader = document.getElementById('catalogLoader');
        if (loader) loader.style.display = 'block';

        allProducts = await loadProducts();

        // Check for URL parameter ?cat=...
        const urlParams = new URLSearchParams(window.location.search);
        const catParam = urlParams.get('cat');
        if (catParam && CATEGORY_LABELS[catParam]) {
            catalogState.activeCategory = catParam;
            
            // Set active class in sidebar
            document.querySelectorAll('.sidebar-cat-item').forEach(i => {
                i.classList.toggle('active', i.getAttribute('data-cat') === catParam);
            });

            // Open accordion if lubricant subcategory or parent lubricants
            if (catParam === 'lubricants' || LUBRICANT_SUBCATEGORIES.includes(catParam)) {
                const parentAcc = document.querySelector('.sidebar-cat-accordion');
                if (parentAcc) parentAcc.classList.add('open');
            }
        }

        updateCategoryCounts(allProducts);
        renderSidebarFilters(allProducts);
        renderCatalog(allProducts);
        renderCart();
    }

    init();

}); // end DOMContentLoaded
