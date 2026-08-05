const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

db.initDb().catch(err => console.error('Failed to initialize database:', err));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.get('/api/v1/products', async (req, res) => {
  try { res.json({ success: true, data: await db.getProductsList() }); }
  catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

app.get('/api/v1/products/:sku', async (req, res) => {
  try {
    const product = await db.getProductBySku(req.params.sku);
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

app.post('/api/v1/products', async (req, res) => {
  try {
    if (!req.body.sku || !req.body.name) return res.status(400).json({ success: false, error: 'Product SKU and Name are required.' });
    res.json({ success: true, data: await db.saveProduct(req.body) });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

app.delete('/api/v1/products/:sku', async (req, res) => {
  try { res.json({ success: true, data: await db.deleteProduct(req.params.sku) }); }
  catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

async function calculateOrder(items) {
  if (!Array.isArray(items) || items.length === 0) throw new Error('Order must contain at least one item.');
  let total_price = 0, total_volume = 0, total_weight = 0;
  const processedItems = [];

  for (const item of items) {
    const sku = item.sku || item.product_id;
    const product = await db.getProductBySku(sku);
    if (!product) throw new Error(`Product with SKU ${sku} not found in database catalog.`);

    const packId = item.pack_id || item.packId || item.packType || 'canister';
    const pack = (product.packs || []).find(candidate => candidate.id === packId);
    if (!pack || Number(pack.volume_l) <= 0) throw new Error(`Pack ${packId} is not available for ${sku}.`);

    const quantity = Number.parseInt(item.quantity || item.qty, 10) || 1;
    if (quantity < (Number(pack.min_qty) || 1)) throw new Error(`Minimum quantity for ${sku} is ${pack.min_qty || 1}.`);
    if (pack.stock_status === 'out_of_stock' || product.stock_status === 'out_of_stock') throw new Error(`${product.name} is out of stock.`);

    const price = Number(pack.price_mdl);
    if (!Number.isFinite(price) || price <= 0) throw new Error(`Price for ${product.name} must be confirmed by a manager.`);

    const volume = Number(pack.volume_l);
    total_price += price * quantity;
    total_volume += volume * quantity;
    total_weight += volume * 0.9 * quantity;
    processedItems.push({ product_id: sku, product_name: product.name, quantity, price, pack_id: pack.id, volume_l: volume });
  }

  return { items: processedItems, total_price, total_volume: Number(total_volume.toFixed(2)), total_weight: Number(total_weight.toFixed(2)) };
}

app.post('/api/v1/orders/preview', async (req, res) => {
  try { res.json({ success: true, data: await calculateOrder(req.body.items) }); }
  catch (error) { res.status(400).json({ success: false, error: error.message }); }
});

app.post('/api/v1/orders', async (req, res) => {
  try {
    const { company_name, contact_person, phone, email = '', payment_method = 'invoice', delivery_method = 'pickup', delivery_city = '', delivery_address = '', comment = '' } = req.body;
    if (!company_name || !contact_person || !phone) return res.status(400).json({ success: false, error: 'Company, contact person and phone are required.' });
    if (delivery_method === 'delivery' && (!delivery_city || !delivery_address)) return res.status(400).json({ success: false, error: 'City and address are required for delivery.' });
    const calculated = await calculateOrder(req.body.items);
    const saved = await db.saveOrder({ ...calculated, company_name, contact_person, phone, email, payment_method, delivery_method, delivery_city, delivery_address, comment, status: 'Принят', created_at: new Date().toISOString() }, calculated.items);
    res.status(201).json({ success: true, data: { ...saved, orderNo: `№${80000 + saved.id}` } });
  } catch (error) { res.status(400).json({ success: false, error: error.message }); }
});

app.post('/api/v1/partners', async (req, res) => {
  try {
    const { company_name, contact_person, phone } = req.body;
    if (!company_name || !contact_person || !phone) return res.status(400).json({ success: false, error: 'Fields company_name, contact_person, and phone are required.' });
    res.status(201).json({ success: true, data: await db.savePartner({ ...req.body, status: 'New', created_at: new Date().toISOString() }) });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

app.get('/health', (req, res) => res.json({ status: 'healthy', dbType: db.getDbType(), timestamp: new Date().toISOString() }));

app.listen(PORT, () => console.log(`Radcor B2B Server running on port ${PORT}`));
