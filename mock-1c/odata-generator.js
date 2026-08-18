// 1C OData REST API v4 Generator
const { getDeterministicGuid } = require('./cml-generator');

function mapCatalogNomenclature(products) {
  return products.map(product => {
    const guid = getDeterministicGuid(`product-${product.sku}`);
    return {
      Ref_Key: guid,
      DataVersion: "AAAAAA==",
      DeletionMark: false,
      Code: product.sku,
      Description: product.name,
      Артикул: product.sku,
      НаименованиеПолное: product.name,
      ВидНоменклатуры_Key: getDeterministicGuid(`cat-${product.category || 'general'}`),
      ЕдиницаИзмерения_Key: getDeterministicGuid('unit-piece'),
      Описание: product.description || '',
      Brand: product.brand || 'MOL',
      Category: product.category || '',
      PriceOnRequest: Boolean(product.price_on_request),
      Specs: product.specs || []
    };
  });
}

function mapPrices(products) {
  const prices = [];
  const now = new Date().toISOString();
  const priceTypeKey = getDeterministicGuid('price-b2b-mdl');

  products.forEach(product => {
    const prodKey = getDeterministicGuid(`product-${product.sku}`);
    if (Array.isArray(product.packs) && product.packs.length > 0) {
      product.packs.forEach(pack => {
        const packKey = getDeterministicGuid(`pack-${pack.id}`);
        prices.push({
          Period: now,
          Номенклатура_Key: prodKey,
          Упаковка_Key: packKey,
          ВидЦены_Key: priceTypeKey,
          Цена: Number(pack.price_mdl) || 0,
          Валюта_Key: "MDL",
          Active: true
        });
      });
    } else {
      prices.push({
        Period: now,
        Номенклатура_Key: prodKey,
        Упаковка_Key: null,
        ВидЦены_Key: priceTypeKey,
        Цена: Number(product.canister_price) || 0,
        Валюта_Key: "MDL",
        Active: true
      });
    }
  });

  return prices;
}

function mapStocks(products) {
  const stocks = [];
  const warehouseKey = getDeterministicGuid('warehouse-central-chisinau');

  products.forEach(product => {
    const prodKey = getDeterministicGuid(`product-${product.sku}`);
    stocks.push({
      Склад_Key: warehouseKey,
      Номенклатура_Key: prodKey,
      ВНаличииОстаток: product.price_on_request ? 0 : 75,
      ВРезервеОстаток: 0,
      КОтгрузкеОстаток: product.price_on_request ? 0 : 75
    });
  });

  return stocks;
}

module.exports = {
  mapCatalogNomenclature,
  mapPrices,
  mapStocks
};
