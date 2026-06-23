const fs = require('fs').promises;
const path = require('path');

let dbType = 'sqlite'; // 'sqlite' or 'json'
let sqliteDb = null;
const fallbackFile = path.join(__dirname, 'db_fallback.json');

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
    
    console.log('Database initialized successfully using SQLite3');
    dbType = 'sqlite';
  } catch (error) {
    console.warn('SQLite3 initialization failed. Falling back to JSON file storage.', error.message);
    dbType = 'json';
    await initJsonDb();
  }
}

async function initJsonDb() {
  try {
    await fs.access(fallbackFile);
  } catch (e) {
    const initialData = {
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
    return { orders: [], order_items: [], partners: [] };
  }
}

async function writeJsonDb(data) {
  await fs.writeFile(fallbackFile, JSON.stringify(data, null, 2), 'utf8');
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
  saveOrder,
  getOrdersList,
  savePartner,
  getDbType: () => dbType
};
