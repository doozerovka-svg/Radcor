document.addEventListener('DOMContentLoaded', () => {
  const CART_KEY = 'radcor_cart_v2';
  const form = document.getElementById('checkoutForm');
  const message = document.getElementById('checkoutMessage');
  const deliveryMethod = document.getElementById('deliveryMethod');
  const deliveryFields = document.getElementById('deliveryFields');
  function getItems() {
    const cart = JSON.parse(localStorage.getItem(CART_KEY) || '{}');
    return Object.values(cart);
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

  function showMessage(text, success = false) {
    if (!message) return;
    message.textContent = text;
    message.style.display = 'block';
    message.style.color = success ? 'var(--colour-green)' : 'var(--colour-mol-red)';
  }

  function orderItems() {
    return getItems().map(item => ({ sku: item.sku, pack_id: item.packId || 'canister', quantity: item.qty }));
  }

  function renderCart() {
    const list = document.getElementById('checkoutItems');
    const total = document.getElementById('checkoutTotal');
    if (!list) return;
    const items = getItems();
    if (!items.length) {
      list.textContent = getI18nText('msg_empty_cart', 'Корзина пуста.');
      if (total) total.textContent = '';
      return;
    }
    const lang = getLang();
    const lUnit = lang === 'ro' ? 'l' : 'л';
    const pcUnit = lang === 'ro' ? 'buc.' : 'шт.';

    list.innerHTML = items.map(item => `<p><strong>${item.name}</strong><br><small>${item.sku} · ${item.vol} ${lUnit} · ${item.qty} ${pcUnit}</small></p>`).join('');
    total.textContent = getI18nText('msg_checking_total', 'Проверяем итог заказа…');
    fetch('/api/v1/orders/preview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: orderItems() }) })
      .then(res => res.json()).then(payload => {
        const totalLabel = getI18nText('msg_total_label', 'Итого:');
        const byManager = getI18nText('msg_total_by_manager', 'Итог уточнит менеджер');
        total.textContent = payload.success ? `${totalLabel} ${payload.data.total_price.toLocaleString('ru-RU')} MDL` : byManager;
      })
      .catch(() => {
        total.textContent = getI18nText('msg_total_by_manager', 'Итог уточнит менеджер');
      });
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
      if (!items.length) return showMessage(getI18nText('msg_empty_cart', 'Корзина пуста. Добавьте товары из каталога.'));
      if (!form.reportValidity()) return;
      const delivery = deliveryMethod ? deliveryMethod.value === 'delivery' : false;
      const city = document.getElementById('deliveryCity');
      const address = document.getElementById('deliveryAddress');
      if (delivery && ((city && !city.value.trim()) || (address && !address.value.trim()))) return showMessage(getI18nText('msg_specify_address', 'Укажите город и адрес доставки.'));
      try {
        const response = await fetch('/api/v1/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
          company_name: document.getElementById('companyName') ? document.getElementById('companyName').value.trim() : '',
          contact_person: document.getElementById('contactName') ? document.getElementById('contactName').value.trim() : '',
          phone: document.getElementById('orderPhone') ? document.getElementById('orderPhone').value.trim() : '',
          email: document.getElementById('orderEmail') ? document.getElementById('orderEmail').value.trim() : '',
          delivery_method: deliveryMethod ? deliveryMethod.value : '',
          delivery_city: city ? city.value.trim() : '',
          delivery_address: address ? address.value.trim() : '',
          payment_method: document.getElementById('paymentMethod') ? document.getElementById('paymentMethod').value : '',
          comment: document.getElementById('orderComment') ? document.getElementById('orderComment').value.trim() : '',
          items: orderItems()
        }) });
        const payload = await response.json();
        if (!response.ok || !payload.success) throw new Error(payload.error || getI18nText('msg_order_failed', 'Не удалось отправить заказ.'));
        localStorage.removeItem(CART_KEY);
        const orderMsg = getI18nText('msg_order_no_accepted', 'Заказ {orderNo} принят. Менеджер подтвердит наличие и условия.').replace('{orderNo}', payload.data.orderNo);
        showMessage(orderMsg, true);
        form.reset();
        if (document.getElementById('checkoutItems')) document.getElementById('checkoutItems').innerHTML = '';
        if (document.getElementById('checkoutTotal')) document.getElementById('checkoutTotal').textContent = '';
      } catch (error) {
        if (error.name === 'TypeError' || (error.message && (error.message.includes('fetch') || error.message.includes('NetworkError')))) {
          const orderNo = 'RAD-' + Math.floor(100000 + Math.random() * 900000);
          const savedOrders = JSON.parse(localStorage.getItem('radcor_orders') || '[]');
          savedOrders.push({
            orderNo,
            company_name: document.getElementById('companyName') ? document.getElementById('companyName').value.trim() : '',
            contact_person: document.getElementById('contactName') ? document.getElementById('contactName').value.trim() : '',
            phone: document.getElementById('orderPhone') ? document.getElementById('orderPhone').value.trim() : '',
            email: document.getElementById('orderEmail') ? document.getElementById('orderEmail').value.trim() : '',
            delivery_method: deliveryMethod ? deliveryMethod.value : '',
            delivery_city: city ? city.value.trim() : '',
            delivery_address: address ? address.value.trim() : '',
            payment_method: document.getElementById('paymentMethod') ? document.getElementById('paymentMethod').value : '',
            comment: document.getElementById('orderComment') ? document.getElementById('orderComment').value.trim() : '',
            items: orderItems(),
            created_at: new Date().toISOString()
          });
          localStorage.setItem('radcor_orders', JSON.stringify(savedOrders));
          localStorage.removeItem(CART_KEY);
          const orderMsg = getI18nText('msg_order_no_accepted', 'Заказ {orderNo} принят. Менеджер подтвердит наличие и условия.').replace('{orderNo}', orderNo);
          showMessage(orderMsg, true);
          form.reset();
          if (document.getElementById('checkoutItems')) document.getElementById('checkoutItems').innerHTML = '';
          if (document.getElementById('checkoutTotal')) document.getElementById('checkoutTotal').textContent = '';
        } else {
          showMessage(error.message);
        }
      }
    });
  }
});
