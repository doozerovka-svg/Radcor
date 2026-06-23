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
    category: 'oils',
    brand: 'MOL',
    sectors: 'van passenger',
    oems: 'mercedes volkswagen ford',
    fill_height: 85,
    fill_color: 'amber',
    badge_class: 'badge-mol',
    badge_text: 'Масла MOL',
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
    category: 'oils',
    brand: 'MOL',
    sectors: 'van truck',
    oems: 'mercedes renault',
    fill_height: 70,
    fill_color: 'amber',
    badge_class: 'badge-mol',
    badge_text: 'Масла MOL',
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
    category: 'fluids',
    brand: 'Felix',
    sectors: 'van passenger truck',
    oems: 'mercedes volkswagen ford citroen peugeot renault',
    fill_height: 60,
    fill_color: 'violet',
    badge_class: 'badge-violet',
    badge_text: 'Жидкости',
    description: 'Профессиональный карбоксилатный антифриз нового поколения с увеличенным ресурсом эксплуатации.',
    specs_json: JSON.stringify([
      { label: 'Спецификация', value: 'G12+, ASTM D3306' },
      { label: 'Цвет', value: 'Красный/Фиолетовый' }
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
    name: 'Freshway G-11 10W-40',
    category: 'oils',
    brand: 'Freshway',
    sectors: 'passenger van',
    oems: 'volkswagen ford renault',
    fill_height: 80,
    fill_color: 'amber',
    badge_class: '',
    badge_text: 'Масла',
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
    category: 'fluids',
    brand: 'Felix',
    sectors: 'passenger van truck',
    oems: 'mercedes volkswagen ford citroen peugeot renault',
    fill_height: 50,
    fill_color: 'violet',
    badge_class: 'badge-violet',
    badge_text: 'Жидкости',
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
    sku: '350102',
    name: 'Freshway WD-400',
    category: 'chemicals',
    brand: 'Freshway',
    sectors: 'passenger van truck agro',
    oems: 'mercedes volkswagen ford citroen peugeot renault',
    fill_height: 45,
    fill_color: 'blue',
    badge_class: 'badge-blue',
    badge_text: 'Автохимия',
    description: 'Универсальный проникающий спрей для разблокировки соединений, защиты от коррозии и вытеснения влаги.',
    specs_json: JSON.stringify([
      { label: 'Объем спрея', value: '400 мл' },
      { label: 'Класс опасности', value: '4 класс' }
    ]),
    pack_desc: 'Спрей 0.4л / Коробка 24 шт',
    canister_vol: 0.4,
    canister_price: 65.0,
    barrel_vol: 9.6,
    barrel_price: 1200.0,
    gauge_markings: '0.5L,0.4L,0.3L,0.2L,0.1L'
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
            description, specs_json, pack_desc, 
            canister_vol, canister_price, barrel_vol, barrel_price, gauge_markings
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const p of DEFAULT_PRODUCTS) {
          stmt.run(
            p.sku, p.name, p.category, p.brand, p.sectors, p.oems,
            p.fill_height, p.fill_color, p.badge_class, p.badge_text,
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
        // Parse specs_json back into object for api
        const parsedRows = rows.map(r => ({
          ...r,
          specs: r.specs_json ? JSON.parse(r.specs_json) : []
        }));
        resolve(parsedRows);
      });
    });
  } else {
    const data = await readJsonDb();
    return data.products.map(p => ({
      ...p,
      specs: p.specs_json ? JSON.parse(p.specs_json) : []
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
          description, specs_json, pack_desc, 
          canister_vol, canister_price, barrel_vol, barrel_price, gauge_markings
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      
      stmt.run(
        p.sku, p.name, p.category, p.brand, p.sectors, p.oems,
        parseInt(p.fill_height) || 50, p.fill_color || 'amber', p.badge_class || '', p.badge_text || '',
        p.description || '', specsJson, p.pack_desc || '',
        parseFloat(p.canister_vol) || 0, parseFloat(p.canister_price) || 0,
        parseFloat(p.barrel_vol) || 0, parseFloat(p.barrel_price) || 0,
        p.gauge_markings || '4L,3L,2L,1L',
        function(err) {
          if (err) return reject(err);
          resolve({
            ...p,
            specs: JSON.parse(specsJson)
          });
        }
      );
      stmt.finalize();
    });
  } else {
    const data = await readJsonDb();
    const specsJson = typeof p.specs === 'object' ? JSON.stringify(p.specs) : (p.specs_json || '[]');
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
      specs: JSON.parse(specsJson)
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
