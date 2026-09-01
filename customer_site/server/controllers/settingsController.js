const fs = require('fs');
const path = require('path');

const settingsFilePath = path.join(__dirname, '../data/store_settings.json');

let storeSettings = {
  shopName: "SAHA MEN'S STORE",
  contactEmail: "support@sahamenswear.com",
  contactPhone: "+91 98765 43210",
  currency: "INR (₹)",
  deliveryCharge: 99
};

// Load saved settings from disk if available
try {
  if (fs.existsSync(settingsFilePath)) {
    const raw = fs.readFileSync(settingsFilePath, 'utf8');
    storeSettings = { ...storeSettings, ...JSON.parse(raw) };
  }
} catch (e) {
  console.warn('Failed to load store settings file:', e.message);
}

exports.getStoreSettings = (req, res) => {
  return res.json(storeSettings);
};

exports.updateStoreSettings = (req, res) => {
  try {
    const newSettings = req.body || {};
    storeSettings = { ...storeSettings, ...newSettings };

    // Persist to disk
    try {
      const dir = path.dirname(settingsFilePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(settingsFilePath, JSON.stringify(storeSettings, null, 2));
    } catch (e) {
      console.warn('Failed to save store settings file:', e.message);
    }

    // Broadcast real-time Socket.IO update to all connected customer & admin clients
    const io = req.app.get('io');
    if (io) {
      io.emit('settings:updated', storeSettings);
    }

    return res.json({ success: true, settings: storeSettings });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
