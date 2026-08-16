/**
 * Radcor-Prim B2B Portal — Google Apps Script Backend (Бессерверная БД)
 * 
 * ИНСТРУКЦИЯ ПО РАЗВЁРТЫВАНИЮ:
 * 
 * 1. Перейдите на https://sheets.google.com и создайте новую таблицу с именем:
 *    "Radcor_Clients_DB"
 * 
 * 2. В первой строке (строка заголовков) листа "Clients" вставьте следующие столбцы (точно как написано):
 *    A: id
 *    B: company_name
 *    C: idno
 *    D: contact_name
 *    E: phone
 *    F: address
 *    G: iban
 *    H: bank
 *    I: discount_pct
 *    J: credit_limit
 *    K: balance
 *    L: access_code_hash
 *    M: status
 *    N: created_at
 *    O: notes
 * 
 * 3. Во вторую строку вставьте ТЕСТОВОГО КЛИЕНТА:
 *    A (id): 1
 *    B (company_name): SRL "Trans-Auto-Grup"
 *    C (idno): 1003600012345
 *    D (contact_name): Ион Чебан
 *    E (phone): +373 69 123 456
 *    F (address): г. Кишинёв, ул. Заводская, 12
 *    G (iban): MD24AG0000000225123456
 *    H (bank): Moldindconbank
 *    I (discount_pct): 15
 *    J (credit_limit): 50000
 *    K (balance): 32500
 *    L (access_code_hash): 900f3241fcf5cb767ff6bd141b9980b5bdbd7330e98128e707921ec0136a4f29
 *       (это SHA-256 хеш от пароля: RC-2026-TEST)
 *    M (status): active
 *    N (created_at): 2026-08-16
 *    O (notes): Тестовый партнер Radcor-Prim
 * 
 * 4. В меню таблицы выберите: Расширения (Extensions) -> Apps Script.
 * 
 * 5. Удалите весь текст в редакторе и вставьте код ниже.
 * 
 * 6. Нажмите "Развернуть" (Deploy) -> "Новое развертывание" (New deployment).
 *    - Тип: Веб-приложение (Web app)
 *    - Описание: Radcor B2B Auth API
 *    - Запуск от имени: "Меня" (Me)
 *    - У кого есть доступ: "Все" (Anyone)
 * 
 * 7. Скопируйте полученный URL Веб-приложения и вставьте его в файл b2b-auth.js
 *    в переменную GAS_URL:
 *    const GAS_URL = 'https://script.google.com/macros/s/ВАШ_DEPLOYMENT_ID/exec';
 */

function doPost(e) {
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  try {
    if (!e || !e.postData || !e.postData.contents) {
      output.setContent(JSON.stringify({ ok: false, error: 'empty_request' }));
      return output;
    }

    var body = JSON.parse(e.postData.contents);
    var action = body.action;

    // ── Авторизация B2B клиента ──
    if (action === 'login') {
      var idno = String(body.idno || '').trim();
      var code_hash = String(body.code_hash || '').trim().toLowerCase();

      if (!idno || !code_hash) {
        output.setContent(JSON.stringify({ ok: false, error: 'missing_fields' }));
        return output;
      }

      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheetByName('Clients') || ss.getSheets()[0];
      var data = sheet.getDataRange().getValues();

      if (data.length < 2) {
        output.setContent(JSON.stringify({ ok: false, error: 'no_clients' }));
        return output;
      }

      var headers = data[0].map(function(h) { return String(h).trim().toLowerCase(); });
      var idnoIdx = headers.indexOf('idno');
      var hashIdx = headers.indexOf('access_code_hash');
      var statusIdx = headers.indexOf('status');

      if (idnoIdx === -1 || hashIdx === -1) {
        output.setContent(JSON.stringify({ ok: false, error: 'invalid_sheet_structure' }));
        return output;
      }

      var foundRow = null;
      for (var i = 1; i < data.length; i++) {
        var row = data[i];
        var rowIdno = String(row[idnoIdx]).trim();
        var rowHash = String(row[hashIdx]).trim().toLowerCase();
        var rowStatus = statusIdx !== -1 ? String(row[statusIdx]).trim().toLowerCase() : 'active';

        if (rowIdno === idno && rowHash === code_hash && rowStatus === 'active') {
          foundRow = row;
          break;
        }
      }

      if (!foundRow) {
        output.setContent(JSON.stringify({ ok: false, error: 'invalid_credentials' }));
        return output;
      }

      function getVal(key) {
        var idx = headers.indexOf(key);
        return idx !== -1 ? foundRow[idx] : '';
      }

      var profile = {
        id:            getVal('id'),
        company_name:  getVal('company_name'),
        idno:          getVal('idno'),
        contact_name:  getVal('contact_name'),
        phone:         getVal('phone'),
        address:       getVal('address'),
        iban:          getVal('iban'),
        bank:          getVal('bank'),
        discount_pct:  Number(getVal('discount_pct')) || 0,
        credit_limit:  Number(getVal('credit_limit')) || 0,
        balance:       Number(getVal('balance')) || 0
      };

      output.setContent(JSON.stringify({ ok: true, profile: profile }));
      return output;
    }

    // ── Добавление клиента менеджером ──
    if (action === 'register_client') {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheetByName('Clients') || ss.getSheets()[0];
      var lastRow = sheet.getLastRow();
      var nextId = lastRow; // approx row id

      sheet.appendRow([
        nextId,
        body.company_name || '',
        body.idno || '',
        body.contact_name || '',
        body.phone || '',
        body.address || '',
        body.iban || '',
        body.bank || '',
        Number(body.discount_pct) || 0,
        Number(body.credit_limit) || 0,
        Number(body.balance) || 0,
        String(body.access_code_hash || '').toLowerCase(),
        'active',
        new Date().toISOString().split('T')[0],
        body.notes || 'Создан из панели управления'
      ]);

      output.setContent(JSON.stringify({ ok: true, message: 'Client registered successfully' }));
      return output;
    }

    output.setContent(JSON.stringify({ ok: false, error: 'unknown_action' }));
    return output;

  } catch (err) {
    output.setContent(JSON.stringify({ ok: false, error: err.toString() }));
    return output;
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'ok',
    service: 'Radcor-Prim B2B API',
    time: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}
