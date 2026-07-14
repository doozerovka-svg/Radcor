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
    // CATEGORY LABEL MAP
    // ==========================================================================
    const CATEGORY_LABELS = {
        'all':          'Все товары',
        'motor-oils':   'Автомобильные масла',
        'coolants':     'Охлаждающие жидкости',
        'autochemistry':'Автохимия и смазки',
        'winter':       'Зимняя программа',
        'accessories':  'Расходники и аксессуары',
        'industrial':   'Промышленный сектор'
    };

    // ==========================================================================
    // CATALOG STATE
    // ==========================================================================
    let allProducts = [];

    const catalogState = {
        activeCategory: 'all',
        activeBrands:   new Set(),
        activeVolumes:  new Set(),
        searchQuery:    ''
    };

    // ==========================================================================
    // FALLBACK OFFLINE PRODUCT DATA
    // ==========================================================================
    const OFFLINE_PRODUCTS = [
        {
            sku: '151201', name: 'MOL Essence 5W-30', category: 'motor-oils', brand: 'MOL',
            photo_url: 'https://www.mol.com/o/MOL_Public_Content/images/products/mol-essence-5w30.png',
            volumes: [1, 4, 5, 20, 60, 208],
            description: 'Высокотехнологичное синтетическое масло для современных легковых автомобилей и фургонов, снижающее трение и износ.',
            specs: [{ label: 'Вязкость', value: '5W-30' }, { label: 'Допуски', value: 'API SL/CF, ACEA A5/B5' }],
            canister_vol: 4, canister_price: 780, barrel_vol: 205, barrel_price: 28000
        },
        {
            sku: '151205', name: 'MOL Dynamic Transit 10W-40', category: 'motor-oils', brand: 'MOL',
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
        },
        {
            sku: '180701', name: 'Prista Ultra 10W-40', category: 'motor-oils', brand: 'Prista',
            photo_url: '',
            volumes: [1, 4, 5, 20, 60, 208],
            description: 'Универсальное полусинтетическое моторное масло для смешанных автопарков.',
            specs: [{ label: 'Вязкость', value: '10W-40' }, { label: 'Допуски', value: 'API SN/CF, ACEA A3/B4' }],
            canister_vol: 4, canister_price: 420, barrel_vol: 205, barrel_price: 15000
        },
        {
            sku: '240901', name: 'Felix DOT-4', category: 'autochemistry', brand: 'Felix',
            photo_url: 'https://felix-auto.ru/upload/iblock/felix-dot4-0.5l.png',
            volumes: [0.25, 0.5, 1],
            description: 'Синтетическая жидкость для гидравлических приводов сцепления и тормозов.',
            specs: [{ label: 'Стандарт', value: 'FMVSS №116 DOT 4' }, { label: 't кипения', value: '> 230 °C' }],
            canister_vol: 1, canister_price: 95, barrel_vol: 200, barrel_price: 12000
        },
        {
            sku: '520101', name: 'Hepu Antifreeze G11', category: 'coolants', brand: 'Hepu',
            photo_url: 'https://www.hepu.de/wp-content/uploads/hepu-antifreeze-g11-5l.jpg',
            volumes: [1, 5, 10, 25],
            description: 'Классический антифриз класса G11 на основе этиленгликоля с силикатными присадками.',
            specs: [{ label: 'Класс', value: 'G11 / OAT' }, { label: 'Цвет', value: 'Зеленый' }, { label: 't замерзания', value: '-38 °C' }],
            canister_vol: 5, canister_price: 195, barrel_vol: 25, barrel_price: 900
        }
    ];

    // ==========================================================================
    // PRODUCT EMOJI PLACEHOLDERS (when no photo)
    // ==========================================================================
    const CATEGORY_EMOJI = {
        'motor-oils':   '🛢',
        'coolants':     '❄️',
        'autochemistry':'🔧',
        'winter':       '❄',
        'accessories':  '📦',
        'industrial':   '🏭'
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
    function updateCategoryCounts(products) {
        const counts = {};
        products.forEach(p => {
            counts[p.category] = (counts[p.category] || 0) + 1;
        });
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
        const filtered = catalogState.activeCategory === 'all'
            ? products
            : products.filter(p => p.category === catalogState.activeCategory);

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

        const brandGroup  = document.getElementById('filterBrandGroup');
        const volumeGroup = document.getElementById('filterVolumeGroup');
        const brandOpts   = document.getElementById('filterBrandOptions');
        const volumeOpts  = document.getElementById('filterVolumeOptions');

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

    // ==========================================================================
    // APPLY FILTERS & SEARCH
    // ==========================================================================
    function applyFilters(products) {
        return products.filter(p => {
            // Category
            const catMatch = catalogState.activeCategory === 'all' || p.category === catalogState.activeCategory;

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
                || (p.specs || []).some(s => s.value && s.value.toLowerCase().includes(q));

            return catMatch && brandMatch && volMatch && searchMatch;
        });
    }

    // ==========================================================================
    // RENDER PRODUCT CARD
    // ==========================================================================
    function getVolumePriceForProduct(product, selectedVol) {
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
        const volumes  = product.volumes || [];
        const specs    = (product.specs || []).slice(0, 2); // show max 2 specs
        const emoji    = CATEGORY_EMOJI[product.category] || '📦';
        const firstVol = volumes.length > 0 ? volumes[0] : product.canister_vol;
        const displayPrice = getVolumePriceForProduct(product, firstVol);

        // Volume tags HTML
        const volTagsHtml = volumes.length > 0
            ? volumes.map((v, i) => {
                const label = v >= 1 ? `${v} л` : `${v * 1000} мл`;
                return `<span class="volume-tag ${i === 0 ? 'active' : ''}" data-vol="${v}" data-sku="${product.sku}">${label}</span>`;
              }).join('')
            : '<span class="volume-tag active" data-vol="1">—</span>';

        // Specs mini HTML
        const specsHtml = specs.map(s => `
            <div class="spec-mini-row">
                <span class="spec-mini-label">${s.label}</span>
                <span class="spec-mini-value">${s.value}</span>
            </div>
        `).join('');

        // Image or placeholder
        const imgHtml = product.photo_url
            ? `<img src="${product.photo_url}" alt="${product.name}" class="product-card-img" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
               <span class="product-img-placeholder" style="display:none;">${emoji}</span>`
            : `<span class="product-img-placeholder">${emoji}</span>`;

        const card = document.createElement('div');
        card.className = 'product-card';
        card.setAttribute('data-sku', product.sku);
        card.setAttribute('data-brand', product.brand || '');
        card.setAttribute('data-category', product.category || '');

        card.innerHTML = `
            <div class="product-card-img-wrap">
                ${imgHtml}
                <span class="product-tag-brand" data-brand="${product.brand || ''}">${product.brand || ''}</span>
            </div>
            <div class="product-card-body">
                <div class="product-sku code-font">${product.sku}</div>
                <h3 class="product-card-title">${product.name}</h3>
                <p class="product-card-desc">${product.description || ''}</p>
                ${specs.length > 0 ? `<div class="product-specs-mini">${specsHtml}</div>` : ''}
                <div class="product-volumes">
                    <span class="volumes-label">Объём:</span>
                    ${volTagsHtml}
                </div>
                <div class="product-card-footer">
                    <div>
                        <span class="product-price" id="price-${product.sku}">${displayPrice} MDL</span>
                        <span class="product-price-unit">за ${firstVol >= 1 ? firstVol + ' л' : (firstVol * 1000) + ' мл'}</span>
                    </div>
                    <button class="btn-add-cart" data-sku="${product.sku}" data-name="${product.name}"
                            data-price="${displayPrice}" data-vol="${firstVol}">
                        + В заказ
                    </button>
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
    // VOLUME TAG CLICK → UPDATE PRICE & CART DATA
    // ==========================================================================
    document.getElementById('catalogGrid').addEventListener('click', e => {
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
            if (priceEl) priceEl.textContent = `${newPrice} MDL`;
            if (unitEl)  unitEl.textContent = `за ${vol >= 1 ? vol + ' л' : (vol * 1000) + ' мл'}`;
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
            addToCart(sku, name, price, vol);

            // Visual feedback
            addBtn.textContent = '✓ Добавлено';
            addBtn.style.backgroundColor = 'var(--colour-green)';
            setTimeout(() => {
                addBtn.textContent = '+ В заказ';
                addBtn.style.backgroundColor = '';
            }, 1200);
        }
    });

    // ==========================================================================
    // SIDEBAR CATEGORY CLICK
    // ==========================================================================
    document.getElementById('sidebarCategoryList').addEventListener('click', e => {
        const item = e.target.closest('.sidebar-cat-item');
        if (!item) return;
        const cat = item.getAttribute('data-cat');
        catalogState.activeCategory = cat;
        catalogState.activeBrands.clear();
        catalogState.activeVolumes.clear();

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
    const cartItems = {}; // { sku_vol: { name, price, vol, qty } }
    const FREE_DELIVERY_THRESHOLD = 1500;

    function addToCart(sku, name, price, vol) {
        const key = `${sku}_${vol}`;
        if (cartItems[key]) {
            cartItems[key].qty += 1;
        } else {
            cartItems[key] = { sku, name, price, vol, qty: 1 };
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

        const keys = Object.keys(cartItems);
        if (keys.length === 0) {
            list.innerHTML = '<p class="empty-cart-msg">Корзина пуста. Добавьте продукцию из каталога.</p>';
            if (count) count.textContent = '0';
            if (totalEl) totalEl.textContent = '0 MDL';
            if (volEl) volEl.textContent = '0 л';
            if (delEl) delEl.textContent = `Осталось ${FREE_DELIVERY_THRESHOLD} MDL`;
            return;
        }

        let totalQty = 0, totalPrice = 0, totalVol = 0;
        list.innerHTML = keys.map(key => {
            const item = cartItems[key];
            totalQty   += item.qty;
            totalPrice += item.price * item.qty;
            totalVol   += item.vol * item.qty;
            const volLabel = item.vol >= 1 ? `${item.vol} л` : `${item.vol * 1000} мл`;
            return `
            <div class="cart-item-row" data-key="${key}">
                <div class="cart-item-info">
                    <div>
                        <h4>${item.name}</h4>
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
        if (delEl) delEl.textContent = remaining > 0
            ? `Осталось ${remaining.toLocaleString()} MDL`
            : '✅ Бесплатная доставка!';

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
                alert('✅ Заказ успешно принят! Менеджер свяжется с вами для подтверждения.');
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
            alert('✅ Заказ сохранён! Он будет обработан при следующем подключении к серверу.');
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
            alert('Введите корректный пароль (минимум 4 символа).');
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

        updateCategoryCounts(allProducts);
        renderSidebarFilters(allProducts);
        renderCatalog(allProducts);
    }

    init();

}); // end DOMContentLoaded
