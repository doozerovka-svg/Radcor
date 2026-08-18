const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { generateImportXml, generateOffersXml, getDeterministicGuid } = require('./cml-generator');
const { mapCatalogNomenclature, mapPrices, mapStocks } = require('./odata-generator');

const PORT = process.env.PORT || 5050;
const RADCOR_API_URL = process.env.RADCOR_API_URL || 'http://localhost:5000';

// Path to products.json
const productsFilePath = path.resolve(__dirname, '../products.json');

// In-Memory State for 1C Database
let productsState = [];
let ordersState = [];
let errorSimulation = {
  enabled: false,
  status: 500,
  message: 'Internal 1C Server Error (Simulated)'
};

function loadProducts() {
  try {
    if (fs.existsSync(productsFilePath)) {
      const data = fs.readFileSync(productsFilePath, 'utf8');
      productsState = JSON.parse(data);
      console.log(`[1C Mock] Loaded ${productsState.length} products from products.json`);
    } else {
      console.warn(`[1C Mock] Warning: ${productsFilePath} not found.`);
      productsState = [];
    }
  } catch (err) {
    console.error('[1C Mock] Error reading products.json:', err.message);
    productsState = [];
  }
}

loadProducts();

// Helper for JSON responses
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
  });
  res.end(JSON.stringify(data, null, 2));
}

// Helper for Text/XML responses
function sendResponse(res, statusCode, contentType, body) {
  res.writeHead(statusCode, {
    'Content-Type': `${contentType}; charset=utf-8`,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
  });
  res.end(body);
}

// Parse request body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
          resolve(JSON.parse(body));
        } else {
          resolve(body);
        }
      } catch (e) {
        resolve(body);
      }
    });
    req.on('error', reject);
  });
}

// Create HTTP Server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname;
  try { pathname = decodeURIComponent(pathname); } catch (e) {}
  const query = parsedUrl.query;
  const method = req.method;

  // Handle CORS Preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
    });
    return res.end();
  }

  // Simulation Check
  if (errorSimulation.enabled && !pathname.startsWith('/api/control')) {
    return sendJson(res, errorSimulation.status, {
      error: errorSimulation.message,
      simulated: true
    });
  }

  console.log(`[1C Mock] ${method} ${pathname}`);

  // -------------------------------------------------------------
  // 1. Interactive Dashboard UI
  // -------------------------------------------------------------
  if (pathname === '/' && method === 'GET') {
    const htmlPath = path.join(__dirname, 'public', 'index.html');
    if (fs.existsSync(htmlPath)) {
      return sendResponse(res, 200, 'text/html', fs.readFileSync(htmlPath, 'utf8'));
    }
  }

  // -------------------------------------------------------------
  // 2. Standard CommerceML 2.08 Protocol (/1c_exchange.php or /api/1c-exchange)
  // -------------------------------------------------------------
  if (pathname === '/1c_exchange.php' || pathname === '/api/1c-exchange') {
    const type = query.type || 'catalog';
    const mode = query.mode;

    if (mode === 'checkauth') {
      return sendResponse(res, 200, 'text/plain', "success\ncookie_1c_sess\n" + Date.now());
    }

    if (mode === 'init') {
      return sendResponse(res, 200, 'text/plain', "zip=no\nfile_limit=20480000");
    }

    if (mode === 'file' && method === 'GET') {
      const filename = query.filename;
      if (filename === 'import.xml' || type === 'catalog') {
        const xml = generateImportXml(productsState);
        return sendResponse(res, 200, 'application/xml', xml);
      }
      if (filename === 'offers.xml') {
        const xml = generateOffersXml(productsState);
        return sendResponse(res, 200, 'application/xml', xml);
      }
    }

    if (mode === 'file' && method === 'POST') {
      const body = await parseBody(req);
      console.log(`[1C Mock] Received CommerceML file upload: ${query.filename} (${typeof body === 'string' ? body.length : 0} bytes)`);
      return sendResponse(res, 200, 'text/plain', "success");
    }

    if (mode === 'query') {
      // Export orders in CommerceML
      return sendResponse(res, 200, 'application/xml', `<?xml version="1.0" encoding="UTF-8"?>
<КоммерческаяИнформация ВерсияСхемы="2.08" ДатаФормирования="${new Date().toISOString()}">
  <Документ>
    <Ид>${getDeterministicGuid('test-order')}</Ид>
    <Номер>80001</Номер>
    <Дата>${new Date().toISOString().split('T')[0]}</Дата>
    <ХозОперация>Заказ товара</ХозОперация>
    <Роль>Продавец</Роль>
    <Валюта>MDL</Валюта>
    <Сумма>1250.00</Сумма>
    <Контрагенты>
      <Контрагент>
        <Ид>${getDeterministicGuid('client-1')}</Ид>
        <Наименование>Auto Trans SRL</Наименование>
        <Роль>Покупатель</Роль>
      </Контрагент>
    </Контрагенты>
  </Документ>
</КоммерческаяИнформация>`);
    }

    if (mode === 'success') {
      return sendResponse(res, 200, 'text/plain', "success");
    }

    return sendResponse(res, 200, 'text/plain', "success");
  }

  // -------------------------------------------------------------
  // 3. 1C OData REST API v4 Endpoints
  // -------------------------------------------------------------
  if (pathname.startsWith('/radcor/odata/standard.odata') || pathname.startsWith('/odata/standard.odata')) {
    const subpath = pathname.replace(/^\/(radcor\/)?odata\/standard\.odata\/?/, '');

    // Catalog_Номенклатура
    if (subpath.startsWith('Catalog_Номенклатура') || subpath === 'Catalog_Nomenclature') {
      const odataItems = mapCatalogNomenclature(productsState);
      return sendJson(res, 200, {
        "odata.metadata": "http://localhost:5050/radcor/odata/standard.odata/$metadata#Catalog_Номенклатура",
        "value": odataItems
      });
    }

    // InformationRegister_ЦеныНоменклатуры
    if (subpath.startsWith('InformationRegister_ЦеныНоменклатуры') || subpath === 'Prices') {
      const prices = mapPrices(productsState);
      return sendJson(res, 200, {
        "odata.metadata": "http://localhost:5050/radcor/odata/standard.odata/$metadata#InformationRegister_ЦеныНоменклатуры",
        "value": prices
      });
    }

    // InformationRegister_ОстаткиТоваров
    if (subpath.startsWith('InformationRegister_ОстаткиТоваров') || subpath === 'Stocks') {
      const stocks = mapStocks(productsState);
      return sendJson(res, 200, {
        "odata.metadata": "http://localhost:5050/radcor/odata/standard.odata/$metadata#InformationRegister_ОстаткиТоваров",
        "value": stocks
      });
    }

    // Document_ЗаказКлиента
    if (subpath.startsWith('Document_ЗаказКлиента') || subpath === 'Orders') {
      if (method === 'GET') {
        return sendJson(res, 200, {
          "odata.metadata": "http://localhost:5050/radcor/odata/standard.odata/$metadata#Document_ЗаказКлиента",
          "value": ordersState
        });
      }
      if (method === 'POST') {
        const body = await parseBody(req);
        const newOrder = {
          Ref_Key: getDeterministicGuid(`order-${Date.now()}`),
          Number: `1C-${String(10000 + ordersState.length + 1)}`,
          Date: new Date().toISOString(),
          Posted: true,
          DeletionMark: false,
          Контрагент_Key: body.Контрагент_Key || getDeterministicGuid(body.company_name || 'guest'),
          СуммаДокумента: body.СуммаДокумента || body.total_price || 0,
          Статус: 'Согласован',
          Комментарий: body.Комментарий || body.comment || 'Заказ с сайта Radcor',
          Товары: body.items || body.Товары || []
        };
        ordersState.unshift(newOrder);
        console.log(`[1C Mock OData] Created 1C Document: ${newOrder.Number} (${newOrder.Ref_Key})`);
        return sendJson(res, 201, newOrder);
      }
    }

    // Default metadata response
    return sendJson(res, 200, {
      "odata.metadata": "http://localhost:5050/radcor/odata/standard.odata/$metadata",
      "services": [
        "Catalog_Номенклатура",
        "InformationRegister_ЦеныНоменклатуры",
        "InformationRegister_ОстаткиТоваров",
        "Document_ЗаказКлиента"
      ]
    });
  }

  // -------------------------------------------------------------
  // 4. REST API & Webhook Endpoints
  // -------------------------------------------------------------
  if (pathname === '/api/1c/products' && method === 'GET') {
    return sendJson(res, 200, { success: true, count: productsState.length, data: productsState });
  }

  if (pathname === '/api/1c/orders' && method === 'GET') {
    return sendJson(res, 200, { success: true, count: ordersState.length, data: ordersState });
  }

  if (pathname === '/api/1c/orders' && method === 'POST') {
    const body = await parseBody(req);
    const orderDoc = {
      id: getDeterministicGuid(`order-${Date.now()}`),
      orderNo: `1C-${String(10000 + ordersState.length + 1)}`,
      receivedAt: new Date().toISOString(),
      status: 'Принят в 1С (Новый)',
      customer: {
        company: body.company_name || body.company || 'B2B Client',
        contact: body.contact_person || body.contact || '',
        phone: body.phone || '',
        email: body.email || ''
      },
      payment_method: body.payment_method || 'invoice',
      delivery_method: body.delivery_method || 'pickup',
      total_price: body.total_price || 0,
      items: body.items || []
    };
    ordersState.unshift(orderDoc);
    console.log(`[1C Mock] Order ${orderDoc.orderNo} received successfully.`);
    return sendJson(res, 201, { success: true, message: 'Order processed by 1C', order: orderDoc });
  }

  // Simulate price change in 1C
  if (pathname === '/api/control/update-price' && method === 'POST') {
    const body = await parseBody(req);
    const { sku, pack_id, new_price } = body;
    const prod = productsState.find(p => p.sku === sku);
    if (!prod) return sendJson(res, 404, { success: false, error: `SKU ${sku} not found` });

    if (pack_id && Array.isArray(prod.packs)) {
      const pack = prod.packs.find(pk => pk.id === pack_id);
      if (pack) pack.price_mdl = Number(new_price);
    } else {
      prod.canister_price = Number(new_price);
    }

    console.log(`[1C Mock] Price updated for ${sku} -> ${new_price} MDL`);
    return sendJson(res, 200, { success: true, product: prod });
  }

  // Simulate order status change in 1C
  if (pathname === '/api/control/update-order-status' && method === 'POST') {
    const body = await parseBody(req);
    const { orderNo, status } = body;
    const ord = ordersState.find(o => o.orderNo === orderNo || o.Number === orderNo);
    if (!ord) return sendJson(res, 404, { success: false, error: 'Order not found' });
    ord.status = status;
    ord.Статус = status;
    return sendJson(res, 200, { success: true, order: ord });
  }

  // Toggle Error simulation
  if (pathname === '/api/control/toggle-error' && method === 'POST') {
    const body = await parseBody(req);
    errorSimulation.enabled = Boolean(body.enabled);
    if (body.status) errorSimulation.status = Number(body.status);
    return sendJson(res, 200, { success: true, simulation: errorSimulation });
  }

  // Status check
  if (pathname === '/health' || pathname === '/api/health') {
    return sendJson(res, 200, {
      status: 'healthy',
      mode: '1C:Enterprise Mock Server',
      infobase: 'radcor',
      productsCount: productsState.length,
      ordersCount: ordersState.length,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  }

  // 404
  return sendJson(res, 404, { success: false, error: 'Endpoint not found in 1C Mock Server' });
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 [1C Mock Server] Running at: http://localhost:${PORT}`);
  console.log(`📊 Web Dashboard:             http://localhost:${PORT}/`);
  console.log(`📦 CommerceML Exchange:        http://localhost:${PORT}/1c_exchange.php`);
  console.log(`🌐 1C OData REST API:          http://localhost:${PORT}/radcor/odata/standard.odata/`);
  console.log(`=======================================================`);
});
