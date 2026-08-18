document.addEventListener('DOMContentLoaded', () => {
  const CART_KEY = 'radcor_cart_v2';
  const form = document.getElementById('checkoutForm');
  const message = document.getElementById('checkoutMessage');
  const deliveryMethod = document.getElementById('deliveryMethod');
  const deliveryFields = document.getElementById('deliveryFields');

  // Auto-fill form from B2B session if authenticated
  if (window.B2BAuth) {
    const session = window.B2BAuth.getSession();
    if (session) {
      const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el && !el.value && val) el.value = val;
      };
      setVal('companyName', session.company_name);
      setVal('contactName', session.contact_name);
      setVal('orderPhone', session.phone);
      setVal('deliveryAddress', session.address);
    }
  }

  function getItems() {
    try {
      const cart = JSON.parse(localStorage.getItem(CART_KEY) || '{}');
      return Object.values(cart);
    } catch (e) {
      return [];
    }
  }

  function getLang() {
    return localStorage.getItem('radcor_lang') || 'ru';
  }

  function getI18nText(key, fallback) {
    const lang = getLang();
    if (window.I18N && window.I18N[lang] && window.I18N[lang][key]) {
      return window.I18N[lang][key];
    }
    return fallback;
  }

  function showMessage(htmlContent, isSuccess = false) {
    if (!message) return;
    message.innerHTML = htmlContent;
    message.style.display = 'block';
    message.className = isSuccess ? 'form-success-msg active' : 'form-error-msg active';
    message.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function orderItems() {
    return getItems().map(item => ({
      sku: item.sku,
      name: item.name,
      vol: item.vol,
      pack_id: item.packId || 'canister',
      quantity: Number(item.qty) || 1,
      price: Number(item.price) || 0
    }));
  }

  function calculateTotals(items) {
    const session = window.B2BAuth ? window.B2BAuth.getSession() : null;
    const discountPct = session && session.discount_pct ? Number(session.discount_pct) : 0;

    const baseTotal = items.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 1), 0);
    const discountAmount = discountPct > 0 ? Math.round(baseTotal * (discountPct / 100)) : 0;
    const finalTotal = Math.max(0, baseTotal - discountAmount);

    return { baseTotal, discountPct, discountAmount, finalTotal, session };
  }

  function renderCart() {
    const list = document.getElementById('checkoutItems');
    const total = document.getElementById('checkoutTotal');
    if (!list) return;
    const items = getItems();
    if (!items.length) {
      list.innerHTML = `<p class="empty-cart-msg">${getI18nText('msg_empty_cart', 'Корзина пуста.')}</p>`;
      if (total) total.innerHTML = '';
      return;
    }
    const lang = getLang();
    const lUnit = lang === 'ro' ? 'l' : 'л';
    const pcUnit = lang === 'ro' ? 'buc.' : 'шт.';

    const { baseTotal, discountPct, discountAmount, finalTotal } = calculateTotals(items);

    list.innerHTML = items.map(item => {
      const itemPrice = Number(item.price) || 0;
      const itemQty = Number(item.qty) || 1;
      const rowSum = itemPrice * itemQty;
      return `
        <div style="padding: 10px 0; border-bottom: 1px solid var(--colour-border, #E5E7EB);">
          <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
            <strong style="font-size: 14px; font-weight: 600;">${item.name}</strong>
            <span style="font-weight: 600; font-size: 14px;">${rowSum.toLocaleString('ru-RU')} MDL</span>
          </div>
          <div style="font-size: 12px; color: var(--colour-text-muted, #6B7280); font-family: var(--font-code, monospace);">
            ${item.sku} · ${item.vol} ${lUnit} · ${itemQty} ${pcUnit} × ${itemPrice.toLocaleString('ru-RU')} MDL
          </div>
        </div>
      `;
    }).join('');

    const totalLabel = getI18nText('msg_total_label', 'Итого:');
    const subtotalLabel = lang === 'ro' ? 'Subtotal:' : 'Сумма без скидки:';
    const discountLabel = lang === 'ro' ? `Reducere B2B (−${discountPct}%):` : `Скидка B2B партнера (−${discountPct}%):`;

    if (total) {
      total.innerHTML = `
        <div style="margin-top: 15px; padding-top: 12px; border-top: 2px solid var(--colour-border, #E5E7EB);">
          ${discountPct > 0 ? `
            <div style="display: flex; justify-content: space-between; font-size: 13px; color: var(--colour-text-muted, #6B7280); margin-bottom: 6px;">
              <span>${subtotalLabel}</span>
              <span>${baseTotal.toLocaleString('ru-RU')} MDL</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 13px; color: #10B981; margin-bottom: 8px; font-weight: 600;">
              <span>${discountLabel}</span>
              <span>−${discountAmount.toLocaleString('ru-RU')} MDL</span>
            </div>
          ` : ''}
          <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: 700; align-items: center;">
            <span>${totalLabel}</span>
            <span class="text-amber" style="font-size: 18px;">${finalTotal.toLocaleString('ru-RU')} MDL</span>
          </div>
        </div>
      `;
    }
  }

  document.addEventListener('click', (e) => {
    if (e.target.closest('.lang-selector a, .lang-link')) {
      setTimeout(renderCart, 50);
    }
  });

  if (deliveryMethod) {
    deliveryMethod.addEventListener('change', () => {
      if (deliveryFields) deliveryFields.hidden = deliveryMethod.value !== 'delivery';
    });
  }

  renderCart();

  if (form) {
    form.addEventListener('submit', async event => {
      event.preventDefault();
      const items = getItems();
      if (!items.length) {
        return showMessage(getI18nText('msg_empty_cart', 'Корзина пуста. Добавьте товары из каталога.'));
      }
      if (!form.reportValidity()) return;

      const delivery = deliveryMethod ? deliveryMethod.value === 'delivery' : false;
      const cityInput = document.getElementById('deliveryCity');
      const addressInput = document.getElementById('deliveryAddress');
      const city = cityInput ? cityInput.value.trim() : '';
      const address = addressInput ? addressInput.value.trim() : '';

      if (delivery && (!city || !address)) {
        return showMessage(getI18nText('msg_specify_address', 'Укажите город и адрес доставки.'));
      }

      const companyName = document.getElementById('companyName') ? document.getElementById('companyName').value.trim() : '';
      const contactPerson = document.getElementById('contactName') ? document.getElementById('contactName').value.trim() : '';
      const phone = document.getElementById('orderPhone') ? document.getElementById('orderPhone').value.trim() : '';
      const email = document.getElementById('orderEmail') ? document.getElementById('orderEmail').value.trim() : '';
      const paymentMethodVal = document.getElementById('paymentMethod') ? document.getElementById('paymentMethod').value : 'invoice';
      const comment = document.getElementById('orderComment') ? document.getElementById('orderComment').value.trim() : '';

      const { baseTotal, discountPct, discountAmount, finalTotal, session } = calculateTotals(items);
      const orderNo = 'RAD-' + Math.floor(100000 + Math.random() * 900000);
      const orderIdShort = orderNo.replace('RAD-', '');
      const orderDate = new Date().toLocaleDateString('ru-RU');

      const newOrder = {
        orderNo: orderNo,
        order_id: orderIdShort,
        date: orderDate,
        company_name: companyName,
        contact_person: contactPerson,
        phone: phone,
        email: email,
        delivery_method: delivery ? 'delivery' : 'pickup',
        delivery_city: city,
        delivery_address: address,
        payment_method: paymentMethodVal,
        comment: comment,
        items: orderItems(),
        base_total: baseTotal,
        discount_pct: discountPct,
        discount_amount: discountAmount,
        total_price: finalTotal,
        total: finalTotal,
        pay_status: 'unpaid',
        delivery_status: 'processing',
        created_at: new Date().toISOString()
      };

      // 1. Сохранение в общий список заказов в localStorage
      try {
        const savedOrders = JSON.parse(localStorage.getItem('radcor_orders') || '[]');
        savedOrders.unshift(newOrder);
        localStorage.setItem('radcor_orders', JSON.stringify(savedOrders));
      } catch (e) {}

      // 2. Сохранение в личный кабинет B2B клиента, если авторизован
      if (session && session.idno) {
        try {
          const b2bOrdersKey = `radcor_orders_${session.idno}`;
          const b2bOrders = JSON.parse(localStorage.getItem(b2bOrdersKey) || '[]');
          b2bOrders.unshift({
            order_id: orderIdShort,
            orderNo: orderNo,
            date: orderDate,
            total: finalTotal,
            pay_status: 'unpaid',
            delivery_status: 'processing',
            items_summary: items.map(i => `${i.name} (${i.qty} шт.)`).join(', ')
          });
          localStorage.setItem(b2bOrdersKey, JSON.stringify(b2bOrders));
        } catch (e) {}
      }

      // 3. Очистка корзины
      try {
        localStorage.removeItem(CART_KEY);
      } catch (e) {}

      // 4. Отображение подтверждения оформления
      const lang = getLang();
      const isRo = lang === 'ro';
      const successTitle = isRo ? `Comanda №${orderNo} a fost plasată cu succes!` : `Заказ №${orderNo} успешно оформлен!`;
      const successDesc = isRo
        ? `Vă mulțumim! Managerul nostru vă va contacta la numărul de telefon indicat pentru confirmare și emiterea facturii.`
        : `Спасибо за ваш заказ! Наш менеджер свяжется с вами по указанному телефону для подтверждения наличия и выставления счёта.`;
      const btnCatalog = isRo ? 'Înapoi la catalog' : 'Вернуться в каталог';
      const btnCabinet = isRo ? 'În Cabinetul B2B' : 'В Личный кабинет B2B';

      const successHTML = `
        <div style="background: #F0FDF4; border: 1.5px solid #86EFAC; border-radius: 12px; padding: 24px; color: #166534;">
          <h3 style="margin: 0 0 10px; font-size: 18px; color: #15803D; display: flex; align-items: center; gap: 8px;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            ${successTitle}
          </h3>
          <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.5; color: #166534;">
            ${successDesc}
          </p>
          <div style="background: #ffffff; border: 1px solid #BBF7D0; border-radius: 8px; padding: 14px; margin-bottom: 16px; font-size: 13px; line-height: 1.6; color: #374151;">
            <div><strong>${isRo ? 'Suma comenzii' : 'Сумма заказа'}:</strong> <span style="color: #D97706; font-weight: 700;">${finalTotal.toLocaleString('ru-RU')} MDL</span></div>
            <div><strong>${isRo ? 'Livrare' : 'Способ получения'}:</strong> ${delivery ? (isRo ? `Livrare (${city})` : `Доставка (${city})`) : (isRo ? 'Ridicare personală' : 'Самовывоз')}</div>
            <div><strong>${isRo ? 'Companie' : 'Компания'}:</strong> ${companyName} (${contactPerson})</div>
          </div>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <a href="catalog.html" class="btn btn-secondary btn-sm" style="text-decoration: none;">${btnCatalog}</a>
            ${session ? `<a href="b2b-dashboard.html" class="btn btn-primary btn-sm" style="text-decoration: none;">${btnCabinet}</a>` : ''}
          </div>
        </div>
      `;

      showMessage(successHTML, true);
      form.reset();

      if (document.getElementById('checkoutItems')) {
        document.getElementById('checkoutItems').innerHTML = `<p class="empty-cart-msg" style="color: #10B981;">✓ ${isRo ? 'Comanda a fost trimisă' : 'Заказ отправлен'}</p>`;
      }
      if (document.getElementById('checkoutTotal')) {
        document.getElementById('checkoutTotal').innerHTML = '';
      }
    });
  }
});
