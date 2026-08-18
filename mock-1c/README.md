# Mock-сервер 1С:Предприятие (Эмулятор) для Radcor B2B

Автономный тестовый эмулятор 1С для отладки интеграции интернет-магазина Radcor без необходимости устанавливать платформу 1С:Предприятие и приобретать лицензии.

---

## Возможности

1. **Интерактивная панель управления (UI)**: [http://localhost:5050/](http://localhost:5050/)
   - Мониторинг базы 1С: количество номенклатуры (734 позиции), цены и фасовки.
   - Просмотр поступающих с сайта B2B-заказов в реальном времени.
   - Симуляция смены цены товара в 1С.
   - Симуляция смены статусов заказов («Согласован», «Отгружен», «Оплачен»).
   - Быстрый тест CommerceML и OData выгрузок в 1 клик.

2. **Стандартный протокол CommerceML 2.08**:
   - `http://localhost:5050/1c_exchange.php?mode=checkauth` — авторизация обмена.
   - `http://localhost:5050/1c_exchange.php?mode=init` — инициализация параметров.
   - `http://localhost:5050/1c_exchange.php?mode=file&filename=import.xml` — полная выгрузка каталога, групп и свойств.
   - `http://localhost:5050/1c_exchange.php?mode=file&filename=offers.xml` — выгрузка предложений, цен MDL и остатков.
   - `http://localhost:5050/1c_exchange.php?mode=query` — экспорт заказов.

3. **1C OData REST API v4**:
   - `GET /radcor/odata/standard.odata/Catalog_Номенклатура?$format=json` — справочник номенклатуры.
   - `GET /radcor/odata/standard.odata/InformationRegister_ЦеныНоменклатуры?$format=json` — регистр цен.
   - `GET /radcor/odata/standard.odata/InformationRegister_ОстаткиТоваров?$format=json` — регистр остатков.
   - `POST /radcor/odata/standard.odata/Document_ЗаказКлиента` — создание документа заказа в 1С.

4. **REST API & Webhooks**:
   - `POST /api/1c/orders` — прием заказа с фронтенда / бэкенда Radcor.
   - `POST /api/control/update-price` — симуляция изменения цены.
   - `POST /api/control/update-order-status` — симуляция изменения статуса.

---

## Запуск

Запустить эмулятор из любой папки проекта:
```bash
node mock-1c/server.js
```
Или из папки `server/`:
```bash
npm run mock-1c
```

Сервер мгновенно запустится на порту `5050`.
