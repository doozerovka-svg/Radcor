// Generator of CommerceML 2.08 XML files from Radcor products dataset
const crypto = require('crypto');

function getDeterministicGuid(input) {
  const hash = crypto.createHash('md5').update(input).digest('hex');
  return `${hash.substr(0, 8)}-${hash.substr(8, 4)}-${hash.substr(12, 4)}-${hash.substr(16, 4)}-${hash.substr(20, 12)}`;
}

function escapeXml(unsafe) {
  if (unsafe === undefined || unsafe === null) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateImportXml(products) {
  const now = new Date().toISOString().split('T')[0];
  const catalogGuid = getDeterministicGuid('radcor-catalog');
  const classifierGuid = getDeterministicGuid('radcor-classifier');

  // Collect unique categories
  const categories = {};
  products.forEach(p => {
    if (p.category && !categories[p.category]) {
      categories[p.category] = {
        id: getDeterministicGuid(`cat-${p.category}`),
        name: p.category
      };
    }
  });

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<КоммерческаяИнформация ВерсияСхемы="2.08" ДатаФормирования="${now}">
  <Классификатор>
    <Ид>${classifierGuid}</Ид>
    <Наименование>Классификатор товаров Radcor B2B</Наименование>
    <Владелец>
      <Ид>${getDeterministicGuid('radcor-owner')}</Ид>
      <Наименование>Radcor Prim SRL</Наименование>
      <ОфициальноеНаименование>Radcor Prim S.R.L.</ОфициальноеНаименование>
      <ИНН>1003600012345</ИНН>
    </Владелец>
    <Группы>
`;

  for (const [key, cat] of Object.entries(categories)) {
    xml += `      <Группа>
        <Ид>${cat.id}</Ид>
        <Наименование>${escapeXml(cat.name)}</Наименование>
      </Группа>\n`;
  }

  xml += `    </Группы>
  </Классификатор>
  <Каталог СодержитТолькоИзменения="false">
    <Ид>${catalogGuid}</Ид>
    <ИдКлассификатора>${classifierGuid}</ИдКлассификатора>
    <Наименование>Основной каталог товаров Radcor</Наименование>
    <Владелец>
      <Ид>${getDeterministicGuid('radcor-owner')}</Ид>
      <Наименование>Radcor Prim SRL</Наименование>
    </Владелец>
    <Товары>
`;

  products.forEach(product => {
    const productGuid = getDeterministicGuid(`product-${product.sku}`);
    const catGuid = product.category && categories[product.category] ? categories[product.category].id : '';

    xml += `      <Товар>
        <Ид>${productGuid}</Ид>
        <Артикул>${escapeXml(product.sku)}</Артикул>
        <Наименование>${escapeXml(product.name)}</Наименование>
        <БазоваяЕдиница Код="796" НаименованиеПолное="Штука" МеждународноеСокращение="PCE">шт</БазоваяЕдиница>
        ${catGuid ? `<Группы><Ид>${catGuid}</Ид></Группы>` : ''}
        <Описание>${escapeXml(product.description || '')}</Описание>
        <Изготовитель>
          <Наименование>${escapeXml(product.brand || 'MOL')}</Наименование>
        </Изготовитель>
        <ЗначенияСвойств>
`;

    if (Array.isArray(product.specs)) {
      product.specs.forEach(spec => {
        xml += `          <ЗначенияСвойства>
            <Ид>${getDeterministicGuid(`prop-${spec.label}`)}</Ид>
            <Наименование>${escapeXml(spec.label)}</Наименование>
            <Значение>${escapeXml(spec.value)}</Значение>
          </ЗначенияСвойства>\n`;
      });
    }

    xml += `        </ЗначенияСвойств>
      </Товар>\n`;
  });

  xml += `    </Товары>
  </Каталог>
</КоммерческаяИнформация>`;

  return xml;
}

function generateOffersXml(products) {
  const now = new Date().toISOString().split('T')[0];
  const packageGuid = getDeterministicGuid('radcor-offers');
  const priceTypeGuid = getDeterministicGuid('price-b2b-mdl');

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<КоммерческаяИнформация ВерсияСхемы="2.08" ДатаФормирования="${now}">
  <ПакетПредложений СодержитТолькоИзменения="false">
    <Ид>${packageGuid}</Ид>
    <Наименование>Пакет предложений Radcor (Цены и остатки)</Наименование>
    <ТипыЦен>
      <ТипЦены>
        <Ид>${priceTypeGuid}</Ид>
        <Наименование>B2B Оптовая цена (MDL)</Наименование>
        <Валюта>MDL</Валюта>
        <Налог>
          <Наименование>НДС</Наименование>
          <УчтеноВСумме>true</УчтеноВСумме>
        </Налог>
      </ТипЦены>
    </ТипыЦен>
    <Предложения>
`;

  products.forEach(product => {
    const productGuid = getDeterministicGuid(`product-${product.sku}`);

    if (Array.isArray(product.packs) && product.packs.length > 0) {
      product.packs.forEach(pack => {
        const offerGuid = `${productGuid}#${getDeterministicGuid(`pack-${pack.id}`)}`;
        const price = Number(pack.price_mdl) || Number(product.canister_price) || 0;
        const stockQty = product.price_on_request ? 0 : 50;

        xml += `      <Предложение>
        <Ид>${offerGuid}</Ид>
        <Артикул>${escapeXml(product.sku)}</Артикул>
        <Наименование>${escapeXml(product.name)} (${escapeXml(pack.label || `${pack.volume_l} л`)})</Наименование>
        <БазоваяЕдиница Код="796">шт</БазоваяЕдиница>
        <Цены>
          <Цена>
            <ИдТипаЦены>${priceTypeGuid}</ИдТипаЦены>
            <ЦенаЗаЕдиницу>${price.toFixed(2)}</ЦенаЗаЕдиницу>
            <Валюта>MDL</Валюта>
            <Единица>шт</Единица>
            <Коэффициент>1</Коэффициент>
          </Цена>
        </Цены>
        <Количество>${stockQty}</Количество>
      </Предложение>\n`;
      });
    } else {
      const price = Number(product.canister_price) || 0;
      xml += `      <Предложение>
        <Ид>${productGuid}</Ид>
        <Артикул>${escapeXml(product.sku)}</Артикул>
        <Наименование>${escapeXml(product.name)}</Наименование>
        <БазоваяЕдиница Код="796">шт</БазоваяЕдиница>
        <Цены>
          <Цена>
            <ИдТипаЦены>${priceTypeGuid}</ИдТипаЦены>
            <ЦенаЗаЕдиницу>${price.toFixed(2)}</ЦенаЗаЕдиницу>
            <Валюта>MDL</Валюта>
            <Единица>шт</Единица>
            <Коэффициент>1</Коэффициент>
          </Цена>
        </Цены>
        <Количество>100</Количество>
      </Предложение>\n`;
    }
  });

  xml += `    </Предложения>
  </ПакетПредложений>
</КоммерческаяИнформация>`;

  return xml;
}

module.exports = {
  getDeterministicGuid,
  generateImportXml,
  generateOffersXml
};
