/**
 * Интерактивный скрипт проверки подключения к 1С:Предприятие
 * Запуск: node test_1c_connection.js [URL_1C] [USER] [PASSWORD]
 */

const OneCClient = require('./server/onecClient');

async function runTest() {
  const targetUrl = process.argv[2] || process.env.ONEC_BASE_URL || 'http://localhost:5050/radcor/odata/standard.odata';
  const user = process.argv[3] || process.env.ONEC_USER || 'Administrator';
  const password = process.argv[4] || process.env.ONEC_PASSWORD || '';

  console.log('===============================================================');
  console.log('🔍 ТЕСТИРОВАНИЕ ПОДКЛЮЧЕНИЯ К 1C:ENTERPRISE (ODATA REST API)');
  console.log('===============================================================');
  console.log(`📍 Целевой URL 1С: ${targetUrl}`);
  console.log(`👤 Пользователь:   ${user || '(анонимно)'}`);
  console.log('---------------------------------------------------------------');

  const client = new OneCClient({ baseUrl: targetUrl, username: user, password: password });

  try {
    // 1. Проверка доступности OData
    console.log('\n[1/4] Проверка ответа сервиса OData ($metadata / корень)...');
    const rootMeta = await client.checkConnection();
    console.log('✅ 1С Сервер доступен!');
    if (rootMeta.services) {
      console.log(`   Доступные сущности 1С: ${rootMeta.services.join(', ')}`);
    }

    // 2. Получение каталога номенклатуры
    console.log('\n[2/4] Запрос справочника «Catalog_Номенклатура» (топ 3 позиции)...');
    const nomRes = await client.getNomenclature(3);
    const items = nomRes.value || nomRes;
    console.log(`✅ Получено позиций: ${Array.isArray(items) ? items.length : 'OK'}`);
    if (Array.isArray(items) && items.length > 0) {
      items.slice(0, 3).forEach((it, idx) => {
        console.log(`   ${idx + 1}. [${it.Артикул || it.Code || 'SKU'}] ${it.Description || it.НаименованиеПолное} (GUID: ${it.Ref_Key})`);
      });
    }

    // 3. Запрос актуальных цен
    console.log('\n[3/4] Запрос регистра «InformationRegister_ЦеныНоменклатуры»...');
    const pricesRes = await client.getPrices();
    const prices = pricesRes.value || pricesRes;
    console.log(`✅ Получено записей цен: ${Array.isArray(prices) ? prices.length : 'OK'}`);
    if (Array.isArray(prices) && prices.length > 0) {
      const samplePrice = prices[0];
      console.log(`   Пример цены: ${samplePrice.Цена} ${samplePrice.Валюта_Key || 'MDL'} для товара GUID ${samplePrice.Номенклатура_Key}`);
    }

    // 4. Тестовое создание документа заказа в 1С
    console.log('\n[4/4] Создание тестового документа «Document_ЗаказКлиента» (POST)...');
    const sampleOrder = {
      company_name: 'Test Partner Logistics SRL',
      phone: '+373 68 550 595',
      total_price: 2450.00,
      items: [
        { sku: 'PW-1001-RED', quantity: 10, price: 80 }
      ]
    };
    const orderDoc = await client.createCustomerOrder(sampleOrder);
    console.log('✅ Заказ успешно проведен и зарегистрирован в 1С!');
    console.log(`   Номер документа в 1С: ${orderDoc.Number || orderDoc.orderNo || '1C-Doc'}`);
    console.log(`   Уникальный GUID (Ref_Key): ${orderDoc.Ref_Key || orderDoc.id}`);
    console.log(`   Сумма документа: ${orderDoc.СуммаДокумента || orderDoc.total_price} MDL`);
    console.log(`   Статус в 1С: ${orderDoc.Статус || orderDoc.status || 'Зарегистрирован'}`);

    console.log('\n===============================================================');
    console.log('🎉 ВСЕ ТЕСТЫ ИНТЕГРАЦИИ 1С ПРОЙДЕНЫ УСПЕШНО!');
    console.log('===============================================================');
  } catch (err) {
    console.error('\n❌ Ошибка при взаимодействии с 1С:', err.message);
    console.log('\nПодсказка по устранению:');
    console.log('- Убедитесь, что сервер 1С запущен и доступен по сети.');
    console.log('- Проверьте правильность логина и пароля пользователя 1С.');
    console.log('- Убедитесь, что для базы включена публикация OData.');
  }
}

runTest();
