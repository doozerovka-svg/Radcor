const fs = require('fs').promises;
const path = require('path');

let dbType = 'sqlite'; // 'sqlite' or 'json'
let sqliteDb = null;
const fallbackFile = path.join(__dirname, 'db_fallback.json');

// Default catalog seed data
const DEFAULT_PRODUCTS = [
  {
    sku: '151201',
    name: 'MOL Essence 5W-30',
    category: 'motor-oils',
    brand: 'MOL',
    sectors: 'van passenger',
    oems: 'mercedes volkswagen ford',
    fill_height: 85,
    fill_color: 'amber',
    badge_class: 'badge-mol',
    badge_text: 'Масла MOL',
    photo_url: 'https://www.mol.com/o/MOL_Public_Content/images/products/mol-essence-5w30.png',
    volumes: JSON.stringify([1, 4, 5, 20, 60, 208]),
    description: 'Высокотехнологичное синтетическое масло для современных легковых автомобилей и фургонов, снижающее трение и износ.',
    specs_json: JSON.stringify([
      { label: 'Вязкость', value: '5W-30' },
      { label: 'Допуски', value: 'API SL/CF, ACEA A5/B5, Ford WSS-M2C913-D' }
    ]),
    pack_desc: 'Канистра 4л / Бочка 205л',
    canister_vol: 4.0,
    canister_price: 780.0,
    barrel_vol: 205.0,
    barrel_price: 28000.0,
    gauge_markings: '4L,3L,2L,1L'
  },
  {
    sku: '151205',
    name: 'MOL Dynamic Transit 10W-40',
    category: 'motor-oils',
    brand: 'MOL',
    sectors: 'van truck',
    oems: 'mercedes renault',
    fill_height: 70,
    fill_color: 'amber',
    badge_class: 'badge-mol',
    badge_text: 'Масла MOL',
    photo_url: 'https://www.mol.com/o/MOL_Public_Content/images/products/mol-dynamic-transit-10w40.png',
    volumes: JSON.stringify([4, 5, 20, 60, 208]),
    description: 'Полусинтетическое масло для высоконагруженных дизельных двигателей коммерческого автотранспорта и фургонов.',
    specs_json: JSON.stringify([
      { label: 'Вязкость', value: '10W-40' },
      { label: 'Допуски', value: 'API CI-4/SL, MB 228.3, MAN M 3275, Volvo VDS-3' }
    ]),
    pack_desc: 'Канистра 4л / Бочка 205л',
    canister_vol: 4.0,
    canister_price: 640.0,
    barrel_vol: 205.0,
    barrel_price: 22000.0,
    gauge_markings: '4L,3L,2L,1L'
  },
  {
    sku: '240502',
    name: 'Felix Carbox G12+',
    category: 'coolants',
    brand: 'Felix',
    sectors: 'van passenger truck',
    oems: 'mercedes volkswagen ford citroen peugeot renault',
    fill_height: 60,
    fill_color: 'violet',
    badge_class: 'badge-violet',
    badge_text: 'Антифризы',
    photo_url: 'https://felix-auto.ru/upload/iblock/felix-carbox-g12plus-5kg.png',
    volumes: JSON.stringify([1, 5, 10, 20, 220]),
    description: 'Профессиональный карбоксилатный антифриз нового поколения с увеличенным ресурсом эксплуатации.',
    specs_json: JSON.stringify([
      { label: 'Класс', value: 'G12+' },
      { label: 'Цвет', value: 'Красный/Фиолетовый' },
      { label: 't замерзания', value: '-40 °C' }
    ]),
    pack_desc: 'Канистра 5кг / Бочка 220кг',
    canister_vol: 5.0,
    canister_price: 220.0,
    barrel_vol: 220.0,
    barrel_price: 7500.0,
    gauge_markings: '5L,4L,3L,2L,1L'
  },
  {
    sku: '180701',
    name: 'Prista Ultra 10W-40',
    category: 'motor-oils',
    brand: 'Prista',
    sectors: 'passenger van',
    oems: 'volkswagen ford renault',
    fill_height: 80,
    fill_color: 'amber',
    badge_class: '',
    badge_text: 'Масла',
    photo_url: 'https://www.prista-oil.com/images/products/prista-ultra-10w40-4l.png',
    volumes: JSON.stringify([1, 4, 5, 20, 60, 208]),
    description: 'Универсальное полусинтетическое моторное масло для смешанных автопарков и коммерческого автотранспорта.',
    specs_json: JSON.stringify([
      { label: 'Вязкость', value: '10W-40' },
      { label: 'Допуски', value: 'API SN/CF, ACEA A3/B4, MB 229.3' }
    ]),
    pack_desc: 'Канистра 4л / Бочка 205л',
    canister_vol: 4.0,
    canister_price: 420.0,
    barrel_vol: 205.0,
    barrel_price: 15000.0,
    gauge_markings: '4L,3L,2L,1L'
  },
  {
    sku: '240901',
    name: 'Felix DOT-4',
    category: 'autochemistry',
    brand: 'Felix',
    sectors: 'passenger van truck',
    oems: 'mercedes volkswagen ford citroen peugeot renault',
    fill_height: 50,
    fill_color: 'violet',
    badge_class: 'badge-violet',
    badge_text: 'Тормозные жидкости',
    photo_url: 'https://felix-auto.ru/upload/iblock/felix-dot4-0.5l.png',
    volumes: JSON.stringify([0.25, 0.5, 1]),
    description: 'Синтетическая жидкость для гидравлических приводов сцепления и тормозов легковой техники.',
    specs_json: JSON.stringify([
      { label: 'Стандарт', value: 'FMVSS №116 DOT 4' },
      { label: 't кипения', value: '> 230 °C' }
    ]),
    pack_desc: 'Флакон 0.5л / 1л',
    canister_vol: 1.0,
    canister_price: 95.0,
    barrel_vol: 200.0,
    barrel_price: 12000.0,
    gauge_markings: '1L,0.8L,0.6L,0.4L,0.2L'
  },
  {
    sku: '520101',
    name: 'Hepu Antifreeze G11',
    category: 'coolants',
    brand: 'Hepu',
    sectors: 'passenger van truck',
    oems: 'volkswagen audi skoda',
    fill_height: 65,
    fill_color: 'blue',
    badge_class: 'badge-blue',
    badge_text: 'Антифризы',
    photo_url: 'https://www.hepu.de/wp-content/uploads/hepu-antifreeze-g11-5l.jpg',
    volumes: JSON.stringify([1, 5, 10, 25]),
    description: 'Классический антифриз класса G11 на основе этиленгликоля с силикатными присадками. Совместим с большинством европейских автомобилей.',
    specs_json: JSON.stringify([
      { label: 'Класс', value: 'G11 / OAT' },
      { label: 'Цвет', value: 'Зеленый' },
      { label: 't замерзания', value: '-38 °C' }
    ]),
    pack_desc: 'Канистра 5л / 25л',
    canister_vol: 5.0,
    canister_price: 195.0,
    barrel_vol: 25.0,
    barrel_price: 900.0,
    gauge_markings: '5L,4L,3L,2L,1L'
  },
  {
    sku: '520201',
    name: 'Mol Dynamic Antifreeze G12++',
    category: 'coolants',
    brand: 'Mol Dynamic',
    sectors: 'passenger van truck',
    oems: 'mercedes bmw renault ford',
    fill_height: 72,
    fill_color: 'violet',
    badge_class: 'badge-violet',
    badge_text: 'Антифризы',
    photo_url: 'https://molddinamic.md/images/products/mol-dynamic-antifreeze-10l.jpg',
    volumes: JSON.stringify([5, 10, 20, 60]),
    description: 'Органический антифриз G12++ нового поколения без силикатов и нитратов. Срок службы до 5 лет или 250 000 км.',
    specs_json: JSON.stringify([
      { label: 'Класс', value: 'G12++ / HOAT' },
      { label: 'Цвет', value: 'Красный' },
      { label: 'Ресурс', value: '5 лет / 250 000 км' }
    ]),
    pack_desc: 'Канистра 10л / Бочка 60л',
    canister_vol: 10.0,
    canister_price: 380.0,
    barrel_vol: 60.0,
    barrel_price: 2100.0,
    gauge_markings: '10L,8L,6L,4L,2L'
  },
  {
    sku: '151301',
    name: 'Valvoline MaxLife 5W-40',
    category: 'motor-oils',
    brand: 'Valvoline',
    sectors: 'passenger van',
    oems: 'volkswagen mercedes bmw',
    fill_height: 75,
    fill_color: 'amber',
    badge_class: '',
    badge_text: 'Масла',
    photo_url: 'https://www.valvoline.com/o/Valvoline_Public/images/products/valvoline-maxlife-5w40-4l.png',
    volumes: JSON.stringify([1, 4, 5, 20, 60, 208]),
    description: 'Полностью синтетическое масло MaxLife с улучшенной защитой двигателей с высоким пробегом. Снижает потребление масла на 40%.',
    specs_json: JSON.stringify([
      { label: 'Вязкость', value: '5W-40' },
      { label: 'Допуски', value: 'API SN/CF, ACEA A3/B4' },
      { label: 'Применение', value: 'Высокий пробег' }
    ]),
    pack_desc: 'Канистра 4л / Бочка 208л',
    canister_vol: 4.0,
    canister_price: 860.0,
    barrel_vol: 208.0,
    barrel_price: 30000.0,
    gauge_markings: '4L,3L,2L,1L'
  },
  {
    sku: '151401',
    name: 'Wolf Official Tech 5W-30',
    category: 'motor-oils',
    brand: 'Wolf',
    sectors: 'passenger van',
    oems: 'volkswagen ford peugeot citroen',
    fill_height: 78,
    fill_color: 'amber',
    badge_class: '',
    badge_text: 'Масла',
    photo_url: 'https://www.wolf-lubricants.com/wp-content/uploads/wolf-official-tech-5w30-4l.jpg',
    volumes: JSON.stringify([1, 4, 5, 20, 60, 208]),
    description: 'Полностью синтетическое масло Wolf Official Tech для современных бензиновых и дизельных двигателей. Официально рекомендовано рядом производителей.',
    specs_json: JSON.stringify([
      { label: 'Вязкость', value: '5W-30' },
      { label: 'Допуски', value: 'ACEA C3, API SN, VW 502.00/505.01' }
    ]),
    pack_desc: 'Канистра 4л / Бочка 208л',
    canister_vol: 4.0,
    canister_price: 720.0,
    barrel_vol: 208.0,
    barrel_price: 26000.0,
    gauge_markings: '4L,3L,2L,1L'
  },
  {
    sku: '520301',
    name: 'Sakura Antifreeze G12',
    category: 'coolants',
    brand: 'Sakura',
    sectors: 'passenger van',
    oems: 'toyota honda nissan',
    fill_height: 55,
    fill_color: 'violet',
    badge_class: '',
    badge_text: 'Антифризы',
    photo_url: 'https://sakura.md/images/products/sakura-antifreeze-g12-4l.jpg',
    volumes: JSON.stringify([1, 4, 5, 20]),
    description: 'Карбоксилатный антифриз класса G12 для японских и корейских автомобилей. Защищает систему охлаждения от коррозии до 3 лет.',
    specs_json: JSON.stringify([
      { label: 'Класс', value: 'G12 / CARBOXYLATE' },
      { label: 'Цвет', value: 'Красный' },
      { label: 't замерзания', value: '-36 °C' }
    ]),
    pack_desc: 'Канистра 4л / 20л',
    canister_vol: 4.0,
    canister_price: 180.0,
    barrel_vol: 20.0,
    barrel_price: 800.0,
    gauge_markings: '4L,3L,2L,1L'
  },
  {
    sku: '610101',
    name: 'AdBlue 10L',
    category: 'autochemistry',
    brand: 'AdBlue',
    sectors: 'truck van',
    oems: 'mercedes volkswagen renault man volvo',
    fill_height: 60,
    fill_color: 'blue',
    badge_class: 'badge-blue',
    badge_text: 'Автохимия',
    photo_url: '',
    volumes: JSON.stringify([5, 10, 20, 1000]),
    description: 'Водный раствор мочевины (32.5%) для систем SCR дизельных двигателей Euro 5/6. Снижает выбросы NOx на 80%. Соответствует ISO 22241.',
    specs_json: JSON.stringify([
      { label: 'Концентрация', value: '32.5% мочевины' },
      { label: 'Стандарт', value: 'ISO 22241-1' },
      { label: 'Евро', value: 'Euro 5 / Euro 6' }
    ]),
    pack_desc: 'Канистра 10л / IBC 1000л',
    canister_vol: 10.0,
    canister_price: 140.0,
    barrel_vol: 1000.0,
    barrel_price: 9500.0,
    gauge_markings: '10L,8L,6L,4L,2L'
  },
  {
    sku: '710101',
    name: 'Felix Стеклоомыватель зимний -20°C',
    category: 'winter',
    brand: 'Felix',
    sectors: 'passenger van truck',
    oems: '',
    fill_height: 50,
    fill_color: 'blue',
    badge_class: 'badge-blue',
    badge_text: 'Зимняя программа',
    photo_url: 'https://felix-auto.ru/upload/iblock/felix-winter-washer-4l.png',
    volumes: JSON.stringify([1, 2, 3, 4, 5]),
    description: 'Высококонцентрированная незамерзающая жидкость для стеклоомывателей. Эффективно очищает стекло при температурах до -20°C. Не оставляет разводов.',
    specs_json: JSON.stringify([
      { label: 'Температура', value: 'до -20 °C' },
      { label: 'Состав', value: 'Изопропанол + ПАВ' }
    ]),
    pack_desc: 'Канистра 4л / 5л',
    canister_vol: 4.0,
    canister_price: 85.0,
    barrel_vol: 20.0,
    barrel_price: 380.0,
    gauge_markings: '4L,3L,2L,1L'
  },
  {
    sku: '810101',
    name: 'Mahle Ароматизатор Lemon',
    category: 'accessories',
    brand: 'Mahle',
    sectors: 'passenger van',
    oems: '',
    fill_height: 30,
    fill_color: 'blue',
    badge_class: '',
    badge_text: 'Аксессуары',
    photo_url: 'https://www.mahle-aftermarket.com/media/products/mahle-air-freshener-lemon.jpg',
    volumes: JSON.stringify([]),
    description: 'Профессиональный автомобильный ароматизатор Mahle с длительным действием до 45 дней. Нейтрализует неприятные запахи.',
    specs_json: JSON.stringify([
      { label: 'Аромат', value: 'Лимон' },
      { label: 'Действие', value: 'до 45 дней' }
    ]),
    pack_desc: 'Флакон 3мл',
    canister_vol: 0.003,
    canister_price: 45.0,
    barrel_vol: 0,
    barrel_price: 0,
    gauge_markings: ''
  }
];

// Initialize database
async function initDb() {
  try {
    const sqlite3 = require('sqlite3').verbose();
    const dbPath = path.join(__dirname, 'radcor.db');
    
    // Check/create directory if needed
    await fs.mkdir(path.dirname(dbPath), { recursive: true });
    
    sqliteDb = new sqlite3.Database(dbPath);
    
    // Helper to run query as Promise
    const runQuery = (sql) => new Promise((resolve, reject) => {
      sqliteDb.run(sql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Create products table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS products (
        sku TEXT PRIMARY KEY,
        name TEXT,
        category TEXT,
        brand TEXT,
        sectors TEXT,
        oems TEXT,
        fill_height INTEGER,
        fill_color TEXT,
        badge_class TEXT,
        badge_text TEXT,
        photo_url TEXT,
        volumes TEXT,
        description TEXT,
        specs_json TEXT,
        pack_desc TEXT,
        canister_vol REAL,
        canister_price REAL,
        barrel_vol REAL,
        barrel_price REAL,
        gauge_markings TEXT
      )
    `);

    // Migrate: add new columns if they don't exist (for existing DBs)
    const migrateColumn = async (col, type) => {
      try { await runQuery(`ALTER TABLE products ADD COLUMN ${col} ${type}`); } catch(e) { /* already exists */ }
    };
    await migrateColumn('photo_url', 'TEXT');
    await migrateColumn('volumes', 'TEXT');

    // Create orders table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_name TEXT,
        contact_person TEXT,
        email TEXT,
        phone TEXT,
        payment_method TEXT,
        delivery_method TEXT,
        total_price REAL,
        total_volume REAL,
        total_weight REAL,
        status TEXT,
        created_at TEXT
      )
    `);
    
    // Create order_items table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER,
        product_id TEXT,
        product_name TEXT,
        quantity INTEGER,
        price REAL,
        FOREIGN KEY(order_id) REFERENCES orders(id)
      )
    `);
    
    // Create partners table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS partners (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_name TEXT,
        contact_person TEXT,
        email TEXT,
        phone TEXT,
        activity_type TEXT,
        city TEXT,
        comments TEXT,
        status TEXT,
        created_at TEXT
      )
    `);
    
    // Seed default products if empty
    await seedDefaultProducts();

    console.log('Database initialized successfully using SQLite3');
    dbType = 'sqlite';
  } catch (error) {
    console.warn('SQLite3 initialization failed. Falling back to JSON file storage.', error.message);
    dbType = 'json';
    await initJsonDb();
  }
}

async function seedDefaultProducts() {
  return new Promise((resolve, reject) => {
    sqliteDb.get('SELECT COUNT(*) as count FROM products', async (err, row) => {
      if (err) return reject(err);
      
      if (row.count === 0) {
        console.log('Seeding default products catalog in SQLite3...');
        const stmt = sqliteDb.prepare(`
          INSERT INTO products (
            sku, name, category, brand, sectors, oems, 
            fill_height, fill_color, badge_class, badge_text, 
            photo_url, volumes,
            description, specs_json, pack_desc, 
            canister_vol, canister_price, barrel_vol, barrel_price, gauge_markings
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const p of DEFAULT_PRODUCTS) {
          stmt.run(
            p.sku, p.name, p.category, p.brand, p.sectors, p.oems,
            p.fill_height, p.fill_color, p.badge_class, p.badge_text,
            p.photo_url || '', p.volumes || '[]',
            p.description, p.specs_json, p.pack_desc,
            p.canister_vol, p.canister_price, p.barrel_vol, p.barrel_price, p.gauge_markings
          );
        }
        stmt.finalize((finalizeErr) => {
          if (finalizeErr) reject(finalizeErr);
          else resolve();
        });
      } else {
        resolve();
      }
    });
  });
}

async function initJsonDb() {
  try {
    await fs.access(fallbackFile);
    // Ensure products exist in JSON fallback
    const data = await readJsonDb();
    if (!data.products || data.products.length === 0) {
      data.products = DEFAULT_PRODUCTS;
      await writeJsonDb(data);
      console.log('Seeded default products into JSON fallback database.');
    }
  } catch (e) {
    const initialData = {
      products: DEFAULT_PRODUCTS,
      orders: [],
      order_items: [],
      partners: []
    };
    await fs.writeFile(fallbackFile, JSON.stringify(initialData, null, 2), 'utf8');
    console.log('Initialized fallback JSON database at', fallbackFile);
  }
}

async function readJsonDb() {
  try {
    const data = await fs.readFile(fallbackFile, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return { products: DEFAULT_PRODUCTS, orders: [], order_items: [], partners: [] };
  }
}

async function writeJsonDb(data) {
  await fs.writeFile(fallbackFile, JSON.stringify(data, null, 2), 'utf8');
}

// Get all products
async function getProductsList() {
  if (dbType === 'sqlite') {
    return new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM products', (err, rows) => {
        if (err) return reject(err);
        // Parse specs_json and volumes back into objects for api
        const parsedRows = rows.map(r => ({
          ...r,
          specs: r.specs_json ? JSON.parse(r.specs_json) : [],
          volumes: r.volumes ? JSON.parse(r.volumes) : []
        }));
        resolve(parsedRows);
      });
    });
  } else {
    const data = await readJsonDb();
    return data.products.map(p => ({
      ...p,
      specs: p.specs_json ? JSON.parse(p.specs_json) : [],
      volumes: p.volumes ? (typeof p.volumes === 'string' ? JSON.parse(p.volumes) : p.volumes) : []
    }));
  }
}

// Get single product by SKU
async function getProductBySku(sku) {
  if (dbType === 'sqlite') {
    return new Promise((resolve, reject) => {
      sqliteDb.get('SELECT * FROM products WHERE sku = ?', [sku], (err, row) => {
        if (err) return reject(err);
        if (!row) return resolve(null);
        resolve({
          ...row,
          specs: row.specs_json ? JSON.parse(row.specs_json) : []
        });
      });
    });
  } else {
    const data = await readJsonDb();
    const product = data.products.find(p => p.sku === sku);
    if (!product) return null;
    return {
      ...product,
      specs: product.specs_json ? JSON.parse(product.specs_json) : []
    };
  }
}

// Save or Update Product (Upsert)
async function saveProduct(p) {
  if (dbType === 'sqlite') {
    return new Promise((resolve, reject) => {
      const stmt = sqliteDb.prepare(`
        INSERT INTO products (
          sku, name, category, brand, sectors, oems, 
          fill_height, fill_color, badge_class, badge_text, 
          photo_url, volumes,
          description, specs_json, pack_desc, 
          canister_vol, canister_price, barrel_vol, barrel_price, gauge_markings
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(sku) DO UPDATE SET
          name=excluded.name,
          category=excluded.category,
          brand=excluded.brand,
          sectors=excluded.sectors,
          oems=excluded.oems,
          fill_height=excluded.fill_height,
          fill_color=excluded.fill_color,
          badge_class=excluded.badge_class,
          badge_text=excluded.badge_text,
          photo_url=excluded.photo_url,
          volumes=excluded.volumes,
          description=excluded.description,
          specs_json=excluded.specs_json,
          pack_desc=excluded.pack_desc,
          canister_vol=excluded.canister_vol,
          canister_price=excluded.canister_price,
          barrel_vol=excluded.barrel_vol,
          barrel_price=excluded.barrel_price,
          gauge_markings=excluded.gauge_markings
      `);
      
      const specsJson = typeof p.specs === 'object' ? JSON.stringify(p.specs) : (p.specs_json || '[]');
      const volumesJson = Array.isArray(p.volumes) ? JSON.stringify(p.volumes) : (p.volumes || '[]');

      stmt.run(
        p.sku, p.name, p.category, p.brand, p.sectors, p.oems,
        parseInt(p.fill_height) || 50, p.fill_color || 'amber', p.badge_class || '', p.badge_text || '',
        p.photo_url || '', volumesJson,
        p.description || '', specsJson, p.pack_desc || '',
        parseFloat(p.canister_vol) || 0, parseFloat(p.canister_price) || 0,
        parseFloat(p.barrel_vol) || 0, parseFloat(p.barrel_price) || 0,
        p.gauge_markings || '4L,3L,2L,1L',
        function(err) {
          if (err) return reject(err);
          resolve({
            ...p,
            specs: JSON.parse(specsJson),
            volumes: JSON.parse(volumesJson)
          });
        }
      );
      stmt.finalize();
    });
  } else {
    const data = await readJsonDb();
    const specsJson = typeof p.specs === 'object' ? JSON.stringify(p.specs) : (p.specs_json || '[]');
    const volumesJson = Array.isArray(p.volumes) ? JSON.stringify(p.volumes) : (p.volumes || '[]');
    const newProduct = {
      sku: p.sku,
      name: p.name,
      category: p.category,
      brand: p.brand,
      sectors: p.sectors,
      oems: p.oems,
      fill_height: parseInt(p.fill_height) || 50,
      fill_color: p.fill_color || 'amber',
      badge_class: p.badge_class || '',
      badge_text: p.badge_text || '',
      photo_url: p.photo_url || '',
      volumes: volumesJson,
      description: p.description || '',
      specs_json: specsJson,
      pack_desc: p.pack_desc || '',
      canister_vol: parseFloat(p.canister_vol) || 0,
      canister_price: parseFloat(p.canister_price) || 0,
      barrel_vol: parseFloat(p.barrel_vol) || 0,
      barrel_price: parseFloat(p.barrel_price) || 0,
      gauge_markings: p.gauge_markings || '4L,3L,2L,1L'
    };

    const index = data.products.findIndex(prod => prod.sku === p.sku);
    if (index !== -1) {
      data.products[index] = newProduct;
    } else {
      data.products.push(newProduct);
    }
    
    await writeJsonDb(data);
    return {
      ...newProduct,
      specs: JSON.parse(specsJson),
      volumes: JSON.parse(volumesJson)
    };
  }
}

// Delete Product
async function deleteProduct(sku) {
  if (dbType === 'sqlite') {
    return new Promise((resolve, reject) => {
      sqliteDb.run('DELETE FROM products WHERE sku = ?', [sku], function(err) {
        if (err) return reject(err);
        resolve({ success: this.changes > 0 });
      });
    });
  } else {
    const data = await readJsonDb();
    const initialLen = data.products.length;
    data.products = data.products.filter(p => p.sku !== sku);
    await writeJsonDb(data);
    return { success: data.products.length < initialLen };
  }
}

// Save order
async function saveOrder(order, items) {
  if (dbType === 'sqlite') {
    return new Promise((resolve, reject) => {
      sqliteDb.run(`
        INSERT INTO orders (
          company_name, contact_person, email, phone, 
          payment_method, delivery_method, total_price, 
          total_volume, total_weight, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        order.company_name,
        order.contact_person,
        order.email,
        order.phone,
        order.payment_method,
        order.delivery_method,
        order.total_price,
        order.total_volume,
        order.total_weight,
        order.status || 'Pending',
        order.created_at || new Date().toISOString()
      ], function(err) {
        if (err) return reject(err);
        
        const orderId = this.lastID;
        if (!items || items.length === 0) {
          return resolve({ id: orderId, ...order, items: [] });
        }
        
        let completed = 0;
        let insertedItems = [];
        let hasError = false;
        
        for (const item of items) {
          sqliteDb.run(`
            INSERT INTO order_items (
              order_id, product_id, product_name, quantity, price
            ) VALUES (?, ?, ?, ?, ?)
          `, [
            orderId,
            item.product_id,
            item.product_name,
            item.quantity,
            item.price
          ], function(itemErr) {
            if (itemErr) {
              hasError = true;
            } else {
              insertedItems.push({
                id: this.lastID,
                order_id: orderId,
                product_id: item.product_id,
                product_name: item.product_name,
                quantity: item.quantity,
                price: item.price
              });
            }
            completed++;
            if (completed === items.length) {
              if (hasError) {
                reject(new Error('Failed to insert some order items'));
              } else {
                resolve({
                  id: orderId,
                  ...order,
                  items: insertedItems
                });
              }
            }
          });
        }
      });
    });
  } else {
    // JSON Fallback
    const data = await readJsonDb();
    const orderId = data.orders.length > 0 ? Math.max(...data.orders.map(o => o.id)) + 1 : 1;
    
    const newOrder = {
      id: orderId,
      company_name: order.company_name,
      contact_person: order.contact_person,
      email: order.email,
      phone: order.phone,
      payment_method: order.payment_method,
      delivery_method: order.delivery_method,
      total_price: order.total_price,
      total_volume: order.total_volume,
      total_weight: order.total_weight,
      status: order.status || 'Pending',
      created_at: order.created_at || new Date().toISOString()
    };
    
    let itemIdCounter = data.order_items.length > 0 ? Math.max(...data.order_items.map(i => i.id)) + 1 : 1;
    const newItems = (items || []).map(item => ({
      id: itemIdCounter++,
      order_id: orderId,
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      price: item.price
    }));
    
    data.orders.push(newOrder);
    data.order_items.push(...newItems);
    
    await writeJsonDb(data);
    
    return {
      ...newOrder,
      items: newItems
    };
  }
}

// Get all orders
async function getOrdersList() {
  if (dbType === 'sqlite') {
    return new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM orders ORDER BY created_at DESC', (err, orders) => {
        if (err) return reject(err);
        
        sqliteDb.all('SELECT * FROM order_items', (itemErr, items) => {
          if (itemErr) return reject(itemErr);
          
          const ordersWithItems = orders.map(order => {
            return {
              ...order,
              items: items.filter(item => item.order_id === order.id)
            };
          });
          resolve(ordersWithItems);
        });
      });
    });
  } else {
    // JSON Fallback
    const data = await readJsonDb();
    const ordersWithItems = data.orders.map(order => {
      return {
        ...order,
        items: data.order_items.filter(item => item.order_id === order.id)
      };
    });
    return ordersWithItems.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
}

// Save partner application
async function savePartner(partner) {
  if (dbType === 'sqlite') {
    return new Promise((resolve, reject) => {
      const stmt = sqliteDb.prepare(`
        INSERT INTO partners (
          company_name, contact_person, email, phone,
          activity_type, city, comments, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const status = partner.status || 'New';
      const created_at = partner.created_at || new Date().toISOString();
      
      stmt.run(
        partner.company_name,
        partner.contact_person,
        partner.email,
        partner.phone,
        partner.activity_type,
        partner.city,
        partner.comments,
        status,
        created_at,
        function(err) {
          if (err) return reject(err);
          resolve({
            id: this.lastID,
            ...partner,
            status,
            created_at
          });
        }
      );
      stmt.finalize();
    });
  } else {
    // JSON Fallback
    const data = await readJsonDb();
    const partnerId = data.partners.length > 0 ? Math.max(...data.partners.map(p => p.id)) + 1 : 1;
    
    const newPartner = {
      id: partnerId,
      company_name: partner.company_name,
      contact_person: partner.contact_person,
      email: partner.email,
      phone: partner.phone,
      activity_type: partner.activity_type,
      city: partner.city,
      comments: partner.comments,
      status: partner.status || 'New',
      created_at: partner.created_at || new Date().toISOString()
    };
    
    data.partners.push(newPartner);
    await writeJsonDb(data);
    return newPartner;
  }
}

module.exports = {
  initDb,
  getProductsList,
  getProductBySku,
  saveProduct,
  deleteProduct,
  saveOrder,
  getOrdersList,
  savePartner,
  getDbType: () => dbType
};
