/**
 * Radcor-Prim — B2B Dashboard Logic
 * Version: 45.0
 */

(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        // 1. Проверка сессии. Если не авторизован - перенаправляем в каталог
        const session = window.B2BAuth ? window.B2BAuth.getSession() : null;
        if (!session) {
            window.location.href = 'catalog.html';
            return;
        }

        // 2. Отображение профиля компании
        const companyEl = document.getElementById('b2bCompanyName') || document.querySelector('.company-name');
        if (companyEl) {
            companyEl.textContent = session.company_name || 'B2B Партнер';
        }

        const roleEl = document.getElementById('b2bUserRole') || document.querySelector('.user-role');
        if (roleEl) {
            const discount = session.discount_pct ? ` • Скидка ${session.discount_pct}%` : '';
            roleEl.textContent = `IDNO: ${session.idno || '—'}${discount}`;
        }

        // 3. Отображение финансовых показателей
        const balEl = document.getElementById('b2bBalanceValue') || document.querySelector('.bal-value.text-green');
        if (balEl) {
            const bal = Number(session.balance || 0);
            balEl.textContent = `${bal >= 0 ? '+' : ''}${bal.toLocaleString('ru-RU')} MDL`;
        }

        const limit = Number(session.credit_limit || 0);
        const bal = Number(session.balance || 0);
        const debt = Math.max(0, limit - bal);

        const debtEl = document.getElementById('b2bDebtValue') || document.querySelector('.bal-value.text-red');
        if (debtEl) {
            debtEl.textContent = `${debt.toLocaleString('ru-RU')} MDL`;
        }

        const limitUsedPct = limit > 0 ? Math.min(100, Math.round((debt / limit) * 100)) : 0;
        const limitFill = document.getElementById('b2bLimitBarFill') || document.querySelector('.limit-bar-fill');
        if (limitFill) {
            limitFill.style.width = `${limitUsedPct}%`;
        }

        const limitUsedText = document.getElementById('b2bLimitUsed');
        if (limitUsedText) {
            limitUsedText.textContent = `Использовано: ${debt.toLocaleString('ru-RU')} MDL`;
        }

        const limitTotalText = document.getElementById('b2bLimitTotal');
        if (limitTotalText) {
            limitTotalText.textContent = `Лимит: ${limit.toLocaleString('ru-RU')} MDL`;
        }

        // 4. Загрузка и отображение истории заказов
        const ordersTbody = document.getElementById('b2bOrdersTableBody') || document.querySelector('.orders-table tbody');
        if (ordersTbody) {
            const ordersKey = `radcor_orders_${session.idno}`;
            let orders = [];
            try {
                orders = JSON.parse(localStorage.getItem(ordersKey) || '[]');
            } catch (e) {
                orders = [];
            }

            // Если заказов нет в localStorage, добавляем начальный демонстрационный заказ для полноты UI
            if (orders.length === 0) {
                orders = [
                    {
                        order_id: '84920',
                        date: '22.06.2026',
                        total: 14500,
                        pay_status: 'unpaid',
                        delivery_status: 'shipping',
                        items_summary: 'MOL Dynamic Mistral 5W-30 (4 шт), Felix Pro G12+ (2 бочки)'
                    },
                    {
                        order_id: '84605',
                        date: '15.06.2026',
                        total: 8200,
                        pay_status: 'paid',
                        delivery_status: 'delivered',
                        items_summary: 'MOL Hydro HM 46 (206 л)'
                    }
                ];
                localStorage.setItem(ordersKey, JSON.stringify(orders));
            }

            ordersTbody.innerHTML = orders.slice().reverse().map(order => {
                const isPaid = order.pay_status === 'paid';
                const payBadgeClass = isPaid ? 'status-paid' : 'status-unpaid';
                const payBadgeText = isPaid ? 'Оплачен' : 'Счет выставлен';

                let delBadgeClass = 'status-delivered';
                let delBadgeText = 'Доставлен';
                if (order.delivery_status === 'shipping') {
                    delBadgeClass = 'status-shipping';
                    delBadgeText = 'В пути';
                } else if (order.delivery_status === 'processing') {
                    delBadgeClass = 'status-unpaid';
                    delBadgeText = 'В обработке';
                }

                return `
                    <tr>
                        <td class="code-font text-amber">№${order.order_id}</td>
                        <td>${order.date}</td>
                        <td>${Number(order.total).toLocaleString('ru-RU')} MDL</td>
                        <td><span class="status-badge ${payBadgeClass}">${payBadgeText}</span></td>
                        <td><span class="status-badge ${delBadgeClass}">${delBadgeText}</span></td>
                    </tr>
                `;
            }).join('');
        }

        // 5. Быстрый заказ по артикулу (SKU)
        const quickOrderForm = document.getElementById('quickOrderForm');
        const quickOrderMsg = document.getElementById('quickOrderMsg');
        if (quickOrderForm) {
            quickOrderForm.onsubmit = async (e) => {
                e.preventDefault();
                const sku = document.getElementById('skuCode') ? document.getElementById('skuCode').value.trim() : '';
                const qty = document.getElementById('skuQty') ? parseInt(document.getElementById('skuQty').value, 10) || 1 : 1;

                if (!sku) return;

                // Загружаем products.json для поиска товара по артикулу
                try {
                    let products = [];
                    if (window.PRODUCTS_DATA && window.PRODUCTS_DATA.length > 0) {
                        products = window.PRODUCTS_DATA;
                    } else {
                        const resp = await fetch('products.json?v=47.0');
                        products = await resp.json();
                    }

                    const product = products.find(p => String(p.sku || '').toLowerCase() === sku.toLowerCase());

                    if (product) {
                        if (window.Cart && typeof window.Cart.addItem === 'function') {
                            const vol = Array.isArray(product.volumes) && product.volumes.length > 0 ? product.volumes[0] : 1;
                            const price = product.price || 500;
                            window.Cart.addItem(product, vol, price, qty);
                        }
                        if (quickOrderMsg) {
                            quickOrderMsg.textContent = `Товар "${product.name}" (${qty} шт.) успешно добавлен в корзину!`;
                            quickOrderMsg.style.display = 'block';
                            setTimeout(() => {
                                quickOrderMsg.style.display = 'none';
                            }, 4000);
                        }
                        quickOrderForm.reset();
                    } else {
                        alert(`Товар с артикулом "${sku}" не найден в каталоге.`);
                    }
                } catch (err) {
                    console.error('Quick order error:', err);
                }
            };
        }

        // 6. Выход из аккаунта
        const logoutBtn = document.getElementById('b2bLogoutBtn') || document.querySelector('.btn-logout');
        if (logoutBtn) {
            logoutBtn.onclick = (e) => {
                e.preventDefault();
                if (window.B2BAuth) {
                    window.B2BAuth.logout();
                } else {
                    localStorage.removeItem('radcor_b2b_session');
                    window.location.href = 'index.html';
                }
            };
        }

        // 7. Скачивание прайс-листа Excel (CSV/XLS)
        const downloadExcelBtn = document.getElementById('downloadExcelBtn');
        if (downloadExcelBtn) {
            downloadExcelBtn.onclick = async () => {
                try {
                    const resp = await fetch('products.json?v=47.0');
                    const products = await resp.json();
                    
                    const discount = session.discount_pct || 0;
                    let csvContent = 'data:text/csv;charset=utf-8,\uFEFF';
                    csvContent += 'Артикул;Название;Категория;Вязкость;Объемы;Базовая цена (MDL);Ваша цена со скидкой ' + discount + '% (MDL)\r\n';

                    products.forEach(p => {
                        const basePrice = p.price || 0;
                        const discPrice = discount > 0 ? Math.round(basePrice * (1 - discount / 100)) : basePrice;
                        const vols = Array.isArray(p.volumes) ? p.volumes.join(', ') : (p.volumes || '');
                        const visc = p.specs && p.specs.find ? (p.specs.find(s => s.label.includes('Вязкость') || s.label.includes('SAE')) || {}).value || '' : '';
                        
                        csvContent += `"${p.sku || ''}";"${(p.name || '').replace(/"/g, '""')}";"${p.category || ''}";"${visc}";"${vols}";"${basePrice}";"${discPrice}"\r\n`;
                    });

                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement('a');
                    link.setAttribute('href', encodedUri);
                    link.setAttribute('download', `Radcor_Price_B2B_${session.idno || 'partner'}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                } catch (e) {
                    console.error('Export error:', e);
                }
            };
        }
    });
})();
