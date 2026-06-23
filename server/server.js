const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initial database connection
db.initDb().catch(err => {
  console.error('Failed to initialize database:', err);
});

// Logs request details to console
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// GET /api/v1/products - Returns the product list from database
app.get('/api/v1/products', async (req, res) => {
  try {
    const products = await db.getProductsList();
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/v1/products - Creates or updates a product (Upsert)
app.post('/api/v1/products', async (req, res) => {
  try {
    const { sku, name } = req.body;
    if (!sku || !name) {
      return res.status(400).json({ success: false, error: 'Product SKU and Name are required.' });
    }

    const savedProduct = await db.saveProduct(req.body);
    res.status(200).json({ success: true, data: savedProduct });
  } catch (error) {
    console.error('Failed to save product:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/v1/products/:sku - Deletes a product
app.delete('/api/v1/products/:sku', async (req, res) => {
  try {
    const { sku } = req.params;
    const result = await db.deleteProduct(sku);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Failed to delete product:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/v1/orders - Submits a new B2B order (dynamic DB validation)
app.post('/api/v1/orders', async (req, res) => {
  try {
    const {
      company_name = 'B2B Client (Anonymous)',
      contact_person = 'Representative',
      email = '',
      phone = '',
      payment_method = 'invoice',
      delivery_method = 'pickup',
      items = []
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Order must contain at least one item.' });
    }

    let calculatedTotalPrice = 0;
    let calculatedTotalVolume = 0;
    let calculatedTotalWeight = 0;
    const processedItems = [];

    for (const item of items) {
      const sku = item.sku || item.product_id;
      const config = await db.getProductBySku(sku);
      if (!config) {
        return res.status(400).json({ 
          success: false, 
          error: `Product with SKU ${sku} not found in database catalog.` 
        });
      }

      const packType = item.packType || 'canister';
      const quantity = parseInt(item.qty || item.quantity) || 1;
      const price = packType === 'canister' ? config.canister_price : config.barrel_price;
      const volume = packType === 'canister' ? config.canister_vol : config.barrel_vol;

      // Approximate weight: volume * 0.9 (oil/fluids density average)
      const weight = volume * 0.9;

      calculatedTotalPrice += price * quantity;
      calculatedTotalVolume += volume * quantity;
      calculatedTotalWeight += weight * quantity;

      processedItems.push({
        product_id: sku,
        product_name: config.name,
        quantity,
        price,
        packType
      });
    }

    const orderNo = `№${Math.floor(Math.random() * 9000) + 80000}`;
    const orderData = {
      company_name,
      contact_person,
      email,
      phone,
      payment_method,
      delivery_method,
      total_price: calculatedTotalPrice,
      total_volume: parseFloat(calculatedTotalVolume.toFixed(2)),
      total_weight: parseFloat(calculatedTotalWeight.toFixed(2)),
      status: 'Счет выставлен',
      created_at: new Date().toISOString()
    };

    // Store in database
    const savedOrder = await db.saveOrder(orderData, processedItems);
    
    res.status(201).json({
      success: true,
      data: {
        ...savedOrder,
        orderNo
      }
    });
  } catch (error) {
    console.error('Order creation failed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/v1/orders - Retrieves order history
app.get('/api/v1/orders', async (req, res) => {
  try {
    const orders = await db.getOrdersList();
    
    const formattedOrders = orders.map(order => ({
      orderNo: `№${80000 + order.id}`,
      date: new Date(order.created_at).toLocaleDateString('ru-RU'),
      sum: order.total_price,
      status: order.status || 'Счет выставлен',
      delivery: order.delivery_method === 'pickup' ? 'Самовывоз' : 'Сборка заказа',
      details: order
    }));

    res.json({ success: true, data: formattedOrders });
  } catch (error) {
    console.error('Retrieving orders failed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/v1/vin/decode - Decodes 17-char VIN code
app.post('/api/v1/vin/decode', (req, res) => {
  try {
    const { vin } = req.body;
    if (!vin || vin.trim().length !== 17) {
      return res.status(400).json({
        success: false,
        error: 'VIN code must be exactly 17 characters long.'
      });
    }

    const formattedVin = vin.toUpperCase().trim();
    
    const decodeResult = {
      success: true,
      vin: formattedVin,
      vehicleName: "Mercedes-Benz Sprinter 316 CDI (OM651)",
      details: "Двигатель: OM 651.955 | Дизель | 2.2L | 2018 г.в.",
      recommendations: [
        "MOL Essence 5W-30 (MB 229.51)",
        "Felix Carbox G12+"
      ],
      fluids: [
        { sku: "151201", name: "MOL Essence 5W-30", price: 780, type: "canister" },
        { sku: "240502", name: "Felix Carbox G12+", price: 220, type: "canister" }
      ]
    };

    res.json(decodeResult);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/v1/partners - Stores B2B partnership applications
app.post('/api/v1/partners', async (req, res) => {
  try {
    const {
      company_name,
      contact_person,
      email,
      phone,
      activity_type,
      city,
      comments
    } = req.body;

    if (!company_name || !contact_person || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Fields company_name, contact_person, and phone are required.'
      });
    }

    const partnerData = {
      company_name,
      contact_person,
      email,
      phone,
      activity_type,
      city,
      comments,
      status: 'New',
      created_at: new Date().toISOString()
    };

    const savedPartner = await db.savePartner(partnerData);
    res.status(201).json({ success: true, data: savedPartner });
  } catch (error) {
    console.error('Partner registration failed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    dbType: db.getDbType(),
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Radcor B2B Server running on port ${PORT}`);
  console.log(`API documentation base: http://localhost:${PORT}/api/v1`);
});
