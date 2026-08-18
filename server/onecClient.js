/**
 * Модуль боевого подключения к 1C:Enterprise (OData REST API v4)
 * Подходит как для реального сервера 1С фирмы, так и для локального тестового сервера / Mock.
 */

const http = require('http');
const https = require('https');
const url = require('url');

class OneCClient {
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || process.env.ONEC_BASE_URL || 'http://localhost:5050/radcor/odata/standard.odata';
    this.username = config.username || process.env.ONEC_USER || 'Administrator';
    this.password = config.password || process.env.ONEC_PASSWORD || '';
    this.timeout = config.timeout || 10000;
  }

  getAuthHeader() {
    if (!this.username && !this.password) return null;
    const credentials = Buffer.from(`${this.username}:${this.password}`).toString('base64');
    return `Basic ${credentials}`;
  }

  async request(endpoint, options = {}) {
    const fullUrl = `${this.baseUrl.replace(/\/+$/, '')}/${endpoint.replace(/^\/+/, '')}`;
    const parsed = new URL(fullUrl);
    const transport = parsed.protocol === 'https:' ? https : http;

    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json; charset=utf-8',
      ...(options.headers || {})
    };

    const authHeader = this.getAuthHeader();
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    return new Promise((resolve, reject) => {
      const req = transport.request(fullUrl, {
        method: options.method || 'GET',
        headers,
        timeout: this.timeout
      }, (res) => {
        let body = '';
        res.on('data', chunk => { body += chunk; });
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const parsedData = body ? JSON.parse(body) : {};
              resolve(parsedData);
            } catch (err) {
              resolve(body);
            }
          } else {
            reject(new Error(`1C Server returned HTTP ${res.statusCode}: ${body.substring(0, 300)}`));
          }
        });
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`1C Connection timeout after ${this.timeout}ms`));
      });

      req.on('error', (err) => {
        reject(new Error(`1C Connection failed: ${err.message}`));
      });

      if (options.body) {
        req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
      }

      req.end();
    });
  }

  /**
   * 1. Проверка доступности OData 1С
   */
  async checkConnection() {
    return this.request('?$format=json');
  }

  /**
   * 2. Получение номенклатуры из 1С
   */
  async getNomenclature(top = 50) {
    return this.request(`Catalog_Номенклатура?$format=json&$top=${top}`);
  }

  /**
   * 3. Получение актуальных цен номенклатуры
   */
  async getPrices() {
    return this.request('InformationRegister_ЦеныНоменклатуры?$format=json');
  }

  /**
   * 4. Получение остатков на складах
   */
  async getStocks() {
    return this.request('InformationRegister_ОстаткиТоваров?$format=json');
  }

  /**
   * 5. Отправка заказа покупателя в 1С (создание документа)
   */
  async createCustomerOrder(orderData) {
    return this.request('Document_ЗаказКлиента?$format=json', {
      method: 'POST',
      body: {
        Date: new Date().toISOString(),
        Контрагент_Key: orderData.partnerKey || orderData.company_name,
        СуммаДокумента: orderData.total_price,
        Комментарий: `Заказ из B2B кабинета Radcor. Телефон: ${orderData.phone || '-'}`,
        Товары: (orderData.items || []).map(item => ({
          Номенклатура_Key: item.sku,
          Количество: item.quantity || item.qty || 1,
          Цена: item.price || 0,
          Сумма: (item.price || 0) * (item.quantity || item.qty || 1)
        }))
      }
    });
  }
}

module.exports = OneCClient;
