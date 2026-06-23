/**
 * RADCOR - Frontend Application Logic (Version 7 — Fault-Tolerant B2B Catalog-First)
 */

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================================================
    // MOBILE NAVIGATION TOGGLE
    // ==========================================================================
    const navToggle = document.getElementById('navToggle');
    const mainNav = document.getElementById('mainNav');
    const navLinks = document.querySelectorAll('.nav-links a');

    if (navToggle && mainNav) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('open');
            mainNav.classList.toggle('open');
            document.body.style.overflow = mainNav.classList.contains('open') ? 'hidden' : '';
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('open');
                mainNav.classList.remove('open');
                document.body.style.overflow = '';
            });
        });
    }

    // ==========================================================================
    // PRODUCT CONFIGURATIONS (LITERS, BARRELS, PRICING)
    // ==========================================================================
    const productConfigs = {
        '151201': { canisterVol: 4, canisterPrice: 780, barrelVol: 205, barrelPrice: 28000, canisterName: 'Канистра 4л', barrelName: 'Бочка 205л', name: 'MOL Essence 5W-30' },
        '151205': { canisterVol: 4, canisterPrice: 640, barrelVol: 205, barrelPrice: 22000, canisterName: 'Канистра 4л', barrelName: 'Бочка 205л', name: 'MOL Dynamic Transit 10W-40' },
        '240502': { canisterVol: 5, canisterPrice: 220, barrelVol: 220, barrelPrice: 7500, canisterName: 'Канистра 5л', barrelName: 'Бочка 220л', name: 'Felix Carbox G12+' },
        '180701': { canisterVol: 4, canisterPrice: 420, barrelVol: 205, barrelPrice: 15000, canisterName: 'Канистра 4л', barrelName: 'Бочка 205л', name: 'Freshway G-11 10W-40' },
        '240901': { canisterVol: 1, canisterPrice: 95, barrelVol: 200, barrelPrice: 12000, canisterName: 'Флакон 1л', barrelName: 'Бочка 200л', name: 'Felix DOT-4' },
        '350102': { canisterVol: 0.4, canisterPrice: 65, barrelVol: 9.6, barrelPrice: 1200, canisterName: 'Спрей 0.4л', barrelName: 'Коробка 24 шт', name: 'Freshway WD-400' }
    };

    const categoryNames = {
        'all': 'Все секторы',
        'passenger': 'Легковой',
        'van': 'Фургон',
        'truck': 'Грузовой',
        'moto': 'Мотоцикл',
        'marine': 'Судовой',
        'agro': 'Аграрный',
        'electric': 'Электромобили',
        'axle': 'Ось / Привод',
        'transmission': 'Трансмиссия',
        'body': 'Кузов и освещение',
        'recent': 'Последние',
        'saved': 'Сохраненные',
        'vin': 'VIN-номер',
        'engine': 'Код двигателя',
        'ktype': 'Код K-type'
    };

    // ==========================================================================
    // DUAL-STAGE SIDEBAR + TABS CATALOGUE FILTERING & SEARCH
    // ==========================================================================
    const catalogSearch = document.getElementById('catalogSearch');
    const tabFilters = document.querySelectorAll('.tab-filter-btn');
    const sidebarItems = document.querySelectorAll('.sidebar-menu .menu-item');
    const productCards = document.querySelectorAll('.product-card');

    let activeCategory = 'all'; // from sidebar (e.g., passenger, van, truck)
    let activeBrandTab = 'all'; // from upper tabs (all, MOL, other)
    let activeBrand = null;     // selected brand manufacturer (e.g. Renault)
    let searchQuery = '';

    function applyFilters() {
        productCards.forEach(card => {
            const cardBrand = card.getAttribute('data-brand') || '';
            const cardSectors = card.getAttribute('data-sector') || '';
            const cardOems = card.getAttribute('data-oem') || '';
            const cardSku = card.getAttribute('data-sku') || '';

            const h3El = card.querySelector('h3');
            const cardTitle = h3El ? h3El.textContent.toLowerCase() : '';

            const descEl = card.querySelector('.product-desc');
            const cardDesc = descEl ? descEl.textContent.toLowerCase() : '';

            const specsEl = card.querySelector('.product-specs');
            const cardSpecs = specsEl ? specsEl.textContent.toLowerCase() : '';

            // 1. Sidebar Category/Sector Match
            let matchesCategory = false;
            if (activeCategory === 'all') {
                matchesCategory = true;
            } else if (activeCategory === 'vin' || activeCategory === 'engine' || activeCategory === 'ktype') {
                matchesCategory = true;
            } else {
                const sectorsList = cardSectors.split(' ');
                matchesCategory = sectorsList.includes(activeCategory);
            }

            // 2. Brand Card Selection Match
            let matchesBrandCard = true;
            if (activeBrand) {
                const oemsList = cardOems.toLowerCase().split(' ');
                matchesBrandCard = oemsList.includes(activeBrand.toLowerCase());
            }

            // 3. Upper Brand Tab Match
            let matchesBrandTab = false;
            if (activeBrandTab === 'all') {
                matchesBrandTab = true;
            } else if (activeBrandTab === 'MOL') {
                matchesBrandTab = (cardBrand === 'MOL');
            } else if (activeBrandTab === 'other') {
                matchesBrandTab = (cardBrand !== 'MOL');
            }

            // 4. Search Query Text Match
            const textToSearch = `${cardTitle} ${cardDesc} ${cardSpecs} ${cardSku}`.toLowerCase();
            const matchesSearch = textToSearch.includes(searchQuery.toLowerCase());

            // Final check
            if (matchesCategory && matchesBrandCard && matchesBrandTab && matchesSearch) {
                card.style.display = 'flex';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 50);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(15px)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 200);
            }
        });
    }

    // Sidebar Category clicks
    sidebarItems.forEach(item => {
        item.addEventListener('click', () => {
            sidebarItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            const sector = item.getAttribute('data-sector');
            activeCategory = sector;
            activeBrand = null; // reset selected brand manufacturer

            // Update search placeholder based on sector
            if (catalogSearch) {
                if (sector === 'vin') {
                    catalogSearch.placeholder = 'Введите 17-значный VIN-код автомобиля...';
                    catalogSearch.value = '';
                    searchQuery = '';
                    catalogSearch.focus();
                } else if (sector === 'engine') {
                    catalogSearch.placeholder = 'Введите буквенный или цифровой код двигателя...';
                    catalogSearch.value = '';
                    searchQuery = '';
                    catalogSearch.focus();
                } else if (sector === 'ktype') {
                    catalogSearch.placeholder = 'Введите код K-type базы автозапчастей...';
                    catalogSearch.value = '';
                    searchQuery = '';
                    catalogSearch.focus();
                } else {
                    catalogSearch.placeholder = 'Укажите производителя, серию, вязкость, допуск или артикул...';
                }
            }

            const labelText = (categoryNames[sector] || sector).toUpperCase();

            // Set layout state based on sector
            const brandGrid = document.getElementById('brandSelectionGrid');
            const catalogGrid = document.getElementById('catalogGrid');
            const backBtn = document.getElementById('backToBrandsBtn');
            const vinPanel = document.getElementById('vinDecoderPanel');

            if (sector === 'vin') {
                if (brandGrid) brandGrid.style.display = 'none';
                if (catalogGrid) catalogGrid.style.display = 'none';
                if (backBtn) backBtn.style.display = 'none';
                if (vinPanel) vinPanel.style.display = 'block';
                updateBreadcrumbs('VIN-НОМЕР > ОЖИДАНИЕ ВВОДА');
            } else if (sector === 'engine' || sector === 'ktype') {
                if (brandGrid) brandGrid.style.display = 'none';
                if (catalogGrid) catalogGrid.style.display = 'none';
                if (backBtn) backBtn.style.display = 'none';
                if (vinPanel) vinPanel.style.display = 'none';
                updateBreadcrumbs(`${labelText} > РАСШИФРОВКА`);
            } else if (sector === 'all' || sector === 'recent' || sector === 'saved') {
                if (brandGrid) brandGrid.style.display = 'none';
                if (catalogGrid) catalogGrid.style.display = 'grid';
                if (backBtn) backBtn.style.display = 'none';
                if (vinPanel) vinPanel.style.display = 'none';
                updateBreadcrumbs(`${labelText} > ВЫБЕРИТЕ ПРОДУКТ:`);
                applyFilters();
            } else {
                // Vehicle category -> Show Brand Grid first
                if (brandGrid) brandGrid.style.display = 'grid';
                if (catalogGrid) catalogGrid.style.display = 'none';
                if (backBtn) backBtn.style.display = 'none';
                if (vinPanel) vinPanel.style.display = 'none';
                updateBreadcrumbs(`${labelText} > ВЫБЕРИТЕ ПРОИЗВОДИТЕЛЯ:`);
            }
        });
    });

    function updateBreadcrumbs(text) {
        const breadcrumbs = document.getElementById('catalogBreadcrumbs');
        if (breadcrumbs) {
            breadcrumbs.textContent = text;
        }
    }

    // Brand Selection Cards Click
    const brandCards = document.querySelectorAll('.brand-select-card');
    brandCards.forEach(card => {
        card.addEventListener('click', () => {
            const brandName = card.getAttribute('data-brand-name');
            activeBrand = brandName;

            const brandGrid = document.getElementById('brandSelectionGrid');
            const catalogGrid = document.getElementById('catalogGrid');
            const backBtn = document.getElementById('backToBrandsBtn');

            if (brandGrid) brandGrid.style.display = 'none';
            if (catalogGrid) catalogGrid.style.display = 'grid';
            if (backBtn) backBtn.style.display = 'inline-flex';

            const catLabel = (categoryNames[activeCategory] || activeCategory).toUpperCase();
            updateBreadcrumbs(`${catLabel} > ${brandName.toUpperCase()}`);

            applyFilters();
        });
    });

    // Back to Brands Button Click
    const backToBrandsBtn = document.getElementById('backToBrandsBtn');
    if (backToBrandsBtn) {
        backToBrandsBtn.addEventListener('click', () => {
            activeBrand = null;

            const brandGrid = document.getElementById('brandSelectionGrid');
            const catalogGrid = document.getElementById('catalogGrid');
            if (brandGrid) brandGrid.style.display = 'grid';
            if (catalogGrid) catalogGrid.style.display = 'none';
            backToBrandsBtn.style.display = 'none';

            const catLabel = (categoryNames[activeCategory] || activeCategory).toUpperCase();
            updateBreadcrumbs(`${catLabel} > ВЫБЕРИТЕ ПРОИЗВОДИТЕЛЯ:`);
        });
    }

    // Upper Brand Tab clicks
    tabFilters.forEach(tab => {
        tab.addEventListener('click', () => {
            tabFilters.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeBrandTab = tab.getAttribute('data-brand');
            applyFilters();
        });
    });

    // ==========================================================================
    // INTERACTIVE B2B CART DRAWER LOGIC
    // ==========================================================================
    const cartBtn = document.getElementById('cartBtn');
    const cartDrawer = document.getElementById('cartDrawer');
    const cartClose = document.getElementById('cartClose');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartItemsList = document.getElementById('cartItemsList');
    const checkoutBtn = document.getElementById('checkoutBtn');

    function getCart() {
        try {
            const cart = JSON.parse(localStorage.getItem('b2b_wholesale_cart'));
            return Array.isArray(cart) ? cart : [];
        } catch (e) {
            return [];
        }
    }

    function saveCart(cart) {
        try {
            localStorage.setItem('b2b_wholesale_cart', JSON.stringify(cart));
        } catch (e) {
            console.error('Failed to save cart to localStorage', e);
        }
    }

    function openCartDrawer() {
        if (cartDrawer && cartOverlay) {
            cartDrawer.classList.add('open');
            cartOverlay.classList.add('open');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeCartDrawer() {
        if (cartDrawer && cartOverlay) {
            cartDrawer.classList.remove('open');
            cartOverlay.classList.remove('open');
            document.body.style.overflow = '';
        }
    }

    if (cartBtn) cartBtn.addEventListener('click', openCartDrawer);
    if (cartClose) cartClose.addEventListener('click', closeCartDrawer);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCartDrawer);

    function addItemToCart(sku, name, price, qty = 1, packType = 'canister') {
        let cart = getCart();
        let item = cart.find(i => i.sku === sku && i.packType === packType);
        if (item) {
            item.qty += qty;
        } else {
            cart.push({ sku, name, price, qty, packType });
        }
        saveCart(cart);
        updateCartUI();
        openCartDrawer();
    }

    function updateCartUI() {
        const cart = getCart();
        const countBadge = document.getElementById('cartCount');
        const totalVolumeSpan = document.getElementById('totalVolume');
        const deliveryProgressSpan = document.getElementById('deliveryProgress');
        const totalSumSpan = document.getElementById('cartTotalSum');

        // Update count badge
        const totalQty = cart.reduce((sum, item) => sum + (parseInt(item.qty) || 0), 0);
        if (countBadge) countBadge.textContent = totalQty;

        if (!cartItemsList) return; // not on catalog page

        // Clear list
        cartItemsList.innerHTML = '';

        if (cart.length === 0) {
            cartItemsList.innerHTML = '<p class="empty-cart-msg">Корзина пуста. Добавьте масла или технические жидкости из каталога.</p>';
            if (totalVolumeSpan) totalVolumeSpan.textContent = '0 л';
            if (deliveryProgressSpan) {
                deliveryProgressSpan.textContent = 'Осталось 5,000 MDL';
                deliveryProgressSpan.className = 'code-font text-amber';
            }
            if (totalSumSpan) totalSumSpan.textContent = '0 MDL';
            return;
        }

        let totalSum = 0;
        let totalVolume = 0;

        cart.forEach((item, index) => {
            const config = productConfigs[item.sku] || {
                canisterVol: 4, canisterPrice: item.price,
                barrelVol: 205, barrelPrice: item.price * 35,
                canisterName: 'Канистра 4л', barrelName: 'Бочка 205л',
                name: item.name
            };

            const itemPrice = (item.packType === 'canister' ? config.canisterPrice : config.barrelPrice) || 0;
            const itemVol = (item.packType === 'canister' ? config.canisterVol : config.barrelVol) || 0;
            const itemQty = parseInt(item.qty) || 1;
            const itemTotal = itemPrice * itemQty;
            
            totalSum += itemTotal;
            totalVolume += itemVol * itemQty;

            const row = document.createElement('div');
            row.className = 'cart-item-row';
            row.innerHTML = `
                <div class="cart-item-info">
                    <div>
                        <h4>${config.name}</h4>
                        <span class="cart-item-sku">Арт: ${item.sku} | ${item.packType === 'canister' ? config.canisterName : config.barrelName}</span>
                    </div>
                    <span class="cart-item-price">${itemTotal.toLocaleString()} MDL</span>
                </div>
                <div class="cart-item-controls">
                    <div class="pack-type-selector">
                        <button class="pack-btn ${item.packType === 'canister' ? 'active' : ''}" data-index="${index}" data-pack="canister">Канистра</button>
                        <button class="pack-btn ${item.packType === 'barrel' ? 'active' : ''}" data-index="${index}" data-pack="barrel">Бочка</button>
                    </div>
                    <div class="qty-selector">
                        <button class="qty-btn qty-minus" data-index="${index}">-</button>
                        <input type="number" class="qty-input" value="${itemQty}" data-index="${index}">
                        <button class="qty-btn qty-plus" data-index="${index}">+</button>
                    </div>
                    <button class="item-remove-btn" data-index="${index}">&times;</button>
                </div>
            `;
            cartItemsList.appendChild(row);
        });

        if (totalVolumeSpan) totalVolumeSpan.textContent = `${totalVolume.toFixed(1)} л`;
        if (totalSumSpan) totalSumSpan.textContent = `${totalSum.toLocaleString()} MDL`;

        if (deliveryProgressSpan) {
            const threshold = 5000;
            if (totalSum >= threshold) {
                deliveryProgressSpan.textContent = 'Бесплатная доставка!';
                deliveryProgressSpan.className = 'code-font text-green';
            } else {
                const diff = threshold - totalSum;
                deliveryProgressSpan.textContent = `Осталось ${diff.toLocaleString()} MDL`;
                deliveryProgressSpan.className = 'code-font text-amber';
            }
        }
    }

    if (cartItemsList) {
        cartItemsList.addEventListener('click', (e) => {
            const cart = getCart();
            const index = parseInt(e.target.getAttribute('data-index'));

            if (isNaN(index)) return;

            if (e.target.classList.contains('qty-minus')) {
                if (cart[index] && cart[index].qty > 1) {
                    cart[index].qty--;
                    saveCart(cart);
                    updateCartUI();
                }
            } else if (e.target.classList.contains('qty-plus')) {
                if (cart[index]) {
                    cart[index].qty++;
                    saveCart(cart);
                    updateCartUI();
                }
            } else if (e.target.classList.contains('item-remove-btn')) {
                cart.splice(index, 1);
                saveCart(cart);
                updateCartUI();
            } else if (e.target.classList.contains('pack-btn')) {
                const pack = e.target.getAttribute('data-pack');
                if (cart[index]) {
                    cart[index].packType = pack;
                    saveCart(cart);
                    updateCartUI();
                }
            }
        });

        cartItemsList.addEventListener('change', (e) => {
            if (e.target.classList.contains('qty-input')) {
                const cart = getCart();
                const index = parseInt(e.target.getAttribute('data-index'));
                let val = parseInt(e.target.value);
                if (isNaN(val) || val < 1) val = 1;
                if (cart[index]) {
                    cart[index].qty = val;
                    saveCart(cart);
                    updateCartUI();
                }
            }
        });
    }

    // Add buttons on product cards
    document.querySelectorAll('.btn-add-cart').forEach(btn => {
        btn.addEventListener('click', () => {
            const sku = btn.getAttribute('data-sku');
            const price = parseFloat(btn.getAttribute('data-price'));
            const name = btn.getAttribute('data-name');
            addItemToCart(sku, name, price, 1, 'canister');
        });
    });

    // Checkout Order Button
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            const cart = getCart();
            if (cart.length === 0) {
                alert('Ваша корзина пуста.');
                return;
            }

            // Calculate total sum
            let totalSum = 0;
            cart.forEach(item => {
                const config = productConfigs[item.sku] || {
                    canisterPrice: item.price, barrelPrice: item.price * 35
                };
                const itemPrice = (item.packType === 'canister' ? config.canisterPrice : config.barrelPrice) || 0;
                totalSum += itemPrice * (parseInt(item.qty) || 1);
            });

            // Create new order
            let orders = [];
            try {
                const parsed = JSON.parse(localStorage.getItem('b2b_wholesale_orders'));
                orders = Array.isArray(parsed) ? parsed : [];
            } catch (e) {
                orders = [];
            }

            const orderNo = `№${Math.floor(Math.random() * 900) + 85000}`;
            const date = new Date().toLocaleDateString('ru-RU');
            
            const newOrder = {
                orderNo: orderNo,
                date: date,
                sum: totalSum,
                status: 'Счет выставлен',
                delivery: 'Сборка заказа'
            };

            orders.push(newOrder);
            try {
                localStorage.setItem('b2b_wholesale_orders', JSON.stringify(orders));
            } catch (e) {
                console.error(e);
            }

            // Clear cart
            try {
                localStorage.removeItem('b2b_wholesale_cart');
            } catch (e) {
                console.error(e);
            }
            
            updateCartUI();
            closeCartDrawer();

            alert(`Заказ ${orderNo} успешно сформирован! Перенаправление в B2B кабинет.`);
            window.location.href = 'b2b-dashboard.html';
        });
    }

    // ==========================================================================
    // INTERACTIVE VIN DECODER
    // ==========================================================================
    let vinScanning = false;

    if (catalogSearch) {
        catalogSearch.addEventListener('input', (e) => {
            searchQuery = e.target.value;

            // Trigger scan when entering 17-char VIN in VIN mode
            if (activeCategory === 'vin' && searchQuery.trim().length === 17 && !vinScanning) {
                triggerVinSimulation(searchQuery.trim());
            } else if (activeCategory !== 'vin') {
                applyFilters();
            }
        });
    }

    function triggerVinSimulation(vinCode) {
        const vinPanel = document.getElementById('vinDecoderPanel');
        if (!vinPanel) return;

        vinScanning = true;
        
        const scanHeader = vinPanel.querySelector('.scanner-header');
        const scanStatus = vinPanel.querySelector('.scan-status');
        const fillBar = vinPanel.querySelector('.fill-bar-scan');
        const resultsBox = document.getElementById('scannerResults');

        if (!scanHeader || !scanStatus || !fillBar || !resultsBox) return;

        // Reset display state
        vinPanel.style.display = 'block';
        scanHeader.style.display = 'flex';
        scanStatus.textContent = '⚡ Анализ данных VIN...';
        resultsBox.classList.remove('show');
        resultsBox.style.display = 'none';

        // Animate fill bar
        fillBar.style.width = '0%';
        
        let width = 0;
        const intervalTime = 12; // 12ms * 100 steps = 1.2 seconds total scan
        const interval = setInterval(() => {
            width += 1;
            fillBar.style.width = `${width}%`;
            if (width >= 100) {
                clearInterval(interval);
                
                // Scan completed
                scanStatus.textContent = '✔ VIN-код успешно расшифрован';
                
                setTimeout(() => {
                    scanHeader.style.display = 'none';
                    resultsBox.style.display = 'block';
                    setTimeout(() => {
                        resultsBox.classList.add('show');
                    }, 50);
                    updateBreadcrumbs(`VIN-НОМЕР > MERCEDES-BENZ SPRINTER`);
                    vinScanning = false;
                }, 400);
            }
        }, intervalTime);
    }

    const addAllVinFluidsBtn = document.getElementById('addAllVinFluidsBtn');
    if (addAllVinFluidsBtn) {
        addAllVinFluidsBtn.addEventListener('click', () => {
            addItemToCart('151201', 'MOL Essence 5W-30', 780, 1, 'canister');
            setTimeout(() => {
                addItemToCart('240502', 'Felix Carbox G12+', 220, 1, 'canister');
            }, 250);
        });
    }

    // ==========================================================================
    // STEP-BY-STEP MOL LUBE FINDER WIZARD
    // ==========================================================================
    const wizardNextButtons = document.querySelectorAll('.wizard-next-btn');
    const wizardRestartBtn = document.getElementById('wizardRestartBtn');
    const wizardAddCartBtn = document.getElementById('wizardAddCartBtn');
    const wizardSteps = document.querySelectorAll('.wizard-step');

    let wizardSelections = {
        vehicleType: '',
        viscosity: ''
    };

    wizardNextButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const currentStep = btn.closest('.wizard-step');
            if (!currentStep) return;
            const stepNum = parseInt(currentStep.getAttribute('data-step'));
            const selectionVal = btn.getAttribute('data-val');

            if (stepNum === 1) {
                wizardSelections.vehicleType = selectionVal;
                currentStep.classList.remove('active');
                const nextStep = document.querySelector('.wizard-step[data-step="2"]');
                if (nextStep) nextStep.classList.add('active');
            } else if (stepNum === 2) {
                wizardSelections.viscosity = selectionVal;
                showWizardResult();
                currentStep.classList.remove('active');
                const nextStep = document.querySelector('.wizard-step[data-step="3"]');
                if (nextStep) nextStep.classList.add('active');
            }
        });
    });

    if (wizardRestartBtn) {
        wizardRestartBtn.addEventListener('click', () => {
            wizardSelections.vehicleType = '';
            wizardSelections.viscosity = '';
            
            wizardSteps.forEach(step => step.classList.remove('active'));
            const firstStep = document.querySelector('.wizard-step[data-step="1"]');
            if (firstStep) firstStep.classList.add('active');
        });
    }

    function showWizardResult() {
        const titleEl = document.getElementById('wizardResultTitle');
        const descEl = document.getElementById('wizardResultDesc');

        let recName = 'MOL Essence 5W-30';
        let recDesc = 'Специально рекомендовано для бензиновых и дизельных двигателей легковых машин с высокими требованиями экономии топлива.';
        let recSku = '151201';
        let recPrice = 780;

        const vt = wizardSelections.vehicleType;
        const visc = wizardSelections.viscosity;

        if (vt === 'passenger') {
            if (visc === '5w-30') {
                recName = 'MOL Essence 5W-30';
                recDesc = 'Высокотехнологичное синтетическое масло для современных легковых автомобилей, снижающее износ и трение двигателя.';
                recSku = '151201';
                recPrice = 780;
            } else {
                recName = 'Freshway G-11 10W-40';
                recDesc = 'Полусинтетическое моторное масло, отлично защищающее детали двигателя от износа при различных режимах эксплуатации.';
                recSku = '180701';
                recPrice = 420;
            }
        } else if (vt === 'commercial') {
            if (visc === '5w-30') {
                recName = 'MOL Essence 5W-30';
                recDesc = 'Энергосберегающее моторное масло, подходящее для малотоннажных фургонов с современными экологическими системами.';
                recSku = '151201';
                recPrice = 780;
            } else {
                recName = 'MOL Dynamic Transit 10W-40';
                recDesc = 'Специализированное полусинтетическое масло для высоконагруженных дизельных двигателей коммерческого транспорта.';
                recSku = '151205';
                recPrice = 640;
            }
        } else { // agro
            recName = 'MOL Dynamic Transit 10W-40';
            recDesc = 'Универсальное масло, отлично подходящее для дизельных двигателей сельскохозяйственной и строительной техники.';
            recSku = '151205';
            recPrice = 640;
        }

        if (titleEl) titleEl.textContent = recName;
        if (descEl) descEl.textContent = recDesc;

        if (wizardAddCartBtn) {
            wizardAddCartBtn.setAttribute('data-sku', recSku);
            wizardAddCartBtn.setAttribute('data-name', recName);
            wizardAddCartBtn.setAttribute('data-price', recPrice);
        }
    }

    if (wizardAddCartBtn) {
        wizardAddCartBtn.addEventListener('click', () => {
            const sku = wizardAddCartBtn.getAttribute('data-sku');
            const name = wizardAddCartBtn.getAttribute('data-name');
            const price = parseFloat(wizardAddCartBtn.getAttribute('data-price'));
            if (sku && name && !isNaN(price)) {
                addItemToCart(sku, name, price, 1, 'canister');
            }
        });
    }

    // ==========================================================================
    // CENTRAL ANIMATION LOOP MANAGER (High-Performance requestAnimationFrame)
    // ==========================================================================
    const activeLoops = [];
    function registerLoop(tickFn) {
        activeLoops.push(tickFn);
    }

    let lastTime = performance.now();
    function mainLoop(now) {
        const deltaTime = Math.min((now - lastTime) / 1000, 0.1); // cap deltaTime
        lastTime = now;

        for (let i = 0; i < activeLoops.length; i++) {
            activeLoops[i](deltaTime);
        }

        requestAnimationFrame(mainLoop);
    }
    requestAnimationFrame(mainLoop);

    // ==========================================================================
    // INTERACTIVE BACKGROUND PARTICLES (Constellation System)
    // ==========================================================================
    const bgCanvas = document.getElementById('bgCanvas');
    if (bgCanvas) {
        const ctx = bgCanvas.getContext('2d');
        let width = bgCanvas.width = window.innerWidth;
        let height = bgCanvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            width = bgCanvas.width = window.innerWidth;
            height = bgCanvas.height = window.innerHeight;
        });

        let mouse = { x: null, y: null };
        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });
        window.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });

        const particles = [];
        const maxParticles = 60;
        for (let i = 0; i < maxParticles; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 12,
                vy: (Math.random() - 0.5) * 12,
                size: Math.random() * 2 + 1,
                alpha: Math.random() * 0.45 + 0.15
            });
        }

        registerLoop((dt) => {
            ctx.clearRect(0, 0, width, height);

            // Draw connections
            ctx.strokeStyle = 'rgba(59, 130, 246, 0.04)';
            ctx.lineWidth = 1;
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            // Draw particles
            particles.forEach(p => {
                p.x += p.vx * dt;
                p.y += p.vy * dt;

                // Screen boundaries wrapping
                if (p.x < -10) p.x = width + 10;
                if (p.x > width + 10) p.x = -10;
                if (p.y < -10) p.y = height + 10;
                if (p.y > height + 10) p.y = -10;

                // Mouse interaction (gentle repulsion)
                if (mouse.x !== null && mouse.y !== null) {
                    const dx = p.x - mouse.x;
                    const dy = p.y - mouse.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 150) {
                        const force = (150 - dist) / 150 * 15;
                        p.x += (dx / dist) * force * dt * 20;
                        p.y += (dy / dist) * force * dt * 20;
                    }
                }

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(96, 165, 250, ${p.alpha})`;
                ctx.fill();
            });
        });
    }

    // ==========================================================================
    // LIQUID VIAL GLASS CANISTER PHYSICS SIMULATOR (2D Canvas Wave Engine)
    // ==========================================================================
    const canisterElements = document.querySelectorAll('.liquid-gauge.glass-canister');
    canisterElements.forEach(container => {
        const canvas = container.querySelector('.canister-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const targetPercent = parseFloat(container.getAttribute('data-fill-height')) || 50;
        const fillColor = container.getAttribute('data-fill-color') || 'amber';
        const card = container.closest('.product-card');

        let width = canvas.width = canvas.clientWidth || 66;
        let height = canvas.height = canvas.clientHeight || 380;

        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                width = canvas.width = entry.contentRect.width || canvas.clientWidth || 66;
                height = canvas.height = entry.contentRect.height || canvas.clientHeight || 380;
            }
        });
        resizeObserver.observe(canvas);

        let currentPercent = targetPercent;
        let animatedPercent = targetPercent;
        let wavePhase = Math.random() * 100;
        let waveAmplitude = 1.5;
        let targetAmplitude = 1.5;
        let isHovered = false;

        const bubbles = [];
        const spawnInterval = 0.25;
        let spawnTimer = 0;

        if (card) {
            card.addEventListener('mouseenter', () => {
                isHovered = true;
                animatedPercent = Math.min(targetPercent + 8, 98);
                targetAmplitude = 4.5;
            });

            card.addEventListener('mouseleave', () => {
                isHovered = false;
                animatedPercent = targetPercent;
                targetAmplitude = 1.5;
            });
        }

        registerLoop((dt) => {
            currentPercent += (animatedPercent - currentPercent) * dt * 4;
            waveAmplitude += (targetAmplitude - waveAmplitude) * dt * 2.5;
            wavePhase += dt * (isHovered ? 7.5 : 3.5);

            const fillY = (currentPercent / 100) * height;

            spawnTimer += dt;
            const currentInterval = isHovered ? spawnInterval * 0.45 : spawnInterval * 2.0;
            if (spawnTimer >= currentInterval) {
                spawnTimer = 0;
                if (isHovered || bubbles.length < 5) {
                    bubbles.push({
                        x: Math.random() * width,
                        y: height + 10,
                        vy: Math.random() * (isHovered ? 45 : 20) + (isHovered ? 35 : 15),
                        size: Math.random() * (isHovered ? 2.2 : 1.2) + 0.8,
                        alpha: Math.random() * (isHovered ? 0.45 : 0.2) + 0.15
                    });
                }
            }

            for (let i = bubbles.length - 1; i >= 0; i--) {
                const b = bubbles[i];
                b.y -= b.vy * dt;

                const waveY = Math.sin(b.x * 0.08 + wavePhase) * waveAmplitude;
                const surfaceY = height - fillY + waveY;

                if (b.y < surfaceY) {
                    b.alpha -= dt * 4;
                    if (b.alpha <= 0) {
                        bubbles.splice(i, 1);
                        continue;
                    }
                }
            }

            ctx.clearRect(0, 0, width, height);

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(0, height);
            ctx.lineTo(0, height - fillY);

            for (let x = 0; x <= width; x++) {
                const waveY = Math.sin(x * 0.08 + wavePhase) * waveAmplitude;
                ctx.lineTo(x, height - fillY + waveY);
            }
            ctx.lineTo(width, height);
            ctx.closePath();

            const gradient = ctx.createLinearGradient(0, height - fillY, 0, height);
            if (fillColor === 'amber') {
                gradient.addColorStop(0, '#f59e0b');
                gradient.addColorStop(1, '#451a03');
            } else if (fillColor === 'violet') {
                gradient.addColorStop(0, '#8b5cf6');
                gradient.addColorStop(1, '#2e1065');
            } else {
                gradient.addColorStop(0, '#3b82f6');
                gradient.addColorStop(1, '#172554');
            }

            ctx.fillStyle = gradient;
            ctx.globalAlpha = 0.72;
            ctx.fill();

            ctx.clip();
            ctx.globalAlpha = 1.0;
            for (let i = 0; i < bubbles.length; i++) {
                const b = bubbles[i];
                ctx.beginPath();
                ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${b.alpha})`;
                ctx.fill();
            }
            ctx.restore();

            ctx.beginPath();
            ctx.moveTo(0, height - fillY + Math.sin(0 + wavePhase) * waveAmplitude);
            for (let x = 1; x <= width; x++) {
                const waveY = Math.sin(x * 0.08 + wavePhase) * waveAmplitude;
                ctx.lineTo(x, height - fillY + waveY);
            }
            ctx.strokeStyle = fillColor === 'amber' ? '#f59e0b' : (fillColor === 'violet' ? '#8b5cf6' : '#60a5fa');
            ctx.lineWidth = 2.0;
            ctx.shadowColor = ctx.strokeStyle;
            ctx.shadowBlur = 6;
            ctx.stroke();
            ctx.shadowBlur = 0;
        });
    });

    // ==========================================================================
    // FAQ ACCORDIONS TOGGLE
    // ==========================================================================
    const faqAccordions = document.querySelectorAll('.faq-accordion');
    faqAccordions.forEach(accordion => {
        accordion.addEventListener('click', () => {
            faqAccordions.forEach(other => {
                if (other !== accordion) {
                    other.classList.remove('open');
                }
            });
            accordion.classList.toggle('open');
        });
    });

    // ==========================================================================
    // FORMS SUBMISSION MOCKS (B2B & CONTACTS)
    // ==========================================================================
    const b2bForm = document.getElementById('b2bForm');
    const formSuccess = document.getElementById('formSuccess');
    if (b2bForm && formSuccess) {
        b2bForm.addEventListener('submit', (e) => {
            e.preventDefault();
            b2bForm.style.opacity = '0.3';
            b2bForm.style.pointerEvents = 'none';

            setTimeout(() => {
                b2bForm.style.display = 'none';
                formSuccess.style.display = 'block';
                formSuccess.style.opacity = '1';
            }, 600);
        });
    }

    const contactForm = document.getElementById('contactForm');
    const contactSuccess = document.getElementById('contactSuccess');
    if (contactForm && contactSuccess) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            contactForm.style.opacity = '0.3';
            contactForm.style.pointerEvents = 'none';

            setTimeout(() => {
                contactForm.style.display = 'none';
                contactSuccess.style.display = 'block';
                contactSuccess.style.opacity = '1';
            }, 600);
        });
    }

    // ==========================================================================
    // B2B DASHBOARD LOGIC (b2b-dashboard.html)
    // ==========================================================================
    const payInvoiceBtn = document.getElementById('payInvoiceBtn');
    if (payInvoiceBtn) {
        payInvoiceBtn.addEventListener('click', () => {
            alert('Счет-фактура отправлена в ваш онлайн-банк. Пожалуйста, подтвердите платеж в мобильном приложении.');
        });
    }

    const downloadExcelBtn = document.getElementById('downloadExcelBtn');
    if (downloadExcelBtn) {
        downloadExcelBtn.addEventListener('click', () => {
            downloadExcelBtn.innerHTML = '⚡ Формирование прайса...';
            downloadExcelBtn.style.pointerEvents = 'none';
            
            setTimeout(() => {
                const link = document.createElement('a');
                link.href = 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,';
                link.download = 'radcor_pricelist_dealer_2026.xlsx';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                downloadExcelBtn.innerHTML = '✔ Прайс скачан (.xlsx)';
                downloadExcelBtn.style.backgroundColor = 'var(--colour-mol-green)';
                downloadExcelBtn.style.borderColor = 'var(--colour-mol-green)';
                downloadExcelBtn.style.color = '#fff';
                
                setTimeout(() => {
                    downloadExcelBtn.innerHTML = '📊 Скачать прайс (Excel .xlsx)';
                    downloadExcelBtn.style.backgroundColor = '';
                    downloadExcelBtn.style.borderColor = '';
                    downloadExcelBtn.style.color = '';
                    downloadExcelBtn.style.pointerEvents = '';
                }, 3000);
            }, 1200);
        });
    }

    const quickOrderForm = document.getElementById('quickOrderForm');
    const quickOrderMsg = document.getElementById('quickOrderMsg');
    const ordersTableBody = document.querySelector('.orders-table tbody');

    // Load orders on dashboard page load
    if (ordersTableBody) {
        let savedOrders = [];
        try {
            const parsed = JSON.parse(localStorage.getItem('b2b_wholesale_orders'));
            savedOrders = Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            savedOrders = [];
        }

        savedOrders.forEach(order => {
            if (!order) return;
            const row = document.createElement('tr');
            const orderNo = order.orderNo || '№00000';
            const date = order.date || '';
            const sumVal = typeof order.sum === 'number' ? order.sum.toLocaleString() : (order.sum || '0');
            const status = order.status || 'Счет выставлен';
            const delivery = order.delivery || 'Сборка заказа';

            row.innerHTML = `
                <td class="code-font text-amber">${orderNo}</td>
                <td>${date}</td>
                <td>${sumVal} MDL</td>
                <td><span class="status-badge status-unpaid">${status}</span></td>
                <td><span class="status-badge status-shipping">${delivery}</span></td>
            `;
            ordersTableBody.insertBefore(row, ordersTableBody.firstChild);
        });
    }

    if (quickOrderForm && ordersTableBody) {
        quickOrderForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const skuInput = document.getElementById('skuCode');
            const qtyInput = document.getElementById('skuQty');

            if (!skuInput || !qtyInput) return;

            const sku = skuInput.value;
            const qty = parseInt(qtyInput.value);

            const config = productConfigs[sku] || { canisterPrice: 500, name: `Товар SKU ${sku}` };
            const itemPrice = config.canisterPrice || 500;
            const totalSum = itemPrice * qty;

            const orderNo = `№${Math.floor(Math.random() * 900) + 85000}`;
            const date = new Date().toLocaleDateString('ru-RU');

            const newOrder = {
                orderNo: orderNo,
                date: date,
                sum: totalSum,
                status: 'Счет выставлен',
                delivery: 'Сборка заказа'
            };

            // Save to localStorage
            let orders = [];
            try {
                const parsed = JSON.parse(localStorage.getItem('b2b_wholesale_orders'));
                orders = Array.isArray(parsed) ? parsed : [];
            } catch (e) {
                orders = [];
            }
            orders.push(newOrder);
            try {
                localStorage.setItem('b2b_wholesale_orders', JSON.stringify(orders));
            } catch (e) {
                console.error(e);
            }

            // Render row in table
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td class="code-font text-amber">${orderNo}</td>
                <td>${date}</td>
                <td>${totalSum.toLocaleString()} MDL</td>
                <td><span class="status-badge status-unpaid">Счет выставлен</span></td>
                <td><span class="status-badge status-shipping">Сборка заказа</span></td>
            `;
            ordersTableBody.insertBefore(newRow, ordersTableBody.firstChild);

            quickOrderMsg.textContent = `Артикул ${sku} (${qty} шт.) добавлен в черновик заказа!`;
            quickOrderMsg.style.display = 'block';
            quickOrderMsg.style.opacity = '1';

            skuInput.value = '';
            qtyInput.value = '1';

            setTimeout(() => {
                quickOrderMsg.style.opacity = '0';
                quickOrderMsg.style.transition = 'opacity 0.4s ease';
                setTimeout(() => {
                    quickOrderMsg.style.display = 'none';
                }, 450);
            }, 4000);
        });
    }

    // Initialize Cart UI on load
    updateCartUI();
});
