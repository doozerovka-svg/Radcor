document.addEventListener('DOMContentLoaded', () => {
  const CART_KEY = 'radcor_cart_v2';
  const form = document.getElementById('checkoutForm');
  const message = document.getElementById('checkoutMessage');
  const deliveryMethod = document.getElementById('deliveryMethod');
  const deliveryFields = document.getElementById('deliveryFields');
  const cart = JSON.parse(localStorage.getItem(CART_KEY) || '{}');
  const items = Object.values(cart);

  function showMessage(text, success = false) {
    message.textContent = text;
    message.style.display = 'block';
    message.style.color = success ? 'var(--colour-green)' : 'var(--colour-mol-red)';
  }

  function orderItems() {
    return items.map(item => ({ sku: item.sku, pack_id: item.packId || 'canister', quantity: item.qty }));
  }

  function renderCart() {
    const list = document.getElementById('checkoutItems');
    const total = document.getElementById('checkoutTotal');
    if (!items.length) { list.textContent = 'Корзина пуста.'; return; }
    list.innerHTML = items.map(item => `<p><strong>${item.name}</strong><br><small>${item.sku} · ${item.vol} л · ${item.qty} шт.</small></p>`).join('');
    total.textContent = 'Проверяем итог заказа…';
    fetch('/api/v1/orders/preview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: orderItems() }) })
      .then(res => res.json()).then(payload => { total.textContent = payload.success ? `Итого: ${payload.data.total_price.toLocaleString('ru-RU')} MDL` : 'Итог уточнит менеджер'; })
      .catch(() => { total.textContent = 'Итог уточнит менеджер'; });
  }

  deliveryMethod.addEventListener('change', () => { deliveryFields.hidden = deliveryMethod.value !== 'delivery'; });
  renderCart();

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!items.length) return showMessage('Корзина пуста. Добавьте товары из каталога.');
    if (!form.reportValidity()) return;
    const delivery = deliveryMethod.value === 'delivery';
    const city = document.getElementById('deliveryCity');
    const address = document.getElementById('deliveryAddress');
    if (delivery && (!city.value.trim() || !address.value.trim())) return showMessage('Укажите город и адрес доставки.');
    try {
      const response = await fetch('/api/v1/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        company_name: document.getElementById('companyName').value.trim(), contact_person: document.getElementById('contactName').value.trim(), phone: document.getElementById('orderPhone').value.trim(), email: document.getElementById('orderEmail').value.trim(),
        delivery_method: deliveryMethod.value, delivery_city: city.value.trim(), delivery_address: address.value.trim(), payment_method: document.getElementById('paymentMethod').value, comment: document.getElementById('orderComment').value.trim(), items: orderItems()
      }) });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error || 'Не удалось отправить заказ.');
      localStorage.removeItem(CART_KEY);
      showMessage(`Заказ ${payload.data.orderNo} принят. Менеджер подтвердит наличие и условия.`, true);
      form.reset();
      document.getElementById('checkoutItems').innerHTML = '';
      document.getElementById('checkoutTotal').textContent = '';
    } catch (error) { showMessage(error.message); }
  });
});
