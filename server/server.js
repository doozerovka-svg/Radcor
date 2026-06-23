const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Hardcoded catalog configuration matching frontend
const PRODUCT_CONFIGS = {
  '151201': { canisterVol: 4, canisterPrice: 780, barrelVol: 205, barrelPrice: 28000, name: 'MOL Essence 5W-30' },
  '151205': { canisterVol: 4, canisterPrice: 640, barrelVol: 205, barrelPrice: 22000, name: 'MOL Dynamic Transit 10W-40' },
  '240502': { canisterVol: 5, canisterPrice: 220, barrelVol: 220, barrelPrice: 7500, name: 'Felix Carbox G12+' },
  '180701': { canisterVol: 4, canisterPrice: 420, barrelVol: 205, barrelPrice: 15000, name: 'Freshway G-11 10W-40' },
  '240901': { canisterVol: 1, canisterPrice: 95, barrelVol: 200, barrelPrice: 12000, name: 'Felix DOT-4' },
  '350102': { canisterVol: 0.4, canisterPrice: 65, barrelVol: 9.6, barrelPrice: 1200, name: 'Freshway WD-400' }
};

// Initial database connection
db.initDb().catch(err => {
  console.error('Failed to initialize database:', err);
});

// Logs request details to console
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// GET /api/v1/products - Returns the product list
app.get('/api/v1/products', (req, res) => {
  try {
    const products = Object.keys(PRODUCT_CONFIGS).map(sku => {
      const config = PRODUCT_CONFIGS[sku];
      return {
        sku,
        name: config.name,
        canisterPrice: config.canisterPrice,
        canisterVol: config.canisterVol,
        barrelPrice: config.barrelPrice,
        barrelVol: config.barrelVol
      };
    });
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/v1/orders - Submits a new B2B order
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

    const processedItems = items.map(item => {
      const config = PRODUCT_CONFIGS[item.sku || item.product_id];
      if (!config) {
        throw new Error(`Product with SKU ${item.sku || item.product_id} not found in catalog.`);
      }

      const packType = item.packType || 'canister';
      const quantity = parseInt(item.qty || item.quantity) || 1;
      const price = packType === 'canister' ? config.canisterPrice : config.barrelPrice;
      const volume = packType === 'canister' ? config.canisterVol : config.barrelVol;

      // Approximate weight: volume * 0.9 (oil/fluids density average)
      const weight = volume * 0.9;

      calculatedTotalPrice += price * quantity;
      calculatedTotalVolume += volume * quantity;
      calculatedTotalWeight += weight * quantity;

      return {
        product_id: item.sku || item.product_id,
        product_name: config.name,
        quantity,
        price,
        packType
      };
    });

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
    
    // Map database order columns to what the frontend expects
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

    // Mock decode based on VIN
    const formattedVin = vin.toUpperCase().trim();
    
    // Return standard Sprinter suggestions or a custom mock
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
